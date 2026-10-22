const request = require('supertest');
const app = require('../src/app');
const { initDb, getDb } = require('../src/db');

describe('Article Backlink Publishing & Domain Matcher API Integration Tests', () => {
  let domain1Id, domain2Id;
  const originalFetch = global.fetch;

  beforeAll(async () => {
    await initDb();
    const res1 = await request(app).post('/api/domains').send({ domain: 'http://pbn-connected1.test' });
    const res2 = await request(app).post('/api/domains').send({ domain: 'http://pbn-connected2.test' });
    domain1Id = res1.body.id;
    domain2Id = res2.body.id;

    // Set status to connected
    const db = getDb();
    await new Promise(res => db.run(`UPDATE domains SET status = 'connected'`, res));
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

  it('POST /api/articles/match-domains should match pasted domain text against registered connected domains', async () => {
    const res = await request(app)
      .post('/api/articles/match-domains')
      .send({ rawDomainsText: 'pbn-connected1.test\nunknown-domain.com' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.matchedConnected.length).toEqual(1);
    expect(res.body.matchedConnected[0].domain).toEqual('http://pbn-connected1.test');
    expect(res.body.unknown.length).toEqual(1);
    expect(res.body.unknown[0]).toEqual('unknown-domain.com');
  });

  it('POST /api/articles/preview should detect count mismatch for side-by-side line pairing', async () => {
    const res = await request(app)
      .post('/api/articles/preview')
      .send({
        content: '<p>Article content</p>',
        url_mode: 'different',
        client_url_text: 'https://client1.com',
        client_keyword_text: 'Keyword 1\nKeyword 2',
        domain_ids: [domain1Id, domain2Id]
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toContain('validation failed');
  });

  it('POST /api/articles/publish with side-by-side backlinks should map 1-to-1 deterministically and publish to WP', async () => {
    let capturedRequests = [];
    global.fetch = jest.fn().mockImplementation((url, opts) => {
      capturedRequests.push({ url, body: JSON.parse(opts.body) });
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ success: true, post_id: 555, post_url: `${url}/?p=555` }))
      });
    });

    const payload = {
      title: 'Bulk Backlink Article',
      content: '<p>Content body</p>',
      domain_ids: [domain1Id, domain2Id],
      url_mode: 'different',
      client_url_text: 'https://clientA.com\nhttps://clientB.com',
      client_keyword_text: 'Anchor A\nAnchor B'
    };

    const res = await request(app).post('/api/articles/publish').send(payload);

    expect(res.statusCode).toEqual(200);
    expect(res.body.results.length).toEqual(2);

    expect(capturedRequests[0].body.backlink_url).toEqual('https://clientA.com');
    expect(capturedRequests[0].body.backlink_keyword).toEqual('Anchor A');

    expect(capturedRequests[1].body.backlink_url).toEqual('https://clientB.com');
    expect(capturedRequests[1].body.backlink_keyword).toEqual('Anchor B');
  });
});
