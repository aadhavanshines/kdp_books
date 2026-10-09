"""Build the KDP paperback interior PDF (6 x 9 in, no bleed, embedded fonts)."""
import os
import re
import textwrap

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    CondPageBreak,
    Flowable,
    Frame,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    XPreformatted,
)
from reportlab.platypus import Image as RLImage
from reportlab.platypus.flowables import DocIf
from reportlab.platypus.tableofcontents import TableOfContents

FONT_DIR = "/usr/share/fonts/truetype"
FONTS = {
    "Serif": f"{FONT_DIR}/liberation/LiberationSerif-Regular.ttf",
    "Serif-Bold": f"{FONT_DIR}/liberation/LiberationSerif-Bold.ttf",
    "Serif-Italic": f"{FONT_DIR}/liberation/LiberationSerif-Italic.ttf",
    "Serif-BoldItalic": f"{FONT_DIR}/liberation/LiberationSerif-BoldItalic.ttf",
    "Sans": f"{FONT_DIR}/liberation/LiberationSans-Regular.ttf",
    "Sans-Bold": f"{FONT_DIR}/liberation/LiberationSans-Bold.ttf",
    "Sans-Italic": f"{FONT_DIR}/liberation/LiberationSans-Italic.ttf",
    "Sans-BoldItalic": f"{FONT_DIR}/liberation/LiberationSans-BoldItalic.ttf",
    "Mono": f"{FONT_DIR}/dejavu/DejaVuSansMono.ttf",
    "Mono-Bold": f"{FONT_DIR}/dejavu/DejaVuSansMono-Bold.ttf",
    # Liberation fonts have no rupee sign (U+20B9); DejaVu draws it.
    "Symbols": f"{FONT_DIR}/dejavu/DejaVuSerif.ttf",
}


def register_fonts():
    for name, path in FONTS.items():
        pdfmetrics.registerFont(TTFont(name, path))
    pdfmetrics.registerFontFamily("Serif", normal="Serif", bold="Serif-Bold",
                                  italic="Serif-Italic", boldItalic="Serif-BoldItalic")
    pdfmetrics.registerFontFamily("Sans", normal="Sans", bold="Sans-Bold",
                                  italic="Sans-Italic", boldItalic="Sans-BoldItalic")
    # Table cells default to unembedded Helvetica; KDP requires all fonts embedded.
    from reportlab.platypus import tables
    tables.CellStyle.fontname = "Serif"
    pdfmetrics.registerFontFamily("Mono", normal="Mono", bold="Mono-Bold",
                                  italic="Mono", boldItalic="Mono-Bold")


ACCENT = colors.HexColor("#1F3A5F")
GREY = colors.HexColor("#555555")
LIGHT = colors.HexColor("#F1F3F6")
RULE = colors.HexColor("#B8C2CF")

PAGE_W, PAGE_H = 6 * inch, 9 * inch
# KDP minimum inside margin for 151-300 pages is 0.5 in; we use more for comfort.
INSIDE, OUTSIDE, TOP, BOTTOM = 0.8 * inch, 0.6 * inch, 0.75 * inch, 0.75 * inch
TEXT_W = PAGE_W - INSIDE - OUTSIDE
CODE_SIZE = 7.8
SRC_SIZE = 6.85  # source-file listings, so 76 characters fit on a line
CODE_PAD = 6


def inline(text):
    """Convert inline Markdown to ReportLab paragraph markup."""
    # Code spans become placeholders first, so bold and italic can wrap them.
    codes = []
    esc = lambda x: x.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    def keep(m):
        codes.append(f'<font face="Mono" size="8.6">{esc(m.group(1))}</font>')
        return f"\x00{len(codes) - 1}\x00"

    t = esc(re.sub(r"`([^`]+)`", keep, text))
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<i>\1</i>", t)
    t = t.replace("\u20b9", '<font face="Symbols">\u20b9</font>')
    return re.sub(r"\x00(\d+)\x00", lambda m: codes[int(m.group(1))], t)


