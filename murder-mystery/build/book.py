"""Build the 6 x 9 in black-and-white interior from cases.json."""
import json
from pathlib import Path

from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

from logic import feet

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
LIB = "/usr/share/fonts/truetype/liberation/LiberationSerif-"
for name, path in {"Body": LIB + "Regular.ttf", "Body-B": LIB + "Bold.ttf", "Body-I": LIB + "Italic.ttf",
                   "Body-BI": LIB + "BoldItalic.ttf",
                   "Title": str(ROOT / "fonts/PlayfairDisplay-Bold.ttf"),
                   "Black": str(ROOT / "fonts/PlayfairDisplay-Black.ttf"),
                   "Type": str(ROOT / "fonts/SpecialElite-Regular.ttf")}.items():
    pdfmetrics.registerFont(TTFont(name, path))
pdfmetrics.registerFontFamily("Body", normal="Body", bold="Body-B", italic="Body-I", boldItalic="Body-BI")

META = json.loads((ROOT / "book.json").read_text())
W, H = 6 * 72, 9 * 72
INSIDE, OUTSIDE, TOP, BOTTOM = 0.8 * 72, 0.55 * 72, 0.6 * 72, 0.7 * 72
TW = W - INSIDE - OUTSIDE

P = lambda name, **kw: ParagraphStyle(name, **kw)
BODY = P("body", fontName="Body", fontSize=10.6, leading=14.2, spaceAfter=6)
SCENE = P("scene", fontName="Body-I", fontSize=10.6, leading=14.2)
CLUE = P("clue", fontName="Body", fontSize=11, leading=14.2, leftIndent=18, firstLineIndent=-18)
SMALL = P("small", fontName="Body", fontSize=9.8, leading=12.6)
SOL = P("sol", fontName="Body", fontSize=9, leading=11.6)
H1 = P("h1", fontName="Title", fontSize=22, leading=27)
H2 = P("h2", fontName="Title", fontSize=14, leading=18)
CENTER = P("center", fontName="Body", fontSize=10.6, leading=15, alignment=TA_CENTER)
LEVELS = {"A": ("WARM-UP", 1), "B": ("DETECTIVE", 2), "C": ("INSPECTOR", 3), "D": ("MASTER SLEUTH", 4)}


