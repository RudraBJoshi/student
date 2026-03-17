---
layout: default
title: OCS Workspace
permalink: /ocsworkspace/
---

<style>
/* Hide navbar by default on this page, slide down when cursor near top */
.site-header {
  transform: translateY(-100%);
  transition: transform 0.25s ease;
  position: fixed !important;
  top: 0; left: 0; right: 0;
  z-index: 10000;
}
.site-header.nav-visible {
  transform: translateY(0);
}
body { padding-top: 0 !important; }
</style>
<script>
(function () {
  const TRIGGER_PX = 8; // px from top that triggers show
  function check(y) {
    const h = document.querySelector('.site-header');
    if (!h) return;
    if (y <= TRIGGER_PX) h.classList.add('nav-visible');
    else h.classList.remove('nav-visible');
  }
  document.addEventListener('mousemove', e => check(e.clientY));
  // also show briefly on touch-top
  document.addEventListener('touchstart', e => check(e.touches[0].clientY), { passive: true });
})();
</script>

<!-- Monaco Editor (VS Code engine) -->
<script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.46.0/min/vs/loader.js"></script>

<style>
/* ── Reset / base ───────────────────────────────────────── */
#ocs-root, #ocs-root * { box-sizing: border-box; margin: 0; padding: 0; }
#ocs-root {
  position: fixed; inset: 0; z-index: 9999;
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 13px;
  --red:    #E05C5C;
  --red2:   #c94a4a;
  --bg:     #0d0d18;
  --surface:#181828;
  --panel:  #1e1e30;
  --border: #2a2a40;
  --text:   #cdd6f4;
  --muted:  #6464a0;
  --accent: #7c6af7;
  --green:  #3ddc84;
  --mono:   'JetBrains Mono','Cascadia Code','Fira Code',monospace;
  background: var(--bg);
  overflow: hidden;
  user-select: none;
}

/* ── Desktop ─────────────────────────────────────────────── */
#ocs-desktop {
  position: absolute; inset: 0 0 40px 0;
  background: radial-gradient(ellipse at 20% 80%, #1a0a1e 0%, #0d0d18 60%);
  overflow: hidden;
}
.ocs-desktop-icon {
  position: absolute;
  display: flex; flex-direction: column; align-items: center;
  gap: 5px; width: 72px; cursor: pointer; padding: 6px 4px;
  border-radius: 6px; color: var(--text); font-size: 11px;
  text-align: center; line-height: 1.3;
}
.ocs-desktop-icon:hover { background: rgba(255,255,255,0.08); }
.ocs-desktop-icon .icon-img { font-size: 28px; line-height: 1; }

/* ── Taskbar ─────────────────────────────────────────────── */
#ocs-taskbar {
  position: absolute; bottom: 0; left: 0; right: 0; height: 40px;
  background: rgba(14,14,24,0.95);
  border-top: 1px solid var(--border);
  display: flex; align-items: center;
  padding: 0 6px; gap: 4px;
  backdrop-filter: blur(12px);
}
#ocs-start-btn {
  height: 30px; min-width: 30px; padding: 0 10px;
  background: var(--red); border: none; border-radius: 5px;
  color: #fff; font-weight: 700; font-size: 12px; letter-spacing: 1px;
  cursor: pointer; display: flex; align-items: center; gap: 5px;
  transition: background 0.15s;
}
#ocs-start-btn:hover { background: var(--red2); }
.ocs-start-logo { font-size: 15px; font-weight: 900; font-family: monospace; }

.ocs-tb-sep { width: 1px; height: 22px; background: var(--border); margin: 0 2px; }

.ocs-tb-btn {
  height: 30px; padding: 0 10px; background: transparent;
  border: 1px solid transparent; border-radius: 5px;
  color: var(--muted); font-size: 12px; cursor: pointer;
  display: flex; align-items: center; gap: 5px;
  transition: all 0.15s; white-space: nowrap;
}
.ocs-tb-btn:hover { background: var(--panel); color: var(--text); border-color: var(--border); }
.ocs-tb-btn.active { background: var(--panel); color: var(--text); border-color: var(--border); }
.ocs-tb-btn.minimized { opacity: 0.5; }

#ocs-clock {
  margin-left: auto; color: var(--text);
  font-size: 12px; padding: 0 8px;
  text-align: right; line-height: 1.4;
}

/* ── Start Menu ──────────────────────────────────────────── */
#ocs-start-menu {
  position: absolute; bottom: 44px; left: 4px;
  width: 320px; background: var(--surface);
  border: 1px solid var(--border); border-radius: 10px;
  padding: 16px; display: none;
  box-shadow: 0 16px 48px rgba(0,0,0,0.6);
}
#ocs-start-menu.open { display: block; }
.ocs-menu-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px; padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.ocs-menu-logo {
  width: 36px; height: 36px; background: var(--red);
  border-radius: 8px; display: flex; align-items: center;
  justify-content: center; font-weight: 900; color: #fff;
  font-size: 13px; font-family: monospace; letter-spacing: -1px;
}
.ocs-menu-title { font-weight: 600; font-size: 14px; color: var(--text); }
.ocs-menu-sub { font-size: 11px; color: var(--muted); }
.ocs-app-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
}
.ocs-app-tile {
  display: flex; flex-direction: column; align-items: center;
  gap: 5px; padding: 10px 6px; border-radius: 8px;
  background: var(--panel); border: 1px solid var(--border);
  cursor: pointer; color: var(--text); transition: all 0.15s;
  font-size: 11px; text-align: center;
}
.ocs-app-tile:hover { background: var(--border); border-color: var(--red); }
.ocs-app-tile .tile-icon { font-size: 22px; line-height: 1; }

/* ── Windows ─────────────────────────────────────────────── */
.ocs-win {
  position: absolute; background: var(--surface);
  border: 1px solid var(--border); border-radius: 10px;
  display: flex; flex-direction: column;
  box-shadow: 0 12px 48px rgba(0,0,0,0.6);
  min-width: 300px; min-height: 200px;
  overflow: hidden;
}
.ocs-win.hidden { display: none; }
.ocs-win.maximized {
  inset: 0 !important; width: auto !important; height: auto !important;
  border-radius: 0; border: none;
}

