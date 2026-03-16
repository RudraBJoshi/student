/**
 * TunnelVision Proxy Backend
 *
 * WHY WE NEED THIS:
 * Service Workers run in the browser. Even though they can intercept requests,
 * their own fetch() calls still originate from the browser's security context
 * (localhost:4600). Browsers enforce CORS on all cross-origin fetch calls —
 * including those from Service Workers — because the SW shares the page origin.
 *
 * A backend server's fetch() has NO such restriction. Node's http/fetch runs
 * outside the browser entirely, so it can fetch any URL without CORS headers.
 *
 * ARCHITECTURE:
 *
 *   Browser (page)
 *     └─ loads iframe at /student/TVP/proxy/<encoded-url>
 *          └─ Service Worker intercepts the request
 *               └─ SW calls: GET http://localhost:4601/fetch?url=<encoded-url>
 *                    └─ This server fetches the real URL (no CORS restrictions)
 *                         └─ Returns response with Access-Control-Allow-Origin: *
 *                              └─ SW receives body, rewrites HTML, returns to iframe
 *
 * Run with:  node proxy-server.js
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = 4601;

// Headers we strip from the proxied response before returning to the browser.
// These would either block embedding or reveal internals.
const STRIP_RESPONSE_HEADERS = new Set([
  'content-security-policy',
  'content-security-policy-report-only',
  'x-frame-options',
  'x-content-type-options',
  'strict-transport-security',   // Don't forward HSTS to our local dev origin
  'transfer-encoding',           // Node handles this automatically
  'connection',
  'keep-alive',
]);

const server = http.createServer((req, res) => {
  // CORS headers so the Service Worker (different port = different origin) can
  // call this endpoint. Without these, the browser would block the SW's fetch.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqURL = new URL(req.url, `http://localhost:${PORT}`);

  if (reqURL.pathname !== '/fetch') {
    res.writeHead(404);
    res.end('TunnelVision proxy server. Use: GET /fetch?url=<encoded-url>');
    return;
  }

  const targetParam = reqURL.searchParams.get('url');
  if (!targetParam) {
    res.writeHead(400);
    res.end('Missing ?url= parameter');
    return;
  }

  let targetURL;
  try {
    targetURL = new URL(decodeURIComponent(targetParam));
  } catch {
    res.writeHead(400);
    res.end('Invalid URL');
    return;
  }

  // Only allow http and https — no file://, no internal network shenanigans
  if (targetURL.protocol !== 'http:' && targetURL.protocol !== 'https:') {
    res.writeHead(400);
    res.end('Only http/https URLs are supported');
    return;
  }

  console.log(`[TunnelVision] → ${targetURL.href}`);
  proxyRequest(targetURL, req, res);
});

/**
 * The actual proxying. This is what makes the backend essential:
 * Node's http/https.request has no CORS restrictions — it's just a TCP
 * connection to port 80 or 443, same as curl or any other HTTP client.
 */
function proxyRequest(targetURL, clientReq, clientRes) {
  const isHttps = targetURL.protocol === 'https:';
  const lib = isHttps ? https : http;

  const options = {
    hostname: targetURL.hostname,
    port: targetURL.port || (isHttps ? 443 : 80),
    path: targetURL.pathname + targetURL.search,
    method: clientReq.method || 'GET',
    headers: buildForwardHeaders(targetURL),
    // Follow redirects manually so we can rewrite the Location header
    // (auto-follow would lose our proxy wrapping on redirect targets)
    timeout: 10000,
  };

  const proxyReq = lib.request(options, (proxyRes) => {
    console.log(`[TunnelVision] ← ${proxyRes.statusCode} ${targetURL.href}`);

    // Handle redirects: rewrite Location so the browser stays in the proxy
    if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
      const redirectTarget = new URL(proxyRes.headers.location, targetURL).href;
      clientRes.writeHead(302, {
        'Access-Control-Allow-Origin': '*',
        'Location': '/fetch?url=' + encodeURIComponent(redirectTarget),
        'Content-Type': 'text/plain',
      });
      clientRes.end();
      return;
    }

    // Build clean response headers
    const outHeaders = { 'Access-Control-Allow-Origin': '*' };
    for (const [key, value] of Object.entries(proxyRes.headers)) {
      if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
        outHeaders[key] = value;
      }
    }

    clientRes.writeHead(proxyRes.statusCode, outHeaders);

    // Pipe the response body directly — no buffering needed for binary content.
    // The Service Worker handles HTML/CSS rewriting on its end.
    proxyRes.pipe(clientRes);
  });

  proxyReq.on('error', (err) => {
    console.error(`[TunnelVision] Error fetching ${targetURL.href}: ${err.message}`);
    if (!clientRes.headersSent) {
      clientRes.writeHead(502, {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      });
    }
    clientRes.end(`Proxy error: ${err.message}`);
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    if (!clientRes.headersSent) {
      clientRes.writeHead(504, {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      });
    }
    clientRes.end('Gateway timeout');
  });

  // Forward request body for POST/PUT
  clientReq.pipe(proxyReq);
}

/**
 * Build headers to send to the target site.
 * We masquerade as a real browser so sites respond normally.
 */
function buildForwardHeaders(targetURL) {
  return {
    'Host': targetURL.host,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Upgrade-Insecure-Requests': '1',
    // NOT forwarding: Cookie, Authorization — don't leak credentials to arbitrary sites
    // NOT forwarding: Referer — don't reveal we're proxying
  };
}

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║   TunnelVision Proxy Backend             ║
║   http://localhost:${PORT}                  ║
╠══════════════════════════════════════════╣
║  GET /fetch?url=<encoded-url>            ║
║                                          ║
║  Keep this running alongside Jekyll.     ║
║  The Service Worker routes all requests  ║
║  through this server to bypass CORS.     ║
╚══════════════════════════════════════════╝
`);
});
