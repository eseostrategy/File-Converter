const request = require('supertest');
const app = require('../src/app');
const { initDb, getDb } = require('../src/db');

describe('Activity Logging, Bulk Task & Security Hardening Verification', () => {
  beforeAll(async () => {
    await initDb();
  });

  afterAll((done) => {
    const db = getDb();
    db.run("DELETE FROM activity_logs", () => {
      db.run("DELETE FROM tasks", done);
    });
  });

  it('GET /api/activity should return activity log entries', async () => {
    await request(app)
      .post('/api/domains')
      .send({ domain: 'activity-test-site.com' });

    const res = await request(app).get('/api/activity');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('action');
    expect(res.body[0]).toHaveProperty('status');
  });

  it('GET /api/activity/tasks should return background task queue', async () => {
    const res = await request(app).get('/api/activity/tasks');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should enforce Security Headers via Helmet', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers).toHaveProperty('x-dns-prefetch-control');
    expect(res.headers).toHaveProperty('x-frame-options');
  });
});