.ocs-titlebar {
  height: 34px; background: var(--panel);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; padding: 0 10px;
  gap: 8px; cursor: grab; flex-shrink: 0;
}
.ocs-titlebar:active { cursor: grabbing; }
.ocs-win-controls { display: flex; gap: 5px; }
.ocs-wc {
  width: 12px; height: 12px; border-radius: 50%; border: none;
  cursor: pointer; transition: filter 0.15s;
}
.ocs-wc:hover { filter: brightness(1.3); }
.ocs-wc.close  { background: #ff5f57; }
.ocs-wc.min    { background: #febc2e; }
.ocs-wc.max    { background: #28c840; }
.ocs-win-title {
  flex: 1; font-size: 12px; font-weight: 600;
  color: var(--text); letter-spacing: 0.3px;
  display: flex; align-items: center; gap: 6px;
}
.ocs-win-body { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

/* resize handle */
.ocs-resize {
  position: absolute; right: 0; bottom: 0;
  width: 14px; height: 14px; cursor: se-resize;
  background: linear-gradient(135deg, transparent 50%, var(--border) 50%);
}

/* ── Tabs (inside windows) ───────────────────────────────── */
.ocs-tabs {
  display: flex; gap: 2px; padding: 6px 8px 0;
  background: var(--panel); border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.ocs-tab {
  padding: 5px 14px; border-radius: 5px 5px 0 0;
  background: var(--surface); border: 1px solid var(--border);
  border-bottom: none; color: var(--muted);
  cursor: pointer; font-size: 12px; transition: all 0.15s;
  font-family: var(--mono);
}
.ocs-tab:hover { color: var(--text); }
.ocs-tab.active { background: var(--bg); color: var(--red); border-color: var(--border); }

/* ── Editor App ──────────────────────────────────────────── */
#ocs-editor-win { width: 640px; height: 480px; top: 60px; left: 80px; }
.ocs-editor-toolbar {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 10px; background: var(--panel);
  border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.ocs-btn {
  padding: 4px 12px; border-radius: 5px; border: 1px solid var(--border);
  background: var(--surface); color: var(--text); font-size: 12px;
  cursor: pointer; transition: all 0.15s; font-family: var(--mono);
}
.ocs-btn:hover { border-color: var(--red); color: var(--red); }
.ocs-btn.primary { background: var(--red); color: #fff; border-color: var(--red); }
.ocs-btn.primary:hover { background: var(--red2); }
.ocs-filename {
  flex: 1; background: var(--bg); border: 1px solid var(--border);
  color: var(--text); font-family: var(--mono); font-size: 12px;
  padding: 3px 8px; border-radius: 4px; outline: none;
}
.ocs-cm-wrap { flex: 1; overflow: hidden; position: relative; min-height: 0; }
#ocs-monaco-host { width: 100%; height: 100%; min-height: 300px; }

/* ── Git App ─────────────────────────────────────────────── */
#ocs-git-win { width: 460px; height: 520px; top: 80px; left: 160px; }
.ocs-git-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.ocs-git-tabs { display: flex; gap: 2px; padding: 6px 8px 0; background: var(--panel); border-bottom: 1px solid var(--border); flex-shrink: 0; }
.ocs-git-tab { padding: 5px 12px; border-radius: 5px 5px 0 0; background: var(--surface); border: 1px solid var(--border); border-bottom: none; color: var(--muted); cursor: pointer; font-size: 12px; font-family: var(--mono); }
.ocs-git-tab.active { background: var(--bg); color: var(--red); }
.ocs-git-panel { flex: 1; overflow-y: auto; padding: 10px; display: none; }
.ocs-git-panel.active { display: block; }
.ocs-git-path-row { display: flex; gap: 6px; padding: 8px 10px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.ocs-git-path { flex: 1; background: var(--bg); border: 1px solid var(--border); color: var(--text); font-family: var(--mono); font-size: 12px; padding: 4px 8px; border-radius: 4px; outline: none; }
.ocs-git-branch { display: flex; align-items: center; gap: 6px; padding: 8px 10px; font-size: 12px; color: var(--muted); border-bottom: 1px solid var(--border); flex-shrink: 0; font-family: var(--mono); }
.ocs-git-branch span { color: var(--green); font-weight: 600; }
.ocs-status-line { display: flex; align-items: center; gap: 8px; padding: 5px 6px; border-radius: 4px; font-family: var(--mono); font-size: 12px; color: var(--text); }
.ocs-status-line:hover { background: var(--panel); }
.ocs-status-badge { width: 16px; text-align: center; font-weight: 700; font-size: 11px; }
.ocs-status-badge.M { color: #febc2e; }
.ocs-status-badge.A { color: var(--green); }
.ocs-status-badge.D { color: #ff5f57; }
.ocs-status-badge.q { color: var(--muted); }
.ocs-commit-area { padding: 8px 10px; border-top: 1px solid var(--border); flex-shrink: 0; }
#ocs-commit-msg { width: 100%; background: var(--bg); border: 1px solid var(--border); color: var(--text); font-family: var(--mono); font-size: 12px; padding: 6px 8px; border-radius: 4px; outline: none; resize: none; height: 52px; box-sizing: border-box; }
#ocs-commit-msg:focus { border-color: var(--red); }
.ocs-git-actions { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
.ocs-log-entry { padding: 7px 6px; border-bottom: 1px solid var(--border); font-family: var(--mono); font-size: 11px; }
.ocs-log-hash { color: var(--accent); font-size: 10px; }
.ocs-log-msg { color: var(--text); margin: 2px 0; }
.ocs-log-meta { color: var(--muted); font-size: 10px; }
.ocs-diff-view { flex: 1; overflow: auto; padding: 8px 10px; font-family: var(--mono); font-size: 12px; line-height: 1.6; white-space: pre; }
.diff-add { color: var(--green); background: rgba(61,220,132,0.08); }
.diff-del { color: #ff5f57; background: rgba(255,95,87,0.08); }
.diff-hunk { color: var(--accent); }

/* ── Terminal App ────────────────────────────────────────── */
#ocs-terminal-win { width: 560px; height: 380px; top: 80px; left: 200px; }
#ocs-term-output {
  flex: 1; overflow-y: auto; padding: 10px 14px;
  font-family: var(--mono); font-size: 13px;
  color: var(--text); background: #07070f;
  line-height: 1.7;
}
.term-prompt { color: var(--red); }
.term-cmd    { color: var(--text); }
.term-out    { color: #a0d0a0; }
.term-err    { color: #e05555; }
.term-info   { color: var(--muted); font-style: italic; }
.term-path   { color: #7ec8e3; }
#ocs-term-input-row {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 10px; background: #07070f;
  border-top: 1px solid var(--border); flex-shrink: 0;
}
#ocs-term-input-row span { color: var(--red); font-family: var(--mono); font-size: 13px; white-space: nowrap; }
#ocs-term-input {
  flex: 1; background: transparent; border: none; outline: none;
  color: var(--text); font-family: var(--mono); font-size: 13px;
  caret-color: var(--red);
}

/* ── File Explorer ───────────────────────────────────────── */
#ocs-files-win { width: 380px; height: 440px; top: 100px; left: 740px; }
.ocs-files-layout { display: flex; flex: 1; overflow: hidden; }
.ocs-file-tree {
  width: 100%; overflow-y: auto; padding: 8px 0;
  font-family: var(--mono); font-size: 12px;
}
.ocs-file-item {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 12px; cursor: pointer; color: var(--text);
  transition: background 0.1s;
}
.ocs-file-item:hover { background: var(--panel); }
.ocs-file-item.selected { background: rgba(224,92,92,0.15); color: var(--red); }
.ocs-file-item.folder { color: #febc2e; }
.ocs-file-item.indent1 { padding-left: 28px; }
.ocs-file-item.indent2 { padding-left: 44px; }

/* ── Browser Preview ─────────────────────────────────────── */
#ocs-browser-win { width: 620px; height: 460px; top: 60px; left: 760px; }
.ocs-browser-bar {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 10px; background: var(--panel);
  border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.ocs-browser-dot { width: 10px; height: 10px; border-radius: 50%; }
.ocs-url-bar {
  flex: 1; background: var(--bg); border: 1px solid var(--border);
  color: var(--text); font-family: var(--mono); font-size: 12px;
  padding: 4px 10px; border-radius: 4px; outline: none;
}
.ocs-url-bar:focus { border-color: var(--red); }
#ocs-preview-frame {
  flex: 1; width: 100%; border: none; background: #fff;
}

/* ── Settings ────────────────────────────────────────────── */
#ocs-settings-win { width: 360px; height: 320px; top: 120px; left: 300px; }
.ocs-settings-body { padding: 16px; overflow-y: auto; flex: 1; }
.ocs-setting-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 0; border-bottom: 1px solid var(--border);
  color: var(--text); font-size: 13px;
}
.ocs-setting-row:last-child { border-bottom: none; }
.ocs-setting-label { color: var(--muted); font-size: 11px; margin-top: 2px; }
.ocs-toggle {
  width: 38px; height: 20px; background: var(--border);
  border-radius: 10px; cursor: pointer; position: relative;
  transition: background 0.2s;
}
.ocs-toggle.on { background: var(--red); }
.ocs-toggle::after {
  content: ''; position: absolute; top: 3px; left: 3px;
  width: 14px; height: 14px; border-radius: 50%;
  background: #fff; transition: transform 0.2s;
}
.ocs-toggle.on::after { transform: translateX(18px); }
.ocs-select {
  background: var(--panel); border: 1px solid var(--border);
  color: var(--text); padding: 4px 8px; border-radius: 4px;
  font-size: 12px; outline: none; cursor: pointer;
}

/* ── Wallpaper canvas ────────────────────────────────────── */
#ocs-wallpaper { position: absolute; inset: 0; pointer-events: none; }

/* ── Context menu ────────────────────────────────────────── */
#ocs-ctx-menu {
  position: absolute; background: var(--surface);
  border: 1px solid var(--border); border-radius: 8px;
  padding: 6px 0; min-width: 160px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5); display: none; z-index: 99999;
}
.ocs-ctx-item {
  padding: 7px 16px; cursor: pointer; color: var(--text);
  font-size: 12px; display: flex; align-items: center; gap: 8px;
}
.ocs-ctx-item:hover { background: var(--panel); }
.ocs-ctx-sep { height: 1px; background: var(--border); margin: 4px 0; }

/* ── Scrollbars ─────────────────────────────────────────── */
#ocs-root ::-webkit-scrollbar { width: 6px; height: 6px; }
#ocs-root ::-webkit-scrollbar-track { background: transparent; }
#ocs-root ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
</style>

<div id="ocs-root">
  <canvas id="ocs-wallpaper"></canvas>
  <div id="ocs-desktop">
    <div class="ocs-desktop-icon" style="top:20px;left:14px" data-open="editor">
      <div class="icon-img">📝</div><div>Editor</div>
    </div>
    <div class="ocs-desktop-icon" style="top:100px;left:14px" data-open="terminal">
      <div class="icon-img">💻</div><div>Terminal</div>
    </div>
    <div class="ocs-desktop-icon" style="top:180px;left:14px" data-open="files">
      <div class="icon-img">📁</div><div>Files</div>
    </div>
    <div class="ocs-desktop-icon" style="top:260px;left:14px" data-open="browser">
      <div class="icon-img">🌐</div><div>Preview</div>
    </div>
    <div class="ocs-desktop-icon" style="top:340px;left:14px" data-open="settings">
      <div class="icon-img">⚙️</div><div>Settings</div>
    </div>
    <div class="ocs-desktop-icon" style="top:420px;left:14px" data-open="git">
      <div class="icon-img">🌿</div><div>Git</div>
    </div>
  </div>

  <!-- ── Code Editor ── -->
  <div class="ocs-win hidden" id="ocs-editor-win" data-winid="editor">
    <div class="ocs-titlebar" data-drag="editor">
      <div class="ocs-win-controls">
        <button class="ocs-wc close"  data-action="close"  data-win="editor"></button>
        <button class="ocs-wc min"    data-action="min"    data-win="editor"></button>
        <button class="ocs-wc max"    data-action="max"    data-win="editor"></button>
      </div>
      <div class="ocs-win-title">📝 Code Editor</div>
    </div>
    <div class="ocs-editor-toolbar">
      <input class="ocs-filename" id="ocs-ed-filename" value="index.html">
      <button class="ocs-btn primary" id="ocs-ed-preview">▶ Preview</button>
      <button class="ocs-btn" id="ocs-ed-save">Save</button>
      <button class="ocs-btn" id="ocs-ed-vscode" title="Open in VS Code" style="white-space:nowrap">
        <svg width="13" height="13" viewBox="0 0 100 100" style="vertical-align:middle;margin-right:3px"><path d="M74 4L30 44 12 28 0 36v28l12 8 18-16 44 40 26-12V16L74 4z" fill="#0078d4"/></svg>VS Code
      </button>
    </div>
    <div class="ocs-tabs" id="ocs-ed-tabs">
      <div class="ocs-tab active" data-edtab="html">HTML</div>
      <div class="ocs-tab" data-edtab="css">CSS</div>
      <div class="ocs-tab" data-edtab="js">JS</div>
    </div>
    <div class="ocs-win-body">
      <div class="ocs-cm-wrap">
        <div id="ocs-monaco-host"></div>
      </div>
    </div>
    <div class="ocs-resize" data-resize="editor"></div>
  </div>

  <!-- ── Terminal ── -->
  <div class="ocs-win hidden" id="ocs-terminal-win" data-winid="terminal">
    <div class="ocs-titlebar" data-drag="terminal">
      <div class="ocs-win-controls">
        <button class="ocs-wc close" data-action="close" data-win="terminal"></button>
        <button class="ocs-wc min"   data-action="min"   data-win="terminal"></button>
        <button class="ocs-wc max"   data-action="max"   data-win="terminal"></button>
      </div>
      <div class="ocs-win-title">💻 Terminal — <span id="ocs-term-cwd" style="color:#7ec8e3;font-size:11px">~/workspace</span></div>
    </div>
    <div class="ocs-win-body">
      <div id="ocs-term-output"></div>
      <div id="ocs-term-input-row">
        <span id="ocs-term-prompt-label">~/workspace $</span>
        <input id="ocs-term-input" spellcheck="false" autocomplete="off" placeholder="type a command…">
      </div>
    </div>
    <div class="ocs-resize" data-resize="terminal"></div>
  </div>

  <!-- ── File Explorer ── -->
  <div class="ocs-win hidden" id="ocs-files-win" data-winid="files">
    <div class="ocs-titlebar" data-drag="files">
      <div class="ocs-win-controls">
        <button class="ocs-wc close" data-action="close" data-win="files"></button>
        <button class="ocs-wc min"   data-action="min"   data-win="files"></button>
        <button class="ocs-wc max"   data-action="max"   data-win="files"></button>
      </div>
      <div class="ocs-win-title">📁 File Explorer</div>
    </div>
    <div class="ocs-win-body">
      <div class="ocs-files-layout">
        <div class="ocs-file-tree" id="ocs-file-tree"></div>
      </div>
    </div>
    <div class="ocs-resize" data-resize="files"></div>
  </div>

  <!-- ── Browser Preview ── -->
  <div class="ocs-win hidden" id="ocs-browser-win" data-winid="browser">
    <div class="ocs-titlebar" data-drag="browser">
      <div class="ocs-win-controls">
        <button class="ocs-wc close" data-action="close" data-win="browser"></button>
        <button class="ocs-wc min"   data-action="min"   data-win="browser"></button>
        <button class="ocs-wc max"   data-action="max"   data-win="browser"></button>
      </div>
      <div class="ocs-win-title">🌐 Browser Preview</div>
    </div>
    <div class="ocs-browser-bar">
      <div class="ocs-browser-dot" style="background:#ff5f57"></div>
      <div class="ocs-browser-dot" style="background:#febc2e"></div>
      <div class="ocs-browser-dot" style="background:#28c840"></div>
      <input class="ocs-url-bar" id="ocs-url-bar" value="preview://workspace/index.html" placeholder="https://... or leave blank for local preview">
      <button class="ocs-btn" id="ocs-browser-go">Go</button>
      <button class="ocs-btn" id="ocs-browser-refresh">↻</button>
      <button class="ocs-btn" id="ocs-browser-chrome" title="Open via proxy in new tab" style="display:flex;align-items:center;gap:5px;white-space:nowrap">
        <svg width="14" height="14" viewBox="0 0 24 24" style="flex-shrink:0">
          <circle cx="12" cy="12" r="4" fill="#4285F4"/>
          <path d="M12 8a4 4 0 0 1 3.46 2H21a9 9 0 1 0 0 4h-5.54A4 4 0 1 1 12 8z" fill="none" stroke="#34A853" stroke-width="2"/>
          <path d="M12 8h8.66" stroke="#FBBC04" stroke-width="2"/>
          <path d="M5.08 14 2.2 9" stroke="#EA4335" stroke-width="2"/>
        </svg>
        Chrome
      </button>
    </div>
    <div class="ocs-win-body">
      <iframe id="ocs-preview-frame" sandbox="allow-scripts allow-forms allow-same-origin allow-popups"></iframe>
    </div>
    <div class="ocs-resize" data-resize="browser"></div>
  </div>

  <!-- ── Git ── -->
  <div class="ocs-win hidden" id="ocs-git-win" data-winid="git">
    <div class="ocs-titlebar" data-drag="git">
      <div class="ocs-win-controls">
        <button class="ocs-wc close" data-action="close" data-win="git"></button>
        <button class="ocs-wc min"   data-action="min"   data-win="git"></button>
        <button class="ocs-wc max"   data-action="max"   data-win="git"></button>
      </div>
      <div class="ocs-win-title">🌿 Git — <span id="ocs-git-branch-label" style="color:var(--green);font-size:11px">loading…</span></div>
    </div>
    <div class="ocs-git-path-row">
      <input class="ocs-git-path" id="ocs-git-path" placeholder="Repo path e.g. /home/user/project">
      <button class="ocs-btn" id="ocs-git-load">Load</button>
    </div>
    <div class="ocs-git-tabs">
      <div class="ocs-git-tab active" data-gittab="status">Changes</div>
      <div class="ocs-git-tab" data-gittab="log">Log</div>
      <div class="ocs-git-tab" data-gittab="diff">Diff</div>
    </div>
    <div class="ocs-git-body">
      <!-- Changes -->
      <div class="ocs-git-panel active" id="ocs-git-status-panel">
        <div id="ocs-git-changes-list"></div>
      </div>
      <!-- Log -->
      <div class="ocs-git-panel" id="ocs-git-log-panel">
        <div id="ocs-git-log-list"></div>
      </div>
      <!-- Diff -->
      <div class="ocs-git-panel" id="ocs-git-diff-panel" style="padding:0;display:none;flex-direction:column">
        <div class="ocs-diff-view" id="ocs-git-diff-view">Select "Diff" tab to load…</div>
      </div>
    </div>
    <div class="ocs-commit-area">
      <textarea id="ocs-commit-msg" placeholder="Commit message…" spellcheck="false"></textarea>
      <div class="ocs-git-actions">
        <button class="ocs-btn" id="ocs-git-stage-all">+ Stage All</button>
        <button class="ocs-btn primary" id="ocs-git-commit">✓ Commit</button>
        <button class="ocs-btn" id="ocs-git-pull">↓ Pull</button>
        <button class="ocs-btn" id="ocs-git-push">↑ Push</button>
        <button class="ocs-btn" id="ocs-git-refresh">↻</button>
      </div>
    </div>
    <div class="ocs-resize" data-resize="git"></div>
  </div>

  <!-- ── Settings ── -->
  <div class="ocs-win hidden" id="ocs-settings-win" data-winid="settings">
    <div class="ocs-titlebar" data-drag="settings">
      <div class="ocs-win-controls">
        <button class="ocs-wc close" data-action="close" data-win="settings"></button>
        <button class="ocs-wc min"   data-action="min"   data-win="settings"></button>
        <button class="ocs-wc max"   data-action="max"   data-win="settings"></button>
      </div>
      <div class="ocs-win-title">⚙️ Settings</div>
    </div>
    <div class="ocs-win-body">
      <div class="ocs-settings-body">
        <div class="ocs-setting-row">
          <div><div>Font Size</div><div class="ocs-setting-label">Editor font size</div></div>
          <select class="ocs-select" id="ocs-set-fontsize">
            <option value="12">12px</option>
            <option value="13" selected>13px</option>
            <option value="14">14px</option>
            <option value="16">16px</option>
          </select>
        </div>
        <div class="ocs-setting-row">
          <div><div>Line Numbers</div><div class="ocs-setting-label">Show in editor</div></div>
          <div class="ocs-toggle on" id="ocs-set-linenums"></div>
        </div>
        <div class="ocs-setting-row">
          <div><div>Word Wrap</div><div class="ocs-setting-label">Wrap long lines</div></div>
          <div class="ocs-toggle" id="ocs-set-wrap"></div>
        </div>
        <div class="ocs-setting-row">
          <div><div>Theme</div><div class="ocs-setting-label">Editor color theme</div></div>
          <select class="ocs-select" id="ocs-set-theme">
            <option value="dracula" selected>Dracula</option>
            <option value="default">Light</option>
          </select>
        </div>
        <div class="ocs-setting-row">
          <div><div>About OCS</div><div class="ocs-setting-label">v1.0 · Open Coding Workspace</div></div>
          <span style="color:var(--red);font-size:11px;font-weight:700">OCS</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Taskbar ── -->
  <div id="ocs-taskbar">
    <button id="ocs-start-btn">
      <span class="ocs-start-logo">OCS</span>
    </button>
    <div class="ocs-tb-sep"></div>
    <button class="ocs-tb-btn" data-tb="editor">📝 Editor</button>
    <button class="ocs-tb-btn" data-tb="terminal">💻 Terminal</button>
    <button class="ocs-tb-btn" data-tb="files">📁 Files</button>
    <button class="ocs-tb-btn" data-tb="browser">🌐 Preview</button>
    <button class="ocs-tb-btn" data-tb="settings">⚙️ Settings</button>
    <button class="ocs-tb-btn" data-tb="git">🌿 Git</button>
    <div id="ocs-clock">12:00<br><span style="font-size:10px;color:var(--muted)">Mon 01/01</span></div>
  </div>

  <!-- ── Start Menu ── -->
  <div id="ocs-start-menu">
    <div class="ocs-menu-header">
      <div class="ocs-menu-logo">CS</div>
      <div>
        <div class="ocs-menu-title">Open Coding Workspace</div>
        <div class="ocs-menu-sub">Web Developer Environment</div>
      </div>
    </div>
    <div class="ocs-app-grid">
      <div class="ocs-app-tile" data-open="editor"><div class="tile-icon">📝</div>Code Editor</div>
      <div class="ocs-app-tile" data-open="terminal"><div class="tile-icon">💻</div>Terminal</div>
      <div class="ocs-app-tile" data-open="files"><div class="tile-icon">📁</div>Files</div>
      <div class="ocs-app-tile" data-open="browser"><div class="tile-icon">🌐</div>Preview</div>
      <div class="ocs-app-tile" data-open="settings"><div class="tile-icon">⚙️</div>Settings</div>
      <div class="ocs-app-tile" data-open="git"><div class="tile-icon">🌿</div>Git</div>
    </div>
  </div>

  <!-- ── Context Menu ── -->
  <div id="ocs-ctx-menu">
    <div class="ocs-ctx-item" data-ctx="editor">📝 New File in Editor</div>
    <div class="ocs-ctx-item" data-ctx="terminal">💻 Open Terminal</div>
    <div class="ocs-ctx-sep"></div>
    <div class="ocs-ctx-item" data-ctx="browser">🌐 Open Preview</div>
    <div class="ocs-ctx-sep"></div>
    <div class="ocs-ctx-item" data-ctx="settings">⚙️ Settings</div>
  </div>
</div>

<script>
(function () {
'use strict';

/* ── Virtual FS ──────────────────────────────────────────── */
const vfs = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, OCS!</h1>
  <p>Edit me in the Code Editor.</p>
  <script src="app.js"><\/script>
</body>
</html>`,
  'style.css': `body {
  font-family: system-ui, sans-serif;
  background: #0d0d18;
  color: #cdd6f4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
}

h1 { color: #E05C5C; }`,
  'app.js': `// Main script
console.log('OCS Workspace loaded!');

document.querySelector('h1').addEventListener('click', () => {
  alert('Hello from OCS!');
});`,
  'README.md': `# My Project\n\nBuilt with Open Coding Workspace.\n`,
  'package.json': `{\n  "name": "my-project",\n  "version": "1.0.0",\n  "description": "Built with OCS"\n}`,
};

let currentFile = 'index.html';
let cwd = '~/workspace';
const history = [];
let histIdx = -1;

/* ── Wallpaper ───────────────────────────────────────────── */
const canvas = document.getElementById('ocs-wallpaper');
function drawWallpaper() {
  const W = canvas.width  = canvas.offsetWidth;
  const H = canvas.height = canvas.offsetHeight;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  // subtle grid
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // brand watermark
  ctx.font = 'bold 120px monospace';
  ctx.fillStyle = 'rgba(224,92,92,0.04)';
  ctx.textAlign = 'center';
  ctx.fillText('OCS', W/2, H/2 + 40);
  ctx.font = '14px monospace';
  ctx.fillStyle = 'rgba(224,92,92,0.08)';
  ctx.fillText('OPEN CODING WORKSPACE', W/2, H/2 + 80);
}
window.addEventListener('resize', drawWallpaper);
drawWallpaper();

/* ── Clock ───────────────────────────────────────────────── */
function updateClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2,'0');
  const m = now.getMinutes().toString().padStart(2,'0');
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const d = days[now.getDay()];
  const mm = (now.getMonth()+1).toString().padStart(2,'0');
  const dd = now.getDate().toString().padStart(2,'0');
  document.getElementById('ocs-clock').innerHTML =
    h+':'+m+'<br><span style="font-size:10px;color:var(--muted)">'+d+' '+mm+'/'+dd+'</span>';
}
updateClock();
setInterval(updateClock, 10000);

/* ── Z-index manager ─────────────────────────────────────── */
let zTop = 100;
function bringToFront(winEl) {
  winEl.style.zIndex = ++zTop;
}

/* ── Window open/close/min/max ───────────────────────────── */
const winStates = {}; // winid -> { minimized, maximized, prevRect }

function openWin(id) {
  const el = document.getElementById('ocs-' + id + '-win');
  if (!el) return;
  el.classList.remove('hidden');
  winStates[id] = winStates[id] || {};
  winStates[id].minimized = false;
  bringToFront(el);
  updateTaskbar();
  if (id === 'editor') setTimeout(() => monacoEditor && monacoEditor.layout(), 50);
}

function closeWin(id) {
  const el = document.getElementById('ocs-' + id + '-win');
  if (!el) return;
  el.classList.add('hidden');
  delete winStates[id];
  updateTaskbar();
}

function minWin(id) {
  const el = document.getElementById('ocs-' + id + '-win');
  if (!el) return;
  if (!winStates[id]) winStates[id] = {};
  winStates[id].minimized = !winStates[id].minimized;
  el.style.display = winStates[id].minimized ? 'none' : 'flex';
  updateTaskbar();
}

function maxWin(id) {
  const el = document.getElementById('ocs-' + id + '-win');
  if (!el) return;
  if (!winStates[id]) winStates[id] = {};
  if (el.classList.contains('maximized')) {
    el.classList.remove('maximized');
    const r = winStates[id].prevRect || {};
    el.style.left   = r.left   || '80px';
    el.style.top    = r.top    || '60px';
    el.style.width  = r.width  || '';
    el.style.height = r.height || '';
  } else {
    winStates[id].prevRect = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
    el.classList.add('maximized');
  }
  if (id === 'editor') setTimeout(() => monacoEditor && monacoEditor.layout(), 50);
}

function updateTaskbar() {
  document.querySelectorAll('.ocs-tb-btn').forEach(btn => {
    const id = btn.dataset.tb;
    const el = document.getElementById('ocs-' + id + '-win');
    if (!el || el.classList.contains('hidden')) {
      btn.classList.remove('active', 'minimized');
    } else if (winStates[id] && winStates[id].minimized) {
      btn.classList.add('active'); btn.classList.add('minimized');
    } else {
      btn.classList.add('active'); btn.classList.remove('minimized');
    }
  });
}

/* ── Drag ────────────────────────────────────────────────── */
function makeDraggable(titlebar, winEl) {
  let ox, oy, startL, startT;
  titlebar.addEventListener('mousedown', e => {
    if (e.target.classList.contains('ocs-wc')) return;
    if (winEl.classList.contains('maximized')) return;
    bringToFront(winEl);
    ox = e.clientX; oy = e.clientY;
    startL = winEl.offsetLeft; startT = winEl.offsetTop;
    const mm = ev => {
      winEl.style.left = Math.max(0, startL + ev.clientX - ox) + 'px';
      winEl.style.top  = Math.max(0, startT + ev.clientY - oy) + 'px';
    };
    const mu = () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
    document.addEventListener('mousemove', mm);
    document.addEventListener('mouseup', mu);
    e.preventDefault();
  });
}

/* ── Resize ──────────────────────────────────────────────── */
function makeResizable(handle, winEl, winId) {
  handle.addEventListener('mousedown', e => {
    const sx = e.clientX, sy = e.clientY;
    const sw = winEl.offsetWidth, sh = winEl.offsetHeight;
    const mm = ev => {
      winEl.style.width  = Math.max(300, sw + ev.clientX - sx) + 'px';
      winEl.style.height = Math.max(200, sh + ev.clientY - sy) + 'px';
      if (winId === 'editor' && monacoEditor) monacoEditor.layout();
    };
    const mu = () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
    document.addEventListener('mousemove', mm);
    document.addEventListener('mouseup', mu);
    e.preventDefault();
  });
}

/* ── Wire up all windows ─────────────────────────────────── */
document.querySelectorAll('.ocs-win').forEach(win => {
  const id = win.dataset.winid;
  const tb = win.querySelector('.ocs-titlebar');
  const rh = win.querySelector('.ocs-resize');
  if (tb) makeDraggable(tb, win);
  if (rh) makeResizable(rh, win, id);
  win.addEventListener('mousedown', () => bringToFront(win));
});

document.querySelectorAll('.ocs-wc').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const { action, win } = btn.dataset;
    if (action === 'close')  closeWin(win);
    if (action === 'min')    minWin(win);
    if (action === 'max')    maxWin(win);
  });
});

/* ── Open buttons ────────────────────────────────────────── */
function attachOpenHandlers(root) {
  root.querySelectorAll('[data-open]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.open;
      const win = document.getElementById('ocs-' + id + '-win');
      if (!win || win.classList.contains('hidden')) openWin(id);
      else { if (winStates[id] && winStates[id].minimized) minWin(id); bringToFront(win); }
      document.getElementById('ocs-start-menu').classList.remove('open');
    });
  });
}
attachOpenHandlers(document.getElementById('ocs-desktop'));
attachOpenHandlers(document.getElementById('ocs-start-menu'));

/* ── Taskbar buttons ─────────────────────────────────────── */
document.querySelectorAll('.ocs-tb-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.tb;
    const win = document.getElementById('ocs-' + id + '-win');
    if (!win || win.classList.contains('hidden')) { openWin(id); return; }
    if (winStates[id] && winStates[id].minimized) { minWin(id); bringToFront(win); return; }
    if (parseInt(win.style.zIndex) === zTop) { minWin(id); } else { bringToFront(win); }
  });
});

