const { generateHmacHeaders } = require('./security');
const { isSafeUrl } = require('./ssrf');

const DEFAULT_TIMEOUT_MS = 10000; // 10s default timeout

async function sendWpRequest(domainUrl, endpointPath, payload, siteKey, restNamespace = 'pbn-commander/v1', options = {}) {
  const timeoutMs = options.timeout || DEFAULT_TIMEOUT_MS;

  if (!domainUrl || !siteKey) {
    return { success: false, error: 'Missing domain URL or site API key' };
  }

  // SSRF Check
  const normalizedBase = domainUrl.replace(/\/+$/, '');
  if (process.env.NODE_ENV !== 'test' && !isSafeUrl(normalizedBase)) {
    return { success: false, error: 'Blocked attempt to send HTTP request to private/internal network address' };
  }

  const fullUrl = `${normalizedBase}/wp-json/${restNamespace}${endpointPath}`;
  const bodyString = typeof payload === 'object' ? JSON.stringify(payload) : (payload || '');
  const headers = generateHmacHeaders(payload, siteKey);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: bodyString,
      signal: controller.signal
    });

    clearTimeout(timer);

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { rawText: responseText };
    }

    if (!response.ok) {
      const errorMsg = responseData.message || responseData.error || `HTTP ${response.status} ${response.statusText}`;
      return {
        success: false,
        status: response.status,
        error: errorMsg,
        data: responseData
      };
    }

    return {
      success: true,
      status: response.status,
      data: responseData
    };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return { success: false, error: `Connection timed out after ${timeoutMs}ms` };
    }
    return { success: false, error: `Network error: ${err.message}` };
  }
}

module.exports = {
  sendWpRequest
};
