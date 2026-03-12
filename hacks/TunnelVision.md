---
layout: default
title: TunnelVision Proxy
permalink: /TVP
---

<style>
/* ── Root / Theme ─────────────────────────────────────────────── */
.tv-root {
  --tv-bg:       #0d0d1a;
  --tv-surface:  #14142b;
  --tv-border:   #2a2a4a;
  --tv-accent:   #7c6af7;
  --tv-accent2:  #e94560;
  --tv-text:     #d0d0e8;
  --tv-muted:    #666688;
  --tv-green:    #2ecc71;
  --tv-yellow:   #f39c12;
  --tv-red:      #e74c3c;
  --tv-mono:     'JetBrains Mono', 'Fira Code', monospace;

  background: var(--tv-bg);
  color: var(--tv-text);
  font-family: var(--tv-mono);
  min-height: 100vh;
  padding: 0;
  margin: 0;
  border-radius: 8px;
  overflow: hidden;
}

/* ── Header / Title bar ───────────────────────────────────────── */
.tv-header {
  background: var(--tv-surface);
  border-bottom: 1px solid var(--tv-border);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tv-logo {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--tv-accent);
  letter-spacing: 2px;
  white-space: nowrap;
}

.tv-logo span { color: var(--tv-accent2); }

/* ── URL Bar ──────────────────────────────────────────────────── */
.tv-bar {
  display: flex;
  flex: 1;
  gap: 0.4rem;
  align-items: center;
}

#tv-url {
  flex: 1;
  background: var(--tv-bg);
  border: 1px solid var(--tv-border);
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  color: var(--tv-text);
  font-family: var(--tv-mono);
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
}
#tv-url:focus { border-color: var(--tv-accent); }

.tv-btn {
  background: var(--tv-accent);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  font-family: var(--tv-mono);
  font-size: 0.85rem;
  transition: opacity 0.2s;
  white-space: nowrap;
}
.tv-btn:hover { opacity: 0.85; }
.tv-btn--secondary {
  background: transparent;
  border: 1px solid var(--tv-border);
  color: var(--tv-muted);
}
.tv-btn--secondary:hover { border-color: var(--tv-accent); color: var(--tv-accent); }

/* ── Status bar ───────────────────────────────────────────────── */
.tv-status-bar {
  background: var(--tv-bg);
  border-bottom: 1px solid var(--tv-border);
  padding: 0.3rem 1rem;
  font-size: 0.75rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.tv-status { transition: color 0.3s; }
.tv-status--ready   { color: var(--tv-green); }
.tv-status--loading { color: var(--tv-yellow); }
.tv-status--error   { color: var(--tv-red); }

.tv-demos {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-left: auto;
}

.tv-demo-btn {
  background: transparent;
  border: 1px solid var(--tv-border);
  border-radius: 4px;
  color: var(--tv-muted);
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  cursor: pointer;
  font-family: var(--tv-mono);
  transition: all 0.2s;
}
.tv-demo-btn:hover { border-color: var(--tv-accent); color: var(--tv-accent); }

/* ── Main layout ──────────────────────────────────────────────── */
.tv-body {
  display: grid;
  grid-template-columns: 1fr 260px;
  height: 65vh;
}

/* ── Iframe ───────────────────────────────────────────────────── */
.tv-frame-wrap {
  border-right: 1px solid var(--tv-border);
  position: relative;
}

#tv-frame {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}

/* ── Side panel ───────────────────────────────────────────────── */
.tv-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tv-panel-title {
  background: var(--tv-surface);
  border-bottom: 1px solid var(--tv-border);
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  color: var(--tv-accent);
  letter-spacing: 1px;
  text-transform: uppercase;
}

#tv-log {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  font-size: 0.7rem;
}

.tv-log-line {
  padding: 0.25rem 0;
  border-bottom: 1px solid var(--tv-border);
  line-height: 1.4;
}
.tv-log-time   { color: var(--tv-muted); margin-right: 0.4rem; }
.tv-log-event  { color: var(--tv-accent); margin-right: 0.4rem; }
.tv-log-detail { color: var(--tv-text); word-break: break-all; }

/* ── How it works panel ───────────────────────────────────────── */
.tv-how-bar {
  background: var(--tv-surface);
  border-top: 1px solid var(--tv-border);
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--tv-muted);
}

.tv-hidden { display: none !important; }

#tv-how {
  background: var(--tv-surface);
  border-top: 1px solid var(--tv-border);
  padding: 1rem 1.5rem;
  font-size: 0.78rem;
  line-height: 1.7;
  max-height: 300px;
  overflow-y: auto;
}

#tv-how h3 {
  color: var(--tv-accent);
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
}

#tv-how .tv-step {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--tv-border);
}

.tv-step-num {
  color: var(--tv-accent2);
  font-weight: bold;
  font-size: 1rem;
  min-width: 1.5rem;
}

