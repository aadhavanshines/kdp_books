"""Generate the book's diagrams as 300 DPI PNGs (print-safe in grayscale)."""
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FONT_DIR = "/usr/share/fonts/truetype/liberation"
BOLD = f"{FONT_DIR}/LiberationSans-Bold.ttf"
REG = f"{FONT_DIR}/LiberationSans-Regular.ttf"
ITAL = f"{FONT_DIR}/LiberationSans-Italic.ttf"

W = 1380  # 4.6 in at 300 DPI, the interior text width
NAVY = (31, 58, 95)
MID = (110, 128, 150)
LIGHT = (226, 232, 240)
PALE = (243, 246, 250)
INK = (25, 25, 25)
WHITE = (255, 255, 255)


def f(path, size):
    return ImageFont.truetype(path, size)


def wrap(d, text, font, max_w):
    lines = []
    for para in text.split("\n"):
        cur = ""
        for w in para.split():
            t = f"{cur} {w}".strip()
            if d.textlength(t, font=font) <= max_w:
                cur = t
            else:
                lines.append(cur)
                cur = w
        lines.append(cur)
    return lines


def box(d, xy, text, fill=LIGHT, color=INK, font=None, sub=None, radius=22, outline=None):
    x0, y0, x1, y1 = xy
    d.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=4 if outline else 0)
    font = font or f(BOLD, 40)
    sfont = f(REG, 30)
    lines = wrap(d, text, font, x1 - x0 - 30)
    slines = wrap(d, sub, sfont, x1 - x0 - 30) if sub else []
    lh, slh = font.size * 1.18, sfont.size * 1.22
    total = len(lines) * lh + (len(slines) * slh + 8 if slines else 0)
    y = (y0 + y1) / 2 - total / 2
    for ln in lines:
        d.text(((x0 + x1) / 2, y), ln, font=font, fill=color, anchor="ma")
        y += lh
    if slines:
        y += 8
        for ln in slines:
            d.text(((x0 + x1) / 2, y), ln, font=sfont, fill=color if color != INK else (70, 70, 70),
                   anchor="ma")
            y += slh


def arrow(d, p0, p1, color=NAVY, width=7, head=26):
    d.line([p0, p1], fill=color, width=width)
    ang = math.atan2(p1[1] - p0[1], p1[0] - p0[0])
    a, b = ang + math.radians(150), ang - math.radians(150)
    d.polygon([p1, (p1[0] + head * math.cos(a), p1[1] + head * math.sin(a)),
               (p1[0] + head * math.cos(b), p1[1] + head * math.sin(b))], fill=color)


def poly_arrow(d, pts, color=NAVY, width=7):
    for p, q in zip(pts[:-2], pts[1:-1]):
        d.line([p, q], fill=color, width=width)
    arrow(d, pts[-2], pts[-1], color, width)


def canvas(h):
    img = Image.new("RGB", (W, h), WHITE)
    return img, ImageDraw.Draw(img)


def cycle(steps, h=900, rx=440, ry=320, hw=210, hh=62, center=None, first_dark=True, fs=34):
    """Boxes arranged in a ring with arrows between them, optional text in the middle."""
    img, d = canvas(h)
    cx, cy = W / 2, h / 2
    pts = []
    for i in range(len(steps)):
        a = -math.pi / 2 + i * 2 * math.pi / len(steps)
        pts.append((cx + rx * math.cos(a), cy + ry * math.sin(a)))

    def edge(c, toward, gap=14):
        dx, dy = toward[0] - c[0], toward[1] - c[1]
        t = min(hw / abs(dx) if dx else 1e9, hh / abs(dy) if dy else 1e9)
        L = math.hypot(dx, dy)
        return (c[0] + dx * t + dx / L * gap, c[1] + dy * t + dy / L * gap)

    for i in range(len(pts)):
        p, q = pts[i], pts[(i + 1) % len(pts)]
        arrow(d, edge(p, q), edge(q, p), color=MID, width=6)
    for i, ((x, y), st) in enumerate(zip(pts, steps)):
        title, sub = st if isinstance(st, tuple) else (st, None)
        dark = first_dark and i == 0
        box(d, (x - hw, y - hh, x + hw, y + hh), title, NAVY if dark else LIGHT,
            WHITE if dark else INK, font=f(BOLD, fs), sub=sub)
    if center:
        for k, line in enumerate(center):
            d.text((cx, cy - 22 * len(center) + 44 * k), line, font=f(ITAL, 32), fill=MID, anchor="ma")
    return img





AMBER = (180, 83, 9)
SOFT = (253, 243, 225)


def title(d, y, text, size=34, color=MID):
    d.text((W / 2, y), text, font=f(ITAL, size), fill=color, anchor="ma")


# ---------------------------------------------------------------- Part I

def lifecycle():
    """Introduction: the life of a language model."""
    steps = [("Data", "collect, clean and mix trillions of words"),
             ("Tokenizer", "split text into tokens"),
             ("Pretraining", "predict the next token on thousands of chips"),
             ("Post-training", "teach helpfulness, honesty and safety"),
             ("Evaluation", "test skills and safety"),
             ("Serving", "answer billions of requests"),
             ("Apps and agents", "chat, search, code, tools")]
    row_h, top = 128, 30
    img, d = canvas(top * 2 + row_h * len(steps))
    for i, (name, text) in enumerate(steps):
        y = top + i * row_h
        dark = name in ("Pretraining", "Post-training")
        box(d, (40, y + 12, 430, y + row_h - 16), name, fill=NAVY if dark else MID, color=WHITE,
            font=f(BOLD, 38))
        box(d, (470, y + 12, W - 40, y + row_h - 16), text, fill=LIGHT if dark else PALE,
            font=f(REG, 36), radius=18)
        if i < len(steps) - 1:
            arrow(d, (235, y + row_h - 16), (235, y + row_h + 14), width=6, head=20)
    return img