def make_styles():
    s = {}
    s["body"] = ParagraphStyle("body", fontName="Serif", fontSize=10.6, leading=14.6,
                               alignment=TA_JUSTIFY, spaceAfter=6.5, allowWidows=0, bulletFontName="Serif",
                               allowOrphans=0, hyphenationLang=None)
    s["label"] = ParagraphStyle("label", parent=s["body"], spaceAfter=4)
    s["resplabel"] = ParagraphStyle("resplabel", fontName="Sans-Bold", fontSize=7.5, leading=9,
                                    textColor=ACCENT)
    s["dedication"] = ParagraphStyle("dedication", fontName="Serif-Italic", fontSize=11.5,
                                     leading=16, alignment=TA_CENTER, textColor=colors.black)
    s["caption"] = ParagraphStyle("caption", parent=s["body"], fontName="Serif-Italic", fontSize=9,
                                  leading=12, alignment=TA_CENTER, textColor=GREY, spaceAfter=0)
    s["h2"] = ParagraphStyle("h2", fontName="Sans-Bold", fontSize=13.5, leading=17,
                             textColor=ACCENT, spaceBefore=14, spaceAfter=6)
    s["h3"] = ParagraphStyle("h3", fontName="Sans-Bold", fontSize=11.2, leading=14.5,
                             textColor=colors.black, spaceBefore=10, spaceAfter=4)
    s["bullet"] = ParagraphStyle("bullet", parent=s["body"], leftIndent=16, bulletIndent=5,
                                 spaceAfter=3.5, alignment=TA_LEFT)
    s["callout"] = ParagraphStyle("callout", parent=s["body"], fontSize=10, leading=13.8,
                                  spaceAfter=0, alignment=TA_LEFT)
    s["code"] = ParagraphStyle("code", fontName="Mono", fontSize=CODE_SIZE, leading=CODE_SIZE * 1.32)
    s["codesrc"] = ParagraphStyle("codesrc", fontName="Mono", fontSize=SRC_SIZE, leading=SRC_SIZE * 1.3)
    s["cell"] = ParagraphStyle("cell", fontName="Serif", fontSize=8.8, leading=11.2)
    s["cellhead"] = ParagraphStyle("cellhead", fontName="Sans-Bold", fontSize=8.6, leading=11,
                                   textColor=colors.white)
    s["chapnum"] = ParagraphStyle("chapnum", fontName="Sans-Bold", fontSize=11, leading=14,
                                  textColor=GREY, alignment=TA_LEFT, spaceAfter=8)
    s["chaptitle"] = ParagraphStyle("chaptitle", fontName="Sans-Bold", fontSize=24, leading=29,
                                    textColor=ACCENT, alignment=TA_LEFT, spaceAfter=10)
    s["partnum"] = ParagraphStyle("partnum", fontName="Sans-Bold", fontSize=14, leading=18,
                                  textColor=GREY, alignment=TA_CENTER, spaceAfter=14)
    s["parttitle"] = ParagraphStyle("parttitle", fontName="Sans-Bold", fontSize=28, leading=34,
                                    textColor=ACCENT, alignment=TA_CENTER)
    s["title"] = ParagraphStyle("title", fontName="Sans-Bold", fontSize=30, leading=36,
                                textColor=ACCENT, alignment=TA_CENTER, spaceAfter=16)
    s["subtitle"] = ParagraphStyle("subtitle", fontName="Serif-Italic", fontSize=13, leading=18,
                                   alignment=TA_CENTER, textColor=GREY)
    s["author"] = ParagraphStyle("author", fontName="Sans", fontSize=15, leading=20,
                                 alignment=TA_CENTER)
    s["small"] = ParagraphStyle("small", fontName="Serif", fontSize=8.8, leading=12.2,
                                alignment=TA_LEFT, spaceAfter=7)
    s["toctitle"] = ParagraphStyle("toctitle", parent=s["chaptitle"])
    s["toc0"] = ParagraphStyle("toc0", fontName="Sans-Bold", fontSize=10.5, leading=14,
                               spaceBefore=9, textColor=ACCENT)
    s["toc1"] = ParagraphStyle("toc1", fontName="Serif", fontSize=10.3, leading=14,
                               leftIndent=12, firstLineIndent=0)
    return s