/* ── Start menu ──────────────────────────────────────────── */
const startMenu = document.getElementById('ocs-start-menu');
document.getElementById('ocs-start-btn').addEventListener('click', e => {
  e.stopPropagation(); startMenu.classList.toggle('open');
});
document.addEventListener('click', () => startMenu.classList.remove('open'));

/* ── Context menu ────────────────────────────────────────── */
const ctxMenu = document.getElementById('ocs-ctx-menu');
document.getElementById('ocs-desktop').addEventListener('contextmenu', e => {
  e.preventDefault();
  ctxMenu.style.left = e.clientX + 'px';
  ctxMenu.style.top  = e.clientY + 'px';
  ctxMenu.style.display = 'block';
});
document.addEventListener('click', () => { ctxMenu.style.display = 'none'; });
ctxMenu.querySelectorAll('.ocs-ctx-item').forEach(item => {
  item.addEventListener('click', () => openWin(item.dataset.ctx));
});

/* ── Monaco Editor (VS Code engine) ─────────────────────── */
const fileMap   = { html: 'index.html', css: 'style.css', js: 'app.js' };
const langMap   = { html: 'html', css: 'css', js: 'javascript' };
let activeEdTab = 'html';
let monacoEditor;

require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.46.0/min/vs' } });
require(['vs/editor/editor.main'], () => {
  // VS Code dark theme colours
  monaco.editor.defineTheme('ocs-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [{ token: '', background: '0d0d18' }],
    colors: {
      'editor.background':           '#0d0d18',
      'editor.lineHighlightBackground': '#1a1a2b',
      'editorLineNumber.foreground': '#6464a0',
      'editorCursor.foreground':     '#E05C5C',
      'editor.selectionBackground':  '#3a3a5c',
    },
  });
  monacoEditor = monaco.editor.create(document.getElementById('ocs-monaco-host'), {
    value:              vfs['index.html'],
    language:           'html',
    theme:              'ocs-dark',
    fontSize:           13,
    lineHeight:         22,
    minimap:            { enabled: true },
    automaticLayout:    true,
    scrollBeyondLastLine: false,
    wordWrap:           'off',
    tabSize:            2,
    fontFamily:         "'JetBrains Mono','Cascadia Code','Fira Code',monospace",
    fontLigatures:      true,
  });
  monacoEditor.onDidChangeModelContent(() => {
    vfs[fileMap[activeEdTab]] = monacoEditor.getValue();
  });
});

