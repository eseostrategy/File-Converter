const crypto = require('crypto');

function generateHmacHeaders(payload, siteKey) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyString = typeof payload === 'object' ? JSON.stringify(payload) : (payload || '');
  const signature = crypto
    .createHmac('sha256', siteKey)
    .update(`${timestamp}.${bodyString}`)
    .digest('hex');

  return {
    'Content-Type': 'application/json',
    'X-PBN-Timestamp': timestamp,
    'X-PBN-Signature': signature
  };
}

function verifyHmacRequest(req, siteKey) {
  const timestamp = req.headers['x-pbn-timestamp'];
  const signature = req.headers['x-pbn-signature'];

  if (!timestamp || !signature) return false;

  if (Math.abs(Math.floor(Date.now() / 1000) - parseInt(timestamp, 10)) > 300) {
    return false;
  }

  const bodyString = typeof req.body === 'object' ? JSON.stringify(req.body) : (req.body || '');
  const expected = crypto
    .createHmac('sha256', siteKey)
    .update(`${timestamp}.${bodyString}`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

module.exports = {
  generateHmacHeaders,
  verifyHmacRequest
};
