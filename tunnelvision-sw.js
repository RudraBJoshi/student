/**
 * TunnelVision Service Worker
 *
 * HOW A PROXY WORKS (educational breakdown):
 *
 * A web proxy sits between your browser and the internet.
 * Instead of your browser fetching example.com directly,
 * it asks the proxy to fetch it, which then returns the content.
 *
 * A Service Worker is a script that runs in the background and can
 * INTERCEPT every network request your page makes — this is the
 * same mechanism modern web proxies (like Ultraviolet) use.
 *
 * Request flow:
 *   Browser → Service Worker (intercepts) → fetch(target URL) → returns response
 *
 * The key challenges proxies solve:
 *   1. CORS — browsers block cross-origin requests; a proxy bypasses this
 *      because the fetch happens outside the normal browser context
 *   2. URL rewriting — links inside the page need to be rewritten so they
 *      also go through the proxy, not back to the real site directly
 *   3. Header stripping — some security headers (CSP, X-Frame-Options)
 *      block embedding; a proxy removes these
 */

// Derive the proxy prefix from the SW's own scope.
// If scope is /student/TVP/, prefix becomes /student/TVP/proxy/
// This means the SW works regardless of the Jekyll baseurl.
let PROXY_PREFIX = '';
// The backend URL — the Node server that does the actual fetching.
// CORS prevents the SW from fetching arbitrary URLs directly (the SW
// shares the browser's origin). The backend has no such restriction.
let BACKEND_URL = 'http://localhost:4601';

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_CONFIG') {
    PROXY_PREFIX = event.data.proxyPrefix;
    if (event.data.backendURL) BACKEND_URL = event.data.backendURL;
  }
});

// Install — cache the bare minimum needed to work offline
self.addEventListener('install', (event) => {
  console.log('[TunnelVision SW] Installed');
  self.skipWaiting(); // Activate immediately, don't wait for old SW to die
});

// Activate — take control of all pages immediately
self.addEventListener('activate', (event) => {
  console.log('[TunnelVision SW] Activated');
  event.waitUntil(self.clients.claim());
});

/**
 * The core of how a proxy works: intercepting fetch events.
 *
 * When any page controlled by this SW makes a network request,
 * this fires first. We can:
 *   - Let it through normally (respondWith nothing)
 *   - Block it entirely
 *   - Modify the request
 *   - Fetch something completely different and return THAT
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only intercept requests going through our proxy prefix.
  // PROXY_PREFIX is set at registration time via postMessage.
  // Fall back to scope-derived prefix if message hasn't arrived yet.
  const prefix = PROXY_PREFIX || (new URL(self.registration.scope).pathname + 'proxy/');
  if (!url.pathname.startsWith(prefix)) return;

  // Decode the target URL from the path:
  // If it's a passthrough asset (image/font/etc), redirect the browser to the
  // real URL directly — no need to go through the Flask backend.
  // /student/TVP/proxy/https://example.com/page → https://example.com/page
  const encoded = url.pathname.replace(prefix, '');
  let targetURL;
  try {
    targetURL = decodeURIComponent(encoded) + url.search;
  } catch {
    event.respondWith(new Response('Bad URL', { status: 400 }));
    return;
  }

  // Assets (images, fonts, media) can load cross-origin without a proxy.
  // Redirect to the real URL so CDNs serve them directly — no Flask, no 429s.
  if (isPassthrough(targetURL)) {
    event.respondWith(Response.redirect(targetURL, 302));
    return;
  }

  event.respondWith(proxyFetch(targetURL, event.request));
});

/**
 * proxyFetch — the actual proxying logic.
 *
 * This demonstrates what a proxy server does on every request:
 *   1. Forward the request (with appropriate headers)
 *   2. Receive the response
 *   3. Strip problematic headers (CSP, X-Frame-Options)
 *   4. Rewrite the response body (URLs inside HTML/CSS/JS)
 *   5. Return the modified response to the browser
 */
