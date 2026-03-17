import re
import urllib.parse

import requests
from flask import Blueprint, request, Response

proxy_api = Blueprint('proxy_api', __name__, url_prefix='/api/proxy')

BLOCKED_HEADERS = {
    'x-frame-options',
    'content-security-policy',
    'content-security-policy-report-only',
    'x-content-type-options',
    'strict-transport-security',
    'transfer-encoding',   # handled by Flask
    'content-encoding',    # we decoded it; don't claim it's still encoded
    'connection',
    'keep-alive',
}

TIMEOUT = 10  # seconds


def _rewrite_urls(content: str, base_url: str, proxy_base: str) -> str:
    """Rewrite absolute and relative URLs in HTML so they route through the proxy."""
    parsed = urllib.parse.urlparse(base_url)
    origin = f"{parsed.scheme}://{parsed.netloc}"

    def make_proxy(url: str) -> str:
        url = url.strip()
        if url.startswith(('data:', 'javascript:', '#', 'mailto:')):
            return url
        if url.startswith('//'):
            url = parsed.scheme + ':' + url
        elif url.startswith('/'):
            url = origin + url
        elif not url.startswith('http'):
            path = parsed.path.rsplit('/', 1)[0] + '/'
            url = origin + path + url
        return proxy_base + '?url=' + urllib.parse.quote(url, safe='')

    # href / src / action rewrites
    content = re.sub(
        r'(href|src|action)=["\']([^"\']*)["\']',
        lambda m: f'{m.group(1)}="{make_proxy(m.group(2))}"',
        content,
    )
    # srcset
    def rewrite_srcset(m):
        parts = []
        for part in m.group(1).split(','):
            tokens = part.strip().split()
            if tokens:
                tokens[0] = make_proxy(tokens[0])
            parts.append(' '.join(tokens))
        return 'srcset="' + ', '.join(parts) + '"'
    content = re.sub(r'srcset=["\']([^"\']*)["\']', rewrite_srcset, content)

    return content


def _rewrite_css_urls(css: str, base_url: str, proxy_base: str) -> str:
    """Rewrite url(...) references inside CSS through the proxy."""
    parsed = urllib.parse.urlparse(base_url)
    origin = f"{parsed.scheme}://{parsed.netloc}"

    def make_proxy(url: str) -> str:
        url = url.strip().strip('"\'')
        if url.startswith(('data:', '#')):
            return url
        if url.startswith('//'):
            url = parsed.scheme + ':' + url
        elif url.startswith('/'):
            url = origin + url
        elif not url.startswith('http'):
            path = parsed.path.rsplit('/', 1)[0] + '/'
            url = origin + path + url
        return proxy_base + '?url=' + urllib.parse.quote(url, safe='')

    return re.sub(
        r'url\(\s*(["\']?)([^)\s]+)\1\s*\)',
        lambda m: f'url("{make_proxy(m.group(2))}")',
        css,
    )


@proxy_api.route('', methods=['GET'])
def proxy():
    """Fetch a remote URL and return it with frame-blocking headers stripped.

    Query params:
      url  (required)  Full URL to proxy, e.g. ?url=https://example.com
    """
    target = request.args.get('url', '').strip()
    if not target:
        return Response('<h2>No URL provided</h2>', status=400, mimetype='text/html')

    # Only allow http/https
    parsed = urllib.parse.urlparse(target)
    if parsed.scheme not in ('http', 'https'):
        return Response('<h2>Only http/https URLs are allowed</h2>', status=400, mimetype='text/html')

    try:
        upstream = requests.get(
            target,
            timeout=TIMEOUT,
            headers={
                'User-Agent': (
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                    'AppleWebKit/537.36 (KHTML, like Gecko) '
                    'Chrome/124.0 Safari/537.36'
                ),
                'Accept': 'text/html,application/xhtml+xml,*/*;q=0.9',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'identity',  # no compression — we rewrite the body
            },
            allow_redirects=True,
        )
    except requests.exceptions.Timeout:
        return Response('<h2>Request timed out</h2>', status=504, mimetype='text/html')
    except requests.exceptions.RequestException as exc:
        return Response(f'<h2>Proxy error: {exc}</h2>', status=502, mimetype='text/html')

    # Build response headers — strip anything that would block framing
    headers = {
        k: v for k, v in upstream.headers.items()
        if k.lower() not in BLOCKED_HEADERS
    }
    # Allow this response to be framed from any origin
    headers['X-Frame-Options'] = 'ALLOWALL'
    headers['Access-Control-Allow-Origin'] = '*'

    content_type = upstream.headers.get('content-type', '')

    proxy_base = request.host_url.rstrip('/') + '/api/proxy'

    # Rewrite HTML links so navigation stays inside the proxy
    if 'text/html' in content_type:
        body = _rewrite_urls(upstream.text, upstream.url, proxy_base)
        return Response(body, status=upstream.status_code,
                        headers=headers, mimetype='text/html')

    # Rewrite CSS url() references so fonts/images load through proxy
    if 'text/css' in content_type:
        body = _rewrite_css_urls(upstream.text, upstream.url, proxy_base)
        return Response(body, status=upstream.status_code,
                        headers=headers, mimetype='text/css')

    # Pass through binary/JS unchanged
    return Response(upstream.content, status=upstream.status_code,
                    headers=headers, content_type=content_type)
