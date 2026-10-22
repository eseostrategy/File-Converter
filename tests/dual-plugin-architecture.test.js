const request = require('supertest');
const app = require('../src/app');
const { initDb, getDb } = require('../src/db');

describe('Dual Plugin Architecture & Campaign CSV Reports Tests', () => {
  let domain1Id, domain2Id;
  const originalFetch = global.fetch;

  beforeAll(async () => {
    await initDb();
    const res1 = await request(app).post('/api/domains').send({ domain: 'http://dual-plugin-site1.test' });
    const res2 = await request(app).post('/api/domains').send({ domain: 'http://dual-plugin-site2.test' });
    domain1Id = res1.body.id;
    domain2Id = res2.body.id;

    // Set statuses to connected
    const db = getDb();
    await new Promise(r => db.run("UPDATE domains SET status = 'connected', post_manager_status = 'connected', sidebar_manager_status = 'connected' WHERE id IN (?, ?)", [domain1Id, domain2Id], r));
  });

  afterAll((done) => {
    global.fetch = originalFetch;
    const db = getDb();
    db.run("DELETE FROM domains", () => {
      db.run("DELETE FROM articles", () => {
        db.run("DELETE FROM sidebar_links", () => {
          db.run("DELETE FROM sidebar_campaign_reports", done);
        });
      });
    });
  });

  it('POST /api/connection/:id/ping-post-manager should route to pbn-commander-post/v1', async () => {
    let capturedUrl = '';
    global.fetch = jest.fn().mockImplementation((url) => {
      capturedUrl = url;
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ success: true, plugin: 'PBN Commander Post Manager', version: '1.0.0' }))
      });
    });

    const res = await request(app).post(`/api/connection/${domain1Id}/ping-post-manager`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.plugin).toEqual('Post Manager');
    expect(capturedUrl).toContain('pbn-commander-post/v1/ping');
  });

  it('POST /api/connection/:id/ping-sidebar-manager should route to pbn-commander-sidebar/v1', async () => {
    let capturedUrl = '';
    global.fetch = jest.fn().mockImplementation((url) => {
      capturedUrl = url;
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ success: true, plugin: 'PBN Commander Sidebar Manager', version: '1.0.0' }))
      });
    });

    const res = await request(app).post(`/api/connection/${domain1Id}/ping-sidebar-manager`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.plugin).toEqual('Sidebar Manager');
    expect(capturedUrl).toContain('pbn-commander-sidebar/v1/ping');
  });

  it('GET /api/plugin/download/post-manager and sidebar-manager should return valid ZIP files', async () => {
    const resPost = await request(app).get('/api/plugin/download/post-manager');
    expect(resPost.statusCode).toEqual(200);
    expect(resPost.headers['content-type']).toEqual('application/zip');

    const resSidebar = await request(app).get('/api/plugin/download/sidebar-manager');
    expect(resSidebar.statusCode).toEqual(200);
    expect(resSidebar.headers['content-type']).toEqual('application/zip');
  });

  it('POST /api/sidebar-links/deploy should generate downloadable CSV campaign report', async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('dual-plugin-site1.test')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(JSON.stringify({ success: true, message: 'Sidebar link widget updated' }))
        });
      }
      return Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve(JSON.stringify({ message: 'Sidebar Manager plugin error' }))
      });
    });

    const payload = {
      campaign_name: 'Summer Campaign Reports Test',
      url_mode: 'different',
      client_url_text: 'https://client1.com\nhttps://client2.com',
      client_keyword_text: 'Keyword 1, with comma\nKeyword "with quotes"',
      domain_ids: [domain1Id, domain2Id]
    };

    const res = await request(app).post('/api/sidebar-links/deploy').send(payload);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('reportId');

    const reportId = res.body.reportId;

    // Download CSV
    const downloadRes = await request(app).get(`/api/sidebar-links/reports/${reportId}/download`);
    expect(downloadRes.statusCode).toEqual(200);
    expect(downloadRes.headers['content-type']).toContain('text/csv');
    expect(downloadRes.text).toContain('"Keyword 1, with comma"');
    expect(downloadRes.text).toContain('"Keyword ""with quotes"""');
    expect(downloadRes.text).toContain('"deployed"');
    expect(downloadRes.text).toContain('"failed"');
  });
});
