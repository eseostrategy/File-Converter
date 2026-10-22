const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { sendWpRequest } = require('../utils/wpClient');

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

// POST /api/articles/publish — Publish article to selected target domains via real WP API
router.post('/publish', async (req, res) => {
  const { title, content, categories, tags, featured_image, canonical_url, status, domain_ids } = req.body;

  if (!title || !content || !Array.isArray(domain_ids) || !domain_ids.length) {
    return res.status(400).json({ error: 'Title, content, and at least one target site required' });
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
          const payload = {
            title,
            content: sanitizedContent,
            status: postStatus,
            categories,
            tags,
            featured_image,
            canonical_url
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
              remote_post_url: remotePostUrl
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
              error: errorMsg
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
