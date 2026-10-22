const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { sendWpRequest } = require('../utils/wpClient');
const { parseSideBySideInput, matchPastedDomains } = require('../utils/backlinkMatcher');
const { spinText, generateVariationsForDomains } = require('../utils/spinSyntax');

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

// POST /api/articles/match-domains — Resolve pasted domains against registered domains in exact order
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

// POST /api/articles/preview — Generate mapping and content preview for submission
router.post('/preview', (req, res) => {
  const {
    article_mode,
    spin_strategy,
    content,
    url_mode,
    client_url_text,
    client_keyword_text,
    domain_ids
  } = req.body;

  if (!content || !Array.isArray(domain_ids) || !domain_ids.length) {
    return res.status(400).json({ error: 'Content and selected domains are required' });
  }

  const db = getDb();
  const placeholders = domain_ids.map(() => '?').join(',');

  db.all(`SELECT id, domain, status, site_key FROM domains WHERE id IN (${placeholders})`, domain_ids, (err, domains) => {
    if (err || !domains.length) {
      return res.status(400).json({ error: 'No valid target domains found' });
    }

    // Preserve explicit user domain order
    const domainMap = new Map(domains.map(d => [d.id, d]));
    const orderedDomains = domain_ids.map(id => domainMap.get(id)).filter(Boolean);

    // Check if any domain is disconnected
    const disconnectedDomains = orderedDomains.filter(d => d.status !== 'connected');
    if (disconnectedDomains.length > 0) {
      return res.status(400).json({
        error: `Selected domain ${disconnectedDomains[0].domain} is not connected. All target domains must be connected before publishing.`,
        disconnected: disconnectedDomains.map(d => d.domain)
      });
    }

    // Validate URL / Keyword pairings
    const urlCheck = parseSideBySideInput(client_url_text, client_keyword_text, orderedDomains.length, url_mode || 'different');
    if (!urlCheck.valid) {
      return res.status(400).json({
        error: 'URL/Keyword validation failed',
        details: urlCheck.errors
      });
    }

    // Generate Article Content (Normal vs Spin Syntax)
    let contentVariations = [];
    if (article_mode === 'spin') {
      contentVariations = generateVariationsForDomains(content, orderedDomains, spin_strategy || 'per_domain');
    } else {
      const sanitized = sanitizeHtml(content);
      contentVariations = orderedDomains.map(d => ({ domain: d.domain, content: sanitized }));
    }

    // Build side-by-side ordered mapping
    const mapping = orderedDomains.map((dom, idx) => {
      const pair = urlCheck.pairs[idx] || { url: '', keyword: '' };
      const varObj = contentVariations[idx] || { content: '' };
      return {
        order: idx + 1,
        domain_id: dom.id,
        domain: dom.domain,
        client_url: pair.url,
        client_keyword: pair.keyword,
        content_preview: varObj.content.length > 120 ? varObj.content.substring(0, 120) + '...' : varObj.content,
        full_content: varObj.content
      };
    });

    res.json({
      success: true,
      ordered_count: mapping.length,
      mapping
    });
  });
});

// POST /api/articles/publish — Publish article to selected target domains in explicit order
router.post('/publish', async (req, res) => {
  const {
    title,
    content,
    article_mode,
    spin_strategy,
    url_mode,
    client_url_text,
    client_keyword_text,
    categories,
    tags,
    featured_image,
    canonical_url,
    status,
    domain_ids
  } = req.body;

  if (!title || !content || !Array.isArray(domain_ids) || !domain_ids.length) {
    return res.status(400).json({ error: 'Title, content, and at least one target site required' });
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

    // Block submission if any domain is not connected
    const disconnected = orderedDomains.filter(d => d.status !== 'connected');
    if (disconnected.length > 0) {
      return res.status(400).json({
        error: `Cannot publish: Domain "${disconnected[0].domain}" is not connected. All selected target domains must be connected.`
      });
    }

    // Validate URL / Keyword pairings
    const urlCheck = parseSideBySideInput(client_url_text, client_keyword_text, orderedDomains.length, url_mode || 'different');
    if (!urlCheck.valid) {
      return res.status(400).json({
        error: `Validation failed: ${urlCheck.errors.join(' ')}`
      });
    }

    // Generate Article Content per domain
    let contentVariations = [];
    if (article_mode === 'spin') {
      contentVariations = generateVariationsForDomains(content, orderedDomains, spin_strategy || 'per_domain');
    } else {
      const sanitized = sanitizeHtml(content);
      contentVariations = orderedDomains.map(d => ({ domain: d.domain, content: sanitized }));
    }

    const postStatus = status === 'draft' ? 'draft' : 'publish';

    // Insert article parent record
    db.run(
      `INSERT INTO articles (title, content, article_mode, spin_strategy, url_mode, categories, tags, featured_image, canonical_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        content,
        article_mode || 'normal',
        spin_strategy || 'per_domain',
        url_mode || 'different',
        categories || null,
        tags || null,
        featured_image || null,
        canonical_url || null,
        postStatus
      ],
      async function (err) {
        if (err) return res.status(500).json({ error: 'Failed to save article in database' });

        const articleId = this.lastID;
        const results = [];

        // Dispatch requests in exact user order
        for (let idx = 0; idx < orderedDomains.length; idx++) {
          const domain = orderedDomains[idx];
          const pair = urlCheck.pairs[idx];
          const varObj = contentVariations[idx];

          const payload = {
            title,
            content: varObj.content,
            status: postStatus,
            categories,
            tags,
            featured_image,
            canonical_url,
            backlink_url: pair.url,
            backlink_keyword: pair.keyword
          };

          const wpRes = await sendWpRequest(domain.domain, '/publish', payload, domain.site_key);

          if (wpRes.success && wpRes.data && wpRes.data.success) {
            const remotePostId = wpRes.data.post_id;
            const remotePostUrl = wpRes.data.post_url;

            db.run(
              `INSERT INTO publishing_history (article_id, domain_id, backlink_url, backlink_keyword, spun_content, remote_post_id, remote_post_url, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'published')`,
              [articleId, domain.id, pair.url, pair.keyword, article_mode === 'spin' ? varObj.content : null, remotePostId, remotePostUrl]
            );

            db.run(`UPDATE domains SET last_sync = CURRENT_TIMESTAMP WHERE id = ?`, [domain.id]);

            results.push({
              order: idx + 1,
              domain: domain.domain,
              status: 'published',
              remote_post_id: remotePostId,
              remote_post_url: remotePostUrl,
              client_url: pair.url,
              client_keyword: pair.keyword
            });
          } else {
            const errorMsg = wpRes.error || (wpRes.data && wpRes.data.message) || 'Publishing failed';

            db.run(
              `INSERT INTO publishing_history (article_id, domain_id, backlink_url, backlink_keyword, spun_content, status, error_message)
               VALUES (?, ?, ?, ?, ?, 'failed', ?)`,
              [articleId, domain.id, pair.url, pair.keyword, article_mode === 'spin' ? varObj.content : null, errorMsg]
            );

            results.push({
              order: idx + 1,
              domain: domain.domain,
              status: 'failed',
              error: errorMsg,
              client_url: pair.url,
              client_keyword: pair.keyword
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
      }
    );
  });
});

module.exports = router;
