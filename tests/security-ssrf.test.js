const { isPrivateIp, isSafeUrl } = require('../src/utils/ssrf');
const request = require('supertest');
const app = require('../src/app');
const { initDb, getDb } = require('../src/db');

describe('SSRF Protection & Key Masking Security Tests', () => {
  beforeAll(async () => {
    await initDb();
  });

  afterEach((done) => {
    const db = getDb();
    db.run("DELETE FROM domains", done);
  });

  it('should detect private and loopback IPv4/IPv6 addresses', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true);
    expect(isPrivateIp('10.0.0.5')).toBe(true);
    expect(isPrivateIp('172.16.0.1')).toBe(true);
    expect(isPrivateIp('192.168.1.100')).toBe(true);
    expect(isPrivateIp('169.254.1.1')).toBe(true);
    expect(isPrivateIp('::1')).toBe(true);

    expect(isPrivateIp('8.8.8.8')).toBe(false);
    expect(isPrivateIp('1.1.1.1')).toBe(false);
  });

  it('should validate URLs and block unsafe/private hostnames', () => {
    expect(isSafeUrl('http://127.0.0.1')).toBe(false);
    expect(isSafeUrl('http://localhost')).toBe(false);
    expect(isSafeUrl('http://10.0.0.1/wp-json')).toBe(false);
    expect(isSafeUrl('file:///etc/passwd')).toBe(false);
    expect(isSafeUrl('gopher://example.com')).toBe(false);

    expect(isSafeUrl('https://my-wordpress-blog.com')).toBe(true);
    expect(isSafeUrl('http://my-pbn-site.org/blog')).toBe(true);
  });

  it('GET /api/domains should NOT expose site_key', async () => {
    await request(app).post('/api/domains').send({ domain: 'publicsite.com' });

    const listRes = await request(app).get('/api/domains');
    expect(listRes.statusCode).toEqual(200);
    expect(listRes.body.length).toEqual(1);
    expect(listRes.body[0]).not.toHaveProperty('site_key');
  });

  it('GET /api/domains/:id/key should return site_key for explicit request', async () => {
    const createRes = await request(app).post('/api/domains').send({ domain: 'keysite.com' });
    const domainId = createRes.body.id;

    const keyRes = await request(app).get(`/api/domains/${domainId}/key`);
    expect(keyRes.statusCode).toEqual(200);
    expect(keyRes.body).toHaveProperty('site_key');
    expect(keyRes.body.site_key).toContain('pbn_');
  });
});
