"""The diagrams for AI for Engineers, as 300 DPI PNGs (print-safe in grayscale).
The drawing helpers come from diagrams_ref.py, shared with the earlier books."""
from pathlib import Path

from diagrams_ref import (BOLD, INK, LIGHT, MID, NAVY, PALE, REG, WHITE, W, arrow, box,
                          canvas, f, poly_arrow)


def label(d, xy, text, size=30, color=MID, font=REG, anchor="ma"):
    d.text(xy, text, font=f(font, size), fill=color, anchor=anchor)


def draft_check_decide():
    img, d = canvas(760)
    bw, gap, y0, y1 = 380, 80, 70, 330
    x0 = (W - 3 * bw - 2 * gap) // 2
    xs = [x0, x0 + bw + gap, x0 + 2 * (bw + gap)]
    box(d, (xs[0], y0, xs[0] + bw, y1), "1. Claude drafts", fill=NAVY, color=WHITE,
        sub="reviews, writes, compares, suggests; structured output")
    box(d, (xs[1], y0, xs[1] + bw, y1), "2. Code checks", fill=LIGHT,
        sub="IDs, quotes, numbers, coverage; does all arithmetic")
    box(d, (xs[2], y0, xs[2] + bw, y1), "3. Engineer decides", fill=LIGHT,
        sub="reviews draft and check results; owns the result")
    for i in (0, 1):
        arrow(d, (xs[i] + bw + 10, (y0 + y1) // 2), (xs[i + 1] - 10, (y0 + y1) // 2))
    box(d, (300, 500, W - 300, 700), "4. Measure", fill=PALE, outline=NAVY,
        sub="before use and after every change: run on labelled cases, several times, grade")
    poly_arrow(d, [(W // 2, 500), (W // 2, 420), (xs[1] + bw // 2, 420), (xs[1] + bw // 2, y1 + 10)],
               color=MID, width=5)
    label(d, (W // 2 + 20, 440), "scores tell you whether to trust the tool", size=28, anchor="la")
    return img


def v_model():
    img, d = canvas(1060)
    # left leg (down), right leg (up)
    left = [("Requirements", "1 Requirements Reviewer\n3 Spec Change Impact", 20, 40),
            ("System design", "7 FMEA Assistant", 130, 280),
            ("Test design", "2 Test Case Generator", 240, 520)]
    right = [("Test execution", "4 HIL Log Analyzer", 240, 520),
             ("Test reporting", "5 Test Report Writer\n10 Nightly Assistant", 130, 280),
             ("Problem handling", "6 Defect Triage", 20, 40)]
    bw, bh = 410, 190
    for title, sub, x, y in left:
        box(d, (x, y, x + bw, y + bh), title, fill=LIGHT, sub=sub, font=f(BOLD, 36))
    for title, sub, x, y in right:
        box(d, (W - x - bw, y, W - x, y + bh), title, fill=LIGHT, sub=sub, font=f(BOLD, 36))
    for (_, _, x0, y0), (_, _, x1, y1) in zip(left, left[1:]):
        arrow(d, (x0 + bw // 2, y0 + bh + 5), (x1 + bw // 2, y1 - 5), color=MID, width=5)
    for (_, _, x0, y0), (_, _, x1, y1) in zip(right, right[1:]):
        arrow(d, (W - x0 - bw // 2, y0 - 5), (W - x1 - bw // 2, y1 + bh + 5), color=MID, width=5)
    arrow(d, (240 + bw + 10, 520 + bh // 2), (W - 240 - bw - 10, 520 + bh // 2), color=MID, width=5)
    box(d, (300, 790, W - 300, 1020), "Across the V", fill=NAVY, color=WHITE,
        sub="8 Knowledge Assistant: lessons learned and procedures\n"
            "9 Test Database MCP Server: results, tests and defects")
    return img


def code_ai_code():
    img, d = canvas(520)
    bw, gap = 290, 50
    steps = [("Code", "diff the versions; join the traces", LIGHT, INK),
             ("Claude", "meaning or wording? rewrite, rerun or retire? concerns", NAVY, WHITE),
             ("Code", "every test decided; limits from the new text", LIGHT, INK),
             ("Engineer", "approves the plan", PALE, INK)]
    x = (W - 4 * bw - 3 * gap) // 2
    for i, (t, sub, fill, color) in enumerate(steps):
        box(d, (x, 80, x + bw, 400), t, fill=fill, color=color, sub=sub,
            outline=NAVY if fill == PALE else None)
        if i < 3:
            arrow(d, (x + bw + 6, 240), (x + bw + gap - 6, 240))
        x += bw + gap
    label(d, (W // 2, 440), "facts by code, judgement by Claude, decision by a person", size=30)
    return img


def mcp_testdb():
    img, d = canvas(640)
    box(d, (30, 60, 400, 260), "Claude Code", fill=LIGHT, sub="an engineer's questions")
    box(d, (30, 340, 400, 540), "Agent SDK program", fill=LIGHT, sub="Project 9 agent, Project 10")
    box(d, (520, 150, 900, 450), "MCP server", fill=NAVY, color=WHITE,
        sub="list_nights, night_results, test_history, get_test, find_tests, find_defects")
    box(d, (1010, 200, W - 30, 400), "wlc200.db", fill=PALE, outline=NAVY, sub="opened read-only")
    for y in (160, 440):
        arrow(d, (405, y), (515, 300 if y == 160 else 330))
    arrow(d, (905, 300), (1005, 300))
    label(d, (710, 580), "fixed, read-only tools; no SQL from the model", size=28)
    return img


def nightly_pipeline():
    img, d = canvas(1100)
    cw = 560
    lx, rx = 60, W - 60 - cw
    rows = [
        ((lx, 40), "1. Analyze logs", "Project 4 analyzer: plain code, no AI", LIGHT, INK),
        ((rx, 40), "2. Store results", "a working copy of the test database", LIGHT, INK),
        ((lx, 300), "3. Match failures", "Claude: covered by an open defect, or a new draft?", NAVY, WHITE),
        ((rx, 300), "4. Write the report", "Project 5: fact sheet by code, text by Claude", NAVY, WHITE),
        ((lx, 560), "5. Check everything", "IDs, measured values, numbers in the text", LIGHT, INK),
        ((rx, 560), "6. Summary for the team", "report, defect drafts, problems, cost", PALE, INK),
    ]
    for (x, y), t, sub, fill, color in rows:
        box(d, (x, y, x + cw, y + 200), t, fill=fill, color=color, sub=sub,
            outline=NAVY if fill == PALE else None)
    arrow(d, (lx + cw + 8, 140), (rx - 8, 140))
    poly_arrow(d, [(rx + cw // 2, 245), (rx + cw // 2, 270), (lx + cw // 2, 270), (lx + cw // 2, 295)])
    arrow(d, (lx + cw + 8, 400), (rx - 8, 400))
    poly_arrow(d, [(rx + cw // 2, 505), (rx + cw // 2, 530), (lx + cw // 2, 530), (lx + cw // 2, 555)])
    arrow(d, (lx + cw + 8, 660), (rx - 8, 660))
    box(d, (300, 860, W - 300, 1060), "Engineer, in the morning", fill=LIGHT,
        sub="reviews the report and decides on every defect draft")
    arrow(d, (rx + cw // 2, 765), (W // 2 + 120, 855))
    return img


DIAGRAMS = {
    "diagram-draft-check-decide": draft_check_decide,
    "diagram-v-model": v_model,
    "diagram-code-ai-code": code_ai_code,
    "diagram-mcp-testdb": mcp_testdb,
    "diagram-nightly": nightly_pipeline,
}


def build_diagrams(out_dir):
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, fn in DIAGRAMS.items():
        fn().save(out_dir / f"{name}.png", dpi=(300, 300))


if __name__ == "__main__":
    build_diagrams(Path(__file__).resolve().parent.parent / "manuscript" / "images")
