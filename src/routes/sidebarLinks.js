const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { sendWpRequest } = require('../utils/wpClient');
const { parseSideBySideInput } = require('../utils/backlinkMatcher');

/**
 * Escapes values safely for CSV output (RFC 4180 format)
 */
function escapeCsvCell(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

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

// GET /api/sidebar-links/reports — List all downloadable campaign completion reports
router.get('/reports', (req, res) => {
  const db = getDb();
  const sql = `
    SELECT scr.id, scr.link_id, scr.campaign_name, scr.total_targets, scr.success_count, scr.failed_count, scr.completed_at
    FROM sidebar_campaign_reports scr
    ORDER BY scr.completed_at DESC
  `;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch campaign reports' });
    res.json(rows);
  });
});

// GET /api/sidebar-links/reports/:id/download — Download CSV completion report
router.get('/reports/:id/download', (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.get(`SELECT * FROM sidebar_campaign_reports WHERE id = ?`, [id], (err, report) => {
    if (err || !report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const campaignSlug = (report.campaign_name || 'Sidebar_Backlink_Campaign')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    const timestampStr = new Date(report.completed_at).toISOString().split('T')[0];
    const filename = `${campaignSlug}_report_${timestampStr}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(report.report_csv);
  });
});

// GET /api/sidebar-links/history — Get detailed deployment history
router.get('/history', (req, res) => {
  const db = getDb();
  const sql = `
    SELECT sld.*, sl.campaign_name, sl.widget_title, sl.rel, sl.target, d.domain
    FROM sidebar_link_deployments sld
    JOIN sidebar_links sl ON sld.link_id = sl.id
    JOIN domains d ON sld.domain_id = d.id
    ORDER BY sld.updated_at DESC
  `;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch sidebar link deployment history' });
    res.json(rows);
  });
});

// POST /api/sidebar-links/preview — Generate domain-to-sidebar-link mapping preview
router.post('/preview', (req, res) => {
  const { url_mode, client_url_text, client_keyword_text, domain_ids } = req.body;

  if (!Array.isArray(domain_ids) || !domain_ids.length) {
    return res.status(400).json({ error: 'Selected domains are required' });
  }

  const db = getDb();
  const placeholders = domain_ids.map(() => '?').join(',');

  db.all(`SELECT id, domain, status FROM domains WHERE id IN (${placeholders})`, domain_ids, (err, domains) => {
    if (err || !domains.length) {
      return res.status(400).json({ error: 'No valid target domains found' });
    }

    const domainMap = new Map(domains.map(d => [d.id, d]));
    const orderedDomains = domain_ids.map(id => domainMap.get(id)).filter(Boolean);

    const disconnected = orderedDomains.filter(d => d.sidebar_manager_status !== 'connected' && d.status !== 'connected');
    if (disconnected.length > 0) {
      return res.status(400).json({
        error: `Domain ${disconnected[0].domain} is not connected for Sidebar Manager. All target domains must be connected before deploying sidebar links.`,
        disconnected: disconnected.map(d => d.domain)
      });
    }

    const urlCheck = parseSideBySideInput(client_url_text, client_keyword_text, orderedDomains.length, url_mode || 'different');
    if (!urlCheck.valid) {
      return res.status(400).json({
        error: 'URL/Keyword validation failed',
        details: urlCheck.errors
      });
    }

    const mapping = orderedDomains.map((dom, idx) => {
      const pair = urlCheck.pairs[idx] || { url: '', keyword: '' };
      return {
        order: idx + 1,
        domain_id: dom.id,
        domain: dom.domain,
        client_url: pair.url,
        client_keyword: pair.keyword
      };
    });

    res.json({
      success: true,
      ordered_count: mapping.length,
      mapping
    });
  });
});

// POST /api/sidebar-links/deploy — Deploy Sidebar Links via Sidebar Manager plugin & generate CSV report
router.post('/deploy', async (req, res) => {
  const {
    campaign_name,
    url_mode,
    client_url_text,
    client_keyword_text,
    rel,
    target,
    widget_title,
    domain_ids
  } = req.body;

  if (!Array.isArray(domain_ids) || !domain_ids.length) {
    return res.status(400).json({ error: 'At least one target site required' });
  }

  const db = getDb();
  const placeholders = domain_ids.map(() => '?').join(',');

  db.all(`SELECT * FROM domains WHERE id IN (${placeholders})`, domain_ids, async (err, domains) => {
    if (err || !domains.length) {
      return res.status(400).json({ error: 'No valid target domains found' });
    }

    // Preserve exact user-specified domain ordering
    const domainMap = new Map(domains.map(d => [d.id, d]));
    const orderedDomains = domain_ids.map(id => domainMap.get(id)).filter(Boolean);

    if (orderedDomains.length !== domain_ids.length) {
      return res.status(400).json({ error: 'One or more target domains could not be found' });
    }

    const disconnected = orderedDomains.filter(d => d.sidebar_manager_status !== 'connected' && d.status !== 'connected');
    if (disconnected.length > 0) {
      return res.status(400).json({
        error: `Cannot deploy: Domain "${disconnected[0].domain}" is not connected for Sidebar Manager. All selected target domains must be connected.`
      });
    }

    const urlCheck = parseSideBySideInput(client_url_text, client_keyword_text, orderedDomains.length, url_mode || 'different');
    if (!urlCheck.valid) {
      return res.status(400).json({
        error: `Validation failed: ${urlCheck.errors.join(' ')}`
      });
    }

    const primaryUrl = urlCheck.pairs[0].url;
    const primaryKeyword = urlCheck.pairs[0].keyword;

    db.run(
      `INSERT INTO sidebar_links (campaign_name, url, anchor_text, url_mode, rel, target, widget_title) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        campaign_name || null,
        primaryUrl,
        primaryKeyword,
        url_mode || 'different',
        rel || 'dofollow',
        target || '_blank',
        widget_title || 'Sponsored Links'
      ],
      async function (err) {
        if (err) return res.status(500).json({ error: 'Failed to save sidebar link configuration' });

        const linkId = this.lastID;
        const deploymentResults = [];

        for (let idx = 0; idx < orderedDomains.length; idx++) {
          const domain = orderedDomains[idx];
          const pair = urlCheck.pairs[idx];

          const payload = {
            url: pair.url,
            anchor_text: pair.keyword,
            rel: rel || 'dofollow',
            target: target || '_blank',
            widget_title: widget_title || 'Sponsored Links'
          };

          // Route specifically to Sidebar Manager plugin REST endpoint
          const wpRes = await sendWpRequest(domain.domain, '/sidebar-links', payload, domain.site_key, 'pbn-commander-sidebar/v1');

          if (wpRes.success && wpRes.data && wpRes.data.success) {
            db.run(
              `INSERT OR REPLACE INTO sidebar_link_deployments (link_id, domain_id, assigned_url, assigned_keyword, status, error_message, updated_at)
               VALUES (?, ?, ?, ?, 'deployed', NULL, CURRENT_TIMESTAMP)`,
              [linkId, domain.id, pair.url, pair.keyword]
            );

            deploymentResults.push({
              order: idx + 1,
              domain: domain.domain,
              client_url: pair.url,
              client_keyword: pair.keyword,
              status: 'deployed',
              error: ''
            });
          } else {
            const errorMsg = wpRes.error || (wpRes.data && wpRes.data.message) || 'Deployment failed';

            db.run(
              `INSERT OR REPLACE INTO sidebar_link_deployments (link_id, domain_id, assigned_url, assigned_keyword, status, error_message, updated_at)
               VALUES (?, ?, ?, ?, 'failed', ?, CURRENT_TIMESTAMP)`,
              [linkId, domain.id, pair.url, pair.keyword, errorMsg]
            );

            deploymentResults.push({
              order: idx + 1,
              domain: domain.domain,
              client_url: pair.url,
              client_keyword: pair.keyword,
              status: 'failed',
              error: errorMsg
            });
          }
        }

        const successCount = deploymentResults.filter(r => r.status === 'deployed').length;
        const failedCount = deploymentResults.filter(r => r.status === 'failed').length;

        // Build CSV Report
        const completionTime = new Date().toISOString();
        const csvHeaders = ['Order', 'Target Domain', 'Client URL', 'Client Keyword', 'Deployment Status', 'Error Details', 'Completion Time'];
        const csvRows = [csvHeaders.map(escapeCsvCell).join(',')];

        deploymentResults.forEach(r => {
          const row = [
            r.order,
            r.domain,
            r.client_url,
            r.client_keyword,
            r.status,
            r.error || 'N/A',
            completionTime
          ];
          csvRows.push(row.map(escapeCsvCell).join(','));
        });

        const reportCsv = csvRows.join('\r\n');

        db.run(
          `INSERT INTO sidebar_campaign_reports (link_id, campaign_name, total_targets, success_count, failed_count, report_csv) VALUES (?, ?, ?, ?, ?, ?)`,
          [linkId, campaign_name || 'Sidebar Backlink Campaign', deploymentResults.length, successCount, failedCount, reportCsv],
          function (reportErr) {
            const reportId = this ? this.lastID : null;

            db.run(
              `INSERT INTO activity_logs (action, status, details) VALUES (?, ?, ?)`,
              ['deploy_sidebar_link', failedCount > 0 ? 'warning' : 'success', `Deployed sidebar links to ${successCount} site(s). Failed on ${failedCount} site(s). Report generated.`]
            );

            res.json({
              success: true,
              linkId,
              reportId,
              deploymentResults
            });
          }
        );
      }
    );
  });
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