document.querySelectorAll('[data-edtab]').forEach(tab => {
  tab.addEventListener('click', () => {
    if (monacoEditor) vfs[fileMap[activeEdTab]] = monacoEditor.getValue();
    activeEdTab = tab.dataset.edtab;
    document.querySelectorAll('[data-edtab]').forEach(t => t.classList.toggle('active', t === tab));
    if (monacoEditor) {
      monacoEditor.setValue(vfs[fileMap[activeEdTab]] || '');
      monaco.editor.setModelLanguage(monacoEditor.getModel(), langMap[activeEdTab]);
      monacoEditor.focus();
    }
    document.getElementById('ocs-ed-filename').value = fileMap[activeEdTab];
  });
});

document.getElementById('ocs-ed-preview').addEventListener('click', () => {
  if (monacoEditor) vfs[fileMap[activeEdTab]] = monacoEditor.getValue();
  runPreview();
  openWin('browser');
});

document.getElementById('ocs-ed-save').addEventListener('click', () => {
  if (monacoEditor) vfs[fileMap[activeEdTab]] = monacoEditor.getValue();
  renderFileTree();
  const btn = document.getElementById('ocs-ed-save');
  btn.textContent = '✓ Saved'; btn.style.color = '#3ddc84';
  setTimeout(() => { btn.textContent = 'Save'; btn.style.color = ''; }, 1500);
});

