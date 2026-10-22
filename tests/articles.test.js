const request = require('supertest');
const app = require('../src/app');
const { initDb, getDb } = require('../src/db');

describe('Article Publishing Engine & API', () => {
  let domain1Id, domain2Id;
  const originalFetch = global.fetch;

  beforeAll(async () => {
    await initDb();
    const res1 = await request(app).post('/api/domains').send({ domain: 'site-alpha.com' });
    const res2 = await request(app).post('/api/domains').send({ domain: 'site-beta.com' });
    domain1Id = res1.body.id;
    domain2Id = res2.body.id;
  });

  afterAll((done) => {
    global.fetch = originalFetch;
    const db = getDb();
    db.run("DELETE FROM domains", () => {
      db.run("DELETE FROM articles", () => {
        db.run("DELETE FROM publishing_history", done);
      });
    });
  });

  it('POST /api/articles/publish should publish article to selected websites and record history', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ success: true, post_id: 101, post_url: 'https://site-alpha.com/?p=101' }))
    });

    const payload = {
      title: 'Top 10 SEO Strategies for 2025',
      content: '<p>Welcome to our comprehensive guide on SEO.</p><script>alert("xss")</script>',
      categories: 'SEO, Marketing',
      tags: 'pbn, backlinks',
      status: 'publish',
      domain_ids: [domain1Id, domain2Id]
    };

    const res = await request(app).post('/api/articles/publish').send(payload);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('articleId');
    expect(res.body.results.length).toEqual(2);
    expect(res.body.results[0]).toHaveProperty('status', 'published');
  });

  it('GET /api/articles/history should return recorded publishing history', async () => {
    const res = await request(app).get('/api/articles/history');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).toHaveProperty('article_title', 'Top 10 SEO Strategies for 2025');
  });

  it('POST /api/articles/publish should fail if no target domains provided', async () => {
    const res = await request(app).post('/api/articles/publish').send({
      title: 'No Target Test',
      content: 'Content',
      domain_ids: []
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });
});
