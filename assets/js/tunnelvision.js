/**
 * TunnelVision — Main proxy controller
 *
 * This script runs on the proxy page itself and handles:
 *   1. Registering the Service Worker
 *   2. Handling the URL bar input
 *   3. Navigating the proxy iframe
 *   4. Showing the "how it works" panel
 */

const TV = {
  sw: null,
  iframe: null,
  urlBar: null,
  statusEl: null,
  logEl: null,

  // These are set by window.TV_CONFIG, injected by the Jekyll page
  // via a <script> block using {{ site.baseurl }} Liquid tags.
  get BASEURL()      { return (window.TV_CONFIG && window.TV_CONFIG.baseurl)      || ''; },
  get PROXY_PREFIX() { return (window.TV_CONFIG && window.TV_CONFIG.proxyPrefix)  || '/TVP/proxy/'; },
  get SW_PATH()      { return (window.TV_CONFIG && window.TV_CONFIG.swPath)       || '/tunnelvision-sw.js'; },
  get SW_SCOPE()     { return (window.TV_CONFIG && window.TV_CONFIG.swScope)      || '/TVP/'; },
  get BACKEND_URL()  { return (window.TV_CONFIG && window.TV_CONFIG.backendURL)   || 'http://localhost:4601'; },

  async init() {
    this.iframe = document.getElementById('tv-frame');
    this.urlBar = document.getElementById('tv-url');
    this.statusEl = document.getElementById('tv-status');
    this.logEl = document.getElementById('tv-log');

    await this.registerServiceWorker();
    this.bindEvents();
  },

  /**
   * STEP 1: Register the Service Worker.
   *
   * The SW must be registered for the scope that covers our proxy URLs.
   * Scope '/TVP/' means it intercepts all requests under that path.
   * The SW file itself must live at or above that scope.
   */
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      this.setStatus('error', 'Service Workers not supported in this browser');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.register(
        this.SW_PATH,
        { scope: this.SW_SCOPE }
      );
      this.log('SW registered', `Scope: ${reg.scope}`);

      // Wait until the SW is actually active and controlling the page
      if (reg.installing) {
        await new Promise((resolve) => {
          reg.installing.addEventListener('statechange', (e) => {
            if (e.target.state === 'activated') resolve();
          });
        });
      }

      this.sw = reg;
      // Tell the SW its proxy prefix (needed because it can't read Liquid vars)
      const sw = reg.active || reg.installing || reg.waiting;
      const config = { type: 'SET_CONFIG', proxyPrefix: this.PROXY_PREFIX, backendURL: this.BACKEND_URL };
      if (sw) sw.postMessage(config);
      navigator.serviceWorker.ready.then((r) => {
        r.active.postMessage(config);
      });
      this.setStatus('ready', 'Service Worker active — proxy ready');
      this.log('SW activated', `Intercepting: ${this.SW_SCOPE}`);
    } catch (err) {
      this.setStatus('error', `SW registration failed: ${err.message}`);
      this.log('SW error', err.message);
    }
  },

  /**
   * Navigate to a URL through the proxy.
   *
   * STEP 2: URL encoding.
   * We encode the target URL and prepend our proxy prefix.
   * The SW sees /TVP/proxy/<encoded-url> and knows to intercept it.
   */
  navigate(rawURL) {
    let url = rawURL.trim();

    // Add protocol if missing — just like a real browser address bar
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Check if it looks like a URL or a search query
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        // Treat as search query — route through DuckDuckGo
        url = 'https://duckduckgo.com/?q=' + encodeURIComponent(url);
      }
    }

    this.urlBar.value = url;

    // Build the proxied URL — the iframe loads this, the SW intercepts it
    const proxiedURL = this.PROXY_PREFIX + encodeURIComponent(url);
    this.log('Navigating', `${url} → ${proxiedURL}`);
    this.setStatus('loading', `Loading ${url}...`);

    this.iframe.src = proxiedURL;
  },

  bindEvents() {
    // URL bar — press Enter or click Go
    this.urlBar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.navigate(this.urlBar.value);
    });

    document.getElementById('tv-go').addEventListener('click', () => {
      this.navigate(this.urlBar.value);
    });

    // Update URL bar when iframe navigates (via SW-rewritten links)
    this.iframe.addEventListener('load', () => {
      const src = this.iframe.src;
      if (src.includes(this.PROXY_PREFIX)) {
        try {
          const encoded = src.replace(location.origin + this.PROXY_PREFIX, '');
          const real = decodeURIComponent(encoded.split('?')[0]);
          this.urlBar.value = real;
          this.setStatus('ready', `Loaded: ${real}`);
          this.log('Page loaded', real);
        } catch {}
      }
    });

    // Demo buttons
    document.querySelectorAll('[data-tv-url]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.navigate(btn.dataset.tvUrl);
      });
    });

    // Toggle how-it-works panel
    const panel = document.getElementById('tv-how');
    document.getElementById('tv-how-toggle').addEventListener('click', () => {
      panel.classList.toggle('tv-hidden');
    });

    // Localized button — checks if Flask proxy backend is reachable
    this.initLocalized();
  },

  initLocalized() {
    const btn      = document.getElementById('tv-localized');
    const modal    = document.getElementById('tv-local-modal');
    const statusEl = document.getElementById('tv-local-status');
    const closeBtn = document.getElementById('tv-local-close');
    let pollTimer  = null;

    const check = async () => {
      btn.classList.remove('state-unknown', 'state-up', 'state-down');
      btn.classList.add('state-checking');
      try {
        const r = await fetch(`${this.BACKEND_URL}/health`, { signal: AbortSignal.timeout(2000) });
        const data = await r.json();
        if (data.status === 'ok') {
          btn.classList.replace('state-checking', 'state-up');
          btn.title = 'Backend connected';
          statusEl.textContent = '● Backend connected — proxy is active';
          statusEl.className = 'tv-modal-status up';
          // Stop polling once connected
          clearInterval(pollTimer);
          pollTimer = null;
          return true;
        }
      } catch {}
      btn.classList.replace('state-checking', 'state-down');
      btn.title = 'Backend not running — click for instructions';
      statusEl.textContent = '● Not running — start the server and wait…';
      statusEl.className = 'tv-modal-status down';
      return false;
    };

    // Start polling every 2s so the button auto-turns green when server starts
    const startPolling = () => {
      if (pollTimer) return;
      pollTimer = setInterval(check, 2000);
    };

    btn.addEventListener('click', async () => {
      modal.classList.add('open');
      await check();
      startPolling(); // Keep checking while modal is open
    });

    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });

    // Copy buttons
    modal.querySelectorAll('[data-copy]').forEach((b) => {
      b.addEventListener('click', () => {
        navigator.clipboard.writeText(b.dataset.copy).then(() => {
          const orig = b.textContent;
          b.textContent = 'Copied!';
          setTimeout(() => { b.textContent = orig; }, 1500);
        });
      });
    });

    // Initial silent check on load (no modal)
    check().then((up) => { if (!up) startPolling(); });
  },

  setStatus(state, message) {
    this.statusEl.className = `tv-status tv-status--${state}`;
    this.statusEl.textContent = message;
  },

  log(event, detail) {
    const now = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.className = 'tv-log-line';
    line.innerHTML = `<span class="tv-log-time">${now}</span> <span class="tv-log-event">${event}</span> <span class="tv-log-detail">${detail}</span>`;
    this.logEl.prepend(line);
    // Keep log at 20 lines
    while (this.logEl.children.length > 20) {
      this.logEl.removeChild(this.logEl.lastChild);
    }
  },
};

document.addEventListener('DOMContentLoaded', () => TV.init());