class Marker(Flowable):
    """Zero-size flowable that records page state for the header/footer painter."""

    def __init__(self, **state):
        super().__init__()
        self.state = state
        self.width = self.height = 0

    def wrap(self, aw, ah):
        return 0, 0

    def draw(self):
        canv = self.canv
        for k, v in self.state.items():
            setattr(canv, f"_bk_{k}", v)


class HRule(Flowable):
    def __init__(self, width, thickness=1.2, color=ACCENT, hAlign="LEFT"):
        super().__init__()
        self.width, self.thickness, self.color = width, thickness, color
        self.hAlign = hAlign

    def wrap(self, aw, ah):
        return self.width, self.thickness + 2

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 1, self.width, 1)


class BookDoc(BaseDocTemplate):
    def __init__(self, filename, meta, **kw):
        super().__init__(filename, pagesize=(PAGE_W, PAGE_H), title=meta["title"],
                         author=meta["author"], subject=meta["subtitle"],
                         creator=meta["author"], initialFontName="Serif", **kw)
        self.meta = meta
        # Recto (odd) pages have the wider margin on the left (spine side).
        recto = Frame(INSIDE, BOTTOM, TEXT_W, PAGE_H - TOP - BOTTOM, id="r",
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        verso = Frame(OUTSIDE, BOTTOM, TEXT_W, PAGE_H - TOP - BOTTOM, id="v",
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([
            PageTemplate(id="recto", frames=[recto], onPageEnd=self.paint, autoNextPageTemplate="verso"),
            PageTemplate(id="verso", frames=[verso], onPageEnd=self.paint, autoNextPageTemplate="recto"),
        ])
        self._outline_n = 0

    def paint(self, canv, doc):
        plain = getattr(canv, "_bk_plain", False) or getattr(canv, "_bk_front", False)
        number = getattr(canv, "_bk_number", True) and not getattr(canv, "_bk_front", False)
        chapter = getattr(canv, "_bk_chapter", "")
        page = canv.getPageNumber()
        canv.saveState()
        if not plain and number:
            canv.setFont("Sans", 8.5)
            canv.setFillColor(GREY)
            odd = page % 2 == 1
            y_head = PAGE_H - TOP + 18
            if odd:
                # Keep long chapter titles inside the text block (out of the gutter).
                head = chapter.upper()
                if pdfmetrics.stringWidth(head, "Sans", 8.5) > TEXT_W:
                    head = head.split(":")[0]
                canv.drawRightString(PAGE_W - OUTSIDE, y_head, head)
                canv.drawRightString(PAGE_W - OUTSIDE, BOTTOM - 26, str(page))
            else:
                canv.drawString(OUTSIDE, y_head, self.meta["title"].upper())
                canv.drawString(OUTSIDE, BOTTOM - 26, str(page))
            canv.setStrokeColor(RULE)
            canv.setLineWidth(0.4)
            x0 = INSIDE if odd else OUTSIDE
            canv.line(x0, y_head - 5, x0 + TEXT_W, y_head - 5)
        elif number and plain == "opener":
            canv.setFont("Sans", 8.5)
            canv.setFillColor(GREY)
            canv.drawCentredString(PAGE_W / 2, BOTTOM - 26, str(page))
        canv.restoreState()
        # Reset per-page flags; the running chapter title persists.
        canv._bk_plain = False
        canv._bk_number = True

    def beforeDocument(self):
        self._outline_n = 0
        self._floats = []

    def handle_pageBegin(self):
        # Pick the template from the real page number. Alternating automatically drifts out of
        # step after inserted blank pages, which put the narrow margin on the spine side.
        self.pageTemplate = self.pageTemplates[0 if (self.page + 1) % 2 == 1 else 1]
        super().handle_pageBegin()

    def handle_frameBegin(self, *args, **kw):
        super().handle_frameBegin(*args, **kw)
        pending, self._floats = getattr(self, "_floats", []), []
        used, limit = 0, (PAGE_H - TOP - BOTTOM) * 0.68
        for i, fig in enumerate(pending):
            fig._placed = True
            fig.scale = 1.0
            h = fig.wrap(TEXT_W, PAGE_H)[1]
            # Leave at least a third of the page for text, so text between figures always
            # gets placed; carry any figure that doesn't fit to the next page.
            placed = (i == 0 or used + h <= limit) and self.frame.add(fig, self.canv, trySplit=0)
            fig._placed = False
            if not placed:
                self._floats = pending[i:] + self._floats
                break
            used += h

    def afterFlowable(self, flowable):
        toc = getattr(flowable, "_toc", None)
        if toc:
            level, text = toc
            key = f"bk{self._outline_n}"
            self._outline_n += 1
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text, key, level=level, closed=False)
            self.notify("TOCEntry", (level, text, self.page, key))


def recto_break():
    """Start the next flowable on a right-hand (odd) page, inserting a blank page if needed."""
    return [
        PageBreak(),
        DocIf("doc.page % 2 == 0", [Marker(plain=True, number=False), Spacer(1, 1), PageBreak()]),
    ]


def wrap_code(code, size=CODE_SIZE, marker=""):
    char_w = pdfmetrics.stringWidth("M", "Mono", size)
    max_chars = int((TEXT_W - 2 * CODE_PAD - 4) // char_w)
    out = []
    for line in code.split("\n"):
        if len(line) <= max_chars:
            out.append(line)
            continue
        indent = len(line) - len(line.lstrip())
        wrapped = textwrap.wrap(line.strip(), width=max_chars - indent - 2,
                                break_long_words=True, break_on_hyphens=False)
        out.append(" " * indent + wrapped[0])
        out.extend(" " * indent + (marker or "  ") + w for w in wrapped[1:])
    return "\n".join(out)


def code_block(code, styles, source=False):
    size = SRC_SIZE if source else CODE_SIZE
    # Wrapped source lines start with an arrow so readers know not to break them.
    lines = wrap_code(code, size, "\u21aa " if source else "").split("\n")
    # Sample responses ("Example output ...:") get a distinct look from prompts.
    label = None
    if lines and re.match(r"^(Example output|Claude.s reply|Terminal output).*:$", lines[0].strip()):
        label, lines = lines[0].strip().rstrip(":"), lines[1:]
    row_h = size * (1.3 if source else 1.32)
    rows = []
    for line in lines:
        if line.strip():
            esc = line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            rows.append([XPreformatted(esc, styles["codesrc" if source else "code"])])
        else:
            rows.append([Spacer(1, row_h)])  # keep blank lines
    style = [
        ("LEFTPADDING", (0, 0), (-1, -1), CODE_PAD),
        ("RIGHTPADDING", (0, 0), (-1, -1), CODE_PAD),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, 0), 5),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 6),
    ]
    if label:
        rows.insert(0, [Paragraph(label.upper(), styles["resplabel"])])
        style += [
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.6, ACCENT),
            ("LINEBEFORE", (0, 0), (0, -1), 3, ACCENT),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EAF0F7")),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 4),
            ("TOPPADDING", (0, 1), (-1, 1), 4),
        ]
    else:
        style += [
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
            ("BOX", (0, 0), (-1, -1), 0.5, RULE),
        ]
    t = Table(rows, colWidths=[TEXT_W], splitByRow=1, repeatRows=1 if label else 0)
    t.setStyle(TableStyle(style))
    if len(lines) <= 6:
        # Short blocks stay in one piece.
        return [KeepTogether([Spacer(1, 2), t, Spacer(1, 8)])]
    # Long blocks may split; make sure at least a few lines start on this page.
    return [CondPageBreak(5 * row_h + 12), Spacer(1, 2), t, Spacer(1, 8)]