document.getElementById('ocs-ed-vscode').addEventListener('click', () => {
  const file = fileMap[activeEdTab];
  // Try to open via vscode:// URI — works if VS Code is installed
  const uri = `vscode://file/${encodeURIComponent(file)}`;
  window.open(uri, '_self');
});

/* ── Preview ─────────────────────────────────────────────── */
function runPreview() {
  const html  = vfs['index.html'] || '';
  const css   = vfs['style.css']  || '';
  const js    = vfs['app.js']     || '';
  const injected = html
    .replace('</head>', `<style>${css}</style></head>`)
    .replace('</body>', `<script>${js}<\/script></body>`);
  const frame = document.getElementById('ocs-preview-frame');
  frame.srcdoc = injected;
}

const PROXY = 'http://localhost:5050/api/proxy?url=';
const urlBar = document.getElementById('ocs-url-bar');

function navigateBrowser() {
  const val = urlBar.value.trim();
  const frame = document.getElementById('ocs-preview-frame');
  if (!val || val.startsWith('preview://')) {
    runPreview();
    urlBar.value = 'preview://workspace/index.html';
    return;
  }
  const url = val.startsWith('http') ? val : 'https://' + val;
  urlBar.value = url;
  frame.src = PROXY + encodeURIComponent(url);
}

