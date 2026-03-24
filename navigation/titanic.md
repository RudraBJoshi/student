---
layout: default
permalink: /titanic
title: Titanic Survival Predictor
---

<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">

<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Night sky + deep ocean background ── */
    body {
      font-family: 'Crimson Text', Georgia, serif;
      background-color: #04080f;
      background-image:
        radial-gradient(ellipse at 20% 15%, rgba(10,30,70,0.9) 0%, transparent 55%),
        radial-gradient(ellipse at 80% 10%, rgba(5,15,40,0.8) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 100%, rgba(0,20,50,0.95) 0%, transparent 60%);
      min-height: 100vh;
      color: #c8d8e8;
      position: relative;
      overflow-x: hidden;
    }

    /* Starfield */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image:
        radial-gradient(1px 1px at 10% 8%, rgba(255,255,255,0.9) 0%, transparent 100%),
        radial-gradient(1px 1px at 25% 3%, rgba(255,255,255,0.7) 0%, transparent 100%),
        radial-gradient(1px 1px at 40% 12%, rgba(255,255,255,0.8) 0%, transparent 100%),
        radial-gradient(1px 1px at 55% 5%, rgba(255,255,255,0.6) 0%, transparent 100%),
        radial-gradient(1px 1px at 70% 9%, rgba(255,255,255,0.9) 0%, transparent 100%),
        radial-gradient(1px 1px at 85% 4%, rgba(255,255,255,0.7) 0%, transparent 100%),
        radial-gradient(1px 1px at 15% 18%, rgba(255,255,255,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 33% 22%, rgba(255,255,255,0.8) 0%, transparent 100%),
        radial-gradient(1px 1px at 62% 17%, rgba(255,255,255,0.6) 0%, transparent 100%),
        radial-gradient(1px 1px at 78% 20%, rgba(255,255,255,0.7) 0%, transparent 100%),
        radial-gradient(1.5px 1.5px at 90% 14%, rgba(255,255,255,0.9) 0%, transparent 100%),
        radial-gradient(1px 1px at 5% 28%, rgba(255,255,255,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 48% 25%, rgba(255,255,255,0.7) 0%, transparent 100%),
        radial-gradient(1px 1px at 95% 30%, rgba(255,255,255,0.6) 0%, transparent 100%);
      pointer-events: none;
      z-index: 0;
    }

    /* ── Header ── */
    header {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 48px 20px 32px;
      border-bottom: 1px solid rgba(180,150,80,0.3);
      background: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%);
    }

    .header-rule {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 18px;
      color: #c9a84c;
      font-size: 1.1rem;
      letter-spacing: 6px;
    }

    .header-rule::before,
    .header-rule::after {
      content: '';
      flex: 1;
      max-width: 120px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #c9a84c, transparent);
    }

    header h1 {
      font-family: 'Cinzel', serif;
      font-size: 2.6rem;
      font-weight: 700;
      color: #e8d49e;
      letter-spacing: 4px;
      text-shadow: 0 0 40px rgba(201,168,76,0.4), 0 2px 4px rgba(0,0,0,0.8);
      margin-bottom: 10px;
    }

    header .subtitle {
      font-family: 'Crimson Text', serif;
      font-style: italic;
      color: #8aa8c0;
      font-size: 1.05rem;
      letter-spacing: 1px;
    }

    header .voyage-info {
      margin-top: 14px;
      font-size: 0.78rem;
      letter-spacing: 3px;
      color: #6a8a9e;
      text-transform: uppercase;
      font-family: 'Cinzel', serif;
    }

    /* ── Layout ── */
    .container {
      position: relative;
      z-index: 1;
      max-width: 920px;
      margin: 40px auto 60px;
      padding: 0 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    @media (max-width: 680px) {
      .container { grid-template-columns: 1fr; }
      header h1 { font-size: 1.8rem; }
    }

    /* ── Manifest cards ── */
    .card {
      background: rgba(5, 15, 35, 0.75);
      border: 1px solid rgba(180,150,80,0.25);
      border-radius: 4px;
      padding: 28px;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,168,76,0.1);
      position: relative;
    }

    .card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #c9a84c, transparent);
      border-radius: 4px 4px 0 0;
    }

    .card h2 {
      font-family: 'Cinzel', serif;
      color: #c9a84c;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(180,150,80,0.2);
    }

    /* ── Form elements ── */
    label {
      display: block;
      font-family: 'Cinzel', serif;
      font-size: 0.72rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #7a9ab0;
      margin-bottom: 5px;
      margin-top: 16px;
    }

    input[type="text"],
    input[type="number"],
    select {
      width: 100%;
      padding: 9px 12px;
      background: rgba(0,0,0,0.4);
      border: 1px solid rgba(180,150,80,0.2);
      border-radius: 3px;
      color: #d8e8f4;
      font-family: 'Crimson Text', serif;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    input[type="text"]:focus,
    input[type="number"]:focus,
    select:focus {
      border-color: #c9a84c;
      box-shadow: 0 0 0 2px rgba(201,168,76,0.1);
    }

    select option { background: #0a1828; }

    .radio-group {
      display: flex;
      gap: 24px;
      margin-top: 7px;
    }

    .radio-group label {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 7px;
      cursor: pointer;
      font-size: 0.85rem;
      letter-spacing: 1px;
      color: #b0c8dc;
      text-transform: none;
      font-family: 'Crimson Text', serif;
    }

    .radio-group input[type="radio"] { accent-color: #c9a84c; }

    /* ── Predict button ── */
    button#predict-btn {
      grid-column: 1 / -1;
      width: 100%;
      padding: 15px;
      background: linear-gradient(180deg, #1a4a70 0%, #0d2e4a 100%);
      color: #e8d49e;
      border: 1px solid rgba(201,168,76,0.5);
      border-radius: 3px;
      font-family: 'Cinzel', serif;
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.25s;
      box-shadow: 0 2px 12px rgba(0,0,0,0.4);
      margin-top: 4px;
    }

    button#predict-btn:hover {
      background: linear-gradient(180deg, #215a8a 0%, #123858 100%);
      border-color: #c9a84c;
      box-shadow: 0 0 20px rgba(201,168,76,0.2);
    }

    button#predict-btn:active { transform: scale(0.99); }
    button#predict-btn:disabled { opacity: 0.45; cursor: default; }

    /* ── Result section ── */
    #result-section {
      grid-column: 1 / -1;
      display: none;
    }

    #result-section.visible { display: block; }

    .result-card {
      background: rgba(5, 15, 35, 0.85);
      border: 1px solid rgba(180,150,80,0.3);
      border-radius: 4px;
      padding: 36px 28px;
      text-align: center;
      box-shadow: 0 4px 32px rgba(0,0,0,0.6);
      position: relative;
    }

    .result-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #c9a84c, transparent);
    }

    .result-title {
      font-family: 'Cinzel', serif;
      font-size: 0.8rem;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #7a9ab0;
      margin-bottom: 28px;
    }

    .probability-bars {
      display: flex;
      gap: 24px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 32px;
    }

    .prob-item { flex: 1; min-width: 160px; max-width: 220px; }

    .prob-label {
      font-family: 'Cinzel', serif;
      font-size: 0.7rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #6a8a9e;
      margin-bottom: 10px;
    }

    .prob-value {
      font-family: 'Cinzel', serif;
      font-size: 2.4rem;
      font-weight: 700;
    }

    .prob-value.survive { color: #4cce88; }
    .prob-value.die     { color: #c05050; }

    .prob-bar-track {
      height: 6px;
      background: rgba(255,255,255,0.08);
      border-radius: 3px;
      margin-top: 12px;
      overflow: hidden;
    }

    .prob-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .prob-bar-fill.survive { background: linear-gradient(90deg, #1a7a42, #4cce88); }
    .prob-bar-fill.die     { background: linear-gradient(90deg, #7a1a1a, #c05050); }

    /* ── Verdict banner ── */
    #verdict {
      font-family: 'Cinzel', serif;
      font-size: 1rem;
      letter-spacing: 2px;
      padding: 16px 28px;
      border-radius: 3px;
      display: inline-block;
      font-weight: 600;
      margin-bottom: 32px;
    }

    #verdict.survived {
      background: rgba(76,206,136,0.1);
      color: #4cce88;
      border: 1px solid rgba(76,206,136,0.35);
    }

    #verdict.perished {
      background: rgba(192,80,80,0.1);
      color: #c05050;
      border: 1px solid rgba(192,80,80,0.35);
    }

    /* ── Feature importance ── */
    .features-title {
      font-family: 'Cinzel', serif;
      font-size: 0.72rem;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #c9a84c;
      margin-bottom: 16px;
      text-align: left;
      padding-top: 4px;
      border-top: 1px solid rgba(180,150,80,0.2);
      padding-top: 20px;
    }

    .feature-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 9px;
    }

    .feature-name {
      width: 130px;
      font-family: 'Crimson Text', serif;
      font-size: 0.85rem;
      color: #7a9ab0;
      text-align: right;
      flex-shrink: 0;
    }

    .feature-track {
      flex: 1;
      height: 6px;
      background: rgba(255,255,255,0.07);
      border-radius: 3px;
      overflow: hidden;
    }

    .feature-fill {
      height: 100%;
      background: linear-gradient(90deg, #1a4a70, #c9a84c);
      border-radius: 3px;
      transition: width 0.6s ease;
    }

    .feature-pct {
      width: 42px;
      font-family: 'Crimson Text', serif;
      font-size: 0.82rem;
      color: #5a7a8e;
      text-align: right;
      flex-shrink: 0;
    }

    /* ── Error + spinner ── */
    #error-msg {
      grid-column: 1 / -1;
      color: #c07070;
      font-style: italic;
      font-size: 0.95rem;
      text-align: center;
      margin-top: 4px;
      min-height: 20px;
    }

    .spinner {
      display: none;
      width: 22px;
      height: 22px;
      border: 2px solid rgba(201,168,76,0.2);
      border-top-color: #c9a84c;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Override Nighthawk theme !important color rules ── */
    header h1, .card h2, .result-title, .features-title,
    .prob-label, .feature-name, .feature-pct, .prob-value,
    #verdict, #error-msg, .header-rule, .voyage-info {
      color: inherit !important;
    }

    header h1 { color: #e8d49e !important; }
    header p, .subtitle { color: #8aa8c0 !important; }
    .voyage-info { color: #6a8a9e !important; }
    .card h2 { color: #c9a84c !important; }
    .result-title { color: #7a9ab0 !important; }
    .features-title { color: #c9a84c !important; }
    .prob-label { color: #6a8a9e !important; }
    .prob-value.survive { color: #4cce88 !important; }
    .prob-value.die { color: #c05050 !important; }
    #verdict.survived { color: #4cce88 !important; }
    #verdict.perished { color: #c05050 !important; }
    #error-msg { color: #c07070 !important; }
    label { color: #7a9ab0 !important; }
    .feature-name { color: #7a9ab0 !important; }
    .feature-pct { color: #5a7a8e !important; }
    .radio-group label { color: #b0c8dc !important; }
    button#predict-btn { color: #e8d49e !important; }

    /* ── Footer wave ── */
    .ocean-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(180deg, transparent, rgba(0,15,40,0.9));
      pointer-events: none;
      z-index: 0;
    }
  </style>
</head>
<body>
  <header>
    <div class="header-rule">⚓</div>
    <h1>R.M.S. TITANIC</h1>
    <p class="subtitle">Passenger Survival Predictor — April 15, 1912</p>
    <p class="voyage-info">Southampton &nbsp;✦&nbsp; Cherbourg &nbsp;✦&nbsp; Queenstown &nbsp;✦&nbsp; New York</p>
  </header>

  <div class="container">

    <!-- Left card: Personal info -->
    <div class="card">
      <h2>Passenger Details</h2>

      <label for="name">Full Name</label>
      <input type="text" id="name" placeholder="e.g. Jane Smith" />

      <label>Sex</label>
      <div class="radio-group">
        <label><input type="radio" name="sex" value="male" checked /> Male</label>
        <label><input type="radio" name="sex" value="female" /> Female</label>
      </div>

      <label for="age">Age</label>
      <input type="number" id="age" value="30" min="0" max="100" />

      <label for="pclass">Class of Travel</label>
      <select id="pclass">
        <option value="1">First Class — Upper Deck</option>
        <option value="2" selected>Second Class — Middle Deck</option>
        <option value="3">Third Class — Steerage</option>
      </select>

      <label>Travelling Alone?</label>
      <div class="radio-group">
        <label><input type="radio" name="alone" value="false" checked /> No, with family</label>
        <label><input type="radio" name="alone" value="true" /> Yes, alone</label>
      </div>
    </div>

    <!-- Right card: Travel info -->
    <div class="card">
      <h2>Voyage Details</h2>

      <label for="sibsp">Siblings / Spouses Aboard</label>
      <input type="number" id="sibsp" value="1" min="0" max="10" />

      <label for="parch">Parents / Children Aboard</label>
      <input type="number" id="parch" value="0" min="0" max="10" />

      <label for="fare">Fare Paid (£)</label>
      <input type="number" id="fare" value="16.00" min="0" max="512" step="0.01" />

      <label for="embarked">Port of Embarkation</label>
      <select id="embarked">
        <option value="S" selected>Southampton, England</option>
        <option value="C">Cherbourg, France</option>
        <option value="Q">Queenstown, Ireland</option>
      </select>
    </div>

    <!-- Predict button -->
    <button id="predict-btn" onclick="predict()">⚓ &nbsp; Consult the Manifest</button>
    <div id="error-msg"></div>

    <!-- Result section -->
    <div id="result-section">
      <div class="result-card">
        <div class="spinner" id="spinner"></div>
        <div class="result-title" id="result-name"></div>

        <div class="probability-bars">
          <div class="prob-item">
            <div class="prob-label">Rescued</div>
            <div class="prob-value survive" id="survive-pct">—</div>
            <div class="prob-bar-track">
              <div class="prob-bar-fill survive" id="survive-bar" style="width:0%"></div>
            </div>
          </div>
          <div class="prob-item">
            <div class="prob-label">Lost at Sea</div>
            <div class="prob-value die" id="die-pct">—</div>
            <div class="prob-bar-track">
              <div class="prob-bar-fill die" id="die-bar" style="width:0%"></div>
            </div>
          </div>
        </div>

        <div id="verdict"></div>

        <div style="text-align:left;">
          <div class="features-title">✦ &nbsp; Deciding Factors</div>
          <div id="feature-bars"></div>
        </div>
      </div>
    </div>

  </div>

  <div class="ocean-footer"></div>

  <script type="module">
    import { pythonURI, fetchOptions } from '{{ site.baseurl }}/assets/js/api/config.js';

    window.predict = async function () {
      const errorEl = document.getElementById('error-msg');
      errorEl.textContent = '';

      const name   = document.getElementById('name').value.trim() || 'Passenger';
      const sex    = document.querySelector('input[name="sex"]:checked').value;
      const age    = parseFloat(document.getElementById('age').value);
      const pclass = parseInt(document.getElementById('pclass').value);
      const alone  = document.querySelector('input[name="alone"]:checked').value === 'true';
      const sibsp  = parseInt(document.getElementById('sibsp').value);
      const parch  = parseInt(document.getElementById('parch').value);
      const fare   = parseFloat(document.getElementById('fare').value);
      const embarked = document.getElementById('embarked').value;

      if (isNaN(age) || isNaN(fare)) {
        errorEl.textContent = 'Please fill in all numeric fields correctly.';
        return;
      }

      const passenger = { name, pclass, sex, age, sibsp, parch, fare, embarked, alone };

      const btn = document.getElementById('predict-btn');
      const spinner = document.getElementById('spinner');
      btn.disabled = true;
      spinner.style.display = 'block';
      document.getElementById('result-section').classList.remove('visible');

      try {
        const response = await fetch(`${pythonURI}/api/titanic/predict`, {
          ...fetchOptions,
          method: 'POST',
          body: JSON.stringify(passenger),
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();

        const surviveP = (data.survive * 100).toFixed(1);
        const dieP     = (data.die * 100).toFixed(1);

        document.getElementById('survive-pct').textContent = surviveP + '%';
        document.getElementById('die-pct').textContent     = dieP + '%';
        document.getElementById('survive-bar').style.width = surviveP + '%';
        document.getElementById('die-bar').style.width     = dieP + '%';

        const verdictEl = document.getElementById('verdict');
        if (data.survive >= 0.5) {
          verdictEl.textContent = `✦  ${name} — Rescued by the Carpathia  ✦`;
          verdictEl.className = 'survived';
        } else {
          verdictEl.textContent = `✦  ${name} — Lost in the North Atlantic  ✦`;
          verdictEl.className = 'perished';
        }

        document.getElementById('result-name').textContent =
          `Manifest Entry — ${name}`;

        const fwResp = await fetch(`${pythonURI}/api/titanic/feature-weights`, {
          ...fetchOptions,
          method: 'GET',
        });
        if (fwResp.ok) {
          const fw = await fwResp.json();
          const container = document.getElementById('feature-bars');
          container.innerHTML = '';
          const sorted = Object.entries(fw).sort((a,b) => b[1]-a[1]);
          const maxW = sorted[0]?.[1] || 1;
          for (const [feat, weight] of sorted) {
            const pct = (weight * 100).toFixed(1);
            const barW = ((weight / maxW) * 100).toFixed(1);
            container.innerHTML += `
              <div class="feature-row">
                <div class="feature-name">${feat.replace('embarked_', 'port ')}</div>
find: ‘_notebooks/CSP’: No such file or directory
Stopping server...
Stopping logging process...
Starting server...
Server PID: 674
Terminal logging starting, watching server...
Server timed out after 60 seconds.
Review errors from /tmp/jekyll4600.log.
Configuration file: /home/rudra/coding/student/_config.yml
To use retry middleware with Faraday v2.0+, install `faraday-retry` gem
            Source: /home/rudra/coding/student
       Destination: /home/rudra/coding/student/_site
 Incremental build: disabled. Enable with --incremental
      Generating...
      Remote Theme: Using theme jekyll/minima
make: *** [Makefile:32: default] Error 1
(venv) rudra:~/coding/student$                <div class="feature-track">
                  <div class="feature-fill" style="width:${barW}%"></div>
                </div>
                <div class="feature-pct">${pct}%</div>
              </div>`;
          }
        }

        document.getElementById('result-section').classList.add('visible');
      } catch (err) {
        errorEl.textContent = 'Could not reach the prediction server. Is the Flask backend running?';
        console.error(err);
      } finally {
        btn.disabled = false;
        spinner.style.display = 'none';
      }
    };
  </script>
</body>
</html>
