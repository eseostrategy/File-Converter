const request = require('supertest');
const app = require('../src/app');
const { initDb, getDb } = require('../src/db');

describe('WordPress Client Connectivity & Mocked API Tests', () => {
  let domain1Id, domain2Id;
  const originalFetch = global.fetch;

  beforeAll(async () => {
    await initDb();
    const res1 = await request(app).post('/api/domains').send({ domain: 'http://wp-site1.test' });
    const res2 = await request(app).post('/api/domains').send({ domain: 'http://wp-site2.test' });
    domain1Id = res1.body.id;
    domain2Id = res2.body.id;

    const db = getDb();
    await new Promise(r => db.run("UPDATE domains SET status = 'connected' WHERE id IN (?, ?)", [domain1Id, domain2Id], r));
  });

  afterAll((done) => {
    global.fetch = originalFetch;
    const db = getDb();
    db.run("DELETE FROM domains", () => {
      db.run("DELETE FROM articles", () => {
        db.run("DELETE FROM publishing_history", () => {
          db.run("DELETE FROM sidebar_links", () => {
            db.run("DELETE FROM sidebar_link_deployments", done);
          });
        });
      });
    });
  });

  it('POST /api/domains/:id/ping should succeed when WordPress returns success', async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('wp-site1.test')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(JSON.stringify({ success: true, message: 'Connection successful', wp_version: '6.4' }))
        });
      }
      return Promise.reject(new Error('Fetch failed'));
    });

    const res = await request(app).post(`/api/domains/${domain1Id}/ping`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('connected');
  });

  it('POST /api/domains/:id/ping should record failure and last_error on HTTP error', async () => {
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve(JSON.stringify({ code: 'invalid_signature', message: 'Invalid HMAC signature' }))
      });
    });

    const res = await request(app).post(`/api/domains/${domain1Id}/ping`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.status).toEqual('disconnected');
    expect(res.body.error).toContain('Invalid HMAC signature');

    // Restore status to connected for remaining tests
    const db = getDb();
    await new Promise(r => db.run("UPDATE domains SET status = 'connected' WHERE id = ?", [domain1Id], r));
  });

  it('POST /api/articles/publish should handle partial site success and failure', async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('wp-site1.test')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(JSON.stringify({ success: true, post_id: 88, post_url: 'http://wp-site1.test/?p=88' }))
        });
      }
      return Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        text: () => Promise.resolve(JSON.stringify({ message: 'Database failure on child site' }))
      });
    });

    const res = await request(app)
      .post('/api/articles/publish')
      .send({
        title: 'Multi-Site Test Article',
        content: '<p>Content testing</p>',
        url_mode: 'same',
        client_url_text: 'https://client.com',
        client_keyword_text: 'Keyword',
        domain_ids: [domain1Id, domain2Id]
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.results.length).toEqual(2);

    const site1Result = res.body.results.find(r => r.domain.includes('wp-site1.test'));
    const site2Result = res.body.results.find(r => r.domain.includes('wp-site2.test'));

    expect(site1Result.status).toEqual('published');
    expect(site1Result.remote_post_id).toEqual(88);

    expect(site2Result.status).toEqual('failed');
    expect(site2Result.error).toContain('Database failure');
  });

  it('POST /api/sidebar-links/deploy should record real deployment success and error', async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('wp-site1.test')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(JSON.stringify({ success: true, message: 'Sidebar link widget updated' }))
        });
      }
      return Promise.reject(new Error('Network connection timeout'));
    });

    const res = await request(app)
      .post('/api/sidebar-links/deploy')
      .send({
        url_mode: 'same',
        client_url_text: 'https://myservice.com',
        client_keyword_text: 'Best Service',
        domain_ids: [domain1Id, domain2Id]
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.deploymentResults.length).toEqual(2);

    const site1Dep = res.body.deploymentResults.find(r => r.domain.includes('wp-site1.test'));
    const site2Dep = res.body.deploymentResults.find(r => r.domain.includes('wp-site2.test'));

    expect(site1Dep.status).toEqual('deployed');
    expect(site2Dep.status).toEqual('failed');
    expect(site2Dep.error).toContain('Network connection timeout');
  });
});
