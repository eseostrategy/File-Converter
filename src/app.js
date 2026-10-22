const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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

app.use('/api/auth', authRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/connection', connectionRoutes);
app.use('/api/plugin', connectionRoutes);
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
