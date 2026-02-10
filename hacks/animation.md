---
layout: default
title: Data Privacy Explained
description: Interactive animations showing how HTTPS, VPNs, encryption, and more keep your data safe
permalink: /privacy
---

<style>
  /* ── Global ─────────────────────────────────────────── */
  :root {
    --green: #00e676;
    --red: #ff5252;
    --blue: #448aff;
    --purple: #ab47bc;
    --orange: #ff9100;
    --yellow: #ffd740;
    --dark: #0d1117;
    --card: #161b22;
    --border: #30363d;
    --text: #e6edf3;
    --muted: #8b949e;
  }

  .privacy-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: var(--text);
  }
  .privacy-page * { box-sizing: border-box; }

  /* ── Hero ────────────────────────────────────────────── */
  .hero {
    text-align: center;
    padding: 60px 20px;
    margin-bottom: 40px;
    background: linear-gradient(135deg, #0d1117 0%, #1a1e2e 50%, #0d1117 100%);
    border-radius: 16px;
    border: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -50%; left: -50%;
    width: 200%; height: 200%;
    background: radial-gradient(circle at 30% 50%, rgba(68,138,255,0.06) 0%, transparent 50%),
                radial-gradient(circle at 70% 50%, rgba(171,71,188,0.06) 0%, transparent 50%);
    animation: heroGlow 8s ease-in-out infinite alternate;
  }
  @keyframes heroGlow {
    0% { transform: translate(0, 0); }
    100% { transform: translate(-5%, 5%); }
  }
  .hero h1 {
    font-size: 2.8em;
    margin: 0 0 10px;
    background: linear-gradient(135deg, var(--blue), var(--purple));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    position: relative;
  }
  .hero p {
    font-size: 1.15em;
    color: var(--muted);
    max-width: 600px;
    margin: 0 auto;
    position: relative;
  }

  /* ── Section Cards ──────────────────────────────────── */
  .section-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 32px;
    margin-bottom: 36px;
    position: relative;
    overflow: hidden;
  }
  .section-card h2 {
    font-size: 1.6em;
    margin: 0 0 6px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .section-card h2 .icon { font-size: 1.3em; }
  .section-card .subtitle {
    color: var(--muted);
    margin: 0 0 20px;
    font-size: 0.95em;
  }
  .section-card .explain {
    color: var(--muted);
    font-size: 0.92em;
    line-height: 1.6;
    margin-top: 16px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.03);
    border-radius: 10px;
    border-left: 3px solid var(--blue);
  }

  /* ── Shared ─────────────────────────────────────────── */
  .anim-box {
    background: var(--dark);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 24px;
    min-height: 120px;
    position: relative;
    overflow: hidden;
  }
  .btn {
    padding: 10px 22px;
    border: none;
    border-radius: 8px;
    font-size: 0.9em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s;
    color: #fff;
    margin: 8px 4px 0 0;
  }
  .btn:hover { transform: translateY(-1px); filter: brightness(1.15); }
  .btn-blue { background: var(--blue); }
  .btn-green { background: #2ea043; }
  .btn-red { background: var(--red); }
  .btn-purple { background: var(--purple); }
  .btn-orange { background: var(--orange); }

  .user-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    border: 2px solid var(--border);
    background: var(--dark);
    color: var(--text);
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 0.95em;
    outline: none;
    transition: border-color 0.3s;
  }
  .user-input:focus { border-color: var(--blue); }
  .user-input::placeholder { color: var(--muted); }
  .input-row {
    display: flex;
    gap: 10px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }
  .input-row .user-input { flex: 1; min-width: 140px; }
  .input-label {
    font-size: 0.75em;
    color: var(--muted);
    margin-bottom: 6px;
    display: block;
  }

  .sniff-bubble {
    display: inline-block;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 0.78em;
    margin-top: 12px;
    opacity: 0;
    transition: all 0.4s;
    line-height: 1.5;
  }
  .sniff-bubble.show { opacity: 1; }
  .sniff-bubble.danger { background: rgba(255,82,82,0.15); color: var(--red); border: 1px solid rgba(255,82,82,0.3); }
  .sniff-bubble.ok { background: rgba(0,230,118,0.1); color: var(--green); border: 1px solid rgba(0,230,118,0.3); }
  .sniff-bubble.info { background: rgba(68,138,255,0.1); color: var(--blue); border: 1px solid rgba(68,138,255,0.3); }

  /* ── Packet Animation (HTTPS) ───────────────────────── */
  .network-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    position: relative;
  }
  .endpoint {
    width: 70px;
    text-align: center;
    flex-shrink: 0;
    z-index: 2;
  }
  .endpoint .device { font-size: 2em; display: block; margin-bottom: 4px; }
  .endpoint .label { font-size: 0.75em; color: var(--muted); }
  .wire {
    flex: 1;
    height: 4px;
    background: var(--border);
    position: relative;
    margin: 0 10px;
    border-radius: 2px;
    overflow: visible;
  }
  .packet {
    position: absolute;
    top: -14px;
    left: -10px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.7em;
    font-weight: 700;
    white-space: nowrap;
    opacity: 0;
    z-index: 3;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .packet.unsafe { background: var(--red); color: #fff; }
  .packet.safe { background: var(--green); color: #000; }
  @keyframes sendPacket {
    0%   { left: -10px; opacity: 1; }
    90%  { opacity: 1; }
    100% { left: calc(100% - 30px); opacity: 0; }
  }
  .hacker-icon {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1.6em;
    opacity: 0.3;
    transition: all 0.4s;
  }
  .hacker-icon.alert { opacity: 1; animation: hackerPulse 0.5s ease; }
  .hacker-icon.blocked { opacity: 1; color: var(--red); }
  @keyframes hackerPulse {
    0%, 100% { transform: translateX(-50%) scale(1); }
    50% { transform: translateX(-50%) scale(1.3); }
  }
  .stolen-data {
    position: absolute;
    top: -65px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.7em;
    padding: 4px 10px;
    border-radius: 6px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .stolen-data.show { opacity: 1; }
  .stolen-data.bad { background: rgba(255,82,82,0.2); color: var(--red); border: 1px solid var(--red); }
  .stolen-data.good { background: rgba(0,230,118,0.15); color: var(--green); border: 1px solid var(--green); }

  /* ── VPN Tunnel ─────────────────────────────────────── */
  .vpn-scene {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 20px 0;
    position: relative;
  }
  .vpn-node {
    text-align: center;
    flex-shrink: 0;
    z-index: 2;
  }
  .vpn-node .icon { font-size: 2em; display: block; }
  .vpn-node .lbl { font-size: 0.7em; color: var(--muted); margin-top: 4px; }
  .vpn-node .ip {
    font-size: 0.65em;
    font-family: monospace;
    padding: 2px 6px;
    border-radius: 4px;
    margin-top: 4px;
    display: inline-block;
    transition: all 0.5s;
  }
  .tunnel-wrap {
    flex: 1;
    position: relative;
    height: 50px;
    margin: 0 6px;
  }
  .tunnel-bg {
    position: absolute;
    top: 50%; left: 0; right: 0;
    height: 4px;
    transform: translateY(-50%);
    background: var(--border);
    border-radius: 2px;
  }
  .tunnel-secure {
    position: absolute;
    top: 10%; left: 0; right: 0;
    height: 80%;
    border: 2px dashed transparent;
    border-radius: 12px;
    transition: all 0.6s;
  }
  .tunnel-secure.active {
    border-color: var(--purple);
    background: rgba(171,71,188,0.06);
    box-shadow: 0 0 20px rgba(171,71,188,0.15);
  }
  .vpn-packet {
    position: absolute;
    top: 50%; left: 0;
    transform: translateY(-50%);
    padding: 3px 8px;
    border-radius: 5px;
    font-size: 0.65em;
    font-weight: 700;
    opacity: 0;
    white-space: nowrap;
    z-index: 3;
  }
  @keyframes vpnSend {
    0%   { left: 0; opacity: 1; }
    90%  { opacity: 1; }
    100% { left: calc(100% - 40px); opacity: 0; }
  }

  /* ── Encryption ─────────────────────────────────────── */
  .encrypt-demo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 20px;
  }
  .msg-display {
    font-family: monospace;
    font-size: 1em;
    padding: 14px 20px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.03);
    min-width: 280px;
    max-width: 100%;
    text-align: center;
    transition: all 0.4s;
    word-break: break-all;
  }
  .msg-display.plain { border-color: var(--red); color: var(--text); }
  .msg-display.encrypted { border-color: var(--green); color: var(--green); }
  .lock-icon { font-size: 2.4em; transition: transform 0.5s; }
  .lock-icon.locked { transform: scale(1.1); }
  .arrow-down {
    font-size: 1.5em;
    color: var(--muted);
    animation: arrowBounce 1.5s infinite;
  }
  @keyframes arrowBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(5px); }
  }

  /* ── Cookies / Tracking ─────────────────────────────── */
  .cookie-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }
  @media (max-width: 500px) {
    .cookie-form { grid-template-columns: 1fr; }
  }
  .tracking-scene {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    padding: 16px 0;
  }
  .website-card {
    flex: 1;
    min-width: 120px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 10px;
    text-align: center;
    transition: all 0.3s;
    cursor: pointer;
  }
  .website-card:hover { border-color: var(--blue); }
  .website-card.visited {
    border-color: var(--blue);
    background: rgba(68,138,255,0.06);
  }
  .website-card .site-icon { font-size: 1.8em; }
  .website-card .site-name { font-size: 0.75em; color: var(--muted); margin-top: 4px; }
  .cookie-trail { margin-top: 10px; min-height: 24px; }
  .cookie-tag {
    display: inline-block;
    font-size: 0.58em;
    padding: 2px 7px;
    border-radius: 4px;
    margin: 2px;
    animation: fadeInTag 0.4s ease;
  }
  @keyframes fadeInTag {
    from { opacity: 0; transform: scale(0.7); }
    to { opacity: 1; transform: scale(1); }
  }
  .cookie-tag.tracker { background: rgba(255,82,82,0.2); color: var(--red); }
  .cookie-tag.essential { background: rgba(0,230,118,0.15); color: var(--green); }

  .ad-results {
    margin-top: 16px;
    display: none;
  }
  .ad-results.show { display: block; animation: fadeInTag 0.5s ease; }
  .ad-results h4 { margin: 0 0 10px; font-size: 0.9em; }
  .ad-card {
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid var(--border);
    margin-bottom: 8px;
    opacity: 0;
    transform: translateY(8px);
    transition: all 0.4s;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .ad-card.show { opacity: 1; transform: translateY(0); }
  .ad-card .ad-icon { font-size: 1.4em; flex-shrink: 0; }
  .ad-card .ad-body { flex: 1; }
  .ad-card .ad-title { font-size: 0.82em; font-weight: 600; color: var(--text); }
  .ad-card .ad-reason { font-size: 0.7em; color: var(--red); margin-top: 3px; }
  .ad-card .ad-cookie { font-size: 0.6em; color: var(--muted); margin-top: 2px; font-family: monospace; }

  .profile-summary {
    margin-top: 12px;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid var(--red);
    background: rgba(255,82,82,0.04);
    display: none;
  }
  .profile-summary.show { display: block; animation: fadeInTag 0.5s ease; }
  .profile-summary h4 { margin: 0 0 8px; color: var(--red); font-size: 0.85em; }
  .profile-line {
    font-size: 0.78em;
    color: var(--muted);
    padding: 2px 0;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .profile-line.show { opacity: 1; }

  /* ── Password Strength ──────────────────────────────── */
  .pw-demo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 20px;
  }
  .pw-input-wrap { position: relative; width: 100%; max-width: 400px; }
  .strength-bar {
    width: 100%;
    max-width: 400px;
    height: 8px;
    background: var(--border);
    border-radius: 4px;
    overflow: hidden;
  }
  .strength-fill { height: 100%; border-radius: 4px; transition: all 0.4s; width: 0; }
  .strength-label { font-size: 0.85em; font-weight: 600; transition: color 0.3s; }
  .crack-time { font-size: 0.8em; color: var(--muted); text-align: center; }

  .bruteforce-box {
    width: 100%;
    max-width: 400px;
    margin-top: 10px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.02);
    display: none;
    text-align: center;
  }
  .bruteforce-box.show { display: block; animation: fadeInTag 0.4s; }
  .bf-attempt {
    font-family: monospace;
    font-size: 1em;
    color: var(--red);
    min-height: 24px;
  }
  .bf-counter {
    font-size: 0.7em;
    color: var(--muted);
    margin-top: 6px;
  }

  /* ── Public Wi-Fi ───────────────────────────────────── */
  .wifi-scene { text-align: center; padding: 20px; position: relative; }
  .wifi-icon { font-size: 3em; margin-bottom: 10px; display: inline-block; }
  .wifi-devices {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-top: 16px;
    flex-wrap: wrap;
  }
  .wifi-device {
    text-align: center;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid var(--border);
    min-width: 80px;
    transition: all 0.4s;
  }
  .wifi-device .dev-icon { font-size: 1.6em; }
  .wifi-device .dev-label { font-size: 0.7em; color: var(--muted); margin-top: 4px; }
  .wifi-device.compromised { border-color: var(--red); background: rgba(255,82,82,0.08); }
  .wifi-device.safe { border-color: var(--green); background: rgba(0,230,118,0.06); }

  .intercepted-data {
    margin-top: 14px;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid var(--border);
    text-align: left;
    display: none;
    font-size: 0.8em;
  }
  .intercepted-data.show { display: block; animation: fadeInTag 0.4s; }
  .intercepted-data.bad { border-color: var(--red); background: rgba(255,82,82,0.05); }
  .intercepted-data.good { border-color: var(--green); background: rgba(0,230,118,0.04); }
  .intercept-line {
    padding: 3px 0;
    font-family: monospace;
    font-size: 0.9em;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .intercept-line.show { opacity: 1; }

  /* ── 2FA ─────────────────────────────────────────────── */
  .tfa-scene {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
    padding: 20px;
  }
  .tfa-step {
    text-align: center;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.02);
    min-width: 130px;
    transition: all 0.4s;
    opacity: 0.4;
  }
  .tfa-step.active { opacity: 1; border-color: var(--blue); background: rgba(68,138,255,0.06); }
  .tfa-step.done { opacity: 1; border-color: var(--green); background: rgba(0,230,118,0.06); }
  .tfa-step.failed { opacity: 1; border-color: var(--red); background: rgba(255,82,82,0.08); }
  .tfa-step .step-icon { font-size: 2em; }
  .tfa-step .step-label { font-size: 0.8em; color: var(--muted); margin-top: 6px; }
  .tfa-step .step-value {
    font-size: 0.7em;
    font-family: monospace;
    margin-top: 4px;
    color: var(--text);
    min-height: 1em;
  }
  .tfa-arrow { font-size: 1.4em; color: var(--muted); }

  /* ── Data Breach ────────────────────────────────────── */
  .breach-scene { padding: 20px; text-align: center; }
  .db-icon { font-size: 3em; display: inline-block; transition: all 0.5s; }
  .db-icon.breached { animation: dbShake 0.5s ease; filter: hue-rotate(180deg); }
  @keyframes dbShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
  }
  .leak-items {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
  }
  .leak-item {
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 0.78em;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.4s;
  }
  .leak-item.show { opacity: 1; transform: translateY(0); }
  .leak-item.leaked { background: rgba(255,82,82,0.15); color: var(--red); border: 1px solid rgba(255,82,82,0.3); }
  .leak-item.hashed { background: rgba(0,230,118,0.1); color: var(--green); border: 1px solid rgba(0,230,118,0.3); }

  /* ── Fingerprinting ─────────────────────────────────── */
  .fp-scene { padding: 16px; }
  .fp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 8px;
    margin-top: 12px;
  }
  .fp-item {
    padding: 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    font-size: 0.78em;
    opacity: 0;
    transition: all 0.4s;
  }
  .fp-item.show { opacity: 1; }
  .fp-item .fp-label { color: var(--muted); font-size: 0.85em; }
  .fp-item .fp-value { color: var(--orange); font-family: monospace; margin-top: 3px; font-size: 0.9em; word-break: break-all; }
  .fp-hash {
    margin-top: 16px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid var(--orange);
    background: rgba(255,145,0,0.06);
    font-family: monospace;
    font-size: 0.8em;
    color: var(--orange);
    text-align: center;
    opacity: 0;
    transition: all 0.5s;
    word-break: break-all;
  }
  .fp-hash.show { opacity: 1; }
  .fp-toggle-wrap {
    display: flex; align-items: center; justify-content: center; gap: 12px;
    margin-bottom: 14px; font-size: 0.85em;
  }
  .fp-toggle-label { color: var(--muted); transition: color 0.3s; }
  .fp-toggle-label.active { color: var(--text); font-weight: 600; }
  .fp-toggle {
    position: relative; width: 52px; height: 28px;
    background: var(--border); border-radius: 14px; cursor: pointer;
    transition: background 0.3s;
  }
  .fp-toggle.on { background: var(--orange); }
  .fp-toggle::after {
    content: ''; position: absolute; top: 3px; left: 3px;
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--card-bg); transition: transform 0.3s;
  }
  .fp-toggle.on::after { transform: translateX(24px); }
  .fp-cookie-item {
    padding: 12px; border-radius: 8px; font-size: 0.78em;
    border: 1px solid var(--orange); background: rgba(255,145,0,0.06);
    opacity: 0; transition: all 0.4s; display: none;
  }
  .fp-cookie-item.show { opacity: 1; }
  .fp-cookie-item .fp-label { color: var(--orange); font-size: 0.85em; font-weight: 600; }
  .fp-cookie-item .fp-value { color: var(--text); font-family: monospace; margin-top: 3px; font-size: 0.9em; word-break: break-all; }
  .fp-cookie-banner {
    margin-top: 12px; padding: 14px; border-radius: 8px;
    border: 2px dashed var(--orange); background: rgba(255,145,0,0.04);
    text-align: center; font-size: 0.82em; color: var(--muted);
    opacity: 0; transition: opacity 0.5s; display: none;
  }
  .fp-cookie-banner.show { opacity: 1; }
  .fp-cookie-banner strong { color: var(--orange); }
  .fp-uniqueness {
    margin-top: 10px;
    font-size: 0.75em;
    color: var(--muted);
    text-align: center;
    opacity: 0;
    transition: opacity 0.5s;
  }
  .fp-uniqueness.show { opacity: 1; }

  /* ── DNS ─────────────────────────────────────────────── */
  .dns-scene { padding: 16px; }
  .dns-flow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }
  .dns-node { text-align: center; flex-shrink: 0; }
  .dns-node .dn-icon { font-size: 1.8em; }
  .dns-node .dn-label { font-size: 0.7em; color: var(--muted); margin-top: 4px; }
  .dns-arrow {
    flex: 1;
    min-width: 30px;
    height: 2px;
    background: var(--border);
    position: relative;
  }
  .dns-query {
    position: absolute;
    top: -22px;
    white-space: nowrap;
    font-size: 0.6em;
    font-family: monospace;
    padding: 2px 6px;
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.4s;
  }
  .dns-query.show { opacity: 1; }
  .dns-query.plain { background: rgba(255,82,82,0.15); color: var(--red); left: 0; }
  .dns-query.secure { background: rgba(0,230,118,0.1); color: var(--green); left: 0; }

  .dns-log {
    margin-top: 14px;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
    max-height: 120px;
    overflow-y: auto;
    display: none;
  }
  .dns-log.show { display: block; animation: fadeInTag 0.4s; }
  .dns-log-entry {
    font-size: 0.72em;
    font-family: monospace;
    padding: 2px 0;
    color: var(--muted);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .dns-log-entry.show { opacity: 1; }
  .dns-log-entry.exposed { color: var(--red); }
  .dns-log-entry.hidden { color: var(--green); }

  /* ── Table of Contents ──────────────────────────────── */
  .toc {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 10px;
    margin-bottom: 36px;
  }
  .toc a {
    display: block;
    padding: 14px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--card);
    text-decoration: none;
    color: var(--text);
    font-size: 0.85em;
    text-align: center;
    transition: all 0.25s;
  }
  .toc a:hover {
    border-color: var(--blue);
    background: rgba(68,138,255,0.06);
    transform: translateY(-2px);
  }
  .toc a .toc-icon { font-size: 1.4em; display: block; margin-bottom: 4px; }

  /* ── Responsive ─────────────────────────────────────── */
  @media (max-width: 600px) {
    .hero h1 { font-size: 1.8em; }
    .section-card { padding: 20px; }
    .tfa-scene { flex-direction: column; }
    .tfa-arrow { transform: rotate(90deg); }
    .vpn-scene { flex-wrap: wrap; justify-content: center; }
  }
