const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { normalizeDomain, isValidDomain, generateSiteKey } = require('../utils/domain');
const { isSafeUrl } = require('../utils/ssrf');
const { sendWpRequest } = require('../utils/wpClient');

// GET /api/domains — List with search & filter (Omit site_key for security)
router.get('/', (req, res) => {
  const db = getDb();
  const { search, status } = req.query;

  let sql = `SELECT id, domain, status, label, notes, last_check, last_sync, last_error, created_at FROM domains WHERE 1=1`;
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

// GET /api/domains/:id/key — Fetch site_key on explicit user request
router.get('/:id/key', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.get(`SELECT domain, site_key FROM domains WHERE id = ?`, [id], (err, domain) => {
    if (err || !domain) return res.status(404).json({ error: 'Domain not found' });
    res.json({ id, domain: domain.domain, site_key: domain.site_key });
  });
});

// POST /api/domains/ping-all — Ping all domains with real WP requests
router.post('/ping-all', (req, res) => {
  const db = getDb();
  db.all(`SELECT * FROM domains`, async (err, domains) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch domains' });

    const results = [];
    const now = new Date().toISOString();

    for (const domain of domains) {
      const wpRes = await sendWpRequest(domain.domain, '/ping', {}, domain.site_key);

      if (wpRes.success && wpRes.data && wpRes.data.success) {
        db.run(
          `UPDATE domains SET status = 'connected', last_check = ?, last_sync = ?, last_error = NULL WHERE id = ?`,
          [now, now, domain.id]
        );
        results.push({ domain: domain.domain, status: 'connected' });
      } else {
        const errorMsg = wpRes.error || (wpRes.data && wpRes.data.message) || 'Ping failed';
        db.run(
          `UPDATE domains SET status = 'disconnected', last_check = ?, last_error = ? WHERE id = ?`,
          [now, errorMsg, domain.id]
        );
        results.push({ domain: domain.domain, status: 'disconnected', error: errorMsg });
      }
    }

    db.run(
      `INSERT INTO activity_logs (action, status, details) VALUES (?, 'info', ?)`,
      ['ping_all', `Batch connection check complete for ${domains.length} website(s)`]
    );

    res.json({ success: true, total: domains.length, results });
  });
});

// POST /api/domains/:id/ping — Ping single domain with real WP request
router.post('/:id/ping', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.get(`SELECT * FROM domains WHERE id = ?`, [id], async (err, domain) => {
    if (err || !domain) return res.status(404).json({ error: 'Domain not found' });

    const now = new Date().toISOString();
    const wpRes = await sendWpRequest(domain.domain, '/ping', {}, domain.site_key);

    if (wpRes.success && wpRes.data && wpRes.data.success) {
      db.run(
        `UPDATE domains SET status = 'connected', last_check = ?, last_sync = ?, last_error = NULL WHERE id = ?`,
        [now, now, id],
        function (updateErr) {
          if (updateErr) return res.status(500).json({ error: 'Failed to update ping status' });

          db.run(
            `INSERT INTO activity_logs (action, domain, status, details) VALUES (?, ?, 'success', ?)`,
            ['ping_domain', domain.domain, 'Connection ping verified successfully']
          );

          res.json({ success: true, status: 'connected', last_check: now, details: wpRes.data });
        }
      );
    } else {
      const errorMsg = wpRes.error || (wpRes.data && wpRes.data.message) || 'Ping failed';
      db.run(
        `UPDATE domains SET status = 'disconnected', last_check = ?, last_error = ? WHERE id = ?`,
        [now, errorMsg, id],
        function () {
          db.run(
            `INSERT INTO activity_logs (action, domain, status, details) VALUES (?, ?, 'failed', ?)`,
            ['ping_domain', domain.domain, `Connection ping failed: ${errorMsg}`]
          );

          res.status(400).json({ success: false, status: 'disconnected', last_check: now, error: errorMsg });
        }
      );
    }
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

  if (process.env.NODE_ENV !== 'test' && !isSafeUrl(normalized)) {
    return res.status(400).json({ error: 'Domain URL targets a private or restricted internal network address' });
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

      if (process.env.NODE_ENV !== 'test' && !isSafeUrl(normalized)) {
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
