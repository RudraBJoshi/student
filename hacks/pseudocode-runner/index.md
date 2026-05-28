---
layout: default
title: AP Computer Science Pseudocode Extended Runner
permalink: /pseudocode-runner/
meta-description: "An interactive AP CSP pseudocode interpreter with robot simulation, turtle graphics, map editor, and package support. Run AP Computer Science Principles pseudocode in your browser."
---

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/closebrackets.min.js"></script>

<style>
  body { background:#000 !important; }
  * { box-sizing: border-box; }

  .runner-page { font-family:'Courier New',monospace; color:#c8ffc8; }

  /* ── Menu Bar ── */
  .menubar {
    display:flex; align-items:stretch;
    background:#030803; border-bottom:1px solid rgba(0,255,65,.14);
    margin-bottom:.6rem; height:28px; user-select:none; flex-shrink:0;
  }
  .menubar-brand {
    padding:0 .9rem; font-size:.73rem; font-weight:700;
    color:#00ff41; opacity:.4; letter-spacing:.1em;
    display:flex; align-items:center;
    border-right:1px solid rgba(0,255,65,.1); white-space:nowrap;
  }
  .menu-wrap { position:relative; display:flex; align-items:stretch; }
  .menu-trigger {
    padding:0 .75rem; background:transparent; border:none;
    color:#c8ffc8; font-family:'Courier New',monospace; font-size:.82rem;
    cursor:pointer; outline:none; display:flex; align-items:center;
    transition:background .1s; white-space:nowrap;
  }
  .menu-trigger:hover, .menu-wrap.open .menu-trigger {
    background:rgba(0,255,65,.13); color:#00ff41;
  }
  .menu-dropdown {
    display:none; position:absolute; top:100%; left:0;
    background:#020c02; border:1px solid rgba(0,255,65,.25);
    min-width:215px; z-index:9000;
    box-shadow:0 10px 30px rgba(0,0,0,.8);
    padding:.25rem 0;
  }
  .menu-wrap.open .menu-dropdown { display:block; }
  .menu-group {
    font-size:.62rem; letter-spacing:.1em; text-transform:uppercase;
    color:#3a6a3a; padding:.45rem 1rem .1rem; cursor:default;
  }
  .menu-action {
    display:flex; justify-content:space-between; align-items:center;
    width:100%; text-align:left;
    background:transparent; border:none; color:#c8ffc8;
    font-family:'Courier New',monospace; font-size:.8rem;
    padding:.3rem 1rem; cursor:pointer; white-space:nowrap;
    transition:background .1s; gap:1.5rem;
  }
  .menu-kbd {
    font-size:.7rem; opacity:.45; letter-spacing:.02em;
  }
  .menu-action:hover { background:rgba(0,255,65,.12); color:#00ff41; }
  .menu-sep { border-top:1px solid rgba(0,255,65,.1); margin:.22rem 0; }
  .menu-run {
    padding:0 1.2rem;
    background:rgba(0,255,65,.16); border:none;
    border-left:1px solid rgba(0,255,65,.18);
    color:#00ff41; font-family:'Courier New',monospace;
    font-size:.85rem; font-weight:700; cursor:pointer;
    display:flex; align-items:center; transition:background .15s;
  }
  .menu-run:hover { background:rgba(0,255,65,.3); }
  /* shared small button used in modals */
  .tb-btn {
    padding:.3rem .8rem; border-radius:5px; border:1px solid rgba(0,255,65,.4);
    background:rgba(0,255,65,.08); color:#00ff41; font-family:'Courier New',monospace;
    font-size:.82rem; cursor:pointer; transition:background .18s;
  }
  .tb-btn:hover { background:rgba(0,255,65,.2); }
  .tb-btn.run { background:rgba(0,255,65,.18); font-weight:700; }
  .tb-btn.run:hover { background:rgba(0,255,65,.32); }

  /* ── Main layout ── */
  .runner-layout {
    display:grid;
    grid-template-columns:3fr 2fr;
    gap:.8rem;
    height: 520px;
  }
  @media(max-width:700px){
    .runner-layout { grid-template-columns:1fr; height:auto; }
  }

  /* ── Editor ── */
  .editor-wrap {
    display:flex; flex-direction:column;
    border:1px solid rgba(0,255,65,.25); border-radius:10px; overflow:hidden;
  }
  .pane-label {
    background:rgba(0,20,0,.8); padding:.35rem .8rem;
    font-size:.75rem; letter-spacing:.1em; color:#00ff41; opacity:.7;
    text-transform:uppercase; border-bottom:1px solid rgba(0,255,65,.15);
  }
  .CodeMirror {
    height:100% !important;
    font-family:'Courier New',monospace !important;
    font-size:.9rem !important;
    background:#020c02 !important;
    color:#c8ffc8 !important;
    flex:1;
  }
  .CodeMirror-scroll { min-height:460px; }
  .CodeMirror-gutters { background:#020c02 !important; border-right:1px solid rgba(0,255,65,.1) !important; }
  .CodeMirror-linenumber { color:#2a6a2a !important; }
  .CodeMirror-cursor { border-left:2px solid #00ff41 !important; }
  .CodeMirror-selected { background:rgba(0,255,65,.12) !important; }

  /* ── Syntax colors ── */
  .cm-keyword   { color:#00ff41 !important; font-weight:700; }
  .cm-builtin   { color:#ffcc00 !important; }
  .cm-operator  { color:#00ccff !important; font-weight:700; }
  .cm-number    { color:#bb86fc !important; }
  .cm-string    { color:#ff9944 !important; }
  .cm-comment   { color:#3a6a3a !important; font-style:italic; }
  .cm-variable  { color:#c8ffc8 !important; }
  .cm-atom      { color:#ff6b9d !important; } /* TRUE / FALSE */

  /* ── Right pane ── */
  .right-pane { display:flex; flex-direction:column; gap:.8rem; }

  .io-box {
    border:1px solid rgba(0,255,65,.2); border-radius:10px; overflow:hidden;
    display:flex; flex-direction:column;
  }
  .io-box textarea, .io-box .output-area {
    background:#020c02; color:#c8ffc8; border:none; outline:none;
    font-family:'Courier New',monospace; font-size:.85rem;
    padding:.6rem; resize:none; flex:1;
  }
  .io-box textarea { height:80px; }
  .output-area {
    min-height:200px; max-height:340px; overflow-y:auto;
    white-space:pre-wrap; line-height:1.6;
  }
  .out-line { display:block; }
  .out-error { color:#ff5555; }
  .out-info  { color:#3a6a3a; font-style:italic; }

  /* ── Robot canvas ── */
  .robot-panel {
    border:1px solid rgba(0,255,65,.2); border-radius:10px; overflow:hidden;
    display:flex; flex-direction:column;
  }
  .robot-controls {
    display:flex; gap:.4rem; padding:.35rem .5rem;
    background:rgba(0,20,0,.8); border-top:1px solid rgba(0,255,65,.1);
    flex-wrap:wrap; align-items:center; flex-shrink:0;
  }
  .robot-controls span { font-size:.7rem; opacity:.5; }
  #robot-canvas {
    display:block; background:#010801;
    width:100%; flex:1; min-height:0;
    image-rendering:pixelated;
  }
  .robot-speed {
    -webkit-appearance:none; appearance:none;
    width:90px; height:3px;
    background:rgba(0,255,65,.15);
    border:1px solid rgba(0,255,65,.25);
    border-radius:2px;
    outline:none; cursor:pointer;
    vertical-align:middle;
  }
  .robot-speed::-webkit-slider-runnable-track {
    height:3px; border-radius:2px;
    background:rgba(0,255,65,.12);
  }
  .robot-speed::-webkit-slider-thumb {
    -webkit-appearance:none;
    width:12px; height:12px; margin-top:-5px;
    border-radius:50%;
    background:#00ff41;
    box-shadow:0 0 6px rgba(0,255,65,.7);
    border:none; cursor:pointer;
  }
  .robot-speed::-moz-range-track {
    height:3px; border-radius:2px;
    background:rgba(0,255,65,.12); border:none;
  }
  .robot-speed::-moz-range-thumb {
    width:12px; height:12px;
    border-radius:50%;
    background:#00ff41;
    box-shadow:0 0 6px rgba(0,255,65,.7);
    border:none; cursor:pointer;
  }
  .robot-speed:hover::-webkit-slider-thumb { box-shadow:0 0 10px rgba(0,255,65,1); }
  .robot-speed:hover::-moz-range-thumb     { box-shadow:0 0 10px rgba(0,255,65,1); }

  /* ── Turtle canvas ── */
  #turtle-canvas {
    display:block; background:#010801;
    width:100%; flex:1; min-height:0;
  }

  /* ── Input Modal ── */
  .input-modal-overlay {
    display:none; position:fixed; inset:0; z-index:9999;
    background:rgba(0,0,0,.82); backdrop-filter:blur(6px);
    align-items:center; justify-content:center;
  }
  .input-modal-overlay.open { display:flex; }
  .input-modal-box {
    background:#010d01; border:1px solid rgba(0,255,65,.5);
    border-radius:14px; padding:1.6rem 2rem; min-width:300px; max-width:440px; width:90%;
    box-shadow:0 0 56px rgba(0,255,65,.18);
    display:flex; flex-direction:column; gap:1rem;
  }
  .input-modal-title {
    color:#00ff41; font-size:.95rem; font-weight:700;
    letter-spacing:.06em; text-shadow:0 0 8px rgba(0,255,65,.4);
  }
  .input-modal-label { font-size:.8rem; opacity:.55; }
  .input-modal-field {
    background:#020c02; border:1px solid rgba(0,255,65,.35);
    border-radius:6px; color:#c8ffc8; font-family:'Courier New',monospace;
    font-size:1rem; padding:.55rem .8rem; outline:none; width:100%;
    transition:border-color .15s, box-shadow .15s;
  }
  .input-modal-field:focus { border-color:rgba(0,255,65,.75); box-shadow:0 0 10px rgba(0,255,65,.2); }
  .input-modal-ok { align-self:flex-end; }

  /* ── Help Modal ── */
  .help-overlay {
    display:none; position:fixed; inset:0; z-index:9996;
    background:rgba(0,0,0,.78); backdrop-filter:blur(5px);
    align-items:center; justify-content:center;
  }
  .help-overlay.open { display:flex; }
  .help-box {
    background:#010d01; border:1px solid rgba(0,255,65,.4);
    border-radius:14px; padding:1.2rem 1.4rem;
    width:min(700px,94vw); max-height:88vh; overflow-y:auto;
    box-shadow:0 0 48px rgba(0,255,65,.14);
    display:flex; flex-direction:column; gap:.85rem;
  }
  .help-header { display:flex; justify-content:space-between; align-items:center; }
  .help-header h3 { color:#00ff41; margin:0; font-size:1rem; letter-spacing:.06em; text-shadow:0 0 8px rgba(0,255,65,.4); }

  /* ── Reference card ── */
  .ref-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:.5rem 1.5rem;
  }
  .ref-item { font-size:.78rem; line-height:1.7; }
  .ref-item code {
    background:rgba(0,255,65,.08); border-radius:3px; padding:.05rem .3rem;
    color:#00ff41; font-family:'Courier New',monospace; font-size:.8rem;
  }
  .ref-kw  { color:#00ff41; }
  .ref-bi  { color:#ffcc00; }
  .ref-op  { color:#00ccff; }

  /* ── Local Storage Manager ── */
  .lsm-overlay {
    display:none; position:fixed; inset:0; z-index:9997;
    background:rgba(0,0,0,.78); backdrop-filter:blur(5px);
    align-items:center; justify-content:center;
  }
  .lsm-overlay.open { display:flex; }
  .lsm-box {
    background:#010d01; border:1px solid rgba(0,255,65,.4);
    border-radius:14px; padding:1.2rem 1.4rem;
    width:min(620px,94vw); max-height:88vh; overflow-y:auto;
    box-shadow:0 0 48px rgba(0,255,65,.14);
    display:flex; flex-direction:column; gap:.85rem;
  }
  .lsm-header { display:flex; justify-content:space-between; align-items:center; }
  .lsm-header h3 { color:#00ff41; margin:0; font-size:1rem; letter-spacing:.06em; text-shadow:0 0 8px rgba(0,255,65,.4); }
  .lsm-table { display:flex; flex-direction:column; gap:0; border:1px solid rgba(0,255,65,.15); border-radius:8px; overflow:hidden; }
  .lsm-row {
    display:grid; grid-template-columns:1fr 70px 1fr auto;
    align-items:center; gap:.6rem; padding:.45rem .7rem;
    border-bottom:1px solid rgba(0,255,65,.08); font-size:.8rem;
  }
  .lsm-row:last-child { border-bottom:none; }
  .lsm-thead { background:rgba(0,20,0,.8); font-size:.68rem; text-transform:uppercase; letter-spacing:.08em; color:#3a6a3a; }
  .lsm-name { color:#00ff41; font-family:'Courier New',monospace; font-weight:600; }
  .lsm-type { color:#ffcc00; font-size:.75rem; }
  .lsm-preview { color:#6a9f6a; font-size:.75rem; font-family:'Courier New',monospace; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lsm-empty { font-size:.8rem; opacity:.35; text-align:center; padding:.8rem; }
  .lsm-actions { display:flex; gap:.5rem; }

  /* ── Map Editor Modal ── */
  .mapeditor-overlay {
    display:none; position:fixed; inset:0; z-index:9998;
    background:rgba(0,0,0,.78); backdrop-filter:blur(5px);
    align-items:center; justify-content:center;
  }
  .mapeditor-overlay.open { display:flex; }
  .mapeditor-box {
    background:#010d01; border:1px solid rgba(0,255,65,.4);
    border-radius:14px; padding:1.2rem 1.4rem;
    width:min(560px,94vw); max-height:88vh; overflow-y:auto;
    box-shadow:0 0 48px rgba(0,255,65,.14);
    display:flex; flex-direction:column; gap:.85rem;
  }
  .me-header { display:flex; justify-content:space-between; align-items:center; }
  .me-header h3 { color:#00ff41; margin:0; font-size:1rem; letter-spacing:.06em; text-shadow:0 0 8px rgba(0,255,65,.4); }
  .me-controls { display:flex; gap:.6rem; align-items:center; flex-wrap:wrap; }
  .me-controls label { font-size:.78rem; opacity:.7; display:flex; align-items:center; gap:.3rem; }
  .me-controls input[type="number"] {
    background:#020c02; border:1px solid rgba(0,255,65,.3); color:#c8ffc8;
    font-family:'Courier New',monospace; font-size:.82rem;
    padding:.25rem .4rem; border-radius:4px; outline:none; width:50px;
  }
  .me-controls input[type="text"] {
    background:#020c02; border:1px solid rgba(0,255,65,.3); color:#c8ffc8;
    font-family:'Courier New',monospace; font-size:.82rem;
    padding:.25rem .45rem; border-radius:4px; outline:none; width:120px;
  }
  .me-controls input:focus { border-color:rgba(0,255,65,.7); }
  #me-grid { display:grid; gap:3px; user-select:none; width:fit-content; }
  .me-cell {
    width:28px; height:28px; border-radius:3px; cursor:pointer;
    transition:background .07s, box-shadow .07s;
  }
  .me-wall {
    background:rgba(0,255,65,.32); border:1px solid rgba(0,255,65,.55);
    box-shadow:0 0 4px rgba(0,255,65,.25);
  }
  .me-open { background:rgba(0,10,0,.9); border:1px solid rgba(0,255,65,.1); }
  .me-cell:hover { filter:brightness(1.45); }
  .me-actions { display:flex; gap:.5rem; }
  .me-section-label {
    font-size:.68rem; letter-spacing:.1em; text-transform:uppercase;
    color:#3a6a3a; padding-bottom:.3rem; border-bottom:1px solid rgba(0,255,65,.1);
  }
  .me-saved-row {
    display:flex; align-items:center; gap:.4rem;
    padding:.3rem 0; border-bottom:1px solid rgba(0,255,65,.06);
  }
  .me-saved-name { flex:1; font-size:.82rem; color:#00ff41; font-family:'Courier New',monospace; }
  .me-sm { padding:.2rem .55rem !important; font-size:.73rem !important; }
  .me-del { border-color:rgba(255,60,60,.35) !important; color:#ff5555 !important; }
  .me-del:hover { background:rgba(255,60,60,.12) !important; }
  .me-empty { font-size:.75rem; opacity:.35; }

  /* ── Arduino Connection Modal ── */
  .ar-overlay {
    display:none; position:fixed; inset:0; z-index:9995;
    background:rgba(0,0,0,.78); backdrop-filter:blur(5px);
    align-items:center; justify-content:center;
  }
  .ar-overlay.open { display:flex; }
  .ar-box {
    background:#010d01; border:1px solid rgba(0,255,65,.4);
    border-radius:14px; padding:1.2rem 1.4rem;
    width:min(480px,94vw); max-height:88vh; overflow-y:auto;
    box-shadow:0 0 48px rgba(0,255,65,.14);
    display:flex; flex-direction:column; gap:.85rem;
  }
  .ar-header { display:flex; justify-content:space-between; align-items:center; }
  .ar-header h3 { color:#00ff41; margin:0; font-size:1rem; letter-spacing:.06em; text-shadow:0 0 8px rgba(0,255,65,.4); }
  .ar-status-row { display:flex; align-items:center; gap:.5rem; }
  .ar-status-dot {
    width:10px; height:10px; border-radius:50%; flex-shrink:0;
    background:#ff5555; box-shadow:0 0 6px #ff5555;
  }
  .ar-status-dot.connected { background:#00ff41; box-shadow:0 0 6px #00ff41; }
  .ar-status-dot.flashing  { background:#ffcc00; box-shadow:0 0 6px #ffcc00; }
  .ar-status-text { font-size:.82rem; }
  .ar-section-label {
    font-size:.68rem; letter-spacing:.1em; text-transform:uppercase; color:#3a6a3a;
  }
  .ar-mode-row { display:flex; gap:.5rem; }
  .ar-mode-btn { opacity:.55; transition:opacity .15s; }
  .ar-mode-btn.ar-mode-active { opacity:1; background:rgba(0,255,65,.18) !important; }
  .ar-cpp-panel {
    border:1px solid rgba(0,255,65,.2); border-radius:6px;
    background:#010801; padding:.6rem;
    max-height:240px; overflow-y:auto; overflow-x:auto;
  }
  .ar-cpp-pre {
    margin:0; font-family:'Courier New',monospace; font-size:.75rem;
    color:#c8ffc8; white-space:pre;
  }

  /* ── Virtual Arduino Overlay ── */
  .va-overlay {
    display:none; position:fixed; inset:0; z-index:9994;
    background:rgba(0,0,0,.82); backdrop-filter:blur(6px);
    align-items:center; justify-content:center;
  }
  .va-overlay.open { display:flex; }
  .va-box {
    background:#010d01; border:1px solid rgba(0,255,65,.4);
    border-radius:14px; padding:1.2rem 1.4rem;
    width:min(860px,96vw); max-height:90vh; overflow:hidden;
    box-shadow:0 0 48px rgba(0,255,65,.14);
    display:flex; flex-direction:column; gap:.7rem;
  }
  .va-header { display:flex; justify-content:space-between; align-items:flex-start; gap:.5rem; }
  .va-header svg { max-width:100%; height:auto; }
  .va-status { font-size:.78rem; color:#3a6a3a; font-family:'Courier New',monospace; }
  .va-toolbar { display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; }
  .va-step-info { font-size:.72rem; opacity:.5; margin-left:auto; }
  .va-layout {
    display:grid; grid-template-columns:1fr 1fr; gap:.8rem;
    flex:1; min-height:0; height:400px;
  }
  @media(max-width:600px){ .va-layout { grid-template-columns:1fr; height:auto; } }
  .va-canvas-panel, .va-serial-panel {
    border:1px solid rgba(0,255,65,.2); border-radius:8px;
    overflow:hidden; display:flex; flex-direction:column;
  }
  #va-canvas {
    display:block; background:#010801; flex:1; min-height:0;
    width:100%; image-rendering:pixelated;
  }
  .va-serial-output {
    background:#020c02; color:#c8ffc8;
    font-family:'Courier New',monospace; font-size:.82rem;
    padding:.6rem; overflow-y:auto; flex:1; min-height:0;
    white-space:pre-wrap; line-height:1.7;
  }
  .va-serial-line { display:block; }
  .va-serial-err  { color:#ff5555; }
</style>

<script>document.body.classList.add('no-wrapper-padding');</script>

<input type="file" id="file-open-input" accept=".fpc,.txt" style="display:none">

<div class="runner-page">

  <div class="menubar">
    <span class="menubar-brand">PSEUDOEDITOR PRO</span>

    <div class="menu-wrap">
      <button class="menu-trigger">File</button>
      <div class="menu-dropdown">
        <button class="menu-action" id="save-file">Save to File<span class="menu-kbd">Ctrl+S</span></button>
        <button class="menu-action" id="open-file">Open File…<span class="menu-kbd">Ctrl+O</span></button>
        <div class="menu-sep"></div>
        <button class="menu-action" id="load-sample">Load Sample</button>
        <div class="menu-sep"></div>
        <button class="menu-action" id="clear-editor">Clear Editor<span class="menu-kbd">Ctrl+L</span></button>
      </div>
    </div>

    <div class="menu-wrap">
      <button class="menu-trigger">Edit</button>
      <div class="menu-dropdown">
        <div class="menu-group">Conditionals</div>
        <button class="menu-action" data-snip="if">IF / ELSE IF / ELSE</button>
        <button class="menu-action" data-snip="if-simple">IF (simple)</button>
        <div class="menu-group">Loops</div>
        <button class="menu-action" data-snip="repeat-times">REPEAT n TIMES</button>
        <button class="menu-action" data-snip="repeat-until">REPEAT UNTIL</button>
        <button class="menu-action" data-snip="for-each">FOR EACH item IN list</button>
        <div class="menu-group">Procedures</div>
        <button class="menu-action" data-snip="procedure">PROCEDURE definition</button>
        <button class="menu-action" data-snip="procedure-return">PROCEDURE with RETURN</button>
        <div class="menu-group">Lists</div>
        <button class="menu-action" data-snip="list-create">Create list</button>
        <button class="menu-action" data-snip="list-ops">List operations</button>
        <div class="menu-group">I/O</div>
        <button class="menu-action" data-snip="display">DISPLAY</button>
        <button class="menu-action" data-snip="input">INPUT</button>
      </div>
    </div>

    <div class="menu-wrap">
      <button class="menu-trigger">Robot</button>
      <div class="menu-dropdown">
        <button class="menu-action" data-snip="robot-setup">Tilemap + SPAWN</button>
        <button class="menu-action" data-snip="robot-move">MOVE_FORWARD</button>
        <button class="menu-action" data-snip="robot-rotate">ROTATE_LEFT / RIGHT</button>
        <button class="menu-action" data-snip="robot-canmove">CAN_MOVE check</button>
        <button class="menu-action" data-snip="robot-nav">Navigate to wall</button>
      </div>
    </div>

    <div class="menu-wrap">
      <button class="menu-trigger">Tools</button>
      <div class="menu-dropdown">
        <button class="menu-action" id="me-open-btn">Map Editor ⊞</button>
        <button class="menu-action" id="lsm-open-btn">Storage ⛁</button>
        <button class="menu-action" id="ar-open-btn">Arduino ⚡</button>
        <div class="menu-sep"></div>
        <button class="menu-action" id="autocb-toggle">
          <span>Auto-Brackets</span>
          <span class="menu-kbd" id="autocb-indicator">ON</span>
        </button>
      </div>
    </div>

    <div class="menu-wrap">
      <button class="menu-trigger">Packages</button>
      <div class="menu-dropdown">
        <div class="menu-group">Import</div>
        <button class="menu-action" data-snip="pkg-math">math — SQRT ABS FLOOR CEIL POW</button>
        <button class="menu-action" data-snip="pkg-stats">stats — MIN MAX SUM MEAN</button>
        <button class="menu-action" data-snip="pkg-turtle">turtle — FORWARD LEFT RIGHT…</button>
        <button class="menu-action" data-snip="pkg-string">string — UPPER LOWER SPLIT…</button>
        <div class="menu-sep"></div>
        <div class="menu-group">Examples</div>
        <button class="menu-action" data-snip="pkg-math-ex">Math example</button>
        <button class="menu-action" data-snip="pkg-stats-ex">Stats example</button>
        <button class="menu-action" data-snip="pkg-turtle-ex">Turtle square</button>
        <button class="menu-action" data-snip="pkg-string-ex">String example</button>
      </div>
    </div>

    <div class="menu-wrap">
      <button class="menu-trigger">Debug</button>
      <div class="menu-dropdown">
        <button class="menu-action" id="va-open-btn">VAX-126 ⚙</button>
      </div>
    </div>

    <div class="menu-wrap">
      <button class="menu-trigger">Help</button>
      <div class="menu-dropdown">
        <button class="menu-action" id="help-ref-btn">Reference Sheet</button>
      </div>
    </div>

    <button class="menu-run" id="run-btn">▶ Run <span class="menu-kbd" style="opacity:.5">Ctrl+↵</span></button>

  </div>

  <div class="runner-layout">

    <div class="editor-wrap">
      <div class="pane-label">Editor — use ← or &lt;- for assignment</div>
      <textarea id="editor"></textarea>
    </div>

    <div class="right-pane">
      <div class="io-box" style="flex:1">
        <div class="pane-label">Output</div>
        <div class="output-area" id="output"><span class="out-info">// Output appears here</span></div>
      </div>
    </div>

    <!-- Robot Panel — 3rd grid column, appears beside output -->
    <div class="robot-panel" id="robot-panel" style="display:none">
      <div class="pane-label">Tilemap</div>
      <canvas id="robot-canvas"></canvas>
      <div class="robot-controls">
        <span>Speed:</span>
        <input type="range" class="robot-speed" id="robot-speed" min="50" max="800" value="300">
        <button class="tb-btn" id="robot-replay" style="padding:.2rem .55rem;font-size:.73rem">↺</button>
        <span id="robot-status" style="margin-left:auto;font-size:.72rem;color:#00ff41"></span>
      </div>
    </div>

    <!-- Turtle Panel — appears when turtle package is imported -->
    <div class="robot-panel" id="turtle-panel" style="display:none">
      <div class="pane-label">Turtle Canvas</div>
      <canvas id="turtle-canvas" width="300" height="280"></canvas>
      <div class="robot-controls">
        <button class="tb-btn" id="turtle-clear-btn" style="padding:.2rem .55rem;font-size:.73rem">Clear</button>
      </div>
    </div>

  </div>

  <!-- Input Modal -->
  <div class="input-modal-overlay" id="input-modal">
    <div class="input-modal-box">
      <div class="input-modal-title">▶ INPUT()</div>
      <div class="input-modal-label" id="input-modal-label">Enter a value</div>
      <input type="text" class="input-modal-field" id="input-modal-field"
             autocomplete="off" spellcheck="false" placeholder="42 / 3.14 / TRUE / hello">
      <button class="tb-btn run input-modal-ok" id="input-modal-ok">OK &nbsp;↵</button>
    </div>
  </div>

  <!-- Local Storage Manager -->
  <div class="lsm-overlay" id="lsm-modal">
    <div class="lsm-box">
      <div class="lsm-header">
        <h3>⛁ Local Storage</h3>
        <div style="display:flex;gap:.5rem">
          <button class="tb-btn me-sm me-del" id="lsm-clear-btn">Clear All</button>
          <button class="tb-btn me-sm" id="lsm-close-btn">✕</button>
        </div>
      </div>
      <div id="lsm-table"></div>
    </div>
  </div>

  <!-- Help Modal -->
  <div class="help-overlay" id="help-modal">
    <div class="help-box">
      <div class="help-header">
        <h3>Quick Reference</h3>
        <button class="tb-btn me-sm" id="help-close-btn">✕</button>
      </div>
      <div class="ref-grid">
        <div class="ref-item"><span class="ref-kw">IF</span> <code>(cond) { } ELSE { }</code></div>
        <div class="ref-item"><span class="ref-kw">REPEAT</span> <code>n TIMES { }</code></div>
        <div class="ref-item"><span class="ref-kw">REPEAT UNTIL</span> <code>(cond) { }</code></div>
        <div class="ref-item"><span class="ref-kw">FOR EACH</span> <code>x IN list { }</code></div>
        <div class="ref-item"><span class="ref-kw">PROCEDURE</span> <code>name(p1, p2) { }</code></div>
        <div class="ref-item"><span class="ref-kw">RETURN</span><code>(expr)</code></div>
        <div class="ref-item">Assignment: <code>x ← value</code> &nbsp;or&nbsp; <code>x &lt;- value</code></div>
        <div class="ref-item">List: <code>a ← [1, 2, 3]</code> &nbsp; <code>a[1]</code> (1-indexed)</div>
        <div class="ref-item"><span class="ref-bi">DISPLAY</span><code>(v1, v2, …)</code> — space-joined</div>
        <div class="ref-item"><span class="ref-bi">INPUT</span><code>()</code> — pops a modal prompt</div>
        <div class="ref-item"><span class="ref-bi">RANDOM</span><code>(a, b)</code> — inclusive</div>
        <div class="ref-item"><span class="ref-bi">APPEND</span><code>(list, val)</code></div>
        <div class="ref-item"><span class="ref-bi">INSERT</span><code>(list, i, val)</code></div>
        <div class="ref-item"><span class="ref-bi">REMOVE</span><code>(list, i)</code></div>
        <div class="ref-item"><span class="ref-bi">LENGTH</span><code>(list)</code></div>
        <div class="ref-item">Ops: <span class="ref-op">MOD  AND  OR  NOT</span></div>
        <div class="ref-item">Compare: <code>= ≠ &lt; &gt; &lt;= &gt;=</code></div>
        <div class="ref-item">Boolean: <code>TRUE</code> &nbsp; <code>FALSE</code></div>
        <div class="ref-item">Comment: <code>// this is a comment</code></div>
        <div class="ref-item"><span class="ref-kw">FROM LOCAL IMPORT</span> <code>name</code> — load saved value</div>
        <div class="ref-item"><span class="ref-kw">TO LOCAL SAVE</span> <code>name</code> — persist any variable</div>
        <div class="ref-item"><span class="ref-kw">LIST LOCAL</span> — print all saved keys &amp; previews</div>
        <div class="ref-item"><span class="ref-kw">DELETE LOCAL</span> <code>name</code> — remove one entry</div>
        <div class="ref-item"><span class="ref-bi">RENDER</span><code>(map)</code> — draw tilemap (1=wall 0=open)</div>
        <div class="ref-item"><span class="ref-bi">SPAWN</span><code>(map, row, col)</code> — place robot (1-indexed)</div>
        <div class="ref-item"><span class="ref-bi">MOVE_FORWARD</span><code>()</code> — move one cell forward</div>
        <div class="ref-item"><span class="ref-bi">ROTATE_LEFT</span><code>()</code> / <span class="ref-bi">ROTATE_RIGHT</span><code>()</code></div>
        <div class="ref-item"><span class="ref-bi">CAN_MOVE</span><code>("forward"|"left"|"right"|"backward")</code></div>
      </div>
      <div style="border-top:1px solid rgba(0,255,65,.1);margin:.4rem 0"></div>
      <div style="font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:#3a6a3a;padding-bottom:.3rem">Packages — FROM LOCAL.PKG IMPORT name</div>
      <div class="ref-grid">
        <div class="ref-item"><span class="ref-kw">math</span> — <span class="ref-bi">SQRT ABS FLOOR CEIL POW</span><code>(x)</code> / <code>(x,y)</code></div>
        <div class="ref-item"><span class="ref-kw">stats</span> — <span class="ref-bi">MIN MAX SUM MEAN</span><code>(list)</code></div>
        <div class="ref-item"><span class="ref-kw">turtle</span> — <span class="ref-bi">FORWARD BACKWARD</span><code>(n)</code> &nbsp; <span class="ref-bi">LEFT RIGHT</span><code>(deg)</code></div>
        <div class="ref-item"><span class="ref-bi">PEN_UP PEN_DOWN COLOR CLEAR</span> — turtle pen control</div>
        <div class="ref-item"><span class="ref-kw">string</span> — <span class="ref-bi">UPPER LOWER</span><code>(s)</code></div>
        <div class="ref-item"><span class="ref-bi">SUBSTRING</span><code>(s, start, len)</code> &nbsp; <span class="ref-bi">CONTAINS</span><code>(s, sub)</code> &nbsp; <span class="ref-bi">SPLIT</span><code>(s, delim)</code></div>
      </div>
    </div>
  </div>

  <!-- Map Editor Modal -->
  <div class="mapeditor-overlay" id="mapeditor-modal">
    <div class="mapeditor-box">
      <div class="me-header">
        <h3>⊞ Map Editor</h3>
        <button class="tb-btn me-sm" id="me-close-btn">✕</button>
      </div>
      <div class="me-controls">
        <label>Rows <input type="number" id="me-rows" value="5" min="2" max="24"></label>
        <label>Cols <input type="number" id="me-cols" value="5" min="2" max="24"></label>
        <label>Name <input type="text"   id="me-name" value="myMap" placeholder="map name"></label>
      </div>
      <div class="me-section-label">Click or drag to toggle walls</div>
      <div id="me-grid"></div>
      <div class="me-actions">
        <button class="tb-btn run" id="me-save-btn">Save to Local</button>
        <button class="tb-btn"     id="me-insert-btn">Insert IMPORT</button>
      </div>
      <div class="me-section-label">Saved Maps</div>
      <div id="me-saved-list"></div>
    </div>
  </div>

  <!-- Virtual Arduino Overlay -->
  <div class="va-overlay" id="va-modal">
    <div class="va-box">
      <div class="va-header">
        <!-- VAX-126 chip badge -->
        <svg width="420" height="56" viewBox="0 0 420 56" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0" aria-label="VAX-126 · Virtual Arduino eXtended">
          <defs>
            <linearGradient id="vaxShine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#00ff41" stop-opacity="0.1"/>
              <stop offset="100%" stop-color="#00ff41" stop-opacity="0"/>
            </linearGradient>
            <filter id="vaxGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <!-- Left pins (6) -->
          <rect x="0"  y="5"    width="32" height="6" rx="2" fill="#1a4a1a"/>
          <rect x="0"  y="15"   width="32" height="6" rx="2" fill="#1a4a1a"/>
          <rect x="0"  y="25"   width="32" height="6" rx="2" fill="#1a4a1a"/>
          <rect x="0"  y="35"   width="32" height="6" rx="2" fill="#1a4a1a"/>
          <rect x="0"  y="45"   width="32" height="6" rx="2" fill="#1a4a1a"/>
          <!-- Pin highlight lines -->
          <line x1="0" y1="8"  x2="32" y2="8"  stroke="rgba(0,255,65,0.15)" stroke-width="1"/>
          <line x1="0" y1="18" x2="32" y2="18" stroke="rgba(0,255,65,0.15)" stroke-width="1"/>
          <line x1="0" y1="28" x2="32" y2="28" stroke="rgba(0,255,65,0.15)" stroke-width="1"/>
          <line x1="0" y1="38" x2="32" y2="38" stroke="rgba(0,255,65,0.15)" stroke-width="1"/>
          <line x1="0" y1="48" x2="32" y2="48" stroke="rgba(0,255,65,0.15)" stroke-width="1"/>
          <!-- Chip body -->
          <rect x="32" y="0" width="356" height="56" rx="6" fill="#010d01" stroke="rgba(0,255,65,0.5)" stroke-width="1.2"/>
          <rect x="32" y="0" width="356" height="56" rx="6" fill="url(#vaxShine)"/>
          <!-- Inner border detail -->
          <rect x="35" y="3" width="350" height="50" rx="4" fill="none" stroke="rgba(0,255,65,0.08)" stroke-width="0.7"/>
          <!-- Pin-1 notch -->
          <path d="M46 0 A8 8 0 0 1 62 0" fill="#000904" stroke="rgba(0,255,65,0.25)" stroke-width="1"/>
          <!-- Pin-1 dot -->
          <circle cx="40" cy="46" r="2.5" fill="none" stroke="rgba(0,255,65,0.3)" stroke-width="1"/>

          <!-- Arduino logo — overlapping rings (larger) -->
          <circle cx="72"  cy="28" r="16" fill="none" stroke="#00979D" stroke-width="3.5" opacity="0.95" filter="url(#vaxGlow)"/>
          <circle cx="98"  cy="28" r="16" fill="none" stroke="#00979D" stroke-width="3.5" opacity="0.95" filter="url(#vaxGlow)"/>
          <!-- A inside left ring -->
          <text x="64" y="33" font-family="Arial,sans-serif" font-size="16" font-weight="900" fill="#00979D" opacity="0.85">A</text>

          <!-- VAX-126 -->
          <text x="126" y="26"
                font-family="'Courier New',monospace" font-size="22" font-weight="bold"
                fill="#00ff41" letter-spacing="3" filter="url(#vaxGlow)">VAX-126</text>
          <!-- Virtual Arduino eXtended - 126 -->
          <text x="127" y="44"
                font-family="'Courier New',monospace" font-size="12"
                fill="#00ff41" opacity="0.5" letter-spacing="0.8">Virtual Arduino eXtended - 126</text>

          <!-- Decorative circuit traces (right side) -->
          <line x1="318" y1="12" x2="372" y2="12" stroke="rgba(0,255,65,0.14)" stroke-width="1.2"/>
          <line x1="318" y1="28" x2="380" y2="28" stroke="rgba(0,255,65,0.14)" stroke-width="1.2"/>
          <line x1="318" y1="44" x2="372" y2="44" stroke="rgba(0,255,65,0.14)" stroke-width="1.2"/>
          <!-- Trace corner bends -->
          <polyline points="372,12 378,12 378,18" fill="none" stroke="rgba(0,255,65,0.12)" stroke-width="1.2"/>
          <polyline points="372,44 378,44 378,38" fill="none" stroke="rgba(0,255,65,0.12)" stroke-width="1.2"/>
          <!-- Solder dots -->
          <circle cx="372" cy="12" r="2.5" fill="rgba(0,255,65,0.32)"/>
          <circle cx="380" cy="28" r="2.5" fill="rgba(0,255,65,0.32)"/>
          <circle cx="372" cy="44" r="2.5" fill="rgba(0,255,65,0.32)"/>
          <circle cx="378" cy="18" r="1.8" fill="rgba(0,255,65,0.2)"/>
          <circle cx="378" cy="38" r="1.8" fill="rgba(0,255,65,0.2)"/>

          <!-- Right pins (6) -->
          <rect x="388" y="5"  width="32" height="6" rx="2" fill="#1a4a1a"/>
          <rect x="388" y="15" width="32" height="6" rx="2" fill="#1a4a1a"/>
          <rect x="388" y="25" width="32" height="6" rx="2" fill="#1a4a1a"/>
          <rect x="388" y="35" width="32" height="6" rx="2" fill="#1a4a1a"/>
          <rect x="388" y="45" width="32" height="6" rx="2" fill="#1a4a1a"/>
          <line x1="388" y1="8"  x2="420" y2="8"  stroke="rgba(0,255,65,0.15)" stroke-width="1"/>
          <line x1="388" y1="18" x2="420" y2="18" stroke="rgba(0,255,65,0.15)" stroke-width="1"/>
          <line x1="388" y1="28" x2="420" y2="28" stroke="rgba(0,255,65,0.15)" stroke-width="1"/>
          <line x1="388" y1="38" x2="420" y2="38" stroke="rgba(0,255,65,0.15)" stroke-width="1"/>
          <line x1="388" y1="48" x2="420" y2="48" stroke="rgba(0,255,65,0.15)" stroke-width="1"/>
        </svg>
        <button class="tb-btn me-sm" id="va-close-btn" style="align-self:flex-start">✕</button>
      </div>
      <div style="display:flex;align-items:center;gap:.8rem;flex-wrap:wrap">
        <span class="va-status" id="va-status">Ready — press Run to test</span>
      </div>
      <div class="va-toolbar">
        <button class="tb-btn run" id="va-run-btn">▶ Run Test</button>
        <span style="font-size:.72rem;opacity:.5">Speed:</span>
        <input type="range" class="robot-speed" id="va-speed" min="50" max="800" value="300">
        <button class="tb-btn" id="va-replay-btn" style="padding:.2rem .55rem;font-size:.73rem">↺ Replay</button>
        <span class="va-step-info" id="va-step-info"></span>
      </div>
      <div class="va-layout">
        <div class="va-canvas-panel">
          <div class="pane-label">Tilemap</div>
          <canvas id="va-canvas"></canvas>
        </div>
        <div class="va-serial-panel">
          <div class="pane-label">Serial Monitor</div>
          <div class="va-serial-output" id="va-serial"><span style="opacity:.35">// Serial output appears here</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Arduino Connection Modal -->
  <div class="ar-overlay" id="ar-modal">
    <div class="ar-box">
      <div class="ar-header">
        <h3>⚡ Arduino Connection</h3>
        <button class="tb-btn me-sm" id="ar-close-btn">✕</button>
      </div>
      <div class="ar-status-row">
        <span class="ar-status-dot" id="ar-status-dot"></span>
        <span class="ar-status-text" id="ar-status-text">Disconnected</span>
      </div>
      <button class="tb-btn" id="ar-connect-btn">Connect via USB</button>
      <div class="ar-section-label">Mode</div>
      <div class="ar-mode-row">
        <button class="tb-btn ar-mode-btn ar-mode-active" id="ar-mode-sim"   data-mode="browser">Simulate</button>
        <button class="tb-btn ar-mode-btn"                id="ar-mode-flash" data-mode="cpp">Flash to Arduino</button>
      </div>
      <button class="tb-btn" id="ar-view-cpp-btn">View Generated C++</button>
      <div class="ar-cpp-panel" id="ar-cpp-panel" style="display:none">
        <pre class="ar-cpp-pre" id="ar-cpp-pre"></pre>
      </div>
    </div>
  </div>


</div>

<script>
// ════════════════════════════════════════════════
//  1. CodeMirror Custom Mode
// ════════════════════════════════════════════════
CodeMirror.defineMode('apcsp', function () {
  const KW = /^(IF|ELSE|REPEAT|TIMES|UNTIL|FOR|EACH|IN|PROCEDURE|RETURN|FROM|LOCAL|IMPORT|TO|SAVE|LIST|DELETE)\b/;
  const BI = /^(DISPLAY|INPUT|RANDOM|APPEND|INSERT|REMOVE|LENGTH|RENDER|SPAWN|MOVE_FORWARD|ROTATE_LEFT|ROTATE_RIGHT|CAN_MOVE|SQRT|ABS|FLOOR|CEIL|POW|MIN|MAX|SUM|MEAN|UPPER|LOWER|SUBSTRING|CONTAINS|SPLIT|FORWARD|BACKWARD|LEFT|RIGHT|PEN_UP|PEN_DOWN|COLOR|CLEAR)\b/;
  const OP = /^(AND|OR|NOT|MOD)\b/;
  const AT = /^(TRUE|FALSE)\b/;

  return {
    token(stream) {
      if (stream.eatSpace()) return null;

      if (stream.match('//')) { stream.skipToEnd(); return 'comment'; }

      if (stream.match(/^"[^"]*"/)) return 'string';
      if (stream.match(/^'[^']*'/)) return 'string';

      if (stream.match(/^[0-9]+(\.[0-9]+)?/)) return 'number';

      if (stream.match('←') || stream.match('<-') || stream.match('≠') ||
          stream.match('≤') || stream.match('≥') ||
          stream.match('<=') || stream.match('>=') ||
          stream.match(/^[+\-*\/=<>]/)) return 'operator';

      if (stream.match(AT)) return 'atom';
      if (stream.match(KW)) return 'keyword';
      if (stream.match(BI)) return 'builtin';
      if (stream.match(OP)) return 'operator';

      if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) return 'variable';

      stream.next();
      return null;
    }
  };
});

const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
  mode: 'apcsp',
  lineNumbers: true,
  indentWithTabs: false,
  indentUnit: 4,
  tabSize: 4,
  autoCloseBrackets: true,
  extraKeys: { Tab: cm => cm.replaceSelection('    ') },
});

// ════════════════════════════════════════════════
//  2. Tokenizer
// ════════════════════════════════════════════════
const TT = {
  NUM:'NUM', STR:'STR', BOOL:'BOOL', IDENT:'IDENT',
  ASSIGN:'ASSIGN',
  PLUS:'PLUS', MINUS:'MINUS', STAR:'STAR', SLASH:'SLASH',
  MOD:'MOD', AND:'AND', OR:'OR', NOT:'NOT',
  EQ:'EQ', NEQ:'NEQ', LT:'LT', GT:'GT', LTE:'LTE', GTE:'GTE',
  LPAREN:'LPAREN', RPAREN:'RPAREN',
  LBRACE:'LBRACE', RBRACE:'RBRACE',
  LBRACKET:'LBRACKET', RBRACKET:'RBRACKET',
  COMMA:'COMMA',
  IF:'IF', ELSE:'ELSE', REPEAT:'REPEAT', TIMES:'TIMES', UNTIL:'UNTIL',
  FOR:'FOR', EACH:'EACH', IN:'IN',
  PROCEDURE:'PROCEDURE', RETURN:'RETURN',
  DISPLAY:'DISPLAY', INPUT:'INPUT', RANDOM:'RANDOM',
  APPEND:'APPEND', INSERT:'INSERT', REMOVE:'REMOVE', LENGTH:'LENGTH',
  RENDER:'RENDER', SPAWN:'SPAWN',
  MOVE_FORWARD:'MOVE_FORWARD', ROTATE_LEFT:'ROTATE_LEFT', ROTATE_RIGHT:'ROTATE_RIGHT',
  CAN_MOVE:'CAN_MOVE',
  FROM:'FROM', LOCAL:'LOCAL', IMPORT:'IMPORT',
  TO:'TO', SAVE:'SAVE',
  LIST:'LIST', DELETE:'DELETE',
  EOF:'EOF'
};

const KEYWORDS = {
  IF:TT.IF, ELSE:TT.ELSE, REPEAT:TT.REPEAT, TIMES:TT.TIMES, UNTIL:TT.UNTIL,
  FOR:TT.FOR, EACH:TT.EACH, IN:TT.IN,
  PROCEDURE:TT.PROCEDURE, RETURN:TT.RETURN,
  AND:TT.AND, OR:TT.OR, NOT:TT.NOT, MOD:TT.MOD,
  TRUE:TT.BOOL, FALSE:TT.BOOL,
  DISPLAY:TT.DISPLAY, INPUT:TT.INPUT, RANDOM:TT.RANDOM,
  APPEND:TT.APPEND, INSERT:TT.INSERT, REMOVE:TT.REMOVE, LENGTH:TT.LENGTH,
  RENDER:TT.RENDER, SPAWN:TT.SPAWN,
  MOVE_FORWARD:TT.MOVE_FORWARD, ROTATE_LEFT:TT.ROTATE_LEFT, ROTATE_RIGHT:TT.ROTATE_RIGHT,
  CAN_MOVE:TT.CAN_MOVE,
  FROM:TT.FROM, LOCAL:TT.LOCAL, IMPORT:TT.IMPORT,
  TO:TT.TO, SAVE:TT.SAVE,
  LIST:TT.LIST, DELETE:TT.DELETE
};

// Builtin function names require exact uppercase to avoid colliding with user variables
// (e.g. `input`, `length` stay as IDENTs; `INPUT`, `LENGTH` become builtins)
const CASE_SENSITIVE_KW = new Set([
  'DISPLAY','INPUT','RANDOM','APPEND','INSERT','REMOVE','LENGTH',
  'RENDER','SPAWN','MOVE_FORWARD','ROTATE_LEFT','ROTATE_RIGHT','CAN_MOVE'
]);

class Token {
  constructor(type, value, line) { this.type=type; this.value=value; this.line=line; }
}

function tokenize(src) {
  const tokens = [];
  let pos = 0, line = 1;

  const peek = (n=0) => src[pos+n];
  const adv  = () => { const c=src[pos++]; if(c==='\n') line++; return c; };
  const skip = () => { while(pos<src.length && /[ \t\r]/.test(peek())) adv(); };

  while (pos < src.length) {
    skip();
    if (pos >= src.length) break;
    const ch = peek(), ln = line;

    // Comments
    if (ch==='/' && peek(1)==='/') { while(pos<src.length && peek()!=='\n') adv(); continue; }

    // Newlines
    if (ch==='\n') { adv(); continue; }

    // Strings
    if (ch==='"' || ch==='"' || ch==='"') {
      adv();
      let s='';
      while(pos<src.length && peek()!=='"' && peek()!=='"') s+=adv();
      adv();
      tokens.push(new Token(TT.STR, s, ln));
      continue;
    }

    // Numbers
    if (/[0-9]/.test(ch)) {
      let n='';
      while(pos<src.length && /[0-9.]/.test(peek())) n+=adv();
      tokens.push(new Token(TT.NUM, parseFloat(n), ln));
      continue;
    }

    // ← or <-
    if (ch==='←') { adv(); tokens.push(new Token(TT.ASSIGN,'←',ln)); continue; }
    if (ch==='<' && peek(1)==='-') { adv();adv(); tokens.push(new Token(TT.ASSIGN,'←',ln)); continue; }

    // ≠ ≤ ≥
    if (ch==='≠') { adv(); tokens.push(new Token(TT.NEQ,'≠',ln)); continue; }
    if (ch==='≤') { adv(); tokens.push(new Token(TT.LTE,'≤',ln)); continue; }
    if (ch==='≥') { adv(); tokens.push(new Token(TT.GTE,'≥',ln)); continue; }

    // Two-char ops
    if (ch==='<' && peek(1)==='=') { adv();adv(); tokens.push(new Token(TT.LTE,'<=',ln)); continue; }
    if (ch==='>' && peek(1)==='=') { adv();adv(); tokens.push(new Token(TT.GTE,'>=',ln)); continue; }

    // Single char
    const singles = {'+':TT.PLUS,'-':TT.MINUS,'*':TT.STAR,'/':TT.SLASH,
      '<':TT.LT,'>':TT.GT,'=':TT.EQ,
      '(':TT.LPAREN,')':TT.RPAREN,'{':TT.LBRACE,'}':TT.RBRACE,
      '[':TT.LBRACKET,']':TT.RBRACKET,',':TT.COMMA};
    if (singles[ch]) { adv(); tokens.push(new Token(singles[ch],ch,ln)); continue; }

    // Identifiers / keywords
    if (/[a-zA-Z_]/.test(ch)) {
      let id='';
      while(pos<src.length && /[a-zA-Z0-9_]/.test(peek())) id+=adv();
      const up = id.toUpperCase();
      const kw = KEYWORDS[up] && (!CASE_SENSITIVE_KW.has(up) || id === up) ? KEYWORDS[up] : null;
      if (kw) {
        const val = kw===TT.BOOL ? (up==='TRUE') : up;
        tokens.push(new Token(kw, val, ln));
      } else {
        tokens.push(new Token(TT.IDENT, id, ln));
      }
      continue;
    }

    adv(); // skip unknown
  }
  tokens.push(new Token(TT.EOF, null, line));
  return tokens;
}

// ════════════════════════════════════════════════
//  3. Parser
// ════════════════════════════════════════════════
class Parser {
  constructor(tokens) { this.t=tokens; this.i=0; }
  peek()         { return this.t[this.i]; }
  adv()          { return this.t[this.i++]; }
  check(tp)      { return this.peek().type===tp; }
  match(...tps)  { if(tps.includes(this.peek().type)) return this.adv(); return null; }
  expect(tp,msg) {
    if(this.check(tp)) return this.adv();
    const tok=this.peek();
    throw new Error(`Line ${tok.line}: expected ${msg}, got '${tok.value}'`);
  }

  parse() {
    const stmts=[];
    while(!this.check(TT.EOF)) stmts.push(this.stmt());
    return stmts;
  }

  stmt() {
    const tok=this.peek();
    if(tok.type===TT.PROCEDURE)  return this.procDef();
    if(tok.type===TT.IF)         return this.ifStmt();
    if(tok.type===TT.REPEAT)     return this.repeatStmt();
    if(tok.type===TT.FOR)        return this.forEach();
    if(tok.type===TT.RETURN)     return this.returnStmt();
    if(tok.type===TT.DISPLAY)    return this.displayStmt();
    if([TT.APPEND,TT.INSERT,TT.REMOVE,
        TT.RENDER,TT.SPAWN,TT.MOVE_FORWARD,TT.ROTATE_LEFT,TT.ROTATE_RIGHT,TT.CAN_MOVE
       ].includes(tok.type)) return this.builtinStmt();
    if(tok.type===TT.FROM)       return this.fromLocalImport();
    if(tok.type===TT.TO)         return this.toLocalSave();
    if(tok.type===TT.LIST)       return this.listLocal();
    if(tok.type===TT.DELETE)     return this.deleteLocal();
    if(tok.type===TT.IDENT)      return this.assignOrCall();
    throw new Error(`Line ${tok.line}: unexpected '${tok.value}'`);
  }

  fromLocalImport() {
    const ln=this.adv().line;
    this.expect(TT.LOCAL,'LOCAL');
    // FROM LOCAL.PKG IMPORT name  (dot is silently skipped by tokenizer)
    if(this.check(TT.IDENT) && this.peek().value==='PKG'){
      this.adv(); // consume PKG
      this.expect(TT.IMPORT,'IMPORT');
      const name=this.expect(TT.IDENT,'package name').value.toLowerCase();
      return {type:'FromPkgImport',name,line:ln};
    }
    this.expect(TT.IMPORT,'IMPORT');
    const name=this.expect(TT.IDENT,'variable name').value;
    return {type:'FromLocalImport',name,line:ln};
  }

  toLocalSave() {
    const ln=this.adv().line;
    this.expect(TT.LOCAL,'LOCAL');
    this.expect(TT.SAVE,'SAVE');
    const name=this.expect(TT.IDENT,'variable name').value;
    return {type:'ToLocalSave',name,line:ln};
  }

  listLocal() {
    const ln=this.adv().line;
    this.expect(TT.LOCAL,'LOCAL');
    return {type:'ListLocal',line:ln};
  }

  deleteLocal() {
    const ln=this.adv().line;
    this.expect(TT.LOCAL,'LOCAL');
    const name=this.expect(TT.IDENT,'variable name').value;
    return {type:'DeleteLocal',name,line:ln};
  }

  procDef() {
    this.adv();
    const name=this.expect(TT.IDENT,'procedure name').value;
    this.expect(TT.LPAREN,'(');
    const params=[];
    if(!this.check(TT.RPAREN)){
      params.push(this.expect(TT.IDENT,'parameter').value);
      while(this.match(TT.COMMA)) params.push(this.expect(TT.IDENT,'parameter').value);
    }
    this.expect(TT.RPAREN,')');
    return {type:'ProcDef',name,params,body:this.block()};
  }

  ifStmt() {
    this.adv();
    this.expect(TT.LPAREN,'('); const cond=this.expr(); this.expect(TT.RPAREN,')');
    const then=this.block();
    const elseifs=[];
    let elseBranch=null;
    while(this.check(TT.ELSE)){
      this.adv();
      if(this.check(TT.IF)){
        this.adv();
        this.expect(TT.LPAREN,'('); const c=this.expr(); this.expect(TT.RPAREN,')');
        elseifs.push({cond:c,body:this.block()});
      } else { elseBranch=this.block(); break; }
    }
    return {type:'If',cond,then,elseifs,else:elseBranch};
  }

  repeatStmt() {
    this.adv();
    if(this.check(TT.UNTIL)){
      this.adv();
      this.expect(TT.LPAREN,'('); const cond=this.expr(); this.expect(TT.RPAREN,')');
      return {type:'RepeatUntil',cond,body:this.block()};
    }
    const count=this.expr();
    this.expect(TT.TIMES,'TIMES');
    return {type:'RepeatTimes',count,body:this.block()};
  }

  forEach() {
    this.adv();
    this.expect(TT.EACH,'EACH');
    const v=this.expect(TT.IDENT,'variable').value;
    this.expect(TT.IN,'IN');
    const list=this.expr();
    return {type:'ForEach',var:v,list,body:this.block()};
  }

  returnStmt() {
    const ln=this.adv().line;
    this.expect(TT.LPAREN,'('); const val=this.expr(); this.expect(TT.RPAREN,')');
    return {type:'Return',value:val,line:ln};
  }

  displayStmt() {
    const ln=this.adv().line;
    this.expect(TT.LPAREN,'('); const args=this.args(); this.expect(TT.RPAREN,')');
    return {type:'Display',args,line:ln};
  }

  builtinStmt() {
    const tok=this.adv();
    this.expect(TT.LPAREN,'('); const args=this.args(); this.expect(TT.RPAREN,')');
    return {type:'BuiltinStmt',name:tok.value,args,line:tok.line};
  }

  assignOrCall() {
    const tok=this.adv();
    // list index assign: a[i] ←
    if(this.check(TT.LBRACKET)){
      this.adv(); const idx=this.expr(); this.expect(TT.RBRACKET,']');
      this.expect(TT.ASSIGN,'←'); const val=this.expr();
      return {type:'ListAssign',name:tok.value,index:idx,value:val,line:tok.line};
    }
    // regular assign: x ←
    if(this.check(TT.ASSIGN)){
      this.adv(); const val=this.expr();
      return {type:'Assign',name:tok.value,value:val,line:tok.line};
    }
    // call: f(...)
    if(this.check(TT.LPAREN)){
      this.adv(); const args=this.args(); this.expect(TT.RPAREN,')');
      return {type:'Call',name:tok.value,args,line:tok.line};
    }
    throw new Error(`Line ${tok.line}: expected ← or ( after '${tok.value}'`);
  }

  block() {
    this.expect(TT.LBRACE,'{');
    const stmts=[];
    while(!this.check(TT.RBRACE)&&!this.check(TT.EOF)) stmts.push(this.stmt());
    this.expect(TT.RBRACE,'}');
    return stmts;
  }

  args() {
    const a=[];
    if(this.check(TT.RPAREN)) return a;
    a.push(this.expr());
    while(this.match(TT.COMMA)) a.push(this.expr());
    return a;
  }

  // ── Expression precedence ──
  expr()    { return this.or(); }
  or()      { let l=this.and();    while(this.check(TT.OR))  {this.adv();l={type:'BinOp',op:'OR', left:l,right:this.and()};}  return l; }
  and()     { let l=this.not();    while(this.check(TT.AND)) {this.adv();l={type:'BinOp',op:'AND',left:l,right:this.not()};} return l; }
  not()     { if(this.check(TT.NOT)){this.adv();return{type:'UnOp',op:'NOT',expr:this.not()};} return this.compare(); }
  compare() {
    let l=this.add();
    const ops=[TT.EQ,TT.NEQ,TT.LT,TT.GT,TT.LTE,TT.GTE];
    if(ops.includes(this.peek().type)){const op=this.adv().value;l={type:'BinOp',op,left:l,right:this.add()};}
    return l;
  }
  add() {
    let l=this.mul();
    while([TT.PLUS,TT.MINUS].includes(this.peek().type)){const op=this.adv().value;l={type:'BinOp',op,left:l,right:this.mul()};}
    return l;
  }
  mul() {
    let l=this.unary();
    while([TT.STAR,TT.SLASH,TT.MOD].includes(this.peek().type)){const op=this.adv().value;l={type:'BinOp',op,left:l,right:this.unary()};}
    return l;
  }
  unary() { if(this.check(TT.MINUS)){this.adv();return{type:'UnOp',op:'-',expr:this.primary()};} return this.primary(); }

  primary() {
    const tok=this.peek();
    if(tok.type===TT.NUM)  {this.adv();return{type:'Num',value:tok.value};}
    if(tok.type===TT.STR)  {this.adv();return{type:'Str',value:tok.value};}
    if(tok.type===TT.BOOL) {this.adv();return{type:'Bool',value:tok.value};}

    if(tok.type===TT.LPAREN){
      this.adv(); const e=this.expr(); this.expect(TT.RPAREN,')'); return e;
    }

    if(tok.type===TT.LBRACKET){
      this.adv();
      const items=[];
      if(!this.check(TT.RBRACKET)){items.push(this.expr());while(this.match(TT.COMMA))items.push(this.expr());}
      this.expect(TT.RBRACKET,']');
      return{type:'List',items};
    }

    // Built-ins used as expressions
    const BIS=[TT.INPUT,TT.RANDOM,TT.LENGTH,TT.APPEND,TT.INSERT,TT.REMOVE,
               TT.RENDER,TT.SPAWN,TT.MOVE_FORWARD,TT.ROTATE_LEFT,TT.ROTATE_RIGHT,TT.CAN_MOVE];
    if(BIS.includes(tok.type)){
      this.adv(); this.expect(TT.LPAREN,'(');
      const args=this.args(); this.expect(TT.RPAREN,')');
      return{type:'Builtin',name:tok.value,args};
    }

    if(tok.type===TT.IDENT){
      this.adv();
      if(this.check(TT.LPAREN)){
        this.adv(); const args=this.args(); this.expect(TT.RPAREN,')');
        return{type:'Call',name:tok.value,args};
      }
      let node={type:'Var',name:tok.value};
      while(this.check(TT.LBRACKET)){
        this.adv(); const idx=this.expr(); this.expect(TT.RBRACKET,']');
        node={type:'Index',list:node,index:idx};
      }
      return node;
    }

    throw new Error(`Line ${tok.line}: unexpected '${tok.value}'`);
  }
}

// ════════════════════════════════════════════════
//  4. Interpreter
// ════════════════════════════════════════════════
class ReturnSignal { constructor(v){this.value=v;} }

function deepCopy(v) {
  if (Array.isArray(v)) return v.map(deepCopy);
  if (v !== null && typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v)) out[k] = deepCopy(v[k]);
    return out;
  }
  return v;
}

class Interpreter {
  constructor(out) {
    this.scopes          = [{}];
    this.procs           = {};
    this.pkgFns          = {};
    this.out             = out;
    this.steps           = 0;
    this.arduinoImported = false;
  }

  tick() { if(++this.steps>50000) throw new Error('Step limit reached — possible infinite loop'); }

  get(name) {
    for(let i=this.scopes.length-1;i>=0;i--) {
      if(name in this.scopes[i]) return this.scopes[i][name];
    }
    throw new Error(`Undefined variable '${name}'`);
  }

  set(name, val) {
    for(let i=this.scopes.length-1;i>=0;i--) {
      if(name in this.scopes[i]){this.scopes[i][name]=val;return;}
    }
    this.scopes[this.scopes.length-1][name]=val;
  }

  push() { this.scopes.push({}); }
  pop()  { this.scopes.pop(); }

  async run(stmts) {
    for(const s of stmts) await this.exec(s);
  }

  async exec(s) {
    this.tick();
    switch(s.type) {

      case 'Assign': this.set(s.name, await this.eval(s.value)); break;

      case 'ListAssign': {
        const list=this.get(s.name);
        if(!Array.isArray(list)) throw new Error(`'${s.name}' is not a list`);
        const i=await this.eval(s.index);
        if(!Number.isInteger(i)||i<1||i>list.length)
          throw new Error(`Index ${i} out of bounds (length ${list.length}, 1-indexed)`);
        list[i-1]=await this.eval(s.value); break;
      }

      case 'If': {
        if(await this.eval(s.cond)){
          this.push();await this.run(s.then);this.pop();
        } else {
          let done=false;
          for(const ei of s.elseifs){
            if(await this.eval(ei.cond)){this.push();await this.run(ei.body);this.pop();done=true;break;}
          }
          if(!done&&s.else){this.push();await this.run(s.else);this.pop();}
        }
        break;
      }

      case 'RepeatTimes': {
        const n=await this.eval(s.count);
        if(!Number.isFinite(n)||n<0) throw new Error('REPEAT count must be a non-negative number');
        for(let i=0;i<n;i++){this.tick();this.push();await this.run(s.body);this.pop();}
        break;
      }

      case 'RepeatUntil': {
        while(!await this.eval(s.cond)){
          this.tick();
          this.push();await this.run(s.body);this.pop();
        }
        break;
      }

      case 'ForEach': {
        const list=await this.eval(s.list);
        if(!Array.isArray(list)) throw new Error('FOR EACH requires a list');
        for(const item of list){
          this.tick();this.push();
          this.scopes[this.scopes.length-1][s.var]=item;
          await this.run(s.body);this.pop();
        }
        break;
      }

      case 'FromLocalImport': {
        const stored=localStorage.getItem('apcsp_local_'+s.name);
        if(!stored) throw new Error(`FROM LOCAL IMPORT: nothing saved as '${s.name}'. Use TO LOCAL SAVE or the Map Editor.`);
        this.set(s.name, JSON.parse(stored)); break;
      }

      case 'FromPkgImport': {
        await this.loadPackage(s.name); break;
      }

      case 'ToLocalSave': {
        let val;
        try { val=this.get(s.name); }
        catch(e){ throw new Error(`TO LOCAL SAVE: variable '${s.name}' is not defined`); }
        localStorage.setItem('apcsp_local_'+s.name, JSON.stringify(val));
        this.out(`// '${s.name}' saved to local (${Array.isArray(val)?'list':typeof val})`);
        break;
      }

      case 'ListLocal': {
        const keys=Object.keys(localStorage).filter(k=>k.startsWith('apcsp_local_')).sort();
        if(!keys.length){ this.out('// Local storage is empty'); break; }
        this.out('// Local storage:');
        for(const k of keys){
          const name=k.slice('apcsp_local_'.length);
          let raw=localStorage.getItem(k), preview='', type='';
          try {
            const v=JSON.parse(raw);
            type=Array.isArray(v)?`list[${v.length}]`:typeof v;
            preview=Array.isArray(v)?`[${v.slice(0,3).map(r=>Array.isArray(r)?'[…]':r).join(', ')}${v.length>3?', …':''}]`:String(v).slice(0,40);
          } catch { type='raw'; preview=raw.slice(0,40); }
          this.out(`//   ${name}  (${type})  ${preview}`);
        }
        break;
      }

      case 'DeleteLocal': {
        const key='apcsp_local_'+s.name;
        if(!localStorage.getItem(key)) throw new Error(`DELETE LOCAL: nothing saved as '${s.name}'`);
        localStorage.removeItem(key);
        this.out(`// '${s.name}' deleted from local storage`);
        break;
      }

      case 'ProcDef': this.procs[s.name]=s; break;

      case 'Return': throw new ReturnSignal(await this.eval(s.value));

      case 'Display': {
        const vals=[];
        for(const a of s.args) vals.push(await this.eval(a));
        this.out(vals.map(v=>this.fmt(v)).join(' ')); break;
      }

      case 'BuiltinStmt':
      case 'Call': await this.evalCall(s.name, s.args); break;
    }
  }

  async eval(node) {
    switch(node.type){
      case 'Num':  return node.value;
      case 'Str':  return node.value;
      case 'Bool': return node.value;
      case 'Var':  return this.get(node.name);
      case 'List': { const items=[]; for(const i of node.items) items.push(await this.eval(i)); return items; }

      case 'Index': {
        const list=await this.eval(node.list);
        if(!Array.isArray(list)) throw new Error('Subscript on non-list');
        const i=await this.eval(node.index);
        if(!Number.isInteger(i)||i<1||i>list.length)
          throw new Error(`Index ${i} out of bounds (length ${list.length}, 1-indexed)`);
        return list[i-1];
      }

      case 'BinOp': {
        const l=await this.eval(node.left), r=await this.eval(node.right);
        switch(node.op){
          case '+': return (typeof l==='string'||typeof r==='string')? String(l)+String(r): l+r;
          case '-': return l-r;
          case '*': return l*r;
          case '/': if(r===0) throw new Error('Division by zero'); return l/r;
          case 'MOD': return ((l%r)+r)%r;
          case '=':  return l===r;
          case '≠':  return l!==r;
          case '<':  return l<r;
          case '>':  return l>r;
          case '<=': return l<=r;
          case '>=': return l>=r;
          case 'AND': return Boolean(l)&&Boolean(r);
          case 'OR':  return Boolean(l)||Boolean(r);
        }
        break;
      }

      case 'UnOp': {
        const v=await this.eval(node.expr);
        if(node.op==='NOT') return !v;
        if(node.op==='-')   return -v;
        break;
      }

      case 'Builtin': return await this.evalBuiltin(node.name, node.args);
      case 'Call':    return await this.evalCall(node.name, node.args);
    }
    throw new Error('Unknown AST node: '+node.type);
  }

  async evalBuiltin(name, args) {
    const v = [];
    for(const a of args) v.push(await this.eval(a));
    switch(name){
      case 'INPUT': {
        const raw = await showInputModal();
        const line = raw.trim();
        if(/^".*"$/.test(line)||/^'.*'$/.test(line)) return line.slice(1,-1);
        if(/^-?\d+$/.test(line)) return parseInt(line,10);
        const f=Number(line); if(!isNaN(f)&&line!=='') return f;
        if(line==='TRUE') return true;
        if(line==='FALSE') return false;
        return line;
      }
      case 'RANDOM': return Math.floor(Math.random()*(v[1]-v[0]+1))+v[0];
      case 'LENGTH': {
        if(Array.isArray(v[0])) return v[0].length;
        if(typeof v[0]==='string') return v[0].length;
        throw new Error('LENGTH requires a list or string');
      }
      case 'APPEND': {
        if(!Array.isArray(v[0])) throw new Error('APPEND requires a list as first argument');
        v[0].push(v[1]); return v[0];
      }
      case 'INSERT': {
        if(!Array.isArray(v[0])) throw new Error('INSERT requires a list as first argument');
        v[0].splice(v[1]-1,0,v[2]); return v[0];
      }
      case 'REMOVE': {
        if(!Array.isArray(v[0])) throw new Error('REMOVE requires a list as first argument');
        v[0].splice(v[1]-1,1); return v[0];
      }

      // ── Robot commands ──
      case 'RENDER': {
        const map = v[0];
        if(!Array.isArray(map)||!Array.isArray(map[0])) throw new Error('RENDER requires a 2D list');
        robotRecordFrame(map, null, null, null); return;
      }
      case 'SPAWN': {
        const [map,row,col] = v;
        if(!Array.isArray(map)||!Array.isArray(map[0])) throw new Error('SPAWN requires a 2D list as first argument');
        robotInit(map, row-1, col-1);
        robotRecordFrame(map, row-1, col-1, robotDir); return;
      }
      case 'MOVE_FORWARD': {
        if (this.arduinoImported && window.APCSP_RUNTIME === 'cpp' && !arPort)
          throw new Error('Please connect to an arduino');
        robotMove(); return;
      }
      case 'ROTATE_LEFT': {
        if (this.arduinoImported && window.APCSP_RUNTIME === 'cpp' && !arPort)
          throw new Error('Please connect to an arduino');
        robotDir=(robotDir+3)%4; robotRecordFrame(robotMap,robotRow,robotCol,robotDir); return;
      }
      case 'ROTATE_RIGHT': {
        if (this.arduinoImported && window.APCSP_RUNTIME === 'cpp' && !arPort)
          throw new Error('Please connect to an arduino');
        robotDir=(robotDir+1)%4; robotRecordFrame(robotMap,robotRow,robotCol,robotDir); return;
      }
      case 'CAN_MOVE': {
        if (this.arduinoImported && window.APCSP_RUNTIME === 'cpp' && !arPort)
          throw new Error('Please connect to an arduino');
        return robotCanMove(v[0]);
      }
    }
  }

  async evalCall(name, args) {
    const builtins=['INPUT','RANDOM','LENGTH','APPEND','INSERT','REMOVE',
                    'RENDER','SPAWN','MOVE_FORWARD','ROTATE_LEFT','ROTATE_RIGHT','CAN_MOVE'];
    if(builtins.includes(name)) return await this.evalBuiltin(name,args);

    // Package functions loaded via FROM LOCAL.PKG IMPORT
    if(name in this.pkgFns){
      const vals=[];
      for(const a of args) vals.push(deepCopy(await this.eval(a)));
      return this.pkgFns[name].apply(null, vals);
    }

    const proc=this.procs[name];
    if(!proc) throw new Error(`Undefined procedure '${name}'`);
    if(args.length!==proc.params.length)
      throw new Error(`'${name}' expects ${proc.params.length} arg(s), got ${args.length}`);

    const vals=[];
    for(const a of args) vals.push(deepCopy(await this.eval(a)));
    this.push();
    proc.params.forEach((p,i)=>{ this.scopes[this.scopes.length-1][p]=vals[i]; });
    let result=null;
    try { await this.run(proc.body); }
    catch(e){ if(e instanceof ReturnSignal) result=e.value; else throw e; }
    this.pop();
    return result;
  }

  async loadPackage(name) {
    const valid = ['math','stats','turtle','string','arduino'];
    if(!valid.includes(name))
      throw new Error(`Unknown package '${name}'. Available: ${valid.join(', ')}`);

    // Load script if not yet registered
    if(!(window.APCSP_PACKAGES && window.APCSP_PACKAGES[name])){
      await new Promise((resolve, reject) => {
        const s=document.createElement('script');
        s.src = name === 'arduino' ? EXTENDED_PKG_BASE + 'em.js' : PKG_BASE + 'pkg_' + name + '.js';
        s.onload  = resolve;
        s.onerror = () => reject(new Error(`Failed to load package '${name}' from ${s.src}`));
        document.head.appendChild(s);
      });
    }

    const pkg = window.APCSP_PACKAGES && window.APCSP_PACKAGES[name];
    if(!pkg) throw new Error(`Package '${name}' did not register itself correctly`);

    // Register all public functions into pkgFns
    for(const [fn, impl] of Object.entries(pkg)){
      if(!fn.startsWith('_')) this.pkgFns[fn] = impl;
    }

    // Turtle-specific: show canvas panel and init state
    if(name==='turtle') initTurtlePanel(pkg);

    // Arduino-specific: remember it was imported this run
    if(name==='arduino') this.arduinoImported = true;

    this.out(`// Package '${name}' ready`,'out-info');
  }

  fmt(v) {
    if(Array.isArray(v)) return '['+v.map(i=>this.fmt(i)).join(', ')+']';
    if(typeof v==='boolean') return v?'TRUE':'FALSE';
    return String(v);
  }
}

// ════════════════════════════════════════════════
//  5. UI wiring
// ════════════════════════════════════════════════
const PKG_BASE          = '{{ site.baseurl }}/hacks/pseudocode-runner/modules/';
const EXTENDED_PKG_BASE = '{{ site.baseurl }}/hacks/pseudocode-runner/extended-machine/';

const outputEl    = document.getElementById('output');
const runnerLayout = document.querySelector('.runner-layout');

// ── Turtle panel ──
const turtlePanel  = document.getElementById('turtle-panel');
const turtleCanvas = document.getElementById('turtle-canvas');
const turtleCtx    = turtleCanvas.getContext('2d');

function initTurtlePanel(pkg) {
  turtlePanel.style.display = 'flex';
  const hasRobot = robotPanel.style.display !== 'none';
  runnerLayout.style.gridTemplateColumns = hasRobot ? '3fr 2fr 2fr 2fr' : '3fr 2fr 2fr';
  turtleCtx.clearRect(0, 0, turtleCanvas.width, turtleCanvas.height);
  if (pkg && pkg._init) {
    pkg._init({ ctx: turtleCtx, width: turtleCanvas.width, height: turtleCanvas.height });
  }
}

document.getElementById('turtle-clear-btn').addEventListener('click', () => {
  turtleCtx.clearRect(0, 0, turtleCanvas.width, turtleCanvas.height);
  if (window.APCSP_PACKAGES && window.APCSP_PACKAGES.turtle && window.APCSP_PACKAGES.turtle._init) {
    window.APCSP_PACKAGES.turtle._init({ ctx: turtleCtx, width: turtleCanvas.width, height: turtleCanvas.height });
  }
});

function clearOutput() { outputEl.innerHTML=''; }

function showInputModal(label='Enter a value') {
  return new Promise(resolve => {
    const overlay = document.getElementById('input-modal');
    const field   = document.getElementById('input-modal-field');
    const ok      = document.getElementById('input-modal-ok');
    document.getElementById('input-modal-label').textContent = label;
    field.value = '';
    overlay.classList.add('open');
    requestAnimationFrame(() => field.focus());
    function submit() {
      overlay.classList.remove('open');
      ok.onclick = null;
      field.onkeydown = null;
      resolve(field.value);
    }
    ok.onclick = submit;
    field.onkeydown = e => { if(e.key==='Enter') submit(); };
  });
}

function appendOutput(text, cls='') {
  const span = document.createElement('span');
  span.className = 'out-line' + (cls?' '+cls:'');
  span.textContent = text;
  outputEl.appendChild(span);
  outputEl.appendChild(document.createTextNode('\n'));
  outputEl.scrollTop = outputEl.scrollHeight;
}

document.getElementById('run-btn').addEventListener('click', async () => {
  clearOutput();
  robotMap=null; robotRow=0; robotCol=0; robotDir=0; robotFrames=[];
  if(window.APCSP_PACKAGES&&window.APCSP_PACKAGES.arduino) window.APCSP_PACKAGES.arduino._reset();
  else window.APCSP_CPP_OUTPUT=[];
  if(robotAnimTimer) clearTimeout(robotAnimTimer);
  robotPanel.style.display='none';
  turtlePanel.style.display='none';
  runnerLayout.style.gridTemplateColumns='';
  robotStatus.textContent='';
  // Clear turtle canvas for fresh run
  turtleCtx.clearRect(0, 0, turtleCanvas.width, turtleCanvas.height);

  const src = editor.getValue();
  if(!src.trim()){ appendOutput('// Nothing to run','out-info'); return; }

  try {
    const tokens = tokenize(src);
    const ast    = new Parser(tokens).parse();
    window.APCSP_LAST_AST = ast;
    const interp = new Interpreter(appendOutput);
    await interp.run(ast);
    appendOutput('// Done ✓','out-info');
  } catch(e) {
    if (e instanceof ReturnSignal) {
      appendOutput('// Done ✓','out-info');
    } else {
      appendOutput(e.message, 'out-error');
    }
  }

  if(robotFrames.length){
    robotPanel.style.display='flex';
    const hasTurtle = turtlePanel.style.display !== 'none';
    runnerLayout.style.gridTemplateColumns = hasTurtle ? '3fr 2fr 2fr 2fr' : '3fr 2fr 2fr';
    requestAnimationFrame(()=>animateRobot(robotFrames));
  }

  // In cpp mode, auto-generate and show the C++ output after every run
  if (window.APCSP_RUNTIME === 'cpp' && window.APCSP_LAST_AST &&
      window.APCSP_PACKAGES && window.APCSP_PACKAGES.arduino) {
    const pre = document.getElementById('ar-cpp-pre');
    try { pre.textContent = window.APCSP_PACKAGES.arduino._getCpp(); }
    catch (e) { pre.textContent = '// Error generating C++:\n// ' + e.message; }
    document.getElementById('ar-cpp-panel').style.display = 'block';
    document.getElementById('ar-modal').classList.add('open');
  }
});

// ── Snippet blocks ──
const SNIPPETS = {
  'if': `IF (condition) {\n    \n} ELSE IF (condition) {\n    \n} ELSE {\n    \n}`,
  'if-simple': `IF (condition) {\n    \n}`,
  'repeat-times': `REPEAT 10 TIMES {\n    \n}`,
  'repeat-until': `REPEAT UNTIL (condition) {\n    \n}`,
  'for-each': `FOR EACH item IN myList {\n    DISPLAY(item)\n}`,
  'procedure': `PROCEDURE myProcedure(param1, param2) {\n    \n}`,
  'procedure-return': `PROCEDURE myProcedure(param1) {\n    result ← param1\n    RETURN(result)\n}`,
  'list-create': `myList ← [1, 2, 3]\nmyList[1] ← 10\nDISPLAY(LENGTH(myList))`,
  'list-ops': `APPEND(myList, value)\nINSERT(myList, index, value)\nREMOVE(myList, index)\nDISPLAY(LENGTH(myList))`,
  'display': `DISPLAY(value)`,
  'input': `x ← INPUT()`,
  'robot-setup':
`map ← [[1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1],
        [1,0,1,1,0,0,1],
        [1,0,0,0,0,0,1],
        [1,0,0,1,0,0,1],
        [1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1]]
RENDER(map)
SPAWN(map, 2, 2)`,
  'robot-move':   `MOVE_FORWARD()`,
  'robot-rotate': `ROTATE_LEFT()\nROTATE_RIGHT()`,
  'robot-canmove':
`IF (CAN_MOVE("forward")) {\n    MOVE_FORWARD()\n}`,
  'robot-nav':
`REPEAT UNTIL (NOT CAN_MOVE("forward")) {\n    MOVE_FORWARD()\n}`,
  // ── Package import one-liners ──
  'pkg-math':   `FROM LOCAL.PKG IMPORT math`,
  'pkg-stats':  `FROM LOCAL.PKG IMPORT stats`,
  'pkg-turtle': `FROM LOCAL.PKG IMPORT turtle`,
  'pkg-string': `FROM LOCAL.PKG IMPORT string`,
  // ── Package examples ──
  'pkg-math-ex':
`FROM LOCAL.PKG IMPORT math
x ← SQRT(16)
y ← POW(2, 8)
DISPLAY("sqrt(16) =", x)
DISPLAY("2^8 =", y)
DISPLAY("abs(-7) =", ABS(-7))`,
  'pkg-stats-ex':
`FROM LOCAL.PKG IMPORT stats
nums ← [4, 7, 2, 9, 1, 5]
DISPLAY("Min:", MIN(nums))
DISPLAY("Max:", MAX(nums))
DISPLAY("Sum:", SUM(nums))
DISPLAY("Mean:", MEAN(nums))`,
  'pkg-turtle-ex':
`FROM LOCAL.PKG IMPORT turtle
REPEAT 4 TIMES {
    FORWARD(80)
    RIGHT(90)
}`,
  'pkg-string-ex':
`FROM LOCAL.PKG IMPORT string
word ← "Hello World"
DISPLAY(UPPER(word))
DISPLAY(LOWER(word))
DISPLAY(CONTAINS(word, "World"))
DISPLAY(SUBSTRING(word, 1, 5))`,
};

let openMenu = null;
function closeMenus() {
  document.querySelectorAll('.menu-wrap.open').forEach(m => m.classList.remove('open'));
  openMenu = null;
}

document.querySelectorAll('.menu-trigger').forEach(trigger => {
  const wrap = trigger.closest('.menu-wrap');
  trigger.addEventListener('click', e => {
    e.stopPropagation();
    if (openMenu === wrap) { closeMenus(); return; }
    closeMenus(); wrap.classList.add('open'); openMenu = wrap;
  });
  trigger.addEventListener('mouseenter', () => {
    if (openMenu && openMenu !== wrap) { closeMenus(); wrap.classList.add('open'); openMenu = wrap; }
  });
});

document.addEventListener('click', closeMenus);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeMenus(); return; }
  const ctrl = e.ctrlKey || e.metaKey;
  if (!ctrl) return;
  switch (e.key) {
    case 'Enter': e.preventDefault(); document.getElementById('run-btn').click(); break;
    case 's':     e.preventDefault(); document.getElementById('save-file').click(); break;
    case 'o':     e.preventDefault(); document.getElementById('open-file').click(); break;
    case 'l':     e.preventDefault(); document.getElementById('clear-editor').click(); break;
  }
});

document.querySelectorAll('.menu-action[data-snip]').forEach(btn => {
  btn.addEventListener('click', () => {
    closeMenus();
    const snip = SNIPPETS[btn.dataset.snip];
    if (!snip) return;
    const cursor = editor.getCursor();
    const indent = editor.getLine(cursor.line).match(/^(\s*)/)[1];
    const indented = snip.split('\n').map((l, i) => i === 0 ? l : indent + l).join('\n');
    editor.setOption('autoCloseBrackets', false);
    editor.replaceRange('\n' + indent + indented + '\n', {line: cursor.line, ch: editor.getLine(cursor.line).length});
    editor.setOption('autoCloseBrackets', autoCBEnabled);
    editor.focus();
  });
});

// Auto-replace symbol shortcuts
const SYMBOL_MAP = [
  { seq: '<-', rep: '←' },
  { seq: '!=', rep: '≠' },
  { seq: '<=', rep: '≤' },
  { seq: '>=', rep: '≥' },
];

editor.on('change', (cm, change) => {
  if (change.origin !== '+input') return;
  const cursor = cm.getCursor();
  if (cm.getTokenAt(cursor).type === 'string') return;
  const line = cm.getLine(cursor.line);
  const col  = cursor.ch;
  for (const { seq, rep } of SYMBOL_MAP) {
    if (col >= seq.length && line.slice(col - seq.length, col) === seq) {
      cm.replaceRange(rep, {line: cursor.line, ch: col - seq.length}, {line: cursor.line, ch: col});
      break;
    }
  }
});

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                  .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// ════════════════════════════════════════════════
//  6. Robot Engine
// ════════════════════════════════════════════════
const DIRS = [{dr:-1,dc:0},{dr:0,dc:1},{dr:1,dc:0},{dr:0,dc:-1}]; // UP RIGHT DOWN LEFT
const DIR_NAMES = ['up','right','down','left'];
let robotMap=null, robotRow=0, robotCol=0, robotDir=0; // 0=UP
let robotFrames=[];

function robotInit(map,row,col){ robotMap=map; robotRow=row; robotCol=col; robotDir=0; }

function robotRecordFrame(map,row,col,dir){
  robotFrames.push({map:map.map(r=>[...r]), row, col, dir});
}

function robotCanMove(dirStr) {
  if(!robotMap) throw new Error('No robot spawned. Call SPAWN first.');
  let d = robotDir;
  const s = typeof dirStr==='string' ? dirStr.toLowerCase() : 'forward';
  if(s==='forward')  d = robotDir;
  else if(s==='backward') d = (robotDir+2)%4;
  else if(s==='left')     d = (robotDir+3)%4;
  else if(s==='right')    d = (robotDir+1)%4;
  else throw new Error(`CAN_MOVE: unknown direction "${dirStr}". Use "forward","backward","left","right"`);
  const nr = robotRow + DIRS[d].dr;
  const nc = robotCol + DIRS[d].dc;
  if(nr<0||nr>=robotMap.length||nc<0||nc>=robotMap[0].length) return false;
  return robotMap[nr][nc]===0;
}

function robotMove() {
  if(!robotMap) throw new Error('No robot spawned. Call SPAWN first.');
  if(!robotCanMove('forward')) throw new Error('MOVE_FORWARD: robot hit a wall!');
  robotRow += DIRS[robotDir].dr;
  robotCol += DIRS[robotDir].dc;
  robotRecordFrame(robotMap, robotRow, robotCol, robotDir);
}

// ── Canvas rendering ──
const robotCanvas = document.getElementById('robot-canvas');
const rctx = robotCanvas.getContext('2d');
const robotPanel = document.getElementById('robot-panel');
const robotStatus = document.getElementById('robot-status');

function drawFrame(frame) {
  if(!frame) return;
  const {map,row,col,dir} = frame;
  const rows=map.length, cols=map[0].length;
  const cw = robotCanvas.clientWidth  || 200;
  const ch = robotCanvas.clientHeight || 400;
  const CELL = Math.min(Math.floor(ch/rows), Math.floor(cw/cols), 36);
  robotCanvas.width  = cols*CELL;
  robotCanvas.height = rows*CELL;

  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      if(map[r][c]===1){
        rctx.fillStyle='#0a1a0a';
        rctx.fillRect(c*CELL,r*CELL,CELL,CELL);
        rctx.strokeStyle='rgba(0,255,65,0.15)';
        rctx.strokeRect(c*CELL+.5,r*CELL+.5,CELL-1,CELL-1);
      } else {
        rctx.fillStyle='#010d01';
        rctx.fillRect(c*CELL,r*CELL,CELL,CELL);
        rctx.strokeStyle='rgba(0,255,65,0.05)';
        rctx.strokeRect(c*CELL+.5,r*CELL+.5,CELL-1,CELL-1);
      }
    }
  }

  // Draw robot
  if(row!==null && col!==null){
    const cx=col*CELL+CELL/2, cy=row*CELL+CELL/2, sz=CELL*0.38;
    const angle = [0, Math.PI*0.5, Math.PI, Math.PI*1.5][dir];
    rctx.save();
    rctx.translate(cx,cy);
    rctx.rotate(angle);
    // body
    rctx.fillStyle='rgba(0,255,65,0.9)';
    rctx.shadowColor='#00ff41'; rctx.shadowBlur=10;
    rctx.beginPath();
    rctx.moveTo(0,-sz);
    rctx.lineTo(sz*0.7,sz*0.7);
    rctx.lineTo(0,sz*0.3);
    rctx.lineTo(-sz*0.7,sz*0.7);
    rctx.closePath();
    rctx.fill();
    rctx.restore();
  }
}

let robotAnimTimer=null;
function animateRobot(frames, idx=0) {
  if(!frames.length) return;
  const speed = 850 - parseInt(document.getElementById('robot-speed').value);
  drawFrame(frames[idx]);
  robotStatus.textContent = `Step ${idx+1}/${frames.length}`;
  if(idx < frames.length-1){
    robotAnimTimer = setTimeout(()=>animateRobot(frames,idx+1), speed);
  } else {
    robotStatus.textContent = `Done (${frames.length} steps)`;
  }
}

document.getElementById('robot-replay').addEventListener('click',()=>{
  if(robotAnimTimer) clearTimeout(robotAnimTimer);
  if(robotFrames.length) animateRobot(robotFrames);
});

document.getElementById('clear-editor').addEventListener('click', () => {
  editor.setValue(''); clearOutput();
});

// layconf1 — engine identity (execution authority, always wins)
// layconf2 — canonical/types (parsing & serialization expectations, informational)
// layconf3 — runtime metadata (file provenance, integrity)
const FPC_ENGINE = {
  version:   '1.3',
  engine:    'pseudoscript-1.0',
  canonical: 'spaces=insignificant,case=sensitive,arrow=←,whitespace=preserved',
  types:     'string=quoted,integer=-?\\d+,float=numeric,boolean=TRUE|FALSE',
};

let fpcMeta = { layconf1: {}, layconf2: {}, layconf3: {} };

// Checksum: djb2 hash of program body only (content after "---\n").
// Uses UTF-16 code units — deterministic within browser environments.
function fpcChecksum(body) {
  let h = 5381;
  for (let i = 0; i < body.length; i++) h = Math.imul(h, 33) ^ body.charCodeAt(i);
  return (h >>> 0).toString(16).padStart(8, '0');
}

function fpcSerialize(code) {
  const now       = new Date().toISOString();
  const created   = fpcMeta.layconf3.created || now;
  // Prompt for author on first save; preserve existing value on re-save; fall back to empty.
  let author = fpcMeta.layconf3.author;
  if (author === undefined) {
    const ans = prompt('Author name for this file (leave blank to skip):', '');
    author = (ans === null) ? '' : ans.trim();
    fpcMeta.layconf3.author = author;
  }
  const lineCount = code.split('\n').length;
  const checksum  = fpcChecksum(code);

  // Detect package imports in code (informational, stored in layconf2)
  const pkgMatches = [...code.matchAll(/FROM\s+LOCAL\.?PKG\s+IMPORT\s+(\w+)/gi)];
  const pkgList = [...new Set(pkgMatches.map(m => m[1].toLowerCase()))].join(',');

  let out = `FPC:${FPC_ENGINE.version}\n`
    + '[layconf1]\n'
    + `engine:${FPC_ENGINE.engine}\n`
    + '[layconf2]\n'
    + `canonical:${FPC_ENGINE.canonical}\n`
    + `types:${FPC_ENGINE.types}\n`
    + (pkgList ? `packages:${pkgList}\n` : '')
    + '[layconf3]\n'
    + `created:${created}\n`
    + `updated:${now}\n`
    + `lines:${lineCount}\n`
    + `checksum:${checksum}\n`
    + `author:${author}\n`;

  return out + '---\n' + code;
}

function fpcParse(raw) {
  const lines = raw.split('\n');
  let i = 0;

  // Step 1: version line
  if (!lines[i] || !lines[i].startsWith('FPC:')) return raw;
  const version = lines[i].slice(4);
  i++;

  // Step 2: parse layered metadata until "---"
  // layconf2 fields are informational only — FPC_ENGINE is authoritative (Rule 8).
  // Unknown keys silently ignored for forward compatibility.
  fpcMeta = { _version: version, layconf1: {}, layconf2: {}, layconf3: {} };
  let currentLayer = 'layconf3'; // default bucket for untagged keys
  while (i < lines.length && lines[i] !== '---') {
    const line = lines[i];
    if (line === '[layconf1]') { currentLayer = 'layconf1'; }
    else if (line === '[layconf2]') { currentLayer = 'layconf2'; }
    else if (line === '[layconf3]') { currentLayer = 'layconf3'; }
    else {
      const colon = line.indexOf(':');
      if (colon !== -1) fpcMeta[currentLayer][line.slice(0, colon)] = line.slice(colon + 1);
    }
    i++;
  }

  // Step 3: skip separator
  if (lines[i] === '---') i++;

  // Step 4: extract body byte-for-byte (lossless guarantee)
  const body = lines.slice(i).join('\n');

  // Validation — warn but never block loading
  const warns = [];
  const lc3 = fpcMeta.layconf3;
  const lc1 = fpcMeta.layconf1;
  const lc2 = fpcMeta.layconf2;

  // layconf3 required keys
  if (!lc3.created)  warns.push('[layconf3] missing required key: created');
  if (!lc3.lines)    warns.push('[layconf3] missing required key: lines');
  if (!lc3.checksum) warns.push('[layconf3] missing required key: checksum');

  // Line count integrity
  if (lc3.lines) {
    const exp = parseInt(lc3.lines, 10);
    const act = body.split('\n').length;
    if (!isNaN(exp) && exp !== act) warns.push(`[layconf3] lines mismatch: header says ${exp}, body has ${act}`);
  }

  // Checksum integrity
  if (lc3.checksum && fpcChecksum(body) !== lc3.checksum)
    warns.push('[layconf3] checksum mismatch — program body may be corrupted');

  // FPC format version check
  if (version !== FPC_ENGINE.version) {
    if (version < FPC_ENGINE.version) {
      // Older file — load succeeds but show a prominent banner
      setTimeout(() => {
        appendOutput('[FPC] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'out-error');
        appendOutput('[FPC] ⚠  THIS IS AN OLDER FORMAT (FPC:' + version + ')', 'out-error');
        appendOutput('[FPC]    Current runtime: FPC:' + FPC_ENGINE.version, 'out-error');
        appendOutput('[FPC]    Re-save this file (File → Save to File) to upgrade.', 'out-error');
        appendOutput('[FPC] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'out-error');
      }, 0);
    } else {
      // Newer file — runtime may not understand all fields
      warns.push(`FPC version mismatch: file=FPC:${version}, runtime=FPC:${FPC_ENGINE.version} — saved with a newer format; some fields may not be understood`);
    }
  }

  // layconf1 precedence check — engine identity must match runtime
  if (lc1.engine && lc1.engine !== FPC_ENGINE.engine) {
    const hint = lc1.engine < FPC_ENGINE.engine
      ? ' — re-save this file to upgrade it to the current engine'
      : ' — this file was created with a newer engine; some features may not work';
    warns.push(`[layconf1] engine mismatch: file=${lc1.engine}, runtime=${FPC_ENGINE.engine}${hint}`);
  }

  // layconf2 drift check — informational, but flag if different from engine constants
  if (lc2.canonical && lc2.canonical !== FPC_ENGINE.canonical)
    warns.push('[layconf2] canonical drift — engine rules apply');
  if (lc2.types && lc2.types !== FPC_ENGINE.types)
    warns.push('[layconf2] types drift — engine rules apply');

  // Package dependency hint
  if (lc2.packages)
    setTimeout(() => appendOutput(`[FPC] Packages used: ${lc2.packages} (loaded on run)`, 'out-info'), 0);

  if (warns.length) {
    setTimeout(() => warns.forEach(w => appendOutput(`[FPC] ${w}`, 'out-error')), 0);
  }

  return body;
}

document.getElementById('save-file').addEventListener('click', () => {
  const code = editor.getValue();
  const blob = new Blob([fpcSerialize(code)], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'program.fpc';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('open-file').addEventListener('click', () => {
  document.getElementById('file-open-input').click();
});

document.getElementById('file-open-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const isTxt = file.name.toLowerCase().endsWith('.txt');
  const reader = new FileReader();
  reader.onload = ev => {
    editor.setValue(fpcParse(ev.target.result));
    editor.focus();
    if (isTxt) {
      setTimeout(() => {
        appendOutput('[FILE] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'out-error');
        appendOutput('[FILE] ⚠  WARN: FILE MAY NOT WORK AS INTENDED', 'out-error');
        appendOutput('[FILE]    PLEASE RE-SAVE AS .FPC (File → Save to File)', 'out-error');
        appendOutput('[FILE] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'out-error');
      }, 0);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

document.getElementById('load-sample').addEventListener('click', () => {
  editor.setValue(
`// ── Fibonacci sequence ──
n ← 10
a ← 0
b ← 1
REPEAT n TIMES {
    DISPLAY(a)
    temp ← a + b
    a ← b
    b ← temp
}

// ── Sum of a list ──
PROCEDURE sumList(nums) {
    total ← 0
    FOR EACH x IN nums {
        total ← total + x
    }
    RETURN(total)
}

myList ← [4, 7, 2, 9, 1]
DISPLAY("Sum:")
DISPLAY(sumList(myList))
`);
  clearOutput();
});

// ════════════════════════════════════════════════
//  7. Map Editor
// ════════════════════════════════════════════════
const ME_PREFIX = 'apcsp_local_';
let meGrid = [], meRows = 5, meCols = 5;
let meIsPainting = false, mePaintVal = 1;

function meBuildGrid() {
  const next = [];
  for (let r = 0; r < meRows; r++) {
    next.push([]);
    for (let c = 0; c < meCols; c++)
      next[r][c] = (meGrid[r] && meGrid[r][c] !== undefined) ? meGrid[r][c] : 0;
  }
  meGrid = next;
  meRenderGrid();
}

function meRenderGrid() {
  const el = document.getElementById('me-grid');
  el.innerHTML = '';
  el.style.gridTemplateColumns = `repeat(${meCols}, 28px)`;
  for (let r = 0; r < meRows; r++) {
    for (let c = 0; c < meCols; c++) {
      const cell = document.createElement('div');
      cell.className = 'me-cell ' + (meGrid[r][c] ? 'me-wall' : 'me-open');
      cell.addEventListener('mousedown', e => {
        mePaintVal = meGrid[r][c] ? 0 : 1;
        meIsPainting = true;
        meToggle(r, c, mePaintVal);
        e.preventDefault();
      });
      cell.addEventListener('mouseenter', () => { if (meIsPainting) meToggle(r, c, mePaintVal); });
      el.appendChild(cell);
    }
  }
}

function meToggle(r, c, val) {
  meGrid[r][c] = val;
  const cells = document.querySelectorAll('#me-grid .me-cell');
  const idx = r * meCols + c;
  if (cells[idx]) cells[idx].className = 'me-cell ' + (val ? 'me-wall' : 'me-open');
}

document.addEventListener('mouseup', () => { meIsPainting = false; });

function meSave() {
  const name = document.getElementById('me-name').value.trim();
  if (!name) return;
  localStorage.setItem(ME_PREFIX + name, JSON.stringify(meGrid));
  meRefreshList();
}

function meLoad(name) {
  const stored = localStorage.getItem(ME_PREFIX + name);
  if (!stored) return;
  meGrid = JSON.parse(stored);
  meRows = meGrid.length; meCols = meGrid[0].length;
  document.getElementById('me-rows').value = meRows;
  document.getElementById('me-cols').value = meCols;
  document.getElementById('me-name').value = name;
  meRenderGrid();
}

function meDelete(name) {
  localStorage.removeItem(ME_PREFIX + name);
  meRefreshList();
}

function meInsertImport(name) {
  const cur = editor.getCursor();
  editor.replaceRange('FROM LOCAL IMPORT ' + name + '\n', cur);
  editor.focus();
}

function meRefreshList() {
  const list = document.getElementById('me-saved-list');
  list.innerHTML = '';
  const keys = Object.keys(localStorage).filter(k => k.startsWith(ME_PREFIX)).sort();
  if (!keys.length) { list.innerHTML = '<span class="me-empty">No saved maps yet</span>'; return; }
  keys.forEach(k => {
    const name = k.slice(ME_PREFIX.length);
    const row = document.createElement('div');
    row.className = 'me-saved-row';
    const en = escHtml(name);
    row.innerHTML = `<span class="me-saved-name">${en}</span>`;
    const btnLoad = document.createElement('button');
    btnLoad.className = 'tb-btn me-sm'; btnLoad.textContent = 'Load';
    btnLoad.addEventListener('click', () => meLoad(name));
    const btnImport = document.createElement('button');
    btnImport.className = 'tb-btn me-sm'; btnImport.textContent = 'Import';
    btnImport.addEventListener('click', () => meInsertImport(name));
    const btnDel = document.createElement('button');
    btnDel.className = 'tb-btn me-sm me-del'; btnDel.textContent = '✕';
    btnDel.addEventListener('click', () => meDelete(name));
    row.appendChild(btnLoad); row.appendChild(btnImport); row.appendChild(btnDel);
    list.appendChild(row);
  });
}

document.getElementById('me-open-btn').addEventListener('click', () => {
  document.getElementById('mapeditor-modal').classList.add('open');
  meBuildGrid();
  meRefreshList();
});
document.getElementById('me-close-btn').addEventListener('click', () => {
  document.getElementById('mapeditor-modal').classList.remove('open');
});
document.getElementById('me-rows').addEventListener('change', e => {
  meRows = Math.max(2, Math.min(24, parseInt(e.target.value) || 5));
  e.target.value = meRows; meBuildGrid();
});
document.getElementById('me-cols').addEventListener('change', e => {
  meCols = Math.max(2, Math.min(24, parseInt(e.target.value) || 5));
  e.target.value = meCols; meBuildGrid();
});
document.getElementById('me-save-btn').addEventListener('click', meSave);
document.getElementById('me-insert-btn').addEventListener('click', () => {
  const name = document.getElementById('me-name').value.trim();
  if (name) meInsertImport(name);
});

meBuildGrid();

// ════════════════════════════════════════════════
//  8. Local Storage Manager
// ════════════════════════════════════════════════
function lsmTypeOf(v) {
  if(Array.isArray(v)){
    if(v.length && Array.isArray(v[0])) return `map ${v.length}×${v[0].length}`;
    return `list[${v.length}]`;
  }
  return typeof v;
}

function lsmPreview(v) {
  if(Array.isArray(v)){
    if(v.length && Array.isArray(v[0]))
      return v.map(r=>r.map(c=>c?'▪':'·').join('')).join(' / ').slice(0,48);
    return '['+v.slice(0,4).join(', ')+(v.length>4?', …':'')+']';
  }
  return String(v).slice(0,52);
}

function lsmRefresh() {
  const wrap = document.getElementById('lsm-table');
  const keys = Object.keys(localStorage).filter(k=>k.startsWith('apcsp_local_')).sort();
  if(!keys.length){ wrap.innerHTML='<div class="lsm-empty">Nothing saved yet</div>'; return; }

  wrap.innerHTML='';
  const table = document.createElement('div');
  table.className='lsm-table';

  const head = document.createElement('div');
  head.className='lsm-row lsm-thead';
  head.innerHTML='<span>Name</span><span>Type</span><span>Preview</span><span></span>';
  table.appendChild(head);

  keys.forEach(k => {
    const name=k.slice('apcsp_local_'.length);
    let type='?', preview='';
    try { const v=JSON.parse(localStorage.getItem(k)); type=lsmTypeOf(v); preview=lsmPreview(v); }
    catch { type='raw'; preview=localStorage.getItem(k).slice(0,40); }

    const row=document.createElement('div');
    row.className='lsm-row';
    row.innerHTML=
      `<span class="lsm-name">${escHtml(name)}</span>`+
      `<span class="lsm-type">${escHtml(type)}</span>`+
      `<span class="lsm-preview">${escHtml(preview)}</span>`;
    const btnDel=document.createElement('button');
    btnDel.className='tb-btn me-sm me-del'; btnDel.textContent='✕';
    btnDel.addEventListener('click', () => lsmDelete(name));
    row.appendChild(btnDel);
    table.appendChild(row);
  });
  wrap.appendChild(table);
}

function lsmDelete(name) {
  localStorage.removeItem('apcsp_local_'+name);
  lsmRefresh();
  meRefreshList();
}

document.getElementById('lsm-open-btn').addEventListener('click', ()=>{
  document.getElementById('lsm-modal').classList.add('open');
  lsmRefresh();
});
document.getElementById('lsm-close-btn').addEventListener('click', ()=>{
  document.getElementById('lsm-modal').classList.remove('open');
});
document.getElementById('lsm-clear-btn').addEventListener('click', ()=>{
  if(!confirm('Delete ALL local storage entries?')) return;
  Object.keys(localStorage).filter(k=>k.startsWith('apcsp_local_')).forEach(k=>localStorage.removeItem(k));
  lsmRefresh(); meRefreshList();
});

// ════════════════════════════════════════════════
//  9. Auto-Brackets toggle
// ════════════════════════════════════════════════
let autoCBEnabled = true;
const autoCBIndicator = document.getElementById('autocb-indicator');

function updateAutoCBIndicator() {
  autoCBIndicator.textContent = autoCBEnabled ? 'ON' : 'OFF';
  autoCBIndicator.style.color = autoCBEnabled ? '#00ff41' : '#ff5555';
}
updateAutoCBIndicator();

document.getElementById('autocb-toggle').addEventListener('click', () => {
  autoCBEnabled = !autoCBEnabled;
  editor.setOption('autoCloseBrackets', autoCBEnabled);
  updateAutoCBIndicator();
  closeMenus();
});

// ════════════════════════════════════════════════
//  10. Help modal
// ════════════════════════════════════════════════
document.getElementById('help-ref-btn').addEventListener('click', () => {
  closeMenus();
  document.getElementById('help-modal').classList.add('open');
});
document.getElementById('help-close-btn').addEventListener('click', () => {
  document.getElementById('help-modal').classList.remove('open');
});
document.getElementById('help-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});

// ════════════════════════════════════════════════
//  11. Arduino Connection Modal
// ════════════════════════════════════════════════
let arPort = null;

function arSetStatus(state, text) {
  const dot = document.getElementById('ar-status-dot');
  const lbl = document.getElementById('ar-status-text');
  dot.className = 'ar-status-dot' + (state !== 'disconnected' ? ' ' + state : '');
  lbl.textContent = text;
}

document.getElementById('ar-open-btn').addEventListener('click', () => {
  closeMenus();
  document.getElementById('ar-modal').classList.add('open');
});

document.getElementById('ar-close-btn').addEventListener('click', () => {
  document.getElementById('ar-modal').classList.remove('open');
});

document.getElementById('ar-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});

document.getElementById('ar-connect-btn').addEventListener('click', async () => {
  if (!('serial' in navigator)) {
    arSetStatus('disconnected', 'WebSerial not available in this browser');
    return;
  }
  try {
    arPort = await navigator.serial.requestPort();
    await arPort.open({ baudRate: 9600 });
    arSetStatus('connected', 'Connected');
  } catch (e) {
    if (e.name !== 'NotFoundError') arSetStatus('disconnected', 'Connection failed');
    // NotFoundError = user dismissed picker; leave status unchanged
  }
});

document.querySelectorAll('.ar-mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ar-mode-btn').forEach(b => b.classList.remove('ar-mode-active'));
    btn.classList.add('ar-mode-active');
    window.APCSP_RUNTIME = btn.dataset.mode;
  });
});

// ════════════════════════════════════════════════
//  12. Virtual Arduino
// ════════════════════════════════════════════════
const VA_BASE = '{{ site.baseurl }}/hacks/pseudocode-runner/Virtual-Arduino/';
let vaFrames = [], vaAnimTimer = null;

const vaCanvas  = document.getElementById('va-canvas');
const vaCtx     = vaCanvas.getContext('2d');
const vaSerial  = document.getElementById('va-serial');
const vaStepEl  = document.getElementById('va-step-info');
const vaStatEl  = document.getElementById('va-status');

function vaSetStatus(msg, isErr = false) {
  vaStatEl.textContent = msg;
  vaStatEl.style.color = isErr ? '#ff5555' : '#3a6a3a';
}

function vaDrawFrame(frame) {
  if (!frame || !frame.map) return;
  const { map, row, col, dir } = frame;
  const rows = map.length, cols = map[0].length;
  const cw = vaCanvas.clientWidth  || 300;
  const ch = vaCanvas.clientHeight || 300;
  const CELL = Math.min(Math.floor(ch / rows), Math.floor(cw / cols), 36);
  vaCanvas.width  = cols * CELL;
  vaCanvas.height = rows * CELL;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (map[r][c] === 1) {
        vaCtx.fillStyle = '#0a1a0a';
        vaCtx.fillRect(c*CELL, r*CELL, CELL, CELL);
        vaCtx.strokeStyle = 'rgba(0,255,65,0.15)';
        vaCtx.strokeRect(c*CELL+.5, r*CELL+.5, CELL-1, CELL-1);
      } else {
        vaCtx.fillStyle = '#010d01';
        vaCtx.fillRect(c*CELL, r*CELL, CELL, CELL);
        vaCtx.strokeStyle = 'rgba(0,255,65,0.05)';
        vaCtx.strokeRect(c*CELL+.5, r*CELL+.5, CELL-1, CELL-1);
      }
    }
  }
  if (row !== null && col !== null) {
    const cx = col*CELL + CELL/2, cy = row*CELL + CELL/2, sz = CELL*0.38;
    const angle = [0, Math.PI*0.5, Math.PI, Math.PI*1.5][dir];
    vaCtx.save();
    vaCtx.translate(cx, cy); vaCtx.rotate(angle);
    vaCtx.fillStyle = 'rgba(0,255,65,0.9)';
    vaCtx.shadowColor = '#00ff41'; vaCtx.shadowBlur = 10;
    vaCtx.beginPath();
    vaCtx.moveTo(0, -sz); vaCtx.lineTo(sz*0.7, sz*0.7);
    vaCtx.lineTo(0, sz*0.3); vaCtx.lineTo(-sz*0.7, sz*0.7);
    vaCtx.closePath(); vaCtx.fill();
    vaCtx.restore();
  }
}

function vaAnimate(frames, idx = 0) {
  if (!frames.length) return;
  const speed = 850 - parseInt(document.getElementById('va-speed').value);
  vaDrawFrame(frames[idx]);
  vaStepEl.textContent = `Step ${idx + 1} / ${frames.length}`;
  if (idx < frames.length - 1)
    vaAnimTimer = setTimeout(() => vaAnimate(frames, idx + 1), speed);
  else
    vaStepEl.textContent = `Done — ${frames.length} frames`;
}

async function vaLoadScript() {
  if (window.APCSP_VA && window.APCSP_VA.run) return;
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = VA_BASE + 'va.js';
    s.onload  = resolve;
    s.onerror = () => reject(new Error('Failed to load va.js'));
    document.head.appendChild(s);
  });
}

document.getElementById('va-open-btn').addEventListener('click', () => {
  closeMenus();
  document.getElementById('va-modal').classList.add('open');
});

document.getElementById('va-close-btn').addEventListener('click', () => {
  document.getElementById('va-modal').classList.remove('open');
  if (vaAnimTimer) clearTimeout(vaAnimTimer);
});

document.getElementById('va-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.remove('open');
    if (vaAnimTimer) clearTimeout(vaAnimTimer);
  }
});

document.getElementById('va-replay-btn').addEventListener('click', () => {
  if (vaAnimTimer) clearTimeout(vaAnimTimer);
  if (vaFrames.length) vaAnimate(vaFrames);
});

document.getElementById('va-run-btn').addEventListener('click', async () => {
  const ast = window.APCSP_LAST_AST;
  if (!ast || !ast.length) {
    vaSetStatus('Run the program first (▶ Run in the editor)', true);
    return;
  }

  try { await vaLoadScript(); }
  catch (e) { vaSetStatus('Could not load Virtual Arduino engine', true); return; }

  if (vaAnimTimer) clearTimeout(vaAnimTimer);
  vaSerial.innerHTML = '';
  vaStepEl.textContent = '';
  vaSetStatus('Running…');

  const result = window.APCSP_VA.run(ast);

  // ── Serial Monitor ──
  if (result.serial.length) {
    vaSerial.innerHTML = '';
    result.serial.forEach(line => {
      const sp = document.createElement('span');
      sp.className = 'va-serial-line';
      sp.textContent = '> ' + line;
      vaSerial.appendChild(sp);
      vaSerial.appendChild(document.createTextNode('\n'));
    });
  } else {
    vaSerial.innerHTML = '<span style="opacity:.35">// No Serial output</span>';
  }
  if (result.error) {
    const sp = document.createElement('span');
    sp.className = 'va-serial-line va-serial-err';
    sp.textContent = '\n// ERROR: ' + result.error;
    vaSerial.appendChild(sp);
  }
  vaSerial.scrollTop = vaSerial.scrollHeight;

  // ── Tilemap animation ──
  vaFrames = result.frames;
  if (vaFrames.length) {
    vaAnimate(vaFrames);
  } else {
    vaCanvas.width  = vaCanvas.clientWidth  || 280;
    vaCanvas.height = vaCanvas.clientHeight || 280;
    vaCtx.clearRect(0, 0, vaCanvas.width, vaCanvas.height);
    vaCtx.fillStyle = '#3a6a3a';
    vaCtx.font = '13px "Courier New"';
    vaCtx.fillText('No tilemap — add RENDER + SPAWN to your code', 10, 30);
  }

  vaSetStatus(result.error
    ? 'Error after ' + result.steps + ' steps'
    : 'Done — ' + result.steps + ' steps executed',
    !!result.error);
});

document.getElementById('ar-view-cpp-btn').addEventListener('click', () => {
  const panel = document.getElementById('ar-cpp-panel');
  const pre   = document.getElementById('ar-cpp-pre');
  if (panel.style.display === 'none') {
    const pkg = window.APCSP_PACKAGES && window.APCSP_PACKAGES.arduino;
    if (pkg) {
      try { pre.textContent = pkg._getCpp(); }
      catch (e) { pre.textContent = '// Error generating C++:\n// ' + e.message; }
    } else {
      pre.textContent = '// Import the arduino package first:\n// FROM LOCAL.PKG IMPORT arduino';
    }
    panel.style.display = 'block';
  } else {
    panel.style.display = 'none';
  }
});
</script>