class Book:
    def __init__(self, path):
        self.c = canvas.Canvas(str(path), pagesize=(W, H), initialFontName="Body")
        self.c.setTitle(META["title"])
        self.c.setAuthor(META["author"])
        self.page = 1
        self.case_pages = {}

    @property
    def left(self):                       # odd pages are right-hand pages: gutter on the left
        return INSIDE if self.page % 2 else OUTSIDE

    def para(self, text, style, y, x=None, w=None):
        x = self.left if x is None else x
        w = TW if w is None else w
        p = Paragraph(text, style)
        _, h = p.wrap(w, 1000)
        p.drawOn(self.c, x, y - h)
        return y - h - style.spaceAfter

    def height(self, text, style, w=None):
        return Paragraph(text, style).wrap(TW if w is None else w, 1000)[1] + style.spaceAfter

    def new_page(self, number=True):
        if number:
            self.c.setFont("Type", 8.5)
            self.c.setFillGray(0.3)
            self.c.drawCentredString(W / 2, BOTTOM - 20, str(self.page))
            self.c.setFillGray(0)
        self.c.showPage()
        self.page += 1

    def rule(self, y, weight=1):
        self.c.setLineWidth(weight)
        self.c.line(self.left, y, self.left + TW, y)

    # ------------------------------------------------------------ front matter
    def title_page(self):
        c = self.c
        c.setFont("Type", 11)
        c.drawCentredString(W / 2, H - 150, "60 MURDER MYSTERY LOGIC PUZZLES")
        c.setFont("Black", 30)
        for i, line in enumerate(["Who Killed", "the Lighthouse", "Keeper?"]):
            c.drawCentredString(W / 2, H - 215 - i * 40, line)
        c.setLineWidth(1.2)
        c.line(W / 2 - 60, H - 325, W / 2 + 60, H - 325)
        c.setFont("Body-I", 13)
        c.drawCentredString(W / 2, H - 352, "Suspects, Clues and One Killer Every Time")
        lighthouse(c, W / 2, 150, 0.9)
        c.setFont("Title", 13)
        c.drawCentredString(W / 2, 92, META["author"])
        self.new_page(number=False)

    def copyright_page(self):
        y = 300
        for t in [f"<b>{META['title']}</b><br/>{META['subtitle']}",
                  f"Copyright &copy; {META['year']} {META['author']}. All rights reserved.",
                  "No part of this book may be reproduced or shared in any form without written permission, "
                  "except for brief quotations in reviews.",
                  "This is a work of fiction. Every person, place and crime in these puzzles is invented. "
                  "Any resemblance to real people, living or dead, or to real events is coincidental.",
                  "Every puzzle in this book was checked by computer to have exactly one solution.",
                  "Fonts: Playfair Display (SIL Open Font License), Special Elite (Apache License 2.0) and "
                  "Liberation Serif (SIL Open Font License).",
                  f"First edition, {META['year']}."]:
            y = self.para(t, SMALL, y) - 6
        self.new_page(number=False)

    def text_page(self, title, paras, kicker=None):
        y = H - TOP - 20
        if kicker:
            self.c.setFont("Type", 9.5)
            self.c.drawString(self.left, y, kicker)
            y -= 20
        y = self.para(title, H1, y) - 8
        self.rule(y)
        y -= 16
        for t in paras:
            style = H2 if t.startswith("## ") else BODY
            t = t[3:] if t.startswith("## ") else t
            if y - self.height(t, style) < BOTTOM:
                self.new_page()
                y = H - TOP - 10
            if style is H2:
                y -= 6
            y = self.para(t, style, y)
        self.new_page()

    def part_page(self, num, name, rng, blurb):
        c = self.c
        c.setFont("Type", 12)
        c.drawCentredString(W / 2, H - 230, f"PART {num}")
        c.setFont("Black", 30)
        c.drawCentredString(W / 2, H - 275, name)
        c.setLineWidth(1.2)
        c.line(W / 2 - 50, H - 295, W / 2 + 50, H - 295)
        c.setFont("Type", 11)
        c.drawCentredString(W / 2, H - 320, rng)
        x = (INSIDE if self.page % 2 else OUTSIDE) + 30
        self.para(blurb, CENTER, H - 350, x=x, w=TW - 60)
        self.new_page()

    def notes_page(self):
        c = self.c
        c.setFont("Type", 11)
        c.drawString(self.left, H - TOP - 14, "DETECTIVE'S NOTES")
        c.setStrokeGray(0.65)
        c.setLineWidth(0.5)
        y = H - TOP - 50
        while y > BOTTOM:
            c.line(self.left, y, self.left + TW, y)
            y -= 24
        c.setStrokeGray(0)
        self.new_page()

    # ------------------------------------------------------------ cases
    def case_header(self, case):
        c, x = self.c, self.left
        y = H - TOP - 6
        label, stars = LEVELS[case["level"]]
        c.setFont("Type", 11)
        c.drawString(x, y, f"CASE {case['num']:02d}")
        c.setFont("Type", 8.5)
        c.drawRightString(x + TW, y, label)
        lw = c.stringWidth(label, "Type", 8.5)
        for i in range(4):                # difficulty: filled squares out of four
            c.rect(x + TW - lw - 10 - (4 - i) * 11, y - 1, 7, 7, fill=1 if i < stars else 0)
        y -= 12
        y = self.para(case["title"], P("ct", fontName="Title", fontSize=17, leading=21), y - 4)
        self.rule(y - 2, 1.4)
        y -= 16
        y = self.para(f"<b>THE VICTIM:</b> {case['victim']}.", BODY, y)
        y = self.para(case["scene"], SCENE, y) - 10
        return y

    def label(self, text, y):
        self.c.setFont("Type", 10)
        self.c.drawString(self.left, y - 9, text)
        return y - 20

    def verdict(self, y, lines):
        c, x = self.c, self.left
        c.setLineWidth(1.2)
        h = 22 + 22 * len(lines)
        c.rect(x, y - h, TW, h)
        c.setFont("Type", 10)
        c.drawString(x + 10, y - 16, "YOUR VERDICT")
        for i, t in enumerate(lines):
            yy = y - 36 - i * 22
            c.setFont("Body-B", 10.5)
            c.drawString(x + 10, yy, t)
            c.setLineWidth(0.6)
            c.line(x + 14 + c.stringWidth(t, "Body-B", 10.5), yy - 2, x + TW - 12, yy - 2)
        return y - h

    def cross_off_case(self, case):
        self.case_pages[case["num"]] = self.page
        y = self.case_header(case)
        y = self.label("THE SUSPECTS", y)
        c, x = self.c, self.left
        cols = [("", 14), ("Name", 84), ("Who", 74), ("Was in the", 70), ("Hand", 27), ("Height", 39)]
        cols.append(("Hair", TW - sum(w for _, w in cols)))
        row = 21
        c.setFont("Body-B", 9.2)
        cx = x
        for name, w in cols:
            c.drawString(cx + 3, y - 12, name)
            cx += w
        c.setLineWidth(1)
        c.line(x, y - 16, x + TW, y - 16)
        y -= 16
        for s in case["suspects"]:
            vals = ["", s["name"], s["role"], case["rooms"][s["room"]], s["hand"], feet(s["height"]), s["hair"]]
            cx = x
            c.setLineWidth(0.8)
            c.rect(x + 2, y - 15, 9, 9)
            for (name, w), v in zip(cols, vals):
                size = 9.4
                while c.stringWidth(v, "Body", size) > w - 5:
                    size -= 0.3
                c.setFont("Body", size)
                c.drawString(cx + 3, y - 14, v)
                cx += w
            c.setLineWidth(0.4)
            c.line(x, y - row, x + TW, y - row)
            y -= row
        y -= 16
        y = self.label("THE EVIDENCE", y)
        for i, t in enumerate(case["clue_text"], 1):
            y = self.para(f"<b>{i}.</b>&nbsp;&nbsp;{t}", CLUE, y) - 5
        self.para("Cross off every suspect who does not fit the evidence. One name will be left.", SMALL, y - 4)
        self.verdict(BOTTOM + 60, ["The killer is"])
        self.new_page()

    def grid_case(self, case):
        assert self.page % 2 == 0, "grid cases start on a left-hand page"
        self.case_pages[case["num"]] = self.page
        liar = bool(case.get("statements"))
        S = [s["first"] for s in case["suspects"]]
        y = self.case_header(case)
        y = self.para("At the moment of the murder, each suspect was in a different room, and each was "
                      "carrying a different object.", SMALL, y) - 8
        y = self.label("THE SUSPECTS", y)
        for s in case["suspects"]:
            y = self.para(f"<b>{s['name']}</b>, the {s['role']}", SMALL, y) - 1
        y -= 8
        y = self.label("THE CLUES", y)
        for i, t in enumerate(case["clue_text"], 1):
            y = self.para(f"<b>{i}.</b>&nbsp;&nbsp;{t}", CLUE, y) - 4
        assert y > BOTTOM - 4, f"case {case['num']} overflows its first page"
        self.new_page()
        # right-hand page: statements or crime-scene report, then the grid
        y = H - TOP - 6
        if liar:
            y = self.label("THE STATEMENTS", y)
            y = self.para("<b>The killer's statement is a lie. Everyone else told the truth.</b>", SMALL, y) - 4
            for s, t in zip(case["suspects"], case["statement_text"]):
                y = self.para(f"<b>{s['first']}:</b> “{t}”", CLUE, y) - 3
            y -= 8
        else:
            c, x = self.c, self.left
            c.setLineWidth(1.2)
            c.rect(x, y - 44, TW, 44)
            c.setFont("Type", 10)
            c.drawString(x + 10, y - 16, "CRIME SCENE REPORT")
            c.setFont("Body-B", 11)
            c.drawString(x + 10, y - 34, case["fact"]["text"])
            y -= 60
        y = draw_grid(self.c, self.left, y, TW, S, case["rooms"], case["weapons"])
        self.verdict(BOTTOM + 86, ["The killer is", "In the", "With the"])
        self.new_page()

    # ------------------------------------------------------------ solutions
    def solutions(self, cases):
        y = H - TOP - 20
        y = self.para("Solutions", H1, y) - 8
        self.rule(y)
        y -= 14
        for case in cases:
            k = case["suspects"][case["killer"]]
            head = f"<b>Case {case['num']}: {case['title']}</b>"
            lines = [f"<b>The killer: {k['name']}, the {k['role']}.</b>"]
            if case["level"] != "A":
                R, Wp = case["rooms"], case["weapons"]
                lines[0] += f" In the {R[case['lp'][case['killer']]]}, with the {Wp[case['wp'][case['killer']]]}."
                lines.append("<i>Full grid:</i> " + "; ".join(
                    f"{s['first']}: {R[case['lp'][i]]}, {Wp[case['wp'][i]]}" for i, s in enumerate(case["suspects"])) + ".")
            lines.append(" ".join(case["steps"]))
            if case.get("statements"):
                lines.append(f"{k['first']}'s statement is the only false one.")
            lines.append(f"<i>Motive:</i> {case['motive']}.")
            block = [head] + lines
            need = sum(self.height(t, SOL) + 2 for t in block) + 10
            if y - need < BOTTOM:
                self.new_page()
                y = H - TOP - 6
            for t in block:
                y = self.para(t, SOL, y) - 2
            y -= 10
        self.new_page()