async function proxyFetch(targetURL, originalRequest) {
  console.log(`[TunnelVision] Proxying: ${targetURL}`);

  // Route through the backend server instead of fetching directly.
  //
  // WHY: fetch() in a Service Worker is still subject to CORS because the SW
  // shares the page's origin (localhost:4600). The browser enforces CORS on
  // all cross-origin requests regardless of where they originate within the
  // browser context.
  //
  // The backend (localhost:4601) runs in Node — outside the browser entirely.
  // Node's http.request() is a raw TCP connection; CORS is a browser concept
  // and simply doesn't exist there. The backend adds Access-Control-Allow-Origin: *
  // so the SW can read the response.
  const backendRequest = `${BACKEND_URL}/fetch?url=${encodeURIComponent(targetURL)}`;

  let response;
  try {
    response = await fetch(backendRequest, {
      method: originalRequest.method,
      credentials: 'omit',
    });
  } catch (err) {
    return new Response(errorPage(targetURL, `Backend unreachable: ${err.message}\n\nMake sure proxy-server.py is running:\n  python3 proxy-server.py`), {
      status: 502,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const contentType = response.headers.get('Content-Type') || '';

  // Build clean response headers — strip security headers that would
  // block the content from being displayed inside our proxy frame
  const cleanHeaders = buildCleanHeaders(response.headers);

  // For HTML, rewrite the body so links go through the proxy
  if (contentType.includes('text/html')) {
    const text = await response.text();
    const rewritten = rewriteHTML(text, targetURL);
    return new Response(rewritten, {
      status: response.status,
      headers: { ...cleanHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // For CSS, rewrite url() references
  if (contentType.includes('text/css')) {
    const text = await response.text();
    const rewritten = rewriteCSS(text, targetURL);
    return new Response(rewritten, {
      status: response.status,
      headers: { ...cleanHeaders, 'Content-Type': contentType },
    });
  }

  // Everything else (images, fonts, JS, etc.) — pass through as-is
  return new Response(response.body, {
    status: response.status,
    headers: cleanHeaders,
  });
}

// Header forwarding is now handled by proxy-server.js (Node backend).
// The SW only needs to pass the URL; the backend spoofs the correct
// Host, Origin, User-Agent, etc. for the target site.

/**
 * Strip headers that would block embedding or reveal proxy behavior.
 *
 * Content-Security-Policy — tells the browser what scripts/frames are allowed.
 *   If we keep this, the proxied page would block our proxy page itself.
 *
 * X-Frame-Options — tells the browser not to embed in iframes.
 *   Many sites set this; we remove it so our proxy can display them.
 *
 * Strict-Transport-Security — keeps the header (it's safe and correct).
 */
function buildCleanHeaders(headers) {
  const clean = {};
  for (const [key, value] of headers.entries()) {
    // Normalize to lowercase — the Fetch API returns lowercase keys but plain
    // objects are case-sensitive. Using lowercase throughout prevents duplicate
    // keys like { 'content-type': 'x', 'Content-Type': 'y' } where the browser
    // picks the wrong one, which caused raw HTML to display as text/plain.
    const lower = key.toLowerCase();
    // Drop headers that interfere with proxy operation
    if (lower === 'content-security-policy') continue;
    if (lower === 'content-security-policy-report-only') continue;
    if (lower === 'x-frame-options') continue;
    if (lower === 'x-content-type-options') continue;
    clean[lower] = value;  // store with lowercase key
  }
  return clean;
}

/**
 * URL Rewriting — the hardest part of building a proxy.
 *
 * When a page loads, it contains links (<a href>), assets (<img src>,
 * <script src>), and forms (<form action>). If we don't rewrite these,
 * clicking a link would take the user away from our proxy directly to
 * the real site — breaking the proxy chain.
 *
 * Strategy: convert all URLs to /TVP/proxy/<encoded-url>
 */
function rewriteHTML(html, baseURL) {
  let base;
  try {
    base = new URL(baseURL);
  } catch {
    // baseURL is not a valid absolute URL — can't resolve relative URLs, return as-is
    return html;
  }

  // Rewrite href, src, action attributes
  html = html.replace(
    /(href|src|action|data-src)=["']([^"']+)["']/gi,
    (match, attr, url) => {
      const rewritten = rewriteURL(url.trim(), base);
      return `${attr}="${rewritten}"`;
    }
  );

  // Rewrite srcset (used for responsive images).
  // srcset format: "url1 1x, url2 2x" — split on commas, rewrite each URL,
  // then rejoin. The previous regex approach lost commas between candidates.
  html = html.replace(
    /srcset=["']([^"']+)["']/gi,
    (match, srcset) => {
      const rewritten = srcset
        .split(',')
        .map(candidate => {
          const parts = candidate.trim().split(/\s+/);
          if (!parts[0]) return candidate;
          parts[0] = rewriteURL(parts[0], base);
          return parts.join(' ');
        })
        .join(', ');
      return `srcset="${rewritten}"`;
    }
  );

  // Inject our proxy script into the page so dynamic JS navigation
  // is also intercepted
  // The proxy prefix is derived from the SW scope at runtime
  const runtimePrefix = PROXY_PREFIX || (new URL(self.registration.scope).pathname + 'proxy/');
  // REAL_BASE is the actual URL being proxied (e.g. https://app-polytrack.kodub.com/0.6.0/).
  // document.baseURI would be the proxy URL (localhost/.../proxy/https%3A...) which is wrong
  // for resolving relative URLs like "models/blocks.glb".
  const injected = `<script>
    (function() {
      const PROXY_BASE = ${JSON.stringify(runtimePrefix)};
      const REAL_BASE  = ${JSON.stringify(baseURL)};
      function proxify(url) {
        try {
          const abs = new URL(url, REAL_BASE).href;
          if (abs.startsWith('http://') || abs.startsWith('https://')) {
            return PROXY_BASE + encodeURIComponent(abs);
          }
        } catch {}
        return url;
      }
      const _open = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, ...args) {
        return _open.call(this, method, proxify(url), ...args);
      };
      const _fetch = self.fetch;
      self.fetch = function(input, init) {
        if (typeof input === 'string') input = proxify(input);
        return _fetch.call(this, input, init);
      };
    })();
  </script>`;

  // Inject before </head> or at the start of <body>
  if (html.includes('</head>')) {
    html = html.replace('</head>', injected + '</head>');
  } else {
    html = injected + html;
  }

  return html;
}

function rewriteCSS(css, baseURL) {
  const base = new URL(baseURL);
  return css.replace(/url\(["']?([^"')]+)["']?\)/gi, (match, url) => {
    return `url("${rewriteURL(url.trim(), base)}")`;
  });
}

// Extensions that don't need proxying.
// Browsers can load cross-origin images/fonts/media directly without CORS
// restrictions affecting display. Only HTML, CSS, and JS need the proxy
// (HTML for navigation chain, CSS for url() rewriting, JS for XHR patching).
// Bypassing assets avoids hammering CDNs and getting 429 rate-limited.
const PASSTHROUGH_EXTENSIONS = new Set([
  // Images — browsers load cross-origin images freely (no CORS on display)
  'jpg','jpeg','png','gif','webp','avif','svg','ico','bmp',
  // Media — also loads cross-origin freely
  'mp4','webm',
  // NOTE: fonts (woff/woff2/ttf) are NOT here — browsers enforce CORS on fonts,
  // so they must go through Flask which adds Access-Control-Allow-Origin: *.
  // NOTE: audio (ogg/mp3) is NOT here — same CORS issue when loaded via Web Audio API.
  // NOTE: 3D models (.glb), data files (.track) are NOT here — need proper base URL resolution.
]);

function isPassthrough(url) {
  try {
    const path = new URL(url).pathname.toLowerCase();
    const ext = path.split('.').pop().split('?')[0];
    return PASSTHROUGH_EXTENSIONS.has(ext);
  } catch { return false; }
}

/**
 * Convert any URL to a proxied URL.
 * Handles: absolute URLs, protocol-relative URLs, relative URLs.
 */
function rewriteURL(url, base) {
  const prefix = PROXY_PREFIX || (new URL(self.registration.scope).pathname + 'proxy/');
  // Skip non-navigable schemes and already-proxied URLs
  if (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('#') ||
    url.startsWith('javascript:') ||
    url.startsWith(prefix)
  ) {
    return url;
  }

  try {
    const absolute = new URL(url, base).href;
    // Images, fonts, and media load fine cross-origin without a proxy.
    // Sending them through Flask hammers CDNs and causes 429 rate-limits.
    if (isPassthrough(absolute)) return absolute;
    return prefix + encodeURIComponent(absolute);
  } catch {
    return url;
  }
}

function errorPage(url, message) {
  return `<!DOCTYPE html>
<html>
<head><title>TunnelVision - Error</title></head>
<body style="font-family: monospace; padding: 2rem; background: #1a1a2e; color: #e94560;">
  <h2>Proxy Error</h2>
  <p>Could not fetch: <code style="color:#fff">${url}</code></p>
  <p>Reason: ${message}</p>
  <p style="color:#aaa; font-size:0.85rem">
    Common causes: The site blocks cross-origin requests, or the URL is invalid.
  </p>
</body>
</html>`;
}