def next_word():
    """Chapter 1: probabilities for the next word."""
    img, d = canvas(860)
    box(d, (40, 30, W - 40, 170), "\"It was a cold winter morning, and the ground was covered in ...\"",
        fill=PALE, outline=MID, font=f(ITAL, 38))
    arrow(d, (W / 2, 175), (W / 2, 245))
    d.text((W / 2, 250), "Language model: probability of each possible next word", font=f(BOLD, 34),
           fill=INK, anchor="ma")
    words = [("snow", 0.62), ("frost", 0.21), ("ice", 0.08), ("leaves", 0.05), ("mud", 0.03),
             ("bananas", 0.0001)]
    left, maxw, y = 300, 900, 320
    for w, p in words:
        d.text((left - 24, y + 8), w, font=f(BOLD, 38), fill=INK, anchor="ra")
        bw = max(6, int(maxw * p / 0.62))
        d.rectangle((left, y, left + bw, y + 58), fill=NAVY if w == "snow" else MID)
        label = f"{p * 100:.0f}%" if p >= 0.01 else "almost 0%"
        d.text((left + bw + 16, y + 10), label, font=f(REG, 34), fill=INK)
        y += 80
    title(d, y + 10, "One word is chosen, added to the text, and the process repeats.")
    return img


def timeline():
    """Chapter 2: milestones."""
    events = [("1950", "Turing's imitation game"), ("1966", "ELIZA chatbot"),
              ("2003", "Neural language models"), ("2012", "AlexNet: deep learning takes off"),
              ("2013", "word2vec: meaning as numbers"), ("2017", "The Transformer"),
              ("2020", "GPT-3 and scaling laws"), ("2022", "ChatGPT"),
              ("2024", "Reasoning models"), ("2025-26", "Agents and trillion-parameter open models")]
    row_h, top = 96, 30
    img, d = canvas(top * 2 + row_h * len(events))
    x = 300
    d.line((x, top + 30, x, top + row_h * len(events) - 30), fill=LIGHT, width=10)
    for i, (yr, text) in enumerate(events):
        y = top + i * row_h + row_h / 2
        big = yr in ("2017", "2022")
        r = 22 if big else 15
        d.ellipse((x - r, y - r, x + r, y + r), fill=AMBER if big else NAVY)
        d.text((x - 50, y), yr, font=f(BOLD, 40), fill=INK, anchor="rm")
        d.text((x + 50, y), text, font=f(BOLD if big else REG, 38), fill=INK, anchor="lm")
    return img


def embeddings():
    """Chapter 4: a map of meaning."""
    img, d = canvas(1000)
    d.rounded_rectangle((20, 20, W - 20, 980), radius=30, fill=PALE)
    groups = {
        "animals": ((300, 230), [("cat", -90, -50), ("kitten", 40, -90), ("dog", -40, 40),
                                 ("puppy", 90, 30)]),
        "cities": ((1050, 220), [("Paris", -100, -40), ("London", 40, -90), ("Berlin", -20, 50),
                                 ("Tokyo", 110, 10)]),
        "food": ((300, 760), [("bread", -100, -30), ("rice", 30, -80), ("cheese", -10, 50),
                              ("apple", 120, 0)]),
    }
    for label, ((cx, cy), words) in groups.items():
        d.ellipse((cx - 210, cy - 160, cx + 210, cy + 160), outline=MID, width=4)
        d.text((cx, cy - 205), label, font=f(ITAL, 34), fill=MID, anchor="ma")
        for w, dx, dy in words:
            d.ellipse((cx + dx - 9, cy + dy - 9, cx + dx + 9, cy + dy + 9), fill=NAVY)
            d.text((cx + dx, cy + dy + 16), w, font=f(BOLD, 32), fill=INK, anchor="ma")
    pts = {"man": (760, 820), "woman": (980, 620), "king": (980, 860), "queen": (1200, 660)}
    for w, (x, y) in pts.items():
        d.ellipse((x - 11, y - 11, x + 11, y + 11), fill=AMBER)
        if w in ("woman", "queen"):
            d.text((x, y - 20), w, font=f(BOLD, 34), fill=INK, anchor="md")
        else:
            d.text((x, y + 20), w, font=f(BOLD, 34), fill=INK, anchor="ma")
    arrow(d, (775, 806), (962, 634), color=AMBER, width=6)
    arrow(d, (995, 846), (1182, 674), color=AMBER, width=6)
    d.text((1000, 440), "same direction:\n\"male → female\"", font=f(ITAL, 30), fill=AMBER,
           anchor="ma", align="center")
    return img


# ---------------------------------------------------------------- Part II

def data_funnel():
    """Chapter 5: from raw web to training data."""
    stages = ["Raw web pages (billions)", "Extract the text", "Identify the language",
              "Filter for quality", "Remove duplicates", "Safety and privacy filters",
              "Decontaminate test questions"]
    row_h, top = 108, 30
    img, d = canvas(top + row_h * len(stages) + 260)
    for i, s in enumerate(stages):
        y = top + i * row_h
        half = 640 - i * 62
        fill = NAVY if i == 0 else (MID if i % 2 else (90, 110, 135))
        d.rounded_rectangle((W / 2 - half, y + 6, W / 2 + half, y + row_h - 6), radius=16, fill=fill)
        d.text((W / 2, y + row_h / 2), s, font=f(BOLD, 36), fill=WHITE, anchor="mm")
    y = top + row_h * len(stages)
    arrow(d, (W / 2, y + 4), (W / 2, y + 60))
    box(d, (W / 2 - 330, y + 66, W / 2 + 330, y + 200), "Clean training text", fill=SOFT,
        outline=AMBER, font=f(BOLD, 40), sub="mixed with books, code, math, papers")
    return img