def lighthouse(c, cx, base, s=1.0, fill=0):
    """A simple lighthouse silhouette with its beam (used on the title page)."""
    c.saveState()
    c.translate(cx, base)
    c.scale(s, s)
    c.setFillGray(fill)
    p = c.beginPath()
    for i, (x, y) in enumerate([(-22, 0), (-14, 120), (14, 120), (22, 0)]):
        (p.moveTo if i == 0 else p.lineTo)(x, y)
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    c.rect(-19, 120, 38, 5, fill=1, stroke=0)
    c.rect(-11, 125, 22, 20, fill=0, stroke=1)
    p = c.beginPath()
    p.moveTo(-15, 145); p.lineTo(0, 162); p.lineTo(15, 145); p.close()
    c.drawPath(p, fill=1, stroke=0)
    c.setFillGray(1)
    for yy in (30, 62, 94):
        c.rect(-4, yy, 8, 12, fill=1, stroke=0)
    c.setFillGray(0)
    c.setLineWidth(0.8)
    for sign in (-1, 1):
        c.line(sign * 13, 139, sign * 120, 160)
        c.line(sign * 13, 131, sign * 120, 110)
    c.rect(-60, -6, 120, 6, fill=1, stroke=0)
    c.restoreState()


def draw_grid(c, x, y, tw, S, R, Wp):
    """The classic logic grid: suspects against rooms and objects, objects against rooms."""
    n = len(S)
    lab_w, lab_h = 100, 100
    cell = min(29.5, (tw - lab_w) / (2 * n))
    gx, gy = x + lab_w, y - lab_h
    c.setFont("Body", 8.2)

    def fit(text, width, size=9.4):
        while c.stringWidth(text, "Body", size) > width:
            size -= 0.25
        return size

    for j, name in enumerate(R + Wp):                       # column labels, rotated
        c.saveState()
        c.translate(gx + j * cell + cell / 2 + 3, gy + 4)
        c.rotate(90)
        c.setFont("Body", fit(name, lab_h - 8))
        c.drawString(0, 0, name)
        c.restoreState()
    for i, name in enumerate(S + Wp):                       # row labels
        c.setFont("Body", fit(name, lab_w - 6))
        c.drawRightString(gx - 5, gy - i * cell - cell / 2 - 3, name)
    c.setFont("Type", 7)
    for block, (bi, bj, rows, cols) in {"SR": (0, 0, n, n), "SW": (0, 1, n, n), "WR": (1, 0, n, n)}.items():
        x0, y0 = gx + bj * n * cell, gy - bi * n * cell
        c.setLineWidth(0.4)
        for k in range(1, n):
            c.line(x0 + k * cell, y0, x0 + k * cell, y0 - n * cell)
            c.line(x0, y0 - k * cell, x0 + n * cell, y0 - k * cell)
        c.setLineWidth(1.5)
        c.rect(x0, y0 - n * cell, n * cell, n * cell)
    # hint in the empty corner
    c.setFont("Body-I", 8)
    hx, hy = gx + n * cell + 10, gy - n * cell - 16
    for i, t in enumerate(["Mark an X when a pair", "is impossible, and a", "circle when it is certain."]):
        c.drawString(hx, hy - i * 11, t)
    return gy - 2 * n * cell - 14