document.getElementById('ocs-browser-go').addEventListener('click', navigateBrowser);
urlBar.addEventListener('keydown', e => { if (e.key === 'Enter') navigateBrowser(); });
document.getElementById('ocs-browser-refresh').addEventListener('click', () => {
  const val = urlBar.value.trim();
  if (!val || val.startsWith('preview://')) runPreview();
  else document.getElementById('ocs-preview-frame').src += '';
});

document.getElementById('ocs-browser-chrome').addEventListener('click', () => {
  const val = urlBar.value.trim();
  if (!val || val.startsWith('preview://')) return;
  const url = val.startsWith('http') ? val : 'https://' + val;
  window.open(PROXY + encodeURIComponent(url), '_blank');
});

/* ── File Explorer ───────────────────────────────────────── */
const fsTree = [
  { name: 'workspace', type: 'folder', indent: 0 },
  { name: 'index.html', type: 'file', indent: 1, file: 'index.html' },
  { name: 'style.css',  type: 'file', indent: 1, file: 'style.css'  },
  { name: 'app.js',     type: 'file', indent: 1, file: 'app.js'     },
  { name: 'README.md',  type: 'file', indent: 1, file: 'README.md'  },
  { name: 'package.json',type:'file', indent: 1, file: 'package.json'},
];
const extIcon = { html:'🌐', css:'🎨', js:'⚡', md:'📄', json:'📋' };
function renderFileTree() {
  const tree = document.getElementById('ocs-file-tree');
  tree.innerHTML = '';
  fsTree.forEach(item => {
    const div = document.createElement('div');
    const ext = item.name.split('.').pop();
    const icon = item.type === 'folder' ? '📁' : (extIcon[ext] || '📄');
    div.className = 'ocs-file-item' + (item.type==='folder'?' folder':'') + ' indent' + item.indent;
    if (item.file === currentFile) div.classList.add('selected');
    div.innerHTML = icon + ' ' + item.name;
    if (item.file) {
      div.addEventListener('click', () => {
        currentFile = item.file;
        // sync editor tab
        const tab = Object.entries(fileMap).find(([,v]) => v === item.file);
        if (tab) {
          if (monacoEditor) vfs[fileMap[activeEdTab]] = monacoEditor.getValue();
          activeEdTab = tab[0];
          document.querySelectorAll('[data-edtab]').forEach(t =>
            t.classList.toggle('active', t.dataset.edtab === activeEdTab));
          if (monacoEditor) {
            monacoEditor.setValue(vfs[item.file] || '');
            monaco.editor.setModelLanguage(monacoEditor.getModel(), langMap[activeEdTab]);
          }
          document.getElementById('ocs-ed-filename').value = item.file;
        }
        openWin('editor');
        renderFileTree();
      });
    }
    tree.appendChild(div);
  });
}
renderFileTree();