def network():
    """Chapter 6: a small neural network."""
    img, d = canvas(900)
    layers = [4, 6, 6, 4]
    xs = [170, 520, 870, 1150]
    pos = []
    for n, x in zip(layers, xs):
        gap = 640 / (n - 1)
        pos.append([(x, 150 + i * gap) for i in range(n)])
    for a, b in zip(pos[:-1], pos[1:]):
        for p in a:
            for q in b:
                d.line((p, q), fill=LIGHT, width=3)
    for li, layer in enumerate(pos):
        for (x, y) in layer:
            col = NAVY if li in (0, 3) else MID
            d.ellipse((x - 30, y - 30, x + 30, y + 30), fill=col)
    labels = ["input\nnumbers", "hidden\nlayer", "hidden\nlayer", "next-token\nprobabilities"]
    for x, lab in zip(xs, labels):
        d.text((x, 30), lab, font=f(BOLD, 30), fill=INK, anchor="ma", align="center")
    for (x, y), (w, p) in zip(pos[3], [("snow", "62%"), ("frost", "21%"), ("ice", "8%"),
                                        ("...", "")]):
        d.text((x + 45, y), f"{w} {p}", font=f(REG, 30), fill=INK, anchor="lm")
    title(d, 830, "Each line is a weight: a number that training adjusts.")
    return img


def attention():
    """Chapter 7: where 'it' looks."""
    words = ["The", "trophy", "didn't", "fit", "in", "the", "suitcase", "because", "it", "was",
             "too", "big"]
    weights = {"trophy": 0.55, "suitcase": 0.2, "big": 0.1, "fit": 0.05}
    row_h, top = 74, 40
    img, d = canvas(top * 2 + row_h * len(words))
    tx = 330
    target = (1080, top + row_h * len(words) / 2)
    for i, w in enumerate(words):
        y = top + i * row_h + row_h / 2
        wt = weights.get(w, 0.01)
        if w != "it":
            d.line(((tx + 16, y), (target[0] - 120, target[1])), fill=NAVY if wt > 0.15 else MID,
                   width=max(2, int(wt * 40)))
        d.text((tx, y), w, font=f(BOLD if wt > 0.15 or w == "it" else REG, 40),
               fill=AMBER if w == "it" else INK, anchor="rm")
        if wt >= 0.05:
            d.text((tx + 30, y - 30), f"{int(wt * 100)}%", font=f(REG, 26), fill=MID)
    box(d, (target[0] - 120, target[1] - 70, target[0] + 120, target[1] + 70), "\"it\"",
        fill=AMBER, color=WHITE, font=f(BOLD, 44))
    d.text((target[0], target[1] + 100), "attends mostly\nto \"trophy\"", font=f(ITAL, 32),
           fill=MID, anchor="ma", align="center")
    return img


def transformer():
    """Chapter 7: the Transformer stack."""
    img, d = canvas(1260)
    cx, bw = 690, 420
    box(d, (cx - bw, 1110, cx + bw, 1220), "Tokens", fill=PALE, outline=MID, font=f(BOLD, 38),
        sub="\"The cat sat on the\"")
    box(d, (cx - bw, 960, cx + bw, 1060), "Embeddings + position", fill=LIGHT, font=f(BOLD, 38))
    arrow(d, (cx, 1106), (cx, 1064))
    ys = [(700, "Layer 1"), (430, "Layer 2")]
    for y, name in ys:
        d.rounded_rectangle((cx - bw, y, cx + bw, y + 220), radius=22, fill=NAVY)
        d.text((cx - bw + 24, y + 16), name, font=f(BOLD, 34), fill=WHITE)
        box(d, (cx - bw + 30, y + 64, cx - 20, y + 200), "Attention", fill=LIGHT, font=f(BOLD, 34),
            sub="tokens share information")
        box(d, (cx + 20, y + 64, cx + bw - 30, y + 200), "Feed-forward", fill=LIGHT,
            font=f(BOLD, 34), sub="each token \"thinks\"")
    arrow(d, (cx, 956), (cx, 924))
    arrow(d, (cx, 696), (cx, 654))
    d.text((cx, 350), "... dozens to over a hundred layers ...", font=f(ITAL, 34), fill=MID,
           anchor="mm")
    arrow(d, (cx, 426), (cx, 380))
    arrow(d, (cx, 320), (cx, 250))
    box(d, (cx - bw, 40, cx + bw, 240), "Next-token probabilities", fill=SOFT, outline=AMBER,
        font=f(BOLD, 38), sub="mat 41%  floor 18%  sofa 12% ...")
    return img


def moe():
    """Chapter 7: mixture of experts."""
    img, d = canvas(860)
    box(d, (490, 30, 890, 140), "Token", fill=PALE, outline=MID, font=f(BOLD, 40))
    box(d, (490, 210, 890, 320), "Router", fill=NAVY, color=WHITE, font=f(BOLD, 40),
        sub="picks 2 of 8 experts")
    arrow(d, (690, 144), (690, 206))
    chosen = {2, 5}
    ew, gap = 140, 26
    x0 = (W - (8 * ew + 7 * gap)) / 2
    for i in range(8):
        x = x0 + i * (ew + gap)
        on = i in chosen
        box(d, (x, 420, x + ew, 560), f"E{i + 1}", fill=AMBER if on else LIGHT,
            color=WHITE if on else (150, 150, 150), font=f(BOLD, 38))
        if on:
            arrow(d, (690, 324), (x + ew / 2, 416), color=AMBER)
            arrow(d, (x + ew / 2, 564), (690, 656), color=AMBER)
    box(d, (440, 660, 940, 780), "Combined output", fill=LIGHT, font=f(BOLD, 38))
    d.text((W / 2, 810), "The other six experts stay idle for this token.", font=f(ITAL, 30),
           fill=MID, anchor="ma")
    return img


