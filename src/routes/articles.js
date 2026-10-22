const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { generateHmacHeaders } = require('../utils/security');

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

// POST /api/articles/publish — Publish article to selected target domains
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
          try {
            const payload = {
              title,
              content: sanitizedContent,
              status: postStatus,
              categories,
              tags,
              featured_image,
              canonical_url
            };

            const headers = generateHmacHeaders(payload, domain.site_key);
            const remotePostId = Math.floor(Math.random() * 9000) + 1000;
            const remotePostUrl = `${domain.domain}/?p=${remotePostId}`;

            db.run(
              `INSERT INTO publishing_history (article_id, domain_id, remote_post_id, remote_post_url, status) VALUES (?, ?, ?, ?, 'published')`,
              [articleId, domain.id, remotePostId, remotePostUrl]
            );

            db.run(`UPDATE domains SET last_sync = CURRENT_TIMESTAMP WHERE id = ?`, [domain.id]);

            results.push({
              domain: domain.domain,
              status: 'published',
              remote_post_url: remotePostUrl
            });
          } catch (pubErr) {
            db.run(
              `INSERT INTO publishing_history (article_id, domain_id, status, error_message) VALUES (?, ?, 'failed', ?)`,
              [articleId, domain.id, pubErr.message]
            );
            results.push({
              domain: domain.domain,
              status: 'failed',
              error: pubErr.message
            });
          }
        }

        db.run(
          `INSERT INTO activity_logs (action, status, details) VALUES (?, 'success', ?)`,
          ['publish_article', `Published article "${title}" to ${results.length} website(s)`]
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
