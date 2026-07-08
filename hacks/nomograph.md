---
layout: base
title: URL Homograph Detector
permalink: /nomograph/
---

<style>
  #nomo-wrap {
    max-width: 700px;
    margin: 2rem auto;
    font-family: monospace;
  }
  #nomo-input {
    width: 100%;
    padding: 0.6rem 0.8rem;
    font-size: 1rem;
    font-family: monospace;
    border: 2px solid #555;
    background: #111;
    color: #eee;
    border-radius: 4px;
    box-sizing: border-box;
  }
  #nomo-btn {
    margin-top: 0.6rem;
    padding: 0.5rem 1.4rem;
    font-size: 1rem;
    cursor: pointer;
    background: #222;
    color: #eee;
    border: 2px solid #888;
    border-radius: 4px;
  }
  #nomo-btn:hover { background: #333; }
  #nomo-out {
    margin-top: 1.2rem;
    display: none;
  }
  #verdict {
    font-size: 1.3rem;
    font-weight: bold;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    display: inline-block;
    margin-bottom: 1rem;
  }
  .ok      { background: #1a4a1a; color: #6f6; }
  .sus     { background: #4a1a1a; color: #f66; }
  #nomo-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }
  #nomo-table th {
    text-align: left;
    border-bottom: 2px solid #555;
    padding: 0.3rem 0.5rem;
    color: #aaa;
  }
  #nomo-table td {
    padding: 0.25rem 0.5rem;
    border-bottom: 1px solid #333;
  }
  .flag-row td { background: #3a1a1a; color: #f88; }
  .warn { color: #f88; }
  #nomo-flags { margin-top: 0.8rem; }
  #nomo-flags p { margin: 0.2rem 0; }
</style>

<div id="nomo-wrap">
  <h2>URL Homograph Detector</h2>
  <p>Paste any URL — the tool shreds it character-by-character and flags Unicode look-alikes used in phishing attacks.</p>
  <input id="nomo-input" type="text" placeholder="https://example.com" />
  <br>
  <button id="nomo-btn" onclick="runAnalyze()">Analyze</button>

  <div id="nomo-out">
    <div id="verdict"></div>
    <table id="nomo-table">
      <thead>
        <tr>
          <th>Char</th>
          <th>Codepoint</th>
          <th>Script</th>
          <th>Unicode Name</th>
          <th>Looks like</th>
        </tr>
      </thead>
      <tbody id="nomo-tbody"></tbody>
    </table>
    <div id="nomo-flags"></div>
  </div>
</div>

<script>
const SCRIPT_RANGES = [
  ["Latin",    [0x0041,0x005A],[0x0061,0x007A],[0x00C0,0x024F]],
  ["Cyrillic", [0x0400,0x04FF],[0x0500,0x052F]],
  ["Greek",    [0x0370,0x03FF]],
  ["Armenian", [0x0530,0x058F]],
  ["Hebrew",   [0x0590,0x05FF]],
  ["Arabic",   [0x0600,0x06FF]],
  ["Cherokee", [0x13A0,0x13FF]],
  ["Han",      [0x4E00,0x9FFF]],
  ["Hiragana", [0x3040,0x309F]],
  ["Katakana", [0x30A0,0x30FF]],
  ["Hangul",   [0xAC00,0xD7A3]],
];

const CONFUSABLES = {
  0x0430:"a", 0x0435:"e", 0x043E:"o", 0x0440:"p", 0x0441:"c",
  0x0445:"x", 0x0455:"s", 0x0456:"i", 0x0458:"j", 0x0443:"y",
  0x0410:"A", 0x0412:"B", 0x0415:"E", 0x041A:"K", 0x041C:"M",
  0x041D:"H", 0x041E:"O", 0x0420:"P", 0x0421:"C", 0x0422:"T",
  0x0425:"X", 0x03B1:"a", 0x03BF:"o", 0x0391:"A", 0x0392:"B",
  0x0395:"E", 0x0397:"H", 0x0399:"I", 0x039A:"K", 0x039C:"M",
  0x039D:"N", 0x039F:"O", 0x03A1:"P", 0x03A4:"T", 0x03A5:"Y",
  0x03A7:"X", 0x0501:"d", 0x051B:"q", 0x0561:"n",
};

function scriptOf(cp) {
  if (cp < 0x80 && !((cp >= 0x41 && cp <= 0x5A) || (cp >= 0x61 && cp <= 0x7A)))
    return "Common";
  for (const [name, ...ranges] of SCRIPT_RANGES)
    for (const [lo, hi] of ranges)
      if (cp >= lo && cp <= hi) return name;
  return "Other";
}

function extractHost(raw) {
  let s = raw.trim();
  // Strip scheme manually — never use URL API here, it normalizes
  // Unicode characters to Punycode before we can inspect them.
  if (s.includes("://")) s = s.split("://")[1];
  // Strip path, query, fragment, port
  s = s.split("/")[0].split("?")[0].split("#")[0];
  s = s.replace(/:\d+$/, "");
  return s;
}

// RFC 3492 punycode decoder — needed because URL API keeps xn-- labels as-is
function decodePunycode(input) {
  const base=36, tMin=1, tMax=26, skew=38, damp=700, initBias=72, initN=128;
  function digit(c) {
    if (c>=0x30&&c<=0x39) return c-0x16;
    if (c>=0x41&&c<=0x5A) return c-0x41;
    if (c>=0x61&&c<=0x7A) return c-0x61;
    return base;
  }
  function adapt(d, n, first) {
    d = first ? Math.floor(d/damp) : d>>1;
    d += Math.floor(d/n);
    let k=0;
    while (d > Math.floor(((base-tMin)*tMax)/2)) { d=Math.floor(d/(base-tMin)); k+=base; }
    return k + Math.floor(((base-tMin+1)*d)/(d+skew));
  }
  input = input.toLowerCase();
  const out = [];
  let n=initN, i=0, bias=initBias;
  const sep = input.lastIndexOf('-');
  if (sep > 0) for (let j=0;j<sep;j++) out.push(input.charCodeAt(j));
  let ic = sep > 0 ? sep+1 : 0;
  while (ic < input.length) {
    const oldi=i; let w=1;
    for (let k=base;;k+=base) {
      const d=digit(input.charCodeAt(ic++));
      i += d*w;
      const t = k<=bias ? tMin : k>=bias+tMax ? tMax : k-bias;
      if (d<t) break;
      w *= base-t;
    }
    bias = adapt(i-oldi, out.length+1, oldi===0);
    n += Math.floor(i/(out.length+1));
    i %= out.length+1;
    out.splice(i,0,n); i++;
  }
  return String.fromCodePoint(...out);
}

function decodePunyLabels(host) {
  return host.split(".").map(lbl => {
    if (lbl.toLowerCase().startsWith("xn--")) {
      try {
        const decoded = decodePunycode(lbl.slice(4));
        return [lbl, decoded];
      } catch { return [lbl, null]; }
    }
    return [lbl, null];
  });
}

function runAnalyze() {
  const raw = document.getElementById("nomo-input").value;
  if (!raw.trim()) return;

  const host = extractHost(raw);
  const punyLabels = decodePunyLabels(host);
  const displayHost = punyLabels.map(([lbl, dec]) => dec || lbl).join(".");

  const rows = [];
  for (const ch of displayHost) {
    const cp = ch.codePointAt(0);
    const script = scriptOf(cp);
    const looksLike = CONFUSABLES[cp] || null;
    rows.push({ ch, cp, script, looksLike });
  }

  const hasConfusable = rows.some(r => r.looksLike);
  const scripts = new Set(rows.map(r => r.script).filter(s => s !== "Common" && s !== "Other"));
  const isMixed = scripts.size > 1;
  const hasPuny = punyLabels.some(([,dec]) => dec);
  const suspicious = hasConfusable || isMixed || hasPuny;

  // Verdict
  const vEl = document.getElementById("verdict");
  vEl.textContent = suspicious ? "⚠ SUSPICIOUS" : "✓ OK";
  vEl.className = suspicious ? "sus" : "ok";

  // Table
  const tbody = document.getElementById("nomo-tbody");
  tbody.innerHTML = "";
  for (const r of rows) {
    const tr = document.createElement("tr");
    if (r.looksLike) tr.className = "flag-row";
    const hex = "U+" + r.cp.toString(16).toUpperCase().padStart(4, "0");
    tr.innerHTML = `
      <td>${r.ch}</td>
      <td>${hex}</td>
      <td>${r.script}</td>
      <td style="font-size:0.78rem">${charName(r.cp)}</td>
      <td>${r.looksLike ? `'${r.looksLike}' ⚠` : ""}</td>
    `;
    tbody.appendChild(tr);
  }

  // Flags
  const flags = document.getElementById("nomo-flags");
  flags.innerHTML = "";
  if (hasPuny)
    flags.innerHTML += `<p class="warn">⚠ Punycode label detected — renders differently in browser address bar.</p>`;
  if (isMixed)
    flags.innerHTML += `<p class="warn">⚠ Multiple scripts mixed in hostname: ${[...scripts].join(", ")}.</p>`;
  if (hasConfusable)
    flags.innerHTML += `<p class="warn">⚠ Character(s) that visually mimic Latin letters found.</p>`;

  document.getElementById("nomo-out").style.display = "block";
}

// Approximate Unicode name lookup via codepoint description
function charName(cp) {
  const map = {
    0x0430:"CYRILLIC SMALL LETTER A", 0x0435:"CYRILLIC SMALL LETTER IE",
    0x043E:"CYRILLIC SMALL LETTER O", 0x0440:"CYRILLIC SMALL LETTER ER",
    0x0441:"CYRILLIC SMALL LETTER ES", 0x0445:"CYRILLIC SMALL LETTER HA",
    0x0410:"CYRILLIC CAPITAL LETTER A", 0x0412:"CYRILLIC CAPITAL LETTER VE",
    0x0415:"CYRILLIC CAPITAL LETTER IE", 0x041A:"CYRILLIC CAPITAL LETTER KA",
    0x041C:"CYRILLIC CAPITAL LETTER EM", 0x041D:"CYRILLIC CAPITAL LETTER EN",
    0x041E:"CYRILLIC CAPITAL LETTER O", 0x0420:"CYRILLIC CAPITAL LETTER ER",
    0x0421:"CYRILLIC CAPITAL LETTER ES", 0x0422:"CYRILLIC CAPITAL LETTER TE",
    0x0425:"CYRILLIC CAPITAL LETTER HA", 0x03B1:"GREEK SMALL LETTER ALPHA",
    0x03BF:"GREEK SMALL LETTER OMICRON", 0x0391:"GREEK CAPITAL LETTER ALPHA",
    0x0392:"GREEK CAPITAL LETTER BETA",
  };
  if (map[cp]) return map[cp];
  if (cp < 0x80) return "LATIN / ASCII";
  return `U+${cp.toString(16).toUpperCase().padStart(4,"0")}`;
}

document.getElementById("nomo-input").addEventListener("keydown", e => {
  if (e.key === "Enter") runAnalyze();
});
</script>