HOW = [
    "Every case in this book is a small, fair mystery. You are given a victim, a list of suspects and a set of "
    "clues. Nothing is hidden and there are no trick questions. If you reason carefully, exactly one name is left.",
    "The cases come in four kinds, and they get harder as you go. Start anywhere you like, but if logic puzzles "
    "are new to you, begin with Case 1.",
    "## Part One: Cross-Off Cases (1 to 18)",
    "You get a table of six suspects: where each was, whether they are left- or right-handed, how tall they are "
    "and the color of their hair. Each piece of evidence is a fact about the killer. Read a clue, find every "
    "suspect it rules out, and cross them off. When one suspect is left, you have your killer.",
    "Watch for clues that say <i>either... or (or both)</i>. Such a clue clears only the suspects who fail "
    "<b>both</b> halves.",
    "## Parts Two and Three: Grid Cases (19 to 50)",
    "At the moment of the murder, each suspect was in a different room and was carrying a different object. "
    "The clues let you work out exactly who was where, and with what. Then the Crime Scene Report tells you the "
    "room where the victim died, or the weapon that was used, and that points to one suspect.",
    "Use the grid on the right-hand page. Every square stands for one pair, such as a suspect and a room. "
    "Put an <b>X</b> in a square when the clues prove that pair is impossible. Put a <b>circle</b> when a pair "
    "is certain, then X out the rest of that row and column in the same block, because each suspect has only one "
    "room and one object.",
    "Two habits solve most grids. First, when a row or column in a block has only one empty square left, that "
    "square must be a circle. Second, link the blocks: if Ada was in the cellar, and the rope was not in the "
    "cellar, then Ada was not carrying the rope.",
    "Read clues with care. <i>Of Ada and the person in the cellar, one carried the rope and the other carried "
    "the lamp</i> tells you three things: Ada was not in the cellar, Ada had the rope or the lamp, and so did "
    "whoever was in the cellar.",
    "## Part Four: One Liar (51 to 60)",
    "These are grid cases with a twist. There is no Crime Scene Report. Instead, each suspect makes one "
    "statement. The innocent suspects all tell the truth. The killer, and only the killer, lies. Use the clues "
    "and the statements together: the full answer is the only one in which exactly one statement is false.",
    "A good way in: pick a statement and ask, what if this is the lie? Then every other statement must be "
    "true. If that leads to a contradiction, that speaker is innocent and the statement is true.",
    "## Solutions",
    "Every solution is at the back of the book, with the reasoning step by step, the full grid, and the motive. "
    "If you are stuck, read only the first step of the solution, then come back and carry on.",
    "## A Detective's Tips",
    "Use a pencil. Go through the clues more than once: a clue that told you nothing at first often opens up "
    "after you have marked a few squares. And never guess. Every case here can be solved by pure reasoning, one "
    "clue at a time.",
]


