const request = require('supertest');
const app = require('../src/app');
const { initDb, getDb } = require('../src/db');

describe('Domain Management REST API', () => {
  beforeAll(async () => {
    await initDb();
  });

  afterEach((done) => {
    const db = getDb();
    db.run("DELETE FROM domains", done);
  });

  it('POST /api/domains should create a new domain with normalized URL', async () => {
    const res = await request(app)
      .post('/api/domains')
      .send({ domain: 'example.com', label: 'PBN Site 1', notes: 'Testing note' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.domain).toEqual('https://example.com');
    expect(res.body).toHaveProperty('site_key');
  });

  it('POST /api/domains should reject invalid domain format', async () => {
    const res = await request(app)
      .post('/api/domains')
      .send({ domain: 'invalid-domain-string' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/domains should reject duplicate domain', async () => {
    await request(app).post('/api/domains').send({ domain: 'testdomain.com' });
    const res = await request(app).post('/api/domains').send({ domain: 'testdomain.com' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toContain('already exists');
  });

  it('POST /api/domains/bulk should import multiple domains ignoring duplicates', async () => {
    const res = await request(app)
      .post('/api/domains/bulk')
      .send({
        domains: ['site1.org', 'site2.org', 'site1.org', 'invalid-domain'],
        label: 'Batch 1'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.addedCount).toEqual(2);
    expect(res.body.duplicateCount).toEqual(1);
    expect(res.body.invalidCount).toEqual(1);
  });

  it('GET /api/domains should list and filter domains', async () => {
    await request(app).post('/api/domains').send({ domain: 'techblog.com', label: 'Tech' });
    await request(app).post('/api/domains').send({ domain: 'healthblog.com', label: 'Health' });

    const res = await request(app).get('/api/domains?search=Tech');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].domain).toEqual('https://techblog.com');
  });

  it('DELETE /api/domains/:id should delete a domain', async () => {
    const createRes = await request(app).post('/api/domains').send({ domain: 'delete-me.com' });
    const id = createRes.body.id;

    const deleteRes = await request(app).delete(`/api/domains/${id}`);
    expect(deleteRes.statusCode).toEqual(200);

    const listRes = await request(app).get('/api/domains');
    expect(listRes.body.length).toEqual(0);
  });
});
