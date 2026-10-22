const request = require('supertest');
const app = require('../src/app');
const { initDb, getDb } = require('../src/db');

describe('CSV/TSV Bulk Preview, Import & Domain CRUD API Tests', () => {
  beforeAll(async () => {
    await initDb();
  });

  afterEach((done) => {
    const db = getDb();
    db.run("DELETE FROM domains", done);
  });

  it('POST /api/domains/bulk-preview should parse CSV and return row-level preview statuses', async () => {
    // Add existing domain to test duplicate detection
    await request(app).post('/api/domains').send({ domain: 'existing-site.com' });

    const csvData = `domain,client_url,keyword,label,notes
existing-site.com,https://client1.com,SEO Keyword 1,Label A,Note 1
new-site.org,client2.com,SEO Keyword 2,Label B,Note 2
invalid-domain-str,https://client3.com,SEO Keyword 3,Label C,Note 3`;

    const res = await request(app)
      .post('/api/domains/bulk-preview')
      .send({ rawText: csvData });

    expect(res.statusCode).toEqual(200);
    expect(res.body.totalRows).toEqual(3);
    expect(res.body.validCount).toEqual(1);
    expect(res.body.duplicateCount).toEqual(1);
    expect(res.body.invalidCount).toEqual(1);

    expect(res.body.previewItems[0].status).toEqual('duplicate');
    expect(res.body.previewItems[1].status).toEqual('valid');
    expect(res.body.previewItems[1].client_url).toEqual('https://client2.com');
    expect(res.body.previewItems[2].status).toEqual('invalid');
  });

  it('POST /api/domains/bulk should import valid previewed rows with client_url and keyword', async () => {
    const rowsToImport = [
      { domain: 'bulk1.com', client_url: 'https://clientA.com', keyword: 'Rank 1', label: 'Batch A' },
      { domain: 'bulk2.com', client_url: 'clientB.com', keyword: 'Rank 2', label: 'Batch B' }
    ];

    const res = await request(app)
      .post('/api/domains/bulk')
      .send({ rows: rowsToImport });

    expect(res.statusCode).toEqual(200);
    expect(res.body.addedCount).toEqual(2);

    const listRes = await request(app).get('/api/domains');
    expect(listRes.body.length).toEqual(2);
    expect(listRes.body[0].client_url).toContain('client');
    expect(listRes.body[0].keyword).toBeDefined();
  });

  it('POST /api/domains and PUT /api/domains/:id should manage client_url and keyword individually', async () => {
    const createRes = await request(app)
      .post('/api/domains')
      .send({
        domain: 'singlesite.com',
        label: 'Single Label',
        client_url: 'https://myclient.com',
        keyword: 'Primary Keyword'
      });

    expect(createRes.statusCode).toEqual(200);
    expect(createRes.body.client_url).toEqual('https://myclient.com');
    expect(createRes.body.keyword).toEqual('Primary Keyword');

    const domainId = createRes.body.id;

    const updateRes = await request(app)
      .put(`/api/domains/${domainId}`)
      .send({
        label: 'Updated Label',
        client_url: 'https://newclient.com',
        keyword: 'Updated Keyword'
      });

    expect(updateRes.statusCode).toEqual(200);

    const searchRes = await request(app).get('/api/domains?search=Updated Keyword');
    expect(searchRes.body.length).toEqual(1);
    expect(searchRes.body[0].client_url).toEqual('https://newclient.com');
  });
});
