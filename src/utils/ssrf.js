const { URL } = require('url');
const net = require('net');

function isPrivateIp(ip) {
  if (!net.isIP(ip)) return false;

  // IPv4 Private & Loopback Ranges
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 10.0.0.0/8 (Private)
    if (parts[0] === 10) return true;
    // 172.16.0.0/12 (Private)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-local)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 0.0.0.0/8
    if (parts[0] === 0) return true;
  }

  // IPv6 Private & Loopback
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') return true;
    if (lower.startsWith('fe80:')) return true; // Link-local
    if (lower.startsWith('fc00:') || lower.startsWith('fd00:')) return true; // Unique local
  }

  return false;
}

function isSafeUrl(urlString) {
  if (!urlString) return false;

  try {
    const parsed = new URL(urlString);

    // Scheme must be http or https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block localhost
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
      return false;
    }

    // Check if hostname is an IP address
    if (net.isIP(hostname)) {
      if (isPrivateIp(hostname)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

module.exports = {
  isPrivateIp,
  isSafeUrl
};
