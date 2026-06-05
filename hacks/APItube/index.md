---
layout: base
title: APItube — YouTube Stream Engine
permalink: /apitube/
---

<style>
#at-root {
  --c-bg:     #08080f;
  --c-surf:   #0d0d1c;
  --c-surf2:  #111125;
  --c-border: #1c1c32;
  --c-cyan:   #00d4ff;
  --c-purple: #7b2fff;
  --c-text:   #e2e2f0;
  --c-sub:    #8888a8;
  --c-muted:  #44445a;
  --c-error:  #ff4466;
  --c-ok:     #00e5a0;
  --r:        14px;
  --mono: 'SF Mono','Fira Code','Cascadia Code',ui-monospace,monospace;

  background: var(--c-bg);
  color: var(--c-text);
  font-family: system-ui,-apple-system,sans-serif;
  max-width: 860px;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
  min-height: 80vh;
}

/* ── Hero ──────────────────────────────────────────────────────────────────── */
.at-hero {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 3rem;
}
.at-logo { flex-shrink: 0; filter: drop-shadow(0 0 18px rgba(0,212,255,.22)); }
.at-hero-text { }
.at-wordmark {
  margin: 0 0 .35rem;
  font-size: clamp(2rem,5vw,3rem);
  font-weight: 800;
  letter-spacing: -.04em;
  line-height: 1;
  background: linear-gradient(130deg,#00d4ff 0%,#7b2fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.at-sub {
  margin: 0;
  font-size: .92rem;
  color: var(--c-sub);
  line-height: 1.5;
}

/* ── Input card ─────────────────────────────────────────────────────────────── */
.at-card {
  background: var(--c-surf);
  border: 1px solid var(--c-border);
  border-radius: var(--r);
  padding: 1.5rem 1.75rem 1.25rem;
  margin-bottom: 1rem;
}
.at-field-label {
  display: block;
  font-size: .75rem;
  font-weight: 600;
  color: var(--c-sub);
  letter-spacing: .06em;
  text-transform: uppercase;
  margin-bottom: .6rem;
}
.at-input-row { display: flex; gap: .65rem; align-items: stretch; }
.at-url-input {
  flex: 1; min-width: 0;
  background: var(--c-bg);
  border: 1.5px solid var(--c-border);
  border-radius: 10px;
  padding: .8rem 1.1rem;
  color: var(--c-text);
  font-size: .95rem;
  outline: none;
  transition: border-color .18s, box-shadow .18s;
}
.at-url-input:focus {
  border-color: var(--c-cyan);
  box-shadow: 0 0 0 3px rgba(0,212,255,.08);
}
.at-url-input::placeholder { color: var(--c-muted); }
.at-btn {
  background: linear-gradient(135deg,#00d4ff,#7b2fff);
  border: none;
  border-radius: 10px;
  padding: .8rem 1.5rem;
  color: #fff;
  font-weight: 700;
  font-size: .9rem;
  letter-spacing: .02em;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: .5rem;
  transition: opacity .15s, transform .1s, box-shadow .15s;
  box-shadow: 0 2px 16px rgba(123,47,255,.25);
}
.at-btn:hover  { opacity: .9; box-shadow: 0 4px 24px rgba(123,47,255,.4); }
.at-btn:active { transform: scale(.97); }
.at-btn:disabled { opacity: .3; cursor: not-allowed; transform: none; box-shadow: none; }

.at-badge {
  display: flex;
  align-items: center;
  gap: .45rem;
  margin-top: .75rem;
  font-size: .72rem;
  color: var(--c-muted);
}
.at-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--c-muted);
  flex-shrink: 0;
  transition: background .3s, box-shadow .3s;
}
.at-dot.ok   { background: var(--c-ok);    box-shadow: 0 0 6px var(--c-ok); }
.at-dot.spin { background: var(--c-cyan);  animation: at-pulse .9s infinite; }
.at-dot.err  { background: var(--c-error); box-shadow: 0 0 6px var(--c-error); }
@keyframes at-pulse { 0%,100%{opacity:1} 50%{opacity:.2} }

/* ── Loading ────────────────────────────────────────────────────────────────── */
.at-loading { display:none; flex-direction:column; align-items:center; padding:3.5rem 1rem; gap:1.1rem; }
.at-loading.on { display:flex; }
.at-ring {
  width: 44px; height: 44px;
  border-radius: 50%;
  border: 3px solid var(--c-border);
  border-top-color: var(--c-cyan);
  border-right-color: var(--c-purple);
  animation: at-spin .7s linear infinite;
}
@keyframes at-spin { to { transform:rotate(360deg); } }
.at-loading-txt { font-size: .82rem; color: var(--c-sub); }