def scaling():
    """Chapter 8: loss falls steadily with compute (illustrative)."""
    img, d = canvas(860)
    L, R, T, B = 200, 1320, 60, 700
    d.line((L, T, L, B), fill=INK, width=4)
    d.line((L, B, R, B), fill=INK, width=4)
    for k in range(9):
        x = L + k * (R - L) / 8
        d.line((x, B, x, B + 12), fill=INK, width=3)
        d.text((x, B + 20), f"10^{18 + k}", font=f(REG, 26), fill=INK, anchor="ma")
    d.text(((L + R) / 2, B + 70), "Training compute (operations, each step is 10 times more)",
           font=f(BOLD, 30), fill=INK, anchor="ma")
    d.text((60, (T + B) / 2), "Error\n(loss)", font=f(BOLD, 30), fill=INK, anchor="mm",
           align="center")
    line = [(L + 40, T + 80), (R - 60, B - 120)]
    d.line(line, fill=MID, width=5)
    import random
    rnd = random.Random(3)
    for i in range(9):
        t = i / 8
        x = line[0][0] + t * (line[1][0] - line[0][0])
        y = line[0][1] + t * (line[1][1] - line[0][1]) + rnd.uniform(-14, 14)
        d.ellipse((x - 14, y - 14, x + 14, y + 14), fill=NAVY)
    d.text((R - 40, T + 40), "Illustrative", font=f(ITAL, 28), fill=MID, anchor="ra")
    return img


# ---------------------------------------------------------------- Part III

def chip():
    """Chapter 9: an AI chip package with HBM stacks."""
    img, d = canvas(900)
    d.rounded_rectangle((40, 60, W - 40, 780), radius=30, fill=PALE, outline=MID, width=4)
    d.text((W / 2, 20), "Chip package", font=f(ITAL, 30), fill=MID, anchor="ma")
    box(d, (420, 210, 960, 650), "Processor die", fill=NAVY, color=WHITE, font=f(BOLD, 42),
        sub="thousands of cores and tensor cores")
    for i in range(3):
        y = 130 + i * 205
        for x0 in (90, 1060):
            d.rounded_rectangle((x0, y, x0 + 230, y + 175), radius=14, fill=SOFT, outline=AMBER,
                                width=4)
            for k in range(4):
                d.line((x0 + 20, y + 40 + k * 32, x0 + 210, y + 40 + k * 32), fill=AMBER, width=3)
            d.text((x0 + 115, y + 8), "HBM", font=f(BOLD, 28), fill=AMBER, anchor="ma")
            if x0 < 400:
                arrow(d, (x0 + 236, y + 88), (414, 430 + (i - 1) * 60), color=AMBER, width=5,
                      head=18)
            else:
                arrow(d, (x0 - 6, y + 88), (966, 430 + (i - 1) * 60), color=AMBER, width=5,
                      head=18)
    d.text((W / 2, 810), "Stacked memory feeds numbers to the processor at terabytes per second",
           font=f(ITAL, 30), fill=INK, anchor="ma")
    return img


def datacenter():
    """Chapter 10: inside an AI data center."""
    img, d = canvas(1000)
    box(d, (30, 60, 300, 200), "Power grid", fill=PALE, outline=MID, font=f(BOLD, 36))
    box(d, (30, 300, 300, 440), "Substation", fill=LIGHT, font=f(BOLD, 36),
        sub="+ backup power")
    arrow(d, (165, 204), (165, 296))
    d.rounded_rectangle((380, 40, 1350, 560), radius=26, fill=PALE, outline=MID, width=4)
    d.text((865, 56), "Data hall", font=f(BOLD, 34), fill=INK, anchor="ma")
    for r in range(3):
        for c in range(6):
            x, y = 420 + c * 150, 120 + r * 140
            d.rectangle((x, y, x + 110, y + 100), fill=NAVY)
            for k in range(4):
                d.line((x + 12, y + 18 + k * 22, x + 98, y + 18 + k * 22), fill=MID, width=4)
    d.text((865, 545), "racks of AI chips, linked by a high-speed network", font=f(ITAL, 28),
           fill=MID, anchor="md")
    arrow(d, (304, 370), (376, 370))
    # cooling loop
    box(d, (420, 680, 820, 820), "Heat exchanger", fill=LIGHT, font=f(BOLD, 34))
    box(d, (950, 640, 1350, 860), "Cooling towers or dry coolers", fill=SOFT, outline=AMBER,
        font=f(BOLD, 34), sub="heat released to the air")
    arrow(d, (560, 564), (560, 676), color=AMBER)
    d.text((575, 600), "hot liquid", font=f(REG, 28), fill=AMBER)
    arrow(d, (700, 676), (700, 564), color=(60, 120, 170))
    d.text((715, 610), "cool liquid", font=f(REG, 28), fill=(60, 120, 170))
    arrow(d, (824, 750), (946, 750), color=AMBER)
    title(d, 900, "Electricity in, computation out, heat removed.")
    return img


