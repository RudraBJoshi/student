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

const PROXY_PREFIX = '/TVP/fetch?url=';

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

  // Only intercept requests going through our proxy prefix
  if (!url.pathname.startsWith('/TVP/proxy/')) return;

  // Decode the target URL from the path:
  // /TVP/proxy/https://example.com/page → https://example.com/page
  const encoded = url.pathname.replace('/TVP/proxy/', '');
  let targetURL;
  try {
    targetURL = decodeURIComponent(encoded) + url.search;
  } catch {
    event.respondWith(new Response('Bad URL', { status: 400 }));
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

  let response;
  try {
    response = await fetch(targetURL, {
      method: originalRequest.method,
      headers: buildForwardHeaders(originalRequest.headers, targetURL),
      // Don't forward credentials to arbitrary sites
      credentials: 'omit',
      redirect: 'follow',
    });
  } catch (err) {
    // This is where you'd see CORS errors in a real browser context.
    // In a SW, cross-origin fetches work — that's the whole point.
    return new Response(errorPage(targetURL, err.message), {
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

/**
 * Build headers to forward to the target site.
 *
 * Real proxies must be careful here — some headers reveal the proxy,
 * others are required for the target site to respond correctly.
 */
function buildForwardHeaders(incomingHeaders, targetURL) {
  const target = new URL(targetURL);
  return {
    // Make the request look like it came from the target site itself
    'Host': target.host,
    'Origin': target.origin,
    'Referer': target.href,
    // Pass through accept headers so the server sends the right format
    'Accept': incomingHeaders.get('Accept') || '*/*',
    'Accept-Language': incomingHeaders.get('Accept-Language') || 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'User-Agent': 'Mozilla/5.0 (compatible; TunnelVision/1.0)',
  };
}

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
    const lower = key.toLowerCase();
    // Drop headers that interfere with proxy operation
    if (lower === 'content-security-policy') continue;
    if (lower === 'content-security-policy-report-only') continue;
    if (lower === 'x-frame-options') continue;
    if (lower === 'x-content-type-options') continue;
    clean[key] = value;
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
  const base = new URL(baseURL);

  // Rewrite href, src, action attributes
  html = html.replace(
    /(href|src|action|data-src)=["']([^"']+)["']/gi,
    (match, attr, url) => {
      const rewritten = rewriteURL(url.trim(), base);
      return `${attr}="${rewritten}"`;
    }
  );

  // Rewrite srcset (used for responsive images)
  html = html.replace(
    /srcset=["']([^"']+)["']/gi,
    (match, srcset) => {
      const rewritten = srcset.replace(
        /(\S+)(\s+\d+[wx])?/g,
        (m, url, descriptor) => rewriteURL(url, base) + (descriptor || '')
      );
      return `srcset="${rewritten}"`;
    }
  );

  // Inject our proxy script into the page so dynamic JS navigation
  // is also intercepted
  const injected = `<script>
    // TunnelVision: Override window.location and history so JS navigation
    // goes through the proxy too
    (function() {
      const PROXY_BASE = '/TVP/proxy/';
      const _open = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, ...args) {
        const abs = new URL(url, document.baseURI).href;
        return _open.call(this, method, PROXY_BASE + encodeURIComponent(abs), ...args);
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

/**
 * Convert any URL to a proxied URL.
 * Handles: absolute URLs, protocol-relative URLs, relative URLs.
 */
function rewriteURL(url, base) {
  // Skip data URIs, blob URLs, anchors, and already-proxied URLs
  if (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('#') ||
    url.startsWith('javascript:') ||
    url.startsWith('/TVP/proxy/')
  ) {
    return url;
  }

  try {
    const absolute = new URL(url, base).href;
    return '/TVP/proxy/' + encodeURIComponent(absolute);
  } catch {
    return url; // If we can't parse it, leave it alone
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
