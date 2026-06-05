#!/usr/bin/env python3
"""APItube stream extraction engine.
Standalone:  python3 engine.py
Unified:     from APItube.engine import apitube_bp
"""

import os
import re
import shutil
import subprocess
import time

import requests as _requests
import yt_dlp
from flask import Blueprint, Flask, Response, jsonify, make_response, request as _req, send_file, stream_with_context
from flask_cors import CORS

apitube_bp = Blueprint('apitube', __name__)

_VIDEO_ID    = re.compile(r'^[a-zA-Z0-9_-]{11}$')
_info_cache  = {}   # video_id -> (info_dict, expires_at)
_mux_progress = {}  # video_id -> int 0-100
_mux_active   = set()  # video_ids currently being muxed (guards against double-mux)
_CACHE_DIR   = '/tmp/apitube_cache'
os.makedirs(_CACHE_DIR, exist_ok=True)
_CACHE_TTL   = 180   # seconds — well within YouTube's CDN token window
_HAS_FFMPEG  = bool(shutil.which('ffmpeg'))
_HAS_FFPROBE = bool(shutil.which('ffprobe'))


# ── Cache helpers ────────────────────────────────────────────────────────────

def _is_valid_mp4(path):
    """Return True only if the file is a complete, playable MP4 (has a moov atom)."""
    if not os.path.exists(path) or os.path.getsize(path) < 1024:
        return False
    if not _HAS_FFPROBE:
        return True  # best-effort fallback
    try:
        r = subprocess.run(
            ['ffprobe', '-v', 'error', '-select_streams', 'v:0',
             '-show_entries', 'stream=codec_name',
             '-of', 'default=noprint_wrappers=1:nokey=1', path],
            capture_output=True, text=True, timeout=15,
        )
        return r.returncode == 0 and r.stdout.strip() != ''
    except Exception:
        return False


# ── Info extraction ───────────────────────────────────────────────────────────

def _get_info(video_id):
    now = time.time()
    if video_id in _info_cache:
        info, exp = _info_cache[video_id]
        if now < exp:
            return info
    opts = {'quiet': True, 'no_warnings': True, 'skip_download': True}
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(
            'https://www.youtube.com/watch?v=' + video_id, download=False
        )
    _info_cache[video_id] = (info, now + _CACHE_TTL)
    return info


def _select_streams(info):
    """Return (video_fmt, audio_fmt, is_dash).

    Prefers 1080p h264+m4a DASH pair (copy-muxable, no transcode).
    Falls back to combined 360p if DASH unavailable or ffmpeg missing.
    """
    fmts = info.get('formats') or []

    # h264/mp4 video-only, up to 1080p
    v_only = sorted(
        [f for f in fmts
         if f.get('ext') == 'mp4'
         and (f.get('vcodec') or '').startswith('avc')
         and f.get('acodec') in (None, 'none', '')
         and f.get('url')
         and (f.get('height') or 0) <= 1080],
        key=lambda f: (f.get('height') or 0, f.get('tbr') or 0),
        reverse=True,
    )

    # m4a/aac audio-only (copy-compatible with mp4 container)
    a_only = sorted(
        [f for f in fmts
         if f.get('ext') == 'm4a'
         and f.get('vcodec') in (None, 'none', '')
         and f.get('url')],
        key=lambda f: f.get('abr') or 0,
        reverse=True,
    )

    if v_only and a_only and _HAS_FFMPEG:
        return v_only[0], a_only[0], True

    # Combined fallback
    combined = sorted(
        [f for f in fmts
         if f.get('vcodec') not in (None, 'none')
         and f.get('acodec') not in (None, 'none', '')
         and f.get('url')],
        key=lambda f: f.get('height') or 0,
        reverse=True,
    )
    if combined:
        return combined[0], None, False

    return None, None, False


def _thumb(info):
    thumbs = info.get('thumbnails') or []
    return next((t['url'] for t in reversed(thumbs) if t.get('url')),
                info.get('thumbnail', ''))


# ── Routes ────────────────────────────────────────────────────────────────────

@apitube_bp.get('/progress/<video_id>')
def mux_progress(video_id):
    if not _VIDEO_ID.match(video_id):
        return jsonify({'error': 'Invalid video ID'}), 400
    cache_path = os.path.join(_CACHE_DIR, f'{video_id}.mp4')
    if _is_valid_mp4(cache_path):
        return jsonify({'pct': 100, 'done': True, 'cached': True})
    pct = _mux_progress.get(video_id, 0)
    return jsonify({'pct': pct, 'done': pct >= 100, 'cached': False})


@apitube_bp.get('/health')
def health():
    return jsonify({'ok': True, 'ffmpeg': _HAS_FFMPEG})


