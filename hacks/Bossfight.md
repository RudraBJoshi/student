---
layout: default
permalink: /hacks/Bossfight
description: A 2D Platformer Boss Fight Game
---

<style>
  #game-container {
    position: relative;
    width: 100%;
    height: 80vh;
    min-height: 500px;
    background: #000;
    overflow: hidden;
    font-family: 'Segoe UI', sans-serif;
    user-select: none;
    cursor: crosshair;
  }
  #game-container canvas { display: block; }
  #game-container .overlay {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 10;
  }
  #game-container .overlay > * { pointer-events: auto; }

  /* Title Screen */
  #title-screen {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: linear-gradient(180deg, #0a0010 0%, #1a0020 50%, #0a0010 100%);
    z-index: 100;
  }
  #title-screen h1 {
    font-size: 64px; color: #ff3333; text-shadow: 0 0 30px #ff0000, 0 0 60px #ff000088;
    font-family: 'Georgia', serif; letter-spacing: 8px; margin-bottom: 10px;
    animation: titlePulse 2s ease-in-out infinite;
  }
  @keyframes titlePulse {
    0%, 100% { text-shadow: 0 0 30px #ff0000, 0 0 60px #ff000088; }
    50% { text-shadow: 0 0 50px #ff0000, 0 0 100px #ff000088, 0 0 150px #ff000044; }
  }
  #title-screen .subtitle {
    font-size: 16px; color: #aa8888; letter-spacing: 12px; margin-bottom: 50px;
  }
  @keyframes btnShimmer {
    0%   { left: -120%; }
    100% { left: 160%; }
  }
  @keyframes cardGlowPulse {
    0%, 100% { box-shadow: 0 0 25px #ff880044; }
    50%       { box-shadow: 0 0 45px #ff880077, 0 0 70px #ff440022; }
  }
  @keyframes bossGlowPulse {
    0%, 100% { box-shadow: 0 0 25px #ff000044; }
    50%       { box-shadow: 0 0 45px #ff000077, 0 0 70px #ff000022; }
  }
  @keyframes iconPop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.35) rotate(-6deg); }
    70%  { transform: scale(0.92) rotate(3deg); }
    100% { transform: scale(1.15); }
  }

  .menu-btn {
    background: linear-gradient(180deg, #2a1020, #1a0815);
    border: 2px solid #ff3333; color: #ff6666; padding: 14px 45px;
    font-size: 20px; cursor: pointer; margin: 8px; letter-spacing: 3px;
    transition: background 0.3s, box-shadow 0.3s, color 0.3s, transform 0.15s;
    font-family: 'Georgia', serif; min-width: 260px;
    position: relative; overflow: hidden;
  }
  .menu-btn::after {
    content: ''; position: absolute; top: 0; left: -120%;
    width: 55%; height: 100%;
    background: linear-gradient(100deg, transparent, rgba(255,140,140,0.18), transparent);
    pointer-events: none;
  }
  .menu-btn:hover::after { animation: btnShimmer 0.45s ease forwards; }
  .menu-btn:hover {
    background: linear-gradient(180deg, #3a1525, #2a1020);
    box-shadow: 0 0 20px #ff000066; color: #ff9999; transform: scale(1.05);
  }
  .menu-btn:active { transform: scale(0.96); box-shadow: 0 0 6px #ff333344; transition: transform 0.07s; }

  /* Class Select */
  #class-select {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    display: none; flex-direction: column; align-items: center; justify-content: center;
    background: linear-gradient(180deg, #0a0010 0%, #1a0020 50%, #0a0010 100%);
    z-index: 100; overflow-y: auto; padding: 20px;
  }
  #class-select h2 {
    font-size: 36px; color: #ffaa33; text-shadow: 0 0 20px #ff880088;
    font-family: 'Georgia', serif; margin-bottom: 30px; letter-spacing: 5px;
  }
  .class-cards { display: flex; gap: 25px; flex-wrap: wrap; justify-content: center; }
  .class-card {
    width: 240px; padding: 25px 18px; background: linear-gradient(180deg, #1a1025, #0d0815);
    border: 2px solid #444; cursor: pointer; transition: border-color 0.3s, transform 0.25s; text-align: center;
  }
  .class-card:hover {
    border-color: #ffaa33; transform: translateY(-6px);
    animation: cardGlowPulse 1.1s ease-in-out infinite;
  }
  .class-card:active { transform: translateY(-2px) scale(0.97); animation: none; }
  .class-card .class-icon { font-size: 44px; margin-bottom: 12px; display: inline-block; transition: transform 0.2s; }
  .class-card:hover .class-icon { animation: iconPop 0.35s ease forwards; }
  .class-card h3 { font-size: 22px; color: #ffcc66; margin-bottom: 10px; font-family: 'Georgia', serif; }
  .class-card p { color: #999; font-size: 12px; line-height: 1.5; }
  .class-card .stats { margin-top: 10px; text-align: left; }
  .class-card .stat-bar {
    display: flex; align-items: center; margin: 3px 0; font-size: 11px; color: #aaa;
  }
  .class-card .stat-bar span { width: 50px; }
  .class-card .stat-fill { height: 7px; background: #ff6633; margin-left: 8px; }

  /* Boss Select */
  #boss-select {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    display: none; flex-direction: column; align-items: center; justify-content: center;
    background: linear-gradient(180deg, #0a0010 0%, #1a0020 50%, #0a0010 100%);
    z-index: 100; overflow-y: auto; padding: 20px;
  }
  #boss-select h2 {
    font-size: 36px; color: #ff3333; text-shadow: 0 0 20px #ff000088;
    font-family: 'Georgia', serif; margin-bottom: 30px; letter-spacing: 5px;
  }
  .boss-cards { display: flex; gap: 25px; flex-wrap: wrap; justify-content: center; }
  .boss-card {
    width: 240px; padding: 25px 18px; background: linear-gradient(180deg, #1a0a15, #0d0510);
    border: 2px solid #444; cursor: pointer; transition: border-color 0.3s, transform 0.25s; text-align: center;
  }
  .boss-card:hover {
    border-color: #ff3333; transform: translateY(-6px);
    animation: bossGlowPulse 1.1s ease-in-out infinite;
  }
  .boss-card:active { transform: translateY(-2px) scale(0.97); animation: none; }
  .boss-card .boss-icon { font-size: 50px; margin-bottom: 12px; display: inline-block; transition: transform 0.2s; }
  .boss-card:hover .boss-icon { animation: iconPop 0.35s ease forwards; }
  .boss-card h3 { font-size: 22px; color: #ff6666; margin-bottom: 8px; font-family: 'Georgia', serif; }
  .boss-card p { color: #999; font-size: 12px; line-height: 1.5; }
  .boss-card .difficulty { color: #ff4444; font-size: 13px; margin-top: 10px; letter-spacing: 2px; }

  .back-btn {
    margin-top: 25px; background: none; border: 1px solid #666; color: #888;
    padding: 8px 25px; cursor: pointer; font-size: 13px;
    transition: border-color 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
  }
  .back-btn:hover { border-color: #aaa; color: #ccc; transform: translateX(-6px); box-shadow: -4px 0 12px #ffffff18; }
  .back-btn:active { transform: translateX(-3px) scale(0.95); }

  /* HUD */
  #hud {
    position: absolute; top: 0; left: 0; width: 100%; padding: 12px 20px;
    display: none; z-index: 50;
  }
  .hp-container { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .hp-label { color: #fff; font-size: 13px; min-width: 90px; font-family: 'Georgia', serif; }
  .hp-bar-bg {
    flex: 1; max-width: 300px; height: 20px; background: #1a0a0a; border: 1px solid #333;
    position: relative; overflow: hidden;
  }
  .hp-bar-fill { height: 100%; transition: width 0.3s; position: relative; }
  .hp-bar-fill.player { background: linear-gradient(180deg, #33ff33, #22aa22); }
  .hp-bar-fill.boss { background: linear-gradient(180deg, #ff3333, #aa2222); }
  .hp-text {
    position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
    color: #fff; font-size: 11px; text-shadow: 1px 1px 2px #000;
  }
  #super-bar-container {
    display: flex; align-items: center; gap: 8px; margin-top: 4px;
  }
  #super-label { color: #ffaa00; font-size: 12px; min-width: 90px; font-family: 'Georgia', serif; }
  #super-bar-bg {
    width: 180px; height: 12px; background: #1a1a0a; border: 1px solid #333;
    position: relative; overflow: hidden;
  }
  #super-bar-fill {
    height: 100%; width: 0%; background: linear-gradient(180deg, #ffaa00, #ff6600);
    transition: width 0.2s;
  }
  #super-ready { color: #ffaa00; font-size: 12px; display: none; animation: readyPulse 0.8s infinite; }
  @keyframes readyPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }

  /* Master Skill HUD */
  #master-skill-display {
    display: flex; align-items: center; gap: 8px; margin-top: 4px;
  }
  #master-skill-label-hud {
    font-size: 12px; min-width: 90px; font-family: 'Georgia', serif;
    letter-spacing: 1px;
  }
  #master-skill-info-hud { font-size: 12px; font-family: 'Georgia', serif; }

  /* Controls hint */
  #controls-hint {
    position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
    color: #555; font-size: 11px; z-index: 50; display: none; text-align: center;
    white-space: nowrap;
  }

  /* Game Over / Victory */
  @keyframes bannerFadeIn   { from { opacity:0 } to { opacity:1 } }
  @keyframes titleSlam      { from { transform:scale(2.2) translateY(-30px); opacity:0 } to { transform:scale(1) translateY(0); opacity:1 } }
  @keyframes titleDrift     { from { opacity:0; transform:translateY(-18px) } to { opacity:1; transform:translateY(0) } }
  @keyframes victoryGlow    { 0%,100% { text-shadow:0 0 30px #ffaa0099 } 50% { text-shadow:0 0 70px #ffcc00cc, 0 0 120px #ffaa0044 } }
  @keyframes defeatPulse    { 0%,100% { text-shadow:0 0 25px #ff000099 } 50% { text-shadow:0 0 60px #ff3300bb, 0 0 100px #ff000033 } }
  @keyframes separatorGrow  { from { width:0; opacity:0 } to { width:320px; opacity:1 } }
  @keyframes textSlideUp    { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
  @keyframes btnAppear      { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }

  #game-end {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    display: none; flex-direction: column; align-items: center; justify-content: center;
    z-index: 200; animation: bannerFadeIn 0.5s ease forwards;
  }
  #game-end.victory { background: radial-gradient(ellipse at 50% 40%, rgba(50,30,0,0.96) 0%, rgba(0,0,0,0.97) 65%); }
  #game-end.defeat  { background: radial-gradient(ellipse at 50% 40%, rgba(35,0,0,0.97) 0%, rgba(0,0,0,0.98) 65%); }
  #game-end h2 {
    font-size: 72px; font-family: 'Georgia', serif; margin-bottom: 8px; letter-spacing: 8px;
  }
  #game-end.victory h2 { animation: titleSlam 0.55s cubic-bezier(0.175,0.885,0.32,1.275) forwards, victoryGlow 2.2s 0.6s ease-in-out infinite; }
  #game-end.defeat  h2 { animation: titleDrift 0.7s ease forwards, defeatPulse 2.5s 0.8s ease-in-out infinite; }
  #end-separator {
    height: 2px; background: currentColor; margin: 10px auto 16px;
    animation: separatorGrow 0.5s 0.4s ease forwards; width: 0; opacity: 0;
  }
  #game-end.victory #end-separator { color: #ffcc00; }
  #game-end.defeat  #end-separator { color: #cc2200; }
  #game-end .result-text { color: #999; font-size: 16px; margin-bottom: 15px; animation: textSlideUp 0.4s 0.55s ease both; opacity:0; }
  #game-end .menu-btn { animation: btnAppear 0.4s ease both; opacity:0; }
  #game-end .menu-btn:nth-of-type(1) { animation-delay: 0.7s; }
  #game-end .menu-btn:nth-of-type(2) { animation-delay: 0.85s; }

  /* Medal earned on victory */
  #medal-display {
    margin-bottom: 20px; text-align: center;
  }
  .medal-earned {
    display: inline-block; padding: 8px 20px; margin: 5px;
    border: 2px solid #ffcc00; background: linear-gradient(180deg, #3a2a00, #1a1500);
    color: #ffdd44; font-family: 'Georgia', serif; font-size: 16px;
    letter-spacing: 2px; animation: medalShine 1.5s ease-in-out infinite;
  }
  .medal-earned.master {
    border-color: #ff8800; color: #ffaa33; font-size: 18px;
    box-shadow: 0 0 15px #ff880066;
  }
  .medal-earned.ascended {
    border-color: #ff44ff; color: #ff88ff; font-size: 20px;
    box-shadow: 0 0 25px #ff44ff66, 0 0 50px #ff44ff22;
    background: linear-gradient(180deg, #2a0030, #150018);
  }
  @keyframes medalShine {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  /* Medals button on title */
  #medals-btn {
    background: linear-gradient(180deg, #1a1a00, #0d0d00);
    border: 1px solid #666600; color: #aaaa44; padding: 10px 35px;
    font-size: 14px; cursor: pointer; margin-top: 5px; letter-spacing: 2px;
    transition: all 0.3s; font-family: 'Georgia', serif;
  }
  #medals-btn:hover {
    border-color: #aaaa00; color: #dddd66; box-shadow: 0 0 15px #aaaa0044;
  }

  /* Medals screen */
  #medals-screen {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    display: none; flex-direction: column; align-items: center;
    background: linear-gradient(180deg, #0a0010 0%, #1a0020 50%, #0a0010 100%);
    z-index: 100; overflow-y: auto; padding: 25px;
  }
  #medals-screen h2 {
    font-size: 36px; color: #ffcc00; text-shadow: 0 0 20px #ffaa0066;
    font-family: 'Georgia', serif; margin-bottom: 25px; letter-spacing: 5px;
  }
  .medals-grid {
    display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;
    max-width: 800px; margin-bottom: 15px;
  }
  .medal-card {
    width: 170px; padding: 15px 10px; text-align: center;
    border: 1px solid #333; background: #0d0d15;
  }
  .medal-card.unlocked {
    border-color: #ffcc00; background: linear-gradient(180deg, #1a1800, #0d0d05);
  }
  .medal-card.unlocked.master-card {
    border-color: #ff8800; background: linear-gradient(180deg, #1a1000, #0d0805);
    box-shadow: 0 0 10px #ff880033;
  }
  .medal-card.unlocked.ascended-card {
    border-color: #ff44ff; background: linear-gradient(180deg, #1a0020, #0d0010);
    box-shadow: 0 0 15px #ff44ff33;
  }
  .medal-card .medal-icon { font-size: 28px; margin-bottom: 6px; }
  .medal-card .medal-name {
    font-size: 13px; color: #666; font-family: 'Georgia', serif; margin-bottom: 4px;
  }
  .medal-card.unlocked .medal-name { color: #ffcc00; }
  .medal-card.unlocked.master-card .medal-name { color: #ff8800; }
  .medal-card.unlocked.ascended-card .medal-name { color: #ff44ff; }
  .medal-card .medal-desc { font-size: 10px; color: #555; }
  .medal-card.unlocked .medal-desc { color: #888; }
  .medals-section-title {
    font-size: 16px; color: #888; font-family: 'Georgia', serif;
    letter-spacing: 3px; margin: 15px 0 8px; width: 100%; text-align: center;
  }

  /* Rebirth */
  #rebirth-badge {
    font-size: 14px; color: #ff66ff; font-family: 'Georgia', serif;
    letter-spacing: 3px; margin-top: 8px;
    text-shadow: 0 0 10px #ff44ff88;
    animation: rebirthGlow 2s ease-in-out infinite;
  }
  @keyframes rebirthGlow {
    0%, 100% { text-shadow: 0 0 10px #ff44ff88; }
    50% { text-shadow: 0 0 20px #ff44ffcc, 0 0 40px #ff44ff44; }
  }
  #rebirth-btn {
    background: linear-gradient(180deg, #2a0030, #150018);
    border: 2px solid #ff44ff; color: #ff88ff; padding: 12px 35px;
    font-size: 16px; cursor: pointer; margin-top: 10px; letter-spacing: 3px;
    transition: all 0.3s; font-family: 'Georgia', serif;
    display: none;
    animation: rebirthPulse 1.5s ease-in-out infinite;
  }
  #rebirth-btn:hover {
    background: linear-gradient(180deg, #3a0045, #250028);
    box-shadow: 0 0 25px #ff44ff66; color: #ffaaff; transform: scale(1.08);
  }
  #reset-btn {
    background: none; border: 1px solid #553333; color: #775555;
    padding: 7px 22px; font-size: 12px; cursor: pointer; margin-top: 14px;
    letter-spacing: 2px; transition: all 0.2s; font-family: 'Georgia', serif;
  }
  #reset-btn:hover {
    border-color: #ff4444; color: #ff6666; box-shadow: 0 0 12px #ff222233;
  }
  #reset-btn:active { transform: scale(0.95); }

  /* Hacks Menu */
  #hacks-overlay {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    display: none; flex-direction: column; align-items: center; justify-content: center;
    background: rgba(0,8,0,0.97); z-index: 500; overflow-y: auto; padding: 20px;
  }
  #hacks-overlay h2 {
    font-size: 32px; color: #00ff66; font-family: 'Georgia', serif;
    letter-spacing: 5px; text-shadow: 0 0 20px #00ff6688; margin-bottom: 6px;
  }
  #hacks-overlay .hacks-warning {
    color: #ff4444; font-size: 12px; letter-spacing: 2px; margin-bottom: 20px;
    text-align: center;
  }
  .hacks-section {
    width: 420px; max-width: 90vw; margin-bottom: 16px;
    border: 1px solid #003322; padding: 14px 18px;
  }
  .hacks-section h3 {
    color: #00cc55; font-size: 13px; letter-spacing: 3px;
    font-family: 'Georgia', serif; margin-bottom: 12px;
  }
  .hack-row {
    display: flex; align-items: center; margin: 8px 0; gap: 10px;
  }
  .hack-row label {
    color: #aaa; font-size: 12px; width: 90px; flex-shrink: 0; letter-spacing: 1px;
  }
  .hack-row input[type=range] {
    flex: 1; accent-color: #00ff66; cursor: pointer;
  }
  .hack-row .hack-val {
    color: #00ff66; font-size: 12px; width: 36px; text-align: right;
    font-family: monospace;
  }
  .hacks-toggle-row {
    display: flex; align-items: center; gap: 14px; margin-bottom: 16px;
  }
  .hacks-toggle-row label { color: #aaaaaa; font-size: 13px; letter-spacing: 2px; }
  #hacks-active-toggle { width: 20px; height: 20px; accent-color: #00ff66; cursor: pointer; }
  #hacks-active-label { color: #ff4444; font-size: 13px; font-weight: bold; }

  /* Screen transition overlay */
  #transition-overlay {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: #000; z-index: 9999; pointer-events: none;
    opacity: 0; transition: opacity 0.25s ease;
  }
  @keyframes rebirthPulse {
    0%, 100% { box-shadow: 0 0 10px #ff44ff33; }
    50% { box-shadow: 0 0 25px #ff44ff66, 0 0 50px #ff44ff22; }
  }
  .rebirth-confirm-overlay {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    display: none; flex-direction: column; align-items: center; justify-content: center;
    background: rgba(10, 0, 20, 0.95); z-index: 300;
  }
  .rebirth-confirm-overlay h2 {
    font-size: 42px; color: #ff44ff; font-family: 'Georgia', serif;
    text-shadow: 0 0 30px #ff44ff88; margin-bottom: 15px; letter-spacing: 5px;
  }
  .rebirth-confirm-overlay p {
    color: #cc88cc; font-size: 14px; margin: 5px 0; text-align: center; max-width: 450px;
  }
  .rebirth-confirm-overlay .bonus-list {
    color: #ffaaff; font-size: 13px; margin: 15px 0; text-align: left;
    line-height: 1.8;
  }
  .rebirth-confirm-overlay .bonus-list span { color: #44ff88; }
</style>

<div id="game-container">
  <canvas id="gameCanvas"></canvas>
  <div id="transition-overlay"></div>

  <div class="overlay">
    <!-- Title Screen -->
    <div id="title-screen">
      <h1 style="cursor:default;user-select:none">BOSS FIGHT</h1>
      <div class="subtitle">ARENA OF LEGENDS</div>
      <div id="rebirth-badge"></div>
      <button class="menu-btn" onclick="startGame()">ENTER ARENA</button>
      <button id="medals-btn" onclick="showMedals()">MEDALS</button>
      <button id="rebirth-btn" onclick="showRebirthConfirm()">REBIRTH</button>
      <button id="reset-btn" onclick="showResetConfirm()">RESET GAME</button>
    </div>

    <!-- Hacks Menu -->
    <div id="hacks-overlay">
      <h2>&#9888; HACKS MENU</h2>
      <div class="hacks-warning">MEDALS DISABLED WHILE HACKS ARE ACTIVE</div>
      <div class="hacks-toggle-row">
        <input type="checkbox" id="hacks-active-toggle" onchange="toggleHacks(this.checked)">
        <label for="hacks-active-toggle">ENABLE HACKS</label>
        <span id="hacks-active-label" style="display:none">&#9888; ACTIVE</span>
      </div>
      <div class="hacks-section">
        <h3>PLAYER</h3>
        <div class="hack-row"><label>HP</label><input type="range" min="0.25" max="10" step="0.25" value="1" oninput="setHack('playerHp',this.value)"><span class="hack-val" id="hv-playerHp">1×</span></div>
        <div class="hack-row"><label>DAMAGE</label><input type="range" min="0.25" max="10" step="0.25" value="1" oninput="setHack('playerDmg',this.value)"><span class="hack-val" id="hv-playerDmg">1×</span></div>
        <div class="hack-row"><label>SPEED</label><input type="range" min="0.25" max="5" step="0.25" value="1" oninput="setHack('playerSpd',this.value)"><span class="hack-val" id="hv-playerSpd">1×</span></div>
        <div class="hack-row"><label>JUMP</label><input type="range" min="0.5" max="3" step="0.1" value="1" oninput="setHack('playerJump',this.value)"><span class="hack-val" id="hv-playerJump">1×</span></div>
      </div>
      <div class="hacks-section">
        <h3>BOSS</h3>
        <div class="hack-row"><label>HP</label><input type="range" min="0.1" max="5" step="0.1" value="1" oninput="setHack('bossHp',this.value)"><span class="hack-val" id="hv-bossHp">1×</span></div>
        <div class="hack-row"><label>DAMAGE</label><input type="range" min="0.1" max="5" step="0.1" value="1" oninput="setHack('bossDmg',this.value)"><span class="hack-val" id="hv-bossDmg">1×</span></div>
        <div class="hack-row"><label>SPEED</label><input type="range" min="0.1" max="4" step="0.1" value="1" oninput="setHack('bossSpd',this.value)"><span class="hack-val" id="hv-bossSpd">1×</span></div>
      </div>
      <button class="back-btn" onclick="hideHacksMenu()">&#8592; Close</button>
    </div>

    <!-- Reset Confirmation -->
    <div id="reset-confirm" class="rebirth-confirm-overlay">
      <h2 style="color:#ff4444;text-shadow:0 0 30px #ff444488">RESET GAME</h2>
      <p>This will permanently delete all medals, rebirth progress, and save data.</p>
      <p style="color:#ff6666;font-size:12px;margin-top:10px">This cannot be undone.</p>
      <button class="menu-btn" onclick="confirmReset()" style="margin-top:20px;border-color:#ff4444;color:#ff6666">DELETE ALL DATA</button>
      <button class="back-btn" onclick="hideResetConfirm()">&#8592; Cancel</button>
    </div>

    <!-- Rebirth Confirmation -->
    <div id="rebirth-confirm" class="rebirth-confirm-overlay">
      <h2>REBIRTH</h2>
      <p>Shed your mortal victories and ascend to a higher plane. All medals will be reset, but you will grow stronger.</p>
      <div class="bonus-list" id="rebirth-bonuses"></div>
      <p style="color:#ff6666;font-size:12px;margin-top:10px">All medals will be wiped. This cannot be undone.</p>
      <button class="menu-btn" onclick="performRebirth()" style="margin-top:20px;border-color:#ff44ff;color:#ff88ff">CONFIRM REBIRTH</button>
      <button class="back-btn" onclick="hideRebirthConfirm()">&#8592; Cancel</button>
    </div>

    <!-- Medals Screen -->
    <div id="medals-screen">
      <h2>MEDALS</h2>
      <div id="medals-content"></div>
      <button class="back-btn" onclick="hideMedals()">&#8592; Back</button>
    </div>

    <!-- Class Selection -->
    <div id="class-select">
      <h2>CHOOSE YOUR CLASS</h2>
      <div class="class-cards">
        <div class="class-card" onclick="selectClass('swordsman')">
          <div class="class-icon">&#9876;</div>
          <h3>Swordsman</h3>
          <p>Balanced warrior with swift blade strikes and a devastating charge attack.</p>
          <div class="stats">
            <div class="stat-bar"><span>HP</span><div class="stat-fill" style="width:120px"></div></div>
            <div class="stat-bar"><span>DMG</span><div class="stat-fill" style="width:110px"></div></div>
            <div class="stat-bar"><span>SPEED</span><div class="stat-fill" style="width:150px"></div></div>
          </div>
          <p style="color:#ffaa33;margin-top:10px;font-size:10px">SUPER: SUPER STAB<br>Charge a dash — overcharge and explode!</p>
        </div>
        <div class="class-card" onclick="selectClass('archer')">
          <div class="class-icon">&#127993;</div>
          <h3>Archer</h3>
          <p>Fragile sharpshooter. Deals more damage the farther the arrow travels.</p>
          <div class="stats">
            <div class="stat-bar"><span>HP</span><div class="stat-fill" style="width:70px"></div></div>
            <div class="stat-bar"><span>DMG</span><div class="stat-fill" style="width:160px"></div></div>
            <div class="stat-bar"><span>SPEED</span><div class="stat-fill" style="width:130px"></div></div>
          </div>
          <p style="color:#ffaa33;margin-top:10px;font-size:10px">SUPER: SHADOW DODGE<br>Phase through the enemy!</p>
        </div>
        <div class="class-card" onclick="selectClass('berserker')">
          <div class="class-icon">&#9935;</div>
          <h3>Berserker</h3>
          <p>Unstoppable juggernaut. Slow but hits like a mountain.</p>
          <div class="stats">
            <div class="stat-bar"><span>HP</span><div class="stat-fill" style="width:180px"></div></div>
            <div class="stat-bar"><span>DMG</span><div class="stat-fill" style="width:150px"></div></div>
            <div class="stat-bar"><span>SPEED</span><div class="stat-fill" style="width:70px"></div></div>
          </div>
          <p style="color:#ffaa33;margin-top:10px;font-size:10px">SUPER: BERSERKER RAGE<br>Massively increased attack speed!</p>
        </div>
      </div>
      <button class="back-btn" onclick="goBack('title')">&#8592; Back</button>
    </div>

    <!-- Boss Selection -->
    <div id="boss-select">
      <h2>CHOOSE YOUR FOE</h2>
      <div class="boss-cards">
        <div class="boss-card" onclick="selectBoss('devil')">
          <div class="boss-icon">&#128520;</div>
          <h3>The Devil</h3>
          <p>Lord of Hellfire. Summons fire pillars and rains brimstone from the sky.</p>
          <div class="difficulty">&#9733;&#9733;&#9734; HARD</div>
        </div>
        <div class="boss-card" onclick="selectBoss('warlord')">
          <div class="boss-icon">&#128128;</div>
          <h3>The Warlord</h3>
          <p>Brutal melee combatant. Charges, leaps, and slams with devastating force.</p>
          <div class="difficulty">&#9733;&#9733;&#9733; EXTREME</div>
        </div>
        <div class="boss-card" onclick="selectBoss('shadow')">
          <div class="boss-icon">&#128123;</div>
          <h3>The Shadow Knight</h3>
          <p>Master of darkness. Teleports, creates clones, and strikes from the void.</p>
          <div class="difficulty">&#9733;&#9734;&#9734; MEDIUM</div>
        </div>
      </div>
      <button class="back-btn" onclick="goBack('class')">&#8592; Back</button>
    </div>

    <!-- HUD -->
    <div id="hud">
      <div class="hp-container">
        <div class="hp-label" id="player-name">Player</div>
        <div class="hp-bar-bg">
          <div class="hp-bar-fill player" id="player-hp-bar" style="width:100%">
            <span class="hp-text" id="player-hp-text">100/100</span>
          </div>
        </div>
      </div>
      <div class="hp-container">
        <div class="hp-label" id="boss-name">Boss</div>
        <div class="hp-bar-bg">
          <div class="hp-bar-fill boss" id="boss-hp-bar" style="width:100%">
            <span class="hp-text" id="boss-hp-text">500/500</span>
          </div>
        </div>
      </div>
      <div id="super-bar-container">
        <div id="super-label">SUPER</div>
        <div id="super-bar-bg"><div id="super-bar-fill"></div></div>
        <div id="super-ready">PRESS [Q] — READY!</div>
      </div>
      <div id="master-skill-display" style="display:none">
        <div id="master-skill-label-hud">MASTER</div>
        <div id="master-skill-info-hud"></div>
      </div>
    </div>

    <div id="controls-hint">
      [A/D] Move &nbsp; [SPACE] Jump &nbsp; [CLICK] Attack &nbsp; [Q] Super Skill &nbsp; [SHIFT] Dodge
    </div>

    <!-- Game End -->
    <div id="game-end">
      <h2 id="end-title">VICTORY</h2>
      <div id="end-separator"></div>
      <div class="result-text" id="end-text">You have defeated the boss!</div>
      <div id="medal-display"></div>
      <button class="menu-btn" onclick="goBack('title')">RETURN TO MENU</button>
      <button class="menu-btn" onclick="retryFight()" style="margin-top:5px">RETRY</button>
    </div>
  </div>
</div>

<script>
// ==================== SETUP ====================
const container = document.getElementById('game-container');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let W, H;

function resize() {
  const rect = container.getBoundingClientRect();
  W = canvas.width = rect.width;
  H = canvas.height = rect.height;
}
resize();
window.addEventListener('resize', resize);

// ==================== GAME STATE ====================
let gameState = 'title';
let selectedClass = null;
let selectedBoss = null;
let player = null;
let boss = null;
let particles = [];
let projectiles = [];
let platforms = [];
let effects = [];
let shakeTimer = 0;
let shakeIntensity = 0;
let gameTime = 0;
let rebirthAnimTimer = 0, rebirthNewCount = 0;
let resetAnimTimer = 0;
let fightIntroTimer = 0;
let deathAnimTimer = 0;
let hacksActive = false;
const hackMults = { playerHp: 1, playerDmg: 1, playerSpd: 1, playerJump: 1, bossHp: 1, bossDmg: 1, bossSpd: 1 };
let keys = {};
let mouse = { x: 0, y: 0, down: false, clicked: false };

// ==================== MEDAL SYSTEM ====================
const MEDALS = {
  archer: {
    warlord: { name: 'Marksman', icon: '\u{1F3AF}', desc: 'Archer vs Warlord' },
    devil:   { name: 'Cupid', icon: '\u{1F498}', desc: 'Archer vs Devil' },
    shadow:  { name: 'Ghost Buster', icon: '\u{1F47B}', desc: 'Archer vs Shadow Knight' },
    master:  { name: 'Master Archer', icon: '\u{1F3F9}', desc: 'Beat all 3 bosses as Archer' },
  },
  swordsman: {
    warlord: { name: 'Squire', icon: '\u{1F6E1}', desc: 'Swordsman vs Warlord' },
    devil:   { name: 'Demon Slayer', icon: '\u{1F525}', desc: 'Swordsman vs Devil' },
    shadow:  { name: 'The Specter', icon: '\u{2694}', desc: 'Swordsman vs Shadow Knight' },
    master:  { name: 'Extreme Duelist', icon: '\u{1F451}', desc: 'Beat all 3 bosses as Swordsman' },
  },
  berserker: {
    warlord: { name: 'The Tank', icon: '\u{1F6E1}', desc: 'Berserker vs Warlord' },
    devil:   { name: 'Supercharged', icon: '\u{26A1}', desc: 'Berserker vs Devil' },
    shadow:  { name: 'Inner Demon', icon: '\u{1F608}', desc: 'Berserker vs Shadow Knight' },
    master:  { name: 'MAD', icon: '\u{1F4A5}', desc: 'Master Annihilation of Doom' },
  },
  ascended: { name: 'Ascended', icon: '\u{2B50}', desc: 'All 3 Master medals earned' },
};

function loadProgress() {
  try {
    const data = localStorage.getItem('bossfight_progress');
    return data ? JSON.parse(data) : {};
  } catch(e) { return {}; }
}
function saveProgress(cls, bossType) {
  const prog = loadProgress();
  if (!prog[cls]) prog[cls] = {};
  prog[cls][bossType] = true;
  localStorage.setItem('bossfight_progress', JSON.stringify(prog));
}
function hasMedal(cls, bossType) {
  const prog = loadProgress();
  return prog[cls] && prog[cls][bossType];
}
function hasClassMaster(cls) {
  return hasMedal(cls, 'warlord') && hasMedal(cls, 'devil') && hasMedal(cls, 'shadow');
}
function hasAscended() {
  return hasClassMaster('archer') && hasClassMaster('swordsman') && hasClassMaster('berserker');
}

function transitionTo(fn) {
  const ov = document.getElementById('transition-overlay');
  ov.style.pointerEvents = 'all';
  ov.style.opacity = '1';
  setTimeout(() => {
    fn();
    ov.style.opacity = '0';
    ov.style.pointerEvents = 'none';
  }, 260);
}

function showMedals() {
  transitionTo(() => {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('medals-screen').style.display = 'flex';
    renderMedalsScreen();
  });
}
function hideMedals() {
  transitionTo(() => {
    document.getElementById('medals-screen').style.display = 'none';
    document.getElementById('title-screen').style.display = 'flex';
  });
}
function renderMedalsScreen() {
  const container = document.getElementById('medals-content');
  let html = '';
  const classes = ['swordsman', 'archer', 'berserker'];
  const classNames = { swordsman: 'SWORDSMAN', archer: 'ARCHER', berserker: 'BERSERKER' };
  const bosses = ['warlord', 'devil', 'shadow'];

  for (const cls of classes) {
    html += '<div class="medals-section-title">' + classNames[cls] + '</div>';
    html += '<div class="medals-grid">';
    for (const b of bosses) {
      const m = MEDALS[cls][b];
      const unlocked = hasMedal(cls, b);
      html += '<div class="medal-card' + (unlocked ? ' unlocked' : '') + '">';
      html += '<div class="medal-icon">' + (unlocked ? m.icon : '\u{1F512}') + '</div>';
      html += '<div class="medal-name">' + (unlocked ? m.name : '???') + '</div>';
      html += '<div class="medal-desc">' + m.desc + '</div>';
      html += '</div>';
    }
    // Master medal
    const mm = MEDALS[cls].master;
    const masterUnlocked = hasClassMaster(cls);
    html += '<div class="medal-card' + (masterUnlocked ? ' unlocked master-card' : '') + '">';
    html += '<div class="medal-icon">' + (masterUnlocked ? mm.icon : '\u{1F512}') + '</div>';
    html += '<div class="medal-name">' + (masterUnlocked ? mm.name : '???') + '</div>';
    html += '<div class="medal-desc">' + mm.desc + '</div>';
    html += '</div>';
    html += '</div>';
  }

  // Ascended
  const asc = MEDALS.ascended;
  const ascUnlocked = hasAscended();
  html += '<div class="medals-section-title">ULTIMATE</div>';
  html += '<div class="medals-grid">';
  html += '<div class="medal-card' + (ascUnlocked ? ' unlocked ascended-card' : '') + '">';
  html += '<div class="medal-icon" style="font-size:36px">' + (ascUnlocked ? asc.icon : '\u{1F512}') + '</div>';
  html += '<div class="medal-name">' + (ascUnlocked ? asc.name : '???') + '</div>';
  html += '<div class="medal-desc">' + asc.desc + '</div>';
  html += '</div>';
  html += '</div>';

  // Rebirth info
  const rbCount = getRebirthCount();
  if (rbCount > 0) {
    html += '<div class="medals-section-title" style="color:#ff66ff">REBIRTH: ' + rbCount + '</div>';
    html += '<div style="color:#cc88cc;font-size:12px;text-align:center;margin-bottom:10px">';
    html += 'Player DMG +' + (rbCount * 10) + '% | Player HP +' + (rbCount * 10) + '%<br>';
    html += 'Boss HP +' + (rbCount * 15) + '% | Boss DMG +' + (rbCount * 10) + '%';
    html += '</div>';
  }

  container.innerHTML = html;
}

// ==================== REBIRTH SYSTEM ====================
function getRebirthCount() {
  try {
    return parseInt(localStorage.getItem('bossfight_rebirth') || '0', 10);
  } catch(e) { return 0; }
}
function setRebirthCount(n) {
  localStorage.setItem('bossfight_rebirth', String(n));
}
function getRebirthBonuses() {
  const rb = getRebirthCount();
  return {
    playerDmgMult: 1 + rb * 0.10,
    playerHpMult: 1 + rb * 0.10,
    bossHpMult: 1 + rb * 0.15,
    bossDmgMult: 1 + rb * 0.10,
  };
}
function showRebirthConfirm() {
  transitionTo(() => {
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('rebirth-confirm').style.display = 'flex';
  const rb = getRebirthCount();
  const next = rb + 1;
  const bonuses = document.getElementById('rebirth-bonuses');
  bonuses.innerHTML = 'Rebirth <span>' + next + '</span> Bonuses:<br>' +
    '&#9876; Player DMG: <span>+' + (next * 10) + '%</span><br>' +
    '&#10084; Player HP: <span>+' + (next * 10) + '%</span><br>' +
    '&#128128; Boss HP: <span>+' + (next * 15) + '%</span><br>' +
    '&#128520; Boss DMG: <span>+' + (next * 10) + '%</span>';
  });
}
function hideRebirthConfirm() {
  transitionTo(() => {
    document.getElementById('rebirth-confirm').style.display = 'none';
    document.getElementById('title-screen').style.display = 'flex';
  });
}
function showResetConfirm() {
  transitionTo(() => {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('reset-confirm').style.display = 'flex';
  });
}
function hideResetConfirm() {
  transitionTo(() => {
    document.getElementById('reset-confirm').style.display = 'none';
    document.getElementById('title-screen').style.display = 'flex';
  });
}

// ==================== HACKS MENU ====================
function showHacksMenu() {
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('hacks-overlay').style.display = 'flex';
}
function hideHacksMenu() {
  document.getElementById('hacks-overlay').style.display = 'none';
  document.getElementById('title-screen').style.display = 'flex';
}
function toggleHacks(on) {
  hacksActive = on;
  document.getElementById('hacks-active-label').style.display = on ? 'inline' : 'none';
}
function setHack(key, val) {
  hackMults[key] = parseFloat(val);
  document.getElementById('hv-' + key).textContent = parseFloat(val).toFixed(2).replace(/\.00$/, '') + '×';
}
function confirmReset() {
  localStorage.removeItem('bossfight_progress');
  localStorage.removeItem('bossfight_rebirth');
  document.getElementById('reset-confirm').style.display = 'none';
  resetAnimTimer = 0;
  particles.length = 0;
  gameState = 'resetting';
}
function performRebirth() {
  const rb = getRebirthCount() + 1;
  setRebirthCount(rb);
  localStorage.removeItem('bossfight_progress');
  document.getElementById('rebirth-confirm').style.display = 'none';
  rebirthNewCount = rb;
  rebirthAnimTimer = 0;
  particles.length = 0;
  gameState = 'rebirthing';
}
function updateRebirthUI() {
  const rb = getRebirthCount();
  const badge = document.getElementById('rebirth-badge');
  const btn = document.getElementById('rebirth-btn');
  if (rb > 0) {
    badge.textContent = 'REBIRTH ' + rb;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
  btn.style.display = hasAscended() ? 'block' : 'none';
}
updateRebirthUI();

function showVictoryMedals() {
  const display = document.getElementById('medal-display');
  if (gameState !== 'victory') { display.innerHTML = ''; return; }

  let html = '';
  if (hacksActive) {
    html += '<div style="color:#00ff66;font-size:13px;letter-spacing:2px">&#9888; HACKS ACTIVE — NO MEDALS EARNED</div>';
  } else {
    saveProgress(selectedClass, selectedBoss);
    const m = MEDALS[selectedClass][selectedBoss];
    html += '<div class="medal-earned">' + m.icon + ' ' + m.name + '</div>';
    if (hasClassMaster(selectedClass)) {
      const mm = MEDALS[selectedClass].master;
      html += '<br><div class="medal-earned master">' + mm.icon + ' ' + mm.name + '</div>';
    }
    if (hasAscended()) {
      html += '<br><div class="medal-earned ascended">' + MEDALS.ascended.icon + ' ' + MEDALS.ascended.name + '</div>';
    }
  }

  display.innerHTML = html;
  updateRebirthUI();
}

// Input
window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === ' ' && gameState === 'playing') e.preventDefault();
  if (e.key === '`' && gameState === 'title') showHacksMenu();
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
container.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});
container.addEventListener('mousedown', e => { mouse.down = true; mouse.clicked = true; });
container.addEventListener('mouseup', e => { mouse.down = false; });
container.addEventListener('contextmenu', e => e.preventDefault());

// ==================== NAVIGATION ====================
function startGame() {
  transitionTo(() => {
    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('class-select').style.display = 'flex';
    gameState = 'classSelect';
  });
}
function selectClass(cls) {
  selectedClass = cls;
  transitionTo(() => {
    document.getElementById('class-select').style.display = 'none';
    document.getElementById('boss-select').style.display = 'flex';
    gameState = 'bossSelect';
  });
}
function selectBoss(b) {
  selectedBoss = b;
  transitionTo(() => {
    document.getElementById('boss-select').style.display = 'none';
    resize();
    initFight();
    fightIntroTimer = 0;
    gameState = 'fightIntro';
  });
}
function goBack(to) {
  transitionTo(() => {
    document.getElementById('game-end').style.display = 'none';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('controls-hint').style.display = 'none';
    document.getElementById('medals-screen').style.display = 'none';
    if (to === 'title') {
      document.getElementById('class-select').style.display = 'none';
      document.getElementById('boss-select').style.display = 'none';
      document.getElementById('title-screen').style.display = 'flex';
      gameState = 'title';
    } else if (to === 'class') {
      document.getElementById('boss-select').style.display = 'none';
      document.getElementById('class-select').style.display = 'flex';
      gameState = 'classSelect';
    }
  });
}
function retryFight() {
  transitionTo(() => {
    document.getElementById('game-end').style.display = 'none';
    resize();
    initFight();
    fightIntroTimer = 0;
    gameState = 'fightIntro';
  });
}

// ==================== CLASS DEFINITIONS ====================
const CLASS_DEFS = {
  swordsman: {
    name: 'Swordsman',
    maxHp: 220, speed: 5.5, jumpForce: -14,
    attackRange: 70, attackDmg: 18, attackCooldown: 7,
    color: '#44aaff', width: 36, height: 56,
    superName: 'Super Stab',
  },
  archer: {
    name: 'Archer',
    maxHp: 90, speed: 4.8, jumpForce: -13.5,
    attackRange: 500, attackDmg: 10, attackCooldown: 28,
    color: '#44ff66', width: 32, height: 52,
    superName: 'Shadow Dodge',
  },
  berserker: {
    name: 'Berserker',
    maxHp: 300, speed: 3.5, jumpForce: -13,
    attackRange: 80, attackDmg: 28, attackCooldown: 35,
    color: '#ff6644', width: 44, height: 62,
    superName: 'Berserker Rage',
  }
};

// ==================== BOSS DEFINITIONS ====================
const BOSS_DEFS = {
  devil: {
    name: 'The Devil',
    maxHp: 600, speed: 1.8, width: 70, height: 90,
    color: '#ff2222', secondaryColor: '#ff8800',
    attackCooldown: 140, contactDmg: 12,
    phases: [
      { hpPercent: 1.0, attacks: ['firePillar', 'fireball'] },
      { hpPercent: 0.5, attacks: ['firePillar', 'fireball', 'fireRain'] },
      { hpPercent: 0.25, attacks: ['firePillar', 'fireball', 'fireRain', 'hellCharge'] },
    ]
  },
  warlord: {
    name: 'The Warlord',
    maxHp: 500, speed: 2.2, width: 75, height: 85,
    color: '#888888', secondaryColor: '#ffcc00',
    attackCooldown: 120, contactDmg: 15,
    phases: [
      { hpPercent: 1.0, attacks: ['groundSlam', 'charge'] },
      { hpPercent: 0.5, attacks: ['groundSlam', 'charge', 'leapSlam'] },
      { hpPercent: 0.25, attacks: ['groundSlam', 'charge', 'leapSlam', 'shockwave'] },
    ]
  },
  shadow: {
    name: 'Shadow Knight',
    maxHp: 450, speed: 1.9, width: 60, height: 80,
    color: '#6633cc', secondaryColor: '#aa66ff',
    attackCooldown: 145, contactDmg: 11,
    phases: [
      { hpPercent: 1.0, attacks: ['teleSlash', 'shadowBolt'] },
      { hpPercent: 0.5, attacks: ['teleSlash', 'shadowBolt', 'cloneSplit'] },
      { hpPercent: 0.25, attacks: ['teleSlash', 'shadowBolt', 'cloneSplit', 'voidZone'] },
    ]
  }
};

// ==================== MAP GENERATION ====================
function generateMap(bossType) {
  platforms = [];
  const ground = { x: 0, y: H - 60, w: W, h: 60 };
  platforms.push(ground);

  if (bossType === 'devil') {
    platforms.push({ x: 150, y: H - 200, w: 200, h: 20 });
    platforms.push({ x: W - 350, y: H - 200, w: 200, h: 20 });
    platforms.push({ x: W / 2 - 100, y: H - 320, w: 200, h: 20 });
    platforms.push({ x: 50, y: H - 420, w: 150, h: 20 });
    platforms.push({ x: W - 200, y: H - 420, w: 150, h: 20 });
  } else if (bossType === 'warlord') {
    platforms.push({ x: 100, y: H - 180, w: 250, h: 20 });
    platforms.push({ x: W - 350, y: H - 180, w: 250, h: 20 });
    platforms.push({ x: W / 2 - 150, y: H - 280, w: 300, h: 20 });
    platforms.push({ x: 200, y: H - 380, w: 180, h: 20 });
    platforms.push({ x: W - 380, y: H - 380, w: 180, h: 20 });
  } else if (bossType === 'shadow') {
    platforms.push({ x: 100, y: H - 170, w: 140, h: 18 });
    platforms.push({ x: W - 240, y: H - 170, w: 140, h: 18 });
    platforms.push({ x: W / 2 - 80, y: H - 250, w: 160, h: 18 });
    platforms.push({ x: 60, y: H - 350, w: 120, h: 18 });
    platforms.push({ x: W - 180, y: H - 350, w: 120, h: 18 });
    platforms.push({ x: W / 2 - 60, y: H - 440, w: 120, h: 18 });
  }
}

// ==================== INIT FIGHT ====================
function initFight() {
  const cDef = CLASS_DEFS[selectedClass];
  const bDef = BOSS_DEFS[selectedBoss];
  const rb = getRebirthBonuses();

  generateMap(selectedBoss);

  const hm = hacksActive ? hackMults : { playerHp: 1, playerDmg: 1, playerSpd: 1, playerJump: 1, bossHp: 1, bossDmg: 1, bossSpd: 1 };
  const scaledMaxHp = Math.floor(cDef.maxHp * rb.playerHpMult * hm.playerHp);
  const scaledDmg = Math.floor(cDef.attackDmg * rb.playerDmgMult * hm.playerDmg);

  player = {
    x: 150, y: H - 200, vx: 0, vy: 0,
    w: cDef.width, h: cDef.height,
    hp: scaledMaxHp, maxHp: scaledMaxHp,
    speed: cDef.speed * hm.playerSpd, jumpForce: cDef.jumpForce * hm.playerJump,
    attackRange: cDef.attackRange, attackDmg: scaledDmg,
    attackCooldown: cDef.attackCooldown, attackTimer: 0,
    color: cDef.color, grounded: false,
    facing: 1,
    superCharge: 0, superMax: 100, superActive: false,
    superTimer: 0,
    dodgeTimer: 0, dodgeCooldown: 0,
    invincible: 0,
    charging: false, chargeAmount: 0, dashing: false, dashVx: 0,
    rageTimer: 0, rageSpeedMult: 1,
    shadowDodging: false, shadowTimer: 0,
    animFrame: 0, animTimer: 0,
    hitFlash: 0,
    className: selectedClass,
    // Master skill
    masterSkill: hasClassMaster(selectedClass),
    resurrectUsed: false, resurrectAura: 0,
    arrowCombo: 0, arrowComboTimer: 0,
    momentum: 0,
    shieldHp: selectedClass === 'swordsman' ? 60 : 0,
    shieldMaxHp: 60,
    shieldRegenTimer: 0,
    shieldBroken: false,
    shieldFlash: 0,
  };

  const bossMaxHp = Math.floor(bDef.maxHp * rb.bossHpMult * hm.bossHp);
  const bossContact = Math.floor(bDef.contactDmg * rb.bossDmgMult * hm.bossDmg);

  boss = {
    x: W - 250, y: H - 200, vx: 0, vy: 0,
    w: bDef.width, h: bDef.height,
    hp: bossMaxHp, maxHp: bossMaxHp,
    speed: bDef.speed * hm.bossSpd, color: bDef.color,
    secondaryColor: bDef.secondaryColor,
    grounded: false, facing: -1,
    attackTimer: bDef.attackCooldown,
    attackCooldown: bDef.attackCooldown,
    contactDmg: bossContact,
    dmgMult: rb.bossDmgMult,
    phases: bDef.phases,
    currentPhase: 0,
    type: selectedBoss,
    attackState: 'idle', stateTimer: 0,
    charging: false, chargeVx: 0,
    leaping: false,
    teleporting: false, teleTimer: 0,
    clones: [],
    invincible: 0,
    hitFlash: 0,
    name: bDef.name,
  };

  particles = [];
  projectiles = [];
  effects = [];
  gameTime = 0;

  document.getElementById('player-name').textContent = cDef.name;
  document.getElementById('boss-name').textContent = bDef.name;
  updateHUD();
}

// ==================== PHYSICS ====================
const GRAVITY = 0.65;
const FRICTION = 0.85;

function applyPhysics(entity) {
  entity.vy += GRAVITY;
  entity.x += entity.vx;
  entity.y += entity.vy;
  entity.grounded = false;

  for (const p of platforms) {
    if (entity.x + entity.w > p.x && entity.x < p.x + p.w &&
        entity.y + entity.h > p.y && entity.y + entity.h < p.y + p.h + 15 &&
        entity.vy >= 0) {
      entity.y = p.y - entity.h;
      entity.vy = 0;
      entity.grounded = true;
    }
  }

  if (entity.x < 0) entity.x = 0;
  if (entity.x + entity.w > W) entity.x = W - entity.w;
  if (entity.y > H + 100) {
    entity.hp = 0;
  }
}

// ==================== PLAYER UPDATE ====================
function updatePlayer() {
  if (player.invincible > 0) player.invincible--;
  if (player.hitFlash > 0) player.hitFlash--;
  if (player.attackTimer > 0) player.attackTimer--;
  if (player.dodgeCooldown > 0) player.dodgeCooldown--;

  // Swordsman shield regen
  if (player.className === 'swordsman') {
    if (player.shieldFlash > 0) player.shieldFlash--;
    if (player.shieldRegenTimer > 0) {
      player.shieldRegenTimer--;
    } else if (player.shieldHp < player.shieldMaxHp) {
      player.shieldHp = Math.min(player.shieldMaxHp, player.shieldHp + 0.22);
      if (player.shieldHp >= player.shieldMaxHp) player.shieldBroken = false;
    }
  }

  // Master skill passive updates
  if (player.masterSkill) {
    if (player.resurrectAura > 0) player.resurrectAura--;
    if (player.className === 'archer') {
      player.arrowComboTimer++;
      if (player.arrowComboTimer > 90) { player.arrowCombo = 0; player.arrowComboTimer = 0; }
    }
    if (player.className === 'berserker') {
      if (Math.abs(player.vx) > 0.8) player.momentum = Math.min(100, player.momentum + 1.8);
      else player.momentum = Math.max(0, player.momentum - 0.5);
    }
  }

  let spd = player.speed;
  if (player.className === 'berserker' && player.masterSkill && player.momentum > 0) {
    spd = player.speed * (1 + player.momentum / 160);
  }
  if (player.dashing) {
    player.vx = player.dashVx;
  } else if (player.shadowDodging) {
    // Shadow dodge movement handled
  } else if (player.dodgeTimer > 0) {
    player.dodgeTimer--;
    player.invincible = 2;
  } else {
    if (keys['a'] || keys['arrowleft']) { player.vx = -spd; player.facing = -1; }
    else if (keys['d'] || keys['arrowright']) { player.vx = spd; player.facing = 1; }
    else player.vx *= FRICTION;

    if ((keys[' '] || keys['w'] || keys['arrowup']) && player.grounded) {
      player.vy = player.jumpForce;
    }
  }

  if (keys['shift'] && player.dodgeCooldown <= 0 && !player.dashing && !player.shadowDodging) {
    player.dodgeTimer = 12;
    player.dodgeCooldown = 40;
    player.vx = player.facing * 12;
    spawnParticles(player.x + player.w/2, player.y + player.h/2, player.color, 5);
  }

  if (mouse.clicked && player.attackTimer <= 0 && !player.dashing && !player.shadowDodging) {
    performAttack();
  }

  if (keys['q'] && player.superCharge >= player.superMax && !player.superActive) {
    activateSuper();
  }

  updateSuperState();
  applyPhysics(player);

  if (player.invincible <= 0 && !player.shadowDodging) {
    if (rectsOverlap(player, boss) && !boss.teleporting) {
      // Berserker momentum charge: body-slam the boss at high speed
      if (player.masterSkill && player.className === 'berserker' && player.momentum > 20 && boss.invincible <= 0) {
        const impactDmg = Math.floor(player.momentum * 0.18);
        damageBoss(impactDmg, true);
        // Knock boss back in the direction the player was moving
        boss.vx += player.facing * (3 + player.momentum / 25);
        boss.vy = -4;
        // Bounce player back
        player.vx = -player.facing * 4;
        player.vy = -3;
        // Drain momentum on impact
        player.momentum = Math.max(0, player.momentum - 35);
        spawnParticles(boss.x + boss.w/2, boss.y + boss.h/2, '#ff8800', 8 + Math.floor(player.momentum / 12));
        screenShake(4 + Math.floor(player.momentum / 20), 8);
        player.invincible = 18;
      } else {
        damagePlayer(boss.contactDmg);
      }
    }
  }

  player.animTimer++;
  if (player.animTimer > 8) { player.animTimer = 0; player.animFrame = (player.animFrame + 1) % 4; }

  mouse.clicked = false;
}

// ==================== ATTACK SYSTEM ====================
function performAttack() {
  // Berserker underswing: hold S/down + click while grounded
  if (player.className === 'berserker' && (keys['s'] || keys['arrowdown']) && player.grounded) {
    let cd = Math.floor(player.attackCooldown * 1.7);
    if (player.rageTimer > 0) cd = Math.floor(cd * 0.4);
    player.attackTimer = cd;

    const footY = player.y + player.h;
    const sweepW = player.attackRange * 1.6;
    const sweepX = player.facing === 1 ? player.x + player.w : player.x - sweepW;

    // Underswing animation effect
    effects.push({
      type: 'underSwing',
      x: sweepX, y: player.y, w: sweepW, h: player.h,
      facing: player.facing, life: 18, maxLife: 18
    });

    // Underground shockwave projectile travels along the ground
    projectiles.push({
      x: player.facing === 1 ? player.x + player.w : player.x - 20,
      y: footY - 18,
      vx: player.facing * 9, vy: 0,
      dmg: Math.floor(player.attackDmg * 1.55), owner: 'player', type: 'groundQuake',
      life: 50, w: 28, h: 28, color: '#ff6600'
    });

    // Immediate close-range slam box
    const slamBox = { x: sweepX, y: footY - 30, w: sweepW * 0.5, h: 50 };
    if (rectsOverlap(slamBox, boss) && !boss.teleporting && boss.invincible <= 0) {
      let dmg = Math.floor(player.attackDmg * 1.55);
      if (player.rageTimer > 0) dmg = Math.floor(dmg * 1.3);
      damageBoss(dmg);
    }

    spawnParticles(player.x + player.w/2, footY, '#ff6600', 12);
    spawnParticles(player.x + player.w/2, footY, '#ffaa00', 6);
    screenShake(7, 12);
    return;
  }

  let cd = player.attackCooldown;
  if (player.rageTimer > 0) cd = Math.floor(cd * 0.4);
  if (player.className === 'archer' && player.masterSkill && player.arrowCombo > 0) {
    cd = Math.max(8, Math.floor(cd * (1 - player.arrowCombo * 0.13)));
  }
  player.attackTimer = cd;

  if (player.className === 'archer') {
    if (player.masterSkill) player.arrowComboTimer = 0;
    const dx = mouse.x - (player.x + player.w/2);
    const dy = mouse.y - (player.y + player.h/2);
    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
    const speed = 14;
    projectiles.push({
      x: player.x + player.w/2, y: player.y + player.h/4,
      vx: (dx/dist) * speed, vy: (dy/dist) * speed,
      dmg: player.attackDmg, owner: 'player', type: 'arrow',
      startX: player.x + player.w/2, startY: player.y + player.h/4,
      life: 120, w: 8, h: 4, color: '#88ff88',
      comboLevel: player.masterSkill ? player.arrowCombo : 0
    });
    spawnParticles(player.x + player.w/2, player.y + player.h/4, '#88ff88', 3);
  } else {
    const attackX = player.facing === 1 ? player.x + player.w : player.x - player.attackRange;
    const attackBox = { x: attackX, y: player.y, w: player.attackRange, h: player.h };
    effects.push({
      type: 'slash', x: attackX, y: player.y, w: player.attackRange, h: player.h,
      facing: player.facing, life: 12, maxLife: 12, color: player.color,
      className: player.className
    });
    if (rectsOverlap(attackBox, boss) && !boss.teleporting && boss.invincible <= 0) {
      let dmg = player.attackDmg;
      if (player.rageTimer > 0) dmg = Math.floor(dmg * 1.3);
      damageBoss(dmg);
    }
  }
}

function activateSuper() {
  player.superCharge = 0;
  player.superActive = true;

  if (player.className === 'swordsman') {
    player.charging = true;
    player.chargeAmount = 0;
  } else if (player.className === 'archer') {
    player.shadowDodging = true;
    player.shadowTimer = 45;
    player.invincible = 45;
    player.vx = player.facing * 15;
    spawnParticles(player.x + player.w/2, player.y + player.h/2, '#aa66ff', 15);
  } else if (player.className === 'berserker') {
    player.rageTimer = 300;
    player.superActive = false;
    spawnParticles(player.x + player.w/2, player.y + player.h/2, '#ff4400', 20);
    screenShake(5, 10);
  }
}

function updateSuperState() {
  if (player.charging) {
    player.chargeAmount += 1.5;
    player.vx *= 0.5;
    spawnParticles(player.x + player.w/2, player.y + player.h/2, '#44aaff', 1);

    if (player.chargeAmount >= 100) {
      player.charging = false;
      player.superActive = false;
      damagePlayer(50);
      screenShake(15, 20);
      spawnParticles(player.x + player.w/2, player.y + player.h/2, '#ff4444', 30);
      effects.push({
        type: 'explosion', x: player.x - 40, y: player.y - 40,
        w: player.w + 80, h: player.h + 80, life: 15, maxLife: 15, color: '#ff4444'
      });
      return;
    }

    if (mouse.clicked || (player.chargeAmount > 10 && !keys['q'])) {
      player.charging = false;
      player.dashing = true;
      let power = Math.min(player.chargeAmount, 90);
      player.dashVx = player.facing * (10 + power * 0.2);
      player.superTimer = 15;
      const dashDmg = Math.floor(15 + power * 0.8);
      const dashBox = {
        x: player.facing === 1 ? player.x : player.x - 100,
        y: player.y, w: player.w + 100, h: player.h
      };
      if (rectsOverlap(dashBox, boss) && !boss.teleporting) {
        damageBoss(dashDmg);
        screenShake(10, 12);
      }
    }
  }

  if (player.dashing) {
    player.superTimer--;
    spawnParticles(player.x + player.w/2, player.y + player.h/2, '#44aaff', 2);
    if (player.superTimer <= 0) {
      player.dashing = false;
      player.superActive = false;
      player.vx *= 0.3;
    }
    if (rectsOverlap(player, boss) && !boss.teleporting && boss.invincible <= 0) {
      damageBoss(Math.floor(15 + player.chargeAmount * 0.5));
      boss.invincible = 20;
      screenShake(8, 10);
    }
  }

  if (player.shadowDodging) {
    player.shadowTimer--;
    spawnParticles(player.x + player.w/2, player.y + player.h/2, '#8833cc', 2);
    if (player.shadowTimer <= 0) {
      player.shadowDodging = false;
      player.superActive = false;
    }
  }

  if (player.rageTimer > 0) {
    player.rageTimer--;
    if (gameTime % 5 === 0) spawnParticles(player.x + player.w/2, player.y + player.h/2, '#ff6633', 1);
    if (player.rageTimer <= 0) player.rageSpeedMult = 1;
  }
}

// ==================== BOSS AI ====================
function updateBoss() {
  if (boss.invincible > 0) boss.invincible--;
  if (boss.hitFlash > 0) boss.hitFlash--;
  if (boss.attackTimer > 0) boss.attackTimer--;

  const hpPct = boss.hp / boss.maxHp;
  for (let i = boss.phases.length - 1; i >= 0; i--) {
    if (hpPct <= boss.phases[i].hpPercent) {
      boss.currentPhase = i;
    }
  }

  if (player.x + player.w/2 < boss.x + boss.w/2) boss.facing = -1;
  else boss.facing = 1;

  if (boss.attackState === 'idle') {
    const dx = (player.x + player.w/2) - (boss.x + boss.w/2);
    const preferredDist = boss.type === 'shadow' ? 200 : 150;
    if (Math.abs(dx) > preferredDist) {
      boss.vx = Math.sign(dx) * boss.speed;
    } else if (Math.abs(dx) < 80) {
      boss.vx = -Math.sign(dx) * boss.speed * 0.5;
    } else {
      boss.vx *= 0.9;
    }

    if (player.y < boss.y - 100 && boss.grounded) {
      boss.vy = -14;
    }

    if (boss.attackTimer <= 0) {
      const phase = boss.phases[boss.currentPhase];
      const atk = phase.attacks[Math.floor(Math.random() * phase.attacks.length)];
      startBossAttack(atk);
    }
  } else {
    updateBossAttack();
  }

  if (!boss.teleporting) {
    applyPhysics(boss);
  }

  for (const clone of boss.clones) {
    clone.life--;
    clone.animTimer++;
    if (clone.attackTimer > 0) {
      clone.attackTimer--;
      if (clone.attackTimer === 10) {
        const cx = clone.x + clone.w/2;
        const cy = clone.y + clone.h/2;
        const dx = player.x + player.w/2 - cx;
        const dy = player.y + player.h/2 - cy;
        const d = Math.sqrt(dx*dx+dy*dy) || 1;
        projectiles.push({
          x: cx, y: cy, vx: dx/d*6, vy: dy/d*6,
          dmg: 6, owner: 'boss', type: 'shadowBolt',
          life: 70, w: 12, h: 12, color: '#aa66ff'
        });
      }
    }
  }
  boss.clones = boss.clones.filter(c => c.life > 0);
}

function startBossAttack(type) {
  boss.attackState = type;
  boss.stateTimer = 0;
  const cdMult = boss.currentPhase >= 2 ? 0.85 : boss.currentPhase >= 1 ? 0.92 : 1;
  boss.attackTimer = Math.floor(boss.attackCooldown * cdMult);

  switch(type) {
    case 'firePillar':
      boss.stateTimer = 90;
      effects.push({
        type: 'warning', x: player.x - 30, y: 0, w: 60, h: H,
        life: 60, maxLife: 60, color: '#ff4400', triggerType: 'firePillar'
      });
      break;
    case 'fireball':
      boss.stateTimer = 50;
      break;
    case 'fireRain':
      boss.stateTimer = 180;
      break;
    case 'hellCharge':
      boss.stateTimer = 120;
      boss.charging = true;
      break;
    case 'groundSlam':
      boss.stateTimer = 65;
      break;
    case 'charge':
      boss.stateTimer = 90;
      boss.charging = true;
      boss.chargeVx = boss.facing * 8;
      break;
    case 'leapSlam':
      boss.stateTimer = 100;
      boss.leaping = true;
      boss.vy = -18;
      boss.vx = boss.facing * 6;
      break;
    case 'shockwave':
      boss.stateTimer = 75;
      break;
    case 'teleSlash':
      boss.stateTimer = 95;
      boss.teleporting = true;
      boss.teleTimer = 55;
      boss.teleBlinking = false;
      break;
    case 'shadowBolt':
      boss.stateTimer = 55;
      break;
    case 'cloneSplit':
      boss.stateTimer = 110;
      for (let i = 0; i < 2; i++) {
        boss.clones.push({
          x: boss.x + (i === 0 ? -120 : 120),
          y: boss.y, w: boss.w * 0.8, h: boss.h * 0.8,
          life: 65, animTimer: 0, attackTimer: 40 + i * 25
        });
      }
      spawnParticles(boss.x + boss.w/2, boss.y + boss.h/2, '#aa66ff', 15);
      break;
    case 'voidZone':
      boss.stateTimer = 90;
      effects.push({
        type: 'voidZone', x: player.x - 50, y: player.y - 50,
        w: 100, h: 100, life: 65, maxLife: 65, color: '#6633cc',
        dmgTimer: 0
      });
      break;
  }
}

function updateBossAttack() {
  boss.stateTimer--;

  switch(boss.attackState) {
    case 'firePillar':
      if (boss.stateTimer <= 0) boss.attackState = 'idle';
      break;

    case 'fireball':
      if (boss.stateTimer === 25) {
        const dx = player.x + player.w/2 - (boss.x + boss.w/2);
        const dy = player.y + player.h/2 - (boss.y + boss.h/2);
        const d = Math.sqrt(dx*dx+dy*dy) || 1;
        projectiles.push({
          x: boss.x + boss.w/2, y: boss.y + boss.h/3,
          vx: dx/d*10, vy: dy/d*10,
          dmg: 15, owner: 'boss', type: 'fireball',
          life: 100, w: 20, h: 20, color: '#ff4400'
        });
        spawnParticles(boss.x + boss.w/2, boss.y + boss.h/3, '#ff8800', 5);
      }
      if (boss.stateTimer <= 0) boss.attackState = 'idle';
      break;

    case 'fireRain':
      if (boss.stateTimer % 25 === 0) {
        const rx = Math.random() * W;
        effects.push({
          type: 'warning', x: rx - 25, y: 0, w: 50, h: H,
          life: 45, maxLife: 45, color: '#ff440066', triggerType: 'firePillar'
        });
      }
      if (boss.stateTimer <= 0) boss.attackState = 'idle';
      break;

    case 'hellCharge':
      if (boss.stateTimer > 65) {
        spawnParticles(boss.x + boss.w/2, boss.y + boss.h/2, '#ff2200', 2);
      } else {
        boss.vx = boss.facing * 9;
        if (rectsOverlap(player, boss) && player.invincible <= 0) {
          damagePlayer(Math.floor(25 * (boss.dmgMult || 1)));
          screenShake(10, 15);
        }
      }
      if (boss.stateTimer <= 0) { boss.attackState = 'idle'; boss.charging = false; }
      break;

    case 'groundSlam':
      if (boss.stateTimer === 30) {
        screenShake(8, 12);
        projectiles.push({ x: boss.x, y: boss.y + boss.h - 15, vx: -6, vy: 0, dmg: 12, owner: 'boss', type: 'shockwave', life: 40, w: 30, h: 15, color: '#ffcc00' });
        projectiles.push({ x: boss.x + boss.w, y: boss.y + boss.h - 15, vx: 6, vy: 0, dmg: 12, owner: 'boss', type: 'shockwave', life: 40, w: 30, h: 15, color: '#ffcc00' });
        spawnParticles(boss.x + boss.w/2, boss.y + boss.h, '#ffcc00', 10);
      }
      if (boss.stateTimer <= 0) boss.attackState = 'idle';
      break;

    case 'charge':
      if (boss.stateTimer > 55) {
        spawnParticles(boss.x + boss.w/2, boss.y + boss.h/2, '#ffcc00', 1);
      } else {
        boss.vx = boss.chargeVx;
        if (rectsOverlap(player, boss) && player.invincible <= 0) {
          damagePlayer(Math.floor(12 * (boss.dmgMult || 1)));
          screenShake(8, 10);
        }
      }
      if (boss.stateTimer <= 0) { boss.attackState = 'idle'; boss.charging = false; }
      break;

    case 'leapSlam':
      if (boss.grounded && boss.leaping && boss.stateTimer < 75) {
        boss.leaping = false;
        screenShake(12, 15);
        const slamBox = { x: boss.x - 60, y: boss.y, w: boss.w + 120, h: boss.h };
        if (rectsOverlap(player, slamBox) && player.invincible <= 0) {
          damagePlayer(Math.floor(22 * (boss.dmgMult || 1)));
        }
        spawnParticles(boss.x + boss.w/2, boss.y + boss.h, '#ffcc00', 15);
        for (let i = -3; i <= 3; i++) {
          projectiles.push({
            x: boss.x + boss.w/2 + i * 40, y: boss.y + boss.h - 10,
            vx: i * 3, vy: -3, dmg: 10, owner: 'boss', type: 'debris',
            life: 30, w: 15, h: 15, color: '#aa8844'
          });
        }
      }
      if (boss.stateTimer <= 0) boss.attackState = 'idle';
      break;

    case 'shockwave':
      if (boss.stateTimer === 35) {
        screenShake(6, 10);
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
          projectiles.push({
            x: boss.x + boss.w/2, y: boss.y + boss.h/2,
            vx: Math.cos(a) * 7, vy: Math.sin(a) * 7,
            dmg: 10, owner: 'boss', type: 'shockwave',
            life: 35, w: 14, h: 14, color: '#ffaa00'
          });
        }
        spawnParticles(boss.x + boss.w/2, boss.y + boss.h/2, '#ffaa00', 20);
      }
      if (boss.stateTimer <= 0) boss.attackState = 'idle';
      break;

    case 'teleSlash':
      if (boss.teleTimer > 0) {
        boss.teleTimer--;
        if (boss.teleTimer <= 20) boss.teleBlinking = true;
        if (boss.teleTimer <= 0) {
          const streakX = boss.x, streakY = boss.y;
          boss.x = player.x + player.facing * -120;
          boss.y = player.y;
          boss.teleporting = false;
          boss.teleBlinking = false;
          effects.push({
            type: 'shadowStreak', x: streakX, y: streakY,
            w: boss.w, h: boss.h, life: 35, maxLife: 35, color: '#220033'
          });
          spawnParticles(streakX + boss.w/2, streakY + boss.h/2, '#330055', 18);
          spawnParticles(boss.x + boss.w/2, boss.y + boss.h/2, '#aa66ff', 10);
          screenShake(3, 5);
        }
      } else if (boss.stateTimer === 30) {
        const slashBox = { x: boss.x + (boss.facing === 1 ? boss.w : -80), y: boss.y - 10, w: 80, h: boss.h + 20 };
        effects.push({
          type: 'slash', x: slashBox.x, y: slashBox.y, w: slashBox.w, h: slashBox.h,
          facing: boss.facing, life: 10, maxLife: 10, color: '#aa66ff'
        });
        if (rectsOverlap(player, slashBox) && player.invincible <= 0 && !player.shadowDodging) {
          damagePlayer(Math.floor(18 * (boss.dmgMult || 1)));
        }
      }
      if (boss.stateTimer <= 0) boss.attackState = 'idle';
      break;

    case 'shadowBolt':
      if (boss.stateTimer === 28) {
        for (let i = -1; i <= 1; i += 2) {
          const dx = player.x + player.w/2 - (boss.x + boss.w/2);
          const dy = player.y + player.h/2 - (boss.y + boss.h/2);
          const angle = Math.atan2(dy, dx) + i * 0.25;
          projectiles.push({
            x: boss.x + boss.w/2, y: boss.y + boss.h/3,
            vx: Math.cos(angle) * 7, vy: Math.sin(angle) * 7,
            dmg: 9, owner: 'boss', type: 'shadowBolt',
            life: 70, w: 14, h: 14, color: '#aa66ff'
          });
        }
        spawnParticles(boss.x + boss.w/2, boss.y + boss.h/3, '#6633cc', 5);
      }
      if (boss.stateTimer <= 0) boss.attackState = 'idle';
      break;

    case 'cloneSplit':
      if (boss.stateTimer <= 0) boss.attackState = 'idle';
      break;

    case 'voidZone':
      if (boss.stateTimer <= 0) boss.attackState = 'idle';
      break;
  }
}

// ==================== DAMAGE / HELPERS ====================
function damagePlayer(dmg) {
  if (player.invincible > 0 || player.shadowDodging) return;
  // Swordsman shield absorption
  if (player.className === 'swordsman' && !player.shieldBroken && player.shieldHp > 0) {
    const absorbed = Math.min(player.shieldHp, dmg);
    player.shieldHp -= absorbed;
    dmg -= absorbed;
    player.shieldFlash = 10;
    player.shieldRegenTimer = 200;
    const shieldX = player.x + (player.facing === 1 ? player.w + 7 : -7);
    spawnParticles(shieldX, player.y + 16, '#88bbff', 6);
    if (player.shieldHp <= 0) {
      player.shieldBroken = true;
      player.shieldRegenTimer = 260;
      spawnParticles(shieldX, player.y + 16, '#aaccff', 16);
      spawnParticles(shieldX, player.y + 16, '#ffffff', 6);
      screenShake(5, 8);
    }
    if (dmg <= 0) { player.hitFlash = 5; return; }
  }
  player.hp = Math.max(0, player.hp - dmg);
  player.invincible = 20;
  player.hitFlash = 10;
  screenShake(4, 6);
  spawnParticles(player.x + player.w/2, player.y + player.h/2, '#ff4444', 8);
  if (player.hp <= 0) {
    if (player.masterSkill && player.className === 'swordsman' && !player.resurrectUsed) {
      player.hp = Math.floor(player.maxHp * 0.1);
      player.resurrectUsed = true;
      player.invincible = 120;
      player.hitFlash = 0;
      player.resurrectAura = 100;
      spawnParticles(player.x + player.w/2, player.y + player.h/2, '#ffdd00', 40);
      spawnParticles(player.x + player.w/2, player.y + player.h/2, '#ffffff', 20);
      screenShake(12, 22);
      return;
    }
    updateHUD();
    gameState = 'playerDeath';
    deathAnimTimer = 0;
  }
}

function damageBoss(dmg, isMomentum) {
  if (boss.invincible > 0) return;
  boss.hp = Math.max(0, boss.hp - dmg);
  boss.hitFlash = 8;
  boss.invincible = 8;
  player.superCharge = Math.min(player.superMax, player.superCharge + dmg * 0.5);
  spawnParticles(boss.x + boss.w/2, boss.y + boss.h/2, boss.color, 6);
  screenShake(2, 3);
  // Floating damage number
  const floatColor = isMomentum ? '#ff8800' : dmg >= 30 ? '#ffee44' : '#ffffff';
  const floatSize = isMomentum ? 24 : dmg >= 25 ? 20 : 16;
  effects.push({
    type: 'dmgFloat',
    x: boss.x + boss.w/2 + (Math.random() - 0.5) * 25,
    y: boss.y,
    text: (isMomentum ? '+' : '') + dmg,
    color: floatColor, size: floatSize,
    life: 52, maxLife: 52
  });
  if (boss.hp <= 0) {
    updateHUD();
    gameState = 'bossDeath';
    deathAnimTimer = 0;
    screenShake(15, 25);
  }
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function screenShake(intensity, duration) {
  shakeIntensity = intensity;
  shakeTimer = duration;
}

function showGameEnd(won) {
  const el = document.getElementById('game-end');
  const title = document.getElementById('end-title');
  const text = document.getElementById('end-text');
  // Force animation replay by removing then re-adding display
  el.style.display = 'none';
  el.className = won ? 'victory' : 'defeat';
  if (won) {
    title.textContent = 'VICTORY';
    title.style.color = '#ffcc00';
    text.textContent = 'You have defeated ' + boss.name + '!';
    showVictoryMedals();
  } else {
    title.textContent = 'DEFEATED';
    title.style.color = '#cc2200';
    text.textContent = boss.name + ' has slain you...';
    document.getElementById('medal-display').innerHTML = '';
  }
  // Trigger reflow so animations restart
  void el.offsetWidth;
  el.style.display = 'flex';
}

// ==================== PROJECTILES ====================
function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    if (p.type === 'debris') p.vy += 0.5;
    if (p.type === 'groundQuake' && gameTime % 3 === 0) {
      spawnParticles(p.x + p.w/2, p.y, '#cc5500', 2);
    }

    if (p.owner === 'player' && rectsOverlap(p, boss) && !boss.teleporting && boss.invincible <= 0) {
      let dmg = p.dmg;
      if (p.type === 'arrow') {
        const dist = Math.sqrt((p.x - p.startX) ** 2 + (p.y - p.startY) ** 2);
        dmg = Math.floor(p.dmg * (1 + dist / 300));
        // Knockback - stronger at longer range
        const kb = 3 + dist / 150;
        const kbDir = Math.atan2(p.vy, p.vx);
        boss.vx += Math.cos(kbDir) * kb;
        boss.vy += Math.sin(kbDir) * kb * 0.5;
        // Archer master: combo tracking
        if (player.masterSkill && player.className === 'archer') {
          player.arrowCombo = Math.min(player.arrowCombo + 1, 5);
          player.arrowComboTimer = 0;
          if (player.arrowCombo >= 3) spawnParticles(p.x, p.y, '#ffdd00', 6);
          if (player.arrowCombo === 5) spawnParticles(p.x, p.y, '#ffffff', 8);
        }
      }
      damageBoss(dmg);
      spawnParticles(p.x, p.y, p.color, 5);
      projectiles.splice(i, 1);
      continue;
    }

    if (p.owner === 'boss' && rectsOverlap(p, player) && player.invincible <= 0 && !player.shadowDodging) {
      damagePlayer(Math.floor(p.dmg * (boss ? boss.dmgMult || 1 : 1)));
      spawnParticles(p.x, p.y, p.color, 5);
      projectiles.splice(i, 1);
      continue;
    }

    if (p.life <= 0 || p.x < -50 || p.x > W + 50 || p.y > H + 50) {
      projectiles.splice(i, 1);
    }
  }
}

// ==================== EFFECTS ====================
function updateEffects() {
  for (let i = effects.length - 1; i >= 0; i--) {
    const e = effects[i];
    e.life--;

    if (e.type === 'warning' && e.life <= 0) {
      if (e.triggerType === 'firePillar') {
        effects.push({
          type: 'firePillar', x: e.x, y: 0, w: e.w, h: H,
          life: 20, maxLife: 20, color: '#ff4400'
        });
        const pillarBox = { x: e.x, y: 0, w: e.w, h: H };
        if (rectsOverlap(player, pillarBox) && player.invincible <= 0 && !player.shadowDodging) {
          damagePlayer(Math.floor(18 * (boss.dmgMult || 1)));
        }
        screenShake(5, 8);
      }
    }

    if (e.type === 'voidZone' && e.life > 0) {
      e.dmgTimer++;
      if (e.dmgTimer % 22 === 0) {
        if (rectsOverlap(player, e) && player.invincible <= 0 && !player.shadowDodging) {
          damagePlayer(Math.floor(8 * (boss.dmgMult || 1)));
        }
      }
    }

    if (e.life <= 0) effects.splice(i, 1);
  }
}

// ==================== PARTICLES ====================
function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 2,
      life: 20 + Math.random() * 20,
      maxLife: 40,
      size: 2 + Math.random() * 4,
      color
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.vx *= 0.98;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// ==================== RENDERING ====================
function drawBackground() {
  if (selectedBoss === 'devil') {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1a0500');
    grad.addColorStop(0.5, '#2a0800');
    grad.addColorStop(1, '#441000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255, 68, 0, ' + (0.1 + Math.sin(gameTime * 0.02) * 0.05) + ')';
    ctx.fillRect(0, H - 80, W, 80);
    if (gameTime % 3 === 0) spawnParticles(Math.random() * W, H - 60, '#ff6600', 1);
  } else if (selectedBoss === 'warlord') {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0a0a0f');
    grad.addColorStop(0.6, '#15151f');
    grad.addColorStop(1, '#1a1a25');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255, 200, 50, ' + (0.02 + Math.sin(gameTime * 0.05) * 0.01) + ')';
    ctx.fillRect(0, 0, W, H);
  } else if (selectedBoss === 'shadow') {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#05001a');
    grad.addColorStop(0.5, '#0a0025');
    grad.addColorStop(1, '#10003a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    if (gameTime % 8 === 0) spawnParticles(Math.random() * W, Math.random() * H, '#4422aa', 1);
  }
}

function drawPlatforms() {
  for (const p of platforms) {
    let color1, color2, highlight;
    if (selectedBoss === 'devil') { color1 = '#442200'; color2 = '#331800'; highlight = '#663300'; }
    else if (selectedBoss === 'warlord') { color1 = '#444455'; color2 = '#333344'; highlight = '#666677'; }
    else { color1 = '#221144'; color2 = '#1a0d33'; highlight = '#4422aa'; }

    ctx.fillStyle = color1;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = color2;
    ctx.fillRect(p.x, p.y + 4, p.w, p.h - 4);
    ctx.fillStyle = highlight;
    ctx.fillRect(p.x, p.y, p.w, 3);
  }
}

function drawPlayer() {
  ctx.save();
  const px = player.x;
  const py = player.y;
  const rbCount = getRebirthCount();

  // Rebirth aura
  if (rbCount > 0) {
    ctx.save();
    const auraSize = 8 + rbCount * 4;
    const pulse = Math.sin(gameTime * 0.08) * 0.15;
    ctx.globalAlpha = 0.15 + pulse + rbCount * 0.03;
    const auraGrad = ctx.createRadialGradient(
      px + player.w/2, py + player.h/2, 5,
      px + player.w/2, py + player.h/2, player.w/2 + auraSize
    );
    auraGrad.addColorStop(0, '#ff88ff');
    auraGrad.addColorStop(0.5, '#aa44ff');
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(px + player.w/2, py + player.h/2, player.w/2 + auraSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Rebirth sparkles
    if (gameTime % (8 - Math.min(rbCount, 5)) === 0) {
      const sx = px + Math.random() * player.w;
      const sy = py + Math.random() * player.h;
      spawnParticles(sx, sy, rbCount >= 3 ? '#ffaaff' : '#aa66ff', 1);
    }
  }

  // ---- MASTER SKILL VISUALS ----
  if (player.masterSkill) {

    // SWORDSMAN: golden shield badge + resurrect burst rings
    if (player.className === 'swordsman') {
      // Expanding golden rings on resurrect
      if (player.resurrectAura > 0) {
        ctx.save();
        const prog = player.resurrectAura / 100;
        for (let r = 0; r < 4; r++) {
          const rp = ((1 - prog) * 4 + r) % 1;
          ctx.globalAlpha = (1 - rp) * prog * 0.9;
          ctx.strokeStyle = rp < 0.5 ? '#ffffff' : '#ffdd00';
          ctx.lineWidth = 3 * prog;
          ctx.beginPath();
          ctx.arc(px + player.w/2, py + player.h/2, 12 + rp * 75, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
      // Golden shield badge above player when skill is intact
      if (!player.resurrectUsed) {
        ctx.save();
        ctx.globalAlpha = 0.75 + Math.sin(gameTime * 0.1) * 0.2;
        const sx = px + player.w/2, sy = py - 8;
        ctx.fillStyle = '#ffdd00';
        ctx.beginPath();
        ctx.moveTo(sx - 7, sy - 9); ctx.lineTo(sx + 7, sy - 9);
        ctx.lineTo(sx + 7, sy - 3); ctx.lineTo(sx, sy + 2);
        ctx.lineTo(sx - 7, sy - 3); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#fff8aa'; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
      }
    }

    // ARCHER: golden bow glow that intensifies with combo
    if (player.className === 'archer' && player.arrowCombo > 0) {
      ctx.save();
      ctx.globalAlpha = 0.1 + player.arrowCombo * 0.07;
      ctx.fillStyle = player.arrowCombo >= 5 ? '#ffffff' : '#ffdd00';
      ctx.fillRect(px - 3, py - 3, player.w + 6, player.h + 6);
      ctx.restore();
      if (gameTime % Math.max(2, 12 - player.arrowCombo * 2) === 0) {
        spawnParticles(px + Math.random() * player.w, py + Math.random() * player.h,
          player.arrowCombo >= 4 ? '#ffffff' : '#ffdd00', 1);
      }
    }

    // BERSERKER: speed lines + body heat at high momentum
    if (player.className === 'berserker' && player.momentum > 18) {
      ctx.save();
      const m = player.momentum / 100;
      ctx.globalAlpha = m * 0.55;
      ctx.strokeStyle = player.momentum > 70 ? '#ffffff' : (player.momentum > 40 ? '#ffaa00' : '#ff6600');
      ctx.lineWidth = 2;
      for (let l = 0; l < 4; l++) {
        const ly = py + 10 + l * (player.h / 4.2);
        const len = 8 + m * 45;
        ctx.beginPath();
        ctx.moveTo(px - player.facing * 2, ly);
        ctx.lineTo(px - player.facing * (2 + len), ly);
        ctx.stroke();
      }
      ctx.restore();
      if (player.momentum > 55 && gameTime % 4 === 0) {
        spawnParticles(px + Math.random() * player.w, py + player.h * 0.8,
          player.momentum > 80 ? '#ffffff' : '#ff8800', 1);
      }
    }
  }
  // ---- END MASTER SKILL VISUALS ----

  if (player.shadowDodging) ctx.globalAlpha = 0.3 + Math.sin(gameTime * 0.5) * 0.2;
  if (player.hitFlash > 0 && player.hitFlash % 2 === 0) ctx.globalAlpha = 0.5;
  if (player.invincible > 0 && !player.shadowDodging && gameTime % 4 < 2) ctx.globalAlpha = 0.5;

  ctx.fillStyle = player.color;
  if (player.rageTimer > 0) ctx.fillStyle = gameTime % 6 < 3 ? '#ff4400' : '#ff8800';
  // Berserker body heat shift at high momentum
  if (player.masterSkill && player.className === 'berserker' && player.momentum > 65) {
    ctx.fillStyle = player.momentum > 85 ? '#ffeeaa' : '#ffaa44';
  }
  ctx.fillRect(px + 4, py + 12, player.w - 8, player.h - 12);

  ctx.fillStyle = '#ddb08a';
  ctx.fillRect(px + 8, py, player.w - 16, 14);

  ctx.fillStyle = '#222';
  const eyeX = player.facing === 1 ? px + player.w - 12 : px + 8;
  ctx.fillRect(eyeX, py + 4, 3, 3);

  if (player.className === 'swordsman') {
    // Floating shield in front of player
    ctx.save();
    const shpct = player.shieldHp / player.shieldMaxHp;
    const shBob = Math.sin(gameTime * 0.08) * 3;
    const shX = player.facing === 1 ? px + player.w + 5 : px - 15;
    const shY = py + 6 + shBob;
    if (player.shieldBroken) {
      // Broken: shattered dim pieces
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#223355';
      ctx.fillRect(shX, shY, 6, 10);
      ctx.fillRect(shX + 7, shY + 5, 5, 9);
      ctx.fillRect(shX + 2, shY + 15, 8, 6);
    } else {
      // Intact shield — opacity and color reflect HP
      ctx.globalAlpha = player.shieldFlash > 0 && player.shieldFlash % 2 === 0 ? 1.0 : (0.55 + shpct * 0.45);
      // Body
      const shCol = shpct > 0.6 ? '#2255aa' : shpct > 0.3 ? '#1a3d7a' : '#112244';
      const shHi  = shpct > 0.6 ? '#3366cc' : shpct > 0.3 ? '#274d99' : '#1a2e55';
      ctx.fillStyle = shCol;
      ctx.fillRect(shX, shY, 13, 18);
      // Pointed bottom
      ctx.beginPath();
      ctx.moveTo(shX, shY + 18);
      ctx.lineTo(shX + 13, shY + 18);
      ctx.lineTo(shX + 6, shY + 25);
      ctx.closePath(); ctx.fill();
      // Highlight
      ctx.fillStyle = shHi;
      ctx.fillRect(shX + 2, shY + 2, 6, 8);
      // Gold cross emblem
      ctx.fillStyle = shpct > 0.5 ? '#ffcc00' : '#887700';
      ctx.fillRect(shX + 5, shY + 10, 2, 7);
      ctx.fillRect(shX + 3, shY + 13, 6, 2);
      // Glow rim when healthy
      if (shpct > 0.3) {
        ctx.globalAlpha *= 0.6;
        ctx.strokeStyle = shpct > 0.6 ? '#88bbff' : '#446699';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(shX, shY, 13, 18);
      }
    }
    ctx.restore();
    // Sword on weapon-hand
    ctx.save();
    ctx.translate(px + (player.facing === 1 ? player.w : 0), py + 14);
    ctx.scale(player.facing, 1);
    ctx.fillStyle = '#775533'; ctx.fillRect(-8, 1, 9, 3);   // handle
    ctx.fillStyle = '#778899'; ctx.fillRect(4, -6, 3, 15);  // crossguard
    ctx.fillStyle = '#aaccff'; ctx.fillRect(0, 1, 28, 5);   // blade
    ctx.fillStyle = '#eef8ff'; ctx.fillRect(0, 1, 14, 2);   // shine
    ctx.restore();
    if (player.charging) {
      ctx.fillStyle = 'rgba(68, 170, 255, ' + (player.chargeAmount / 100) + ')';
      ctx.fillRect(px - 5, py - 5, player.w + 10, player.h + 10);
    }
  } else if (player.className === 'archer') {
    ctx.fillStyle = '#886633';
    ctx.fillRect(player.facing === 1 ? px + player.w - 4 : px, py + 8, 4, 30);
  } else if (player.className === 'berserker') {
    // Pauldrons
    ctx.fillStyle = '#667788';
    ctx.fillRect(px - 4, py + 4, 12, 10);              // left pauldron
    ctx.fillRect(px + player.w - 8, py + 4, 12, 10);   // right pauldron
    ctx.fillStyle = '#889aaa';
    ctx.fillRect(px - 2, py + 5, 8, 5);                // left plate shine
    ctx.fillRect(px + player.w - 6, py + 5, 8, 5);     // right plate shine
    // Axe
    ctx.save();
    ctx.translate(px + (player.facing === 1 ? player.w : 0), py + 8);
    ctx.scale(player.facing, 1);
    ctx.fillStyle = '#664422'; ctx.fillRect(0, 3, 22, 4);   // handle
    ctx.fillStyle = '#99aaaa'; ctx.fillRect(18, -9, 11, 24); // axe head
    ctx.fillStyle = '#ccdcdc'; ctx.fillRect(20, -7, 5, 20);  // axe shine
    ctx.fillStyle = '#556677'; ctx.fillRect(18, 5, 11, 3);   // axe band
    ctx.restore();
  }

  ctx.restore();
}

function drawBoss() {
  ctx.save();
  if (boss.teleporting && boss.teleBlinking) ctx.globalAlpha = gameTime % 5 < 2 ? 0.85 : 0.05;
  else if (boss.teleporting) ctx.globalAlpha = 0.15;
  if (boss.hitFlash > 0 && boss.hitFlash % 2 === 0) ctx.globalAlpha = 0.5;

  const bx = boss.x;
  const by = boss.y;

  if (boss.type === 'devil') {
    ctx.fillStyle = '#cc1111';
    ctx.fillRect(bx + 10, by + 20, boss.w - 20, boss.h - 20);
    ctx.fillStyle = '#dd2222';
    ctx.fillRect(bx + 12, by, boss.w - 24, 25);
    ctx.fillStyle = '#661111';
    ctx.fillRect(bx + 5, by - 15, 8, 20);
    ctx.fillRect(bx + boss.w - 13, by - 15, 8, 20);
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(bx + 20, by + 8, 8, 6);
    ctx.fillRect(bx + boss.w - 28, by + 8, 8, 6);
    ctx.fillStyle = '#881111';
    ctx.fillRect(bx - 20, by + 10, 25, 40);
    ctx.fillRect(bx + boss.w - 5, by + 10, 25, 40);
    if (gameTime % 4 === 0) spawnParticles(bx + Math.random() * boss.w, by + boss.h, '#ff4400', 1);
  } else if (boss.type === 'warlord') {
    ctx.fillStyle = '#556677';
    ctx.fillRect(bx + 8, by + 15, boss.w - 16, boss.h - 15);
    ctx.fillStyle = '#778899';
    ctx.fillRect(bx - 5, by + 15, 20, 25);
    ctx.fillRect(bx + boss.w - 15, by + 15, 20, 25);
    ctx.fillStyle = '#667788';
    ctx.fillRect(bx + 12, by, boss.w - 24, 20);
    ctx.fillStyle = '#445566';
    ctx.fillRect(bx + 15, by + 2, boss.w - 30, 8);
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(bx + 22, by + 5, 6, 4);
    ctx.fillRect(bx + boss.w - 28, by + 5, 6, 4);
    ctx.fillStyle = '#444444';
    const mx = boss.facing === 1 ? bx + boss.w : bx - 30;
    ctx.fillRect(mx, by + 10, 30, 6);
    ctx.fillStyle = '#666666';
    ctx.fillRect(mx + (boss.facing === 1 ? 22 : -8), by, 16, 22);
    ctx.fillStyle = '#ccaa00';
    ctx.fillRect(bx + 8, by + boss.h - 5, boss.w - 16, 3);
  } else if (boss.type === 'shadow') {
    ctx.fillStyle = '#3a1866';
    ctx.fillRect(bx + 8, by + 18, boss.w - 16, boss.h - 18);
    ctx.fillStyle = '#2a1055';
    ctx.fillRect(bx + 2, by + 30, boss.w - 4, boss.h - 25);
    ctx.fillStyle = '#221044';
    ctx.fillRect(bx + 10, by, boss.w - 20, 22);
    ctx.fillRect(bx + 5, by + 5, boss.w - 10, 15);
    ctx.fillStyle = '#ff44ff';
    ctx.fillRect(bx + 18, by + 8, 6, 4);
    ctx.fillRect(bx + boss.w - 24, by + 8, 6, 4);
    ctx.fillStyle = '#8844cc';
    const sx = boss.facing === 1 ? bx + boss.w : bx - 35;
    ctx.fillRect(sx, by + 10, 35, 4);
    ctx.fillStyle = '#aa66ff';
    ctx.fillRect(sx + (boss.facing === 1 ? 25 : 0), by + 8, 10, 8);
    if (gameTime % 6 === 0) spawnParticles(bx + Math.random() * boss.w, by + Math.random() * boss.h, '#6633cc', 1);
  }

  ctx.restore();

  for (const clone of boss.clones) {
    ctx.save();
    ctx.globalAlpha = 0.4 + Math.sin(clone.animTimer * 0.1) * 0.2;
    ctx.fillStyle = '#6633cc';
    ctx.fillRect(clone.x, clone.y, clone.w, clone.h);
    ctx.fillStyle = '#ff44ff';
    ctx.fillRect(clone.x + 12, clone.y + 8, 4, 3);
    ctx.fillRect(clone.x + clone.w - 16, clone.y + 8, 4, 3);
    ctx.restore();
  }
}

function drawProjectiles() {
  for (const p of projectiles) {
    ctx.save();
    if (p.type === 'fireball') {
      ctx.fillStyle = '#ff6600';
      ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill();
    } else if (p.type === 'arrow') {
      const arrowColor = p.comboLevel >= 5 ? '#ffffff' : p.comboLevel >= 3 ? '#ffdd00' : p.color;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.atan2(p.vy, p.vx));
      if (p.comboLevel >= 3) {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = p.comboLevel >= 5 ? '#ffffff' : '#ffaa00';
        ctx.fillRect(-14, -5, 28, 10);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = arrowColor;
      ctx.fillRect(-10, -2, 20, 4);
      ctx.fillStyle = p.comboLevel >= 3 ? '#ffffaa' : '#ffffff';
      ctx.fillRect(6, -3, 6, 6);
      ctx.restore();
    } else if (p.type === 'shadowBolt') {
      ctx.fillStyle = '#aa66ff';
      ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#dd88ff';
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
    } else if (p.type === 'shockwave') {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / 40;
      ctx.fillRect(p.x, p.y, p.w, p.h);
    } else if (p.type === 'groundQuake') {
      const fade = p.life / 50;
      const tipX = p.vx > 0 ? p.x + p.w : p.x;
      // Subsurface glow band
      ctx.globalAlpha = fade * 0.55;
      ctx.fillStyle = '#ff3300';
      ctx.fillRect(p.x, p.y + 8, p.w, p.h - 8);
      // Surface crack line
      ctx.globalAlpha = fade * 0.9;
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(p.x, p.y + 6, p.w, 4);
      // Bright leading tip
      ctx.globalAlpha = fade;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(tipX - (p.vx > 0 ? 5 : 0), p.y + 4, 5, 8);
      // Upward debris spikes at tip
      ctx.globalAlpha = fade * 0.7;
      ctx.fillStyle = '#ff8800';
      for (let s = 0; s < 3; s++) {
        ctx.fillRect(tipX + (p.vx > 0 ? s * 4 - 4 : -(s * 4)), p.y - 4 - s * 3, 3, 6 + s * 3);
      }
    } else if (p.type === 'debris') {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.w, p.h);
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.w/2, p.y - p.h/2, p.w, p.h);
    }
    ctx.restore();
  }
}

function drawEffects() {
  for (const e of effects) {
    ctx.save();
    const alpha = e.life / e.maxLife;

    if (e.type === 'slash') {
      const ox = e.facing === 1 ? e.x : e.x + e.w;
      const oy = e.y + e.h * 0.35;
      ctx.lineCap = 'round';

      if (e.className === 'swordsman') {
        // Crisp blade arc sweep
        const r = e.w * 0.95;
        const sa = e.facing === 1 ? -Math.PI * 0.5 : Math.PI * 0.5;
        const ea = e.facing === 1 ?  Math.PI * 0.5 : Math.PI * 1.5;
        ctx.globalAlpha = alpha * 0.2;  ctx.strokeStyle = '#aaddff'; ctx.lineWidth = 24 * alpha;
        ctx.beginPath(); ctx.arc(ox, oy, r, sa, ea); ctx.stroke();
        ctx.globalAlpha = alpha * 0.55; ctx.strokeStyle = '#55aaff'; ctx.lineWidth = 9 * alpha;
        ctx.beginPath(); ctx.arc(ox, oy, r, sa, ea); ctx.stroke();
        ctx.globalAlpha = alpha * 0.95; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5 * alpha;
        ctx.beginPath(); ctx.arc(ox, oy, r * 0.9, sa, ea); ctx.stroke();
        for (let i = 0; i < 5; i++) {
          const a = sa + (i / 4) * (ea - sa);
          ctx.globalAlpha = alpha * (0.8 - i * 0.14);
          ctx.strokeStyle = '#cceeff'; ctx.lineWidth = (2.5 - i * 0.4) * alpha;
          ctx.beginPath();
          ctx.moveTo(ox + Math.cos(a) * r * 0.22, oy + Math.sin(a) * r * 0.22);
          ctx.lineTo(ox + Math.cos(a) * r * 1.1,  oy + Math.sin(a) * r * 1.1);
          ctx.stroke();
        }

      } else if (e.className === 'berserker') {
        // Brutal axe cleave — wide, thick, orange
        const r = e.w * 0.9;
        const sa = e.facing === 1 ? -Math.PI * 0.65 : Math.PI * 0.35;
        const ea = e.facing === 1 ?  Math.PI * 0.65 : Math.PI * 1.65;
        ctx.globalAlpha = alpha * 0.28; ctx.strokeStyle = '#ff4400'; ctx.lineWidth = 38 * alpha;
        ctx.beginPath(); ctx.arc(ox, oy, r, sa, ea); ctx.stroke();
        ctx.globalAlpha = alpha * 0.65; ctx.strokeStyle = '#ff8800'; ctx.lineWidth = 15 * alpha;
        ctx.beginPath(); ctx.arc(ox, oy, r, sa, ea); ctx.stroke();
        ctx.globalAlpha = alpha * 0.95; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4 * alpha;
        ctx.beginPath(); ctx.arc(ox, oy, r * 0.87, sa, ea); ctx.stroke();
        // Ground crack lines at bottom of swing
        const crackY = e.y + e.h * 0.88;
        ctx.globalAlpha = alpha * 0.9; ctx.strokeStyle = '#ffaa00'; ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          const cx2 = ox + (i - 2) * 11;
          const crackAngle = Math.PI * 0.5 + (i - 2) * 0.22;
          const len = 9 + Math.abs(i - 2) * 6;
          ctx.beginPath(); ctx.moveTo(cx2, crackY);
          ctx.lineTo(cx2 + Math.cos(crackAngle) * len, crackY + Math.sin(crackAngle) * len);
          ctx.stroke();
        }
        // Expanding half-ring shockwave at base
        ctx.globalAlpha = alpha * 0.4; ctx.strokeStyle = '#ff6600'; ctx.lineWidth = 3 * alpha;
        const swR = (1 - alpha) * r * 0.55 + 6;
        ctx.beginPath(); ctx.arc(ox, crackY, swR, 0, Math.PI); ctx.stroke();

      } else {
        // Boss slashes / fallback
        ctx.globalAlpha = alpha;
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillRect(e.x + e.w * 0.2, e.y + e.h * 0.3, e.w * 0.6, e.h * 0.4);
      }
      ctx.lineCap = 'butt';
    } else if (e.type === 'underSwing') {
      // Downward arc sweep into the ground
      const ox = e.facing === 1 ? e.x : e.x + e.w;
      const oy = e.y + e.h * 0.28;
      const r  = e.h * 0.82;
      const groundY = e.y + e.h;
      // Angles: swing from horizontal-ish down into the ground
      const sa = e.facing === 1 ? -Math.PI * 0.3 : Math.PI * 1.3;
      const ea = e.facing === 1 ?  Math.PI * 0.75 : Math.PI * 0.25;
      ctx.lineCap = 'round';
      // Outer glow
      ctx.globalAlpha = alpha * 0.25; ctx.strokeStyle = '#ff3300'; ctx.lineWidth = 34 * alpha;
      ctx.beginPath(); ctx.arc(ox, oy, r, sa, ea); ctx.stroke();
      // Mid
      ctx.globalAlpha = alpha * 0.6;  ctx.strokeStyle = '#ff7700'; ctx.lineWidth = 13 * alpha;
      ctx.beginPath(); ctx.arc(ox, oy, r, sa, ea); ctx.stroke();
      // Core white edge
      ctx.globalAlpha = alpha * 0.95; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3.5 * alpha;
      ctx.beginPath(); ctx.arc(ox, oy, r * 0.88, sa, ea); ctx.stroke();
      ctx.lineCap = 'butt';
      // Ground impact burst — horizontal lines erupting from impact point
      ctx.globalAlpha = alpha * 0.85; ctx.strokeStyle = '#ffaa00'; ctx.lineWidth = 2.5 * alpha;
      for (let i = 0; i < 5; i++) {
        const len = (12 + i * 14) * e.facing;
        const riseY = groundY - i * 4;
        ctx.beginPath(); ctx.moveTo(ox, riseY); ctx.lineTo(ox + len, riseY - i * 3); ctx.stroke();
      }
      // Underground glow below the surface
      ctx.globalAlpha = alpha * 0.35;
      ctx.fillStyle = '#ff5500';
      ctx.fillRect(e.facing === 1 ? ox : ox - e.w * 0.75, groundY, e.w * 0.75, 10);
    } else if (e.type === 'warning') {
      ctx.globalAlpha = 0.15 + Math.sin(gameTime * 0.3) * 0.1;
      ctx.fillStyle = '#ff4400';
      ctx.fillRect(e.x, e.y, e.w, e.h);
    } else if (e.type === 'firePillar') {
      ctx.globalAlpha = alpha;
      const grad = ctx.createLinearGradient(e.x, 0, e.x + e.w, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.3, '#ff4400');
      grad.addColorStop(0.5, '#ffaa00');
      grad.addColorStop(0.7, '#ff4400');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(e.x - 10, 0, e.w + 20, H);
      spawnParticles(e.x + e.w/2, Math.random() * H, '#ff6600', 2);
    } else if (e.type === 'explosion') {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = e.color;
      const expand = (1 - alpha) * 30;
      ctx.beginPath(); ctx.arc(e.x + e.w/2, e.y + e.h/2, e.w/2 + expand, 0, Math.PI * 2); ctx.fill();
    } else if (e.type === 'shadowStreak') {
      const drift = (1 - alpha) * 50;
      ctx.globalAlpha = alpha * 0.8;
      ctx.fillStyle = '#330055';
      ctx.fillRect(e.x, e.y - drift * 0.3, e.w, e.h);
      ctx.globalAlpha = alpha * 0.5;
      ctx.fillStyle = '#6600aa';
      ctx.fillRect(e.x + e.w * 0.2, e.y - drift * 0.6, e.w * 0.6, e.h * 0.7);
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = '#aa44ff';
      for (let si = 0; si < 3; si++) {
        ctx.fillRect(e.x + si * (e.w / 3), e.y - drift * (0.8 + si * 0.2), e.w / 5, e.h * (1.2 + si * 0.3));
      }
    } else if (e.type === 'voidZone') {
      ctx.globalAlpha = 0.3 + Math.sin(gameTime * 0.1) * 0.15;
      ctx.fillStyle = e.color;
      ctx.beginPath(); ctx.arc(e.x + e.w/2, e.y + e.h/2, e.w/2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#aa66ff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (e.type === 'dmgFloat') {
      const rise = (1 - alpha) * 48;
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${e.size}px monospace`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(e.text, e.x, e.y - rise);
      ctx.fillStyle = e.color;
      ctx.fillText(e.text, e.x, e.y - rise);
    }

    ctx.restore();
  }
}

// ==================== DEATH ANIMATIONS ====================
function drawBossDeathAnim() {
  const t = deathAnimTimer;
  const bx = boss.x + boss.w / 2;
  const by = boss.y + boss.h / 2;

  if (selectedBoss === 'devil') {
    // ---- DEVIL: burns and collapses into hellfire ----
    const dur = 150;
    // Continuous fire particles
    if (t < 100 && t % 2 === 0) {
      for (let i = 0; i < 6; i++) {
        particles.push({ x: bx + (Math.random()-0.5)*boss.w, y: by + (Math.random()-0.5)*boss.h,
          vx: (Math.random()-0.5)*5, vy: -2 - Math.random()*6,
          life: 30+Math.random()*30, maxLife: 60, size: 3+Math.random()*8,
          color: ['#ff2200','#ff6600','#ffaa00','#ffff00','#ffffff'][Math.floor(Math.random()*5)] });
      }
    }
    // Boss: flicker and sink
    const sinkY = Math.min(60, t * 0.55);
    const flicker = t > 20 && t % 4 < 2 ? 0.3 : 1;
    const fade = t > 80 ? Math.max(0, 1 - (t - 80) / 50) : 1;
    ctx.save();
    ctx.globalAlpha = flicker * fade;
    ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 30;
    ctx.fillStyle = boss.color;
    ctx.fillRect(boss.x, boss.y + sinkY, boss.w, boss.h);
    ctx.restore();
    // Red-orange screen overlay
    if (t > 40) {
      const oa = Math.min(0.55, (t - 40) / 60) * (t > 110 ? Math.max(0, 1 - (t-110)/35) : 1);
      ctx.fillStyle = `rgba(220,60,0,${oa})`;
      ctx.fillRect(0, 0, W, H);
    }
    // Expanding fire ring at t=5
    if (t > 5 && t < 60) {
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - t/60);
      ctx.strokeStyle = '#ff6600'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(bx, by, (t-5)*4, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    }
    if (t === dur - 5) { gameState = 'victory'; showGameEnd(true); }

  } else if (selectedBoss === 'warlord') {
    // ---- WARLORD: staggers, armour flies off, collapses ----
    const dur = 160;
    // Armour shard particles
    if (t < 60 && t % 3 === 0) {
      for (let i = 0; i < 4; i++) {
        particles.push({ x: bx + (Math.random()-0.5)*boss.w*1.2, y: by + (Math.random()-0.5)*boss.h,
          vx: (Math.random()-0.5)*9, vy: -3 - Math.random()*5,
          life: 40+Math.random()*40, maxLife: 80, size: 4+Math.random()*7,
          color: ['#888888','#aaaaaa','#ffcc00','#cccccc'][Math.floor(Math.random()*4)] });
      }
    }
    // Dust at base while falling
    if (t > 50 && t % 4 === 0) {
      particles.push({ x: bx + (Math.random()-0.5)*boss.w*2, y: boss.y + boss.h,
        vx: (Math.random()-0.5)*4, vy: -1 - Math.random()*2,
        life: 35+Math.random()*25, maxLife: 60, size: 6+Math.random()*10, color: '#887755' });
    }
    // Boss: rotate and sink
    const fallAngle = Math.min(Math.PI * 0.5, t * 0.013);
    const sinkY = Math.min(boss.h * 0.8, Math.max(0, (t - 40) * 0.9));
    const fade = t > 100 ? Math.max(0, 1 - (t - 100) / 50) : 1;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(boss.x + boss.w, boss.y + boss.h + sinkY);
    ctx.rotate(fallAngle);
    ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 15;
    ctx.fillStyle = boss.color;
    ctx.fillRect(-boss.w, -boss.h, boss.w, boss.h);
    ctx.restore();
    // Shockwave ring at impact (t~55)
    if (t > 55 && t < 100) {
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - (t-55)/45) * 0.7;
      ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(bx, boss.y + boss.h, (t-55)*5, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    }
    // Grey dust overlay
    if (t > 55) {
      ctx.fillStyle = `rgba(100,80,50,${Math.min(0.4, (t-55)/40) * (t>120 ? Math.max(0,1-(t-120)/35) : 1)})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (t === dur - 5) { gameState = 'victory'; showGameEnd(true); }

  } else if (selectedBoss === 'shadow') {
    // ---- SHADOW KNIGHT: dissolves into darkness ----
    const dur = 170;
    // Shadow particles spiral outward
    if (t < 90 && t % 2 === 0) {
      for (let i = 0; i < 5; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 1.5 + Math.random() * 7;
        particles.push({ x: bx, y: by,
          vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd,
          life: 40+Math.random()*50, maxLife: 90, size: 3+Math.random()*9,
          color: ['#330055','#6600aa','#aa44ff','#220033','#000000'][Math.floor(Math.random()*5)] });
      }
    }
    // Boss: rapid blink then dissolve
    const blink = t < 40 ? (t % 6 < 3 ? 1 : 0) : 0;
    const dissolve = t >= 40 ? Math.max(0, 1 - (t - 40) / 55) : blink;
    ctx.save();
    ctx.globalAlpha = dissolve;
    ctx.shadowColor = '#aa00ff'; ctx.shadowBlur = 25;
    ctx.fillStyle = boss.color;
    ctx.fillRect(boss.x, boss.y, boss.w, boss.h);
    ctx.restore();
    // Dark vignette that expands then recedes
    const vigA = t < 80 ? Math.min(0.75, t/80*0.75) : Math.max(0, 0.75 - (t-80)/60*0.75);
    ctx.save();
    const vig = ctx.createRadialGradient(bx, by, 20, bx, by, W*0.8);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, `rgba(0,0,0,${vigA})`);
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // Purple flash at dissolve start
    if (t > 38 && t < 55) {
      ctx.fillStyle = `rgba(100,0,180,${Math.max(0, 1-(t-38)/17)*0.55})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (t === dur - 5) { gameState = 'victory'; showGameEnd(true); }
  }
}

function drawPlayerDeathAnim() {
  const t = deathAnimTimer;
  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;
  const dur = 110;

  // Scatter fragments
  if (t === 1) {
    for (let i = 0; i < 28; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 8;
      particles.push({ x: px, y: py,
        vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd - 3,
        life: 40+Math.random()*50, maxLife: 90, size: 3+Math.random()*8,
        color: [player.color, '#ffffff', '#ff4444', '#ffaaaa'][Math.floor(Math.random()*4)] });
    }
  }
  // Player: flash then fade
  const fade = t > 20 ? Math.max(0, 1 - (t - 20) / 35) : 1;
  const flash = t < 8 ? (t % 2 === 0 ? 1 : 0) : fade;
  ctx.save();
  ctx.globalAlpha = flash;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(player.x - 4, player.y - 4, player.w + 8, player.h + 8);
  ctx.restore();

  // Red vignette closes in
  const vigStr = Math.min(0.88, t / 65);
  ctx.save();
  const vig = ctx.createRadialGradient(px, py, 10, W/2, H/2, W*0.7);
  vig.addColorStop(0, 'transparent');
  vig.addColorStop(1, `rgba(160,0,0,${vigStr})`);
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // Final fade to black
  if (t > 70) {
    ctx.fillStyle = `rgba(0,0,0,${Math.min(1, (t-70)/30)})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (t === dur - 5) { gameState = 'gameOver'; showGameEnd(false); }
}

function drawParticles() {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
    ctx.restore();
  }
}

// ==================== HUD UPDATE ====================
function updateHUD() {
  if (gameState !== 'playing') return;
  const pBar = document.getElementById('player-hp-bar');
  const pText = document.getElementById('player-hp-text');
  const bBar = document.getElementById('boss-hp-bar');
  const bText = document.getElementById('boss-hp-text');
  const superFill = document.getElementById('super-bar-fill');
  const superReady = document.getElementById('super-ready');
  const superBarBg = document.getElementById('super-bar-bg');

  pBar.style.width = (player.hp / player.maxHp * 100) + '%';
  pText.textContent = Math.ceil(player.hp) + '/' + player.maxHp;
  bBar.style.width = (boss.hp / boss.maxHp * 100) + '%';
  bText.textContent = Math.ceil(boss.hp) + '/' + boss.maxHp;

  const superPct = player.superCharge / player.superMax * 100;
  superFill.style.width = superPct + '%';

  if (player.superCharge >= player.superMax) {
    superReady.style.display = 'inline';
    superBarBg.style.display = 'none';
  } else {
    superReady.style.display = 'none';
    superBarBg.style.display = 'block';
  }

  const msDisplay = document.getElementById('master-skill-display');
  const msLabel = document.getElementById('master-skill-label-hud');
  const msInfo = document.getElementById('master-skill-info-hud');
  if (player.masterSkill) {
    msDisplay.style.display = 'flex';
    if (player.className === 'swordsman') {
      msLabel.textContent = 'LAST STAND';
      msLabel.style.color = '#ffdd44';
      msInfo.textContent = player.resurrectUsed ? 'USED' : 'READY';
      msInfo.style.color = player.resurrectUsed ? '#555' : '#ffdd00';
    } else if (player.className === 'archer') {
      msLabel.textContent = 'COMBO';
      msLabel.style.color = player.arrowCombo >= 3 ? '#ffdd44' : '#aaaa44';
      msInfo.textContent = 'x' + player.arrowCombo + ' / 5';
      msInfo.style.color = player.arrowCombo >= 5 ? '#ffffff' : player.arrowCombo >= 3 ? '#ffdd00' : player.arrowCombo > 0 ? '#ffaa44' : '#555';
    } else if (player.className === 'berserker') {
      msLabel.textContent = 'MOMENTUM';
      msLabel.style.color = player.momentum > 70 ? '#ffeeaa' : player.momentum > 40 ? '#ffaa44' : '#aa6633';
      msInfo.textContent = Math.floor(player.momentum) + '%';
      msInfo.style.color = player.momentum > 80 ? '#ffffff' : player.momentum > 55 ? '#ff8800' : player.momentum > 20 ? '#ff5500' : '#555';
    }
  } else {
    msDisplay.style.display = 'none';
  }
}

// ==================== GAME LOOP ====================
function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (gameState === 'playing') {
    gameTime++;
    updatePlayer();
    updateBoss();
    updateProjectiles();
    updateEffects();
    updateParticles();
    if (shakeTimer > 0) shakeTimer--;
  } else if (gameState === 'bossDeath' || gameState === 'playerDeath') {
    deathAnimTimer++;
    gameTime++;
    updateParticles();
    updateEffects();
    if (shakeTimer > 0) shakeTimer--;
  } else {
    updateParticles();
  }

  ctx.save();
  if (shakeTimer > 0) {
    const sx = (Math.random() - 0.5) * shakeIntensity;
    const sy = (Math.random() - 0.5) * shakeIntensity;
    ctx.translate(sx, sy);
  }

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  if (gameState === 'playing' || gameState === 'gameOver' || gameState === 'victory' || gameState === 'bossDeath' || gameState === 'playerDeath') {
    drawBackground();
    drawPlatforms();
    drawEffects();
    if (gameState !== 'bossDeath') drawPlayer();
    if (gameState !== 'playerDeath') drawBoss();
    if (gameState === 'bossDeath') drawBossDeathAnim();
    if (gameState === 'playerDeath') drawPlayerDeathAnim();
    drawProjectiles();
    drawParticles();
    updateHUD();
    if (hacksActive) {
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#00ff66';
      ctx.textAlign = 'right';
      ctx.fillText('⚠ HACKS ACTIVE — NO MEDALS', W - 14, H - 14);
      ctx.restore();
    }
  } else if (gameState === 'fightIntro') {
    fightIntroTimer++;
    const t = fightIntroTimer;
    const cx = W / 2, cy = H / 2;

    // Dark background
    ctx.fillStyle = '#06000e';
    ctx.fillRect(0, 0, W, H);

    // Fade in from black (t 0-35)
    if (t < 35) {
      ctx.fillStyle = `rgba(0,0,0,${1 - t / 35})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Divider line (t 40-65)
    if (t > 40) {
      const la = Math.min(1, (t - 40) / 25);
      ctx.save();
      ctx.globalAlpha = la * 0.45;
      ctx.strokeStyle = '#ff2222';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Player class slides in from LEFT — final rest at cx - 60 (right-aligned)
    // starts at x = -180, slides to cx - 60 over 55 frames
    if (t > 40) {
      const prog  = Math.min(1, (t - 40) / 55);
      const eased = 1 - (1 - prog) * (1 - prog);
      const px    = -180 + (cx - 60 + 180) * eased;
      const fa    = Math.min(1, (t - 40) / 28);
      const fade  = t > 215 ? Math.max(0, 1 - (t - 215) / 22) : 1;
      ctx.save();
      ctx.globalAlpha = fa * fade;
      ctx.textAlign = 'right';
      ctx.shadowColor = player.color;
      ctx.shadowBlur = 18 + Math.sin(t * 0.08) * 5;
      ctx.font = 'bold 12px Georgia, serif';
      ctx.fillStyle = '#888888';
      ctx.fillText('YOUR WARRIOR', px, cy - 72);
      ctx.font = 'bold 44px Georgia, serif';
      ctx.fillStyle = player.color;
      ctx.fillText(player.className.toUpperCase(), px, cy - 22);
      ctx.globalAlpha *= 0.65;
      ctx.font = '13px Georgia, serif';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('HP ' + player.maxHp + '   DMG ' + player.attackDmg, px, cy + 14);
      ctx.restore();
    }

    // Boss slides in from RIGHT — final rest at cx + 60 (left-aligned)
    // starts at x = W + 180, slides to cx + 60 over 55 frames
    if (t > 55) {
      const prog  = Math.min(1, (t - 55) / 55);
      const eased = 1 - (1 - prog) * (1 - prog);
      const bx    = W + 180 - (W + 180 - (cx + 60)) * eased;
      const fa    = Math.min(1, (t - 55) / 28);
      const fade  = t > 215 ? Math.max(0, 1 - (t - 215) / 22) : 1;
      ctx.save();
      ctx.globalAlpha = fa * fade;
      ctx.textAlign = 'left';
      ctx.shadowColor = boss.color;
      ctx.shadowBlur = 18 + Math.sin(t * 0.08) * 5;
      ctx.font = 'bold 12px Georgia, serif';
      ctx.fillStyle = '#888888';
      ctx.fillText('YOUR FOE', bx, cy - 72);
      ctx.font = 'bold 44px Georgia, serif';
      ctx.fillStyle = boss.color;
      ctx.fillText(boss.name.toUpperCase(), bx, cy - 22);
      ctx.globalAlpha *= 0.65;
      ctx.font = '13px Georgia, serif';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('HP ' + boss.maxHp + '   DMG ' + boss.contactDmg, bx, cy + 14);
      ctx.restore();
    }

    // VS pops in (t 130-155)
    if (t > 130) {
      const vp    = Math.min(1, (t - 130) / 25);
      const vSize = vp < 0.55 ? 28 + vp / 0.55 * 36 : 64 - (vp - 0.55) / 0.45 * 10;
      const fade  = t > 215 ? Math.max(0, 1 - (t - 215) / 22) : 1;
      ctx.save();
      ctx.globalAlpha = Math.min(1, vp * 2) * fade;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 35 + Math.sin(t * 0.1) * 8;
      ctx.font = `bold ${Math.round(vSize)}px Georgia, serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText('VS', cx, cy - 20);
      ctx.restore();
    }

    // FIGHT! crashes in (t 235-275)
    if (t > 235 && t < 295) {
      const fp     = Math.min(1, (t - 235) / 20);
      const fSize  = fp < 0.5 ? 40 + fp / 0.5 * 60 : 100 - (fp - 0.5) / 0.5 * 14;
      ctx.save();
      ctx.globalAlpha = Math.min(1, fp * 2.5);
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 55;
      ctx.font = `bold ${Math.round(fSize)}px Georgia, serif`;
      ctx.fillStyle = '#ffdd00';
      ctx.fillText('FIGHT!', cx, cy + 10);
      ctx.restore();
      if (t === 237) { shakeIntensity = 14; shakeTimer = 22; }
    }

    // Flash at FIGHT
    if (t > 235 && t < 255) {
      ctx.fillStyle = `rgba(255,220,80,${Math.max(0, 1 - (t - 235) / 20) * 0.65})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Transition to playing (t 290)
    if (t >= 290) {
      gameState = 'playing';
      document.getElementById('hud').style.display = 'block';
      document.getElementById('controls-hint').style.display = 'block';
    }

  } else if (gameState === 'title') {
    ctx.fillStyle = '#0a0010';
    ctx.fillRect(0, 0, W, H);
    if (gameTime++ % 10 === 0) spawnParticles(Math.random() * W, Math.random() * H, '#ff3333', 1);
    drawParticles();
  } else if (gameState === 'rebirthing') {
    rebirthAnimTimer++;
    updateParticles();
    const t = rebirthAnimTimer;

    // Background
    ctx.fillStyle = '#06000d';
    ctx.fillRect(0, 0, W, H);

    // Opening flash (first 18 frames)
    if (t < 18) {
      ctx.fillStyle = `rgba(180,50,255,${(1 - t / 18) * 0.92})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Burst particles for first 40 frames
    if (t <= 40 && t % 3 === 0) {
      for (let i = 0; i < 10; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 3 + Math.random() * 11;
        particles.push({
          x: W/2, y: H/2,
          vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 2,
          life: 45 + Math.random() * 45, maxLife: 90,
          size: 3 + Math.random() * 7,
          color: ['#ff44ff','#aa22ff','#ffffff','#ff88ff','#dd66ff'][Math.floor(Math.random()*5)]
        });
      }
    }

    // Expanding rings
    for (let r = 0; r < 6; r++) {
      const rStart = r * 22;
      if (t < rStart) continue;
      const rAge = t - rStart;
      const radius = rAge * 3.2;
      const alpha = Math.max(0, 1 - rAge / 75);
      ctx.save();
      ctx.globalAlpha = alpha * 0.85;
      ctx.strokeStyle = r % 2 === 0 ? '#ff44ff' : '#cc88ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(W/2, H/2, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    drawParticles();

    // End fade factor
    const endFade = t > 210 ? Math.max(0, 1 - (t - 210) / 55) : 1;

    // "REBIRTH" text (fades in from t=35)
    if (t > 35) {
      const ta = Math.min(1, (t - 35) / 35) * endFade;
      ctx.save();
      ctx.globalAlpha = ta;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff44ff';
      ctx.shadowBlur = 28 + Math.sin(t * 0.12) * 12;
      ctx.font = 'bold 70px Georgia, serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('REBIRTH', W/2, H/2 - 18);
      ctx.restore();
    }

    // Rebirth count (fades in from t=90)
    if (t > 90) {
      const ca = Math.min(1, (t - 90) / 35) * endFade;
      ctx.save();
      ctx.globalAlpha = ca;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff88ff';
      ctx.shadowBlur = 20 + Math.sin(t * 0.1) * 8;
      ctx.font = 'bold 44px Georgia, serif';
      ctx.fillStyle = '#ff88ff';
      ctx.fillText('× ' + rebirthNewCount, W/2, H/2 + 46);
      ctx.restore();
    }

    // End flash (t 210-260)
    if (t > 210 && t < 268) {
      const peak = t < 240 ? (t - 210) / 30 : (268 - t) / 28;
      ctx.fillStyle = `rgba(180,80,255,${Math.max(0, peak) * 0.8})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Done
    if (t >= 278) {
      gameState = 'title';
      particles.length = 0;
      document.getElementById('title-screen').style.display = 'flex';
      updateRebirthUI();
    }
  } else if (gameState === 'resetting') {
    resetAnimTimer++;
    updateParticles();
    const t = resetAnimTimer;
    const cx = W / 2, cy = H / 2;

    // Background
    ctx.fillStyle = '#000008';
    ctx.fillRect(0, 0, W, H);

    // ---- SOUL (blue/white orb) ----
    // Visible t 0-145, flickers when sword is close (t > 100)
    if (t < 148) {
      const flicker = t > 100 ? (gameTime % 3 < 1 ? 0.4 : 1) : 1;
      const soulAlpha = (t < 40 ? t / 40 : t > 128 ? Math.max(0, 1 - (t - 128) / 18) : 1) * flicker;
      const soulR = 22 + Math.sin(t * 0.13) * 3;
      ctx.save();
      ctx.globalAlpha = soulAlpha;
      ctx.shadowColor = '#88ccff';
      ctx.shadowBlur = 40 + Math.sin(t * 0.1) * 12;
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, soulR + 10);
      sg.addColorStop(0, '#ffffff');
      sg.addColorStop(0.3, '#aaddff');
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(cx, cy, soulR + 10, 0, Math.PI * 2); ctx.fill();
      // Inner bright core
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // ---- SWORD descends (t 35 → 130) ----
    if (t > 35 && t < 185) {
      const prog = Math.min(1, (t - 35) / 70);
      const eased = prog * prog; // ease-in
      const swordY = cy - 220 + eased * 195;
      const sAlpha = t < 52 ? (t - 35) / 17 : t > 160 ? Math.max(0, 1 - (t - 160) / 22) : 1;
      const nearSoul = t > 100;

      ctx.save();
      ctx.globalAlpha = sAlpha;
      ctx.translate(cx, swordY);
      ctx.rotate(Math.PI); // point tip downward
      ctx.shadowColor = nearSoul ? '#ff3300' : '#4488cc';
      ctx.shadowBlur = nearSoul ? 35 : 18;
      // Blade
      ctx.fillStyle = '#cce8ff'; ctx.fillRect(-4, -75, 8, 96);
      ctx.fillStyle = '#99bbcc'; ctx.fillRect(-4, -75, 4, 96);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-4, -75, 2, 96); // edge shine
      // Tip glow when near
      if (nearSoul) {
        ctx.globalAlpha = sAlpha * 0.6;
        ctx.shadowBlur = 25;
        ctx.fillStyle = '#ff6644';
        ctx.beginPath(); ctx.arc(0, -75, 6, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = sAlpha;
      }
      // Crossguard
      ctx.fillStyle = '#aa9922'; ctx.fillRect(-20, 18, 40, 7);
      ctx.fillStyle = '#ccbb44'; ctx.fillRect(-16, 19, 22, 3);
      // Handle
      ctx.fillStyle = '#553311'; ctx.fillRect(-3, 25, 7, 26);
      ctx.fillStyle = '#774422'; ctx.fillRect(-1, 26, 3, 22);
      // Pommel
      ctx.fillStyle = '#cc9922';
      ctx.beginPath(); ctx.arc(0, 53, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#eebb44';
      ctx.beginPath(); ctx.arc(-1, 51, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // ---- IMPACT burst (one-time at t=132) ----
    if (t === 132) {
      for (let i = 0; i < 45; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 1.5 + Math.random() * 13;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 4,
          life: 55 + Math.random() * 65, maxLife: 120,
          size: 2 + Math.random() * 9,
          color: ['#aaddff','#ffffff','#66aaff','#ddeeff','#4499ff'][Math.floor(Math.random() * 5)]
        });
      }
    }

    // ---- Flash at impact ----
    if (t > 131 && t < 155) {
      const fa = t < 140 ? (t - 131) / 9 : Math.max(0, 1 - (t - 140) / 15);
      ctx.fillStyle = `rgba(200, 230, 255, ${fa * 0.92})`;
      ctx.fillRect(0, 0, W, H);
    }

    drawParticles();

    // ---- NEW SOUL forms (golden) ----
    if (t > 230) {
      const na = Math.min(1, (t - 230) / 55);
      const nr = Math.min(24, na * 28);
      const pulse = Math.sin(t * 0.14) * 0.18;
      ctx.save();
      ctx.globalAlpha = na * (0.82 + pulse);
      ctx.shadowColor = '#ffdd44';
      ctx.shadowBlur = 45 + Math.sin(t * 0.1) * 15;
      const ng = ctx.createRadialGradient(cx, cy, 0, cx, cy, nr + 12);
      ng.addColorStop(0, '#ffffff');
      ng.addColorStop(0.25, '#ffee88');
      ng.addColorStop(0.6, '#ff9933');
      ng.addColorStop(1, 'transparent');
      ctx.fillStyle = ng;
      ctx.beginPath(); ctx.arc(cx, cy, nr + 12, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      // Golden sparkles rising
      if (t % 5 === 0) {
        for (let i = 0; i < 3; i++) {
          particles.push({
            x: cx + (Math.random() - 0.5) * 50,
            y: cy + (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 2, vy: -1.5 - Math.random() * 2,
            life: 35 + Math.random() * 25, maxLife: 60,
            size: 2 + Math.random() * 4,
            color: ['#ffdd44','#ffffff','#ffaa22'][Math.floor(Math.random() * 3)]
          });
        }
      }
    }

    // ---- End fade to black ----
    if (t > 295) {
      const fa = Math.min(1, (t - 295) / 35);
      ctx.fillStyle = `rgba(0,0,0,${fa})`;
      ctx.fillRect(0, 0, W, H);
    }

    if (t >= 338) {
      gameState = 'title';
      particles.length = 0;
      document.getElementById('title-screen').style.display = 'flex';
      updateRebirthUI();
    }
  }

  ctx.restore();
}

gameLoop();
</script>
