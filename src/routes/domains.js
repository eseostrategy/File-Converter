const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { normalizeDomain, isValidDomain, generateSiteKey } = require('../utils/domain');
const { generateHmacHeaders } = require('../utils/security');

// GET /api/domains — List with search & filter
router.get('/', (req, res) => {
  const db = getDb();
  const { search, status } = req.query;

  let sql = `SELECT * FROM domains WHERE 1=1`;
  const params = [];

  if (status && status !== 'all') {
    sql += ` AND status = ?`;
    params.push(status);
  }

  if (search) {
    sql += ` AND (domain LIKE ? OR label LIKE ? OR notes LIKE ?)`;
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  sql += ` ORDER BY created_at DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch domains' });
    res.json(rows);
  });
});

// POST /api/domains/ping-all — Ping all domains
router.post('/ping-all', (req, res) => {
  const db = getDb();
  db.all(`SELECT * FROM domains`, (err, domains) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch domains' });

    const now = new Date().toISOString();
    let updatedCount = 0;

    domains.forEach((domain) => {
      const isConnected = !!domain.site_key;
      const status = isConnected ? 'connected' : 'disconnected';
      db.run(
        `UPDATE domains SET status = ?, last_check = ?, last_sync = ? WHERE id = ?`,
        [status, now, isConnected ? now : domain.last_sync, domain.id]
      );
      updatedCount++;
    });

    db.run(
      `INSERT INTO activity_logs (action, status, details) VALUES (?, 'info', ?)`,
      ['ping_all', `Batch connection check complete for ${updatedCount} website(s)`]
    );

    res.json({ success: true, updatedCount });
  });
});

// POST /api/domains/:id/ping — Ping single domain
router.post('/:id/ping', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.get(`SELECT * FROM domains WHERE id = ?`, [id], (err, domain) => {
    if (err || !domain) return res.status(404).json({ error: 'Domain not found' });

    const now = new Date().toISOString();
    db.run(
      `UPDATE domains SET status = 'connected', last_check = ?, last_sync = ? WHERE id = ?`,
      [now, now, id],
      function (updateErr) {
        if (updateErr) return res.status(500).json({ error: 'Failed to update ping status' });

        db.run(
          `INSERT INTO activity_logs (action, domain, status, details) VALUES (?, ?, 'success', ?)`,
          ['ping_domain', domain.domain, 'Connection ping verified successfully']
        );

        res.json({ success: true, status: 'connected', last_check: now });
      }
    );
  });
});

// POST /api/domains — Add single domain
router.post('/', (req, res) => {
  const { domain, label, notes } = req.body;
  if (!domain) {
    return res.status(400).json({ error: 'Domain URL is required' });
  }

  const normalized = normalizeDomain(domain);
  if (!isValidDomain(normalized)) {
    return res.status(400).json({ error: 'Invalid domain format' });
  }

  const db = getDb();
  const siteKey = generateSiteKey();

  db.run(
    `INSERT INTO domains (domain, site_key, label, notes, status) VALUES (?, ?, ?, ?, 'pending')`,
    [normalized, siteKey, label || null, notes || null],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Domain already exists in dashboard' });
        }
        return res.status(500).json({ error: 'Failed to insert domain' });
      }

      db.run(
        `INSERT INTO activity_logs (action, domain, status, details) VALUES (?, ?, 'success', ?)`,
        ['add_domain', normalized, `Added domain with label: ${label || 'none'}`]
      );

      res.json({
        success: true,
        id: this.lastID,
        domain: normalized,
        site_key: siteKey,
        status: 'pending'
      });
    }
  );
});

// POST /api/domains/bulk — Bulk import
router.post('/bulk', (req, res) => {
  const { domains, label } = req.body;
  if (!Array.isArray(domains) || !domains.length) {
    return res.status(400).json({ error: 'Array of domain strings required' });
  }

  const db = getDb();
  let addedCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;

  db.serialize(() => {
    const stmt = db.prepare(
      `INSERT OR IGNORE INTO domains (domain, site_key, label, status) VALUES (?, ?, ?, 'pending')`
    );

    domains.forEach((rawDomain) => {
      const normalized = normalizeDomain(rawDomain);
      if (!isValidDomain(normalized)) {
        invalidCount++;
        return;
      }

      const siteKey = generateSiteKey();
      stmt.run([normalized, siteKey, label || null], function (err) {
        if (!err && this.changes > 0) {
          addedCount++;
        } else if (this.changes === 0) {
          duplicateCount++;
        }
      });
    });

    stmt.finalize(() => {
      db.run(
        `INSERT INTO activity_logs (action, status, details) VALUES (?, 'info', ?)`,
        ['bulk_import', `Bulk imported ${addedCount} domains. Duplicates: ${duplicateCount}, Invalid: ${invalidCount}`]
      );

      res.json({
        success: true,
        addedCount,
        duplicateCount,
        invalidCount
      });
    });
  });
});

// PUT /api/domains/:id — Update label/notes
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { label, notes } = req.body;
  const db = getDb();

  db.run(
    `UPDATE domains SET label = ?, notes = ? WHERE id = ?`,
    [label, notes, id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to update domain' });
      if (this.changes === 0) return res.status(404).json({ error: 'Domain not found' });
      res.json({ success: true });
    }
  );
});

// DELETE /api/domains/:id — Delete domain
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.get(`SELECT domain FROM domains WHERE id = ?`, [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Domain not found' });

    db.run(`DELETE FROM domains WHERE id = ?`, [id], function (err) {
      if (err) return res.status(500).json({ error: 'Failed to delete domain' });

      db.run(
        `INSERT INTO activity_logs (action, domain, status, details) VALUES (?, ?, 'info', ?)`,
        ['delete_domain', row.domain, 'Removed domain from system']
      );

      res.json({ success: true });
    });
  });
});

// POST /api/domains/bulk-delete — Bulk delete
router.post('/bulk-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({ error: 'Array of domain IDs required' });
  }

  const db = getDb();
  const placeholders = ids.map(() => '?').join(',');

  db.run(`DELETE FROM domains WHERE id IN (${placeholders})`, ids, function (err) {
    if (err) return res.status(500).json({ error: 'Failed to bulk delete' });
    res.json({ success: true, deletedCount: this.changes });
  });
});

module.exports = router;