/* ── Error ──────────────────────────────────────────────────────────────────── */
.at-error { display:none; }
.at-error.on {
  display: block;
  background: rgba(255,68,102,.06);
  border: 1px solid rgba(255,68,102,.22);
  border-radius: var(--r);
  padding: 1.1rem 1.5rem;
  margin-bottom: 1rem;
}
.at-error-title { color: var(--c-error); font-weight: 600; font-size: .9rem; margin: 0 0 .4rem; }
.at-error-body  { color: var(--c-sub); font-size: .78rem; font-family: var(--mono);
  margin: 0; white-space: pre-wrap; line-height: 1.7; }

/* ── Player ─────────────────────────────────────────────────────────────────── */
.at-player { display:none; }
.at-player.on { display:block; }

.at-video-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: var(--r);
  overflow: hidden;
  box-shadow: 0 0 0 1px var(--c-border), 0 20px 60px rgba(0,0,0,.8);
  margin-bottom: 1rem;
}
.at-video-wrap video {
  width: 100%; height: 100%;
  display: block;
  object-fit: contain;
  will-change: transform;
  transform: translateZ(0);
}

.at-fetch-bar {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px;
  background: rgba(255,255,255,.05);
  display: none;
  z-index: 10;
}
.at-fetch-bar.on { display: block; }
.at-fetch-inner {
  height: 100%;
  background: linear-gradient(90deg, var(--c-cyan), var(--c-purple));
  border-radius: 0 2px 2px 0;
  width: 0%;
  transition: width .35s ease;
}

/* ── Video meta ─────────────────────────────────────────────────────────────── */
.at-meta {
  background: var(--c-surf);
  border: 1px solid var(--c-border);
  border-radius: var(--r);
  padding: 1.25rem 1.5rem;
  margin-bottom: .75rem;
}
.at-meta-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 .75rem;
  line-height: 1.4;
}
.at-meta-stats {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem 1.25rem;
  font-size: .78rem;
  color: var(--c-sub);
  margin-bottom: .85rem;
}
.at-meta-stat { display: flex; align-items: center; gap: .35rem; }
.at-stat-icon { opacity: .6; font-size: .8rem; }

.at-chips {
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
  border-top: 1px solid var(--c-border);
  padding-top: .75rem;
}
.at-chip {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: 20px;
  padding: .2rem .7rem;
  font-size: .7rem;
  font-family: var(--mono);
  color: var(--c-sub);
}
.at-chip-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--c-cyan);
  opacity: .7;
}

/* ── How it works ───────────────────────────────────────────────────────────── */
.at-howit {
  margin-top: 3.5rem;
  border-top: 1px solid var(--c-border);
  padding-top: 2.5rem;
}
.at-section-head {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0 0 .4rem;
}
.at-section-sub {
  font-size: .84rem;
  color: var(--c-sub);
  margin: 0 0 2rem;
}

/* Pipeline */
.at-pipeline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: .3rem;
  margin-bottom: 2.5rem;
  padding: 1.25rem 1.5rem;
  background: var(--c-surf);
  border: 1px solid var(--c-border);
  border-radius: var(--r);
  overflow-x: auto;
}
.at-pipe-step {
  display: flex;
  flex-direction: column;
  gap: .2rem;
}
.at-pipe-num {
  font-size: .58rem;
  font-family: var(--mono);
  color: var(--c-cyan);
  opacity: .6;
  letter-spacing: .1em;
  text-transform: uppercase;
}
.at-pipe-name {
  font-size: .78rem;
  font-weight: 600;
  color: var(--c-text);
}
.at-pipe-detail {
  font-size: .65rem;
  font-family: var(--mono);
  color: var(--c-muted);
}
.at-pipe-arrow {
  color: var(--c-purple);
  font-size: .9rem;
  padding: 0 .2rem;
  flex-shrink: 0;
  opacity: .6;
  margin-bottom: .2rem;
}

