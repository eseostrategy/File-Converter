const { initDb, getDb } = require('../src/db');

describe('Database Schema Initialization & Column Migration', () => {
  let db;

  beforeAll(async () => {
    db = await initDb();
  });

  it('should create all required tables', (done) => {
    const expectedTables = [
      'users',
      'domains',
      'articles',
      'publishing_history',
      'sidebar_links',
      'sidebar_link_deployments',
      'tasks',
      'activity_logs'
    ];

    db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, rows) => {
      expect(err).toBeNull();
      const tableNames = rows.map(r => r.name);
      expectedTables.forEach(table => {
        expect(tableNames).toContain(table);
      });
      done();
    });
  });

  it('should verify domains table contains client_url and keyword columns', (done) => {
    db.all("PRAGMA table_info(domains);", (err, columns) => {
      expect(err).toBeNull();
      const names = columns.map(c => c.name);
      expect(names).toContain('client_url');
      expect(names).toContain('keyword');
      done();
    });
  });
});
