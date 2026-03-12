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

  PROXY_PREFIX: '/TVP/proxy/',

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
        '/assets/js/tunnelvision-sw.js',
        { scope: '/TVP/' }
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
      this.setStatus('ready', 'Service Worker active — proxy ready');
      this.log('SW activated', 'All requests under /TVP/ are now intercepted');
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
          const real = decodeURIComponent(encoded);
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
