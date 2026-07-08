#!/usr/bin/env python3
"""
link_shredder.py — shred a URL into its raw characters and flag anything
that could be a Unicode homograph attack (e.g. a Cyrillic "а" standing
in for a Latin "a" to spoof a domain name).

Usage:
    python3 link_shredder.py <url>
    python3 link_shredder.py            # interactive prompt

No third-party dependencies — pure standard library.
"""

import sys
import unicodedata
from urllib.parse import urlsplit

# ---------------------------------------------------------------------------
# 1. Script detection (rough but effective ranges for the scripts most used
#    in homograph/phishing attacks — Cyrillic, Greek, Armenian, Cherokee, etc.)
# ---------------------------------------------------------------------------

SCRIPT_RANGES = [
    ("Latin",     (0x0041, 0x005A), (0x0061, 0x007A), (0x00C0, 0x024F)),
    ("Cyrillic",  (0x0400, 0x04FF), (0x0500, 0x052F)),
    ("Greek",     (0x0370, 0x03FF)),
    ("Armenian",  (0x0530, 0x058F)),
    ("Hebrew",    (0x0590, 0x05FF)),
    ("Arabic",    (0x0600, 0x06FF)),
    ("Cherokee",  (0x13A0, 0x13FF)),
    ("Han",       (0x4E00, 0x9FFF)),
    ("Hiragana",  (0x3040, 0x309F)),
    ("Katakana",  (0x30A0, 0x30FF)),
    ("Hangul",    (0xAC00, 0xD7A3)),
]

def script_of(cp: int) -> str:
    # Plain ASCII digits, punctuation, and separators (., -, 0-9, etc.) are
    # "Common" characters shared by every script — they should never trigger
    # a mixed-script flag on their own (e.g. the dots in "google.com").
    if cp < 0x80 and not (0x41 <= cp <= 0x5A or 0x61 <= cp <= 0x7A):
        return "Common"
    for name, *ranges in SCRIPT_RANGES:
        for lo, hi in ranges:
            if lo <= cp <= hi:
                return name
    return "Other"

# ---------------------------------------------------------------------------
# 2. Known confusable characters — non-Latin letters that are near-identical
#    to common Latin letters. This is a hand-picked subset covering the
#    characters actually used in real phishing domains; not exhaustive.
# ---------------------------------------------------------------------------

CONFUSABLES = {
    0x0430: "a",  # Cyrillic а   -> Latin a
    0x0435: "e",  # Cyrillic е   -> Latin e
    0x043E: "o",  # Cyrillic о   -> Latin o
    0x0440: "p",  # Cyrillic р   -> Latin p
    0x0441: "c",  # Cyrillic с   -> Latin c
    0x0445: "x",  # Cyrillic х   -> Latin x
    0x0455: "s",  # Cyrillic ѕ   -> Latin s
    0x0456: "i",  # Cyrillic і   -> Latin i
    0x0458: "j",  # Cyrillic ј   -> Latin j
    0x0443: "y",  # Cyrillic у   -> Latin y
    0x0410: "A",  # Cyrillic А   -> Latin A
    0x0412: "B",  # Cyrillic В   -> Latin B
    0x0415: "E",  # Cyrillic Е   -> Latin E
    0x041A: "K",  # Cyrillic К   -> Latin K
    0x041C: "M",  # Cyrillic М   -> Latin M
    0x041D: "H",  # Cyrillic Н   -> Latin H
    0x041E: "O",  # Cyrillic О   -> Latin O
    0x0420: "P",  # Cyrillic Р   -> Latin P
    0x0421: "C",  # Cyrillic С   -> Latin C
    0x0422: "T",  # Cyrillic Т   -> Latin T
    0x0425: "X",  # Cyrillic Х   -> Latin X
    0x03B1: "a",  # Greek alpha  -> Latin a
    0x03BF: "o",  # Greek omicron -> Latin o
    0x0391: "A",  # Greek Alpha  -> Latin A
    0x0392: "B",  # Greek Beta   -> Latin B
    0x0395: "E",  # Greek Epsilon-> Latin E
    0x0397: "H",  # Greek Eta    -> Latin H
    0x0399: "I",  # Greek Iota   -> Latin I
    0x039A: "K",  # Greek Kappa  -> Latin K
    0x039C: "M",  # Greek Mu     -> Latin M
    0x039D: "N",  # Greek Nu     -> Latin N
    0x039F: "O",  # Greek Omicron-> Latin O
    0x03A1: "P",  # Greek Rho    -> Latin P
    0x03A4: "T",  # Greek Tau    -> Latin T
    0x03A5: "Y",  # Greek Upsilon-> Latin Y
    0x03A7: "X",  # Greek Chi    -> Latin X
    0x0501: "d",  # Cyrillic ԁ   -> Latin d
    0x051B: "q",  # Cyrillic ԛ   -> Latin q
    0x0561: "n",  # Armenian ա-ish region, approx -> illustrative only
}

