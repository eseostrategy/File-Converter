const request = require('supertest');
const app = require('../src/app');
const { initDb, getDb } = require('../src/db');
const { generateHmacHeaders, verifyHmacRequest } = require('../src/utils/security');

describe('WordPress Plugin Communication & Security Protocols', () => {
  const originalFetch = global.fetch;

  beforeAll(async () => {
    await initDb();
  });

  afterEach((done) => {
    global.fetch = originalFetch;
    const db = getDb();
    db.run("DELETE FROM domains", done);
  });

  it('should generate valid HMAC headers and verify signature successfully', () => {
    const siteKey = 'pbn_test_secret_key_12345';
    const payload = { title: 'Test Article', content: 'Hello World' };

    const headers = generateHmacHeaders(payload, siteKey);
    expect(headers).toHaveProperty('X-PBN-Timestamp');
    expect(headers).toHaveProperty('X-PBN-Signature');

    const mockReq = {
      headers: {
        'x-pbn-timestamp': headers['X-PBN-Timestamp'],
        'x-pbn-signature': headers['X-PBN-Signature']
      },
      body: payload
    };

    const isValid = verifyHmacRequest(mockReq, siteKey);
    expect(isValid).toBe(true);
  });

  it('should reject HMAC signature if body is tampered with', () => {
    const siteKey = 'pbn_test_secret_key_12345';
    const payload = { title: 'Original Content' };
    const headers = generateHmacHeaders(payload, siteKey);

    const tamperedReq = {
      headers: {
        'x-pbn-timestamp': headers['X-PBN-Timestamp'],
        'x-pbn-signature': headers['X-PBN-Signature']
      },
      body: { title: 'Tampered Content' }
    };

    const isValid = verifyHmacRequest(tamperedReq, siteKey);
    expect(isValid).toBe(false);
  });

  it('POST /api/domains/:id/ping should update domain status to connected when WP returns success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ success: true, message: 'Connection successful' }))
    });

    const createRes = await request(app)
      .post('/api/domains')
      .send({ domain: 'wp-client-site.com', label: 'WP' });

    const domainId = createRes.body.id;

    const pingRes = await request(app).post(`/api/domains/${domainId}/ping`);
    expect(pingRes.statusCode).toEqual(200);
    expect(pingRes.body.status).toEqual('connected');

    const listRes = await request(app).get('/api/domains');
    expect(listRes.body[0].status).toEqual('connected');
  });

  it('GET /api/plugin/download should serve the client plugin zip file', async () => {
    const res = await request(app).get('/api/plugin/download');
    expect(res.statusCode).toEqual(200);
    expect(res.header['content-type']).toContain('application/zip');
  });
});
