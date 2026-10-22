const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { normalizeDomain, isValidDomain, generateSiteKey } = require('../utils/domain');
const { isSafeUrl } = require('../utils/ssrf');
const { sendWpRequest } = require('../utils/wpClient');
const { parseDelimitedText, validateClientUrl, normalizeClientUrl } = require('../utils/csvParser');

// GET /api/domains — List with search & filter (Includes client_url, keyword, and dual plugin status columns, omits site_key)
router.get('/', (req, res) => {
  const db = getDb();
  const { search, status } = req.query;

  let sql = `SELECT id, domain, status, post_manager_status, sidebar_manager_status, post_manager_last_check, sidebar_manager_last_check, post_manager_error, sidebar_manager_error, label, notes, client_url, keyword, last_check, last_sync, last_error, created_at FROM domains WHERE 1=1`;
  const params = [];

  if (status && status !== 'all') {
    sql += ` AND (status = ? OR post_manager_status = ? OR sidebar_manager_status = ?)`;
    params.push(status, status, status);
  }

  if (search) {
    sql += ` AND (domain LIKE ? OR label LIKE ? OR notes LIKE ? OR client_url LIKE ? OR keyword LIKE ?)`;
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term, term);
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

// POST /api/domains/bulk-preview — Parse CSV/TSV and preview validation/duplicates
router.post('/bulk-preview', (req, res) => {
  const { rawText } = req.body;
  if (!rawText) {
    return res.status(400).json({ error: 'Raw CSV/TSV data string required' });
  }

  const parsedRows = parseDelimitedText(rawText);
  if (!parsedRows.length) {
    return res.status(400).json({ error: 'No valid rows or domain records found in input' });
  }

  const db = getDb();
  db.all(`SELECT domain FROM domains`, [], (err, existingRows) => {
    if (err) return res.status(500).json({ error: 'Failed to query database' });

    const existingDomains = new Set(existingRows.map(r => r.domain.toLowerCase()));
    const previewItems = [];
    let validCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    parsedRows.forEach((row, index) => {
      const normalizedDom = normalizeDomain(row.domain);
      const isDomValid = isValidDomain(normalizedDom);
      const isClientUrlValid = validateClientUrl(row.client_url);
      const isSsrfSafe = process.env.NODE_ENV === 'test' || isSafeUrl(normalizedDom);

      let status = 'valid';
      let error = null;

      if (!isDomValid) {
        status = 'invalid';
        error = 'Invalid domain format';
        invalidCount++;
      } else if (!isSsrfSafe) {
        status = 'invalid';
        error = 'Restricted private/internal address';
        invalidCount++;
      } else if (!isClientUrlValid) {
        status = 'invalid';
        error = 'Invalid client URL format';
        invalidCount++;
      } else if (existingDomains.has(normalizedDom.toLowerCase())) {
        status = 'duplicate';
        error = 'Domain already exists in database';
        duplicateCount++;
      } else {
        validCount++;
        // Add to existing set to catch duplicates within the same batch file
        existingDomains.add(normalizedDom.toLowerCase());
      }

      previewItems.push({
        rowNumber: index + 1,
        raw_domain: row.domain,
        normalized_domain: normalizedDom,
        client_url: row.client_url ? normalizeClientUrl(row.client_url) : '',
        keyword: row.keyword || '',
        label: row.label || '',
        notes: row.notes || '',
        status,
        error
      });
    });

    res.json({
      success: true,
      totalRows: parsedRows.length,
      validCount,
      duplicateCount,
      invalidCount,
      previewItems
    });
  });
});

// POST /api/domains/bulk — Import valid domains (Accepts raw text or array of pre-parsed rows)
router.post('/bulk', (req, res) => {
  const { rawText, rows, defaultLabel } = req.body;
  let targetRows = [];

  if (Array.isArray(rows) && rows.length > 0) {
    targetRows = rows;
  } else if (typeof rawText === 'string') {
    targetRows = parseDelimitedText(rawText);
  } else if (Array.isArray(req.body.domains) && req.body.domains.length > 0) {
    targetRows = req.body.domains.map(d => ({ domain: d, label: req.body.label }));
  }

  if (!targetRows.length) {
    return res.status(400).json({ error: 'No rows or domain data provided for import' });
  }

  const db = getDb();
  let addedCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;

  db.serialize(() => {
    const stmt = db.prepare(
      `INSERT OR IGNORE INTO domains (domain, site_key, label, notes, client_url, keyword, status, post_manager_status, sidebar_manager_status) VALUES (?, ?, ?, ?, ?, ?, 'pending', 'pending', 'pending')`
    );

    targetRows.forEach((row) => {
      const normalizedDom = normalizeDomain(row.normalized_domain || row.domain);
      const normClientUrl = row.client_url ? normalizeClientUrl(row.client_url) : null;

      if (!isValidDomain(normalizedDom) || (row.client_url && !validateClientUrl(row.client_url))) {
        invalidCount++;
        return;
      }

      if (process.env.NODE_ENV !== 'test' && !isSafeUrl(normalizedDom)) {
        invalidCount++;
        return;
      }

      const siteKey = generateSiteKey();
      const finalLabel = row.label || defaultLabel || null;
      const finalNotes = row.notes || null;
      const finalKeyword = row.keyword || null;

      stmt.run([normalizedDom, siteKey, finalLabel, finalNotes, normClientUrl, finalKeyword], function (err) {
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

// POST /api/domains — Add single domain with client_url & keyword
router.post('/', (req, res) => {
  const { domain, label, notes, client_url, keyword } = req.body;
  if (!domain) {
    return res.status(400).json({ error: 'Domain URL is required' });
  }

  const normalized = normalizeDomain(domain);
  if (!isValidDomain(normalized)) {
    return res.status(400).json({ error: 'Invalid domain format' });
  }

  if (client_url && !validateClientUrl(client_url)) {
    return res.status(400).json({ error: 'Invalid client URL format' });
  }

  if (process.env.NODE_ENV !== 'test' && !isSafeUrl(normalized)) {
    return res.status(400).json({ error: 'Domain URL targets a private or restricted internal network address' });
  }

  const normClientUrl = client_url ? normalizeClientUrl(client_url) : null;
  const db = getDb();
  const siteKey = generateSiteKey();

  db.run(
    `INSERT INTO domains (domain, site_key, label, notes, client_url, keyword, status, post_manager_status, sidebar_manager_status) VALUES (?, ?, ?, ?, ?, ?, 'pending', 'pending', 'pending')`,
    [normalized, siteKey, label || null, notes || null, normClientUrl, keyword || null],
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
        client_url: normClientUrl,
        keyword: keyword || null,
        status: 'pending',
        post_manager_status: 'pending',
        sidebar_manager_status: 'pending'
      });
    }
  );
});

// PUT /api/domains/:id — Update single domain details including client_url & keyword
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { label, notes, client_url, keyword } = req.body;

  if (client_url && !validateClientUrl(client_url)) {
    return res.status(400).json({ error: 'Invalid client URL format' });
  }

  const normClientUrl = client_url ? normalizeClientUrl(client_url) : null;
  const db = getDb();

  db.run(
    `UPDATE domains SET label = ?, notes = ?, client_url = ?, keyword = ? WHERE id = ?`,
    [label || null, notes || null, normClientUrl, keyword || null, id],
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
