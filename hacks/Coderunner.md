---
layout: default
title: Code Runner
permalink: /coderunner/
---

<!-- CodeMirror 5 -->
<link  rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5/lib/codemirror.css">
<link  rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5/theme/dracula.css">
<script src="https://cdn.jsdelivr.net/npm/codemirror@5/lib/codemirror.js"></script>
<script src="https://cdn.jsdelivr.net/npm/codemirror@5/mode/python/python.js"></script>
<script src="https://cdn.jsdelivr.net/npm/codemirror@5/mode/javascript/javascript.js"></script>
<script src="https://cdn.jsdelivr.net/npm/codemirror@5/mode/clike/clike.js"></script>
<script src="https://cdn.jsdelivr.net/npm/codemirror@5/addon/edit/closebrackets.js"></script>
<script src="https://cdn.jsdelivr.net/npm/codemirror@5/addon/edit/matchbrackets.js"></script>
<script src="https://cdn.jsdelivr.net/npm/codemirror@5/addon/comment/comment.js"></script>
<!-- Pyodide -->
<script src="https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js"></script>

<style>
  :root {
    --bg:      #0d0d18;
    --surface: #13131f;
    --surface2:#1a1a2b;
    --border:  #252540;
    --accent:  #7c6af7;
    --accent2: #e94560;
    --text:    #c8c8e0;
    --muted:   #55557a;
    --green:   #3ddc84;
    --yellow:  #f0a500;
    --red:     #e05555;
    --mono:    'JetBrains Mono','Fira Code','Cascadia Code',monospace;
  }

  .cr-root {
    background: var(--bg);
    color: var(--text);
    font-family: var(--mono);
    min-height: 100vh;
    padding: 1.75rem 1.5rem 2rem;
    box-sizing: border-box;
  }

  /* ── Header ─────────────────────────────────────────── */
  .cr-header {
    display: flex;
    align-items: baseline;
    gap: 0.9rem;
    margin-bottom: 1.5rem;
  }
  .cr-title {
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 3px;
    color: var(--accent);
    text-transform: uppercase;
  }
  .cr-title span { color: var(--accent2); }
  .cr-subtitle {
    font-size: 0.72rem;
    color: var(--muted);
    letter-spacing: 0.5px;
  }

  /* ── Tabs ───────────────────────────────────────────── */
  .cr-tabs {
    display: flex;
    gap: 2px;
    margin-bottom: 0;
  }
  .cr-tab {
    padding: 0.45rem 1.3rem;
    border: 1px solid var(--border);
    border-bottom: none;
    border-radius: 6px 6px 0 0;
    background: var(--surface);
    color: var(--muted);
    cursor: pointer;
    font-family: var(--mono);
    font-size: 0.78rem;
    letter-spacing: 0.5px;
    transition: all 0.15s;
    position: relative;
    top: 1px;
  }
  .cr-tab:hover { color: var(--text); }
  .cr-tab.active {
    background: var(--bg);
    color: var(--accent);
    border-color: var(--border);
    border-bottom-color: var(--bg);
    z-index: 1;
  }
  .cr-tab[data-lang="python"].active  { color: #4ec9b0; }
  .cr-tab[data-lang="javascript"].active { color: #dcdcaa; }
  .cr-tab[data-lang="java"].active    { color: #f28b54; }
  .cr-tab[data-lang="cpp"].active,
  .cr-tab[data-lang="c"].active,
  .cr-tab[data-lang="csharp"].active  { color: #9cdcfe; }

  /* ── C-family dropdown tab ──────────────────────────── */
  .cr-tab-dropdown {
    position: relative;
    top: 1px;
  }
  .cr-tab-dropdown .cr-tab {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    top: 0;
  }
  .cr-tab-dropdown .cr-tab .cr-arrow {
    font-size: 0.6rem;
    opacity: 0.6;
    transition: transform 0.15s;
  }
  .cr-tab-dropdown:hover .cr-tab .cr-arrow,
  .cr-tab-dropdown.open  .cr-tab .cr-arrow { transform: rotate(180deg); opacity: 1; }

  .cr-dropdown-menu {
    display: none;
    position: absolute;
    top: calc(100% + 2px);
    left: 0;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 0 6px 6px 6px;
    z-index: 100;
    min-width: 100%;
    overflow: hidden;
    box-shadow: 0 6px 24px rgba(0,0,0,0.5);
  }
  .cr-tab-dropdown:hover .cr-dropdown-menu,
  .cr-tab-dropdown.open  .cr-dropdown-menu { display: block; }

  .cr-dropdown-item {
    display: block;
    width: 100%;
    padding: 0.45rem 1rem;
    background: transparent;
    border: none;
    color: var(--muted);
    font-family: var(--mono);
    font-size: 0.78rem;
    text-align: left;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.1s, color 0.1s;
    box-sizing: border-box;
  }
  .cr-dropdown-item:hover { background: var(--border); color: var(--text); }
  .cr-dropdown-item.active { color: #9cdcfe; }

  /* ── Workspace shell ────────────────────────────────── */
  .cr-workspace {
    border: 1px solid var(--border);
    border-radius: 0 8px 8px 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 40px rgba(0,0,0,0.45);
  }

  /* ── Toolbar ────────────────────────────────────────── */
  .cr-toolbar {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 0.55rem 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.55rem;
  }
  .cr-run-btn {
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 5px;
    padding: 0.38rem 1rem 0.38rem 0.85rem;
    font-family: var(--mono);
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: filter 0.15s;
    letter-spacing: 0.3px;
  }
  .cr-run-btn:hover:not(:disabled) { filter: brightness(1.15); }
  .cr-run-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .cr-icon-btn {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--muted);
    border-radius: 5px;
    padding: 0.35rem 0.75rem;
    font-family: var(--mono);
    font-size: 0.78rem;
    cursor: pointer;
    transition: all 0.15s;
  }
  .cr-icon-btn:hover { border-color: var(--accent2); color: var(--accent2); }

  .cr-kbd {
    font-size: 0.65rem;
    color: var(--muted);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 0.1rem 0.35rem;
    background: var(--surface2);
  }

  .cr-status {
    font-size: 0.7rem;
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
  .cr-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    display: inline-block;
    background: currentColor;
  }
  .cr-status.ready   { color: var(--green); }
  .cr-status.loading { color: var(--yellow); }
  .cr-status.error   { color: var(--red); }
  .cr-status.loading .cr-dot {
    animation: pulse 1s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* ── Panes ──────────────────────────────────────────── */
  .cr-panes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 460px;
  }
  @media (max-width: 720px) {
    .cr-panes { grid-template-columns: 1fr; }
  }

  .cr-editor-col {
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .cr-output-col {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .cr-pane-bar {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 0.28rem 0.8rem;
    font-size: 0.65rem;
    color: var(--muted);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    user-select: none;
  }
  .cr-pane-bar-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--border);
  }

  /* CodeMirror overrides */
  .CodeMirror {
    height: 100%;
    min-height: 400px;
    font-family: var(--mono) !important;
    font-size: 0.875rem !important;
    line-height: 1.65 !important;
    background: var(--bg) !important;
  }
  .CodeMirror-scroll { min-height: 400px; }
  .CodeMirror-gutters {
    background: var(--surface) !important;
    border-right: 1px solid var(--border) !important;
  }
  .CodeMirror-linenumber { color: var(--muted) !important; font-size: 0.75rem; }
  .CodeMirror-cursor { border-left: 2px solid var(--accent) !important; }
  .CodeMirror-selected { background: rgba(124,106,247,0.2) !important; }
  .CodeMirror-focused .CodeMirror-selected { background: rgba(124,106,247,0.25) !important; }
  /* Dracula theme adjustments */
  .cm-s-dracula .CodeMirror-gutters { background: var(--surface) !important; }
  .cm-s-dracula.CodeMirror { background: var(--bg) !important; }

  /* ── Output ─────────────────────────────────────────── */
  #cr-output {
    flex: 1;
    background: #070710;
    color: var(--text);
    font-family: var(--mono);
    font-size: 0.84rem;
    padding: 0.85rem 1rem;
    overflow-y: auto;
    min-height: 400px;
    white-space: pre-wrap;
    word-break: break-word;
    line-height: 1.6;
  }
  .out-stdout { color: #c8c8e0; }
  .out-stderr { color: #e05555; }
  .out-info   { color: var(--muted); font-style: italic; }
  .out-success{ color: var(--green); }
  .out-input  { color: #7ec8e3; font-style: italic; }
  .out-time {
    display: block;
    margin-top: 0.5rem;
    color: var(--muted);
    font-size: 0.7rem;
    border-top: 1px solid var(--border);
    padding-top: 0.4rem;
  }

  /* ── Stdin ──────────────────────────────────────────── */
  .cr-stdin-section {
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
  }
  #cr-stdin {
    background: var(--surface2);
    color: var(--text);
    font-family: var(--mono);
    font-size: 0.8rem;
    border: none;
    outline: none;
    padding: 0.55rem 0.85rem;
    width: 100%;
    box-sizing: border-box;
    resize: vertical;
    min-height: 52px;
    line-height: 1.5;
  }
  #cr-stdin::placeholder { color: var(--muted); }

  /* ── Footer note ────────────────────────────────────── */
  .cr-footnote {
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 0.4rem 0.85rem;
    font-size: 0.68rem;
    color: var(--muted);
    display: none;
  }
  .cr-footnote code {
    color: #f28b54;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 0 0.3rem;
  }
</style>

<div class="cr-root">
  <div class="cr-header">
    <div class="cr-title">Code<span>Runner</span></div>
    <span class="cr-subtitle">Python · JavaScript · Java &nbsp;·&nbsp; Ctrl+Enter to run</span>
  </div>

  <div class="cr-tabs">
    <button class="cr-tab active" data-lang="python">&#x1F40D; Python</button>
    <button class="cr-tab" data-lang="javascript">&#x26A1; JavaScript</button>
    <button class="cr-tab" data-lang="java">&#x2615; Java</button>
    <div class="cr-tab-dropdown" id="cr-c-dropdown">
      <button class="cr-tab" id="cr-c-tab">&#x2699; C++ <span class="cr-arrow">&#9660;</span></button>
      <div class="cr-dropdown-menu">
        <button class="cr-dropdown-item active" data-lang="cpp">C++</button>
        <button class="cr-dropdown-item" data-lang="c">C</button>
        <button class="cr-dropdown-item" data-lang="csharp">C#</button>
      </div>
    </div>
  </div>

  <div class="cr-workspace">
    <!-- Toolbar -->
    <div class="cr-toolbar">
      <button class="cr-run-btn" id="cr-run">&#9654; Run</button>
      <button class="cr-icon-btn" id="cr-clear">Clear</button>
      <span class="cr-kbd">Ctrl+Enter</span>
      <div class="cr-status loading" id="cr-status">
        <span class="cr-dot"></span>
        <span id="cr-status-text">Loading Python…</span>
      </div>
    </div>

    <!-- Panes -->
    <div class="cr-panes">
      <!-- Editor -->
      <div class="cr-editor-col">
        <div class="cr-pane-bar">
          <div class="cr-pane-bar-dot"></div>
          Editor
        </div>
        <div id="cr-editor-host"></div>
        <div class="cr-stdin-section" id="cr-stdin-section">
          <div class="cr-pane-bar">
            <div class="cr-pane-bar-dot"></div>
            stdin &nbsp;<span style="font-style:italic;letter-spacing:0">(optional)</span>
          </div>
          <textarea id="cr-stdin" placeholder="Input for your program…" spellcheck="false"></textarea>
        </div>
      </div>

      <!-- Output -->
      <div class="cr-output-col">
        <div class="cr-pane-bar">
          <div class="cr-pane-bar-dot"></div>
          Output
        </div>
        <div id="cr-output"><span class="out-info">Output will appear here…</span></div>
      </div>
    </div>

    <div class="cr-footnote" id="cr-api-note"></div>
  </div>
</div>

<script>
(function () {
  /* ── Snippets ─────────────────────────────────────────── */
  const snippets = {
    python: `# Python — runs in-browser via Pyodide
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))

squares = [i ** 2 for i in range(1, 8)]
print("Squares:", squares)
`,
    javascript: `// JavaScript — runs in-browser
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));

const squares = Array.from({length: 7}, (_, i) => (i + 1) ** 2);
console.log("Squares:", squares.join(", "));
`,
    java: `// Java — runs via Judge0 API
// Public class must be named Main
public class Main {
    static String greet(String name) {
        return "Hello, " + name + "!";
    }

    public static void main(String[] args) {
        System.out.println(greet("World"));

        int[] squares = new int[7];
        for (int i = 0; i < 7; i++) squares[i] = (i + 1) * (i + 1);

        System.out.print("Squares: ");
        for (int i = 0; i < squares.length; i++) {
            if (i > 0) System.out.print(", ");
            System.out.print(squares[i]);
        }
        System.out.println();
    }
}
`,
    cpp: `// C++ — runs via Judge0 API
#include <iostream>
#include <vector>
using namespace std;

string greet(const string& name) {
    return "Hello, " + name + "!";
}

int main() {
    cout << greet("World") << endl;

    vector<int> squares;
    for (int i = 1; i <= 7; i++) squares.push_back(i * i);

    cout << "Squares: ";
    for (int i = 0; i < (int)squares.size(); i++) {
        if (i > 0) cout << ", ";
        cout << squares[i];
    }
    cout << endl;
    return 0;
}
`,
    c: `// C — runs via Judge0 API
#include <stdio.h>
#include <string.h>

void greet(const char* name, char* out) {
    strcpy(out, "Hello, ");
    strcat(out, name);
    strcat(out, "!");
}

int main() {
    char msg[64];
    greet("World", msg);
    printf("%s\\n", msg);

    int squares[7];
    for (int i = 0; i < 7; i++) squares[i] = (i + 1) * (i + 1);

    printf("Squares: ");
    for (int i = 0; i < 7; i++) {
        if (i > 0) printf(", ");
        printf("%d", squares[i]);
    }
    printf("\\n");
    return 0;
}
`,
    csharp: `// C# — runs via Judge0 API
using System;
using System.Linq;

class Program {
    static string Greet(string name) => $"Hello, {name}!";

    static void Main() {
        Console.WriteLine(Greet("World"));

        var squares = Enumerable.Range(1, 7).Select(i => i * i);
        Console.WriteLine("Squares: " + string.Join(", ", squares));
    }
}
`,
  };

  const langMode = { python: 'python', javascript: 'javascript', java: 'text/x-java', cpp: 'text/x-c++src', c: 'text/x-csrc', csharp: 'text/x-csharp' };

  /* ── CodeMirror init ──────────────────────────────────── */
  const cm = CodeMirror(document.getElementById('cr-editor-host'), {
    value: snippets.python,
    mode: 'python',
    theme: 'dracula',
    lineNumbers: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    lineWrapping: false,
    extraKeys: {
      'Tab': cm => cm.execCommand('insertSoftTab'),
      'Ctrl-Enter': () => runBtn.click(),
      'Cmd-Enter':  () => runBtn.click(),
    },
  });

  /* ── DOM refs ─────────────────────────────────────────── */
  const output     = document.getElementById('cr-output');
  const runBtn     = document.getElementById('cr-run');
  const clearBtn   = document.getElementById('cr-clear');
  const statusEl   = document.getElementById('cr-status');
  const statusTxt  = document.getElementById('cr-status-text');
  const stdinEl    = document.getElementById('cr-stdin');
  const stdinSec   = document.getElementById('cr-stdin-section');
  const apiNoteEl  = document.getElementById('cr-api-note');

  let currentLang = 'python';
  let pyodide = null;
  let pyodideReady = false;

  /* ── Helpers ──────────────────────────────────────────── */
  function setStatus(msg, cls) {
    statusEl.className = 'cr-status ' + cls;
    statusTxt.textContent = msg;
  }

  function appendOutput(html) {
    output.innerHTML += html;
    output.scrollTop = output.scrollHeight;
  }

  function clearOutput() { output.innerHTML = ''; }

  function escHtml(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  const cFamilyLangs = new Set(['cpp', 'c', 'csharp']);
  const cTabBtn      = document.getElementById('cr-c-tab');
  const cDropdown    = document.getElementById('cr-c-dropdown');
  const cDropItems   = document.querySelectorAll('.cr-dropdown-item');

  const apiNotes = {
    java:   'Java runs via <strong>Piston</strong> &mdash; class must be named <code>Main</code>.',
    cpp:    'C++ runs via <strong>Piston</strong>.',
    c:      'C runs via <strong>Piston</strong>.',
    csharp: 'C# runs via <strong>Piston</strong>.',
  };

  function switchLang(lang) {
    snippets[currentLang] = cm.getValue();
    currentLang = lang;
    cm.setValue(snippets[lang]);
    cm.setOption('mode', langMode[lang]);
    clearOutput();

    // Update plain tabs
    document.querySelectorAll('.cr-tab:not(#cr-c-tab)').forEach(t => t.classList.remove('active'));
    cTabBtn.classList.remove('active');

    if (cFamilyLangs.has(lang)) {
      // Mark the dropdown trigger as active and update its label
      cTabBtn.classList.add('active');
      const labels = { cpp: 'C++', c: 'C', csharp: 'C#' };
      cTabBtn.childNodes[0].textContent = '⚙ ' + labels[lang] + ' ';
      // Mark the chosen item inside the dropdown
      cDropItems.forEach(i => i.classList.toggle('active', i.dataset.lang === lang));
    }

    const isApi = lang in apiNotes && lang !== 'python' && lang !== 'javascript';
    apiNoteEl.style.display = isApi ? 'block' : 'none';
    if (isApi) apiNoteEl.innerHTML = apiNotes[lang];
    stdinSec.style.display = lang === 'javascript' ? 'none' : 'flex';
    updateStatus();
    cm.focus();
  }

  /* ── Language switching ───────────────────────────────── */
  // Plain tabs (Python, JS, Java)
  document.querySelectorAll('.cr-tab:not(#cr-c-tab)').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cr-tab:not(#cr-c-tab)').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      switchLang(tab.dataset.lang);
    });
  });

  // Dropdown items
  cDropItems.forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      switchLang(item.dataset.lang);
      cDropdown.classList.remove('open');
    });
  });

  // Toggle dropdown on trigger click (for touch / keyboard)
  cTabBtn.addEventListener('click', () => {
    cDropdown.classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!cDropdown.contains(e.target)) cDropdown.classList.remove('open');
  });

  const statusLabels = { java: 'Java', cpp: 'C++', c: 'C', csharp: 'C#' };
  function updateStatus() {
    if (currentLang === 'python')
      pyodideReady ? setStatus('Python ready', 'ready') : setStatus('Loading Python…', 'loading');
    else if (currentLang === 'javascript')
      setStatus('JS ready', 'ready');
    else
      setStatus((statusLabels[currentLang] || currentLang) + ' via Piston', 'ready');
  }

  /* ── Load Pyodide ─────────────────────────────────────── */
  async function loadPy() {
    try {
      pyodide = await loadPyodide();
      pyodideReady = true;
      if (currentLang === 'python') setStatus('Python ready', 'ready');
    } catch {
      if (currentLang === 'python') setStatus('Pyodide failed', 'error');
    }
  }

  /* ── Python ───────────────────────────────────────────── */
  async function runPython(code, stdin) {
    if (!pyodideReady) {
      appendOutput('<span class="out-info">Pyodide still loading, please wait…</span>\n');
      return;
    }
    const t0 = performance.now();

    // Pre-filled stdin lines (from the stdin box)
    const stdinLines = stdin.trim() ? stdin.split('\n') : [];

    // Flush any buffered output to the terminal immediately
    function flushOut() {
      if (outBuf) {
        appendOutput('<span class="out-stdout">' + escHtml(outBuf) + '</span>');
        outBuf = '';
      }
      if (errBuf) {
        appendOutput('<span class="out-stderr">' + escHtml(errBuf) + '</span>');
        errBuf = '';
      }
    }

    let outBuf = '', errBuf = '';

    pyodide.setStdout({ batched: s => { outBuf += s + '\n'; } });
    pyodide.setStderr({ batched: s => { errBuf += s + '\n'; } });
    pyodide.setStdin({
      stdin: () => {
        // Flush buffered output first so the user sees the prompt
        flushOut();

        let val;
        if (stdinLines.length) {
          // Use pre-filled stdin if available
          val = stdinLines.shift();
        } else {
          // Fall back to a browser prompt dialog (synchronous — only option in main thread)
          val = window.prompt('⌨  Python input()') ?? '';
        }

        // Echo the typed value into the terminal so it looks interactive
        appendOutput('<span class="out-input">' + escHtml(val) + '\n</span>');
        return val + '\n';
      }
    });

    try {
      await pyodide.runPythonAsync(code);
      flushOut();
      const ms = (performance.now() - t0).toFixed(1);
      appendOutput('<span class="out-time">&#10003; exited in ' + ms + ' ms</span>');
    } catch (err) {
      flushOut();
      appendOutput('<span class="out-stderr">' + escHtml(String(err)) + '</span>\n');
    } finally {
      pyodide.setStdout({ batched: s => console.log(s) });
      pyodide.setStderr({ batched: s => console.warn(s) });
      pyodide.setStdin({});
    }
  }

  /* ── JavaScript ───────────────────────────────────────── */
  function runJS(code) {
    const t0 = performance.now();
    const logs = [];
    const o = console.log, w = console.warn, e = console.error;
    const fmt = a => a.map(x => typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x)).join(' ');
    console.log   = (...a) => { logs.push({t:'stdout',v:fmt(a)}); o(...a); };
    console.warn  = (...a) => { logs.push({t:'stderr',v:fmt(a)}); w(...a); };
    console.error = (...a) => { logs.push({t:'stderr',v:fmt(a)}); e(...a); };
    try {
      const result = (new Function(code))();
      const ms = (performance.now() - t0).toFixed(1);
      logs.forEach(l => appendOutput(
        '<span class="out-' + (l.t==='stderr'?'stderr':'stdout') + '">' + escHtml(l.v) + '\n</span>'
      ));
      if (result !== undefined)
        appendOutput('<span class="out-success">&#8617; ' + escHtml(JSON.stringify(result,null,2)) + '\n</span>');
      appendOutput('<span class="out-time">&#10003; exited in ' + ms + ' ms</span>');
    } catch (err) {
      logs.forEach(l => appendOutput(
        '<span class="out-' + (l.t==='stderr'?'stderr':'stdout') + '">' + escHtml(l.v) + '\n</span>'
      ));
      appendOutput('<span class="out-stderr">' + escHtml(String(err)) + '\n</span>');
    } finally {
      console.log = o; console.warn = w; console.error = e;
    }
  }

  /* ── Java / C / C++ / C# via Piston ─────────────────── */
  // Piston API — free, no key, synchronous (no polling)
  const PISTON = 'https://emkc.org/api/v2/piston/execute';
  const PISTON_LANG = { java: 'java', cpp: 'c++', c: 'c', csharp: 'csharp' };

  async function runViaPiston(lang, code, stdin) {
    const label = statusLabels[lang] || lang;
    setStatus('Running…', 'loading');
    runBtn.disabled = true;
    appendOutput('<span class="out-info">Running ' + label + '…\n</span>');
    try {
      const res = await fetch(PISTON, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: PISTON_LANG[lang],
          version:  '*',
          files:    [{ content: code }],
          stdin:    stdin,
        }),
      });
      if (!res.ok) throw new Error('Piston error: HTTP ' + res.status);
      const data = await res.json();
      if (data.message) throw new Error(data.message);

      const run     = data.run     || {};
      const compile = data.compile || {};

      const compileErr = compile.stderr || compile.output || '';
      const stdout     = run.stdout || '';
      const stderr     = run.stderr || '';
      const exitCode   = run.code ?? compile.code;
      const ver        = data.version ? ' · v' + data.version : '';

      if (compileErr) appendOutput('<span class="out-stderr">' + escHtml(compileErr) + '</span>');
      if (stdout)     appendOutput('<span class="out-stdout">' + escHtml(stdout) + '</span>');
      if (stderr)     appendOutput('<span class="out-stderr">' + escHtml(stderr) + '</span>');

      const exitLabel = exitCode === 0 ? '&#10003; exited 0' : '&#10007; exited ' + exitCode;
      appendOutput('<span class="out-time">' + exitLabel + ver + '</span>');
      setStatus(label + ' ready', 'ready');
    } catch (err) {
      appendOutput('<span class="out-stderr">' + escHtml(String(err)) + '\n</span>');
      setStatus('Error', 'error');
    } finally {
      runBtn.disabled = false;
    }
  }

  /* ── Dispatcher ───────────────────────────────────────── */
  async function runCode() {
    clearOutput();
    const code  = cm.getValue();
    const stdin = stdinEl.value;
    if (!code.trim()) { appendOutput('<span class="out-info">Nothing to run.</span>'); return; }
    if (currentLang === 'python') {
      runBtn.disabled = true;
      await runPython(code, stdin);
      runBtn.disabled = false;
    } else if (currentLang === 'javascript') {
      runJS(code);
    } else {
      await runViaPiston(currentLang, code, stdin);
    }
  }

  runBtn.addEventListener('click', runCode);
  clearBtn.addEventListener('click', () => { clearOutput(); stdinEl.value = ''; });

  /* ── Init ─────────────────────────────────────────────── */
  stdinSec.style.display = 'flex';
  cm.focus();
  loadPy();
})();
</script>
