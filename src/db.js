const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '../pbn_commander.db');
const db = new sqlite3.Database(dbPath);

function runAsync(sql, params = []) {
  return new Promise((resolve) => {
    db.run(sql, params, function (err) {
      resolve(err);
    });
  });
}

function getTableColumns(tableName) {
  return new Promise((resolve) => {
    db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
      if (err || !rows) resolve([]);
      else resolve(rows.map(r => r.name));
    });
  });
}

async function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      // 1. Users Table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'admin',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 2. Domains Table (with independent plugin status columns)
      db.run(`
        CREATE TABLE IF NOT EXISTS domains (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          domain TEXT UNIQUE NOT NULL,
          site_key TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          post_manager_status TEXT NOT NULL DEFAULT 'pending',
          sidebar_manager_status TEXT NOT NULL DEFAULT 'pending',
          label TEXT,
          notes TEXT,
          client_url TEXT,
          keyword TEXT,
          last_check DATETIME,
          post_manager_last_check DATETIME,
          sidebar_manager_last_check DATETIME,
          last_sync DATETIME,
          last_error TEXT,
          post_manager_error TEXT,
          sidebar_manager_error TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      let cols = await getTableColumns('domains');
      if (!cols.includes('client_url')) await runAsync(`ALTER TABLE domains ADD COLUMN client_url TEXT`);
      if (!cols.includes('keyword')) await runAsync(`ALTER TABLE domains ADD COLUMN keyword TEXT`);
      if (!cols.includes('post_manager_status')) await runAsync(`ALTER TABLE domains ADD COLUMN post_manager_status TEXT DEFAULT 'pending'`);
      if (!cols.includes('sidebar_manager_status')) await runAsync(`ALTER TABLE domains ADD COLUMN sidebar_manager_status TEXT DEFAULT 'pending'`);
      if (!cols.includes('post_manager_last_check')) await runAsync(`ALTER TABLE domains ADD COLUMN post_manager_last_check DATETIME`);
      if (!cols.includes('sidebar_manager_last_check')) await runAsync(`ALTER TABLE domains ADD COLUMN sidebar_manager_last_check DATETIME`);
      if (!cols.includes('post_manager_error')) await runAsync(`ALTER TABLE domains ADD COLUMN post_manager_error TEXT`);
      if (!cols.includes('sidebar_manager_error')) await runAsync(`ALTER TABLE domains ADD COLUMN sidebar_manager_error TEXT`);

      // 3. Articles Table
      db.run(`
        CREATE TABLE IF NOT EXISTS articles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          article_mode TEXT DEFAULT 'normal',
          spin_strategy TEXT DEFAULT 'per_domain',
          url_mode TEXT DEFAULT 'different',
          categories TEXT,
          tags TEXT,
          featured_image TEXT,
          canonical_url TEXT,
          status TEXT NOT NULL DEFAULT 'draft',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      cols = await getTableColumns('articles');
      if (!cols.includes('article_mode')) await runAsync(`ALTER TABLE articles ADD COLUMN article_mode TEXT DEFAULT 'normal'`);
      if (!cols.includes('spin_strategy')) await runAsync(`ALTER TABLE articles ADD COLUMN spin_strategy TEXT DEFAULT 'per_domain'`);
      if (!cols.includes('url_mode')) await runAsync(`ALTER TABLE articles ADD COLUMN url_mode TEXT DEFAULT 'different'`);

      // 4. Publishing History Table
      db.run(`
        CREATE TABLE IF NOT EXISTS publishing_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          article_id INTEGER NOT NULL,
          domain_id INTEGER NOT NULL,
          backlink_url TEXT,
          backlink_keyword TEXT,
          spun_content TEXT,
          remote_post_id INTEGER,
          remote_post_url TEXT,
          status TEXT NOT NULL,
          error_message TEXT,
          published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
          FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
        )
      `);

      cols = await getTableColumns('publishing_history');
      if (!cols.includes('backlink_url')) await runAsync(`ALTER TABLE publishing_history ADD COLUMN backlink_url TEXT`);
      if (!cols.includes('backlink_keyword')) await runAsync(`ALTER TABLE publishing_history ADD COLUMN backlink_keyword TEXT`);
      if (!cols.includes('spun_content')) await runAsync(`ALTER TABLE publishing_history ADD COLUMN spun_content TEXT`);

      // 5. Sidebar Links Table
      db.run(`
        CREATE TABLE IF NOT EXISTS sidebar_links (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          campaign_name TEXT,
          url TEXT NOT NULL,
          anchor_text TEXT NOT NULL,
          url_mode TEXT DEFAULT 'different',
          rel TEXT DEFAULT 'dofollow',
          target TEXT DEFAULT '_blank',
          widget_title TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      cols = await getTableColumns('sidebar_links');
      if (!cols.includes('url_mode')) await runAsync(`ALTER TABLE sidebar_links ADD COLUMN url_mode TEXT DEFAULT 'different'`);

      // 6. Sidebar Link Deployments Table
      db.run(`
        CREATE TABLE IF NOT EXISTS sidebar_link_deployments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          link_id INTEGER NOT NULL,
          domain_id INTEGER NOT NULL,
          assigned_url TEXT,
          assigned_keyword TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          error_message TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (link_id) REFERENCES sidebar_links(id) ON DELETE CASCADE,
          FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
          UNIQUE(link_id, domain_id)
        )
      `);

      cols = await getTableColumns('sidebar_link_deployments');
      if (!cols.includes('assigned_url')) await runAsync(`ALTER TABLE sidebar_link_deployments ADD COLUMN assigned_url TEXT`);
      if (!cols.includes('assigned_keyword')) await runAsync(`ALTER TABLE sidebar_link_deployments ADD COLUMN assigned_keyword TEXT`);

      // 7. Sidebar Campaign Reports Table (for CSV export downloads)
      db.run(`
        CREATE TABLE IF NOT EXISTS sidebar_campaign_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          link_id INTEGER NOT NULL,
          campaign_name TEXT,
          total_targets INTEGER DEFAULT 0,
          success_count INTEGER DEFAULT 0,
          failed_count INTEGER DEFAULT 0,
          report_csv TEXT NOT NULL,
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (link_id) REFERENCES sidebar_links(id) ON DELETE CASCADE
        )
      `);

      // 8. Background Tasks Table
      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_type TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          total_items INTEGER DEFAULT 0,
          completed_items INTEGER DEFAULT 0,
          failed_items INTEGER DEFAULT 0,
          details TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 9. Activity Logs Table
      db.run(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT NOT NULL,
          domain TEXT,
          status TEXT NOT NULL,
          details TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('[DB Init Error]', err);
          reject(err);
        } else {
          resolve(db);
        }
      });
    });
  });
}

function getDb() {
  return db;
}

module.exports = {
  db,
  initDb,
  getDb
};
