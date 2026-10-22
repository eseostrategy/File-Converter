const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// GET /api/activity — Fetch activity logs
router.get('/', (req, res) => {
  const db = getDb();
  db.all(`SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch activity logs' });
    res.json(rows);
  });
});

// GET /api/activity/tasks — Fetch task queue
router.get('/tasks', (req, res) => {
  const db = getDb();
  db.all(`SELECT * FROM tasks ORDER BY created_at DESC LIMIT 50`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch tasks' });
    res.json(rows);
  });
});

module.exports = router;