/* Tech grid */
.at-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px,1fr));
  gap: .75rem;
  margin-bottom: 2rem;
}
.at-tcard {
  background: var(--c-surf);
  border: 1px solid var(--c-border);
  border-radius: 10px;
  padding: 1rem 1.15rem;
  transition: border-color .2s, background .2s;
}
.at-tcard:hover {
  border-color: rgba(0,212,255,.2);
  background: var(--c-surf2);
}
.at-tcard-icon {
  font-size: 1.1rem;
  margin-bottom: .5rem;
  display: block;
}
.at-tcard h3 {
  font-size: .8rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0 0 .4rem;
}
.at-tcard p {
  font-size: .75rem;
  color: var(--c-sub);
  margin: 0;
  line-height: 1.65;
}
.at-tcard code {
  color: var(--c-cyan);
  background: var(--c-bg);
  padding: .05rem .3rem;
  border-radius: 4px;
  font-family: var(--mono);
  font-size: .68rem;
}

/* Code block */
.at-codeblock {
  background: var(--c-surf);
  border: 1px solid var(--c-border);
  border-radius: var(--r);
  overflow: hidden;
}
.at-codeblock-header {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .65rem 1.1rem;
  border-bottom: 1px solid var(--c-border);
  background: var(--c-bg);
}
.at-cb-dot { width:10px;height:10px;border-radius:50%; }
.at-cb-dot:nth-child(1){background:#ff5f57;}
.at-cb-dot:nth-child(2){background:#febc2e;}
.at-cb-dot:nth-child(3){background:#28c840;}
.at-cb-filename {
  margin-left:.35rem;
  font-size: .7rem;
  font-family: var(--mono);
  color: var(--c-sub);
}
.at-codeblock pre {
  margin: 0;
  padding: 1.1rem 1.25rem;
  overflow-x: auto;
  font-size: .72rem;
  font-family: var(--mono);
  line-height: 1.8;
  white-space: pre;
}
.at-kw  { color: #7b2fff; }
.at-fn  { color: #00d4ff; }
.at-str { color: #00e5a0; }
.at-cmt { color: #33334a; }
.at-num { color: #ff9d5c; }

@media (max-width:580px) {
  .at-input-row { flex-direction:column; }
  .at-btn { justify-content:center; }
  .at-hero { gap: .9rem; }
}
</style>

<div id="at-root">

  <!-- Hero -->
  <header class="at-hero">
    <svg class="at-logo" viewBox="0 0 120 120" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
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
      <circle cx="18" cy="40" r="4" fill="#00d4ff" filter="url(#p-gd)" opacity=".9"/>
      <circle cx="18" cy="60" r="4" fill="#5e88f7" filter="url(#p-gd)" opacity=".75"/>
      <circle cx="18" cy="80" r="4" fill="#7b2fff" filter="url(#p-gd)" opacity=".65"/>
      <circle cx="18" cy="40" r="1.8" fill="#fff" opacity=".55"/>
      <circle cx="18" cy="60" r="1.8" fill="#fff" opacity=".45"/>
      <circle cx="18" cy="80" r="1.8" fill="#fff" opacity=".35"/>
      <line x1="23" y1="40" x2="44" y2="40" stroke="#00d4ff" stroke-width="1.2" stroke-dasharray="3.5,3" opacity=".4"/>
      <line x1="23" y1="60" x2="44" y2="60" stroke="url(#p-g2)" stroke-width="1.2" stroke-dasharray="3.5,3" opacity=".4"/>
      <line x1="23" y1="80" x2="44" y2="80" stroke="#7b2fff" stroke-width="1.2" stroke-dasharray="3.5,3" opacity=".4"/>
      <polygon points="44,32 44,88 95,60" fill="url(#p-g1)" filter="url(#p-gp)"/>
      <line x1="95" y1="60" x2="105" y2="60" stroke="#7b2fff" stroke-width="1.5" opacity=".6"/>
      <circle cx="108" cy="60" r="4.5" fill="#7b2fff" filter="url(#p-gd)" opacity=".9"/>
      <circle cx="108" cy="60" r="2"   fill="#fff" opacity=".55"/>
    </svg>
    <div class="at-hero-text">
      <h1 class="at-wordmark">APItube</h1>
      <p class="at-sub">Stream any YouTube video up to 1080p — no sign-in, no ads, full seeking.</p>
    </div>
  </header>

  <!-- Input -->
  <div class="at-card">
    <label class="at-field-label" for="at-url">YouTube URL</label>
    <div class="at-input-row">
      <input id="at-url" class="at-url-input" type="url" autocomplete="off" spellcheck="false"
             placeholder="Paste a YouTube or youtu.be link…"/>
      <button id="at-btn" class="at-btn" onclick="atStream()">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <polygon points="2,1 11,6 2,11"/>
        </svg>
        Stream
      </button>
    </div>
    <div class="at-badge">
      <div class="at-dot" id="at-dot"></div>
      <span id="at-badge-txt">Ready</span>
    </div>
  </div>

  <!-- Error -->
  <div class="at-error" id="at-error">
    <p class="at-error-title">Could not load stream</p>
    <pre class="at-error-body" id="at-error-msg"></pre>
  </div>

  <!-- Loading -->
  <div class="at-loading" id="at-loading">
    <div class="at-ring"></div>
    <p class="at-loading-txt" id="at-loading-msg">Connecting…</p>
  </div>

  <!-- Player -->
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
          <span class="at-stat-icon">👤</span><span id="at-uploader"></span>
        </span>
      </div>
      <div class="at-chips">
        <span class="at-chip" id="at-quality-chip">
          <span class="at-chip-dot"></span><span id="at-quality"></span>
        </span>
        <span class="at-chip" id="at-mime-chip">
          <span id="at-mime"></span>
        </span>
        <span class="at-chip" id="at-src-chip">
          <span id="at-instance-used"></span>
        </span>
      </div>
    </div>
  </div>

  <!-- How it works -->
  <section class="at-howit">
    <p class="at-section-head">How it works</p>
    <p class="at-section-sub">A self-hosted pipeline that extracts, muxes, and serves YouTube streams directly to your browser.</p>

    <div class="at-pipeline">
      <div class="at-pipe-step">
        <span class="at-pipe-num">01</span>
        <span class="at-pipe-name">URL</span>
        <span class="at-pipe-detail">Video ID</span>
      </div>
      <span class="at-pipe-arrow">→</span>
      <div class="at-pipe-step">
        <span class="at-pipe-num">02</span>
        <span class="at-pipe-name">yt-dlp</span>
        <span class="at-pipe-detail">Format list</span>
      </div>
      <span class="at-pipe-arrow">→</span>
      <div class="at-pipe-step">
        <span class="at-pipe-num">03</span>
        <span class="at-pipe-name">1080p DASH</span>
        <span class="at-pipe-detail">h264 + m4a</span>
      </div>
      <span class="at-pipe-arrow">→</span>
      <div class="at-pipe-step">
        <span class="at-pipe-num">04</span>
        <span class="at-pipe-name">ffmpeg mux</span>
        <span class="at-pipe-detail">stream copy</span>
      </div>
      <span class="at-pipe-arrow">→</span>
      <div class="at-pipe-step">
        <span class="at-pipe-num">05</span>
        <span class="at-pipe-name">faststart MP4</span>
        <span class="at-pipe-detail">moov → front</span>
      </div>
      <span class="at-pipe-arrow">→</span>
      <div class="at-pipe-step">
        <span class="at-pipe-num">06</span>
        <span class="at-pipe-name">Browser</span>
        <span class="at-pipe-detail">Range / seek</span>
      </div>
    </div>

    <div class="at-grid">
      <div class="at-tcard">
        <span class="at-tcard-icon">⚙️</span>
        <h3>yt-dlp Extraction</h3>
        <p>
          <code>yt-dlp</code> pulls the full format manifest for any video — including
          DASH-only tracks that the official embed player hides. The backend selects
          the best <code>h264/mp4</code> video track paired with <code>m4a/aac</code> audio.
        </p>
      </div>
      <div class="at-tcard">
        <span class="at-tcard-icon">🎬</span>
        <h3>Zero-transcode Muxing</h3>
        <p>
          ffmpeg combines the two tracks with <code>-c:v copy -c:a copy</code> — no
          re-encoding, so a 20-minute video muxes in under 3 minutes. The
          <code>+faststart</code> flag moves the seek index to the front of the file.
        </p>
      </div>
      <div class="at-tcard">
        <span class="at-tcard-icon">⏩</span>
        <h3>Full Seeking</h3>
        <p>
          Flask serves the cached MP4 with <code>conditional=True</code>, which
          automatically handles HTTP Range requests — so the browser can seek
          to any timestamp without re-downloading the file.
        </p>
      </div>
      <div class="at-tcard">
        <span class="at-tcard-icon">🔄</span>
        <h3>Smart Fallback</h3>
        <p>
          If the local engine isn't running, the player tries public Invidious
          and Piped instances in sequence. Each source gets a timeout before
          the next is attempted. The status badge shows which source responded.
        </p>
      </div>
    </div>

    <div class="at-codeblock">
      <div class="at-codeblock-header">
        <div class="at-cb-dot"></div>
        <div class="at-cb-dot"></div>
        <div class="at-cb-dot"></div>
        <span class="at-cb-filename">api/APItube/engine.py — mux pipeline</span>
      </div>
      <pre><span class="at-cmt"># yt-dlp selects: best h264/mp4 video-only + best m4a audio-only</span>
<span class="at-cmt"># ffmpeg muxes both into one seekable MP4 — no transcode, just stream copy</span>

cmd = [
    <span class="at-str">'ffmpeg'</span>, <span class="at-str">'-y'</span>,
    <span class="at-str">'-i'</span>,   video_url,      <span class="at-cmt"># 1080p h264, video-only DASH track</span>
    <span class="at-str">'-i'</span>,   audio_url,      <span class="at-cmt"># m4a/aac, audio-only DASH track</span>
    <span class="at-str">'-map'</span>, <span class="at-str">'0:v:0'</span>,
    <span class="at-str">'-map'</span>, <span class="at-str">'1:a:0'</span>,
    <span class="at-str">'-c:v'</span>, <span class="at-str">'copy'</span>,       <span class="at-cmt"># no re-encode — keeps full quality</span>
    <span class="at-str">'-c:a'</span>, <span class="at-str">'copy'</span>,
    <span class="at-str">'-movflags'</span>, <span class="at-str">'+faststart'</span>,  <span class="at-cmt"># moov atom at front → instant seek</span>
    <span class="at-str">'-progress'</span>, <span class="at-str">'pipe:1'</span>,      <span class="at-cmt"># real-time progress → loading bar</span>
    out_path,
]</pre>
    </div>
  </section>

</div>

<script>
(function () {
  'use strict';

  const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
  const SOURCES = [
    { kind: 'local', host: 'localhost:5000' },
    { kind: 'inv',   host: 'invidious.nerdvpn.de'     },
    { kind: 'inv',   host: 'inv.tux.pizza'            },
    { kind: 'inv',   host: 'yewtu.be'                 },
    { kind: 'inv',   host: 'invidious.perennialte.ch' },
    { kind: 'piped', host: 'pipedapi.kavin.rocks',           proxy: true },
    { kind: 'piped', host: 'pipedapi.in.projectsegfau.lt',   proxy: true },
    { kind: 'piped', host: 'pipedapi.moomoo.me',             proxy: true },
  ];

  const $ = id => document.getElementById(id);
  let urlInput, btn, dot, badgeTxt, loadingEl, loadingMsg,
      errorEl, errorMsg, playerEl, video,
      titleEl, viewsEl, durationEl, uploaderEl,
      qualityEl, mimeEl, instanceUsedEl,
      fetchBar, fetchInner;

  function init() {
    urlInput       = $('at-url');
    btn            = $('at-btn');
    dot            = $('at-dot');
    badgeTxt       = $('at-badge-txt');
    loadingEl      = $('at-loading');
    loadingMsg     = $('at-loading-msg');
    errorEl        = $('at-error');
    errorMsg       = $('at-error-msg');
    playerEl       = $('at-player');
    video          = $('at-video');
    titleEl        = $('at-title');
    viewsEl        = $('at-views');
    durationEl     = $('at-duration');
    uploaderEl     = $('at-uploader');
    qualityEl      = $('at-quality');
    mimeEl         = $('at-mime');
    instanceUsedEl = $('at-instance-used');
    fetchBar       = $('at-fetch-bar');
    fetchInner     = $('at-fetch-inner');

    video.addEventListener('canplay', () => {
      video.play().catch(() => {});
    });
    video.addEventListener('canplaythrough', () => {
      fetchInner.style.width = '100%';
      setTimeout(() => fetchBar.classList.remove('on'), 500);
    });
    urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') atStream(); });
  }

  let _pollTimer = null;
  function _pollMuxProgress(videoId) {
    clearTimeout(_pollTimer);
    fetch('http://localhost:5000/api/apitube/progress/' + videoId)
      .then(r => r.json())
      .then(d => {
        const pct = Math.max(2, d.pct || 0);
        fetchInner.style.width = pct + '%';
        if (d.done) {
          loadingMsg.textContent = 'Finalizing…';
        } else {
          loadingMsg.textContent = 'Muxing ' + pct + '%…';
          _pollTimer = setTimeout(() => _pollMuxProgress(videoId), 300);
        }
      })
      .catch(() => {});
  }

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

  function extractVideoId(url) {
    const m = url.match(
      /(?:[?&]v=|\/embed\/|\/shorts\/|\/live\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return m ? m[1] : null;
  }

  function normalizeInvidious(raw, host) {
    const streams = (raw.formatStreams || []).map(s => ({
      url:       s.url,
      quality:   s.qualityLabel || s.quality || '?',
      mimeType:  (s.type || 'video/mp4').split(';')[0].trim(),
      videoOnly: false,
    }));
    return {
      title:        raw.title || 'Untitled',
      views:        raw.viewCount || 0,
      duration:     raw.lengthSeconds || 0,
      uploader:     raw.author || 'Unknown',
      thumbnailUrl: (raw.videoThumbnails || [])[0]?.url || '',
      videoStreams:  streams,
      _source:      host,
    };
  }

  function normalizePiped(raw, host) {
    if (raw.error) throw new Error(raw.error);
    if (!Array.isArray(raw.videoStreams)) throw new Error('Unexpected response');
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

  async function fetchStreamData(videoId) {
    const failures = [];
    for (const src of SOURCES) {
      const label = src.host;
      loadingMsg.textContent = 'Connecting to ' + label + '…';
      badgeTxt.textContent   = 'Trying ' + label;
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

        const timeout = src.kind === 'local' ? 2000 : 9000;
        const res = await fetch(url, { signal: AbortSignal.timeout(timeout) });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const raw = await res.json();

        const data = src.kind === 'inv' ? normalizeInvidious(raw, src.host)
                                        : normalizePiped(raw, src.host);
        data._sourceKind = src.kind;
        const kindLabel = { local: 'Local engine', inv: 'Invidious', piped: 'Piped' }[src.kind];
        badgeTxt.textContent       = 'Connected · ' + src.host;
        instanceUsedEl.textContent = kindLabel;
        return data;
      } catch (err) {
        failures.push(label + ': ' + err.message);
      }
    }
    throw new Error(
      'All sources failed.\n\n' + failures.join('\n')
    );
  }

  function selectBestStream(streams) {
    if (!streams || !streams.length) return null;
    const vids = streams.filter(s => s.mimeType?.startsWith('video'));
    if (!vids.length) return null;
    const combined = vids.filter(s => !s.videoOnly);
    const pool = combined.length ? combined : vids;
    return pool.sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0))[0];
  }

  function fmtDuration(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return h + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    return m + ':' + String(s).padStart(2,'0');
  }
  function fmtViews(n) {
    if (n >= 1e9) return (n/1e9).toFixed(1) + 'B views';
    if (n >= 1e6) return (n/1e6).toFixed(1) + 'M views';
    if (n >= 1e3) return (n/1e3).toFixed(1) + 'K views';
    return n + ' views';
  }

  window.atStream = async function () {
    const raw = urlInput.value.trim();
    if (!raw) { urlInput.focus(); return; }

    setState('loading');
    loadingMsg.textContent = 'Parsing URL…';

    const videoId = extractVideoId(raw);
    if (!videoId) {
      errorMsg.textContent =
        'Could not find a Video ID in this URL.\n\n' +
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
          'No playable stream found for this video.\n\n' +
          'This can happen with age-restricted, private, or region-locked videos.';
        setState('error');
        return;
      }

      fetchInner.style.width = '2%';
      fetchBar.classList.add('on');
      _pollMuxProgress(videoId);

      video.removeAttribute('crossorigin');
      if (data._sourceKind === 'local') {
        video.src = 'http://localhost:5000/api/apitube/stream/' + videoId;
      } else {
        video.src = stream.url;
      }
      video.poster = data.thumbnailUrl || '';

      titleEl.textContent    = data.title    || 'Untitled';
      viewsEl.textContent    = fmtViews(data.views || 0);
      durationEl.textContent = fmtDuration(data.duration || 0);
      uploaderEl.textContent = data.uploader || 'Unknown';
      qualityEl.textContent  = stream.quality || '?';
      mimeEl.textContent     = (stream.mimeType || 'video/mp4').split(';')[0].replace('video/','').toUpperCase();

      setState('playing');
    } catch (err) {
      errorMsg.textContent = err.message;
      setState('error');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
