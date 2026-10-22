const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { sendWpRequest } = require('../utils/wpClient');
const { parseBulkBacklinks, matchPastedDomains } = require('../utils/backlinkMatcher');

function sanitizeHtml(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
}

// GET /api/articles — List articles
router.get('/', (req, res) => {
  const db = getDb();
  db.all(`SELECT * FROM articles ORDER BY created_at DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch articles' });
    res.json(rows);
  });
});

// GET /api/articles/history — Get publishing history
router.get('/history', (req, res) => {
  const db = getDb();
  const sql = `
    SELECT ph.*, a.title as article_title, d.domain
    FROM publishing_history ph
    JOIN articles a ON ph.article_id = a.id
    JOIN domains d ON ph.domain_id = d.id
    ORDER BY ph.published_at DESC
  `;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch publishing history' });
    res.json(rows);
  });
});

// POST /api/articles/match-domains — Match raw pasted domains against registered connected domains
router.post('/match-domains', (req, res) => {
  const { rawDomainsText } = req.body;
  if (!rawDomainsText) {
    return res.status(400).json({ error: 'Domain text is required' });
  }

  const db = getDb();
  db.all(`SELECT id, domain, status, label FROM domains`, [], (err, registeredDomains) => {
    if (err) return res.status(500).json({ error: 'Failed to query domains' });

    const matchResult = matchPastedDomains(rawDomainsText, registeredDomains);
    res.json({
      success: true,
      ...matchResult
    });
  });
});

// POST /api/articles/validate-backlinks — Parse and validate bulk backlinks against selected domains
router.post('/validate-backlinks', (req, res) => {
  const { bulkBacklinksText, selectedDomainIds } = req.body;

  const { validPairs, invalidLines } = parseBulkBacklinks(bulkBacklinksText);
  const targetCount = Array.isArray(selectedDomainIds) ? selectedDomainIds.length : 0;

  let mismatchError = null;
  if (targetCount > 0 && validPairs.length !== targetCount) {
    mismatchError = `Count mismatch: You selected ${targetCount} domain(s), but provided ${validPairs.length} valid URL/keyword pair(s). Exactly one pair per domain is required.`;
  }

  res.json({
    success: invalidLines.length === 0 && !mismatchError,
    validPairs,
    invalidLines,
    mismatchError,
    targetCount,
    validPairCount: validPairs.length
  });
});

// POST /api/articles/publish — Publish article to selected target domains via real WP API with backlinks
router.post('/publish', async (req, res) => {
  const {
    title,
    content,
    categories,
    tags,
    featured_image,
    canonical_url,
    status,
    domain_ids,
    backlink_mode,
    backlink_url,
    backlink_keyword,
    bulk_backlinks_text
  } = req.body;

  if (!title || !content || !Array.isArray(domain_ids) || !domain_ids.length) {
    return res.status(400).json({ error: 'Title, content, and at least one target site required' });
  }

  // Validate backlink configuration
  let backlinkMap = new Map(); // domain_id -> { url, keyword }

  if (backlink_mode === 'bulk') {
    const { validPairs, invalidLines } = parseBulkBacklinks(bulk_backlinks_text);

    if (invalidLines.length > 0) {
      return res.status(400).json({
        error: `Invalid lines in bulk backlinks. Line ${invalidLines[0].lineNumber}: ${invalidLines[0].error}`
      });
    }

    if (validPairs.length !== domain_ids.length) {
      return res.status(400).json({
        error: `Count mismatch: Selected ${domain_ids.length} domain(s), but provided ${validPairs.length} valid backlink pair(s). Exactly one pair per domain is required.`
      });
    }

    domain_ids.forEach((id, idx) => {
      backlinkMap.set(id, {
        url: validPairs[idx].url,
        keyword: validPairs[idx].keyword
      });
    });
  } else if (backlink_mode === 'single' || (backlink_url && backlink_keyword)) {
    if (!backlink_url || !backlink_keyword) {
      return res.status(400).json({ error: 'Both backlink URL and anchor keyword are required for single backlink mode' });
    }
    domain_ids.forEach(id => {
      backlinkMap.set(id, {
        url: backlink_url.trim(),
        keyword: backlink_keyword.trim()
      });
    });
  }

  const sanitizedContent = sanitizeHtml(content);
  const db = getDb();
  const postStatus = status === 'draft' ? 'draft' : 'publish';

  db.run(
    `INSERT INTO articles (title, content, categories, tags, featured_image, canonical_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title.trim(), sanitizedContent, categories || null, tags || null, featured_image || null, canonical_url || null, postStatus],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to save article' });

      const articleId = this.lastID;
      const results = [];
      const placeholders = domain_ids.map(() => '?').join(',');

      db.all(`SELECT * FROM domains WHERE id IN (${placeholders})`, domain_ids, async (err, domains) => {
        if (err || !domains.length) {
          return res.status(400).json({ error: 'No valid target domains found' });
        }

        for (const domain of domains) {
          const siteBacklink = backlinkMap.get(domain.id);

          const payload = {
            title,
            content: sanitizedContent,
            status: postStatus,
            categories,
            tags,
            featured_image,
            canonical_url,
            backlink_url: siteBacklink ? siteBacklink.url : null,
            backlink_keyword: siteBacklink ? siteBacklink.keyword : null
          };

          const wpRes = await sendWpRequest(domain.domain, '/publish', payload, domain.site_key);

          if (wpRes.success && wpRes.data && wpRes.data.success) {
            const remotePostId = wpRes.data.post_id;
            const remotePostUrl = wpRes.data.post_url;

            db.run(
              `INSERT INTO publishing_history (article_id, domain_id, remote_post_id, remote_post_url, status) VALUES (?, ?, ?, ?, 'published')`,
              [articleId, domain.id, remotePostId, remotePostUrl]
            );

            db.run(`UPDATE domains SET last_sync = CURRENT_TIMESTAMP WHERE id = ?`, [domain.id]);

            results.push({
              domain: domain.domain,
              status: 'published',
              remote_post_id: remotePostId,
              remote_post_url: remotePostUrl,
              backlink_used: siteBacklink || null
            });
          } else {
            const errorMsg = wpRes.error || (wpRes.data && wpRes.data.message) || 'Publishing failed';

            db.run(
              `INSERT INTO publishing_history (article_id, domain_id, status, error_message) VALUES (?, ?, 'failed', ?)`,
              [articleId, domain.id, errorMsg]
            );

            results.push({
              domain: domain.domain,
              status: 'failed',
              error: errorMsg,
              backlink_used: siteBacklink || null
            });
          }
        }

        const successCount = results.filter(r => r.status === 'published').length;
        const failedCount = results.filter(r => r.status === 'failed').length;

        db.run(
          `INSERT INTO activity_logs (action, status, details) VALUES (?, ?, ?)`,
          ['publish_article', failedCount > 0 ? 'warning' : 'success', `Published "${title}" to ${successCount} site(s). Failed on ${failedCount} site(s).`]
        );

        res.json({
          success: true,
          articleId,
          results
        });
      });
    }
  );
});

module.exports = router;
