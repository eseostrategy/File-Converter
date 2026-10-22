const crypto = require('crypto');

function normalizeDomain(urlInput) {
  if (!urlInput) return '';
  let str = urlInput.trim();

  if (!str.startsWith('http://') && !str.startsWith('https://')) {
    str = 'https://' + str;
  }

  try {
    const parsed = new URL(str);
    let hostname = parsed.hostname.toLowerCase();

    if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
      hostname += `:${parsed.port}`;
    }

    let path = parsed.pathname.replace(/\/+$|^\/+/g, '');
    let finalUrl = `${parsed.protocol}//${hostname}`;
    if (path) {
      finalUrl += `/${path}`;
    }
    return finalUrl;
  } catch (err) {
    return '';
  }
}

function isValidDomain(domainUrl) {
  const normalized = normalizeDomain(domainUrl);
  if (!normalized) return false;
  try {
    const u = new URL(normalized);
    return u.hostname.includes('.') || u.hostname === 'localhost';
  } catch {
    return false;
  }
}

function generateSiteKey() {
  return 'pbn_' + crypto.randomBytes(24).toString('hex');
}

module.exports = {
  normalizeDomain,
  isValidDomain,
  generateSiteKey
};
