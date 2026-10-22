const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { sendWpRequest } = require('../utils/wpClient');

// POST /api/domains/:id/ping-post-manager — Check connection specifically to Post Manager plugin
router.post('/:id/ping-post-manager', async (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.get(`SELECT * FROM domains WHERE id = ?`, [id], async (err, domain) => {
    if (err || !domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    const wpRes = await sendWpRequest(domain.domain, '/ping', {}, domain.site_key, 'pbn-commander-post/v1');

    if (wpRes.success && wpRes.data && wpRes.data.success) {
      db.run(
        `UPDATE domains SET post_manager_status = 'connected', post_manager_last_check = CURRENT_TIMESTAMP, post_manager_error = NULL WHERE id = ?`,
        [id]
      );

      db.run(
        `INSERT INTO activity_logs (action, domain, status, details) VALUES (?, ?, 'success', ?)`,
        ['ping_post_manager', domain.domain, 'PBN Commander Post Manager plugin verified successfully']
      );

      res.json({
        success: true,
        plugin: 'Post Manager',
        status: 'connected',
        details: wpRes.data
      });
    } else {
      const errorMsg = wpRes.error || (wpRes.data && wpRes.data.message) || 'Post Manager ping failed';

      db.run(
        `UPDATE domains SET post_manager_status = 'disconnected', post_manager_last_check = CURRENT_TIMESTAMP, post_manager_error = ? WHERE id = ?`,
        [errorMsg, id]
      );

      db.run(
        `INSERT INTO activity_logs (action, domain, status, details) VALUES (?, ?, 'warning', ?)`,
        ['ping_post_manager', domain.domain, `Post Manager ping failed: ${errorMsg}`]
      );

      res.status(400).json({
        success: false,
        plugin: 'Post Manager',
        status: 'disconnected',
        error: errorMsg
      });
    }
  });
});

// POST /api/domains/:id/ping-sidebar-manager — Check connection specifically to Sidebar Manager plugin
router.post('/:id/ping-sidebar-manager', async (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.get(`SELECT * FROM domains WHERE id = ?`, [id], async (err, domain) => {
    if (err || !domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    const wpRes = await sendWpRequest(domain.domain, '/ping', {}, domain.site_key, 'pbn-commander-sidebar/v1');

    if (wpRes.success && wpRes.data && wpRes.data.success) {
      db.run(
        `UPDATE domains SET sidebar_manager_status = 'connected', sidebar_manager_last_check = CURRENT_TIMESTAMP, sidebar_manager_error = NULL WHERE id = ?`,
        [id]
      );

      db.run(
        `INSERT INTO activity_logs (action, domain, status, details) VALUES (?, ?, 'success', ?)`,
        ['ping_sidebar_manager', domain.domain, 'PBN Commander Sidebar Manager plugin verified successfully']
      );

      res.json({
        success: true,
        plugin: 'Sidebar Manager',
        status: 'connected',
        details: wpRes.data
      });
    } else {
      const errorMsg = wpRes.error || (wpRes.data && wpRes.data.message) || 'Sidebar Manager ping failed';

      db.run(
        `UPDATE domains SET sidebar_manager_status = 'disconnected', sidebar_manager_last_check = CURRENT_TIMESTAMP, sidebar_manager_error = ? WHERE id = ?`,
        [errorMsg, id]
      );

      db.run(
        `INSERT INTO activity_logs (action, domain, status, details) VALUES (?, ?, 'warning', ?)`,
        ['ping_sidebar_manager', domain.domain, `Sidebar Manager ping failed: ${errorMsg}`]
      );

      res.status(400).json({
        success: false,
        plugin: 'Sidebar Manager',
        status: 'disconnected',
        error: errorMsg
      });
    }
  });
});

// POST /api/domains/ping-all-post-manager — Ping Post Manager on all domains
router.post('/ping-all-post-manager', (req, res) => {
  const db = getDb();
  db.all(`SELECT * FROM domains`, async (err, domains) => {
    if (err || !domains.length) {
      return res.json({ success: true, results: [] });
    }

    const results = [];
    for (const domain of domains) {
      const wpRes = await sendWpRequest(domain.domain, '/ping', {}, domain.site_key, 'pbn-commander-post/v1');
      if (wpRes.success && wpRes.data && wpRes.data.success) {
        db.run(
          `UPDATE domains SET post_manager_status = 'connected', post_manager_last_check = CURRENT_TIMESTAMP, post_manager_error = NULL WHERE id = ?`,
          [domain.id]
        );
        results.push({ domain: domain.domain, status: 'connected' });
      } else {
        const errorMsg = wpRes.error || (wpRes.data && wpRes.data.message) || 'Ping failed';
        db.run(
          `UPDATE domains SET post_manager_status = 'disconnected', post_manager_last_check = CURRENT_TIMESTAMP, post_manager_error = ? WHERE id = ?`,
          [errorMsg, domain.id]
        );
        results.push({ domain: domain.domain, status: 'disconnected', error: errorMsg });
      }
    }

    res.json({ success: true, results });
  });
});

// POST /api/domains/ping-all-sidebar-manager — Ping Sidebar Manager on all domains
router.post('/ping-all-sidebar-manager', (req, res) => {
  const db = getDb();
  db.all(`SELECT * FROM domains`, async (err, domains) => {
    if (err || !domains.length) {
      return res.json({ success: true, results: [] });
    }

    const results = [];
    for (const domain of domains) {
      const wpRes = await sendWpRequest(domain.domain, '/ping', {}, domain.site_key, 'pbn-commander-sidebar/v1');
      if (wpRes.success && wpRes.data && wpRes.data.success) {
        db.run(
          `UPDATE domains SET sidebar_manager_status = 'connected', sidebar_manager_last_check = CURRENT_TIMESTAMP, sidebar_manager_error = NULL WHERE id = ?`,
          [domain.id]
        );
        results.push({ domain: domain.domain, status: 'connected' });
      } else {
        const errorMsg = wpRes.error || (wpRes.data && wpRes.data.message) || 'Ping failed';
        db.run(
          `UPDATE domains SET sidebar_manager_status = 'disconnected', sidebar_manager_last_check = CURRENT_TIMESTAMP, sidebar_manager_error = ? WHERE id = ?`,
          [errorMsg, domain.id]
        );
        results.push({ domain: domain.domain, status: 'disconnected', error: errorMsg });
      }
    }

    res.json({ success: true, results });
  });
});

module.exports = router;
