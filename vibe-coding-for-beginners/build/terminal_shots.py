"""Turn a real terminal screen into a book-ready PNG.

The book's terminal screenshots are captures of the real Claude Code app, not mock-ups:
the app runs inside tmux, `tmux capture-pane -e` saves the screen with its colors, and this
script draws that capture in a terminal window frame and photographs it with Chromium.

Usage:
  tmux capture-pane -t SESSION -e -p > build/terminal/NAME.ans
  CHROMIUM_PATH=/path/to/chromium python3 build/terminal_shots.py --all
      renders every capture listed in SHOTS to manuscript/images/term-NAME.png
"""
import argparse
import html
import os
import re
import tempfile
from pathlib import Path

from ansi2html import Ansi2HTMLConverter
from playwright.sync_api import sync_playwright

THEMES = {
    "light": {"bg": "#ffffff", "fg": "#1f1f1f", "bar": "#e9e9ec", "border": "#c9c9cf"},
    "dark": {"bg": "#16161a", "fg": "#e6e6e6", "bar": "#2b2b31", "border": "#3a3a42"},
}


ROOT = Path(__file__).resolve().parent.parent
CAPTURES = ROOT / "build" / "terminal"

# Each real capture, the part of the screen to keep, and lines to drop. "start" and "stop"
# are text found on the first and last lines to keep. "drop" removes lines containing that
# text: account-specific banners (usage-limit warnings, surveys) and tmux tips that a reader
# running Claude Code in a normal terminal wouldn't see.
SHOTS = {
    "01-theme": {"theme": "dark"},
    "02-security": {},
    "03-trust": {},
    "04-welcome": {},
    "05-modes": {},
    "07-permission-create": {},
    "08-first-reply": {"stop": "Crunched"},
    "09-model-picker": {"start": "Select model"},
    "10-context": {"start": "/context", "stop": "/context all"},
    "11-plan-approve": {"start": "Ready to code"},
    "12-hooks": {"start": "Hooks"},
    "13-skills": {"start": "Skills", "drop": ["/deep-research"]},
    "14-version": {"stop": "(Claude Code)"},
    "15-mcp-add": {},
    "16-headless": {},
    # QuickBite phase 7, run interactively; frames captured every 30 seconds while Claude worked.
    "17-working": {"start": "Now the fixtures guard", "stop": "Caramelizing"},
    "19-phase7-done": {"start": "Two problems the CSP test caught", "stop": "Baked for"},
}
DROP_ALWAYS = ["weekly limit", "tmux detected", "tmux focus-events", "Anthropic Interviewer",
               "Your voice can help", "Auto-update failed", "Tip: Use /btw"]


def load_lines(path, lines=None, start=None, stop=None, drop=()):
    text = Path(path).read_text(encoding="utf-8", errors="replace")
    # Terminal hyperlinks (OSC 8) wrap link text in escape codes; keep only the visible text.
    text = re.sub(r"\x1b\]8;[^\x07\x1b]*(?:\x07|\x1b\\)", "", text)
    rows = text.split("\n")
    plain = lambda r: re.sub(r"\x1b\[[0-9;:]*m", "", r).strip()
    if lines:
        a, b = lines.split(":")
        rows = rows[int(a or 0):int(b) if b else None]
    if start:
        rows = rows[next(i for i, r in enumerate(rows) if start in plain(r)):]
    if stop:
        rows = rows[:next(i for i, r in enumerate(rows) if stop in plain(r)) + 1]
    rows = [r for r in rows if not any(d in plain(r) for d in list(drop) + DROP_ALWAYS)]
    # Drop blank rows at the top and bottom (the empty part of the terminal).
    while rows and not plain(rows[-1]):
        rows.pop()
    while rows and not plain(rows[0]):
        rows.pop(0)
    # Collapse long empty stretches (unused terminal space) to a single blank line.
    out = []
    for r in rows:
        if not plain(r) and out and not plain(out[-1]):
            continue
        out.append(r)
    return "\n".join(out)


def render(ansi_file, out_png, theme="dark", title="Terminal", lines=None, start=None, stop=None,
           drop=()):
    t = THEMES[theme]
    # Every window is drawn at the full terminal width, so text is the same size in every shot.
    text = load_lines(ansi_file, lines, start, stop, drop)
    cols = max([92] + [len(re.sub(r"\x1b\[[0-9;:]*m", "", r).rstrip()) for r in text.split("\n")])
    body = Ansi2HTMLConverter(inline=True, dark_bg=(theme == "dark"), line_wrap=False).convert(
        text, full=False)
    page = f"""<!doctype html><html><head><meta charset="utf-8"><style>
      body {{ margin: 0; padding: 18px; background: #ffffff; }}
      .win {{ display: inline-block; border: 1px solid {t['border']}; border-radius: 10px;
              overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.12); background: {t['bg']}; }}
      .bar {{ background: {t['bar']}; height: 30px; display: flex; align-items: center;
              padding: 0 12px; gap: 8px; border-bottom: 1px solid {t['border']}; }}
      .dot {{ width: 12px; height: 12px; border-radius: 50%; }}
      .title {{ flex: 1; text-align: center; margin-right: 52px; color: #6b6b73;
                font: 13px "DejaVu Sans", sans-serif; }}
      pre {{ margin: 0; padding: 14px 18px 16px; color: {t['fg']}; background: {t['bg']}; width: {cols}ch;
             font: 14px/1.32 "DejaVu Sans Mono", monospace; white-space: pre; }}
      pre span {{ font-family: inherit; }}
    </style></head><body><div class="win" id="win">
      <div class="bar"><span class="dot" style="background:#ff5f57"></span>
        <span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span>
        <span class="title">{html.escape(title)}</span></div>
      <pre>{body}</pre></div></body></html>"""
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(page)
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH") or None)
        pg = b.new_page(device_scale_factor=3, viewport={"width": 1400, "height": 900})
        pg.goto(Path(f.name).as_uri())
        pg.locator("#win").screenshot(path=str(out_png))
        b.close()
    os.unlink(f.name)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true")
    ap.add_argument("ansi_file", nargs="?")
    ap.add_argument("out_png", nargs="?")
    ap.add_argument("--theme", default="dark", choices=THEMES)
    ap.add_argument("--lines")
    a = ap.parse_args()
    if a.all:
        for name, opt in SHOTS.items():
            out = ROOT / "manuscript" / "images" / f"term-{name}.png"
            render(CAPTURES / f"{name}.ans", out, opt.get("theme", "dark"), start=opt.get("start"),
                   stop=opt.get("stop"), drop=opt.get("drop", ()))
            print("wrote", out.name)
    else:
        render(a.ansi_file, a.out_png, a.theme, lines=a.lines)
        print("wrote", a.out_png)
