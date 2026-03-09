---
layout: default
title: How The Internet
permalink: /hacks/HowInternet/
---
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',sans-serif;background:#0a0f1e;color:#e2e8f0;min-height:100vh;padding:16px}
h1{font-size:1.6rem;font-weight:700;color:#38bdf8;margin-bottom:4px}
.subtitle{font-size:0.8rem;color:#64748b;margin-bottom:14px}
.layout{display:grid;grid-template-columns:290px 1fr;gap:14px}
@media(max-width:900px){.layout{grid-template-columns:1fr}}

.stats-panel{background:#111827;border:1px solid #1e293b;border-radius:14px;padding:14px;position:sticky;top:16px;align-self:start}
.stat-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #1e293b;font-size:0.83rem}
.stat-row:last-child{border-bottom:none}
.stat-label{color:#94a3b8;display:flex;align-items:center;gap:5px}
.stat-val{font-weight:700;font-size:0.97rem}
.val-good{color:#4ade80}.val-warn{color:#facc15}.val-bad{color:#f87171}.val-blue{color:#38bdf8}.val-purple{color:#a78bfa}.val-orange{color:#fb923c}

.latency-bar{margin-top:10px;background:#1e293b;border-radius:8px;height:8px;overflow:hidden}
.latency-fill{height:100%;border-radius:8px;transition:width 0.4s,background 0.4s}
.energy-bar{margin-top:6px;display:flex;gap:4px}
.energy-pip{width:18px;height:18px;border-radius:4px;border:1px solid #334155;background:#1e293b;transition:0.2s}
.energy-pip.full{background:#facc15;border-color:#facc15;box-shadow:0 0 6px #facc1580}

.tier-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:0.72rem;font-weight:700;margin-top:8px;width:100%;text-align:center}

.btn{padding:8px 14px;border:none;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;transition:0.15s}
.btn:hover{opacity:0.85;transform:translateY(-1px)}
.btn:active{transform:translateY(0)}
.btn-primary{background:#38bdf8;color:#0a0f1e}
.btn-secondary{background:#1e293b;color:#94a3b8;border:1px solid #334155}
.btn-sm{padding:5px 10px;font-size:0.78rem}
.btn-play{width:100%;margin-top:8px;background:linear-gradient(135deg,#3b82f6,#6366f1);color:white;padding:6px;font-size:0.78rem}
.btn-play:disabled{opacity:0.3;cursor:not-allowed;transform:none}
.btn-play.no-energy{background:#374151;color:#6b7280}
.actions{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}

.turn-info{background:#1e293b;border-radius:8px;padding:7px 10px;margin-top:10px;font-size:0.77rem;color:#94a3b8;line-height:1.7}
.turn-info b{color:#e2e8f0}

.decay-warn{color:#f87171;font-size:0.72rem;margin-top:4px;text-align:center}

.main-area{display:flex;flex-direction:column;gap:14px}
.diagram{background:#111827;border:1px solid #1e293b;border-radius:14px;padding:14px}
.diagram h3{font-size:0.87rem;color:#94a3b8;margin-bottom:8px}
svg{width:100%;height:190px}

.hand-section{background:#111827;border:1px solid #1e293b;border-radius:14px;padding:14px}
.hand-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.hand-header h3{font-size:0.87rem;color:#94a3b8}
.hand{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}

.card{border-radius:12px;padding:11px;border:1px solid;transition:0.2s;position:relative;overflow:hidden}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
.card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.5)}
.card-infra{background:#0f1d2e;border-color:#1e4a7a}.card-infra::before{background:#38bdf8}
.card-server{background:#0f1f14;border-color:#1e4a2a}.card-server::before{background:#4ade80}
.card-protocol{background:#1a0f2e;border-color:#3d1e7a}.card-protocol::before{background:#a78bfa}
.card-security{background:#1f1a0a;border-color:#5a4010}.card-security::before{background:#facc15}
.card-attack{background:#1f0a0a;border-color:#5a1010}.card-attack::before{background:#f87171}
.card-special{background:#1a1a0f;border-color:#4a4a10}.card-special::before{background:#fb923c}
.card-upgrade{background:#0f1a1f;border-color:#1e5a5a}.card-upgrade::before{background:#2dd4bf}

.card-icon{font-size:1.25rem;margin-bottom:3px}
.card-name{font-size:0.85rem;font-weight:700;margin-bottom:2px}
.card-cat{font-size:0.62rem;text-transform:uppercase;letter-spacing:1px;opacity:0.55;margin-bottom:3px}
.card-desc{font-size:0.72rem;opacity:0.8;line-height:1.4;margin-bottom:2px}
.card-cost-badge{position:absolute;top:8px;right:8px;border-radius:20px;padding:2px 8px;font-size:0.7rem;font-weight:800}
.cost-1{background:#1e3a5f;color:#60a5fa}
.cost-2{background:#3d2e0a;color:#facc15}
.cost-3{background:#3a0f1e;color:#f472b6}
.cost-4{background:#2a0a3a;color:#c084fc}
.cost-atk{background:#3a0a0a;color:#f87171}

.win-goals{background:#0f172a;border-radius:8px;padding:8px;font-size:0.71rem;color:#64748b;line-height:1.8;margin-top:8px}
.win-goals b{color:#94a3b8}
.goal-done{color:#4ade80!important}

.log-section{background:#111827;border:1px solid #1e293b;border-radius:14px;padding:14px}
.log-section h3{font-size:0.87rem;color:#94a3b8;margin-bottom:8px}
.log{max-height:130px;overflow-y:auto;font-size:0.74rem;line-height:1.75}
.log-entry{padding:1px 0;border-bottom:1px solid #0f172a}
.log-good{color:#4ade80}.log-bad{color:#f87171}.log-info{color:#38bdf8}.log-warn{color:#facc15}.log-special{color:#fb923c}.log-upgrade{color:#2dd4bf}

.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:100;align-items:center;justify-content:center}
.modal-overlay.show{display:flex}
.modal{background:#111827;border:1px solid #334155;border-radius:20px;padding:32px;text-align:center;max-width:420px;width:90%}
.modal h2{font-size:1.7rem;margin-bottom:10px}
.modal p{color:#94a3b8;margin-bottom:20px;line-height:1.7;white-space:pre-line}

.legend{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}
.legend-item{font-size:0.67rem;padding:2px 7px;border-radius:10px;border:1px solid}

.discard-info{font-size:0.7rem;color:#475569;margin-top:4px;text-align:right}
</style>

<h1>🌐 How The Internet</h1>
<p class="subtitle">You start as a lone router with 1 device and 200ms latency. The internet is slow, unstable, and growing. Build it up — before it collapses.</p>

<div class="layout">
  <div class="stats-panel">
    <div class="stat-row"><span class="stat-label">🔀 Endpoints</span><span class="stat-val val-blue" id="s-endpoints">1</span></div>
    <div class="stat-row"><span class="stat-label">⚡ Bandwidth</span><span class="stat-val val-blue" id="s-bandwidth">10 Mbps</span></div>
    <div class="stat-row"><span class="stat-label">🕐 Latency</span><span class="stat-val val-bad" id="s-latency">200 ms</span></div>
    <div class="stat-row"><span class="stat-label">🖥️ Servers</span><span class="stat-val val-good" id="s-servers">0</span></div>
    <div class="stat-row"><span class="stat-label">🔒 Security</span><span class="stat-val val-warn" id="s-security">0</span></div>
    <div class="stat-row"><span class="stat-label">👥 Users</span><span class="stat-val val-purple" id="s-users">1</span></div>
    <div class="stat-row"><span class="stat-label">🃏 Deck</span><span class="stat-val" id="s-deck">—</span></div>

    <div style="margin-top:10px;font-size:0.75rem;color:#94a3b8;margin-bottom:4px">⚡ Energy this turn</div>
    <div class="energy-bar" id="energy-bar"></div>
    <div style="font-size:0.68rem;color:#475569;margin-top:3px" id="energy-text">3 / 3</div>

    <div class="latency-bar"><div class="latency-fill" id="latency-fill" style="width:100%;background:#ef4444"></div></div>
    <div style="font-size:0.65rem;color:#475569;margin-top:3px;text-align:center">Latency (lower = better — decays +4ms/turn)</div>

    <div id="tier-badge" class="tier-badge" style="background:#1e293b;color:#64748b">🔌 Tier 0 — Dial-Up</div>

    <div class="turn-info">
      Turn <b id="s-turn">1</b> &nbsp;|&nbsp; Plays: <b id="s-played">0</b>/3 &nbsp;|&nbsp; Hand: <b id="s-hand">0</b>
    </div>
    <div class="decay-warn" id="decay-warn"></div>

    <div class="actions">
      <button class="btn btn-primary" onclick="drawCards()" id="btn-draw">Draw 2 Cards</button>
      <button class="btn btn-secondary btn-sm" onclick="endTurn()">End Turn →</button>
      <button class="btn btn-secondary btn-sm" onclick="restartGame()">↺ Restart</button>
    </div>

    <div style="margin-top:10px">
      <div class="legend">
        <span class="legend-item" style="border-color:#1e4a7a;color:#38bdf8">🔀 Infra</span>
        <span class="legend-item" style="border-color:#1e4a2a;color:#4ade80">🖥️ Server</span>
        <span class="legend-item" style="border-color:#3d1e7a;color:#a78bfa">📡 Protocol</span>
        <span class="legend-item" style="border-color:#5a4010;color:#facc15">🔒 Security</span>
        <span class="legend-item" style="border-color:#5a1010;color:#f87171">💀 Event (auto)</span>
        <span class="legend-item" style="border-color:#4a4a10;color:#fb923c">✨ Special</span>
        <span class="legend-item" style="border-color:#1e5a5a;color:#2dd4bf">🔧 Upgrade</span>
      </div>
    </div>

    <div class="win-goals" id="win-goals">
      <b>Win Conditions:</b><br>
      <span id="g-latency">◻ Latency ≤ 8ms</span><br>
      <span id="g-users">◻ 5,000+ Users</span><br>
      <span id="g-security">◻ Security ≥ 15</span><br>
      <span id="g-servers">◻ 10+ Servers</span><br>
      <span id="g-bandwidth">◻ 1,000+ Mbps</span>
    </div>
  </div>

  <div class="main-area">
    <div class="diagram">
      <h3>Network Topology</h3>
      <svg id="network" viewBox="0 0 720 190"></svg>
    </div>

    <div class="hand-section">
      <div class="hand-header">
        <h3>Your Hand</h3>
        <span id="hand-count" style="font-size:0.78rem;color:#475569">0 cards</span>
      </div>
      <div class="hand" id="hand"></div>
      <div id="hand-empty" style="color:#334155;font-size:0.82rem;text-align:center;padding:20px">Draw cards to start your turn. Network decays +4ms each turn — don't wait too long.</div>
      <div class="discard-info" id="discard-info"></div>
    </div>

    <div class="log-section">
      <h3>Event Log</h3>
      <div class="log" id="log"></div>
    </div>
  </div>
</div>

<div class="modal-overlay" id="modal">
  <div class="modal">
    <h2 id="modal-title">🎉 Victory!</h2>
    <p id="modal-body"></p>
    <button class="btn btn-primary" onclick="restartGame()">Play Again</button>
  </div>
</div>

<script>
// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════
let G = {
  endpoints:1, bandwidth:10, latency:200,
  servers:0, security:0, users:1,
  turn:1, playsThisTurn:0, maxPlays:3,
  energy:3, maxEnergy:3, energyPerTurn:3,
  drawnThisTurn:false,
  hand:[], deck:[],
  won:false, lost:false,
  discarded:0,
  permanents:{ extraEnergy:0, decayShield:false, serverBoost:false },
};

// ═══════════════════════════════════════════════════════════════
// CARDS (62 total)
// ═══════════════════════════════════════════════════════════════
const ALL_CARDS = [

  // ── INFRASTRUCTURE (15) ──────────────────────────────────────
  {id:1, cat:'infra', icon:'🔀', name:'Basic Router',
   cost:1, desc:'+2 endpoints, -3ms. The starting block.',
   fx:g=>{g.endpoints+=2; g.latency=Math.max(1,g.latency-3);}},

  {id:2, cat:'infra', icon:'🔀', name:'Enterprise Router',
   cost:2, desc:'+5 endpoints, -8ms. Handles real routing tables.',
   fx:g=>{g.endpoints+=5; g.latency=Math.max(1,g.latency-8);}},

  {id:3, cat:'infra', icon:'🔀', name:'Core Router',
   cost:3, desc:'+10 endpoints, +25 Mbps, -12ms. Backbone-grade.',
   fx:g=>{g.endpoints+=10; g.bandwidth+=25; g.latency=Math.max(1,g.latency-12);}},

  {id:4, cat:'infra', icon:'🔌', name:'24-Port Switch',
   cost:1, desc:'+4 endpoints. Cheap and reliable.',
   fx:g=>{g.endpoints+=4;}},

  {id:5, cat:'infra', icon:'🔌', name:'48-Port Switch',
   cost:1, desc:'+8 endpoints, -3ms (less broadcast congestion).',
   fx:g=>{g.endpoints+=8; g.latency=Math.max(1,g.latency-3);}},

  {id:6, cat:'infra', icon:'🔌', name:'Managed Switch',
   cost:2, desc:'+6 endpoints, -7ms. VLANs cut broadcast noise.',
   fx:g=>{g.endpoints+=6; g.latency=Math.max(1,g.latency-7);}},

  {id:7, cat:'infra', icon:'🔌', name:'Layer 3 Switch',
   cost:2, desc:'+8 endpoints, +12 Mbps. Routes AND switches.',
   fx:g=>{g.endpoints+=8; g.bandwidth+=12;}},

  {id:8, cat:'infra', icon:'📶', name:'WiFi 6 Access Point',
   cost:1, desc:'+15 wireless endpoints. 8 spatial streams.',
   fx:g=>{g.endpoints+=15;}},

  {id:9, cat:'infra', icon:'📡', name:'5G Tower',
   cost:3, desc:'+25 endpoints, +40 Mbps, -12ms. True wireless speed.',
   fx:g=>{g.endpoints+=25; g.bandwidth+=40; g.latency=Math.max(1,g.latency-12);}},

  {id:10, cat:'infra', icon:'💡', name:'Fiber Optic Cable',
   cost:2, desc:'+80 Mbps, -15ms. Light-speed transmission.',
   fx:g=>{g.bandwidth+=80; g.latency=Math.max(1,g.latency-15);}},

  {id:11, cat:'infra', icon:'🔗', name:'Cat6e Cable',
   cost:1, desc:'+25 Mbps. Solid wired upgrade.',
   fx:g=>{g.bandwidth+=25;}},

  {id:12, cat:'infra', icon:'📡', name:'Microwave Link',
   cost:2, desc:'+50 Mbps, -8ms. Line-of-sight P2P.',
   fx:g=>{g.bandwidth+=50; g.latency=Math.max(1,g.latency-8);}},

  {id:13, cat:'infra', icon:'🛰️', name:'Satellite Link',
   cost:2, desc:'+70 Mbps but +50ms latency. Geostationary orbit.',
   fx:g=>{g.bandwidth+=70; g.latency+=50;}},

  {id:14, cat:'infra', icon:'🌊', name:'Undersea Cable',
   cost:3, desc:'+300 Mbps, -25ms. Transoceanic fiber backbone.',
   fx:g=>{g.bandwidth+=300; g.latency=Math.max(1,g.latency-25);}},

  {id:15, cat:'infra', icon:'🔗', name:'PoE Switch',
   cost:1, desc:'+5 endpoints, powers IoT devices, +8 users.',
   fx:g=>{g.endpoints+=5; g.users+=8;}},

  // ── SERVER (12) ──────────────────────────────────────────────
  {id:16, cat:'server', icon:'🖥️', name:'Web Server',
   cost:1, desc:'+1 server, +20 users. Start hosting content.',
   fx:g=>{g.servers+=1; g.users+=20;}},

  {id:17, cat:'server', icon:'🌐', name:'DNS Server',
   cost:2, desc:'+1 server, -18ms. Resolve names locally.',
   fx:g=>{g.servers+=1; g.latency=Math.max(1,g.latency-18);}},

  {id:18, cat:'server', icon:'🗄️', name:'CDN Node',
   cost:3, desc:'+1 server, -28ms, +120 users. Cache at the edge.',
   fx:g=>{g.servers+=1; g.latency=Math.max(1,g.latency-28); g.users+=120;}},

  {id:19, cat:'server', icon:'💾', name:'Cache Server',
   cost:2, desc:'+1 server, -22ms. Repeat requests answered instantly.',
   fx:g=>{g.servers+=1; g.latency=Math.max(1,g.latency-22);}},

  {id:20, cat:'server', icon:'⚖️', name:'Load Balancer',
   cost:2, desc:'-14ms, +50 Mbps. Distributes traffic across servers.',
   fx:g=>{g.latency=Math.max(1,g.latency-14); g.bandwidth+=50;}},

  {id:21, cat:'server', icon:'🗄️', name:'Server Rack',
   cost:2, desc:'+3 servers, +40 users each.',
   fx:g=>{g.servers+=3; g.users+=120;}},

  {id:22, cat:'server', icon:'🏭', name:'Data Center',
   cost:3, desc:'+6 servers, +100 Mbps. Massive capacity.',
   fx:g=>{g.servers+=6; g.bandwidth+=100; g.users+=100;}},

  {id:23, cat:'server', icon:'🔲', name:'Edge Server',
   cost:2, desc:'+1 server, -25ms. Compute at the network edge.',
   fx:g=>{g.servers+=1; g.latency=Math.max(1,g.latency-25);}},

  {id:24, cat:'server', icon:'☁️', name:'Cloud Instance',
   cost:2, desc:'+2 servers, elastic scaling. +60 users.',
   fx:g=>{g.servers+=2; g.users+=60;}},

  {id:25, cat:'server', icon:'🗃️', name:'Database Server',
   cost:2, desc:'+1 server, persistent store. +35 users.',
   fx:g=>{g.servers+=1; g.users+=35;}},

  {id:26, cat:'server', icon:'📧', name:'Mail Server',
   cost:1, desc:'+1 server, +25 users. Business comms.',
   fx:g=>{g.servers+=1; g.users+=25;}},

  {id:27, cat:'server', icon:'🎮', name:'Game Server',
   cost:2, desc:'+1 server, -10ms, +40 users. Low-latency compute.',
   fx:g=>{g.servers+=1; g.latency=Math.max(1,g.latency-10); g.users+=40;}},

  // ── PROTOCOL (12) ────────────────────────────────────────────
  {id:28, cat:'protocol', icon:'📡', name:'TCP/IP Tuning',
   cost:1, desc:'+18 Mbps, -7ms. Optimize window sizing & ACKs.',
   fx:g=>{g.bandwidth+=18; g.latency=Math.max(1,g.latency-7);}},

  {id:29, cat:'protocol', icon:'🚀', name:'HTTP/3',
   cost:2, desc:'-18ms. Multiplexed QUIC, no HOL blocking.',
   fx:g=>{g.latency=Math.max(1,g.latency-18);}},

  {id:30, cat:'protocol', icon:'🔐', name:'TLS 1.3',
   cost:1, desc:'+3 security, -5ms. 1-RTT handshake.',
   fx:g=>{g.security+=3; g.latency=Math.max(1,g.latency-5);}},

  {id:31, cat:'protocol', icon:'⚡', name:'QUIC Protocol',
   cost:2, desc:'-20ms. UDP-based, encrypted, fast reconnect.',
   fx:g=>{g.latency=Math.max(1,g.latency-20);}},

  {id:32, cat:'protocol', icon:'🗺️', name:'BGP Optimization',
   cost:2, desc:'+70 Mbps. Smarter route selection between ASes.',
   fx:g=>{g.bandwidth+=70;}},

  {id:33, cat:'protocol', icon:'🎯', name:'QoS Policy',
   cost:1, desc:'-13ms, +20 Mbps. Prioritize latency-sensitive packets.',
   fx:g=>{g.latency=Math.max(1,g.latency-13); g.bandwidth+=20;}},

  {id:34, cat:'protocol', icon:'🌍', name:'IPv6 Migration',
   cost:2, desc:'+80 users, -3ms. No NAT hairpinning overhead.',
   fx:g=>{g.users+=80; g.latency=Math.max(1,g.latency-3);}},

  {id:35, cat:'protocol', icon:'📦', name:'Data Compression',
   cost:1, desc:'+35 Mbps effective. Deflate/Brotli on the wire.',
   fx:g=>{g.bandwidth+=35;}},

  {id:36, cat:'protocol', icon:'🎯', name:'Anycast Routing',
   cost:2, desc:'-22ms. Route to nearest node automatically.',
   fx:g=>{g.latency=Math.max(1,g.latency-22);}},

  {id:37, cat:'protocol', icon:'📺', name:'Multicast',
   cost:1, desc:'+40 Mbps. One stream, many receivers.',
   fx:g=>{g.bandwidth+=40;}},

  {id:38, cat:'protocol', icon:'🔄', name:'OSPF Rerouting',
   cost:1, desc:'-10ms. Link-state routing avoids congested paths.',
   fx:g=>{g.latency=Math.max(1,g.latency-10);}},

  {id:39, cat:'protocol', icon:'🔗', name:'MPLS Switching',
   cost:2, desc:'-15ms, +30 Mbps. Label-switched paths skip slow lookups.',
   fx:g=>{g.latency=Math.max(1,g.latency-15); g.bandwidth+=30;}},

  // ── SECURITY (9) ─────────────────────────────────────────────
  {id:40, cat:'security', icon:'🧱', name:'Basic Firewall',
   cost:1, desc:'+2 security. Stateful packet inspection.',
   fx:g=>{g.security+=2;}},

  {id:41, cat:'security', icon:'🛡️', name:'Enterprise Firewall',
   cost:2, desc:'+4 security, -4ms (kills junk traffic hops).',
   fx:g=>{g.security+=4; g.latency=Math.max(1,g.latency-4);}},

  {id:42, cat:'security', icon:'👁️', name:'IDS/IPS System',
   cost:2, desc:'+5 security. Real-time intrusion detection.',
   fx:g=>{g.security+=5;}},

  {id:43, cat:'security', icon:'🛡️', name:'DDoS Shield',
   cost:3, desc:'+7 security. Rate-limiting + scrubbing center.',
   fx:g=>{g.security+=7;}},

  {id:44, cat:'security', icon:'🔏', name:'Zero Trust Policy',
   cost:2, desc:'+5 security. Verify every packet, every time.',
   fx:g=>{g.security+=5;}},

  {id:45, cat:'security', icon:'🌐', name:'WAF',
   cost:2, desc:'+4 security, +18 Mbps (blocks bots wasting bandwidth).',
   fx:g=>{g.security+=4; g.bandwidth+=18;}},

  {id:46, cat:'security', icon:'🍯', name:'Honeypot',
   cost:1, desc:'+2 security. Lures attackers into a dead end.',
   fx:g=>{g.security+=2;}},

  {id:47, cat:'security', icon:'🔍', name:'Security Audit',
   cost:1, desc:'+3 security. Find and patch before they exploit.',
   fx:g=>{g.security+=3;}},

  {id:48, cat:'security', icon:'🔑', name:'PKI Infrastructure',
   cost:2, desc:'+4 security, -6ms. Cert-based auth speeds handshakes.',
   fx:g=>{g.security+=4; g.latency=Math.max(1,g.latency-6);}},

  // ── ATTACK / EVENT (10) ──────────────────────────────────────
  {id:49, cat:'attack', icon:'💀', name:'DDoS Attack',
   cost:0, desc:'Junk flood! -80 Mbps. Security≥6: only -25 Mbps.',
   fx:g=>{let d=g.security>=6?25:80; g.bandwidth=Math.max(1,g.bandwidth-d);}},

  {id:50, cat:'attack', icon:'🦠', name:'Ransomware',
   cost:0, desc:'Encrypts servers! -3 servers. Security≥8 blocks it.',
   fx:g=>{if(g.security<8){g.servers=Math.max(0,g.servers-3);}}},

  {id:51, cat:'attack', icon:'🐛', name:'Malware Infection',
   cost:0, desc:'-4 security, -15 Mbps. Spreads through unpatched endpoints.',
   fx:g=>{g.security=Math.max(0,g.security-4); g.bandwidth=Math.max(1,g.bandwidth-15);}},

  {id:52, cat:'attack', icon:'🗺️', name:'BGP Hijack',
   cost:0, desc:'Route poisoning! +60ms latency. Security≥7 detects it.',
   fx:g=>{if(g.security<7){g.latency+=60;}}},

  {id:53, cat:'attack', icon:'🌐', name:'DNS Spoofing',
   cost:0, desc:'+35ms latency, -60 users redirected. Security≥5 mitigates.',
   fx:g=>{if(g.security<5){g.latency+=35; g.users=Math.max(1,g.users-60);}}},

  {id:54, cat:'attack', icon:'🔌', name:'Power Outage',
   cost:0, desc:'-2 servers go dark. Security≥4 means UPS saves one.',
   fx:g=>{let lost=g.security>=4?1:2; g.servers=Math.max(0,g.servers-lost);}},

  {id:55, cat:'attack', icon:'⚡', name:'Fiber Cut',
   cost:0, desc:'-120 Mbps physical damage. Redundancy (ep>30) halves damage.',
   fx:g=>{let d=g.endpoints>30?60:120; g.bandwidth=Math.max(1,g.bandwidth-d);}},

  {id:56, cat:'attack', icon:'🕳️', name:'Zero-Day Exploit',
   cost:0, desc:'-6 security. Novel—even well-patched systems bleed.',
   fx:g=>{g.security=Math.max(0,g.security-6);}},

  {id:57, cat:'attack', icon:'🌡️', name:'Heatwave Throttle',
   cost:0, desc:'Thermal throttling! +25ms, -50 Mbps. Security irrelevant.',
   fx:g=>{g.latency+=25; g.bandwidth=Math.max(1,g.bandwidth-50);}},

  {id:58, cat:'attack', icon:'🏴‍☠️', name:'Supply Chain Attack',
   cost:0, desc:'-5 security, -2 servers. Backdoor in a firmware update.',
   fx:g=>{g.security=Math.max(0,g.security-5); g.servers=Math.max(0,g.servers-2);}},

  // ── SPECIAL (6) ──────────────────────────────────────────────
  {id:59, cat:'special', icon:'🤝', name:'ISP Peering',
   cost:2, desc:'+200 Mbps, -10ms. Direct interconnect, no transit fees.',
   fx:g=>{g.bandwidth+=200; g.latency=Math.max(1,g.latency-10);}},

  {id:60, cat:'special', icon:'🏢', name:'Internet Exchange Point',
   cost:3, desc:'+400 Mbps, -35ms. Direct peering with 500+ networks.',
   fx:g=>{g.bandwidth+=400; g.latency=Math.max(1,g.latency-35);}},

  {id:61, cat:'special', icon:'🤖', name:'AI Traffic Optimizer',
   cost:3, desc:'-40ms, +100 Mbps. ML pre-routes traffic intelligently.',
   fx:g=>{g.latency=Math.max(1,g.latency-40); g.bandwidth+=100;}},

  {id:62, cat:'special', icon:'🔧', name:'SD-WAN',
   cost:2, desc:'-22ms, +65 Mbps. Software-defined WAN.',
   fx:g=>{g.latency=Math.max(1,g.latency-22); g.bandwidth+=65;}},

  {id:63, cat:'special', icon:'⚛️', name:'Quantum Network',
   cost:4, desc:'-55ms (enormous). Quantum key distribution backbone.',
   fx:g=>{g.latency=Math.max(1,g.latency-55);}},

  {id:64, cat:'special', icon:'🕸️', name:'Mesh Topology',
   cost:2, desc:'+20 endpoints, -12ms, +3 security. No single point of failure.',
   fx:g=>{g.endpoints+=20; g.latency=Math.max(1,g.latency-12); g.security+=3;}},

  // ── UPGRADE (8) ──────────────────────────────────────────────
  {id:65, cat:'upgrade', icon:'🔧', name:'Extra Energy Module',
   cost:2, desc:'Permanently gain +1 energy per turn. Stacks once.',
   fx:g=>{if(!g.permanents.extraEnergy){g.permanents.extraEnergy=1; g.energyPerTurn=Math.min(5,g.energyPerTurn+1); g.maxEnergy=g.energyPerTurn;}}},

  {id:66, cat:'upgrade', icon:'🛡️', name:'Decay Shield',
   cost:3, desc:'Network no longer decays +4ms per turn. Permanent.',
   fx:g=>{g.permanents.decayShield=true;}},

  {id:67, cat:'upgrade', icon:'📈', name:'Network Expansion Plan',
   cost:2, desc:'+3 cards drawn next turn (draw 5 instead of 2). One time.',
   fx:g=>{g._bonusDraw=(g._bonusDraw||0)+3;}},

  {id:68, cat:'upgrade', icon:'💡', name:'Server Efficiency Boost',
   cost:2, desc:'Each existing server now gives +15 bonus users. Permanent.',
   fx:g=>{g.permanents.serverBoost=true; g.users+=g.servers*15;}},

  {id:69, cat:'upgrade', icon:'🔄', name:'Auto-Healing Network',
   cost:3, desc:'Recover +8ms latency at the start of each turn. Permanent.',
   fx:g=>{g.permanents.autoHeal=true;}},

  {id:70, cat:'upgrade', icon:'⚡', name:'Bandwidth Doubler',
   cost:4, desc:'Double current bandwidth. Expensive but worth it.',
   fx:g=>{g.bandwidth=Math.floor(g.bandwidth*2);}},

  {id:71, cat:'upgrade', icon:'🔒', name:'Security Hardening',
   cost:2, desc:'+6 security instantly. Patch everything at once.',
   fx:g=>{g.security+=6;}},

  {id:72, cat:'upgrade', icon:'🌐', name:'Global Anycast Network',
   cost:4, desc:'-30ms + future CDN nodes cost 1 less energy.',
   fx:g=>{g.latency=Math.max(1,g.latency-30); g.permanents.cdnDiscount=true;}},
];

// ═══════════════════════════════════════════════════════════════
// DECK BUILDING
// ═══════════════════════════════════════════════════════════════
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function buildDeck(){
  let d=[];
  ALL_CARDS.forEach(c=>{
    let copies = c.cat==='attack' ? 3 : c.cat==='upgrade' ? 1 : 2;
    for(let i=0;i<copies;i++) d.push({...c});
  });
  return shuffle(d);
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function getTier(g){
  const u=g.users, l=g.latency;
  if(l<=8  && u>=5000) return {label:'🚀 Tier 6 — Global CDN Empire',   bg:'#0c1445',col:'#818cf8'};
  if(l<=15 && u>=2000) return {label:'⚡ Tier 5 — Hyperscale Cloud',    bg:'#0a2014',col:'#4ade80'};
  if(l<=30 && u>=800)  return {label:'🌐 Tier 4 — Fiber Metro ISP',     bg:'#0f1a2e',col:'#38bdf8'};
  if(l<=60 && u>=300)  return {label:'📡 Tier 3 — Regional Network',    bg:'#1a1a0a',col:'#facc15'};
  if(l<=100&& u>=80)   return {label:'🏠 Tier 2 — Business LAN',        bg:'#1a0f0a',col:'#fb923c'};
  if(l<=150)           return {label:'🐢 Tier 1 — DSL Line',            bg:'#1a0a0a',col:'#ef4444'};
  return                      {label:'🔌 Tier 0 — Dial-Up',             bg:'#0f0a0a',col:'#475569'};
}

function calcUsers(g){
  let u = 1;
  u += Math.floor(g.endpoints * 1.2);
  u += g.servers * 40;
  u += Math.floor(g.bandwidth / 18);
  if(g.permanents.serverBoost) u += g.servers * 15;
  return Math.max(u, g.users);
}

function cardCost(card, g){
  let c = card.cost;
  if(card.id===18 && g.permanents.cdnDiscount) c = Math.max(1, c-1);
  return c;
}

// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════
function log(text, cls='log-info'){
  const div=document.getElementById('log');
  const e=document.createElement('div');
  e.className='log-entry '+cls;
  e.textContent='T'+G.turn+': '+text;
  div.prepend(e);
}

// ═══════════════════════════════════════════════════════════════
// UI
// ═══════════════════════════════════════════════════════════════
function updateUI(){
  G.users = calcUsers(G);

  document.getElementById('s-endpoints').textContent = G.endpoints;
  document.getElementById('s-bandwidth').textContent = G.bandwidth+' Mbps';
  document.getElementById('s-latency').textContent   = G.latency+' ms';
  document.getElementById('s-servers').textContent   = G.servers;
  document.getElementById('s-security').textContent  = G.security;
  document.getElementById('s-users').textContent     = G.users.toLocaleString();
  document.getElementById('s-deck').textContent      = G.deck.length+' left';
  document.getElementById('s-turn').textContent      = G.turn;
  document.getElementById('s-played').textContent    = G.playsThisTurn;
  document.getElementById('s-hand').textContent      = G.hand.length;
  document.getElementById('hand-count').textContent  = G.hand.length+' card'+(G.hand.length!==1?'s':'');

  const latEl=document.getElementById('s-latency');
  latEl.className='stat-val '+(G.latency>100?'val-bad':G.latency>40?'val-warn':'val-good');

  const pct=Math.min(100,(G.latency/200)*100);
  const fill=document.getElementById('latency-fill');
  fill.style.width=pct+'%';
  fill.style.background=G.latency>100?'#ef4444':G.latency>50?'#f59e0b':G.latency>20?'#4ade80':'#38bdf8';

  // Energy pips
  const bar=document.getElementById('energy-bar');
  bar.innerHTML='';
  for(let i=0;i<G.maxEnergy;i++){
    const pip=document.createElement('div');
    pip.className='energy-pip'+(i<G.energy?' full':'');
    bar.appendChild(pip);
  }
  document.getElementById('energy-text').textContent=G.energy+' / '+G.maxEnergy;

  const tier=getTier(G);
  const badge=document.getElementById('tier-badge');
  badge.textContent=tier.label;
  badge.style.background=tier.bg;
  badge.style.color=tier.col;

  document.getElementById('hand-empty').style.display=G.hand.length?'none':'block';

  // Win goals
  const goals=[
    {id:'g-latency',  done:G.latency<=8,          text:'◻ Latency ≤ 8ms',    done_text:'✅ Latency ≤ 8ms'},
    {id:'g-users',    done:G.users>=5000,          text:'◻ 5,000+ Users',     done_text:'✅ 5,000+ Users'},
    {id:'g-security', done:G.security>=15,         text:'◻ Security ≥ 15',    done_text:'✅ Security ≥ 15'},
    {id:'g-servers',  done:G.servers>=10,          text:'◻ 10+ Servers',      done_text:'✅ 10+ Servers'},
    {id:'g-bandwidth',done:G.bandwidth>=1000,      text:'◻ 1,000+ Mbps',      done_text:'✅ 1,000+ Mbps'},
  ];
  goals.forEach(({id,done,text,done_text})=>{
    const el=document.getElementById(id);
    el.textContent=done?done_text:text;
    el.className=done?'goal-done':'';
  });

  // Decay warning
  const dw=document.getElementById('decay-warn');
  const decayAmt = G.permanents.decayShield ? 0 : (4 + (G.security<5?2:0));
  dw.textContent = G.permanents.decayShield ? '🛡 Decay shielded' : `⚠ +${decayAmt}ms decay on end turn`;

  updateDiagram();
  checkWinLose();
}

// ═══════════════════════════════════════════════════════════════
// DIAGRAM
// ═══════════════════════════════════════════════════════════════
function updateDiagram(){
  const svg=document.getElementById('network');
  svg.innerHTML='';
  const W=720,H=190,cx=W/2,cy=H/2+10;

  function line(x1,y1,x2,y2,col='#1e293b',w=1.5,dash=''){
    svg.innerHTML+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" stroke-dasharray="${dash}" opacity="0.8"/>`;
  }
  function circ(x,y,r,fill,label=''){
    svg.innerHTML+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="#0a0f1e" stroke-width="2"/>`;
    if(label) svg.innerHTML+=`<text x="${x}" y="${y+r+11}" fill="#64748b" font-size="8" text-anchor="middle">${label}</text>`;
  }

  // Backbone ring
  if(G.bandwidth>=200){
    svg.innerHTML+=`<ellipse cx="${cx}" cy="${cy}" rx="80" ry="35" fill="none" stroke="#1e3a5f" stroke-width="1" stroke-dasharray="3 3" opacity="0.5"/>`;
  }

  // Servers — top
  let sv=Math.min(G.servers,14);
  for(let i=0;i<sv;i++){
    let x=30+(i*(W-60)/Math.max(sv-1,1));
    let y=22;
    line(cx,cy,x,y,'#22c55e',1);
    circ(x,y,7,'#22c55e','S'+(i+1));
  }

  // Router — center
  if(G.security>=5){
    svg.innerHTML+=`<circle cx="${cx}" cy="${cy}" r="32" fill="none" stroke="#facc15" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.5"/>`;
  }
  circ(cx,cy,20,'#38bdf8');
  svg.innerHTML+=`<text x="${cx}" y="${cy-6}" fill="white" font-size="8" text-anchor="middle" font-weight="700">Router</text>`;
  svg.innerHTML+=`<text x="${cx}" y="${cy+5}" fill="white" font-size="9" text-anchor="middle" font-weight="800">${G.latency}ms</text>`;

  // Endpoints — bottom arc
  let ep=Math.min(G.endpoints,24);
  for(let i=0;i<ep;i++){
    let t=Math.PI*(0.05+0.9*(i/Math.max(ep-1,1)));
    let r=130;
    let x=cx+r*Math.cos(Math.PI-t);
    let y=cy+r*Math.sin(t)*0.6+30;
    let col=i===0?'#facc15':'#475569';
    line(cx,cy,x,y,'#1e293b',1);
    circ(x,y,4,col);
  }

  // Bandwidth label
  svg.innerHTML+=`<text x="12" y="185" fill="#334155" font-size="9">${G.bandwidth} Mbps  |  ${G.endpoints} EP  |  Sec:${G.security}</text>`;
}

// ═══════════════════════════════════════════════════════════════
// CARD RENDERING
// ═══════════════════════════════════════════════════════════════
const CAT_CSS   = {infra:'card-infra',server:'card-server',protocol:'card-protocol',security:'card-security',attack:'card-attack',special:'card-special',upgrade:'card-upgrade'};
const CAT_LABEL = {infra:'Infrastructure',server:'Server',protocol:'Protocol',security:'Security',attack:'⚠ Event / Attack',special:'Special',upgrade:'Upgrade'};
const COST_CSS  = ['','cost-1','cost-2','cost-3','cost-4'];

function renderHand(){
  const hand=document.getElementById('hand');
  hand.innerHTML='';
  G.hand.forEach((card,idx)=>{
    const div=document.createElement('div');
    div.className='card '+CAT_CSS[card.cat];
    const c=cardCost(card,G);
    const canPlay=(G.playsThisTurn<G.maxPlays) && !G.won && G.energy>=c;
    const noEnergy=G.energy<c;
    const costCls=COST_CSS[Math.min(c,4)]||'cost-4';
    div.innerHTML=`
      <span class="card-cost-badge ${costCls}">${c}⚡</span>
      <div class="card-icon">${card.icon}</div>
      <div class="card-cat">${CAT_LABEL[card.cat]}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-desc">${card.desc}</div>
      <button class="btn btn-play${noEnergy?' no-energy':''}" ${canPlay?'':'disabled'} onclick="playCard(${idx})">
        ${noEnergy?'Need '+c+'⚡':'Play Card'}
      </button>
    `;
    hand.appendChild(div);
  });
  document.getElementById('hand-count').textContent=G.hand.length+' card'+(G.hand.length!==1?'s':'');
  document.getElementById('hand-empty').style.display=G.hand.length?'none':'block';
}

// ═══════════════════════════════════════════════════════════════
// GAME ACTIONS
// ═══════════════════════════════════════════════════════════════
function drawCards(){
  if(G.drawnThisTurn){log('Already drew this turn!','log-warn');return;}
  if(G.won||G.lost) return;
  if(G.deck.length===0){log('Deck empty — reshuffling…','log-warn'); G.deck=buildDeck();}

  const n=2+(G._bonusDraw||0);
  G._bonusDraw=0;
  let drawn=0, triggered=[];

  for(let i=0;i<n;i++){
    if(!G.deck.length) break;
    const card=G.deck.pop();
    drawn++;
    if(card.cat==='attack'){
      // Fire immediately on draw
      const before={...G};
      card.fx(G);
      triggered.push(card);
      log(`⚡ EVENT TRIGGERED: ${card.icon} ${card.name}!`,'log-bad');
      const diffs=[];
      if(G.bandwidth!==before.bandwidth) diffs.push(`bw ${before.bandwidth}→${G.bandwidth} Mbps`);
      if(G.latency!==before.latency)    diffs.push(`latency ${before.latency}→${G.latency}ms`);
      if(G.servers!==before.servers)    diffs.push(`servers ${before.servers}→${G.servers}`);
      if(G.security!==before.security)  diffs.push(`security ${before.security}→${G.security}`);
      if(diffs.length) log('  → '+diffs.join(', '),'log-bad');
    } else {
      G.hand.push(card);
    }
  }

  G.drawnThisTurn=true;
  document.getElementById('btn-draw').disabled=true;
  const evtStr=triggered.length?` (${triggered.length} event${triggered.length>1?'s':''} auto-triggered!)`:'';
  log(`Drew ${drawn} card${drawn!==1?'s':''}${evtStr}. Hand: ${G.hand.length}.`,'log-info');
  renderHand();
  updateUI();
}

function playCard(idx){
  if(G.playsThisTurn>=G.maxPlays){log('Max plays reached this turn!','log-warn');return;}
  if(G.won||G.lost) return;

  const card=G.hand.splice(idx,1)[0];
  const c=cardCost(card,G);

  if(G.energy<c){log(`Not enough energy (need ${c}⚡, have ${G.energy}⚡).`,'log-warn'); G.hand.splice(idx,0,card); return;}
  G.energy-=c;

  const before={...G, permanents:{...G.permanents}};
  card.fx(G);
  G.playsThisTurn++;

  const cls=card.cat==='upgrade'?'log-upgrade':card.cat==='special'?'log-special':'log-good';
  log(`▶ ${card.icon} ${card.name}`,cls);

  const diffs=[];
  if(G.endpoints!==before.endpoints) diffs.push(`endpoints ${before.endpoints}→${G.endpoints}`);
  if(G.bandwidth!==before.bandwidth) diffs.push(`bw ${before.bandwidth}→${G.bandwidth} Mbps`);
  if(G.latency!==before.latency)    diffs.push(`latency ${before.latency}→${G.latency}ms`);
  if(G.servers!==before.servers)    diffs.push(`servers ${before.servers}→${G.servers}`);
  if(G.security!==before.security)  diffs.push(`security ${before.security}→${G.security}`);
  if(G.energyPerTurn!==before.energyPerTurn) diffs.push(`energy/turn now ${G.energyPerTurn}`);
  if(diffs.length) log('  → '+diffs.join(', '),'log-info');

  renderHand();
  updateUI();
}

function endTurn(){
  if(G.won||G.lost) return;
  if(!G.drawnThisTurn && G.hand.length===0){log('Draw cards first!','log-warn');return;}

  // Discard unplayed hand cards
  const discarded=G.hand.length;
  if(discarded>0){
    log(`Discarded ${discarded} unplayed card${discarded!==1?'s':''}.`,'log-warn');
    G.hand=[];
    G.discarded+=discarded;
  }

  // Auto-heal (upgrade)
  if(G.permanents.autoHeal){
    G.latency=Math.max(1,G.latency-8);
    log('🔄 Auto-heal: -8ms','log-upgrade');
  }

  // Network decay
  if(!G.permanents.decayShield){
    const decay=4+(G.security<5?2:0);
    G.latency+=decay;
    log(`📈 Network decay: +${decay}ms congestion`,'log-warn');
  }

  G.turn++;
  G.playsThisTurn=0;
  G.drawnThisTurn=false;
  G.energy=G.energyPerTurn;
  document.getElementById('btn-draw').disabled=false;

  log(`─── Turn ${G.turn} | Energy refilled to ${G.energy}⚡ ───`,'log-info');
  renderHand();
  updateUI();
}

// ═══════════════════════════════════════════════════════════════
// WIN / LOSE
// ═══════════════════════════════════════════════════════════════
function checkWinLose(){
  if(G.won||G.lost) return;
  if(G.latency<=8 && G.users>=5000 && G.security>=15 && G.servers>=10 && G.bandwidth>=1000){
    G.won=true;
    const tier=getTier(G);
    showModal('🎉 Network Built!',
      `Latency: ${G.latency}ms | Users: ${G.users.toLocaleString()}\nServers: ${G.servers} | Security: ${G.security} | Bandwidth: ${G.bandwidth} Mbps\nTier: ${tier.label}\nTurns taken: ${G.turn}`);
  }
}

function showModal(title,body){
  document.getElementById('modal-title').textContent=title;
  document.getElementById('modal-body').textContent=body;
  document.getElementById('modal').classList.add('show');
}

function restartGame(){
  document.getElementById('modal').classList.remove('show');
  G={
    endpoints:1,bandwidth:10,latency:200,servers:0,security:0,users:1,
    turn:1,playsThisTurn:0,maxPlays:3,
    energy:3,maxEnergy:3,energyPerTurn:3,
    drawnThisTurn:false,hand:[],deck:buildDeck(),
    won:false,lost:false,discarded:0,
    permanents:{extraEnergy:0,decayShield:false,serverBoost:false,autoHeal:false,cdnDiscount:false}
  };
  document.getElementById('hand').innerHTML='';
  document.getElementById('log').innerHTML='';
  document.getElementById('btn-draw').disabled=false;
  log('New game. You are a lone router. 200ms latency. The internet awaits.','log-info');
  log('Win: latency≤8ms, 5000+ users, security≥15, 10+ servers, 1000+ Mbps.','log-warn');
  renderHand();
  updateUI();
}

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
G.deck=buildDeck();
log('New game. You are a lone router. 200ms latency. The internet awaits.','log-info');
log('Win: latency≤8ms, 5000+ users, security≥15, 10+ servers, 1000+ Mbps.','log-warn');
updateUI();
</script>
