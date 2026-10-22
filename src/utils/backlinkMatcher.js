const { normalizeDomain } = require('./domain');

/**
 * Normalizes and extracts a hostname key for domain matching.
 */
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

/**
 * Parses side-by-side multiline URL and Keyword text boxes.
 * - clientUrlText: one URL per line
 * - clientKeywordText: one anchor keyword per line
 * - targetDomainCount: expected number of selected domains
 * - mode: 'different' (side-by-side line pairing) or 'same' (1 URL & 1 keyword applied to all)
 */
function parseSideBySideInput(clientUrlText, clientKeywordText, targetDomainCount, mode = 'different') {
  if (mode === 'same') {
    const url = (clientUrlText || '').trim();
    const keyword = (clientKeywordText || '').trim();

    const errors = [];
    let formattedUrl = url;
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = 'https://' + url;
    }

    let isUrlValid = false;
    try {
      if (formattedUrl) {
        const u = new URL(formattedUrl);
        isUrlValid = (u.protocol === 'http:' || u.protocol === 'https:') && (u.hostname.includes('.') || u.hostname === 'localhost');
      }
    } catch {
      isUrlValid = false;
    }

    if (!url) errors.push('Missing Client URL for "Same for All" mode.');
    else if (!isUrlValid) errors.push(`Invalid Client URL: "${url}"`);

    if (!keyword) errors.push('Missing Client Keyword for "Same for All" mode.');

    const pairs = [];
    if (errors.length === 0 && targetDomainCount > 0) {
      for (let i = 0; i < targetDomainCount; i++) {
        pairs.push({
          position: i + 1,
          url: formattedUrl,
          keyword: keyword
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      pairs
    };
  }

  // 'different' mode: side-by-side line-by-line pairing
  const urlLines = (clientUrlText || '').split(/\r?\n/).map(l => l.trim());
  const keywordLines = (clientKeywordText || '').split(/\r?\n/).map(l => l.trim());

  // Filter out trailing empty lines, but preserve blank lines in between for validation
  while (urlLines.length > 0 && urlLines[urlLines.length - 1] === '') urlLines.pop();
  while (keywordLines.length > 0 && keywordLines[keywordLines.length - 1] === '') keywordLines.pop();

  const errors = [];

  if (urlLines.length !== targetDomainCount) {
    errors.push(`Client URL line count (${urlLines.length}) does not match selected domain count (${targetDomainCount}).`);
  }

  if (keywordLines.length !== targetDomainCount) {
    errors.push(`Client Keyword line count (${keywordLines.length}) does not match selected domain count (${targetDomainCount}).`);
  }

  const pairs = [];
  const maxLines = Math.max(urlLines.length, keywordLines.length, targetDomainCount);

  for (let i = 0; i < maxLines; i++) {
    const rawUrl = urlLines[i] !== undefined ? urlLines[i] : '';
    const rawKeyword = keywordLines[i] !== undefined ? keywordLines[i] : '';

    let formattedUrl = rawUrl;
    if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      formattedUrl = 'https://' + rawUrl;
    }

    let isUrlValid = false;
    try {
      if (formattedUrl) {
        const u = new URL(formattedUrl);
        isUrlValid = (u.protocol === 'http:' || u.protocol === 'https:') && (u.hostname.includes('.') || u.hostname === 'localhost');
      }
    } catch {
      isUrlValid = false;
    }

    if (i < targetDomainCount) {
      if (!rawUrl) {
        errors.push(`Line ${i + 1}: Client URL is empty.`);
      } else if (!isUrlValid) {
        errors.push(`Line ${i + 1}: Invalid Client URL "${rawUrl}".`);
      }

      if (!rawKeyword) {
        errors.push(`Line ${i + 1}: Client Keyword is empty.`);
      }

      if (isUrlValid && rawKeyword) {
        pairs.push({
          position: i + 1,
          url: formattedUrl,
          keyword: rawKeyword
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    pairs
  };
}

/**
 * Legacy support for pipe/CSV formatted bulk backlink text.
 */
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

/**
 * Resolves pasted domains against registered domains, preserving exact user line order.
 */
function matchPastedDomains(rawText, registeredDomains) {
  if (!rawText || typeof rawText !== 'string') {
    return { orderedDomains: [], matchedConnected: [], matchedDisconnected: [], unknown: [], invalid: [] };
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const registeredMap = new Map();

  registeredDomains.forEach(d => {
    const key = getHostnameKey(d.domain);
    if (key) registeredMap.set(key, d);
  });

  const orderedDomains = [];
  const matchedConnected = [];
  const matchedDisconnected = [];
  const unknown = [];
  const invalid = [];

  const seenKeys = new Set();

  lines.forEach((line, idx) => {
    const key = getHostnameKey(line);
    if (!key) {
      invalid.push({ line, index: idx + 1, reason: 'Malformed domain string' });
      return;
    }

    const reg = registeredMap.get(key);
    if (!reg) {
      unknown.push(line);
    } else if (reg.status === 'connected') {
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        matchedConnected.push(reg);
        orderedDomains.push(reg);
      }
    } else {
      matchedDisconnected.push(reg);
    }
  });

  return { orderedDomains, matchedConnected, matchedDisconnected, unknown, invalid };
}

module.exports = {
  getHostnameKey,
  parseSideBySideInput,
  parseBulkBacklinks,
  matchPastedDomains
};
