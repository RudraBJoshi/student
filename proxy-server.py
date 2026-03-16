"""
TunnelVision Proxy Backend (Flask)

WHY WE NEED THIS:
  Service Workers run inside the browser and share its origin (localhost:4600).
  The browser enforces CORS on all cross-origin fetch() calls, even from SWs.
  Python's requests library has no such restriction — it's a plain TCP client.

ARCHITECTURE:
  Browser → SW intercepts /TVP/proxy/<url>
           → SW calls GET http://localhost:4601/fetch?url=<url>
           → Flask fetches the real URL with requests (no CORS)
           → Returns response with Access-Control-Allow-Origin: *
           → SW rewrites HTML/CSS URLs → iframe displays the page

Run with:  python3 proxy-server.py
"""

from flask import Flask, request, Response
import requests
import urllib3
import time

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__)

# Simple in-memory cache to avoid hammering CDNs (causes 429s).
# Key: URL, Value: (timestamp, status, headers, body_bytes)
_cache = {}
CACHE_TTL = 60  # seconds — short enough to stay fresh, long enough to help

STRIP_HEADERS = {
    'content-security-policy',
    'content-security-policy-report-only',
    'x-frame-options',
    'x-content-type-options',
    'strict-transport-security',
    'transfer-encoding',
    'connection',
    # content-encoding MUST be stripped: requests decompresses the body but
    # leaves the header, so the browser would try to decompress raw bytes → ERR_FAILED.
    'content-encoding',
    # content-length changes after decompression — drop it or Flask recomputes it.
    'content-length',
}

@app.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

@app.route('/health')
def health():
    return {'status': 'ok', 'name': 'TunnelVision'}

@app.route('/fetch')
def proxy_fetch():
    target = request.args.get('url', '')
    if not target:
        return 'Missing ?url= parameter', 400

    if not target.startswith(('http://', 'https://')):
        return 'Only http/https URLs are supported', 400

    # Return cached response if still fresh.
    # This prevents 429 rate-limits when a page has many assets (images, CSS, fonts)
    # that all hit the same CDN host in a short burst.
    cached = _cache.get(target)
    if cached and (time.time() - cached['ts']) < CACHE_TTL:
        print(f'[TunnelVision] cache hit: {target}')
        return Response(cached['body'], status=cached['status'],
                        headers=cached['headers'],
                        content_type=cached['content_type'])

    print(f'[TunnelVision] → {target}')
    try:
        resp = requests.get(
            target,
            headers=build_headers(target),
            allow_redirects=True,
            timeout=10,
            verify=False,
            # Don't stream — we need to buffer to cache, and most assets are small.
            # For large video/binary files this is less ideal, but fine for web pages.
            stream=False,
        )
    except requests.exceptions.RequestException as e:
        return f'Proxy error: {e}', 502

    print(f'[TunnelVision] ← {resp.status_code} {target}')

    out_headers = {
        k: v for k, v in resp.headers.items()
        if k.lower() not in STRIP_HEADERS
    }
    content_type = resp.headers.get('Content-Type', 'application/octet-stream')

    # Cache successful responses (2xx). Don't cache errors.
    if 200 <= resp.status_code < 300:
        _cache[target] = {
            'ts': time.time(),
            'status': resp.status_code,
            'headers': out_headers,
            'content_type': content_type,
            'body': resp.content,
        }

    return Response(resp.content, status=resp.status_code,
                    headers=out_headers, content_type=content_type)

def build_headers(target_url):
    from urllib.parse import urlparse
    parsed = urlparse(target_url)
    return {
        'Host': parsed.netloc,
        'User-Agent': (
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/120.0.0.0 Safari/537.36'
        ),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        # Don't request gzip — let requests get plain text so there's no
        # content-encoding mismatch to worry about at all.
        'Accept-Encoding': 'identity',
        'Upgrade-Insecure-Requests': '1',
    }

if __name__ == '__main__':
    print("""
╔══════════════════════════════════════════╗
║   TunnelVision Proxy Backend (Flask)     ║
║   http://localhost:4601                  ║
╠══════════════════════════════════════════╣
║  GET /fetch?url=<encoded-url>            ║
║                                          ║
║  Run alongside Jekyll:                   ║
║    python3 proxy-server.py               ║
╚══════════════════════════════════════════╝
""")
    app.run(port=4601, debug=False)