def water():
    """Chapter 11: where an AI model's water goes."""
    img, d = canvas(940)
    box(d, (440, 60, 940, 240), "AI model's water footprint", fill=NAVY, color=WHITE,
        font=f(BOLD, 40))
    items = [(40, "On-site", "Data center cooling towers evaporate water"),
             (500, "Off-site", "Power stations use water to make the electricity"),
             (960, "Supply chain", "Chip factories use ultra-pure water")]
    for x, head, text in items:
        box(d, (x, 420, x + 380, 700), head, fill=SOFT if head == "On-site" else LIGHT,
            outline=AMBER if head == "On-site" else None, font=f(BOLD, 40), sub=text)
        arrow(d, (x + 190, 416), (690 + (x - 500) * 0.35, 246))
    d.text((W / 2, 760), "Withdrawal: water taken from a source.", font=f(BOLD, 32), fill=INK,
           anchor="ma")
    d.text((W / 2, 810), "Consumption: water lost, mostly by evaporation.", font=f(BOLD, 32),
           fill=INK, anchor="ma")
    title(d, 870, "Estimates differ because they count different parts of this picture.", 30)
    return img


def parallelism():
    """Chapter 12: four ways to split training."""
    img, d = canvas(1200)
    panels = [(30, 30, "Data parallel"), (705, 30, "Tensor parallel"),
              (30, 610, "Pipeline parallel"), (705, 610, "Expert parallel")]
    pw, ph = 645, 550
    for x, y, name in panels:
        d.rounded_rectangle((x, y, x + pw, y + ph), radius=24, fill=PALE, outline=MID, width=3)
        d.text((x + pw / 2, y + 20), name, font=f(BOLD, 38), fill=INK, anchor="ma")

    def chip_box(x, y, w, h, text, fill=NAVY, color=WHITE, fs=30):
        box(d, (x, y, x + w, y + h), text, fill=fill, color=color, font=f(BOLD, fs), radius=12)

    # data parallel: 3 copies, different data
    x, y = 30, 30
    for i in range(3):
        cx = x + 40 + i * 200
        chip_box(cx, y + 120, 165, 180, "full model copy", fs=28)
        box(d, (cx, y + 360, cx + 165, y + 450), f"data {i + 1}", fill=SOFT, font=f(BOLD, 30),
            radius=12)
        arrow(d, (cx + 82, y + 356), (cx + 82, y + 304), width=5, head=18)
    d.text((x + pw / 2, y + 480), "copies average what they learn", font=f(ITAL, 28), fill=MID,
           anchor="ma")
    # tensor parallel: one layer split
    x, y = 705, 30
    d.rounded_rectangle((x + 60, y + 120, x + pw - 60, y + 330), radius=14, outline=NAVY, width=5)
    d.text((x + pw / 2, y + 100), "one layer", font=f(ITAL, 28), fill=MID, anchor="md")
    for i in range(4):
        chip_box(x + 80 + i * 128, y + 150, 110, 150, f"part {i + 1}", fill=MID, fs=28)
    d.text((x + pw / 2, y + 380), "each chip does part of\nevery multiplication",
           font=f(ITAL, 28), fill=MID, anchor="ma", align="center")
    # pipeline
    x, y = 30, 610
    for i, lab in enumerate(["layers 1-20", "layers 21-40", "layers 41-60"]):
        cx = x + 40 + i * 200
        chip_box(cx, y + 180, 165, 160, lab, fs=28)
        if i < 2:
            arrow(d, (cx + 168, y + 260), (cx + 196, y + 260), width=5, head=16)
    d.text((x + pw / 2, y + 400), "batches flow through\nlike an assembly line",
           font=f(ITAL, 28), fill=MID, anchor="ma", align="center")
    # expert
    x, y = 705, 610
    for i in range(4):
        cx = x + 60 + i * 135
        chip_box(cx, y + 300, 115, 120, f"E{2 * i + 1}, E{2 * i + 2}", fill=AMBER, fs=28)
    box(d, (x + 220, y + 110, x + 425, y + 200), "tokens", fill=SOFT, font=f(BOLD, 30), radius=12)
    for i in (0, 2, 3):
        arrow(d, (x + 322, y + 204), (x + 117 + i * 135, y + 296), width=5, head=16,
              color=AMBER)
    d.text((x + pw / 2, y + 450), "experts live on different chips", font=f(ITAL, 28),
           fill=MID, anchor="ma")
    return img


def loss_curve():
    """Chapter 12: a pretraining loss curve (illustrative)."""
    img, d = canvas(800)
    L, R, T, B = 180, 1330, 60, 640
    d.line((L, T, L, B), fill=INK, width=4)
    d.line((L, B, R, B), fill=INK, width=4)
    d.text(((L + R) / 2, B + 30), "Tokens trained on", font=f(BOLD, 32), fill=INK, anchor="ma")
    d.text((80, (T + B) / 2), "Loss", font=f(BOLD, 32), fill=INK, anchor="mm")
    vals = []
    n = 400
    for i in range(n):
        t = i / (n - 1)
        y = 0.75 * math.exp(-6 * t) + 0.25 * (1 - t)
        if 0.42 < t < 0.45:
            y += 0.12 * math.sin((t - 0.42) / 0.03 * math.pi)
        if 0.66 < t < 0.68:
            y += 0.08 * math.sin((t - 0.66) / 0.02 * math.pi)
        if t > 0.88:
            y -= 0.06 * (t - 0.88) / 0.12
        vals.append((t, y))
    lo, hi = min(v for _, v in vals), max(v for _, v in vals)
    pts = [(L + 20 + t * (R - L - 40), T + 30 + (1 - (y - lo) / (hi - lo)) * (B - T - 60))
           for t, y in vals]
    d.line(pts, fill=NAVY, width=6)
    d.text((L + 0.43 * (R - L) + 40, T + 250), "loss spike", font=f(ITAL, 30), fill=AMBER)
    d.text((R - 40, B - 190), "annealing\non the best data", font=f(ITAL, 30), fill=AMBER,
           anchor="ra", align="right")
    d.text((R - 40, T + 10), "Illustrative", font=f(ITAL, 28), fill=MID, anchor="ra")
    return img


