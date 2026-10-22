const request = require('supertest');
const app = require('../src/app');
const { initDb, getDb } = require('../src/db');

describe('Sidebar Link Management API', () => {
  let domainId;
  const originalFetch = global.fetch;

  beforeAll(async () => {
    await initDb();
    const domainRes = await request(app).post('/api/domains').send({ domain: 'sidebar-test-site.com' });
    domainId = domainRes.body.id;

    const db = getDb();
    await new Promise(r => db.run("UPDATE domains SET status = 'connected' WHERE id = ?", [domainId], r));
  });

  afterAll((done) => {
    global.fetch = originalFetch;
    const db = getDb();
    db.run("DELETE FROM domains", () => {
      db.run("DELETE FROM sidebar_links", () => {
        db.run("DELETE FROM sidebar_link_deployments", done);
      });
    });
  });

  it('POST /api/sidebar-links/deploy should create and deploy link to target websites', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ success: true, message: 'Sidebar link widget updated' }))
    });

    const payload = {
      campaign_name: 'Spring SEO Campaign',
      url_mode: 'same',
      client_url_text: 'https://myservice.com/landing',
      client_keyword_text: 'Top Rated Services',
      rel: 'nofollow',
      target: '_blank',
      widget_title: 'Featured Resources',
      domain_ids: [domainId]
    };

    const res = await request(app).post('/api/sidebar-links/deploy').send(payload);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('linkId');
    expect(res.body.deploymentResults.length).toEqual(1);
    expect(res.body.deploymentResults[0].status).toEqual('deployed');
  });

  it('GET /api/sidebar-links should list active sidebar link campaigns', async () => {
    const res = await request(app).get('/api/sidebar-links');

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('campaign_name', 'Spring SEO Campaign');
    expect(res.body[0]).toHaveProperty('deployed_count', 1);
  });

  it('DELETE /api/sidebar-links/:id should remove a sidebar link campaign', async () => {
    const listRes = await request(app).get('/api/sidebar-links');
    const linkId = listRes.body[0].id;

    const delRes = await request(app).delete(`/api/sidebar-links/${linkId}`);
    expect(delRes.statusCode).toEqual(200);
    expect(delRes.body).toHaveProperty('success', true);

    const checkRes = await request(app).get('/api/sidebar-links');
    expect(checkRes.body.length).toEqual(0);
  });
});
