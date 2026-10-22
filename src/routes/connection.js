const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

// Download Plugin ZIP (Auto-generate if missing)
router.get('/download', (req, res) => {
  const pluginDir = path.join(__dirname, '../../wordpress-plugin/pbn-commander-client');
  const zipPath = path.join(__dirname, '../../wordpress-plugin/pbn-commander-client.zip');

  if (fs.existsSync(zipPath)) {
    return res.download(zipPath, 'pbn-commander-client.zip');
  }

  if (!fs.existsSync(pluginDir)) {
    return res.status(404).json({ error: 'Plugin source directory not found' });
  }

  // Create zip file at runtime
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    res.download(zipPath, 'pbn-commander-client.zip');
  });

  archive.on('error', (err) => {
    res.status(500).json({ error: 'Failed to create plugin ZIP package: ' + err.message });
  });

  archive.pipe(output);
  archive.directory(pluginDir, 'pbn-commander-client');
  archive.finalize();
});

module.exports = router;