# ---------------------------------------------------------------- Part IV

def rlhf():
    """Chapter 13: the RLHF loop."""
    return cycle([("Prompt", None), ("Model writes two answers", None),
                  ("A person picks the better one", None), ("Reward model learns", "to score answers"),
                  ("Model trained", "to score higher")],
                 h=980, rx=430, ry=340, hw=230, hh=80, fs=32,
                 center=["thousands of", "comparisons"])


def reasoning_rl():
    """Chapter 14: reinforcement learning with checkable answers."""
    img, d = canvas(980)
    box(d, (440, 30, 940, 150), "A problem with a checkable answer", fill=PALE, outline=MID,
        font=f(BOLD, 34))
    results = [True, False, True, False]
    for i, ok in enumerate(results):
        x = 60 + i * 325
        arrow(d, (690, 154), (x + 140, 236), width=5, head=18)
        box(d, (x, 240, x + 280, 470), f"Attempt {i + 1}", fill=LIGHT, font=f(BOLD, 34),
            sub="step-by-step reasoning, then an answer")
        box(d, (x + 60, 540, x + 220, 640), "right" if ok else "wrong",
            fill=(46, 125, 50) if ok else (183, 28, 28), color=WHITE, font=f(BOLD, 36))
        arrow(d, (x + 140, 474), (x + 140, 536), width=5, head=18)
    d.text((W / 2, 680), "an automatic checker marks each answer", font=f(ITAL, 30), fill=MID,
           anchor="ma")
    box(d, (300, 760, 1080, 900), "Reinforce the reasoning that worked", fill=NAVY, color=WHITE,
        font=f(BOLD, 36), sub="repeat on many thousands of problems")
    return img


def benchmarks():
    """Chapter 15: the benchmark treadmill (illustrative shapes)."""
    img, d = canvas(820)
    L, R, T, B = 160, 1330, 60, 640
    d.line((L, T, L, B), fill=INK, width=4)
    d.line((L, B, R, B), fill=INK, width=4)
    years = list(range(2019, 2027))
    for i, yv in enumerate(years):
        x = L + i * (R - L) / (len(years) - 1)
        d.text((x, B + 16), str(yv), font=f(REG, 28), fill=INK, anchor="ma")
    for v in (0, 50, 100):
        y = B - v / 100 * (B - T)
        d.text((L - 16, y), f"{v}%", font=f(REG, 28), fill=INK, anchor="rm")

    def sx(year):
        return L + (year - 2019) / 7 * (R - L)

    def curve(start, mid, lo, hi, col, label):
        pts = []
        yr = start
        while yr <= 2026.0:
            v = lo + (hi - lo) / (1 + math.exp(-(yr - mid) * 2.6))
            pts.append((sx(yr), B - v / 100 * (B - T)))
            yr += 0.05
        d.line(pts, fill=col, width=6)
        if label.startswith("Humanity"):
            d.text((pts[0][0] - 14, pts[0][1] - 10), label, font=f(BOLD, 30), fill=col, anchor="rm")
        else:
            d.text((pts[0][0] + 10, pts[0][1] + 10), label, font=f(BOLD, 30), fill=col)

    curve(2020.7, 2022.6, 30, 92, NAVY, "MMLU")
    curve(2023.8, 2024.9, 28, 90, MID, "GPQA")
    curve(2025.0, 2025.9, 5, 60, AMBER, "Humanity's Last Exam")
    d.text((R - 10, T), "Illustrative shapes, not exact scores", font=f(ITAL, 28), fill=MID,
           anchor="ra")
    d.text(((L + R) / 2, B + 70), "Each new test is hard at first, then quickly saturates",
           font=f(BOLD, 30), fill=INK, anchor="ma")
    return img


# ---------------------------------------------------------------- Part V

def kv_cache():
    """Chapter 17: the KV cache."""
    img, d = canvas(800)
    toks = ["The", "cat", "sat", "on", "the"]
    tw, gap, x0 = 180, 22, 40
    for i, t in enumerate(toks):
        x = x0 + i * (tw + gap)
        box(d, (x, 60, x + tw, 160), t, fill=LIGHT, font=f(BOLD, 38))
        box(d, (x, 220, x + tw, 330), "K, V", fill=SOFT, outline=AMBER, font=f(BOLD, 36),
            sub="stored")
        arrow(d, (x + tw / 2, 164), (x + tw / 2, 216), width=5, head=16)
    d.rounded_rectangle((x0 - 14, 200, x0 + 5 * (tw + gap) - 12, 350), radius=20, outline=AMBER,
                        width=4)
    d.text((x0, 360), "KV cache: grows with every token", font=f(ITAL, 30), fill=AMBER)
    nx = x0 + 5 * (tw + gap) + 10
    box(d, (nx, 60, nx + 210, 160), "\"mat\"", fill=NAVY, color=WHITE, font=f(BOLD, 38))
    box(d, (nx, 220, nx + 210, 330), "new K, V", fill=NAVY, color=WHITE, font=f(BOLD, 34))
    arrow(d, (nx + 105, 164), (nx + 105, 216), width=5, head=16)
    box(d, (300, 480, 1080, 640), "Next token only computes its own keys and values",
        fill=PALE, outline=MID, font=f(BOLD, 34), sub="and looks up the rest from the cache")
    arrow(d, (690, 476), (690, 400))
    return img


