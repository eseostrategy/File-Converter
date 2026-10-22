const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { getDb } = require('../db');
const { generateHmacHeaders } = require('../utils/security');

router.get('/download', (req, res) => {
  const zipPath = path.join(__dirname, '../../wordpress-plugin/pbn-commander-client.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'pbn-commander-client.zip');
  } else {
    res.status(404).json({ error: 'Plugin package zip file not found' });
  }
});

module.exports = router;
