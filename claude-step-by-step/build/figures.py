"""Concept diagrams, plus simplified drawings of two Settings screens.

The book uses real screenshots (build/screens.py) wherever it can. Settings >
Memory and Settings > Connectors show private account details, so those two
are drawn instead. Everything is grayscale for the black-and-white paperback.

These are diagrams, not screenshots: they show where things are and what they
do, using plain shapes and the same words the app uses. They print sharply on a
black-and-white paperback and stay readable on a small Kindle screen. No logos.

Usage: python3 build/figures.py   (writes PNGs to manuscript/images/)
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "fonts"
OUT = ROOT / "manuscript" / "images"
REG = str(FONTS / "AtkinsonHyperlegible-Regular.ttf")
BOLD = str(FONTS / "AtkinsonHyperlegible-Bold.ttf")

INK, MID, SOFT, LINE, FILL, PAPER = (20, 20, 20), (95, 95, 95), (150, 150, 150), (200, 200, 200), (238, 238, 238), (255, 255, 255)
W = 1500


def F(size, bold=False):
    return ImageFont.truetype(BOLD if bold else REG, size)


def wrap(d, text, f, width):
    out = []
    for para in text.split("\n"):
        cur = ""
        for w in para.split():
            t = (cur + " " + w).strip()
            if d.textlength(t, font=f) <= width or not cur:
                cur = t
            else:
                out.append(cur)
                cur = w
        out.append(cur)
    return out


def text_block(d, x, y, text, f, width, fill=INK, lh=None):
    lh = lh or int(f.size * 1.32)
    for line in wrap(d, text, f, width):
        d.text((x, y), line, font=f, fill=fill)
        y += lh
    return y


def badge(d, x, y, n, r=30):
    """A black numbered circle used to label parts of a screen."""
    d.ellipse([x - r, y - r, x + r, y + r], fill=INK)
    d.text((x, y + 1), str(n), font=F(int(r * 1.15), True), fill=PAPER, anchor="mm")


def window(h, title="Claude"):
    img = Image.new("RGB", (W, h), PAPER)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([4, 4, W - 5, h - 5], 26, outline=INK, width=5, fill=PAPER)
    d.rounded_rectangle([4, 4, W - 5, 70], 26, fill=FILL)
    d.rectangle([4, 44, W - 5, 70], fill=FILL)
    d.line([4, 70, W - 5, 70], fill=LINE, width=3)
    for i in range(3):
        d.ellipse([34 + i * 40, 26, 58 + i * 40, 50], outline=MID, width=3)
    d.text((W / 2, 38), title, font=F(30, True), fill=MID, anchor="mm")
    return img, d


def sidebar(d, h, items, x1=340, active=None):
    d.rectangle([7, 73, x1, h - 8], fill=(246, 246, 246))
    d.line([x1, 73, x1, h - 8], fill=LINE, width=3)
    d.rounded_rectangle([30, 100, x1 - 30, 160], 16, fill=PAPER, outline=MID, width=3)
    d.text((70, 130), "+   New chat", font=F(32, True), fill=INK, anchor="lm")
    y = 200
    for it in items:
        if it == "":
            y += 20
            continue
        bold = it.isupper()
        f = F(24 if bold else 30, bold)
        if it == active:
            d.rounded_rectangle([22, y - 8, x1 - 22, y + 44], 12, fill=LINE)
        d.text((44, y), it.title() if bold else it, font=f, fill=SOFT if bold else INK)
        y += 46 if bold else 56
    return x1


def composer(d, x0, x1, y, placeholder="How can I help you today?", model="Sonnet 5.5", tall=150):
    d.rounded_rectangle([x0, y, x1, y + tall], 30, outline=MID, width=4, fill=PAPER)
    d.text((x0 + 36, y + 36), placeholder, font=F(32), fill=SOFT)
    by = y + tall - 50
    d.ellipse([x0 + 30, by - 26, x0 + 82, by + 26], outline=INK, width=4)
    d.text((x0 + 56, by), "+", font=F(42, True), fill=INK, anchor="mm")
    d.rounded_rectangle([x0 + 100, by - 26, x0 + 152, by + 26], 12, outline=INK, width=4)
    for k in range(3):
        d.line([x0 + 112, by - 12 + k * 12, x0 + 140, by - 12 + k * 12], fill=INK, width=3)
    tw = d.textlength(model + "  v", font=F(30))
    d.text((x1 - 110 - tw, by), model + "  v", font=F(30), fill=MID, anchor="lm")
    d.rounded_rectangle([x1 - 88, by - 30, x1 - 28, by + 30], 16, fill=INK)
    d.line([x1 - 58, by + 16, x1 - 58, by - 16], fill=PAPER, width=6)
    d.line([x1 - 74, by - 2, x1 - 58, by - 18, x1 - 42, by - 2], fill=PAPER, width=6)
    return {"plus": (x0 + 56, by), "tools": (x0 + 126, by), "model": (x1 - 110 - tw / 2, by), "send": (x1 - 58, by)}


def you(d, x1, y, text, maxw=760):
    f = F(32)
    lines = wrap(d, text, f, maxw - 60)
    w = max(d.textlength(l, font=f) for l in lines) + 64
    h = len(lines) * 44 + 40
    d.rounded_rectangle([x1 - w, y, x1, y + h], 26, fill=FILL)
    for i, l in enumerate(lines):
        d.text((x1 - w + 32, y + 20 + i * 44), l, font=f, fill=INK)
    return y + h + 30


def reply(d, x0, y, text, width):
    d.ellipse([x0, y + 2, x0 + 40, y + 42], outline=INK, width=4)
    d.text((x0 + 20, y + 22), "*", font=F(36, True), fill=INK, anchor="mm")
    return text_block(d, x0 + 64, y, text, F(32), width - 64, lh=44) + 26


def callout_list(img, d, y, items, x=40, width=W - 80):
    """Numbered legend under a screen: (n, bold label, explanation)."""
    for n, label, expl in items:
        badge(d, x + 30, y + 26, n, 26)
        f_b, f_r = F(32, True), F(32)
        lw = d.textlength(label + "  ", font=f_b)
        d.text((x + 76, y + 6), label, font=f_b, fill=INK)
        lines = wrap(d, expl, f_r, width - 76 - lw)
        for i, l in enumerate(lines):
            d.text((x + 76 + lw, y + 6 + i * 42), l, font=f_r, fill=INK)
        y += max(1, len(lines)) * 42 + 22
    return y


def save(img, name, crop_to=None):
    OUT.mkdir(parents=True, exist_ok=True)
    if crop_to:
        img = img.crop((0, 0, W, crop_to))
    img.save(OUT / f"{name}.png", dpi=(300, 300))
    print("figure", name, img.size)


# ---------------------------------------------------------------- figures

def fig_screen_parts():
    img, d = window(980)
    x1 = sidebar(d, 980, ["Chats", "Projects", "Artifacts", "Customize", "", "RECENTS", "Trip to Lisbon", "Cover letter", "Budget sheet"])
    d.text(((x1 + W) / 2, 330), "Good morning, Sam", font=F(54, True), fill=INK, anchor="mm")
    c = composer(d, x1 + 90, W - 90, 440)
    d.rounded_rectangle([x1 + 90, 620, x1 + 330, 676], 28, outline=LINE, width=3)
    d.text((x1 + 210, 648), "Write", font=F(28), fill=MID, anchor="mm")
    d.rounded_rectangle([x1 + 350, 620, x1 + 590, 676], 28, outline=LINE, width=3)
    d.text((x1 + 470, 648), "Learn", font=F(28), fill=MID, anchor="mm")
    d.rounded_rectangle([x1 + 610, 620, x1 + 850, 676], 28, outline=LINE, width=3)
    d.text((x1 + 730, 648), "Life stuff", font=F(28), fill=MID, anchor="mm")
    d.ellipse([30, 900, 80, 950], fill=MID)
    d.text((100, 925), "Sam", font=F(28), fill=INK, anchor="lm")
    for n, (x, y) in enumerate([(300, 130), (290, 214), (300, 270), c["plus"], c["tools"], c["model"], c["send"], (300, 925)], 1):
        badge(d, x, y - (110 if n in (4, 5, 6, 7) else 0), n)
    return img


def fig_screen_legend():
    img = Image.new("RGB", (W, 820), PAPER)
    d = ImageDraw.Draw(img)
    end = callout_list(img, d, 10, [
        (1, "New chat", "starts a fresh conversation with no history."),
        (2, "Chats", "lists every past conversation; you can search them."),
        (3, "Projects and Artifacts", "your workspaces and the things Claude has made."),
        (4, "The + button", "adds files and photos, and opens connectors and other extras."),
        (5, "Tools", "turns on web search, research, extended thinking and styles."),
        (6, "Model picker", "chooses which Claude model answers (Chapter 2)."),
        (7, "Send", "sends your request. Enter also sends; Shift+Enter makes a new line."),
        (8, "Your name", "opens Settings: profile, memory, connectors, privacy and your plan."),
    ])
    return img.crop((0, 0, W, end + 10))


def fig_first_chat():
    img, d = window(1220)
    x0, x1 = 120, W - 120
    y = you(d, x1, 110, "I have a dentist appointment I need to move. Write a short, polite email asking for a new time next week, any afternoon except Wednesday.")
    y = reply(d, x0, y, "Here's a short email you can send:\n\nSubject: Rescheduling my appointment\n\nHello,\nI need to move my appointment on Friday 14 November. Could we find a new time next week? Any afternoon works for me except Wednesday.\nThank you for your help,\nSam Rivera", x1 - x0)
    acts = ["Copy", "Retry", "Like", "Dislike"]
    for i, a in enumerate(acts):
        d.rounded_rectangle([x0 + 64 + i * 150, y, x0 + 194 + i * 150, y + 50], 12, outline=LINE, width=3)
        d.text((x0 + 129 + i * 150, y + 25), a, font=F(26), fill=MID, anchor="mm")
    badge(d, x0 + 680, y + 25, 1)
    d.text((x0 + 730, y + 25), "Buttons under every answer", font=F(28, True), fill=INK, anchor="lm")
    composer(d, 120, W - 120, y + 120, placeholder="Reply to Claude...")
    return img.crop((0, 0, W, y + 300))


def fig_plus_menu():
    img, d = window(1090)
    d.rounded_rectangle([80, 110, 820, 870], 24, outline=INK, width=4, fill=PAPER)
    items = [("Add files or photos", "PDFs, documents, spreadsheets, images"), ("Take a screenshot", "on the desktop app"),
             ("Add from Google Drive", "or another connected app"), ("Add to project", "move this chat into a project"),
             ("Connectors", "turn apps on or off for this chat"), ("Skills", "see which skills are available")]
    y = 140
    for i, (a, b) in enumerate(items):
        d.text((130, y), a, font=F(34, True), fill=INK)
        d.text((130, y + 46), b, font=F(28), fill=MID)
        if i < len(items) - 1:
            d.line([110, y + 100, 790, y + 100], fill=LINE, width=2)
        y += 120
    composer(d, 80, W - 80, 905, placeholder="Summarize the attached report", tall=150)
    badge(d, 860, 160, 1)
    d.text((900, 160), "Opened with the + button", font=F(32, True), fill=INK, anchor="lm")
    text_block(d, 900, 210, "The exact list depends on your plan, your device and which apps you have connected.", F(30), 520, MID)
    return img


def fig_tools_menu():
    img, d = window(820)
    d.rounded_rectangle([80, 110, 900, 700], 24, outline=INK, width=4, fill=PAPER)
    items = [("Web search", True), ("Research", False), ("Extended thinking", False), ("Use style: Normal", None)]
    y = 140
    for a, on in items:
        d.text((130, y + 30), a, font=F(36, True), fill=INK, anchor="lm")
        if on is not None:
            x = 760
            d.rounded_rectangle([x, y + 8, x + 90, y + 52], 22, fill=INK if on else LINE)
            cx = x + 68 if on else x + 22
            d.ellipse([cx - 18, y + 12, cx + 18, y + 48], fill=PAPER)
        else:
            d.text((850, y + 30), ">", font=F(40, True), fill=MID, anchor="mm")
        d.line([110, y + 100, 870, y + 100], fill=LINE, width=2)
        y += 140
    badge(d, 950, 170, 1)
    text_block(d, 1000, 145, "Switches stay on for this chat until you turn them off.", F(32), 440)
    badge(d, 950, 450, 2)
    text_block(d, 1000, 425, "Research takes longer and returns a cited report.", F(32), 440)
    return img.crop((0, 0, W, 740))


def fig_artifact():
    img, d = window(1120)
    mid = 640
    d.line([mid, 73, mid, 1112], fill=LINE, width=3)
    y = you(d, mid - 40, 110, "Make me a simple tip calculator I can use on my phone.", 520)
    y = reply(d, 40, y, "Here's a tip calculator. Type the bill, pick a tip and the number of people.", mid - 80)
    d.rounded_rectangle([104, y, mid - 40, y + 100], 18, outline=INK, width=4)
    d.text((134, y + 30), "Tip calculator", font=F(32, True), fill=INK)
    d.text((134, y + 68), "Interactive artifact  ·  Click to open", font=F(24), fill=MID)
    composer(d, 40, mid - 40, 920, placeholder="Reply...", model="", tall=140)
    # right panel
    d.rectangle([mid + 2, 73, W - 8, 140], fill=(246, 246, 246))
    d.text((mid + 40, 106), "Tip calculator", font=F(32, True), fill=INK, anchor="lm")
    for i, t in enumerate(["Code", "Copy", "Publish"]):
        d.text((W - 380 + i * 120, 106), t, font=F(26), fill=MID, anchor="lm")
    px0 = mid + 120
    d.text((px0, 200), "Bill amount", font=F(30, True), fill=INK)
    d.rounded_rectangle([px0, 245, W - 120, 310], 12, outline=MID, width=3)
    d.text((px0 + 24, 278), "$ 84.50", font=F(32), fill=INK, anchor="lm")
    d.text((px0, 350), "Tip", font=F(30, True), fill=INK)
    for i, t in enumerate(["15%", "18%", "20%"]):
        x = px0 + i * 200
        d.rounded_rectangle([x, 395, x + 170, 455], 14, fill=INK if i == 1 else PAPER, outline=INK, width=3)
        d.text((x + 85, 425), t, font=F(30, True), fill=PAPER if i == 1 else INK, anchor="mm")
    d.text((px0, 500), "People", font=F(30, True), fill=INK)
    d.rounded_rectangle([px0, 545, px0 + 240, 610], 12, outline=MID, width=3)
    d.text((px0 + 120, 578), "-     3     +", font=F(32), fill=INK, anchor="mm")
    d.rounded_rectangle([px0, 670, W - 120, 830], 18, fill=FILL)
    d.text((px0 + 30, 700), "Each person pays", font=F(30), fill=MID)
    d.text((px0 + 30, 745), "$33.24", font=F(56, True), fill=INK)
    badge(d, 66, y - 10 + 40, 1)
    badge(d, mid + 330, 106, 2)
    return img


def fig_project():
    img, d = window(1060, "Claude  -  Project")
    x1 = sidebar(d, 1060, ["Chats", "Projects", "Artifacts", "Customize"], active="Projects")
    x0 = x1 + 90
    d.text((x0, 110), "Kitchen Renovation", font=F(48, True), fill=INK)
    text_block(d, x0, 172, "Planning our kitchen remodel.", F(28), 560, MID)
    composer(d, x0, 1000, 240, placeholder="Start a chat in this project...", tall=150)
    d.text((x0, 420), "Chats in this project", font=F(30, True), fill=INK)
    for i, t in enumerate(["Compare the three contractor quotes", "Questions for the electrician", "Week-by-week timeline"]):
        d.rounded_rectangle([x0, 470 + i * 90, 1010, 540 + i * 90], 14, outline=LINE, width=3)
        d.text((x0 + 24, 505 + i * 90), t, font=F(30), fill=INK, anchor="lm")
    # right column
    rx = 1050
    d.rounded_rectangle([rx, 110, W - 30, 520], 18, outline=INK, width=3)
    d.text((rx + 50, 130), "Instructions", font=F(30, True), fill=INK)
    text_block(d, rx + 24, 200, "We are in Denver. Budget $28,000. Keep answers short and list costs in a table.", F(26), W - 30 - rx - 48, MID, 36)
    d.rounded_rectangle([rx, 550, W - 30, 1000], 18, outline=INK, width=3)
    d.text((rx + 50, 570), "Files", font=F(30, True), fill=INK)
    for i, t in enumerate(["quote-ace-builders.pdf", "quote-mile-high.pdf", "quote-northside.pdf", "floor-plan.jpg", "budget.xlsx"]):
        d.text((rx + 24, 625 + i * 52), t, font=F(25), fill=INK)
    d.text((rx + 24, 900), "4% of project capacity", font=F(24), fill=MID)
    badge(d, x0 - 45, 140, 1)
    badge(d, rx + 4, 148, 2)
    badge(d, rx + 4, 588, 3)
    badge(d, x0 - 45, 440, 4)
    return img


def fig_memory():
    img, d = window(960, "Settings")
    x1 = sidebar(d, 960, ["General", "Profile", "Memory", "Connectors", "Privacy", "Billing"], active="Memory")
    x0 = x1 + 110
    d.text((x0, 110), "Memory", font=F(48, True), fill=INK)
    rows = [("Search and reference past chats", True), ("Generate memory from chat history", True), ("Include sensitive topics in memory", False)]
    y = 190
    for t, on in rows:
        d.text((x0, y + 22), t, font=F(30), fill=INK, anchor="lm")
        x = W - 170
        d.rounded_rectangle([x, y, x + 90, y + 44], 22, fill=INK if on else LINE)
        cx = x + 68 if on else x + 22
        d.ellipse([cx - 18, y + 4, cx + 18, y + 40], fill=PAPER)
        y += 70
    d.text((x0, y + 20), "Topics", font=F(34, True), fill=INK)
    y += 80
    for t, n in [("Work: I'm an office manager at a dental clinic", "6 memories"), ("Family: two kids, Maya (9) and Leo (6)", "4 memories"),
                 ("Writing: likes short, warm emails; US spelling", "3 memories"), ("Running: training for a 10K in March", "5 memories")]:
        d.rounded_rectangle([x0, y, W - 60, y + 84], 14, outline=LINE, width=3)
        d.text((x0 + 24, y + 42), t, font=F(28), fill=INK, anchor="lm")
        d.text((W - 90, y + 42), n + "   Edit", font=F(24), fill=MID, anchor="rm")
        y += 100
    badge(d, x0 - 50, 212, 1)
    badge(d, x0 - 50, 352, 2)
    badge(d, x0 - 50, 440, 3)
    return img.crop((0, 0, W, y + 30))


def fig_connectors():
    img, d = window(1010, "Settings")
    x1 = sidebar(d, 1010, ["General", "Profile", "Memory", "Connectors", "Privacy", "Billing"], active="Connectors")
    x0 = x1 + 60
    d.text((x0, 110), "Connectors", font=F(48, True), fill=INK)
    d.text((x0, 175), "Let Claude read from and work in the apps you use.", font=F(28), fill=MID)
    y = 240
    for name, state in [("Gmail", "Connected"), ("Google Calendar", "Connected"), ("Google Drive", "Connect"),
                        ("Microsoft 365", "Connect"), ("Notion", "Connect"), ("Slack", "Connect")]:
        d.rounded_rectangle([x0, y, W - 60, y + 86], 14, outline=LINE, width=3)
        d.rounded_rectangle([x0 + 20, y + 18, x0 + 70, y + 68], 10, fill=LINE)
        d.text((x0 + 96, y + 43), name, font=F(32, True), fill=INK, anchor="lm")
        if state == "Connected":
            d.text((W - 100, y + 43), "Connected  ...", font=F(28), fill=MID, anchor="rm")
        else:
            d.rounded_rectangle([W - 260, y + 18, W - 90, y + 68], 14, outline=INK, width=3)
            d.text((W - 175, y + 43), "Connect", font=F(28, True), fill=INK, anchor="mm")
        y += 102
    d.text((x0, y + 20), "+  Browse connectors   ·   Add custom connector", font=F(28, True), fill=INK)
    return img.crop((0, 0, W, y + 90))


def fig_message_actions():
    img, d = window(760)
    x0, x1 = 120, W - 120
    y = you(d, x1, 110, "List five dinner ideas that use chickpeas.")
    hx = x1 - 360
    for i, t in enumerate(["Edit", "Copy"]):
        d.rounded_rectangle([hx + i * 140, y - 18, hx + 120 + i * 140, y + 30], 12, outline=INK, width=3)
        d.text((hx + 60 + i * 140, y + 6), t, font=F(26, True), fill=INK, anchor="mm")
    badge(d, hx - 50, y + 6, 1)
    y = reply(d, x0, y + 50, "1. Chickpea curry with spinach\n2. Crispy chickpea tacos\n3. Chickpea and lemon pasta\n4. Sheet-pan chickpeas and peppers\n5. Chickpea salad sandwiches", x1 - x0)
    for i, t in enumerate(["Copy", "Retry", "<  2 / 2  >"]):
        d.rounded_rectangle([x0 + 64 + i * 170, y, x0 + 214 + i * 170, y + 50], 12, outline=INK if i else LINE, width=3)
        d.text((x0 + 139 + i * 170, y + 25), t, font=F(26, True), fill=INK, anchor="mm")
    badge(d, x0 + 64 + 3 * 170 + 30, y + 25, 2)
    d.text((x0 + 64 + 3 * 170 + 80, y + 25), "Retry, and flip between versions", font=F(28, True), fill=INK, anchor="lm")
    return img.crop((0, 0, W, y + 90))


def fig_formula():
    img = Image.new("RGB", (W, 700), PAPER)
    d = ImageDraw.Draw(img)
    boxes = [("1  RESULT", "What finished thing do you want back?", "a 150-word email"),
             ("2  READER", "Who is it for, and what do they need?", "my landlord, who is busy"),
             ("3  RAW MATERIAL", "What does Claude need to see?", "the lease clause, my notes"),
             ("4  RULES", "Limits, tone, must-haves, must-nots", "polite, no threats, ask by Friday")]
    bw, gap = 345, 20
    for i, (t, q, ex) in enumerate(boxes):
        x = 15 + i * (bw + gap)
        d.rounded_rectangle([x, 20, x + bw, 560], 22, outline=INK, width=5, fill=PAPER if i % 2 else FILL)
        d.text((x + bw / 2, 75), t, font=F(31, True), fill=INK, anchor="mm")
        d.line([x + 30, 120, x + bw - 30, 120], fill=INK, width=3)
        y = text_block(d, x + 28, 150, q, F(32, True), bw - 56)
        d.text((x + 28, y + 30), "Example:", font=F(28), fill=MID)
        text_block(d, x + 28, y + 70, ex, F(30), bw - 56, MID)
    d.text((W / 2, 630), "Fill in all four, and Claude can hand back finished work, not a draft.", font=F(34, True), fill=INK, anchor="mm")
    return img


def fig_feature_map():
    img = Image.new("RGB", (W, 1180), PAPER)
    d = ImageDraw.Draw(img)
    rows = [("I want to...", "Use", True),
            ("ask, write or think something through once", "A normal chat"),
            ("work from a PDF, photo or spreadsheet", "Files (the + button)"),
            ("get a document, deck, chart or small app", "Artifacts and file creation"),
            ("keep coming back to the same topic", "A Project"),
            ("have Claude remember things about me", "Memory"),
            ("get current facts with sources", "Web search or Research"),
            ("work with my email, calendar or files", "Connectors"),
            ("repeat the same way of working", "A skill or plugin"),
            ("have a job done on a schedule", "A scheduled task"),
            ("keep a chat out of history and memory", "Incognito")]
    y = 20
    for i, r in enumerate(rows):
        head = len(r) == 3
        h = 92
        if head:
            d.rounded_rectangle([10, y, W - 10, y + h], 16, fill=INK)
        elif i % 2:
            d.rectangle([10, y, W - 10, y + h], fill=FILL)
        f = F(34, True) if head else F(32)
        d.text((40, y + h / 2), r[0], font=f, fill=PAPER if head else INK, anchor="lm")
        d.text((930, y + h / 2), r[1], font=F(34, True) if not head else f, fill=PAPER if head else INK, anchor="lm")
        y += h + 14
    return img.crop((0, 0, W, y + 10))


def fig_cowork():
    img, d = window(1000)
    x0, x1 = 100, W - 100
    y = you(d, x1, 110, "Every Monday at 8am, check my calendar and inbox and send me a one-page plan for the week.", 900)
    y = reply(d, x0, y, "I'll set that up as a scheduled task. Here's my plan for each run:", x1 - x0)
    steps = [("done", "Read this week's calendar events"), ("done", "Find emails that need a reply"), ("now", "Group by priority and deadline"),
             ("todo", "Write the one-page plan"), ("todo", "Send it to you as a message")]
    for st, t in steps:
        cx = x0 + 100
        if st == "done":
            d.ellipse([cx - 20, y + 4, cx + 20, y + 44], fill=INK)
            d.line([cx - 9, y + 25, cx - 2, y + 33, cx + 11, y + 15], fill=PAPER, width=5)
        elif st == "now":
            d.ellipse([cx - 20, y + 4, cx + 20, y + 44], outline=INK, width=5)
            d.ellipse([cx - 8, y + 16, cx + 8, y + 32], fill=INK)
        else:
            d.ellipse([cx - 20, y + 4, cx + 20, y + 44], outline=SOFT, width=4)
        d.text((cx + 50, y + 24), t, font=F(32, st == "now"), fill=INK if st != "todo" else MID, anchor="lm")
        y += 64
    y += 20
    d.rounded_rectangle([x0 + 64, y, x1, y + 120], 18, outline=INK, width=4, fill=FILL)
    d.text((x0 + 100, y + 38), "Scheduled task: Weekly plan", font=F(32, True), fill=INK, anchor="lm")
    d.text((x0 + 100, y + 84), "Runs every Monday at 8:00 AM  ·  Edit  ·  Pause", font=F(28), fill=MID, anchor="lm")
    badge(d, x0 + 20, y - 200, 1)
    badge(d, x0 + 20, y + 60, 2)
    return img.crop((0, 0, W, y + 160))


FIGS = {
    "fig-memory": fig_memory, "fig-connectors": fig_connectors,
    "fig-formula": fig_formula, "fig-feature-map": fig_feature_map,
}

if __name__ == "__main__":
    import sys
    for name in sys.argv[1:] or FIGS:
        save(FIGS[name](), name)