def lora():
    """Chapter 18: LoRA adapters."""
    img, d = canvas(860)
    box(d, (40, 200, 640, 640), "Base model", fill=NAVY, color=WHITE, font=f(BOLD, 46),
        sub="billions of parameters, frozen")
    adapters = [("Adapter A", "email summaries"), ("Adapter B", "legal style"),
                ("Adapter C", "a new language")]
    for i, (name, use) in enumerate(adapters):
        y = 110 + i * 230
        box(d, (860, y, 1340, y + 170), name, fill=SOFT, outline=AMBER, font=f(BOLD, 38),
            sub=f"a few megabytes: {use}")
        arrow(d, (856, y + 85), (646, 420), color=AMBER if i == 0 else MID, width=5)
    title(d, 760, "Plug in a small adapter for each job; the big model never changes.")
    return img


def rag():
    """Chapter 19: retrieval-augmented generation."""
    img, d = canvas(1060)
    d.text((40, 20), "Prepare (once)", font=f(BOLD, 34), fill=MID)
    row = [("Documents", None), ("Chunks", "a few paragraphs"), ("Embeddings", None),
           ("Search index", None)]
    bw, gap = 290, 40
    for i, (t, s) in enumerate(row):
        x = 40 + i * (bw + gap)
        box(d, (x, 80, x + bw, 210), t, fill=LIGHT, font=f(BOLD, 34), sub=s)
        if i < 3:
            arrow(d, (x + bw + 4, 145), (x + bw + gap - 4, 145), width=5, head=18)
    d.text((40, 280), "Answer (each question)", font=f(BOLD, 34), fill=MID)
    box(d, (40, 340, 330, 470), "Question", fill=PALE, outline=MID, font=f(BOLD, 34))
    box(d, (370, 340, 660, 470), "Embed it", fill=LIGHT, font=f(BOLD, 34))
    box(d, (1030, 340, 1320, 470), "Find similar chunks", fill=LIGHT, font=f(BOLD, 32))
    arrow(d, (334, 405), (366, 405), width=5, head=18)
    arrow(d, (664, 405), (1026, 405), width=5, head=18)
    arrow(d, (1175, 214), (1175, 336), width=5, head=18)
    box(d, (1030, 560, 1320, 690), "Top chunks", fill=SOFT, outline=AMBER, font=f(BOLD, 34),
        sub="after reranking")
    arrow(d, (1175, 474), (1175, 556), width=5, head=18)
    box(d, (370, 560, 960, 690), "Language model", fill=NAVY, color=WHITE, font=f(BOLD, 38),
        sub="question + retrieved chunks")
    arrow(d, (1026, 625), (964, 625), width=5, head=18)
    box(d, (370, 800, 960, 940), "Answer with citations", fill=PALE, outline=MID,
        font=f(BOLD, 38))
    arrow(d, (665, 694), (665, 796))
    return img


def agent_loop():
    """Chapter 20: the agent loop."""
    img, d = canvas(1060)
    sub = cycle([("Think", "what to do next"), ("Act", "call a tool"),
                 ("Observe", "read the result")],
                h=700, rx=380, ry=230, hw=200, hh=80, fs=40, center=["goal", "achieved?"])
    img.paste(sub, (0, 0))
    tools = ["Search", "Files", "Code", "Browser", "Email"]
    tw, gap = 230, 32
    x0 = (W - (5 * tw + 4 * gap)) / 2
    for i, t in enumerate(tools):
        x = x0 + i * (tw + gap)
        box(d, (x, 760, x + tw, 860), t, fill=SOFT, outline=AMBER, font=f(BOLD, 34))
    d.text((W / 2, 715), "tools", font=f(ITAL, 30), fill=AMBER, anchor="ma")
    box(d, (340, 920, 1040, 1030), "A human approves risky actions", fill=PALE, outline=MID,
        font=f(BOLD, 34))
    return img


# ---------------------------------------------------------------- Part VI

def open_models():
    """Chapter 22: open model families over time."""
    fams = [("Llama / Muse", [(2023.1, "LLaMA"), (2024.55, "3.1 405B"), (2025.27, "Llama 4"),
                              (2026.79, "Muse Spark Open")]),
            ("Mistral", [(2023.7, "7B"), (2023.95, "Mixtral"), (2025.45, "Magistral")]),
            ("Qwen", [(2023.6, "Qwen"), (2025.3, "Qwen3"), (2026.3, "3.6")]),
            ("DeepSeek", [(2024.4, "V2"), (2024.97, "V3"), (2025.05, "R1"), (2026.31, "V4")]),
            ("Gemma", [(2024.15, "Gemma"), (2025.2, "Gemma 3"), (2026.25, "Gemma 4")]),
            ("Phi", [(2023.45, "Phi-1"), (2024.3, "Phi-3"), (2024.95, "Phi-4")]),
            ("gpt-oss", [(2025.6, "gpt-oss")]),
            ("Kimi", [(2025.55, "K2"), (2025.87, "K2 Thinking"), (2026.05, "K2.5")]),
            ("GLM", [(2025.55, "GLM-4.5"), (2026.12, "GLM-5")]),
            ("OLMo", [(2024.1, "OLMo"), (2025.89, "OLMo 3")])]
    row_h, top = 112, 100
    img, d = canvas(top + row_h * len(fams) + 40)
    L, R = 300, 1340

    def sx(y):
        return L + (y - 2023) / 4.0 * (R - L)

    for yr in range(2023, 2027):
        x = sx(yr)
        d.line((x, top - 20, x, top + row_h * len(fams)), fill=LIGHT, width=3)
        d.text((x + 8, top - 70), str(yr), font=f(BOLD, 32), fill=INK)
    for i, (name, rel) in enumerate(fams):
        y = top + i * row_h + row_h / 2
        d.text((L - 20, y), name, font=f(BOLD, 32), fill=INK, anchor="rm")
        d.line((sx(rel[0][0]), y, sx(rel[-1][0]), y), fill=MID, width=5)
        for k, (t, lab) in enumerate(rel):
            x = sx(t)
            d.ellipse((x - 13, y - 13, x + 13, y + 13), fill=NAVY if k < len(rel) - 1 else AMBER)
            up = k % 2 == 0
            h = "r" if x > 1220 else "m"
            d.text((x + (14 if h == "r" else 0), y - 20 if up else y + 20), lab, font=f(REG, 26),
                   fill=INK, anchor=h + ("d" if up else "a"))
    return img