def build():
    cases = json.loads((HERE / "cases.json").read_text())
    out = ROOT / "dist" / "paperback-interior-6x9.pdf"
    out.parent.mkdir(exist_ok=True)
    b = Book(out)
    b.title_page()
    b.copyright_page()
    b.text_page("How to Solve These Cases", HOW, kicker="BRIEFING")
    if b.page % 2 == 0:
        b.notes_page()
    parts = [("ONE", "Warm-Up Cases", "CASES 1 TO 18", "A", "Six suspects, a handful of evidence. Cross off everyone who does not fit."),
             ("TWO", "Detective Cases", "CASES 19 TO 36", "B", "Four suspects, four rooms, four objects. Fill the grid, then read the Crime Scene Report."),
             ("THREE", "Inspector Cases", "CASES 37 TO 50", "C", "Five suspects, five rooms, five objects. The grids are bigger and the clues are slyer."),
             ("FOUR", "One Liar", "CASES 51 TO 60", "D", "Five suspects, five statements, one lie. The last case is the one on the cover.")]
    for num, name, rng, level, blurb in parts:
        if level == "A":
            b.part_page(num, name, rng, blurb)
        else:
            if b.page % 2 == 0:          # the part page must be a right-hand page, so cases start on the left
                b.notes_page()
            b.part_page(num, name, rng, blurb)
        for case in cases:
            if case["level"] == level:
                (b.cross_off_case if level == "A" else b.grid_case)(case)
    if b.page % 2 == 0:
        b.notes_page()
    b.solutions(cases)
    b.text_page("Case Closed", [
        "You have worked through sixty murders, and sixty killers have been caught. Not bad for one detective.",
        "If you enjoyed these cases, a short review on Amazon helps other mystery lovers find the book. Thank you.",
        f"<b>{META['author']}</b> writes puzzle books and practical guides. Every puzzle in this book was built "
        "and checked to have exactly one solution, so the only thing between you and the answer is logic."],
        kicker="AFTERWORD")
    if b.page % 2 == 0:                  # end on an even page count
        b.notes_page()
    b.c.save()
    pages = b.page - 1
    (ROOT / "dist" / "build-info.json").write_text(json.dumps({"pages": pages}) + "\n")
    return pages


if __name__ == "__main__":
    print(build(), "pages")