# ---------------------------------------------------------------------------
# 3. Core shredder
# ---------------------------------------------------------------------------

def extract_host(raw: str) -> str:
    """Pull just the hostname out of a URL (adds a scheme if missing)."""
    candidate = raw.strip()
    if "://" not in candidate:
        candidate = "http://" + candidate
    parts = urlsplit(candidate)
    return parts.hostname or candidate

def decode_punycode_labels(host: str):
    """Return list of (label, decoded_unicode_or_None) for each dot-separated label."""
    labels = []
    for label in host.split("."):
        if label.lower().startswith("xn--"):
            try:
                decoded = label.encode("ascii").decode("idna")
            except Exception:
                decoded = None
            labels.append((label, decoded))
        else:
            labels.append((label, None))
    return labels

def shred(host: str):
    """Break the host into a per-character report."""
    rows = []
    for ch in host:
        cp = ord(ch)
        try:
            name = unicodedata.name(ch)
        except ValueError:
            name = "UNNAMED"
        script = script_of(cp)
        confusable_for = CONFUSABLES.get(cp)
        rows.append({
            "char": ch,
            "codepoint": f"U+{cp:04X}",
            "name": name,
            "script": script,
            "looks_like": confusable_for,
        })
    return rows

def analyze(raw_url: str):
    host = extract_host(raw_url)
    puny_labels = decode_punycode_labels(host)

    # If any label was punycode, analyze the *decoded* unicode form, since
    # that's what actually renders in a browser address bar.
    display_host = ".".join(dec if dec else lbl for lbl, dec in puny_labels)

    rows = shred(display_host)

    has_confusable = any(r["looks_like"] for r in rows)

    # Mixed-script check: 2+ distinct real scripts present, ignoring "Common"
    # (digits/dots/hyphens) and "Other" (unclassified) buckets.
    distinct_scripts = {r["script"] for r in rows}
    distinct_scripts.discard("Other")
    distinct_scripts.discard("Common")
    is_suspicious_mix = len(distinct_scripts) > 1

    verdict = "SUSPICIOUS" if (has_confusable or is_suspicious_mix or any(dec for _, dec in puny_labels)) else "OK"

    return {
        "input": raw_url,
        "host": host,
        "display_host": display_host,
        "punycode_labels": puny_labels,
        "rows": rows,
        "distinct_scripts": distinct_scripts,
        "has_confusable": has_confusable,
        "is_suspicious_mix": is_suspicious_mix,
        "verdict": verdict,
    }

# ---------------------------------------------------------------------------
# 4. Pretty printing
# ---------------------------------------------------------------------------

def print_report(report):
    print("=" * 70)
    print(f"URL:          {report['input']}")
    print(f"Host:         {report['host']}")
    if report["host"] != report["display_host"]:
        print(f"Decoded host: {report['display_host']}  (punycode decoded)")
    print("-" * 70)

    for lbl, dec in report["punycode_labels"]:
        if dec:
            print(f"  ⚠ Punycode label '{lbl}' decodes to: '{dec}'")

    print(f"{'Char':<6}{'Codepoint':<12}{'Script':<12}{'Unicode Name':<35}{'Looks like'}")
    for r in report["rows"]:
        flag = f"'{r['looks_like']}' ⚠" if r["looks_like"] else ""
        print(f"{r['char']:<6}{r['codepoint']:<12}{r['script']:<12}{r['name']:<35}{flag}")

    print("-" * 70)
    print(f"Scripts detected: {', '.join(sorted(report['distinct_scripts'])) or 'none'}")
    if report["is_suspicious_mix"]:
        print("⚠ Multiple scripts mixed in one hostname — classic homograph red flag.")
    if report["has_confusable"]:
        print("⚠ Contains character(s) that visually mimic Latin letters.")
    print(f"VERDICT: {report['verdict']}")
    print("=" * 70)

# ---------------------------------------------------------------------------
# 5. CLI entry point
# ---------------------------------------------------------------------------

def main():
    if len(sys.argv) > 1:
        urls = sys.argv[1:]
    else:
        urls = [input("Enter a URL to shred: ").strip()]

    for u in urls:
        report = analyze(u)
        print_report(report)

if __name__ == "__main__":
    main()