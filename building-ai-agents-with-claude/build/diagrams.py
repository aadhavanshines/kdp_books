"""Generate this book's diagrams as 300 DPI PNGs (print-safe in grayscale).

Drawing helpers are shared with the earlier books, in diagrams_ref.py.
Usage:  python3 build/diagrams.py
"""
from pathlib import Path

from diagrams_ref import (BOLD, ITAL, LIGHT, MID, NAVY, PALE, REG, W, WHITE, INK, arrow, box,
                          canvas, cycle, f, poly_arrow)

OUT = Path(__file__).resolve().parent.parent / "manuscript" / "images"


def agent_loop():
    return cycle([("1. Claude reads", "the task and everything so far"),
                  ("2. Claude decides", "answer, or ask for a tool"),
                  ("3. The tool runs", "your code, or a built-in tool"),
                  ("4. The result goes back", "added to the conversation")],
                 h=900, rx=430, ry=310, hw=250, hh=84, fs=34,
                 center=["repeat until the", "final answer, or", "a limit is reached"])


def guardrail_layers():
    layers = [("System prompt", "asks the agent to follow the rules"),
              ("Tool choice", "abilities the agent doesn't need are never given"),
              ("Permission rules", "allow and deny lists, permission mode"),
              ("Hooks", "your code before and after every tool call"),
              ("Checks in the tool code", "limits enforced whatever the prompt says"),
              ("Sandbox", "what commands can read, write and reach"),
              ("Limits", "max turns, max budget, timeouts"),
              ("Human approval", "a person decides big actions"),
              ("Audit log", "a record of everything that happened")]
    step = 112
    img, d = canvas(40 + len(layers) * step)
    for i, (t, sub) in enumerate(layers):
        inset = i * 30
        y = 20 + i * step
        dark = i % 2 == 0
        box(d, (40 + inset, y, W - 40 - inset, y + step - 14), t, NAVY if dark else LIGHT,
            WHITE if dark else INK, sub=sub, font=f(BOLD, 33))
    return img


def shopmate():
    img, d = canvas(1310)
    box(d, (40, 30, 600, 160), "Scheduler", NAVY, WHITE, sub="every morning at 6:00", font=f(BOLD, 36))
    box(d, (780, 30, W - 40, 160), "run_daily.py", LIGHT, sub="retry once, then alert",
        font=f(BOLD, 36))
    arrow(d, (600, 95), (772, 95))
    # Read-only sources on the left.
    sources = [("Inbox", "list_inbox, read_email"), ("Orders", "sales_report"),
               ("Support desk", "support_queue"), ("Yesterday's notes", "read_notes"),
               ("Stock MCP server", "list_stock only")]
    d.text((250, 225), "Read-only sources", font=f(ITAL, 30), fill=MID, anchor="ma")
    y = 275
    for name, sub in sources:
        box(d, (40, y, 460, y + 120), name, PALE, sub=sub, outline=MID, font=f(BOLD, 32))
        arrow(d, (460, y + 60), (552, y + 60 if abs(y + 60 - 640) < 1 else 640 + (y + 60 - 640) * 0.35),
              color=MID, width=5)
        y += 150
    # The agent in the middle.
    box(d, (560, 470, 900, 810), "ShopMate agent", NAVY, WHITE,
        sub="Claude decides what matters; returns the brief as structured data", font=f(BOLD, 36))
    poly_arrow(d, [(1100, 160), (1100, 220), (730, 220), (730, 462)])
    # Outputs written by code on the right.
    d.text((1160, 225), "Written by plain code", font=f(ITAL, 30), fill=MID, anchor="ma")
    outs = [("brief.md", "the full brief"), ("whatsapp.txt", "under 600 characters"),
            ("notes.json", "follow-ups for tomorrow"), ("runs.jsonl", "one line per run"),
            ("ALERT.txt", "only if both attempts failed")]
    y = 275
    for name, sub in outs:
        box(d, (970, y, W - 40, y + 120), name, LIGHT, sub=sub, font=f(BOLD, 32))
        arrow(d, (925, y + 60), (962, y + 60), color=NAVY, width=6, head=22)
        y += 150
    d.line([(900, 640), (925, 640)], fill=NAVY, width=6)
    d.line([(925, 335), (925, 935)], fill=NAVY, width=6)
    # The dashboard reads the outputs.
    box(d, (300, 1130, W - 300, 1280), "Ops dashboard", NAVY, WHITE,
        sub="today's brief, run history, cost, eval scores, /health", font=f(BOLD, 36))
    poly_arrow(d, [(1160, 995), (1160, 1060), (W / 2, 1060), (W / 2, 1122)], color=MID)
    d.text((1200, 1010), "reads", font=f(ITAL, 28), fill=MID, anchor="la")
    return img


if __name__ == "__main__":
    for name, fn in [("diagram-agent-loop", agent_loop), ("diagram-guardrail-layers", guardrail_layers),
                     ("diagram-shopmate", shopmate)]:
        fn().save(OUT / f"{name}.png", dpi=(300, 300))
        print("wrote", name)
