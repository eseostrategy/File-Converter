const { normalizeDomain } = require('./domain');

function parseBulkBacklinks(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { validPairs: [], invalidLines: [] };
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const validPairs = [];
  const invalidLines = [];

  lines.forEach((line, index) => {
    let url = '';
    let keyword = '';

    if (line.includes('|')) {
      const parts = line.split('|');
      url = parts[0].trim();
      keyword = parts.slice(1).join('|').trim();
    } else if (line.includes(',')) {
      const parts = line.split(',');
      url = parts[0].trim();
      keyword = parts.slice(1).join(',').trim();
    } else if (line.includes('\t')) {
      const parts = line.split('\t');
      url = parts[0].trim();
      keyword = parts.slice(1).join('\t').trim();
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    let isUrlValid = false;
    try {
      const u = new URL(url);
      isUrlValid = (u.protocol === 'http:' || u.protocol === 'https:') && (u.hostname.includes('.') || u.hostname === 'localhost');
    } catch {
      isUrlValid = false;
    }

    if (isUrlValid && keyword.length > 0) {
      validPairs.push({
        lineNumber: index + 1,
        rawLine: line,
        url,
        keyword
      });
    } else {
      invalidLines.push({
        lineNumber: index + 1,
        rawLine: line,
        error: !isUrlValid ? 'Invalid HTTP/HTTPS URL' : 'Missing anchor keyword'
      });
    }
  });

  return { validPairs, invalidLines };
}

function getHostnameKey(domainStr) {
  if (!domainStr) return '';
  try {
    const norm = normalizeDomain(domainStr);
    const u = new URL(norm);
    if (!u.hostname || u.hostname.includes(' ') || !u.hostname.includes('.')) {
      return '';
    }
    return u.hostname.toLowerCase();
  } catch {
    return '';
  }
}

function matchPastedDomains(rawText, registeredDomains) {
  if (!rawText || typeof rawText !== 'string') {
    return { matchedConnected: [], matchedDisconnected: [], unknown: [], invalid: [] };
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const registeredMap = new Map();

  registeredDomains.forEach(d => {
    const key = getHostnameKey(d.domain);
    if (key) registeredMap.set(key, d);
  });

  const matchedConnected = [];
  const matchedDisconnected = [];
  const unknown = [];
  const invalid = [];

  lines.forEach(line => {
    const key = getHostnameKey(line);
    if (!key) {
      invalid.push(line);
      return;
    }

    const reg = registeredMap.get(key);
    if (!reg) {
      unknown.push(line);
    } else if (reg.status === 'connected') {
      matchedConnected.push(reg);
    } else {
      matchedDisconnected.push(reg);
    }
  });

  return { matchedConnected, matchedDisconnected, unknown, invalid };
}

module.exports = {
  parseBulkBacklinks,
  matchPastedDomains
};
