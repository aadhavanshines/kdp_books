"""Build the KDP paperback interior PDF (6 x 9 in, no bleed, embedded fonts)."""
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
CODE_PAD = 6


def inline(text):
    """Convert inline Markdown to ReportLab paragraph markup."""
    parts = re.split(r"(`[^`]+`)", text)
    out = []
    for part in parts:
        if part.startswith("`") and part.endswith("`") and len(part) > 1:
            code = part[1:-1].replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            out.append(f'<font face="Mono" size="8.6">{code}</font>')
        else:
            t = part.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
            t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<i>\1</i>", t)
            out.append(t)
    return "".join(out)


def make_styles():
    s = {}
    s["body"] = ParagraphStyle("body", fontName="Serif", fontSize=10.6, leading=14.6,
                               alignment=TA_JUSTIFY, spaceAfter=6.5, allowWidows=0, bulletFontName="Serif",
                               allowOrphans=0, hyphenationLang=None)
    s["label"] = ParagraphStyle("label", parent=s["body"], keepWithNext=1, spaceAfter=4)
    s["h2"] = ParagraphStyle("h2", fontName="Sans-Bold", fontSize=13.5, leading=17,
                             textColor=ACCENT, spaceBefore=14, spaceAfter=6, keepWithNext=1)
    s["h3"] = ParagraphStyle("h3", fontName="Sans-Bold", fontSize=11.2, leading=14.5,
                             textColor=colors.black, spaceBefore=10, spaceAfter=4, keepWithNext=1)
    s["bullet"] = ParagraphStyle("bullet", parent=s["body"], leftIndent=16, bulletIndent=5,
                                 spaceAfter=3.5, alignment=TA_LEFT)
    s["callout"] = ParagraphStyle("callout", parent=s["body"], fontSize=10, leading=13.8,
                                  spaceAfter=0, alignment=TA_LEFT)
    s["code"] = ParagraphStyle("code", fontName="Mono", fontSize=CODE_SIZE, leading=CODE_SIZE * 1.32)
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
                canv.drawRightString(PAGE_W - OUTSIDE, y_head, chapter.upper())
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


def wrap_code(code):
    char_w = pdfmetrics.stringWidth("M", "Mono", CODE_SIZE)
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
        out.extend(" " * (indent + 2) + w for w in wrapped[1:])
    return "\n".join(out)


def code_block(code, styles):
    code = wrap_code(code)
    esc = code.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    pre = XPreformatted(esc, styles["code"])
    t = Table([[pre]], colWidths=[TEXT_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.5, RULE),
        ("LEFTPADDING", (0, 0), (-1, -1), CODE_PAD),
        ("RIGHTPADDING", (0, 0), (-1, -1), CODE_PAD),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    lines = code.count("\n") + 1
    flow = [Spacer(1, 2), t, Spacer(1, 8)]
    # Keep short blocks unsplit; long blocks may break across pages.
    return [KeepTogether(flow)] if lines <= 22 else flow


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
    weights = []
    for c in range(ncols):
        longest = max(len(r[c]) for r in rows)
        weights.append(min(max(longest, 8), 60))
    total = sum(weights)
    widths = [TEXT_W * w / total for w in weights]
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
    return [Spacer(1, 4), t, Spacer(1, 10)]


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
        "Readers may freely use and adapt the example prompts in this book for their own work.",
        "<b>Disclaimer.</b> This book is provided for educational and informational purposes only. "
        "AI products, features, and policies change frequently; verify current details with each "
        "provider. The author makes no guarantees about results and is not liable for any losses "
        "arising from the use of this information. Nothing in this book is legal, medical, "
        "financial, or other professional advice.",
        "<b>Trademarks.</b> ChatGPT, GPT, Sora, and DALL&middot;E are trademarks of OpenAI. Claude is a "
        "trademark of Anthropic. Gemini, Google, Gmail, Imagen, Veo, and YouTube are trademarks of "
        "Google LLC. Microsoft, Copilot, Word, Excel, PowerPoint, Outlook, and Teams are trademarks "
        "of Microsoft Corporation. GitHub Copilot is a trademark of GitHub, Inc. Midjourney, "
        "Perplexity, Meta AI, Llama, Grok, DeepSeek, Mistral, Stable Diffusion, Flux, Runway, "
        "Suno, Udio, ElevenLabs, Cursor, and all other product names are trademarks of their "
        "respective owners. This book is independent and is not affiliated with, sponsored by, or "
        "endorsed by any of these companies.",
        f"First edition, {y}.",
    ]
    story += [Marker(plain=True, number=False), Spacer(1, 2.6 * inch)]
    story += [Paragraph(c, styles["small"]) for c in copy]
    story += [PageBreak()]
    # Page 5: table of contents (may run several pages)
    toc = TableOfContents(dotsMinLevel=1)
    toc.levelStyles = [styles["toc0"], styles["toc1"]]
    story += [Marker(plain=True, number=False), Spacer(1, 0.6 * inch),
              Paragraph("Contents", styles["toctitle"]), HRule(TEXT_W), Spacer(1, 10), toc]
    return story


def build_story(meta, manuscript, styles):
    story = front_matter(meta, styles)
    pending_chapter_prefix = None
    for fname, blocks in manuscript:
        for block in blocks:
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
                    story.append(Paragraph(f"CHAPTER {m.group(1)}", styles["chapnum"]))
                    head = Paragraph(m.group(2), styles["chaptitle"])
                    head._toc = (1, f"{m.group(1)}. {m.group(2)}")
                else:
                    head = Paragraph(title, styles["chaptitle"])
                    head._toc = (0 if title.startswith("Appendix") or title in (
                        "Introduction", "About the Author") else 1, title)
                story += [head, HRule(TEXT_W), Spacer(1, 22)]
            elif kind == "h2":
                story += [CondPageBreak(1.1 * inch), Paragraph(inline(block[1]), styles["h2"])]
            elif kind == "h3":
                story += [CondPageBreak(0.9 * inch), Paragraph(inline(block[1]), styles["h3"])]
            elif kind == "p":
                # A paragraph that is only a bold label introduces what follows; keep them together.
                label = re.fullmatch(r"\*\*[^*]+\*\*", block[1])
                story.append(Paragraph(inline(block[1]), styles["label" if label else "body"]))
            elif kind == "ul":
                for item in block[1]:
                    story.append(Paragraph(inline(item), styles["bullet"], bulletText="•"))
                story.append(Spacer(1, 4))
            elif kind == "ol":
                for n, item in enumerate(block[1], 1):
                    story.append(Paragraph(inline(item), styles["bullet"], bulletText=f"{n}."))
                story.append(Spacer(1, 4))
            elif kind == "code":
                story += code_block(block[1], styles)
            elif kind == "callout":
                story += callout(block[1], block[2], styles)
            elif kind == "table":
                story += table_block(block[1], styles)
    # KDP prefers an even page count; the final page break pads automatically.
    return story


def build_interior(meta, manuscript, out_path):
    register_fonts()
    styles = make_styles()
    doc = BookDoc(str(out_path), meta)
    story = build_story(meta, manuscript, styles)
    doc.multiBuild(story)
    return doc.page
