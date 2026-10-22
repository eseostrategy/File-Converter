const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { sendWpRequest } = require('../utils/wpClient');

// GET /api/sidebar-links — List active sidebar link configurations
router.get('/', (req, res) => {
  const db = getDb();
  const sql = `
    SELECT sl.*,
      (SELECT COUNT(*) FROM sidebar_link_deployments sld WHERE sld.link_id = sl.id) as target_count,
      (SELECT COUNT(*) FROM sidebar_link_deployments sld WHERE sld.link_id = sl.id AND sld.status = 'deployed') as deployed_count
    FROM sidebar_links sl
    ORDER BY sl.created_at DESC
  `;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch sidebar links' });
    res.json(rows);
  });
});

// POST /api/sidebar-links/deploy — Create & Deploy Sidebar Link via real WP API
router.post('/deploy', async (req, res) => {
  const { campaign_name, url, anchor_text, rel, target, widget_title, domain_ids } = req.body;

  if (!url || !anchor_text || !Array.isArray(domain_ids) || !domain_ids.length) {
    return res.status(400).json({ error: 'Destination URL, anchor text, and at least one target site required' });
  }

  const db = getDb();

  db.run(
    `INSERT INTO sidebar_links (campaign_name, url, anchor_text, rel, target, widget_title) VALUES (?, ?, ?, ?, ?, ?)`,
    [campaign_name || null, url.trim(), anchor_text.trim(), rel || 'dofollow', target || '_blank', widget_title || 'Sponsored Links'],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to save sidebar link configuration' });

      const linkId = this.lastID;
      const placeholders = domain_ids.map(() => '?').join(',');

      db.all(`SELECT * FROM domains WHERE id IN (${placeholders})`, domain_ids, async (err, domains) => {
        if (err || !domains.length) {
          return res.status(400).json({ error: 'No valid target domains found' });
        }

        const deploymentResults = [];

        for (const domain of domains) {
          const payload = {
            url: url.trim(),
            anchor_text: anchor_text.trim(),
            rel: rel || 'dofollow',
            target: target || '_blank',
            widget_title: widget_title || 'Sponsored Links'
          };

          const wpRes = await sendWpRequest(domain.domain, '/sidebar-links', payload, domain.site_key);

          if (wpRes.success && wpRes.data && wpRes.data.success) {
            db.run(
              `INSERT OR REPLACE INTO sidebar_link_deployments (link_id, domain_id, status, error_message, updated_at) VALUES (?, ?, 'deployed', NULL, CURRENT_TIMESTAMP)`,
              [linkId, domain.id]
            );

            deploymentResults.push({
              domain: domain.domain,
              status: 'deployed'
            });
          } else {
            const errorMsg = wpRes.error || (wpRes.data && wpRes.data.message) || 'Deployment failed';

            db.run(
              `INSERT OR REPLACE INTO sidebar_link_deployments (link_id, domain_id, status, error_message, updated_at) VALUES (?, ?, 'failed', ?, CURRENT_TIMESTAMP)`,
              [linkId, domain.id, errorMsg]
            );

            deploymentResults.push({
              domain: domain.domain,
              status: 'failed',
              error: errorMsg
            });
          }
        }

        const successCount = deploymentResults.filter(r => r.status === 'deployed').length;
        const failedCount = deploymentResults.filter(r => r.status === 'failed').length;

        db.run(
          `INSERT INTO activity_logs (action, status, details) VALUES (?, ?, ?)`,
          ['deploy_sidebar_link', failedCount > 0 ? 'warning' : 'success', `Deployed sidebar link "${anchor_text}" to ${successCount} site(s). Failed on ${failedCount} site(s).`]
        );

        res.json({
          success: true,
          linkId,
          deploymentResults
        });
      });
    }
  );
});

// DELETE /api/sidebar-links/:id — Delete / Remove deployed sidebar link
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.run(`DELETE FROM sidebar_links WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to delete sidebar link' });

    db.run(
      `INSERT INTO activity_logs (action, status, details) VALUES (?, 'info', ?)`,
      ['delete_sidebar_link', `Removed sidebar link ID ${id} from dashboard`]
    );

    res.json({ success: true });
  });
});

module.exports = router;