.tv-step-text strong { color: var(--tv-text); }
.tv-step-text p { margin: 0.2rem 0 0 0; color: var(--tv-muted); }

code {
  background: var(--tv-bg);
  border: 1px solid var(--tv-border);
  border-radius: 3px;
  padding: 0 0.3rem;
  font-size: 0.85em;
  color: var(--tv-green);
}

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 700px) {
  .tv-body { grid-template-columns: 1fr; }
  .tv-panel { display: none; }
  .tv-header { flex-wrap: wrap; }
}
</style>

<div class="tv-root">

  <!-- Header -->
  <div class="tv-header">
    <div class="tv-logo">TUNNEL<span>VISION</span></div>
    <div class="tv-bar">
      <input id="tv-url" type="text" placeholder="Enter a URL or search query..." autocomplete="off" spellcheck="false" />
      <button id="tv-go" class="tv-btn">Go</button>
      <button id="tv-how-toggle" class="tv-btn tv-btn--secondary">How it works</button>
    </div>
  </div>

  <!-- Status + demo buttons -->
  <div class="tv-status-bar">
    <div id="tv-status" class="tv-status tv-status--loading">Registering Service Worker...</div>
    <div class="tv-demos">
      <span style="color:var(--tv-muted);font-size:0.7rem;">Try:</span>
      <button class="tv-demo-btn" data-tv-url="https://example.com">example.com</button>
      <button class="tv-demo-btn" data-tv-url="https://en.wikipedia.org/wiki/Web_proxy">Wikipedia</button>
      <button class="tv-demo-btn" data-tv-url="https://httpbin.org/get">httpbin</button>
    </div>
  </div>

  <!-- Main body -->
  <div class="tv-body">
    <div class="tv-frame-wrap">
      <iframe id="tv-frame" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
    </div>
    <div class="tv-panel">
      <div class="tv-panel-title">Request Log</div>
      <div id="tv-log"></div>
    </div>
  </div>

  <!-- How it works (collapsible) -->
  <div class="tv-how-bar">
    <span>TunnelVision uses a <strong>Service Worker</strong> — the same technique as Ultraviolet, Corrosion, and other modern web proxies.</span>
  </div>

  <div id="tv-how" class="tv-hidden">
    <h3>How TunnelVision works</h3>

    <div class="tv-step">
      <div class="tv-step-num">1</div>
      <div class="tv-step-text">
        <strong>Service Worker Registration</strong>
        <p>A Service Worker is a background script the browser runs separately from the page.
           It has the ability to <em>intercept every network request</em> the page makes.
           We register it with scope <code>/TVP/</code> so it controls all requests under that path.</p>
      </div>
    </div>

    <div class="tv-step">
      <div class="tv-step-num">2</div>
      <div class="tv-step-text">
        <strong>URL Encoding</strong>
        <p>When you enter a URL, we encode it and prefix it:
           <code>https://example.com</code> becomes <code>/TVP/proxy/https%3A%2F%2Fexample.com</code>.
           The iframe loads this fake path — the SW intercepts it before any real request goes out.</p>
      </div>
    </div>

    <div class="tv-step">
      <div class="tv-step-num">3</div>
      <div class="tv-step-text">
        <strong>Request Interception (fetch event)</strong>
        <p>The SW's <code>fetch</code> event fires for every request.
           We decode the target URL and use <code>fetch()</code> to retrieve it.
           SW fetch calls are not subject to the same CORS restrictions as page-level fetch — that's the key insight.</p>
      </div>
    </div>

    <div class="tv-step">
      <div class="tv-step-num">4</div>
      <div class="tv-step-text">
        <strong>Header Stripping</strong>
        <p>Sites send headers like <code>Content-Security-Policy</code> and <code>X-Frame-Options</code>
           that tell the browser "don't embed this". We strip those from the response before returning it,
           so our page can display the content freely.</p>
      </div>
    </div>

    <div class="tv-step">
      <div class="tv-step-num">5</div>
      <div class="tv-step-text">
        <strong>URL Rewriting</strong>
        <p>The hardest part. The fetched HTML contains links, image sources, and script URLs
           all pointing to the real site. We rewrite every <code>href</code>, <code>src</code>, and <code>action</code>
           attribute to go through <code>/TVP/proxy/</code>, keeping the user inside the proxy.</p>
      </div>
    </div>

    <div class="tv-step">
      <div class="tv-step-num">6</div>
      <div class="tv-step-text">
        <strong>Limitations of a pure client-side proxy</strong>
        <p>Sites that detect proxies (via JS, TLS fingerprinting, or IP checks) will block this.
           Real proxies like Ultraviolet use a <strong>Bare server</strong> — a lightweight Node.js backend
           that forwards raw TCP/WebSocket connections, making the proxy undetectable at the HTTP level.</p>
      </div>
    </div>
  </div>

</div>

<script src="/assets/js/tunnelvision.js"></script>