@apitube_bp.get('/streams/<video_id>')
def streams(video_id):
    if not _VIDEO_ID.match(video_id):
        return jsonify({'error': 'Invalid video ID'}), 400
    try:
        info  = _get_info(video_id)
        v_fmt, _, is_dash = _select_streams(info)
        if not v_fmt:
            return jsonify({'error': 'No streams found for this video'}), 404

        h       = v_fmt.get('height') or 0
        quality = f'{h}p' if h else '?'

        return jsonify({
            'title':        info.get('title', 'Untitled'),
            'views':        info.get('view_count') or 0,
            'duration':     info.get('duration') or 0,
            'uploader':     info.get('uploader', 'Unknown'),
            'thumbnailUrl': _thumb(info),
            'videoStreams': [{
                'url':       v_fmt['url'],
                'quality':   quality,
                'mimeType':  'video/mp4',
                'videoOnly': is_dash,   # proxy will mux; frontend uses proxy URL
            }],
        })
    except yt_dlp.utils.DownloadError as e:
        return jsonify({'error': str(e)}), 502
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@apitube_bp.get('/stream/<video_id>')
def stream_proxy(video_id):
    """Serve the video: ffmpeg-muxed 1080p DASH or proxied combined stream."""
    if not _VIDEO_ID.match(video_id):
        return jsonify({'error': 'Invalid video ID'}), 400
    try:
        info = _get_info(video_id)
        v_fmt, a_fmt, is_dash = _select_streams(info)
        if not v_fmt:
            return jsonify({'error': 'No streams found'}), 404

        if not is_dash:
            return _proxy(v_fmt['url'])

        # Mux to a temp file so the browser gets a real MP4 with a seek index.
        # faststart moves the moov atom to the front — full rewind/seek works.
        cache_path = os.path.join(_CACHE_DIR, f'{video_id}.mp4')
        if not _is_valid_mp4(cache_path):
            if video_id in _mux_active:
                # Another request already started the mux; wait for it.
                while video_id in _mux_active:
                    time.sleep(1)
                if not _is_valid_mp4(cache_path):
                    return jsonify({'error': 'FFmpeg mux failed'}), 500
            else:
                _mux_active.add(video_id)
                try:
                    duration = info.get('duration') or 0
                    ok = _mux_to_file(v_fmt['url'], a_fmt['url'], cache_path, video_id, duration)
                finally:
                    _mux_active.discard(video_id)
                if not ok:
                    return jsonify({'error': 'FFmpeg mux failed'}), 500

        resp = make_response(send_file(cache_path, mimetype='video/mp4', conditional=True))
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['X-APItube-Mode'] = 'ffmpeg-faststart'
        return resp
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── Stream helpers ────────────────────────────────────────────────────────────

def _mux_to_file(video_url, audio_url, out_path, video_id, duration_secs):
    """Mux 1080p video-only + audio-only into a seekable MP4 file.

    ffmpeg writes progress lines to stdout via -progress pipe:1.
    We parse out_time_us to compute 0-100 % and store in _mux_progress.
    """
    _mux_progress[video_id] = 0
    cmd = [
        'ffmpeg', '-y',
        '-loglevel', 'quiet',
        '-i',   video_url,
        '-i',   audio_url,
        '-map', '0:v:0',
        '-map', '1:a:0',
        '-c:v', 'copy',
        '-c:a', 'copy',
        '-movflags', '+faststart',
        '-progress', 'pipe:1',
        '-nostats',
        out_path,
    ]
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
        bufsize=1,
    )
    for line in proc.stdout:
        line = line.strip()
        if line.startswith('out_time_us=') and duration_secs > 0:
            try:
                us = int(line.split('=')[1])
                pct = min(98, int(us / (duration_secs * 1_000_000) * 100))
                _mux_progress[video_id] = pct
            except (ValueError, ZeroDivisionError):
                pass
    proc.wait()
    ok = proc.returncode == 0 and os.path.exists(out_path) and os.path.getsize(out_path) > 1024
    _mux_progress[video_id] = 100 if ok else -1
    return ok


def _proxy(url):
    """Proxy a combined stream URL, passing Range headers through for seeking."""
    hdrs = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer':    'https://www.youtube.com/',
    }
    rng = _req.headers.get('Range')
    if rng:
        hdrs['Range'] = rng

    upstream = _requests.get(url, headers=hdrs, stream=True, timeout=10)

    resp_hdrs = {
        'Content-Type':                upstream.headers.get('Content-Type', 'video/mp4'),
        'Accept-Ranges':               'bytes',
        'Access-Control-Allow-Origin': '*',
        'X-APItube-Mode':              'direct-proxy',
    }
    for h in ('Content-Length', 'Content-Range'):
        if h in upstream.headers:
            resp_hdrs[h] = upstream.headers[h]

    return Response(
        stream_with_context(upstream.iter_content(chunk_size=32768)),
        status=upstream.status_code,
        headers=resp_hdrs,
    )


# ── Standalone ────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(apitube_bp, url_prefix='/api/apitube')
    print(f'APItube standalone → http://localhost:5050  (ffmpeg faststart: {_HAS_FFMPEG})')
    app.run(host='127.0.0.1', port=5050, debug=False)