class Figure(Flowable):
    """Image plus centered caption that shrinks (down to 65%) to fit the space left on a page."""

    def __init__(self, path, caption, style, max_h=3.4 * inch):
        super().__init__()
        from PIL import Image as PILImage
        w_px, h_px = PILImage.open(path).size
        self.path = str(path)
        self.ratio = h_px / w_px
        self.full_w = min(TEXT_W, max_h / self.ratio)
        self.caption = Paragraph(inline(caption), style)
        self.scale = 1.0

    def _height(self, scale, aw):
        _, cap_h = self.caption.wrap(aw, 1000)
        return 6 + self.full_w * scale * self.ratio + 5 + cap_h + 10

    def wrap(self, aw, ah):
        self.scale = 1.0
        if self._height(1.0, aw) > ah:
            fit = (ah - (self._height(0, aw))) / (self.full_w * self.ratio)
            if fit >= 0.85:
                self.scale = fit
        self.width = aw
        self.height = self._height(self.scale, aw)
        return self.width, self.height

    def split(self, aw, ah):
        # Don't leave a gap: let the text continue and place the figure at the
        # top of the next page instead (a standard "float").
        if not getattr(self, "_placed", False):
            return [FloatMarker(self)]
        return []

    def draw(self):
        w = self.full_w * self.scale
        h = w * self.ratio
        cap_w, cap_h = self.caption.wrap(self.width, 1000)
        self.canv.drawImage(self.path, (self.width - w) / 2, cap_h + 15, width=w, height=h)
        self.caption.drawOn(self.canv, 0, 10)


