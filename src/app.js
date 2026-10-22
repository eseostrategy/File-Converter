const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const archiver = require('archiver');
require('dotenv').config();

const { initDb } = require('./db');
const authRoutes = require('./routes/auth');
const domainRoutes = require('./routes/domains');
const connectionRoutes = require('./routes/connection');
const articleRoutes = require('./routes/articles');
const sidebarLinkRoutes = require('./routes/sidebarLinks');
const activityRoutes = require('./routes/activity');

const app = express();

initDb().catch(err => console.error('Database initialization failed:', err));

app.use(helmet({
  contentSecurityPolicy: false
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.static(path.join(__dirname, '../public')));

// Plugin ZIP Download Handler for Post Manager & Sidebar Manager
function servePluginZip(pluginFolder, zipFilename, res) {
  const pluginDir = path.join(__dirname, '../wordpress-plugin', pluginFolder);
  const zipPath = path.join(__dirname, '../wordpress-plugin', zipFilename);

  if (fs.existsSync(zipPath)) {
    return res.download(zipPath, zipFilename);
  }

  if (!fs.existsSync(pluginDir)) {
    return res.status(404).json({ error: `Plugin source directory ${pluginFolder} not found` });
  }

  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    res.download(zipPath, zipFilename);
  });

  archive.on('error', (err) => {
    res.status(500).json({ error: 'Failed to create plugin ZIP package: ' + err.message });
  });

  archive.pipe(output);
  archive.directory(pluginDir, pluginFolder);
  archive.finalize();
}

app.get('/api/plugin/download/post-manager', (req, res) => {
  servePluginZip('pbn-commander-post-manager', 'pbn-commander-post-manager.zip', res);
});

app.get('/api/plugin/download/sidebar-manager', (req, res) => {
  servePluginZip('pbn-commander-sidebar-manager', 'pbn-commander-sidebar-manager.zip', res);
});

// Legacy single download route redirecting to Post Manager
app.get('/api/plugin/download', (req, res) => {
  servePluginZip('pbn-commander-post-manager', 'pbn-commander-post-manager.zip', res);
});

app.use('/api/auth', authRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/connection', connectionRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/sidebar-links', sidebarLinkRoutes);
app.use('/api/activity', activityRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PBN Commander',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