/* ── Terminal ────────────────────────────────────────────── */
const termOut = document.getElementById('ocs-term-output');
const termIn  = document.getElementById('ocs-term-input');

function termPrint(html) {
  termOut.innerHTML += html + '\n';
  termOut.scrollTop = termOut.scrollHeight;
}

function updatePrompt() {
  document.getElementById('ocs-term-prompt-label').textContent = cwd + ' $';
  document.getElementById('ocs-term-cwd').textContent = cwd;
}

const cmds = {
  help: () => termPrint('<span class="term-info">Commands: help, ls, cat, clear, pwd, echo, git, npm, node, whoami, date, open</span>'),
  ls:   () => termPrint('<span class="term-out">index.html  style.css  app.js  README.md  package.json</span>'),
  pwd:  () => termPrint('<span class="term-path">' + cwd + '</span>'),
  whoami: () => termPrint('<span class="term-out">developer</span>'),
  clear: () => { termOut.innerHTML = ''; },
  date: () => termPrint('<span class="term-out">' + new Date().toLocaleString() + '</span>'),
};

function runTermCmd(input) {
  const raw = input.trim();
  if (!raw) return;
  history.unshift(raw); histIdx = -1;
  termPrint('<span class="term-prompt">' + cwd + ' $</span> <span class="term-cmd">' + escHtml(raw) + '</span>');
  const [cmd, ...args] = raw.split(/\s+/);

  if (cmds[cmd]) { cmds[cmd](args); return; }

  // cat
  if (cmd === 'cat') {
    const name = args[0];
    if (vfs[name] !== undefined) {
      termPrint('<span class="term-out">' + escHtml(vfs[name]) + '</span>');
    } else {
      termPrint('<span class="term-err">cat: ' + escHtml(name||'') + ': No such file</span>');
    }
    return;
  }
  // echo
  if (cmd === 'echo') { termPrint('<span class="term-out">' + escHtml(args.join(' ')) + '</span>'); return; }
  // open
  if (cmd === 'open') {
    const target = args[0];
    if (target === 'editor')   { openWin('editor');   termPrint('<span class="term-info">Opening editor…</span>'); return; }
    if (target === 'browser' || target === 'preview') { runPreview(); openWin('browser'); termPrint('<span class="term-info">Opening preview…</span>'); return; }
  }
  // git
  if (cmd === 'git') {
    const sub = args[0];
    if (sub === 'status') { termPrint('<span class="term-out">On branch main\nModified: index.html style.css app.js</span>'); return; }
    if (sub === 'log')    { termPrint('<span class="term-out">* a1b2c3 Initial commit\n* d4e5f6 Add styles</span>'); return; }
    if (sub === 'init')   { termPrint('<span class="term-out">Initialized empty Git repository in ' + cwd + '/.git/</span>'); return; }
    termPrint('<span class="term-err">git: \'' + escHtml(sub||'') + '\' is not a git command</span>');
    return;
  }
  // npm
  if (cmd === 'npm') {
    const sub = args[0];
    if (sub === 'install' || sub === 'i') { termPrint('<span class="term-out">added 0 packages in 0s\n✓ up to date</span>'); return; }
    if (sub === 'run') { termPrint('<span class="term-out">Running script \'' + escHtml(args[1]||'') + '\'…\nDone.</span>'); return; }
    if (sub === 'init') { termPrint('<span class="term-out">Wrote to package.json</span>'); return; }
    termPrint('<span class="term-err">npm: unknown command \'' + escHtml(sub||'') + '\'</span>');
    return;
  }
  // node
  if (cmd === 'node') {
    if (args[0] === 'app.js') {
      try {
        const result = (new Function(vfs['app.js']))();
        termPrint('<span class="term-out">Script ran successfully.</span>');
      } catch(e) {
        termPrint('<span class="term-err">' + escHtml(String(e)) + '</span>');
      }
      return;
    }
    termPrint('<span class="term-err">node: cannot open file \'' + escHtml(args[0]||'') + '\'</span>');
    return;
  }
  termPrint('<span class="term-err">command not found: ' + escHtml(cmd) + '</span>');
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

termIn.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const v = termIn.value; termIn.value = '';
    runTermCmd(v);
  }
  if (e.key === 'ArrowUp') {
    histIdx = Math.min(histIdx + 1, history.length - 1);
    termIn.value = history[histIdx] || '';
    e.preventDefault();
  }
  if (e.key === 'ArrowDown') {
    histIdx = Math.max(histIdx - 1, -1);
    termIn.value = histIdx === -1 ? '' : (history[histIdx] || '');
    e.preventDefault();
  }
});