</style>

<div class="privacy-page">

  <!-- HERO -->
  <div class="hero">
    <h1>Data Privacy, Explained</h1>
    <p>Type YOUR info below and watch how the internet handles it — see exactly what's exposed and what's protected.</p>
  </div>

  <!-- TABLE OF CONTENTS -->
  <div class="toc">
    <a href="#https"><span class="toc-icon">🔒</span>HTTPS</a>
    <a href="#vpn"><span class="toc-icon">🛡️</span>VPNs</a>
    <a href="#encryption"><span class="toc-icon">🔐</span>Encryption</a>
    <a href="#cookies"><span class="toc-icon">🍪</span>Cookies &amp; Tracking</a>
    <a href="#passwords"><span class="toc-icon">🔑</span>Passwords</a>
    <a href="#wifi"><span class="toc-icon">📶</span>Public Wi-Fi</a>
    <a href="#tfa"><span class="toc-icon">📱</span>Two-Factor Auth</a>
    <a href="#breach"><span class="toc-icon">💥</span>Data Breaches</a>
    <a href="#fingerprint"><span class="toc-icon">🖐️</span>Fingerprinting</a>
    <a href="#dns"><span class="toc-icon">🌐</span>DNS Privacy</a>
  </div>

  <!-- ═══════════════════ 1. HTTPS ═══════════════════════ -->
  <div class="section-card" id="https">
    <h2><span class="icon">🔒</span> HTTPS — Your Data's Bodyguard</h2>
    <p class="subtitle">Type something private and watch it travel across the internet</p>

    <div class="anim-box">
      <span class="input-label">Type a secret (password, credit card, message — anything):</span>
      <input type="text" class="user-input" id="https-input" placeholder="e.g. MyP@ssword123 or 4821-5930-1122-3344" maxlength="40">

      <p style="text-align:center;font-size:0.8em;color:var(--muted);margin:16px 0 6px;">
        Without HTTPS — your data is sent as plain text
      </p>
      <div class="network-line">
        <div class="endpoint"><span class="device">💻</span><span class="label">You</span></div>
        <div class="wire" id="http-wire">
          <div class="packet unsafe" id="http-packet"></div>
          <div class="hacker-icon" id="http-hacker">🕵️</div>
          <div class="stolen-data bad" id="http-stolen"></div>
        </div>
        <div class="endpoint"><span class="device">🌐</span><span class="label">Website</span></div>
      </div>

      <hr style="border-color:var(--border);margin:16px 0;">

      <p style="text-align:center;font-size:0.8em;color:var(--muted);margin:0 0 6px;">
        With HTTPS — scrambled before leaving your computer
      </p>
      <div class="network-line">
        <div class="endpoint"><span class="device">💻</span><span class="label">You</span></div>
        <div class="wire" id="https-wire">
          <div class="packet safe" id="https-packet"></div>
          <div class="hacker-icon" id="https-hacker">🕵️</div>
          <div class="stolen-data good" id="https-stolen"></div>
        </div>
        <div class="endpoint"><span class="device">🌐</span><span class="label">Website</span></div>
      </div>

      <div style="text-align:center;margin-top:14px;">
        <button class="btn btn-red" onclick="sendHTTP()">Send without HTTPS</button>
        <button class="btn btn-green" onclick="sendHTTPS()">Send with HTTPS</button>
      </div>
    </div>

    <div class="explain">
      <strong>In plain English:</strong> When you visit a website with <code>https://</code> in the address bar, everything you send is scrambled into gibberish before it leaves your computer. Even if someone intercepts it, they just see random characters. Without HTTPS, your data travels as plain text — like sending a postcard anyone can read.
    </div>
  </div>

  <!-- ═══════════════════ 2. VPN ═════════════════════════ -->
  <div class="section-card" id="vpn">
    <h2><span class="icon">🛡️</span> VPNs — Your Secret Tunnel</h2>
    <p class="subtitle">Pick a website to visit and see who can see what</p>

    <div class="anim-box">
      <span class="input-label">What website are you visiting?</span>
      <input type="text" class="user-input" id="vpn-site-input" placeholder="e.g. reddit.com, netflix.com, bankofamerica.com" maxlength="40">

      <p style="text-align:center;font-size:0.8em;color:var(--muted);margin:16px 0 6px;">Without VPN — the site sees exactly who and where you are</p>
      <div class="vpn-scene">
        <div class="vpn-node">
          <span class="icon">💻</span><span class="lbl">You</span>
          <span class="ip" style="background:rgba(255,82,82,0.15);color:var(--red);" id="novpn-your-ip">IP: 98.45.12.7</span>
        </div>
        <div class="tunnel-wrap">
          <div class="tunnel-bg"></div>
          <div class="vpn-packet" id="novpn-pkt" style="background:var(--red);color:#fff;"></div>
        </div>
        <div class="vpn-node">
          <span class="icon">🌐</span><span class="lbl" id="novpn-site-label">Website</span>
          <span class="ip" style="background:rgba(255,82,82,0.15);color:var(--red);" id="novpn-sees">Sees: You</span>
        </div>
      </div>

      <hr style="border-color:var(--border);margin:12px 0;">

      <p style="text-align:center;font-size:0.8em;color:var(--muted);margin:0 0 6px;">With VPN — encrypted tunnel hides your identity</p>
      <div class="vpn-scene">
        <div class="vpn-node">
          <span class="icon">💻</span><span class="lbl">You</span>
          <span class="ip" style="background:rgba(0,230,118,0.12);color:var(--green);">IP: Hidden</span>
        </div>
        <div class="tunnel-wrap" id="tunnel1">
          <div class="tunnel-bg"></div>
          <div class="tunnel-secure" id="tunnel-overlay"></div>
          <div class="vpn-packet" id="vpn-pkt1" style="background:var(--purple);color:#fff;">🔒 Encrypted</div>
        </div>
        <div class="vpn-node">
          <span class="icon">🏰</span><span class="lbl">VPN Server</span>
          <span class="ip" style="background:rgba(171,71,188,0.15);color:var(--purple);">Netherlands</span>
        </div>
        <div class="tunnel-wrap" id="tunnel2">
          <div class="tunnel-bg"></div>
          <div class="vpn-packet" id="vpn-pkt2" style="background:var(--green);color:#000;"></div>
        </div>
        <div class="vpn-node">
          <span class="icon">🌐</span><span class="lbl" id="vpn-site-label">Website</span>
          <span class="ip" style="background:rgba(0,230,118,0.12);color:var(--green);">Sees: Netherlands</span>
        </div>
      </div>

      <div style="text-align:center;margin-top:14px;">
        <button class="btn btn-red" onclick="sendNoVPN()">Browse without VPN</button>
        <button class="btn btn-purple" onclick="sendWithVPN()">Browse with VPN</button>
      </div>
    </div>

    <div class="explain">
      <strong>In plain English:</strong> A VPN creates a private, encrypted tunnel between your device and a server somewhere else in the world. The website sees the VPN server's location — not yours. Your ISP can't see what you're doing either. Think of it like mailing a letter inside another sealed envelope that gets opened in a different city.
    </div>
  </div>

  <!-- ═══════════════════ 3. ENCRYPTION ══════════════════ -->
  <div class="section-card" id="encryption">
    <h2><span class="icon">🔐</span> Encryption — Scrambling Your Secrets</h2>
    <p class="subtitle">Type your own message and watch it get locked</p>

    <div class="anim-box">
      <div class="encrypt-demo">
        <div style="width:100%;max-width:500px;">
          <span class="input-label">Type a secret message:</span>
          <input type="text" class="user-input" id="enc-input" placeholder="e.g. Meet me at the park at 5pm" maxlength="60" oninput="updateEncPlain()">
        </div>
        <div>
          <div style="font-size:0.75em;color:var(--muted);margin-bottom:6px;">Your message as sent:</div>
          <div class="msg-display plain" id="enc-plain">Type something above...</div>
        </div>
        <div class="arrow-down">⬇️</div>
        <div class="lock-icon" id="enc-lock">🔓</div>
        <div class="arrow-down">⬇️</div>
        <div>
          <div style="font-size:0.75em;color:var(--muted);margin-bottom:6px;">What a hacker sees:</div>
          <div class="msg-display" id="enc-output" style="border-color:var(--border);color:var(--muted);">Press encrypt...</div>
        </div>
      </div>
      <div style="text-align:center;margin-top:12px;">
        <button class="btn btn-green" onclick="encryptMsg()">Encrypt</button>
        <button class="btn btn-blue" onclick="decryptMsg()">Decrypt</button>
      </div>
    </div>

    <div class="explain">
      <strong>In plain English:</strong> Encryption is like putting your message in a locked box. Only someone with the right key can open it. When you send a message on apps like iMessage or WhatsApp (end-to-end encryption), even the company running the app can't read it — only you and the person you're talking to have the keys.
    </div>
  </div>

  <!-- ═══════════════════ 4. COOKIES / TRACKING ══════════ -->
  <div class="section-card" id="cookies">
    <h2><span class="icon">🍪</span> Cookies &amp; Tracking — You're Being Watched</h2>
    <p class="subtitle">Enter your info, then visit websites to see how they build an ad profile on YOU</p>

    <div class="anim-box">
      <span class="input-label">Fill in some info about yourself (this stays in your browser, nothing is sent anywhere):</span>
      <div class="cookie-form">
        <div>
          <span class="input-label">Your name</span>
          <input type="text" class="user-input" id="cookie-name" placeholder="e.g. Alex" maxlength="20">
        </div>
        <div>
          <span class="input-label">Your age</span>
          <input type="number" class="user-input" id="cookie-age" placeholder="e.g. 17" min="1" max="99">
        </div>
        <div>
          <span class="input-label">A hobby / interest</span>
          <input type="text" class="user-input" id="cookie-hobby" placeholder="e.g. basketball, gaming, art" maxlength="25">
        </div>
        <div>
          <span class="input-label">Your city</span>
          <input type="text" class="user-input" id="cookie-city" placeholder="e.g. San Diego" maxlength="25">
        </div>
      </div>

      <p style="text-align:center;font-size:0.8em;color:var(--muted);margin:0 0 8px;">
        Now "visit" each website — watch cookies get dropped and your ad profile grow:
      </p>
      <div class="tracking-scene" id="tracking-scene">
        <div class="website-card" id="site-card-0" onclick="visitSite(0)">
          <div class="site-icon">🛒</div>
          <div class="site-name">Shopping</div>
          <div class="cookie-trail" id="cookies-0"></div>
        </div>
        <div class="website-card" id="site-card-1" onclick="visitSite(1)">
          <div class="site-icon">📰</div>
          <div class="site-name">News</div>
          <div class="cookie-trail" id="cookies-1"></div>
        </div>
        <div class="website-card" id="site-card-2" onclick="visitSite(2)">
          <div class="site-icon">📺</div>
          <div class="site-name">Video</div>
          <div class="cookie-trail" id="cookies-2"></div>
        </div>
        <div class="website-card" id="site-card-3" onclick="visitSite(3)">
          <div class="site-icon">🔍</div>
          <div class="site-name">Search</div>
          <div class="cookie-trail" id="cookies-3"></div>
        </div>
        <div class="website-card" id="site-card-4" onclick="visitSite(4)">
          <div class="site-icon">🎮</div>
          <div class="site-name">Gaming</div>
          <div class="cookie-trail" id="cookies-4"></div>
        </div>
      </div>

      <!-- Profile built from cookies -->
      <div class="profile-summary" id="cookie-profile">
        <h4>🕵️ Your Tracker Profile (what ad companies know about you):</h4>
        <div class="profile-line" id="cp-0"></div>
        <div class="profile-line" id="cp-1"></div>
        <div class="profile-line" id="cp-2"></div>
        <div class="profile-line" id="cp-3"></div>
        <div class="profile-line" id="cp-4"></div>
        <div class="profile-line" id="cp-5"></div>
        <div class="profile-line" id="cp-6"></div>
      </div>

      <!-- Targeted ads generated from their data -->
      <div class="ad-results" id="ad-results">
        <h4 style="color:var(--red);">🎯 Targeted Ads Generated for You:</h4>
        <div class="ad-card" id="ad-0"><div class="ad-icon"></div><div class="ad-body"><div class="ad-title"></div><div class="ad-reason"></div><div class="ad-cookie"></div></div></div>
        <div class="ad-card" id="ad-1"><div class="ad-icon"></div><div class="ad-body"><div class="ad-title"></div><div class="ad-reason"></div><div class="ad-cookie"></div></div></div>
        <div class="ad-card" id="ad-2"><div class="ad-icon"></div><div class="ad-body"><div class="ad-title"></div><div class="ad-reason"></div><div class="ad-cookie"></div></div></div>
        <div class="ad-card" id="ad-3"><div class="ad-icon"></div><div class="ad-body"><div class="ad-title"></div><div class="ad-reason"></div><div class="ad-cookie"></div></div></div>
      </div>
    </div>

    <div class="explain">
      <strong>In plain English:</strong> Cookies are small files websites save on your device. <em>Tracking cookies</em> follow you across different websites to build a profile — your age, location, interests, and browsing habits. Ad companies combine this into a shockingly detailed picture of who you are, then use it to serve you hyper-targeted ads. That's why you search for shoes once and see shoe ads for weeks.
    </div>
  </div>

  <!-- ═══════════════════ 5. PASSWORDS ═══════════════════ -->
  <div class="section-card" id="passwords">
    <h2><span class="icon">🔑</span> Passwords — Your First Line of Defense</h2>
    <p class="subtitle">Type a password and watch a hacker try to crack it in real time</p>

    <div class="anim-box">
      <div class="pw-demo">
        <div class="pw-input-wrap">
          <input type="text" class="user-input" id="pw-input" placeholder="Type a password to test..." oninput="checkPassword()">
        </div>
        <div class="strength-bar">
          <div class="strength-fill" id="pw-fill"></div>
        </div>
        <div class="strength-label" id="pw-label" style="color:var(--muted);">Type something above</div>
        <div class="crack-time" id="pw-crack"></div>

        <button class="btn btn-red" onclick="startBruteforce()" id="bf-btn" style="display:none;">Watch a Hacker Try to Crack It</button>

        <div class="bruteforce-box" id="bf-box">
          <div style="font-size:0.7em;color:var(--muted);margin-bottom:6px;">Hacker's brute-force attempts:</div>
          <div class="bf-attempt" id="bf-attempt"></div>
          <div class="bf-counter" id="bf-counter"></div>
        </div>
      </div>
    </div>

    <div class="explain">
      <strong>In plain English:</strong> A strong password is long, random, and unique to each account. "password123" can be cracked in under a second. A random phrase like "correct-horse-battery-staple" could take centuries. Use a <strong>password manager</strong> so you only need to remember one master password — it generates and stores strong passwords for everything else.
    </div>
  </div>

  <!-- ═══════════════════ 6. PUBLIC WI-FI ════════════════ -->
  <div class="section-card" id="wifi">
    <h2><span class="icon">📶</span> Public Wi-Fi — The Open Window</h2>
    <p class="subtitle">Type what you'd do on free Wi-Fi and see what the hacker captures</p>

    <div class="anim-box">
      <div class="input-row">
        <div style="flex:1;">
          <span class="input-label">What are you doing?</span>
          <input type="text" class="user-input" id="wifi-activity" placeholder="e.g. logging into Instagram">
        </div>
        <div style="flex:1;">
          <span class="input-label">Username / email</span>
          <input type="text" class="user-input" id="wifi-user" placeholder="e.g. alex@gmail.com">
        </div>
        <div style="flex:1;">
          <span class="input-label">Password</span>
          <input type="text" class="user-input" id="wifi-pass" placeholder="e.g. ilovecats99">
        </div>
      </div>

      <div class="wifi-scene">
        <div>
          <span class="wifi-icon">📶</span>
          <div style="font-size:0.9em;margin-bottom:4px;">Free Coffee Shop Wi-Fi</div>
          <div style="font-size:0.7em;color:var(--muted);">No password required!</div>
        </div>
        <div class="wifi-devices">
          <div class="wifi-device" id="wdev-0"><div class="dev-icon">💻</div><div class="dev-label">You</div></div>
          <div class="wifi-device" id="wdev-1"><div class="dev-icon">📱</div><div class="dev-label">Stranger</div></div>
          <div class="wifi-device" id="wdev-2"><div class="dev-icon">🕵️</div><div class="dev-label">Hacker</div></div>
        </div>
      </div>

      <div class="intercepted-data" id="wifi-intercept"></div>

      <div style="text-align:center;margin-top:10px;">
        <button class="btn btn-red" onclick="wifiAttack()">Show What Hacker Sees</button>
        <button class="btn btn-green" onclick="wifiProtect()">Use VPN + HTTPS</button>
      </div>
    </div>

    <div class="explain">
      <strong>In plain English:</strong> Public Wi-Fi is like talking loudly in a crowded room — anyone nearby can listen. Hackers on the same network can intercept your data using simple tools. Always use HTTPS websites, avoid logging into sensitive accounts, and ideally turn on a VPN when using public Wi-Fi.
    </div>
  </div>

  <!-- ═══════════════════ 7. TWO-FACTOR AUTH ═════════════ -->
  <div class="section-card" id="tfa">
    <h2><span class="icon">📱</span> Two-Factor Authentication — Double Lock</h2>
    <p class="subtitle">Enter a password to see what happens with and without 2FA</p>

    <div class="anim-box">
      <div style="max-width:300px;margin:0 auto 16px;">
        <span class="input-label">Your account password:</span>
        <input type="text" class="user-input" id="tfa-pw" placeholder="e.g. MyPassword1">
      </div>

      <div class="tfa-scene" id="tfa-scene">
        <div class="tfa-step" id="tfa-1">
          <div class="step-icon">🔑</div>
          <div class="step-label">Enter Password</div>
          <div class="step-value" id="tfa-pw-display"></div>
        </div>
        <div class="tfa-arrow">→</div>
        <div class="tfa-step" id="tfa-2">
          <div class="step-icon">📱</div>
          <div class="step-label">Verify Code</div>
          <div class="step-value" id="tfa-code-display"></div>
        </div>
        <div class="tfa-arrow">→</div>
        <div class="tfa-step" id="tfa-3">
          <div class="step-icon">✅</div>
          <div class="step-label">Access Granted</div>
          <div class="step-value" id="tfa-result-display"></div>
        </div>
      </div>

      <div style="text-align:center;margin-top:10px;">
        <button class="btn btn-blue" onclick="run2FA()">You Login with 2FA</button>
        <button class="btn btn-red" onclick="runNo2FA()">Hacker Tries Your Password</button>
      </div>

      <div class="sniff-bubble" id="tfa-msg" style="display:block;text-align:center;margin:12px auto 0;"></div>
    </div>

    <div class="explain">
      <strong>In plain English:</strong> Two-factor authentication (2FA) adds a second check after your password — usually a code texted to your phone or generated by an app. Even if someone steals your password, they still can't get in without your phone. It's like needing both a key <em>and</em> a fingerprint to open a door.
    </div>
  </div>

  <!-- ═══════════════════ 8. DATA BREACH ═════════════════ -->
  <div class="section-card" id="breach">
    <h2><span class="icon">💥</span> Data Breaches — When Companies Get Hacked</h2>
    <p class="subtitle">Enter the info you'd give a website and see what gets leaked</p>

    <div class="anim-box">
      <div class="input-row">
        <div style="flex:1;">
          <span class="input-label">Email</span>
          <input type="text" class="user-input" id="breach-email" placeholder="e.g. you@gmail.com">
        </div>
        <div style="flex:1;">
          <span class="input-label">Password</span>
          <input type="text" class="user-input" id="breach-pw" placeholder="e.g. hunter2">
        </div>
        <div style="flex:1;">
          <span class="input-label">Address</span>
          <input type="text" class="user-input" id="breach-addr" placeholder="e.g. 123 Main St">
        </div>
      </div>

      <div class="breach-scene">
        <div class="db-icon" id="db-icon">🗄️</div>
        <div style="font-size:0.9em;margin:8px 0 4px;">Company Database</div>
        <div style="font-size:0.7em;color:var(--muted);">Stores your account info</div>

        <div class="leak-items" id="leak-items"></div>

        <div class="sniff-bubble" id="breach-msg" style="display:block;text-align:center;margin:14px auto 0;"></div>
      </div>

      <div style="text-align:center;margin-top:10px;">
        <button class="btn btn-red" onclick="showBreach(false)">Breach (Bad Security)</button>
        <button class="btn btn-green" onclick="showBreach(true)">Breach (Good Security)</button>
      </div>
    </div>

    <div class="explain">
      <strong>In plain English:</strong> Data breaches happen when hackers break into a company's servers and steal user data. If the company stored your password in plain text, the hackers have it instantly. If they <em>hashed</em> it (scrambled it one-way), hackers get gibberish. That's why good companies never store your actual password — and why you should use different passwords for every site.
    </div>
  </div>

  <!-- ═══════════════════ 9. FINGERPRINTING ══════════════ -->
  <div class="section-card" id="fingerprint">
    <h2><span class="icon">🖐️</span> Browser Fingerprinting — With &amp; Without Cookies</h2>
    <p class="subtitle">Toggle between cookie-free tracking and cookie-based tracking to see the difference</p>

    <div class="anim-box">
      <div class="fp-scene">
        <div class="fp-toggle-wrap">
          <span class="fp-toggle-label active" id="fp-lbl-no">Without Cookies</span>
          <div class="fp-toggle" id="fp-cookie-toggle" onclick="toggleFpCookieMode()"></div>
          <span class="fp-toggle-label" id="fp-lbl-yes">With Cookies</span>
        </div>
        <p style="font-size:0.8em;color:var(--muted);margin:0 0 8px;text-align:center;" id="fp-mode-desc">
          Click to see what YOUR browser is leaking right now — no cookies needed:
        </p>
        <div style="text-align:center;">
          <button class="btn btn-orange" onclick="collectFingerprint()">Scan My Browser</button>
        </div>
        <div class="fp-grid" id="fp-grid">
          <div class="fp-item" id="fp-0"><div class="fp-label">Browser &amp; Version</div><div class="fp-value" id="fp-val-0">—</div></div>
          <div class="fp-item" id="fp-1"><div class="fp-label">Screen Resolution</div><div class="fp-value" id="fp-val-1">—</div></div>
          <div class="fp-item" id="fp-2"><div class="fp-label">OS / Platform</div><div class="fp-value" id="fp-val-2">—</div></div>
          <div class="fp-item" id="fp-3"><div class="fp-label">Languages</div><div class="fp-value" id="fp-val-3">—</div></div>
          <div class="fp-item" id="fp-4"><div class="fp-label">Timezone &amp; Offset</div><div class="fp-value" id="fp-val-4">—</div></div>
          <div class="fp-item" id="fp-5"><div class="fp-label">CPU Cores</div><div class="fp-value" id="fp-val-5">—</div></div>
          <div class="fp-item" id="fp-6"><div class="fp-label">GPU / Renderer</div><div class="fp-value" id="fp-val-6">—</div></div>
          <div class="fp-item" id="fp-7"><div class="fp-label">Canvas Fingerprint</div><div class="fp-value" id="fp-val-7">—</div></div>
          <div class="fp-item" id="fp-8"><div class="fp-label">Device Memory</div><div class="fp-value" id="fp-val-8">—</div></div>
          <div class="fp-item" id="fp-9"><div class="fp-label">Touch Support</div><div class="fp-value" id="fp-val-9">—</div></div>
          <div class="fp-item" id="fp-10"><div class="fp-label">Color Depth</div><div class="fp-value" id="fp-val-10">—</div></div>
          <div class="fp-item" id="fp-11"><div class="fp-label">Do Not Track</div><div class="fp-value" id="fp-val-11">—</div></div>
          <div class="fp-item" id="fp-12"><div class="fp-label">Cookies Enabled</div><div class="fp-value" id="fp-val-12">—</div></div>
          <div class="fp-item" id="fp-13"><div class="fp-label">Connection Type</div><div class="fp-value" id="fp-val-13">—</div></div>
          <div class="fp-item" id="fp-14"><div class="fp-label">Viewport Size</div><div class="fp-value" id="fp-val-14">—</div></div>
          <div class="fp-item" id="fp-15"><div class="fp-label">Audio Context</div><div class="fp-value" id="fp-val-15">—</div></div>
          <div class="fp-item" id="fp-16"><div class="fp-label">WebGL Vendor</div><div class="fp-value" id="fp-val-16">—</div></div>
          <div class="fp-item" id="fp-17"><div class="fp-label">Installed Plugins</div><div class="fp-value" id="fp-val-17">—</div></div>
          <div class="fp-item" id="fp-18"><div class="fp-label">Font Detection</div><div class="fp-value" id="fp-val-18">—</div></div>
          <div class="fp-item" id="fp-19"><div class="fp-label">Ad Blocker</div><div class="fp-value" id="fp-val-19">—</div></div>
          <div class="fp-item" id="fp-20"><div class="fp-label">Math Constants</div><div class="fp-value" id="fp-val-20">—</div></div>
          <!-- Cookie-mode items (hidden by default) -->
          <div class="fp-cookie-item" id="fp-c0"><div class="fp-label">🍪 Tracking Cookie ID</div><div class="fp-value" id="fp-val-c0">—</div></div>
          <div class="fp-cookie-item" id="fp-c1"><div class="fp-label">🍪 Cookie Expiry</div><div class="fp-value" id="fp-val-c1">—</div></div>
          <div class="fp-cookie-item" id="fp-c2"><div class="fp-label">🍪 localStorage ID</div><div class="fp-value" id="fp-val-c2">—</div></div>
          <div class="fp-cookie-item" id="fp-c3"><div class="fp-label">🍪 sessionStorage ID</div><div class="fp-value" id="fp-val-c3">—</div></div>
          <div class="fp-cookie-item" id="fp-c4"><div class="fp-label">🍪 Cookie Sync Partners</div><div class="fp-value" id="fp-val-c4">—</div></div>
        </div>
        <div class="fp-cookie-banner" id="fp-cookie-verdict"></div>
        <div class="fp-hash" id="fp-hash">Your unique fingerprint: ...</div>
        <div class="fp-uniqueness" id="fp-unique"></div>
        <canvas id="fp-canvas" width="280" height="20" style="display:none;"></canvas>
      </div>
    </div>

    <div class="explain">
      <strong>In plain English:</strong> <em>Without cookies,</em> websites can still identify you using your browser's unique combination of settings — screen size, installed fonts, timezone, GPU, and more. Combined, these create a "fingerprint" that's often unique to you. It's like being identified by your walk, voice, and height combined — no ID card needed.<br><br>
      <em>With cookies,</em> it's even worse: sites just store a permanent unique ID on your device. No detective work needed — they stapled a name tag to you. Even if you clear cookies, they use <strong>localStorage</strong>, <strong>sessionStorage</strong>, and <strong>cookie syncing</strong> (sharing your ID between ad networks) to bring it right back. Toggle the switch above to see both in action.
    </div>
  </div>

  <!-- ═══════════════════ 10. DNS PRIVACY ════════════════ -->
  <div class="section-card" id="dns">
    <h2><span class="icon">🌐</span> DNS — The Internet's Phone Book</h2>
    <p class="subtitle">Type websites you visit and see who's watching your lookups</p>

    <div class="anim-box">
      <div class="dns-scene">
        <div class="input-row" style="margin-bottom:14px;">
          <input type="text" class="user-input" id="dns-site-input" placeholder="Type a website (e.g. youtube.com)" maxlength="40">
          <button class="btn btn-red" onclick="dnsNormal()" style="margin:0;">Look Up (Normal)</button>
          <button class="btn btn-green" onclick="dnsSecure()" style="margin:0;">Look Up (Encrypted)</button>
        </div>

        <div class="dns-flow" id="dns-flow">
          <div class="dns-node"><div class="dn-icon">💻</div><div class="dn-label">You</div></div>
          <div class="dns-arrow"><div class="dns-query" id="dns-q1"></div></div>
          <div class="dns-node"><div class="dn-icon" id="dns-server-icon">🏢</div><div class="dn-label" id="dns-server-label">ISP's DNS</div></div>
          <div class="dns-arrow"><div class="dns-query" id="dns-q2"></div></div>
          <div class="dns-node"><div class="dn-icon">🌐</div><div class="dn-label" id="dns-dest-label">Website</div></div>
        </div>

        <div class="sniff-bubble" id="dns-msg" style="display:block;text-align:center;margin:14px auto 0;"></div>

        <!-- ISP browsing log -->
        <div class="dns-log" id="dns-log">
          <div style="font-size:0.7em;color:var(--muted);margin-bottom:6px;font-weight:600;">📋 Your ISP's Log of Your Browsing:</div>
        </div>
      </div>
    </div>

    <div class="explain">
      <strong>In plain English:</strong> DNS is like a phone book — your device asks "What's the address for youtube.com?" Normally this question is sent unencrypted, so your ISP can see every website you visit. <strong>Encrypted DNS</strong> (DNS over HTTPS) hides those lookups. You can switch to privacy-respecting DNS providers like Cloudflare (1.1.1.1) or Quad9 (9.9.9.9) in your device settings.
    </div>
  </div>

