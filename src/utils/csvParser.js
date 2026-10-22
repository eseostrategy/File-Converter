const { normalizeDomain, isValidDomain } = require('./domain');
const { isSafeUrl } = require('./ssrf');

function parseDelimitedText(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return [];

  const firstLine = lines[0].toLowerCase();
  const isTsv = firstLine.includes('\t');

  function splitLine(line) {
    if (isTsv) return line.split('\t').map(s => s.trim().replace(/^["']|["']$/g, ''));

    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  }

  const hasHeader = firstLine.includes('domain') || firstLine.includes('client_url') || firstLine.includes('keyword');
  let headers = ['domain', 'client_url', 'keyword', 'label', 'notes'];
  let startIdx = 0;

  if (hasHeader) {
    const rawHeaders = splitLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, ''));
    if (rawHeaders.includes('domain')) {
      headers = rawHeaders;
      startIdx = 1;
    }
  }

  const rows = [];
  for (let i = startIdx; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    const rowObj = {};

    headers.forEach((h, idx) => {
      rowObj[h] = cols[idx] ? cols[idx].trim() : '';
    });

    if (!hasHeader && cols.length === 1) {
      rowObj.domain = cols[0];
    }

    if (rowObj.domain) {
      rows.push(rowObj);
    }
  }

  return rows;
}

function validateClientUrl(clientUrl) {
  if (!clientUrl) return true; // Optional field
  let urlStr = clientUrl.trim();
  if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
    urlStr = 'https://' + urlStr;
  }
  try {
    const u = new URL(urlStr);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    return u.hostname.includes('.') || u.hostname === 'localhost';
  } catch {
    return false;
  }
}

function normalizeClientUrl(clientUrl) {
  if (!clientUrl) return '';
  let urlStr = clientUrl.trim();
  if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
    urlStr = 'https://' + urlStr;
  }
  try {
    const u = new URL(urlStr);
    return u.toString().replace(/\/+$/, '');
  } catch {
    return clientUrl.trim();
  }
}

module.exports = {
  parseDelimitedText,
  validateClientUrl,
  normalizeClientUrl
};