termPrint('<span class="term-info">Open Coding Workspace Terminal v1.0</span>');
termPrint('<span class="term-info">Type <strong>help</strong> to see available commands.</span>');

/* ── Settings ────────────────────────────────────────────── */
document.getElementById('ocs-set-fontsize').addEventListener('change', function() {
  if (monacoEditor) monacoEditor.updateOptions({ fontSize: parseInt(this.value) });
});

document.getElementById('ocs-set-linenums').addEventListener('click', function() {
  this.classList.toggle('on');
  if (monacoEditor) monacoEditor.updateOptions({ lineNumbers: this.classList.contains('on') ? 'on' : 'off' });
});

document.getElementById('ocs-set-wrap').addEventListener('click', function() {
  this.classList.toggle('on');
  if (monacoEditor) monacoEditor.updateOptions({ wordWrap: this.classList.contains('on') ? 'on' : 'off' });
});

document.getElementById('ocs-set-theme').addEventListener('change', function() {
  if (monacoEditor) monaco.editor.setTheme(this.value === 'default' ? 'vs-light' : 'ocs-dark');
});

/* ── Git Panel ───────────────────────────────────────────── */
const GIT = 'http://localhost:5050/api/git';
let gitPath = '';

async function gitFetch(endpoint, opts = {}) {
  try {
    const url = new URL(GIT + endpoint);
    if (opts.params) Object.entries(opts.params).forEach(([k,v]) => url.searchParams.set(k, v));
    const res = await fetch(url, {
      method: opts.method || 'GET',
      headers: opts.body ? { 'Content-Type': 'application/json' } : {},
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    return await res.json();
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function gitStatusBadge(code) {
  const map = { M:'M', A:'A', D:'D', '?':'?' };
  return `<span class="ocs-status-badge ${code}">${code}</span>`;
}

async function gitRefresh() {
  const path = document.getElementById('ocs-git-path').value.trim() || gitPath;
  if (!path) { document.getElementById('ocs-git-changes-list').innerHTML = '<div style="color:var(--muted);padding:12px;font-size:12px">Set a repo path above and click Load.</div>'; return; }
  gitPath = path;

  const status = await gitFetch('/status', { params: { path } });
  document.getElementById('ocs-git-branch-label').textContent = status.branch || 'unknown';

  const list = document.getElementById('ocs-git-changes-list');
  if (!status.ok) { list.innerHTML = `<div style="color:#e05555;padding:10px;font-size:12px">${escHtml(status.error||'')}</div>`; return; }
  if (status.clean) { list.innerHTML = '<div style="color:var(--green);padding:12px;font-size:12px">✓ Nothing to commit, working tree clean</div>'; return; }

  list.innerHTML = status.changes.split('\n').filter(Boolean).map(line => {
    const code = line[0] === ' ' ? (line[1] || '?') : line[0];
    const file = line.slice(3);
    return `<div class="ocs-status-line">${gitStatusBadge(code)} <span>${escHtml(file)}</span></div>`;
  }).join('');
}

async function gitLoadLog() {
  const path = gitPath; if (!path) return;
  const data = await gitFetch('/log', { params: { path, n: 30 } });
  const el = document.getElementById('ocs-git-log-list');
  if (!data.ok || !data.commits.length) { el.innerHTML = '<div style="color:var(--muted);padding:12px;font-size:12px">No commits found.</div>'; return; }
  el.innerHTML = data.commits.map(c => `
    <div class="ocs-log-entry">
      <div class="ocs-log-hash">${escHtml(c.short)}</div>
      <div class="ocs-log-msg">${escHtml(c.message)}</div>
      <div class="ocs-log-meta">${escHtml(c.author)} · ${escHtml(c.when)}</div>
    </div>`).join('');
}

async function gitLoadDiff() {
  const path = gitPath; if (!path) return;
  const data = await gitFetch('/diff', { params: { path } });
  const el = document.getElementById('ocs-git-diff-view');
  if (!data.diff) { el.innerHTML = '<span style="color:var(--muted)">No unstaged changes.</span>'; return; }
  el.innerHTML = data.diff.split('\n').map(line => {
    if (line.startsWith('+') && !line.startsWith('+++')) return `<span class="diff-add">${escHtml(line)}</span>`;
    if (line.startsWith('-') && !line.startsWith('---')) return `<span class="diff-del">${escHtml(line)}</span>`;
    if (line.startsWith('@@')) return `<span class="diff-hunk">${escHtml(line)}</span>`;
    return escHtml(line);
  }).join('\n');
}

// Git tab switching
document.querySelectorAll('.ocs-git-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ocs-git-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const id = tab.dataset.gittab;
    document.querySelectorAll('.ocs-git-panel').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
    const panel = document.getElementById(`ocs-git-${id}-panel`);
    if (panel) { panel.classList.add('active'); panel.style.display = id === 'diff' ? 'flex' : 'block'; }
    if (id === 'log')  gitLoadLog();
    if (id === 'diff') gitLoadDiff();
  });
});

document.getElementById('ocs-git-load').addEventListener('click', gitRefresh);
document.getElementById('ocs-git-refresh').addEventListener('click', gitRefresh);

document.getElementById('ocs-git-stage-all').addEventListener('click', async () => {
  const r = await gitFetch('/add', { method: 'POST', body: { path: gitPath, files: ['.'] } });
  if (r.ok) gitRefresh(); else alert('Stage failed: ' + r.error);
});

document.getElementById('ocs-git-commit').addEventListener('click', async () => {
  const msg = document.getElementById('ocs-commit-msg').value.trim();
  if (!msg) { alert('Enter a commit message'); return; }
  const r = await gitFetch('/commit', { method: 'POST', body: { path: gitPath, message: msg } });
  if (r.ok) { document.getElementById('ocs-commit-msg').value = ''; gitRefresh(); }
  else alert('Commit failed: ' + (r.error || r.stderr));
});

document.getElementById('ocs-git-pull').addEventListener('click', async () => {
  const r = await gitFetch('/pull', { method: 'POST', body: { path: gitPath } });
  alert(r.ok ? '✓ Pulled\n' + r.stdout : '✗ Pull failed\n' + r.stderr);
  if (r.ok) gitRefresh();
});

document.getElementById('ocs-git-push').addEventListener('click', async () => {
  const r = await gitFetch('/push', { method: 'POST', body: { path: gitPath } });
  alert(r.ok ? '✓ Pushed\n' + r.stdout : '✗ Push failed\n' + r.stderr);
});

/* ── Boot: open editor + terminal by default ─────────────── */
openWin('editor');
openWin('terminal');
updateTaskbar();

})();
</script>
