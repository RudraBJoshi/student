---
layout: base
title: APItube — Client-Side YouTube Stream Engine
permalink: /apitube/
---

<style>
/* ─── APItube – all rules scoped to #at-root ─────────────────────────────── */
#at-root {
  --c-bg:       #08080f;
  --c-surf:     #0d0d1c;
  --c-border:   #181828;
  --c-cyan:     #00d4ff;
  --c-purple:   #7b2fff;
  --c-text:     #e2e2f0;
  --c-muted:    #52526e;
  --c-error:    #ff4466;
  --c-ok:       #00e5a0;
  --r:          12px;
  --font-mono:  'SF Mono','Fira Code','Cascadia Code',ui-monospace,monospace;

  background: var(--c-bg);
  color: var(--c-text);
  font-family: system-ui,-apple-system,sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;
  min-height: 80vh;
}

/* ── header ─────────────────────────────────────────────────────────────── */
.at-header {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--c-border);
}
.at-logo { flex-shrink: 0; filter: drop-shadow(0 0 14px rgba(0,212,255,.28)); }
.at-wordmark { margin: 0; font-size: clamp(1.8rem,4.5vw,2.7rem); font-weight: 800;
  letter-spacing: -.03em; background: linear-gradient(130deg,#00d4ff 0%,#7b2fff 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  line-height: 1.05; }
.at-tagline { margin: .3rem 0 0; color: var(--c-muted); font-size: .78rem;
  font-family: var(--font-mono); letter-spacing: .05em; }

/* ── input card ─────────────────────────────────────────────────────────── */
.at-card {
  background: var(--c-surf);
  border: 1px solid var(--c-border);
  border-radius: var(--r);
  padding: 1.6rem 1.75rem;
  margin-bottom: 1.25rem;
}
.at-field-label {
  display: block; font-family: var(--font-mono); font-size: .7rem;
  color: var(--c-cyan); letter-spacing: .12em; text-transform: uppercase;
  margin-bottom: .65rem;
}
.at-input-row { display: flex; gap: .7rem; align-items: stretch; }
.at-url-input {
  flex: 1; min-width: 0;
  background: var(--c-bg); border: 1.5px solid var(--c-border);
  border-radius: 8px; padding: .75rem 1rem;
  color: var(--c-text); font-size: .92rem; font-family: var(--font-mono);
  outline: none; transition: border-color .18s, box-shadow .18s;
}
.at-url-input:focus { border-color: var(--c-cyan); box-shadow: 0 0 0 3px rgba(0,212,255,.1); }
.at-url-input::placeholder { color: var(--c-muted); }
.at-btn {
  background: linear-gradient(135deg,#00d4ff 0%,#7b2fff 100%);
  border: none; border-radius: 8px; padding: .75rem 1.4rem;
  color: #fff; font-weight: 700; font-size: .88rem; letter-spacing: .04em;
  cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: .45rem;
  transition: opacity .18s, transform .1s;
}
.at-btn:hover { opacity: .88; }
.at-btn:active { transform: scale(.97); }
.at-btn:disabled { opacity: .35; cursor: not-allowed; transform: none; }
.at-badge {
  display: flex; align-items: center; gap: .45rem;
  margin-top: .6rem; font-size: .68rem; font-family: var(--font-mono); color: var(--c-muted);
}
.at-dot { width:7px; height:7px; border-radius:50%; background: var(--c-muted); transition: background .3s; }
.at-dot.ok    { background: var(--c-ok);     box-shadow: 0 0 7px var(--c-ok); }
.at-dot.spin  { background: var(--c-cyan);   animation: at-blink .9s infinite; }
.at-dot.err   { background: var(--c-error);  box-shadow: 0 0 7px var(--c-error); }
@keyframes at-blink { 0%,100%{opacity:1} 50%{opacity:.25} }

/* ── loading ─────────────────────────────────────────────────────────────── */
.at-loading { display:none; flex-direction:column; align-items:center;
  justify-content:center; padding:3rem; gap:1rem; }
.at-loading.on { display:flex; }
.at-ring {
  width:46px; height:46px; border-radius:50%;
  border:3px solid var(--c-border);
  border-top-color:var(--c-cyan);
  border-right-color:var(--c-purple);
  animation: at-spin .75s linear infinite;
}
@keyframes at-spin { to { transform:rotate(360deg); } }
.at-loading-txt { font-size:.8rem; font-family:var(--font-mono); color:var(--c-muted); }

/* ── error ───────────────────────────────────────────────────────────────── */
.at-error { display:none; }
.at-error.on {
  display:block; background:rgba(255,68,102,.07);
  border:1px solid rgba(255,68,102,.28); border-radius:var(--r);
  padding:1.1rem 1.4rem; margin-bottom:1.1rem;
}
.at-error-title { color:var(--c-error); font-weight:600; font-size:.88rem; margin:0 0 .4rem; }
.at-error-body  { color:var(--c-muted); font-size:.78rem; font-family:var(--font-mono);
  margin:0; white-space:pre-wrap; line-height:1.7; }

/* ── player section ─────────────────────────────────────────────────────── */
.at-player { display:none; }
.at-player.on { display:block; }

.at-video-wrap {
  position:relative; width:100%; aspect-ratio:16/9;
  background:#000; border-radius:var(--r); overflow:hidden;
  box-shadow: 0 0 0 1px var(--c-border), 0 10px 48px rgba(0,0,0,.7);
  margin-bottom:.9rem;
}
.at-video-wrap video {
  width:100%; height:100%; display:block; object-fit:contain;
  will-change: transform;
  transform: translateZ(0);
}

/* ── Fetch / mux progress bar ────────────────────────────────────────────── */
.at-fetch-bar {
  position:absolute; bottom:0; left:0; right:0;
  height:3px; background:rgba(255,255,255,.06);
  display:none; z-index:10;
}
.at-fetch-bar.on { display:block; }
.at-fetch-inner {
  height:100%;
  background:linear-gradient(90deg,var(--c-cyan),var(--c-purple));
  border-radius:0 2px 2px 0;
  width:0%;
  transition:width .35s ease;
}

.at-meta {
  background:var(--c-surf); border:1px solid var(--c-border);
  border-radius:var(--r); padding:1.2rem 1.4rem; margin-bottom:.75rem;
}
.at-meta-title {
  font-size:1.08rem; font-weight:600; color:var(--c-text);
  margin:0 0 .65rem; line-height:1.45;
}
.at-meta-stats {
  display:flex; flex-wrap:wrap; gap:.85rem 1.4rem;
  font-size:.76rem; font-family:var(--font-mono); color:var(--c-muted);
}
.at-meta-stat { display:flex; align-items:center; gap:.3rem; }
.at-stat-icon { color:var(--c-cyan); }
.at-stream-row {
  display:flex; flex-wrap:wrap; gap:.5rem 1.4rem;
  font-size:.68rem; font-family:var(--font-mono); color:var(--c-muted);
  border-top:1px solid var(--c-border); margin-top:.8rem; padding-top:.8rem;
}


/* ── how it works ────────────────────────────────────────────────────────── */
.at-howit {
  margin-top:3rem;
  border-top:1px solid var(--c-border);
  padding-top:2.2rem;
}
.at-section-head {
  font-size:.72rem; font-family:var(--font-mono); color:var(--c-cyan);
  letter-spacing:.12em; text-transform:uppercase; margin:0 0 1.6rem;
}
.at-pipeline {
  display:flex; align-items:center; flex-wrap:wrap;
  gap:.25rem; margin-bottom:2rem; overflow-x:auto;
}
.at-pipe-step {
  background:var(--c-surf); border:1px solid var(--c-border);
  border-radius:7px; padding:.55rem .9rem; white-space:nowrap;
}
.at-pipe-num  { display:block; font-size:.6rem; font-family:var(--font-mono);
  color:var(--c-cyan); opacity:.65; letter-spacing:.07em; margin-bottom:.12rem; }
.at-pipe-name { font-size:.74rem; font-family:var(--font-mono); color:var(--c-text); }
.at-pipe-arrow { color:var(--c-purple); font-size:.85rem; padding:0 .15rem; flex-shrink:0; }

.at-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; }
.at-tcard {
  background:var(--c-surf); border:1px solid var(--c-border);
  border-radius:8px; padding:.9rem 1.1rem;
}
.at-tcard h3 {
  font-size:.72rem; font-family:var(--font-mono); color:var(--c-purple);
  margin:0 0 .45rem; letter-spacing:.07em;
}
.at-tcard p { font-size:.76rem; color:var(--c-muted); margin:0; line-height:1.65; }
.at-tcard code { color:var(--c-cyan); background:var(--c-bg); padding:.05rem .3rem;
  border-radius:3px; font-family:var(--font-mono); font-size:.7rem; }

.at-codeblock {
  background:var(--c-bg); border:1px solid var(--c-border); border-radius:8px;
  padding:1rem 1.2rem; margin-top:1.25rem; overflow-x:auto;
  font-size:.73rem; font-family:var(--font-mono); color:var(--c-cyan);
  white-space:pre; line-height:1.75;
}
.at-kw { color:#7b2fff; }
.at-str { color:#00e5a0; }
.at-cmt { color:#3a3a52; }

@media (max-width:580px) {
  .at-input-row { flex-direction:column; }
  .at-btn { justify-content:center; }
}
</style>

<div id="at-root">

  <!-- ── Header ───────────────────────────────────────────────────────────── -->
  <header class="at-header">
    <svg class="at-logo" viewBox="0 0 120 120" width="62" height="62" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="p-g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00d4ff"/>
          <stop offset="100%" stop-color="#7b2fff"/>
        </linearGradient>
        <linearGradient id="p-g2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00d4ff" stop-opacity=".5"/>
          <stop offset="100%" stop-color="#7b2fff" stop-opacity=".5"/>
        </linearGradient>
        <filter id="p-gp" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="p-gd" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect x="3" y="3" width="114" height="114" rx="22" fill="#08080f"/>
      <rect x="3" y="3" width="114" height="114" rx="22" fill="none" stroke="url(#p-g1)" stroke-width="1.5"/>
      <!-- input nodes -->
      <circle cx="18" cy="40" r="4" fill="#00d4ff" filter="url(#p-gd)" opacity=".9"/>
      <circle cx="18" cy="60" r="4" fill="#5e88f7" filter="url(#p-gd)" opacity=".75"/>
      <circle cx="18" cy="80" r="4" fill="#7b2fff" filter="url(#p-gd)" opacity=".65"/>
      <circle cx="18" cy="40" r="1.8" fill="#fff" opacity=".55"/>
      <circle cx="18" cy="60" r="1.8" fill="#fff" opacity=".45"/>
      <circle cx="18" cy="80" r="1.8" fill="#fff" opacity=".35"/>
      <!-- dashed connectors -->
      <line x1="23" y1="40" x2="44" y2="40" stroke="#00d4ff" stroke-width="1.2" stroke-dasharray="3.5,3" opacity=".4"/>
      <line x1="23" y1="60" x2="44" y2="60" stroke="url(#p-g2)" stroke-width="1.2" stroke-dasharray="3.5,3" opacity=".4"/>
      <line x1="23" y1="80" x2="44" y2="80" stroke="#7b2fff" stroke-width="1.2" stroke-dasharray="3.5,3" opacity=".4"/>
      <!-- play triangle -->
      <polygon points="44,32 44,88 95,60" fill="url(#p-g1)" filter="url(#p-gp)"/>
      <!-- output -->
      <line x1="95" y1="60" x2="105" y2="60" stroke="#7b2fff" stroke-width="1.5" opacity=".6"/>
      <circle cx="108" cy="60" r="4.5" fill="#7b2fff" filter="url(#p-gd)" opacity=".9"/>
      <circle cx="108" cy="60" r="2"   fill="#fff" opacity=".55"/>
    </svg>

    <div>
      <h1 class="at-wordmark">APItube</h1>
      <p class="at-tagline">client-side youtube stream engine // piped api // zero backend</p>
    </div>
  </header>

  <!-- ── Input ─────────────────────────────────────────────────────────────── -->
  <div class="at-card">
    <label class="at-field-label" for="at-url">// paste youtube url</label>
    <div class="at-input-row">
      <input id="at-url" class="at-url-input" type="url" autocomplete="off" spellcheck="false"
             placeholder="https://youtube.com/watch?v=...  or  youtu.be/..."/>
      <button id="at-btn" class="at-btn" onclick="atStream()">
        <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor">
          <polygon points="2,1 11,6 2,11"/>
        </svg>
        Stream It
      </button>
    </div>
    <div class="at-badge">
      <div class="at-dot" id="at-dot"></div>
      <span id="at-badge-txt">ready · will try piped instances in sequence</span>
    </div>
  </div>

  <!-- ── Error ─────────────────────────────────────────────────────────────── -->
  <div class="at-error" id="at-error">
    <p class="at-error-title">Stream Error</p>
    <pre class="at-error-body" id="at-error-msg"></pre>
  </div>

  <!-- ── Loading ───────────────────────────────────────────────────────────── -->
  <div class="at-loading" id="at-loading">
    <div class="at-ring"></div>
    <p class="at-loading-txt" id="at-loading-msg">Initializing...</p>
  </div>

  <!-- ── Player ────────────────────────────────────────────────────────────── -->
  <div class="at-player" id="at-player">
    <div class="at-video-wrap">
      <video id="at-video" controls playsinline preload="auto"></video>
      <div class="at-fetch-bar" id="at-fetch-bar">
        <div class="at-fetch-inner" id="at-fetch-inner"></div>
      </div>
    </div>
    <div class="at-meta">
      <h2 class="at-meta-title" id="at-title"></h2>
      <div class="at-meta-stats">
        <span class="at-meta-stat">
          <span class="at-stat-icon">▶</span><span id="at-views"></span>
        </span>
        <span class="at-meta-stat">
          <span class="at-stat-icon">⏱</span><span id="at-duration"></span>
        </span>
        <span class="at-meta-stat">
          <span class="at-stat-icon">📡</span><span id="at-uploader"></span>
        </span>
      </div>
      <div class="at-stream-row">
        <span id="at-quality"></span>
        <span id="at-mime"></span>
        <span id="at-instance-used"></span>
      </div>
    </div>
  </div>

  <!-- ── How It Works ──────────────────────────────────────────────────────── -->
  <section class="at-howit">
    <p class="at-section-head">// how it works — client-side parsing pipeline</p>

    <div class="at-pipeline">
      <div class="at-pipe-step">
        <span class="at-pipe-num">01 · INPUT</span>
        <span class="at-pipe-name">YouTube URL</span>
      </div>
      <span class="at-pipe-arrow">→</span>
      <div class="at-pipe-step">
        <span class="at-pipe-num">02 · PARSE</span>
        <span class="at-pipe-name">Regex · Video ID</span>
      </div>
      <span class="at-pipe-arrow">→</span>
      <div class="at-pipe-step">
        <span class="at-pipe-num">03 · FETCH</span>
        <span class="at-pipe-name">Piped API · /streams</span>
      </div>
      <span class="at-pipe-arrow">→</span>
      <div class="at-pipe-step">
        <span class="at-pipe-num">04 · FILTER</span>
        <span class="at-pipe-name">videoOnly: false</span>
      </div>
      <span class="at-pipe-arrow">→</span>
      <div class="at-pipe-step">
        <span class="at-pipe-num">05 · SORT</span>
        <span class="at-pipe-name">Highest Quality</span>
      </div>
      <span class="at-pipe-arrow">→</span>
      <div class="at-pipe-step">
        <span class="at-pipe-num">06 · RENDER</span>
        <span class="at-pipe-name">&lt;video&gt; + GPU layer</span>
      </div>
    </div>

    <div class="at-grid">
      <div class="at-tcard">
        <h3>// PIPED API</h3>
        <p>
          <a href="https://github.com/TeamPiped/Piped" target="_blank" style="color:var(--c-cyan)">Piped</a>
          is an open-source YouTube frontend that exposes a public REST API.
          Calling <code>/streams/{videoId}</code> returns full metadata plus a list of
          direct CDN stream URLs — no API key, no backend required.
        </p>
      </div>
      <div class="at-tcard">
        <h3>// STREAM SELECTION</h3>
        <p>
          YouTube serves two stream types: <em>progressive</em> (audio+video combined,
          tagged <code>videoOnly: false</code>) and <em>DASH</em> (separate tracks for
          higher resolutions). APItube filters for progressive streams and picks the
          highest bitrate — typically up to 720p for muxed MP4.
        </p>
      </div>
      <div class="at-tcard">
        <h3>// GPU RENDERING</h3>
        <p>
          The <code>&lt;video&gt;</code> element is promoted to its own GPU compositor
          layer via <code>will-change:transform</code> and <code>translateZ(0)</code>.
          All upscaling is then handled natively by the GPU or NPU with bilinear filtering
          — no CPU overhead.
        </p>
      </div>
      <div class="at-tcard">
        <h3>// FALLBACK CHAIN</h3>
        <p>
          Four public Piped instances are tried in order with an 8-second timeout each.
          If the primary is down or rate-limiting, the next is tried automatically.
          The badge below the input shows which instance was used.
        </p>
      </div>
    </div>

    <div class="at-codeblock"><span class="at-cmt">// Extraction pipeline — runs entirely in the browser</span>

<span class="at-kw">const</span> INSTANCES = [
  <span class="at-str">'https://pipedapi.kavin.rocks'</span>,
  <span class="at-str">'https://pipedapi.tokhmi.xyz'</span>,
  <span class="at-str">'https://pipedapi.moomoo.me'</span>,
  <span class="at-str">'https://api.piped.yt'</span>,
];

<span class="at-kw">function</span> extractVideoId(url) {
  <span class="at-kw">const</span> m = url.match(<span class="at-str">/(?:[?&]v=|\/embed\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/</span>);
  <span class="at-kw">return</span> m ? m[1] : <span class="at-kw">null</span>;
}

<span class="at-kw">async function</span> fetchStream(videoId) {
  <span class="at-kw">for</span> (<span class="at-kw">const</span> host <span class="at-kw">of</span> INSTANCES) {
    <span class="at-kw">const</span> res = <span class="at-kw">await</span> fetch(`${host}/streams/${videoId}`, {
      signal: AbortSignal.timeout(8000)
    });
    <span class="at-kw">if</span> (res.ok) <span class="at-kw">return</span> { data: <span class="at-kw">await</span> res.json(), host };
  }
}

<span class="at-kw">function</span> bestStream(streams) {
  <span class="at-kw">return</span> streams
    .filter(s => !s.videoOnly && s.mimeType?.startsWith(<span class="at-str">'video'</span>))
    .sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0))[0];
}</div>
  </section>

</div><!-- #at-root -->

<script>
(function () {
  'use strict';

  // ── Source chain ─────────────────────────────────────────────────────────
  // Invidious instances are tried directly (Crystal app ships CORS: * by default).
  // Piped instances are wrapped in a CORS proxy because their Java backend
  // often omits Access-Control-Allow-Origin on self-hosted deployments.
  const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

  const SOURCES = [
    // Unified local backend — run `python3 api/main.py` from the repo root
    { kind: 'local', host: 'localhost:5000' },
    // Invidious — direct fetch (Crystal app serves CORS: * by default)
    { kind: 'inv', host: 'invidious.nerdvpn.de'       },
    { kind: 'inv', host: 'inv.tux.pizza'              },
    { kind: 'inv', host: 'yewtu.be'                   },
    { kind: 'inv', host: 'invidious.perennialte.ch'   },
    // Piped — via CORS proxy fallback
    { kind: 'piped', host: 'pipedapi.kavin.rocks',              proxy: true },
    { kind: 'piped', host: 'pipedapi.in.projectsegfau.lt',      proxy: true },
    { kind: 'piped', host: 'pipedapi.moomoo.me',                proxy: true },
  ];

  // ── DOM refs ─────────────────────────────────────────────────────────────
  const $ = id => document.getElementById(id);
  let urlInput, btn, dot, badgeTxt, loadingEl, loadingMsg,
      errorEl, errorMsg, playerEl, video,
      titleEl, viewsEl, durationEl, uploaderEl,
      qualityEl, mimeEl, instanceUsedEl,
      fetchBar, fetchInner;

  function init() {
    urlInput      = $('at-url');
    btn           = $('at-btn');
    dot           = $('at-dot');
    badgeTxt      = $('at-badge-txt');
    loadingEl     = $('at-loading');
    loadingMsg    = $('at-loading-msg');
    errorEl       = $('at-error');
    errorMsg      = $('at-error-msg');
    playerEl      = $('at-player');
    video         = $('at-video');
    titleEl       = $('at-title');
    viewsEl       = $('at-views');
    durationEl    = $('at-duration');
    uploaderEl    = $('at-uploader');
    qualityEl     = $('at-quality');
    mimeEl        = $('at-mime');
    instanceUsedEl = $('at-instance-used');
    fetchBar   = $('at-fetch-bar');
    fetchInner = $('at-fetch-inner');

    video.addEventListener('canplay', () => {
      // User already clicked "Stream It" — that counts as a user gesture,
      // so play() is allowed without another tap.
      video.play().catch(() => {});
    });

    video.addEventListener('canplaythrough', () => {
      fetchInner.style.width = '100%';
      setTimeout(() => fetchBar.classList.remove('on'), 500);
    });

    urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') atStream(); });
  }

  // ── Mux progress polling ──────────────────────────────────────────────────
  let _pollTimer = null;

  function _pollMuxProgress(videoId) {
    clearTimeout(_pollTimer);
    fetch('http://localhost:5000/api/apitube/progress/' + videoId)
      .then(r => r.json())
      .then(d => {
        const pct = Math.max(2, d.pct || 0);
        fetchInner.style.width = pct + '%';
        if (!d.done) {
          _pollTimer = setTimeout(() => _pollMuxProgress(videoId), 300);
        }
        // canplaythrough handler takes it to 100% and hides the bar
      })
      .catch(() => {
        // backend not running or public API — just leave bar as-is
      });
  }

  // ── State machine ─────────────────────────────────────────────────────────
  function setState(s) {
    loadingEl.classList.toggle('on', s === 'loading');
    errorEl.classList.toggle('on',   s === 'error');
    playerEl.classList.toggle('on',  s === 'playing');
    btn.disabled = s === 'loading';
    dot.className = 'at-dot' +
      (s === 'loading' ? ' spin' : s === 'playing' ? ' ok' : s === 'error' ? ' err' : '');
    if (s !== 'playing') {
      clearTimeout(_pollTimer);
      fetchBar.classList.remove('on');
      fetchInner.style.width = '0%';
    }
  }

  // ── Video ID extraction ───────────────────────────────────────────────────
  function extractVideoId(url) {
    // Handles: watch?v=, /embed/, /shorts/, youtu.be/, /live/
    const m = url.match(
      /(?:[?&]v=|\/embed\/|\/shorts\/|\/live\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return m ? m[1] : null;
  }

  // ── Response normalizers ─────────────────────────────────────────────────
  function normalizeInvidious(raw, host) {
    const streams = (raw.formatStreams || []).map(s => ({
      url:       s.url,
      quality:   s.qualityLabel || s.quality || '?',
      mimeType:  (s.type  || 'video/mp4').split(';')[0].trim(),
      videoOnly: false,
    }));
    return {
      title:        raw.title       || 'Untitled',
      views:        raw.viewCount   || 0,
      duration:     raw.lengthSeconds || 0,
      uploader:     raw.author      || 'Unknown',
      thumbnailUrl: (raw.videoThumbnails || [])[0]?.url || '',
      videoStreams:  streams,
      _source:      host,
    };
  }

  function normalizePiped(raw, host) {
    if (raw.error) throw new Error('API error: ' + raw.error);
    if (!Array.isArray(raw.videoStreams)) throw new Error('Unexpected response shape');
    return {
      title:        raw.title    || 'Untitled',
      views:        raw.views    || 0,
      duration:     raw.duration || 0,
      uploader:     raw.uploader || 'Unknown',
      thumbnailUrl: raw.thumbnailUrl || '',
      videoStreams:  raw.videoStreams,
      _source:      host,
    };
  }

  // ── Fetch with dual-API fallback chain ───────────────────────────────────
  async function fetchStreamData(videoId) {
    const failures = [];

    for (const src of SOURCES) {
      const label = src.host + (src.proxy ? ' (proxy)' : '');
      loadingMsg.textContent = 'Trying ' + label + '...';
      badgeTxt.textContent   = 'trying ' + label;

      try {
        let url;
        if (src.kind === 'local') {
          url = 'http://' + src.host + '/api/apitube/streams/' + videoId;
        } else if (src.kind === 'inv') {
          const fields = 'title,viewCount,lengthSeconds,author,videoThumbnails,formatStreams';
          url = 'https://' + src.host + '/api/v1/videos/' + videoId + '?fields=' + fields;
        } else {
          url = 'https://' + src.host + '/streams/' + videoId;
        }
        if (src.proxy) url = CORS_PROXY + encodeURIComponent(url);

        // Local backend: short timeout so a non-running server fails fast
        const timeout = src.kind === 'local' ? 2000 : 9000;
        const res = await fetch(url, { signal: AbortSignal.timeout(timeout) });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const raw = await res.json();

        const data = src.kind === 'inv' ? normalizeInvidious(raw, src.host)
                                        : normalizePiped(raw, src.host);
        data._sourceKind = src.kind;   // 'local' | 'inv' | 'piped'
        const kindLabel = { local: 'local yt-dlp', inv: 'invidious', piped: 'piped' }[src.kind];
        badgeTxt.textContent       = 'connected · ' + src.host;
        instanceUsedEl.textContent = kindLabel + ': ' + src.host;
        return data;
      } catch (err) {
        failures.push(label + ' → ' + err.message);
      }
    }

    throw new Error(
      'All sources failed. Try a different video, or check the browser console.\n\n' +
      failures.join('\n')
    );
  }

  // ── Select the best stream ───────────────────────────────────────────────
  function selectBestStream(streams) {
    if (!streams || !streams.length) return null;
    const video = streams.filter(s => s.mimeType?.startsWith('video'));
    if (!video.length) return null;
    // Prefer combined (videoOnly:false) for public API paths.
    // Local backend returns videoOnly:true for DASH but the proxy muxes it —
    // so we fall through to include those too.
    const combined = video.filter(s => !s.videoOnly);
    const pool = combined.length ? combined : video;
    return pool.sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0))[0];
  }

  // ── Formatters ───────────────────────────────────────────────────────────
  function fmtDuration(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    return m + ':' + String(s).padStart(2, '0');
  }

  function fmtViews(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B views';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M views';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K views';
    return n + ' views';
  }

  // ── Main action ──────────────────────────────────────────────────────────
  window.atStream = async function () {
    const raw = urlInput.value.trim();
    if (!raw) { urlInput.focus(); return; }

    setState('loading');
    loadingMsg.textContent = 'Parsing URL...';

    const videoId = extractVideoId(raw);
    if (!videoId) {
      errorMsg.textContent =
        'Could not find an 11-character Video ID in this URL.\n\n' +
        'Supported formats:\n' +
        '  youtube.com/watch?v=VIDEO_ID\n' +
        '  youtu.be/VIDEO_ID\n' +
        '  youtube.com/shorts/VIDEO_ID\n' +
        '  youtube.com/live/VIDEO_ID';
      setState('error');
      return;
    }

    try {
      const data   = await fetchStreamData(videoId);
      const stream = selectBestStream(data.videoStreams);

      if (!stream) {
        errorMsg.textContent =
          'No combined (audio+video) stream found for this video.\n\n' +
          'Possible reasons:\n' +
          '  • Age-restricted or sign-in-required video\n' +
          '  • Private or deleted video\n' +
          '  • Active live stream (no progressive formats)\n' +
          '  • Region-locked content\n\n' +
          'Higher-resolution streams (1080p+) are DASH-only and require\n' +
          'a separate media source player to mux audio + video tracks.';
        setState('error');
        return;
      }

      // Start progress bar — polls /api/apitube/progress/:id for real mux %
      fetchInner.style.width = '2%';
      fetchBar.classList.add('on');
      _pollMuxProgress(videoId);

      // No crossOrigin needed — AI upscaler is gone, so we never need to
      // read pixels back from the canvas. Remove it unconditionally so the
      // browser loads the video as a normal media resource without CORS
      // preflight validation on every Range (seek) request.
      video.removeAttribute('crossorigin');
      if (data._sourceKind === 'local') {
        video.src = 'http://localhost:5000/api/apitube/stream/' + videoId;
      } else {
        video.src = stream.url;
      }
      video.poster = data.thumbnailUrl || '';

      // Populate metadata
      titleEl.textContent    = data.title    || 'Untitled';
      viewsEl.textContent    = fmtViews(data.views || 0);
      durationEl.textContent = fmtDuration(data.duration || 0);
      uploaderEl.textContent = data.uploader || 'Unknown';
      qualityEl.textContent  = 'quality: ' + (stream.quality || '?');
      mimeEl.textContent     = 'mime: '    + (stream.mimeType || 'video/mp4').split(';')[0];

      setState('playing');
    } catch (err) {
      errorMsg.textContent = err.message;
      setState('error');
    }
  };

  // ── Boot ─────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