</div>

<!-- JAVASCRIPT -->
<script>
  // ── Helpers ────────────────────────────────────────────
  function scramble(str) {
    let out = '';
    for (let i = 0; i < str.length; i++) out += String.fromCharCode(33 + Math.floor(Math.random() * 93));
    return out;
  }
  function fakeIP() {
    return Math.floor(Math.random()*200+10) + '.' + Math.floor(Math.random()*255) + '.' + Math.floor(Math.random()*255) + '.' + Math.floor(Math.random()*255);
  }
  function resetEl(el, ...classes) {
    classes.forEach(c => el.classList.remove(c));
  }

  // ── 1. HTTPS ───────────────────────────────────────────
  function getUserSecret() {
    return document.getElementById('https-input').value.trim() || 'MyP@ssword123';
  }
  function sendHTTP() {
    const secret = getUserSecret();
    const pkt = document.getElementById('http-packet');
    const hacker = document.getElementById('http-hacker');
    const stolen = document.getElementById('http-stolen');
    // Reset
    pkt.style.animation = 'none'; pkt.offsetHeight; pkt.style.opacity = '0';
    hacker.classList.remove('alert','blocked'); stolen.classList.remove('show');
    // Set content to user's actual input
    pkt.textContent = secret;
    stolen.textContent = 'Stolen: "' + secret + '"';
    // Animate
    pkt.style.animation = 'sendPacket 2s ease forwards'; pkt.style.opacity = '1';
    setTimeout(() => { hacker.classList.add('alert'); stolen.classList.add('show'); }, 1000);
  }
  function sendHTTPS() {
    const secret = getUserSecret();
    const pkt = document.getElementById('https-packet');
    const hacker = document.getElementById('https-hacker');
    const stolen = document.getElementById('https-stolen');
    pkt.style.animation = 'none'; pkt.offsetHeight; pkt.style.opacity = '0';
    hacker.classList.remove('alert','blocked'); stolen.classList.remove('show');
    pkt.textContent = scramble(secret);
    stolen.textContent = 'Sees: "' + scramble(secret) + '" — useless!';
    pkt.style.animation = 'sendPacket 2s ease forwards'; pkt.style.opacity = '1';
    setTimeout(() => { hacker.classList.add('blocked'); stolen.classList.add('show'); }, 1000);
  }

  // ── 2. VPN ─────────────────────────────────────────────
  function getVPNSite() {
    return document.getElementById('vpn-site-input').value.trim() || 'reddit.com';
  }
  function sendNoVPN() {
    const site = getVPNSite();
    document.getElementById('novpn-site-label').textContent = site;
    document.getElementById('vpn-site-label').textContent = site;
    const pkt = document.getElementById('novpn-pkt');
    pkt.textContent = '📍 98.45.12.7 → ' + site;
    document.getElementById('novpn-sees').textContent = 'Sees: You in your city';
    pkt.style.animation = 'none'; pkt.offsetHeight;
    pkt.style.animation = 'vpnSend 1.8s ease forwards'; pkt.style.opacity = '1';
  }
  function sendWithVPN() {
    const site = getVPNSite();
    document.getElementById('novpn-site-label').textContent = site;
    document.getElementById('vpn-site-label').textContent = site;
    const pkt1 = document.getElementById('vpn-pkt1');
    const pkt2 = document.getElementById('vpn-pkt2');
    const tunnel = document.getElementById('tunnel-overlay');
    pkt2.textContent = '📍 185.32.xx → ' + site;
    pkt1.style.animation = 'none'; pkt2.style.animation = 'none'; pkt1.offsetHeight;
    tunnel.classList.add('active');
    pkt1.style.animation = 'vpnSend 1.2s ease forwards'; pkt1.style.opacity = '1';
    setTimeout(() => { pkt2.style.animation = 'vpnSend 1.2s ease forwards'; pkt2.style.opacity = '1'; }, 900);
  }

  // ── 3. ENCRYPTION ──────────────────────────────────────
  function getEncMsg() {
    return document.getElementById('enc-input').value.trim() || 'Meet me at the park at 5pm';
  }
  function updateEncPlain() {
    const v = document.getElementById('enc-input').value.trim();
    document.getElementById('enc-plain').textContent = v || 'Type something above...';
    // Reset output when typing
    document.getElementById('enc-output').textContent = 'Press encrypt...';
    document.getElementById('enc-output').className = 'msg-display';
    document.getElementById('enc-output').style.borderColor = 'var(--border)';
    document.getElementById('enc-output').style.color = 'var(--muted)';
    document.getElementById('enc-lock').textContent = '🔓';
    document.getElementById('enc-lock').classList.remove('locked');
    document.getElementById('enc-plain').style.opacity = '1';
  }
  function encryptMsg() {
    const msg = getEncMsg();
    const lock = document.getElementById('enc-lock');
    const output = document.getElementById('enc-output');
    const plain = document.getElementById('enc-plain');
    plain.textContent = msg;
    // Scramble animation: cycle through random chars
    let i = 0;
    const interval = setInterval(() => {
      let partial = '';
      for (let j = 0; j < msg.length; j++) {
        partial += (j <= i) ? String.fromCharCode(33 + Math.floor(Math.random()*93)) : msg[j];
      }
      output.textContent = partial;
      i++;
      if (i >= msg.length) {
        clearInterval(interval);
        output.textContent = scramble(msg);
        output.className = 'msg-display encrypted';
        lock.textContent = '🔒';
        lock.classList.add('locked');
        plain.style.opacity = '0.4';
      }
    }, 40);
    output.className = 'msg-display';
    output.style.borderColor = 'var(--yellow)';
    output.style.color = 'var(--yellow)';
  }
  function decryptMsg() {
    const msg = getEncMsg();
    const lock = document.getElementById('enc-lock');
    const output = document.getElementById('enc-output');
    const plain = document.getElementById('enc-plain');
    // Unscramble animation
    const scrambled = output.textContent;
    let i = 0;
    const interval = setInterval(() => {
      let partial = '';
      for (let j = 0; j < msg.length; j++) {
        partial += (j <= i) ? msg[j] : scrambled[j] || String.fromCharCode(33 + Math.floor(Math.random()*93));
      }
      output.textContent = partial;
      i++;
      if (i >= msg.length) {
        clearInterval(interval);
        output.textContent = msg;
        output.className = 'msg-display plain';
        lock.textContent = '🔓';
        lock.classList.remove('locked');
        plain.style.opacity = '1';
      }
    }, 40);
  }

  // ── 4. COOKIES / TRACKING ──────────────────────────────
  function getCookieInfo() {
    return {
      name: document.getElementById('cookie-name').value.trim() || 'User',
      age: document.getElementById('cookie-age').value || '17',
      hobby: document.getElementById('cookie-hobby').value.trim() || 'gaming',
      city: document.getElementById('cookie-city').value.trim() || 'San Diego'
    };
  }

  const siteData = [
    { name: 'Shopping', essential: ['session_id', 'cart_items'], tracker: ['ad_id', 'fb_pixel', 'purchase_intent'], action: 'Browsed sneakers, electronics' },
    { name: 'News', essential: ['read_articles'], tracker: ['google_ads', 'cross_site_id', 'reading_time'], action: 'Read tech & world news' },
    { name: 'Video', essential: ['watch_history'], tracker: ['ad_profile', 'view_duration', 'recommendations'], action: 'Watched tutorials, music' },
    { name: 'Search', essential: ['search_prefs'], tracker: ['search_history', 'click_track', 'location_ip'], action: 'Searched for hobby-related topics' },
    { name: 'Gaming', essential: ['game_save'], tracker: ['device_id', 'play_time', 'interest_graph'], action: 'Played action & strategy games' }
  ];
  let visited = new Set();
  let profileLines = [];
  let adCount = 0;

  function visitSite(idx) {
    if (visited.has(idx)) return;
    visited.add(idx);
    const info = getCookieInfo();
    const card = document.getElementById('site-card-' + idx);
    const trail = document.getElementById('cookies-' + idx);
    card.classList.add('visited');
    trail.innerHTML = '';

    const site = siteData[idx];
    let delay = 0;
    site.essential.forEach(c => {
      setTimeout(() => { trail.innerHTML += '<span class="cookie-tag essential">' + c + '</span>'; }, delay);
      delay += 180;
    });
    site.tracker.forEach(c => {
      setTimeout(() => { trail.innerHTML += '<span class="cookie-tag tracker">' + c + '</span>'; }, delay);
      delay += 180;
    });

    // Build profile based on user data + which sites visited
    setTimeout(() => buildProfile(info, idx), delay + 200);
  }

  function buildProfile(info, latestIdx) {
    const profile = document.getElementById('cookie-profile');
    profile.classList.add('show');

    // Lines grow with each site visited
    const allLines = [
      '👤 Name: ' + info.name,
      '🎂 Age: ~' + info.age + ' (' + (parseInt(info.age) < 18 ? 'minor' : parseInt(info.age) < 25 ? '18-24 demo' : '25+ demo') + ')',
      '📍 Location: ' + info.city + ' (from IP geolocation)',
      '🎯 Interest: ' + info.hobby + ' (from search + browsing)',
    ];
    if (visited.size >= 2) allLines.push('🛒 Shopping intent: High (visited shopping + ' + (visited.has(3) ? 'search' : 'other') + ')');
    if (visited.size >= 3) allLines.push('⏱️ Online hours: ~' + (Math.floor(Math.random()*3)+2) + 'hrs/day (from tracking pixels)');
    if (visited.size >= 4) allLines.push('🔗 Cross-site ID: ' + scramble('abc').substring(0,8) + ' (tracks you across ALL these sites)');

    allLines.forEach((line, i) => {
      const el = document.getElementById('cp-' + i);
      if (el) {
        el.textContent = line;
        setTimeout(() => el.classList.add('show'), i * 200);
      }
    });

    // Generate targeted ads after 2+ sites
    if (visited.size >= 2) {
      setTimeout(() => generateAds(info, latestIdx), 600);
    }
  }

  function generateAds(info, latestIdx) {
    const adBox = document.getElementById('ad-results');
    adBox.classList.add('show');

    const ads = [];
    // Ads personalized from their actual inputs
    if (info.hobby) {
      ads.push({
        icon: '🎯', title: info.hobby.charAt(0).toUpperCase() + info.hobby.slice(1) + ' gear — 40% off near ' + info.city + '!',
        reason: 'Because: cookie "interest_graph" matched "' + info.hobby + '"',
        cookie: 'Tracker: ad_id + interest_graph + location_ip'
      });
    }
    if (visited.has(0)) {
      ads.push({
        icon: '🛒', title: 'Still thinking about those sneakers, ' + info.name + '?',
        reason: 'Because: cookie "purchase_intent" = high, "cart_items" = sneakers',
        cookie: 'Tracker: fb_pixel + purchase_intent + cart_items'
      });
    }
    if (visited.has(2)) {
      ads.push({
        icon: '📺', title: 'Premium streaming — first month free for ' + info.city + ' residents!',
        reason: 'Because: cookie "view_duration" > 30min, "location_ip" = ' + info.city,
        cookie: 'Tracker: ad_profile + view_duration + location_ip'
      });
    }
    if (visited.has(3) || visited.has(4)) {
      ads.push({
        icon: '🎮', title: (parseInt(info.age) < 20 ? 'New releases' : 'Top picks') + ' in ' + info.hobby + ' for you',
        reason: 'Because: cookie "search_history" + "play_time" built your interest profile',
        cookie: 'Tracker: search_history + device_id + cross_site_id'
      });
    }
    // Fallback
    if (ads.length < 2) {
      ads.push({
        icon: '📱', title: 'Deals near ' + info.city + ' — curated for ages ' + (parseInt(info.age) < 18 ? '13-17' : '18-24') + '!',
        reason: 'Because: your IP geolocated to ' + info.city + ', age demo from browsing patterns',
        cookie: 'Tracker: google_ads + location_ip + cross_site_id'
      });
    }

    ads.forEach((ad, i) => {
      const el = document.getElementById('ad-' + i);
      if (!el) return;
      el.querySelector('.ad-icon').textContent = ad.icon;
      el.querySelector('.ad-title').textContent = ad.title;
      el.querySelector('.ad-reason').textContent = ad.reason;
      el.querySelector('.ad-cookie').textContent = ad.cookie;
      setTimeout(() => el.classList.add('show'), i * 400);
    });
  }

  // ── 5. PASSWORD STRENGTH ───────────────────────────────
  let bfInterval = null;
  function checkPassword() {
    const pw = document.getElementById('pw-input').value;
    const fill = document.getElementById('pw-fill');
    const label = document.getElementById('pw-label');
    const crack = document.getElementById('pw-crack');
    const bfBtn = document.getElementById('bf-btn');
    // Stop any running bruteforce
    if (bfInterval) { clearInterval(bfInterval); bfInterval = null; }
    document.getElementById('bf-box').classList.remove('show');

    if (!pw) {
      fill.style.width = '0'; label.textContent = 'Type something above'; label.style.color = 'var(--muted)'; crack.textContent = ''; bfBtn.style.display = 'none'; return;
    }
    bfBtn.style.display = 'inline-block';

    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (pw.length >= 16) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    if (pw.length >= 20) score++;

    const common = ['password','123456','qwerty','letmein','admin','welcome','monkey','dragon','master','abc123','iloveyou'];
    if (common.some(c => pw.toLowerCase().includes(c))) score = 0;

    const levels = [
      { pct:'10%', color:'var(--red)', text:'Terrible', time:'Cracked instantly' },
      { pct:'25%', color:'var(--red)', text:'Weak', time:'Cracked in seconds' },
      { pct:'40%', color:'var(--orange)', text:'Fair', time:'Cracked in hours' },
      { pct:'55%', color:'var(--orange)', text:'Moderate', time:'Cracked in weeks' },
      { pct:'70%', color:'var(--yellow)', text:'Good', time:'Would take years' },
      { pct:'82%', color:'var(--green)', text:'Strong', time:'Would take centuries' },
      { pct:'92%', color:'var(--green)', text:'Very Strong', time:'Would take millennia' },
      { pct:'100%', color:'#00c853', text:'Excellent', time:'Practically uncrackable' }
    ];
    const level = levels[Math.min(score, levels.length-1)];
    fill.style.width = level.pct; fill.style.background = level.color;
    label.textContent = level.text; label.style.color = level.color;
    crack.textContent = level.time;
  }

  function startBruteforce() {
    const pw = document.getElementById('pw-input').value;
    if (!pw) return;
    const box = document.getElementById('bf-box');
    const attempt = document.getElementById('bf-attempt');
    const counter = document.getElementById('bf-counter');
    box.classList.add('show');
    if (bfInterval) clearInterval(bfInterval);

    let count = 0;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let matched = 0; // how many chars of the password we've "cracked"

    bfInterval = setInterval(() => {
      count++;
      // Generate a random guess that progressively matches the real password
      let guess = '';
      for (let i = 0; i < pw.length; i++) {
        if (i < matched) {
          guess += pw[i]; // already cracked chars
        } else {
          guess += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      attempt.textContent = guess;
      counter.textContent = count.toLocaleString() + ' attempts';

      // After enough attempts, "crack" the next character
      if (pw.length <= 4 && count % 20 === 0) matched++;
      else if (pw.length <= 6 && count % 50 === 0) matched++;
      else if (pw.length <= 8 && count % 120 === 0) matched++;
      else if (count % 300 === 0) matched++;

      if (matched >= pw.length) {
        clearInterval(bfInterval);
        bfInterval = null;
        attempt.textContent = pw;
        attempt.style.color = 'var(--green)';
        counter.textContent = count.toLocaleString() + ' attempts — CRACKED!';
        setTimeout(() => { attempt.style.color = 'var(--red)'; }, 2000);
      }
    }, 30);
  }

  // ── 6. PUBLIC WI-FI ────────────────────────────────────
  function getWifiData() {
    return {
      activity: document.getElementById('wifi-activity').value.trim() || 'logging into Instagram',
      user: document.getElementById('wifi-user').value.trim() || 'alex@gmail.com',
      pass: document.getElementById('wifi-pass').value.trim() || 'ilovecats99'
    };
  }
  function wifiAttack() {
    const data = getWifiData();
    ['wdev-0','wdev-1','wdev-2'].forEach(d => { document.getElementById(d).classList.remove('compromised','safe'); });
    const intercept = document.getElementById('wifi-intercept');
    intercept.className = 'intercepted-data';

    document.getElementById('wdev-2').classList.add('compromised');
    setTimeout(() => {
      document.getElementById('wdev-0').classList.add('compromised');
      intercept.className = 'intercepted-data show bad';
      intercept.innerHTML = '<div style="font-size:0.85em;color:var(--red);font-weight:600;margin-bottom:8px;">🕵️ Hacker\'s Screen — Intercepted Data:</div>';

      const lines = [
        '> Activity: ' + data.activity,
        '> Username: ' + data.user,
        '> Password: ' + data.pass,
        '> Device: ' + navigator.platform,
        '> Status: ALL DATA CAPTURED IN PLAIN TEXT'
      ];
      lines.forEach((line, i) => {
        setTimeout(() => {
          const div = document.createElement('div');
          div.className = 'intercept-line';
          div.style.color = (i === lines.length-1) ? 'var(--red)' : 'var(--text)';
          div.textContent = line;
          intercept.appendChild(div);
          setTimeout(() => div.classList.add('show'), 50);
        }, i * 400);
      });
    }, 800);
  }
  function wifiProtect() {
    const data = getWifiData();
    ['wdev-0','wdev-1','wdev-2'].forEach(d => { document.getElementById(d).classList.remove('compromised','safe'); });
    const intercept = document.getElementById('wifi-intercept');
    intercept.className = 'intercepted-data';

    document.getElementById('wdev-0').classList.add('safe');
    document.getElementById('wdev-2').classList.add('compromised');
    setTimeout(() => {
      intercept.className = 'intercepted-data show good';
      intercept.innerHTML = '<div style="font-size:0.85em;color:var(--green);font-weight:600;margin-bottom:8px;">🕵️ Hacker\'s Screen — Can\'t Read Anything:</div>';

      const lines = [
        '> Activity: ' + scramble(data.activity),
        '> Username: ' + scramble(data.user),
        '> Password: ' + scramble(data.pass),
        '> Connection: VPN TUNNEL (encrypted)',
        '> Status: ALL DATA IS GIBBERISH'
      ];
      lines.forEach((line, i) => {
        setTimeout(() => {
          const div = document.createElement('div');
          div.className = 'intercept-line';
          div.style.color = (i >= 3) ? 'var(--green)' : 'var(--muted)';
          div.textContent = line;
          intercept.appendChild(div);
          setTimeout(() => div.classList.add('show'), 50);
        }, i * 400);
      });
    }, 500);
  }

  // ── 7. 2FA ─────────────────────────────────────────────
  function get2FAPW() {
    return document.getElementById('tfa-pw').value.trim() || 'MyPassword1';
  }
  function reset2FA() {
    ['tfa-1','tfa-2','tfa-3'].forEach(s => {
      const el = document.getElementById(s);
      el.className = 'tfa-step';
    });
    document.getElementById('tfa-pw-display').textContent = '';
    document.getElementById('tfa-code-display').textContent = '';
    document.getElementById('tfa-result-display').textContent = '';
    const msg = document.getElementById('tfa-msg');
    msg.className = 'sniff-bubble'; msg.textContent = '';
  }
  function run2FA() {
    reset2FA();
    const pw = get2FAPW();
    const code = String(Math.floor(100000 + Math.random()*900000));
    setTimeout(() => {
      document.getElementById('tfa-1').classList.add('active');
      document.getElementById('tfa-pw-display').textContent = '"' + pw + '"';
    }, 300);
    setTimeout(() => {
      document.getElementById('tfa-1').classList.remove('active');
      document.getElementById('tfa-1').classList.add('done');
    }, 1200);
    setTimeout(() => {
      document.getElementById('tfa-2').classList.add('active');
      document.getElementById('tfa-code-display').textContent = 'Code: ' + code;
    }, 1400);
    setTimeout(() => {
      document.getElementById('tfa-2').classList.remove('active');
      document.getElementById('tfa-2').classList.add('done');
    }, 2400);
    setTimeout(() => {
      document.getElementById('tfa-3').classList.add('done');
      document.getElementById('tfa-result-display').textContent = 'Welcome!';
      const msg = document.getElementById('tfa-msg');
      msg.className = 'sniff-bubble show ok';
      msg.textContent = 'Both password + phone code verified — you\'re in!';
    }, 2700);
  }
  function runNo2FA() {
    reset2FA();
    const pw = get2FAPW();
    setTimeout(() => {
      document.getElementById('tfa-1').classList.add('done');
      document.getElementById('tfa-pw-display').textContent = 'Hacker knows: "' + pw + '"';
    }, 500);
    setTimeout(() => {
      document.getElementById('tfa-2').classList.add('failed');
      document.getElementById('tfa-code-display').textContent = 'No phone!';
    }, 1200);
    setTimeout(() => {
      document.getElementById('tfa-result-display').textContent = 'DENIED';
      const msg = document.getElementById('tfa-msg');
      msg.className = 'sniff-bubble show danger';
      msg.textContent = 'Hacker typed "' + pw + '" correctly, but got BLOCKED — no phone code!';
    }, 2000);
  }

  // ── 8. DATA BREACH ─────────────────────────────────────
  function getBreachData() {
    return {
      email: document.getElementById('breach-email').value.trim() || 'you@gmail.com',
      pw: document.getElementById('breach-pw').value.trim() || 'hunter2',
      addr: document.getElementById('breach-addr').value.trim() || '123 Main St'
    };
  }
  function showBreach(good) {
    const data = getBreachData();
    const db = document.getElementById('db-icon');
    const msg = document.getElementById('breach-msg');
    const container = document.getElementById('leak-items');

    db.classList.remove('breached');
    msg.className = 'sniff-bubble'; msg.textContent = '';
    container.innerHTML = '';

    setTimeout(() => db.classList.add('breached'), 100);

    if (good) {
      const items = [
        { text: '📧 Email: ' + data.email, cls: 'leaked' },
        { text: '🔒 Password: ' + scramble(data.pw).substring(0,10) + '... (hashed)', cls: 'hashed' },
        { text: '🔒 Address: encrypted', cls: 'hashed' },
      ];
      items.forEach((item, i) => {
        setTimeout(() => {
          const div = document.createElement('div');
          div.className = 'leak-item ' + item.cls;
          div.textContent = item.text;
          container.appendChild(div);
          setTimeout(() => div.classList.add('show'), 50);
        }, 500 + i * 300);
      });
      setTimeout(() => {
        msg.className = 'sniff-bubble show ok';
        msg.textContent = 'Your password "' + data.pw + '" was hashed — hackers can\'t read it! Your address was encrypted too.';
      }, 1600);
    } else {
      const items = [
        { text: '📧 Email: ' + data.email, cls: 'leaked' },
        { text: '🔑 Password: ' + data.pw, cls: 'leaked' },
        { text: '📍 Address: ' + data.addr, cls: 'leaked' },
        { text: '💳 Card on file: 4821-XXXX-XXXX', cls: 'leaked' },
      ];
      items.forEach((item, i) => {
        setTimeout(() => {
          const div = document.createElement('div');
          div.className = 'leak-item ' + item.cls;
          div.textContent = item.text;
          container.appendChild(div);
          setTimeout(() => div.classList.add('show'), 50);
        }, 400 + i * 300);
      });
      setTimeout(() => {
        msg.className = 'sniff-bubble show danger';
        msg.textContent = 'Everything leaked in PLAIN TEXT — "' + data.pw + '" is now public. If you reuse this password, ALL your accounts are compromised.';
      }, 1800);
    }
  }

  // ── 9. FINGERPRINTING ──────────────────────────────────
  // All read-only — nothing is sent or stored anywhere.

  function getBrowserInfo() {
    // Try modern User-Agent Client Hints API first (Chrome 90+)
    if (navigator.userAgentData) {
      const brands = navigator.userAgentData.brands || [];
      // Filter out Chromium "Not A;Brand" noise entries
      const real = brands.filter(b => !/not.a/i.test(b.brand));
      if (real.length > 0) {
        // Pick the most specific brand (Edge, Opera, Chrome — prefer non-Chromium)
        const best = real.find(b => /edge|opera|brave|vivaldi|samsung/i.test(b.brand)) || real[real.length - 1];
        return best.brand + ' ' + best.version;
      }
    }
    // Fallback: parse UA string (order matters — most specific first)
    const ua = navigator.userAgent;
    if (navigator.brave && navigator.brave.isBrave) return 'Brave ' + (ua.match(/Chrome\/([\d.]+)/)?.[1] || '');
    if (ua.includes('Vivaldi/'))    return 'Vivaldi ' + (ua.match(/Vivaldi\/([\d.]+)/)?.[1] || '');
    if (ua.includes('SamsungBrowser/')) return 'Samsung Internet ' + (ua.match(/SamsungBrowser\/([\d.]+)/)?.[1] || '');
    if (ua.includes('Edg/'))        return 'Edge ' + (ua.match(/Edg\/([\d.]+)/)?.[1] || '');
    if (ua.includes('OPR/'))        return 'Opera ' + (ua.match(/OPR\/([\d.]+)/)?.[1] || '');
    if (ua.includes('Firefox/'))    return 'Firefox ' + (ua.match(/Firefox\/([\d.]+)/)?.[1] || '');
    if (ua.includes('Chrome/'))     return 'Chrome ' + (ua.match(/Chrome\/([\d.]+)/)?.[1] || '');
    if (ua.includes('Safari/') && ua.includes('Version/')) return 'Safari ' + (ua.match(/Version\/([\d.]+)/)?.[1] || '');
    return ua.split(' ').slice(-1)[0] || 'Unknown';
  }

  function getOS() {
    // Try Client Hints first
    if (navigator.userAgentData && navigator.userAgentData.platform) {
      const p = navigator.userAgentData.platform;
      if (p === 'Windows') return 'Windows';
      if (p === 'macOS')   return 'macOS';
      if (p === 'Android') return 'Android';
      if (p === 'Chrome OS') return 'Chrome OS';
      if (p === 'Linux')   return 'Linux';
    }
    const ua = navigator.userAgent;
    // iPad with iPadOS 13+ lies and reports as macOS — detect via touch
    if (ua.includes('Mac OS X') && navigator.maxTouchPoints > 1) {
      return 'iPadOS ' + (ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '');
    }
    if (ua.includes('iPhone') || ua.includes('iPod')) {
      return 'iOS ' + (ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '');
    }
    if (ua.includes('Android')) {
      return 'Android ' + (ua.match(/Android ([\d.]+)/)?.[1] || '');
    }
    if (ua.includes('CrOS')) return 'Chrome OS';
    if (ua.includes('Windows NT 10.0')) {
      // Can't distinguish 10 vs 11 from UA alone
      return 'Windows 10 or 11 (NT 10.0)';
    }
    if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
    if (ua.includes('Windows NT 6.1')) return 'Windows 7';
    if (ua.includes('Windows'))        return 'Windows';
    if (ua.includes('Mac OS X')) {
      return 'macOS ' + (ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '');
    }
    if (ua.includes('Linux')) return 'Linux';
    return navigator.platform || 'Unknown';
  }

  function getGPU() {
    try {
      const c = document.createElement('canvas');
      // Try WebGL2 first (more widely supported going forward), fall back to WebGL1
      const gl = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) return { vendor: 'WebGL unavailable', renderer: 'WebGL unavailable' };
      // WEBGL_debug_renderer_info is deprecated in Firefox 125+ and Safari 17+
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      if (dbg) {
        return {
          vendor: gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL),
          renderer: gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
        };
      }
      // Fallback: read the masked vendor/renderer (less specific but still useful)
      const vendor = gl.getParameter(gl.VENDOR);
      const renderer = gl.getParameter(gl.RENDERER);
      return {
        vendor: vendor + ' (masked — browser hides GPU details)',
        renderer: renderer + ' (masked)'
      };
    } catch (e) { return { vendor: 'Blocked', renderer: 'Blocked' }; }
  }

  function getCanvasHash() {
    try {
      const c = document.getElementById('fp-canvas');
      const ctx = c.getContext('2d');
      // Clear before each run so re-scans are consistent
      ctx.clearRect(0, 0, c.width, c.height);
      // Draw a mix of shapes, gradients, text with emoji — pixel output differs per GPU/OS/font stack
      ctx.fillStyle = '#f60';
      ctx.fillRect(0, 0, 62, 20);
      ctx.fillStyle = '#069';
      ctx.font = '14px Arial, sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('Cwm fjord', 2, 15);
      ctx.fillStyle = 'rgba(102,204,0,0.7)';
      ctx.font = '14px "Times New Roman", serif';
      ctx.fillText('bank glyphs', 80, 15);
      // Arc with anti-aliasing differences
      ctx.beginPath();
      ctx.arc(210, 10, 8, 0, Math.PI * 2);
      const grad = ctx.createLinearGradient(202, 2, 218, 18);
      grad.addColorStop(0, '#8338ec');
      grad.addColorStop(1, '#3a86ff');
      ctx.fillStyle = grad;
      ctx.fill();
      // Shadow rendering differs across engines
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#e63946';
      ctx.fillRect(240, 4, 30, 12);
      ctx.shadowBlur = 0;
      const dataURL = c.toDataURL();
      // Hash the data URL
      let hash = 0;
      for (let i = 0; i < dataURL.length; i++) {
        hash = ((hash << 5) - hash + dataURL.charCodeAt(i)) | 0;
      }
      return (hash >>> 0).toString(16).padStart(8, '0');
    } catch (e) { return 'blocked'; }
  }

  function getAudioFP() {
    // Render actual audio through an oscillator+compressor and read the output.
    // Different audio stacks produce slightly different floating-point results.
    try {
      const ctx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 5000, 44100);
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = 10000;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -50;
      comp.knee.value = 40;
      comp.ratio.value = 12;
      comp.attack.value = 0;
      comp.release.value = 0.25;
      osc.connect(comp);
      comp.connect(ctx.destination);
      osc.start(0);
      // Return a promise but we'll call this sync and show "computing..." then update
      ctx.startRendering();
      ctx.oncomplete = function(e) {
        const buf = e.renderedBuffer.getChannelData(0);
        // Hash a slice of the output buffer
        let h = 0;
        for (let i = 4500; i < 5000; i++) {
          h = ((h << 5) - h + Math.round(buf[i] * 1e6)) | 0;
        }
        const result = (h >>> 0).toString(16).padStart(8, '0');
        const el = document.getElementById('fp-val-15');
        if (el) el.textContent = result;
        // Update the global for hashing
        if (window._fpAudioResult !== undefined) window._fpAudioResult = result;
      };
      window._fpAudioResult = 'computing...';
      return 'computing...';
    } catch (e) { return 'blocked (autoplay policy)'; }
  }

  function getPlugins() {
    if (!navigator.plugins || navigator.plugins.length === 0) return 'None (API blocked or empty)';
    const names = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      names.push(navigator.plugins[i].name);
    }
    // Modern Chromium returns a fixed set of 5 fake PDF plugins for everyone
    const allPDF = names.every(n => /pdf/i.test(n));
    if (allPDF && names.length <= 5) {
      return names.length + ' (generic PDF list — Chrome fakes this since v91)';
    }
    const display = names.slice(0, 5).join(', ');
    return display + (names.length > 5 ? ' (+' + (names.length - 5) + ' more)' : '');
  }

  function detectFonts() {
    const testFonts = [
      'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
      'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Palatino Linotype',
      'Lucida Console', 'Helvetica Neue', 'Futura', 'Calibri', 'Segoe UI',
      'Roboto', 'Menlo', 'Fira Code', 'Consolas', 'Ubuntu', 'Cantarell',
      'Noto Sans', 'SF Pro Display', 'Apple Color Emoji'
    ];
    const found = [];
    // Use two test strings for better accuracy (different char shapes)
    const testStrings = ['mmmmmmmmmmlli', 'WwMmIiLl10Oo'];
    const baselines = {};
    const span = document.createElement('span');
    span.style.cssText = 'position:absolute;left:-9999px;top:-9999px;font-size:72px;visibility:hidden;white-space:nowrap;';
    document.body.appendChild(span);

    // Measure baselines for 3 generic families
    ['monospace', 'serif', 'sans-serif'].forEach(family => {
      baselines[family] = {};
      testStrings.forEach(str => {
        span.textContent = str;
        span.style.fontFamily = family;
        baselines[family][str] = { w: span.offsetWidth, h: span.offsetHeight };
      });
    });

    testFonts.forEach(f => {
      let detected = false;
      ['monospace', 'serif', 'sans-serif'].forEach(fallback => {
        if (detected) return;
        testStrings.forEach(str => {
          if (detected) return;
          span.textContent = str;
          span.style.fontFamily = '"' + f + '", ' + fallback;
          const w = span.offsetWidth;
          const h = span.offsetHeight;
          if (w !== baselines[fallback][str].w || h !== baselines[fallback][str].h) {
            detected = true;
          }
        });
      });
      if (detected) found.push(f);
    });

    document.body.removeChild(span);
    if (found.length === 0) return 'Default only';
    const show = found.slice(0, 6).join(', ');
    return show + (found.length > 6 ? ' (+' + (found.length - 6) + ' more) [' + found.length + '/' + testFonts.length + ' detected]' : ' [' + found.length + '/' + testFonts.length + ']');
  }

  function getDeviceMemory() {
    if (navigator.deviceMemory) {
      const gb = navigator.deviceMemory;
      // API returns approximate bucket: 0.25, 0.5, 1, 2, 4, 8
      return '>= ' + gb + ' GB (bucketed estimate, not exact)';
    }
    if (performance && performance.memory) {
      const heapGB = (performance.memory.jsHeapSizeLimit / (1024 * 1024 * 1024)).toFixed(1);
      return 'JS heap limit: ' + heapGB + ' GB (deviceMemory API blocked)';
    }
    return 'API blocked by browser (Firefox/Safari hide this)';
  }

  function getTouchSupport() {
    const maxPoints = navigator.maxTouchPoints || 0;
    const hasTouch = maxPoints > 0;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;
    const anyCoarse = window.matchMedia('(any-pointer: coarse)').matches;

    if (!hasTouch && !anyCoarse) return 'No touch (mouse/trackpad only)';
    if (hasTouch && hasFinePointer && canHover)
      return 'Hybrid — touch + mouse (' + maxPoints + ' pts, hover capable)';
    if (hasTouch && hasCoarsePointer && !canHover)
      return 'Touch-only (' + maxPoints + ' pts, no hover)';
    if (hasTouch && hasFinePointer)
      return 'Touch + precision pointer (' + maxPoints + ' pts)';
    return maxPoints + ' touch points' + (hasFinePointer ? ' + fine pointer' : '') + (canHover ? ', hover capable' : '');
  }

  function detectAdBlocker() {
    // Method 1: bait div with ad-like class names
    const bait = document.createElement('div');
    bait.className = 'adsbox ad-banner ad-wrapper';
    bait.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;pointer-events:none;';
    bait.innerHTML = '&nbsp;';
    document.body.appendChild(bait);
    const divBlocked = bait.offsetHeight === 0 || bait.clientHeight === 0 ||
                       getComputedStyle(bait).display === 'none' || getComputedStyle(bait).visibility === 'hidden';
    document.body.removeChild(bait);

    // Method 2: check if a script-like ad element gets blocked
    const bait2 = document.createElement('div');
    bait2.id = 'ad-test-banner-12345';
    bait2.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;';
    bait2.innerHTML = '&nbsp;';
    document.body.appendChild(bait2);
    const idBlocked = bait2.offsetHeight === 0 || getComputedStyle(bait2).display === 'none';
    document.body.removeChild(bait2);

    if (divBlocked || idBlocked) return 'Likely active (bait element hidden)';
    return 'Not detected (may still be active — some blockers only block network requests)';
  }

  function getMathFP() {
    // JS engines produce subtly different floating-point results for edge-case math
    const tests = {
      'tan(-1e300)': Math.tan(-1e300),
      'sinh(1)': Math.sinh(1),
      'atanh(0.5)': Math.atanh(0.5),
      'expm1(1)': Math.expm1(1),
      'log1p(1e-15)': Math.log1p(1e-15),
      'cbrt(2)': Math.cbrt(2)
    };
    // Hash all values together
    let h = 0;
    Object.values(tests).forEach(v => {
      // Use full precision — this is where engines differ
      const s = v.toString();
      for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h + s.charCodeAt(i)) | 0;
      }
    });
    return (h >>> 0).toString(16).padStart(8, '0');
  }

  function getTimezoneString() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    // Format offset correctly: +5:30, -8:00, etc.
    const sign = offset <= 0 ? '+' : '-';
    const absMin = Math.abs(offset);
    const hrs = Math.floor(absMin / 60);
    const mins = absMin % 60;
    const formatted = 'UTC' + sign + hrs + (mins > 0 ? ':' + String(mins).padStart(2, '0') : '');
    return tz + ' (' + formatted + ')';
  }

  function getDNT() {
    // Check multiple APIs — browsers implement this differently
    const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    // Also check Global Privacy Control (newer standard)
    const gpc = navigator.globalPrivacyControl;
    let parts = [];
    if (dnt === '1') parts.push('DNT: enabled');
    else if (dnt === '0') parts.push('DNT: disabled');
    else parts.push('DNT: unset');
    if (gpc) parts.push('GPC: enabled');
    if (parts.includes('DNT: enabled') || gpc)
      parts.push('(irony: makes you more unique)');
    return parts.join(', ');
  }

  // SHA-256 hash via Web Crypto API
  async function sha256(str) {
    if (window.crypto && crypto.subtle) {
      const buf = new TextEncoder().encode(str);
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback: simple djb2
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (h >>> 0).toString(16).padStart(8, '0');
  }

  // ── Fingerprint cookie mode toggle ─────────────────
  let fpCookieMode = false;

  function toggleFpCookieMode() {
    fpCookieMode = !fpCookieMode;
    const toggle = document.getElementById('fp-cookie-toggle');
    const lblNo = document.getElementById('fp-lbl-no');
    const lblYes = document.getElementById('fp-lbl-yes');
    const desc = document.getElementById('fp-mode-desc');
    toggle.classList.toggle('on', fpCookieMode);
    lblNo.classList.toggle('active', !fpCookieMode);
    lblYes.classList.toggle('active', fpCookieMode);

    // Show/hide cookie item slots
    document.querySelectorAll('.fp-cookie-item').forEach(el => {
      el.style.display = fpCookieMode ? '' : 'none';
      el.classList.remove('show');
      el.querySelector('.fp-value').textContent = '—';
    });
    const banner = document.getElementById('fp-cookie-verdict');
    banner.style.display = fpCookieMode ? '' : 'none';
    banner.classList.remove('show');

    if (fpCookieMode) {
      desc.textContent = 'With cookies enabled, sites can store a permanent ID on your device:';
    } else {
      desc.textContent = 'Click to see what YOUR browser is leaking right now — no cookies needed:';
      // Clean up demo cookies/storage
      document.cookie = '_demo_tracker=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      try { localStorage.removeItem('_demo_ls_id'); } catch(e) {}
      try { sessionStorage.removeItem('_demo_ss_id'); } catch(e) {}
    }

    // Reset previous results
    for (let i = 0; i <= 20; i++) {
      const item = document.getElementById('fp-' + i);
      const valEl = document.getElementById('fp-val-' + i);
      if (item) item.classList.remove('show');
      if (valEl) valEl.textContent = '—';
    }
    document.getElementById('fp-hash').classList.remove('show');
    document.getElementById('fp-unique').classList.remove('show');
  }

  function generateUUID() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function getCookieTrackingData() {
    const trackerId = generateUUID();
    const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    // Set a demo tracking cookie
    document.cookie = '_demo_tracker=' + trackerId + '; expires=' + expiry.toUTCString() + '; path=/; SameSite=Lax';

    // Set localStorage and sessionStorage trackers
    let lsId, ssId;
    try { lsId = generateUUID(); localStorage.setItem('_demo_ls_id', lsId); } catch(e) { lsId = 'blocked'; }
    try { ssId = generateUUID(); sessionStorage.setItem('_demo_ss_id', ssId); } catch(e) { ssId = 'blocked'; }

    // Read back the cookie to confirm
    const readBack = document.cookie.split(';').find(c => c.trim().startsWith('_demo_tracker='));
    const cookieVal = readBack ? readBack.split('=')[1] : 'blocked by browser';

    // Simulate cookie sync partners
    const partners = ['AdTrackr', 'DataBroker.io', 'PixelSync', 'UserGraph', 'TargetNet'];
    const synced = partners.map(p => p + ': ' + generateUUID().substring(0, 8)).join(', ');

    return [
      { label: 'Tracking Cookie ID', val: cookieVal },
      { label: 'Cookie Expiry',      val: expiry.toLocaleDateString() + ' (1 year from now — survives closing the browser)' },
      { label: 'localStorage ID',    val: lsId + (lsId !== 'blocked' ? ' (survives clearing cookies!)' : '') },
      { label: 'sessionStorage ID',  val: ssId + (ssId !== 'blocked' ? ' (cleared when tab closes)' : '') },
      { label: 'Cookie Sync Partners', val: synced }
    ];
  }

  async function collectFingerprint() {
    const gpu = getGPU();
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    const data = [
      { label: 'Browser & Version', val: getBrowserInfo() },
      { label: 'Screen Resolution',  val: screen.width + 'x' + screen.height + ' @' + window.devicePixelRatio + 'x DPR' },
      { label: 'OS / Platform',      val: getOS() },
      { label: 'Languages',          val: (navigator.languages || [navigator.language]).join(', ') },
      { label: 'Timezone & Offset',  val: getTimezoneString() },
      { label: 'CPU Cores',          val: (navigator.hardwareConcurrency || '?') + ' logical cores' },
      { label: 'GPU / Renderer',     val: gpu.renderer },
      { label: 'Canvas Fingerprint', val: getCanvasHash() },
      { label: 'Device Memory',      val: getDeviceMemory() },
      { label: 'Touch Support',      val: getTouchSupport() },
      { label: 'Color Depth',        val: screen.colorDepth + '-bit color, ' + screen.availWidth + 'x' + screen.availHeight + ' usable area' },
      { label: 'Do Not Track / GPC', val: getDNT() },
      { label: 'Cookies Enabled',    val: navigator.cookieEnabled ? 'Yes' : 'Blocked' },
      { label: 'Connection Type',    val: conn ? (() => { let et = conn.effectiveType || '?'; let note = et === '4g' ? ' (spec max — covers 4G, 5G, Wi-Fi)' : ''; return et + note + (conn.downlink ? ', ~' + conn.downlink + ' Mbps' : '') + (conn.rtt != null ? ', ' + conn.rtt + 'ms RTT' : ''); })() : 'API blocked (Firefox/Safari)' },
      { label: 'Viewport Size',      val: window.innerWidth + 'x' + window.innerHeight + ' CSS px (outer: ' + window.outerWidth + 'x' + window.outerHeight + ')' },
      { label: 'Audio Fingerprint',  val: getAudioFP() },
      { label: 'WebGL Vendor',       val: gpu.vendor },
      { label: 'Installed Plugins',  val: getPlugins() },
      { label: 'Font Detection',     val: detectFonts() },
      { label: 'Ad Blocker',         val: detectAdBlocker() },
      { label: 'Math Engine',        val: getMathFP() }
    ];

    // Reveal each fingerprint item with stagger
    data.forEach((d, i) => {
      setTimeout(() => {
        const item = document.getElementById('fp-' + i);
        const valEl = document.getElementById('fp-val-' + i);
        if (item && valEl) { valEl.textContent = d.val; item.classList.add('show'); }
      }, i * 180);
    });

    // If cookie mode is on, also show cookie tracking data
    let cookieData = [];
    if (fpCookieMode) {
      cookieData = getCookieTrackingData();
      const baseDelay = data.length * 180;
      cookieData.forEach((cd, i) => {
        setTimeout(() => {
          const item = document.getElementById('fp-c' + i);
          const valEl = document.getElementById('fp-val-c' + i);
          if (item && valEl) {
            valEl.textContent = cd.val;
            item.classList.add('show');
          }
        }, baseDelay + i * 220);
      });
    }

    // Build real SHA-256 hash from all collected data
    const allItems = fpCookieMode ? data.length + cookieData.length : data.length;
    const totalDelay = (data.length * 180) + (fpCookieMode ? cookieData.length * 220 : 0) + 600;

    setTimeout(async () => {
      // Wait for audio fingerprint to resolve
      const audioVal = window._fpAudioResult || 'blocked';
      data[15].val = audioVal;
      const audioEl = document.getElementById('fp-val-15');
      if (audioEl && audioVal !== 'computing...') audioEl.textContent = audioVal;

      const allVals = fpCookieMode
        ? data.map(d => d.val).concat(cookieData.map(cd => cd.val))
        : data.map(d => d.val);
      const raw = allVals.join('|');
      const hash = await sha256(raw);
      const fp = document.getElementById('fp-hash');
      fp.textContent = 'SHA-256 fingerprint: ' + hash.substring(0, 48) + '...';
      fp.classList.add('show');

      setTimeout(() => {
        const usable = data.filter(d => d.val && d.val !== '—' && d.val !== 'N/A' && d.val !== 'blocked' && !d.val.startsWith('API blocked')).length;
        const u = document.getElementById('fp-unique');

        if (fpCookieMode) {
          // Cookie mode verdict
          u.innerHTML = '<strong style="color:var(--orange)">' + usable + ' fingerprint signals</strong> + <strong style="color:var(--orange)">' + cookieData.length + ' cookie-based trackers</strong> collected.<br>' +
            'With cookies, sites don\'t <em>need</em> all that fingerprint math — the cookie ID alone identifies you <strong style="color:var(--orange)">with 100% certainty</strong>.<br>' +
            'The fingerprint signals are used as a <strong>backup</strong> to re-link you if you ever clear your cookies.';
          u.classList.add('show');

          // Show the cookie banner
          const banner = document.getElementById('fp-cookie-verdict');
          banner.innerHTML = '<strong>The difference:</strong> Without cookies, sites guess who you are from ' + usable + ' clues (like a detective). ' +
            'With cookies, they just read the ID they stapled to your forehead — <strong>no guessing needed</strong>. ' +
            'Even if you clear cookies, localStorage and sessionStorage can bring the ID right back. ' +
            'That\'s why "cookie syncing" exists: ad networks share your IDs so clearing one tracker doesn\'t help.';
          banner.style.display = '';
          banner.classList.add('show');
        } else {
          u.innerHTML = '<strong style="color:var(--orange)">' + usable + ' of ' + data.length + ' signals</strong> successfully collected from your browser.<br>' +
            'Combined, this fingerprint is likely <strong style="color:var(--orange)">unique to you</strong> among hundreds of thousands of users.<br>' +
            'This works in incognito mode, without cookies, and survives clearing browsing data.';
          u.classList.add('show');
        }
      }, 500);
    }, totalDelay);
  }

  // ── 10. DNS ────────────────────────────────────────────
  let dnsHistory = [];
  function getDNSSite() {
    return document.getElementById('dns-site-input').value.trim() || 'youtube.com';
  }
  function dnsNormal() {
    const site = getDNSSite();
    const q1 = document.getElementById('dns-q1');
    const q2 = document.getElementById('dns-q2');
    const msg = document.getElementById('dns-msg');
    const log = document.getElementById('dns-log');
    document.getElementById('dns-server-label').textContent = "ISP's DNS";
    document.getElementById('dns-server-icon').textContent = '🏢';
    document.getElementById('dns-dest-label').textContent = site;

    q1.className = 'dns-query'; q2.className = 'dns-query';
    msg.className = 'sniff-bubble'; msg.textContent = '';

    const fakeAddr = fakeIP();
    setTimeout(() => { q1.textContent = '"Where is ' + site + '?"'; q1.className = 'dns-query show plain'; }, 300);
    setTimeout(() => { q2.textContent = '"It\'s at ' + fakeAddr + '"'; q2.className = 'dns-query show plain'; }, 1000);
    setTimeout(() => {
      msg.className = 'sniff-bubble show danger';
      msg.textContent = 'Your ISP now knows you visited ' + site + ' — logged forever, can be sold to advertisers.';
    }, 1600);

    // Add to ISP log
    dnsHistory.push({ site: site, time: new Date().toLocaleTimeString(), exposed: true });
    setTimeout(() => renderDNSLog(), 1800);
  }
  function dnsSecure() {
    const site = getDNSSite();
    const q1 = document.getElementById('dns-q1');
    const q2 = document.getElementById('dns-q2');
    const msg = document.getElementById('dns-msg');
    document.getElementById('dns-server-label').textContent = 'Cloudflare 1.1.1.1';
    document.getElementById('dns-server-icon').textContent = '🔒';
    document.getElementById('dns-dest-label').textContent = site;

    q1.className = 'dns-query'; q2.className = 'dns-query';
    msg.className = 'sniff-bubble'; msg.textContent = '';

    setTimeout(() => { q1.textContent = '🔒 ' + scramble(site); q1.className = 'dns-query show secure'; }, 300);
    setTimeout(() => { q2.textContent = '🔒 ' + scramble('142.250.80'); q2.className = 'dns-query show secure'; }, 1000);
    setTimeout(() => {
      msg.className = 'sniff-bubble show ok';
      msg.textContent = 'Your ISP sees encrypted gibberish — they can\'t tell you looked up ' + site + '!';
    }, 1600);

    dnsHistory.push({ site: site, time: new Date().toLocaleTimeString(), exposed: false });
    setTimeout(() => renderDNSLog(), 1800);
  }
  function renderDNSLog() {
    const log = document.getElementById('dns-log');
    log.classList.add('show');
    // Only show last 8 entries
    const recent = dnsHistory.slice(-8);
    // Rebuild
    log.innerHTML = '<div style="font-size:0.7em;color:var(--muted);margin-bottom:6px;font-weight:600;">📋 Your ISP\'s Log of Your Browsing:</div>';
    recent.forEach((entry, i) => {
      const div = document.createElement('div');
      div.className = 'dns-log-entry ' + (entry.exposed ? 'exposed' : 'hidden');
      div.textContent = '[' + entry.time + '] ' + (entry.exposed ? '👁️ ' + entry.site : '🔒 ' + scramble(entry.site).substring(0,12) + '...');
      log.appendChild(div);
      setTimeout(() => div.classList.add('show'), i * 100);
    });
  }
</script>
