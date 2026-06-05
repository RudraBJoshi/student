#!/usr/bin/env python3
"""APItube stream extraction engine.
Standalone:  python3 engine.py
Unified:     from APItube.engine import apitube_bp
"""

import re
import time
import requests as _requests
from flask import Blueprint, Flask, Response, jsonify, request as _req, stream_with_context
from flask_cors import CORS
import yt_dlp

apitube_bp = Blueprint('apitube', __name__)

_VIDEO_ID    = re.compile(r'^[a-zA-Z0-9_-]{11}$')
_url_cache   = {}   # video_id -> (url, expires_at)
_CACHE_TTL   = 180  # seconds — well within YouTube's ~6h CDN token window


def _extract(video_id):
    opts = {
        'quiet': True,
        'no_warnings': True,
        'skip_download': True,
        'extractor_args': {'youtube': {'skip': ['dash', 'hls']}},
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(
            'https://www.youtube.com/watch?v=' + video_id,
            download=False
        )

    formats = info.get('formats') or []
    # Progressive (combined audio+video) streams only
    combined = [
        f for f in formats
        if f.get('vcodec') not in (None, 'none')
        and f.get('acodec') not in (None, 'none')
        and f.get('url')
    ]
    combined.sort(key=lambda f: f.get('height') or 0, reverse=True)

    streams = []
    for f in combined[:6]:
        h = f.get('height') or 0
        streams.append({
            'url':       f['url'],
            'quality':   f'{h}p' if h else '?',
            'mimeType':  'video/' + (f.get('ext') or 'mp4'),
            'videoOnly': False,
            'bitrate':   int((f.get('tbr') or 0) * 1000),
        })

    thumbs = info.get('thumbnails') or []
    thumb  = next((t['url'] for t in reversed(thumbs) if t.get('url')), info.get('thumbnail', ''))

    return {
        'title':        info.get('title', 'Untitled'),
        'views':        info.get('view_count') or 0,
        'duration':     info.get('duration') or 0,
        'uploader':     info.get('uploader', 'Unknown'),
        'thumbnailUrl': thumb,
        'videoStreams':  streams,
    }


def _best_url(video_id):
    """Return the best stream URL, using a short-lived cache to survive seek requests."""
    now = time.time()
    if video_id in _url_cache:
        url, exp = _url_cache[video_id]
        if now < exp:
            return url
    data = _extract(video_id)
    if not data['videoStreams']:
        raise ValueError('No combined streams found')
    url = data['videoStreams'][0]['url']
    _url_cache[video_id] = (url, now + _CACHE_TTL)
    return url


@apitube_bp.get('/stream/<video_id>')
def stream_proxy(video_id):
    """Proxy the video stream through the local server so the browser canvas
    stays untainted (enables TF.js pixel reads for AI upscaling)."""
    if not _VIDEO_ID.match(video_id):
        return jsonify({'error': 'Invalid video ID'}), 400
    try:
        url = _best_url(video_id)
        hdrs = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer':    'https://www.youtube.com/',
        }
        range_hdr = _req.headers.get('Range')
        if range_hdr:
            hdrs['Range'] = range_hdr

        upstream = _requests.get(url, headers=hdrs, stream=True, timeout=10)

        resp_hdrs = {
            'Content-Type':              upstream.headers.get('Content-Type', 'video/mp4'),
            'Accept-Ranges':             'bytes',
            'Access-Control-Allow-Origin': '*',
        }
        for h in ('Content-Length', 'Content-Range'):
            if h in upstream.headers:
                resp_hdrs[h] = upstream.headers[h]

        return Response(
            stream_with_context(upstream.iter_content(chunk_size=32768)),
            status=upstream.status_code,
            headers=resp_hdrs,
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@apitube_bp.get('/health')
def health():
    return jsonify({'ok': True})


@apitube_bp.get('/streams/<video_id>')
def streams(video_id):
    if not _VIDEO_ID.match(video_id):
        return jsonify({'error': 'Invalid video ID'}), 400
    try:
        data = _extract(video_id)
        if not data['videoStreams']:
            return jsonify({'error': 'No combined streams found (video may be restricted)'}), 404
        return jsonify(data)
    except yt_dlp.utils.DownloadError as e:
        return jsonify({'error': str(e)}), 502
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(apitube_bp, url_prefix='/api/apitube')
    print('APItube standalone → http://localhost:5050')
    app.run(host='127.0.0.1', port=5050, debug=False)