# ---------------------------------------------------------------- Part VII

def vision():
    """Chapter 24: images become tokens."""
    img, d = canvas(900)
    # picture: 4x4 patches of a simple scene
    px, py, ps = 60, 120, 90
    for r in range(4):
        for c in range(4):
            col = (180, 210, 240) if r < 2 else (120, 170, 110)
            d.rectangle((px + c * ps, py + r * ps, px + (c + 1) * ps - 4, py + (r + 1) * ps - 4),
                        fill=col)
    d.ellipse((px + 2.4 * ps, py + 0.3 * ps, px + 3.3 * ps, py + 1.2 * ps), fill=(250, 200, 60))
    d.text((px + 2 * ps, py - 60), "image cut into patches", font=f(ITAL, 30), fill=MID,
           anchor="ma")
    box(d, (500, 200, 800, 380), "Image encoder", fill=NAVY, color=WHITE, font=f(BOLD, 36))
    arrow(d, (px + 4 * ps + 10, 290), (496, 290))
    # token row
    y = 560
    for i in range(6):
        x = 60 + i * 110
        d.rounded_rectangle((x, y, x + 96, y + 80), radius=12, fill=SOFT, outline=AMBER, width=3)
    d.text((60 + 3 * 110, y + 100), "image tokens", font=f(ITAL, 28), fill=AMBER, anchor="ma")
    words = ["What", "is", "this", "?"]
    for i, w in enumerate(words):
        x = 760 + i * 145
        box(d, (x, y, x + 130, y + 80), w, fill=LIGHT, font=f(BOLD, 32), radius=12)
    d.text((760 + 2 * 145, y + 100), "text tokens", font=f(ITAL, 28), fill=MID, anchor="ma")
    arrow(d, (650, 384), (380, 552), color=AMBER)
    box(d, (290, 740, 1090, 870), "Language model", fill=NAVY, color=WHITE,
        font=f(BOLD, 38), sub="reads one sequence and attends to both")
    arrow(d, (690, 666), (690, 736))
    return img


def diffusion():
    """Chapter 25: adding and removing noise."""
    import random
    rnd = random.Random(7)
    img, d = canvas(760)
    n, size, gap = 5, 230, 47
    x0 = (W - (n * size + (n - 1) * gap)) / 2
    y0 = 180

    def scene(x, y, noise):
        tile = Image.new("RGB", (size, size), (190, 220, 245))
        td = ImageDraw.Draw(tile)
        td.rectangle((0, 150, size, size), fill=(110, 165, 100))
        td.ellipse((150, 25, 205, 80), fill=(250, 200, 60))
        td.rectangle((50, 105, 120, 165), fill=(200, 90, 60))
        td.polygon([(40, 108), (85, 65), (130, 108)], fill=(120, 60, 40))
        px = tile.load()
        for i in range(size):
            for j in range(size):
                if rnd.random() < noise:
                    v = rnd.randint(0, 255)
                    px[i, j] = (v, v, v)
        img.paste(tile, (int(x), int(y)))

    levels = [0.0, 0.3, 0.55, 0.8, 1.0]
    for i, nl in enumerate(levels):
        scene(x0 + i * (size + gap), y0, nl)
    for i in range(n - 1):
        xa = x0 + i * (size + gap) + size + 6
        arrow(d, (xa, y0 + 60), (xa + gap - 12, y0 + 60), color=MID, width=5, head=16)
        arrow(d, (xa + gap - 12, y0 + 170), (xa, y0 + 170), color=AMBER, width=5, head=16)
    d.text((W / 2, 60), "Training: add noise step by step  →", font=f(BOLD, 34), fill=MID,
           anchor="ma")
    d.text((W / 2, 460), "←  Generating: remove noise step by step,", font=f(BOLD, 34),
           fill=AMBER, anchor="ma")
    d.text((W / 2, 510), "guided by the prompt \"a house on a hill on a sunny day\"",
           font=f(ITAL, 32), fill=AMBER, anchor="ma")
    title(d, 600, "Start from pure noise (right) and end with a brand-new image (left).", 30)
    return img


DIAGRAMS = {
    "diagram-lifecycle": lifecycle, "diagram-next-word": next_word, "diagram-timeline": timeline,
    "diagram-embeddings": embeddings, "diagram-data-funnel": data_funnel,
    "diagram-network": network, "diagram-attention": attention,
    "diagram-transformer": transformer, "diagram-moe": moe, "diagram-scaling": scaling,
    "diagram-chip": chip, "diagram-datacenter": datacenter, "diagram-water": water,
    "diagram-parallelism": parallelism, "diagram-loss-curve": loss_curve,
    "diagram-rlhf": rlhf, "diagram-reasoning-rl": reasoning_rl,
    "diagram-benchmarks": benchmarks, "diagram-kv-cache": kv_cache, "diagram-lora": lora,
    "diagram-rag": rag, "diagram-agent-loop": agent_loop, "diagram-open-models": open_models,
    "diagram-vision": vision, "diagram-diffusion": diffusion,
}


def build_diagrams(out_dir):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, fn in DIAGRAMS.items():
        fn().save(out_dir / f"{name}.png", dpi=(300, 300))


if __name__ == "__main__":
    import sys
    build_diagrams(sys.argv[1] if len(sys.argv) > 1 else "../manuscript/images")
