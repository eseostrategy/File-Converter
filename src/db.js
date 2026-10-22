const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '../pbn_commander.db');
const db = new sqlite3.Database(dbPath);

function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
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

      // 2. Domains Table
      db.run(`
        CREATE TABLE IF NOT EXISTS domains (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          domain TEXT UNIQUE NOT NULL,
          site_key TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          label TEXT,
          notes TEXT,
          client_url TEXT,
          keyword TEXT,
          last_check DATETIME,
          last_sync DATETIME,
          last_error TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Safe migration for existing SQLite databases without erasing records
      db.all(`PRAGMA table_info(domains)`, (err, columns) => {
        if (!err && columns) {
          const colNames = columns.map(c => c.name);
          if (!colNames.includes('client_url')) {
            db.run(`ALTER TABLE domains ADD COLUMN client_url TEXT`);
          }
          if (!colNames.includes('keyword')) {
            db.run(`ALTER TABLE domains ADD COLUMN keyword TEXT`);
          }
        }
      });

      // 3. Articles Table
      db.run(`
        CREATE TABLE IF NOT EXISTS articles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          categories TEXT,
          tags TEXT,
          featured_image TEXT,
          canonical_url TEXT,
          status TEXT NOT NULL DEFAULT 'draft',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 4. Publishing History Table
      db.run(`
        CREATE TABLE IF NOT EXISTS publishing_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          article_id INTEGER NOT NULL,
          domain_id INTEGER NOT NULL,
          remote_post_id INTEGER,
          remote_post_url TEXT,
          status TEXT NOT NULL,
          error_message TEXT,
          published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
          FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
        )
      `);

      // 5. Sidebar Links Table
      db.run(`
        CREATE TABLE IF NOT EXISTS sidebar_links (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          campaign_name TEXT,
          url TEXT NOT NULL,
          anchor_text TEXT NOT NULL,
          rel TEXT DEFAULT 'dofollow',
          target TEXT DEFAULT '_blank',
          widget_title TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 6. Sidebar Link Deployments Table
      db.run(`
        CREATE TABLE IF NOT EXISTS sidebar_link_deployments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          link_id INTEGER NOT NULL,
          domain_id INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          error_message TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (link_id) REFERENCES sidebar_links(id) ON DELETE CASCADE,
          FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
          UNIQUE(link_id, domain_id)
        )
      `);

      // 7. Background Tasks Table
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

      // 8. Activity Logs Table
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