class FloatMarker(Flowable):
    """Zero-height placeholder that queues a figure for the top of the next page."""

    def __init__(self, figure):
        super().__init__()
        self.figure = figure

    def wrap(self, aw, ah):
        return 0, 0

    def draw(self):
        doc = self.canv._doctemplate
        doc._floats.append(self.figure)


def image_block(path, caption, styles):
    # Terminal screenshots may be taller, so they keep the full text width and readable text.
    max_h = 4.8 * inch if os.path.basename(str(path)).startswith("term-") else 3.4 * inch
    return [Figure(path, caption, styles["caption"], max_h=max_h)]


def callout(kind, text, styles):
    label = f"<b>{kind}:</b> " if kind else ""
    p = Paragraph(label + inline(text), styles["callout"])
    t = Table([[p]], colWidths=[TEXT_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EAF0F7")),
        ("LINEBEFORE", (0, 0), (0, -1), 3, ACCENT),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return [KeepTogether([Spacer(1, 3), t, Spacer(1, 9)])]


def table_block(rows, styles):
    ncols = max(len(r) for r in rows)
    rows = [r + [""] * (ncols - len(r)) for r in rows]
    weights, mins = [], []
    for c in range(ncols):
        longest = max(len(r[c]) for r in rows)
        weights.append(min(max(longest, 8), 60))
        word = max((w for r in rows for w in re.sub(r"[*`]", "", r[c]).split()), key=len, default="")
        font = "Sans-Bold" if any(word in w for w in rows[0][c].split()) else "Serif"
        mins.append(pdfmetrics.stringWidth(word, font, 8.8) + 10)
    total = sum(weights)
    widths = [max(TEXT_W * w / total, m) for w, m in zip(weights, mins)]
    excess = sum(widths) - TEXT_W
    if excess > 0:
        flex = [i for i in range(ncols) if widths[i] > mins[i]]
        room = sum(widths[i] - mins[i] for i in flex)
        for i in flex:
            widths[i] -= excess * (widths[i] - mins[i]) / room
    data = []
    for ri, r in enumerate(rows):
        st = styles["cellhead"] if ri == 0 else styles["cell"]
        data.append([Paragraph(inline(c), st) for c in r])
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), ACCENT),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ("GRID", (0, 0), (-1, -1), 0.4, RULE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    if len(rows) <= 5:
        # Short tables read best in one piece.
        return [KeepTogether([Spacer(1, 4), t, Spacer(1, 10)])]
    # Longer tables may split (the header row repeats), but start only if a few rows fit.
    return [CondPageBreak(1.4 * inch), Spacer(1, 4), t, Spacer(1, 10)]


def front_matter(meta, styles):
    story = []
    # Page 1: half title
    story += [Marker(plain=True, number=False, front=True), Spacer(1, 2.4 * inch),
              Paragraph(meta["title"], styles["title"]), PageBreak()]
    # Page 2: blank
    story += [Marker(plain=True, number=False), Spacer(1, 1), PageBreak()]
    # Page 3: full title page
    story += [Marker(plain=True, number=False), Spacer(1, 1.5 * inch),
              Paragraph(meta["title"], styles["title"]),
              Paragraph(meta["subtitle"], styles["subtitle"]),
              Spacer(1, 2.2 * inch),
              Paragraph(meta["author"], styles["author"]), PageBreak()]
    # Page 4: copyright
    y = meta["year"]
    copy = [
        f"<b>{meta['title']}</b><br/>{meta['subtitle']}",
        f"Copyright &copy; {y} {meta['author']}. All rights reserved.",
        "No part of this publication may be reproduced, distributed, or transmitted in any form "
        "or by any means without the prior written permission of the author, except for brief "
        "quotations in reviews and certain other noncommercial uses permitted by copyright law. "
        + meta["reuse_note"],
        "<b>Disclaimer.</b> This book is provided for educational and informational purposes only. "
        "AI products, features, and policies change frequently; verify current details with each "
        "provider. The author makes no guarantees about results and is not liable for any losses "
        "arising from the use of this information. Nothing in this book is legal, medical, "
        "financial, or other professional advice.",
        "<b>Trademarks.</b> " + meta["trademarks"],
        "<b>Examples.</b> " + meta.get("examples_note", "The people, businesses, and data in the "
        "example projects are fictional. Any resemblance to real organizations or persons is "
        "coincidental."),
        f"First edition, {y}.",
    ]
    story += [Marker(plain=True, number=False), Spacer(1, 2.6 * inch)]
    story += [Paragraph(c, styles["small"]) for c in copy]
    story += [PageBreak()]
    # Page 5: dedication, followed by a blank verso
    if meta.get("dedication"):
        story += [Marker(plain=True, number=False), Spacer(1, 2.3 * inch)]
        for line in meta["dedication"]:
            story.append(Paragraph(line, styles["dedication"]) if line else Spacer(1, 10))
        story += [PageBreak(), Marker(plain=True, number=False), Spacer(1, 1), PageBreak()]
    # Next: table of contents (may run several pages)
    toc = TableOfContents(dotsMinLevel=1)
    toc.levelStyles = [styles["toc0"], styles["toc1"]]
    story += [Marker(plain=True, number=False), Spacer(1, 0.6 * inch),
              Paragraph("Contents", styles["toctitle"]), HRule(TEXT_W), Spacer(1, 10), toc]
    return story


class KeepWithNext(CondPageBreak):
    """Start a new page unless the heading(s) that follow fit together with at
    least the first lines of the content after them. Prevents stranded headings."""

    def __init__(self, following):
        super().__init__(0)
        self.following = following

    def _needed(self, aw, ah):
        need = 0
        for f in self.following:
            if isinstance(f, Marker) or isinstance(f, KeepWithNext):
                continue
            if isinstance(f, CondPageBreak):
                if f.height > ah - need:
                    return None
                continue
            if isinstance(f, Spacer):
                need += f.height
                continue
            if hasattr(self, "canv"):
                f.canv = self.canv
            before = f.getSpaceBefore()
            if getattr(f, "_guarded", False):
                need += before + f.wrap(aw, ah)[1] + f.getSpaceAfter()
                continue
            avail = ah - need - before
            if avail <= 0:
                return None
            h = f.wrap(aw, avail)[1]
            if isinstance(f, KeepTogether):
                h = f._H  # KeepTogether reports a sentinel height; the real one is _H
            if h <= avail:
                return need + before + h
            if isinstance(f, Figure):
                continue  # it will float to the next page
            if isinstance(f, KeepTogether):
                return None
            parts = f.split(aw, avail)
            if len(parts) < 2:
                return None
            if hasattr(self, "canv"):
                parts[0].canv = self.canv
            return need + before + parts[0].wrap(aw, avail)[1]
        return need

    def wrap(self, aw, ah):
        frame_h = PAGE_H - TOP - BOTTOM
        if ah < frame_h - 2:  # never force a break at the top of a page
            need = self._needed(aw, ah)
            if need is None or need > ah:
                f = self._doctemplateAttr("frame")
                if f:
                    from reportlab.platypus.doctemplate import FrameBreak
                    f.add_generated_content(FrameBreak)
        return 0, 0


def add_keep_with_next(story):
    """Insert a KeepWithNext guard before every flowable marked _guarded."""
    out = []
    for i, f in enumerate(story):
        if getattr(f, "_guarded", False) and not getattr(story[i - 1], "_guarded", False):
            out.append(KeepWithNext(story[i:i + 12]))
        out.append(f)
    return out


def build_story(meta, manuscript, styles, image_root):
    story = front_matter(meta, styles)
    pending_chapter_prefix = None
    for fname, blocks in manuscript:
        for bi, block in enumerate(blocks):
            kind = block[0]
            if kind == "part":
                num, title = block[1].split(":", 1)
                story += recto_break()
                p = Paragraph(title.strip(), styles["parttitle"])
                p._toc = (0, f"{num.strip()}: {title.strip()}")
                story += [Marker(plain=True, number=False, front=False), Spacer(1, 2.6 * inch),
                          Paragraph(num.strip().upper(), styles["partnum"]),
                          HRule(TEXT_W * 0.3, hAlign="CENTER"), Spacer(1, 14), p]
                pending_chapter_prefix = None
            elif kind == "chapter":
                title = block[1]
                m = re.match(r"^Chapter (\d+): (.*)$", title)
                story += recto_break()
                story.append(Marker(plain="opener", front=False, chapter=(m.group(2) if m else title)))
                story.append(Spacer(1, 1.3 * inch))
                if m:
                    level = meta.get("levels", {}).get(m.group(1))
                    label = f"CHAPTER {m.group(1)}" + (f"&nbsp;&nbsp;&middot;&nbsp;&nbsp;{level.upper()}" if level else "")
                    story.append(Paragraph(label, styles["chapnum"]))
                    head = Paragraph(m.group(2), styles["chaptitle"])
                    head._toc = (1, f"{m.group(1)}. {m.group(2)}")
                else:
                    head = Paragraph(title, styles["chaptitle"])
                    head._toc = (0 if title.startswith("Appendix") or title in (
                        "Introduction", "About the Author") else 1, title)
                story += [head, HRule(TEXT_W), Spacer(1, 22)]
            elif kind in ("h2", "h3"):
                h = Paragraph(inline(block[1]), styles[kind])
                h._guarded = True
                story.append(h)
            elif kind == "p":
                # Bold labels and lead-ins ending in ":" belong with what follows them.
                label = re.fullmatch(r"\*\*[^*]+\*\*", block[1]) or re.match(r"\*\*Prompt \d+:", block[1])
                para = Paragraph(inline(block[1]), styles["label" if label else "body"])
                nxt = blocks[bi + 1][0] if bi + 1 < len(blocks) else None
                short_leadin = block[1].rstrip().endswith(":") and len(block[1]) < 600
                nxt_bold = nxt == "p" and blocks[bi + 1][1].startswith("**")
                if label or (short_leadin and (nxt in ("code", "ul", "ol", "table", "image", "callout") or nxt_bold)):
                    para._guarded = True
                story.append(para)
            elif kind == "ul":
                nxt = blocks[bi + 1][0] if bi + 1 < len(blocks) else None
                for k, item in enumerate(block[1]):
                    bp = Paragraph(inline(item), styles["bullet"], bulletText="•")
                    # A last bullet that introduces a code block stays with it.
                    if k == len(block[1]) - 1 and item.rstrip().endswith(":") and nxt == "code":
                        bp._guarded = True
                    story.append(bp)
                story.append(Spacer(1, 4))
            elif kind == "ol":
                for n, item in enumerate(block[1], 1):
                    story.append(Paragraph(inline(item), styles["bullet"], bulletText=f"{n}."))
                story.append(Spacer(1, 4))
            elif kind == "image":
                story += image_block(image_root / block[1], block[2], styles)
            elif kind == "code":
                story += code_block(block[1], styles, source=len(block) > 2 and block[2] == "source")
            elif kind == "callout":
                story += callout(block[1], block[2], styles)
            elif kind == "table":
                story += table_block(block[1], styles)
    return add_keep_with_next(story)


def build_interior(meta, manuscript, out_path, image_root):
    register_fonts()
    styles = make_styles()
    doc = BookDoc(str(out_path), meta)
    story = build_story(meta, manuscript, styles, image_root)
    doc.multiBuild(story)
    return doc.page
