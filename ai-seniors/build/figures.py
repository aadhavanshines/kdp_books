"""Phone-style example conversations and a labeled screen diagram, in large type.

Drawn in grayscale for the black-and-white paperback (they also look clean in the
eBook). Every figure is a generic AI assistant screen: no real app's design or logo.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FONTS = Path(__file__).resolve().parent.parent / "fonts"
REG = str(FONTS / "AtkinsonHyperlegible-Regular.ttf")
BOLD = str(FONTS / "AtkinsonHyperlegible-Bold.ttf")

INK, MID, LIGHT, PAPER = (25, 25, 25), (110, 110, 110), (232, 232, 232), (255, 255, 255)
USER_BG, AI_BG = (60, 60, 60), (238, 238, 238)
PHONE_W, PHONE_H = 1000, 1860
TEXT = 60


def font(size, bold=False):
    return ImageFont.truetype(BOLD if bold else REG, size)


def wrap(draw, text, f, width):
    lines = []
    for para in text.split("\n"):
        words, cur = para.split(), ""
        for w in words:
            t = (cur + " " + w).strip()
            if draw.textlength(t, font=f) <= width:
                cur = t
            else:
                lines.append(cur)
                cur = w
        lines.append(cur)
    return lines


def phone(img, x, y):
    """Draw an empty generic phone screen; return the drawing context and screen box."""
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([x, y, x + PHONE_W, y + PHONE_H], 90, fill=(20, 20, 20))
    sx0, sy0, sx1, sy1 = x + 34, y + 34, x + PHONE_W - 34, y + PHONE_H - 34
    d.rounded_rectangle([sx0, sy0, sx1, sy1], 64, fill=PAPER)
    # top bar: menu, title, new chat
    d.line([sx0 + 50, sy0 + 92, sx0 + 100, sy0 + 92], fill=INK, width=7)
    d.line([sx0 + 50, sy0 + 110, sx0 + 100, sy0 + 110], fill=INK, width=7)
    d.line([sx0 + 50, sy0 + 128, sx0 + 100, sy0 + 128], fill=INK, width=7)
    d.text(((sx0 + sx1) / 2, sy0 + 110), "AI Assistant", font=font(46, True), fill=INK, anchor="mm")
    cx, cy = sx1 - 80, sy0 + 110
    d.rounded_rectangle([cx - 30, cy - 30, cx + 30, cy + 30], 10, outline=INK, width=6)
    d.line([cx, cy - 16, cx, cy + 16], fill=INK, width=6)
    d.line([cx - 16, cy, cx + 16, cy], fill=INK, width=6)
    d.line([sx0, sy0 + 190, sx1, sy0 + 190], fill=LIGHT, width=4)
    # bottom: message box and send button
    by = sy1 - 150
    d.rounded_rectangle([sx0 + 34, by, sx1 - 150, by + 100], 50, outline=MID, width=5, fill=PAPER)
    d.text((sx0 + 80, by + 50), "Ask anything", font=font(40), fill=MID, anchor="lm")
    bx = sx1 - 92
    d.ellipse([bx - 50, by, bx + 50, by + 100], fill=INK)
    d.line([bx, by + 76, bx, by + 26], fill=PAPER, width=9)
    d.line([bx - 22, by + 48, bx, by + 26, bx + 22, by + 48], fill=PAPER, width=9, joint="curve")
    return d, (sx0, sy0 + 210, sx1, by - 20)


def bubbles(d, box, turns, photo=False):
    x0, y0, x1, y1 = box
    y = y0 + 10
    f = font(TEXT)
    maxw = (x1 - x0) * 0.86
    for who, text in turns:
        lines = wrap(d, text, f, maxw - 60)
        h = len(lines) * 78 + 44
        w = max(d.textlength(l, font=f) for l in lines) + 60
        if who == "you" and photo and text.startswith("[photo]"):
            lines = wrap(d, text[7:].strip(), f, maxw - 60)
            h = len(lines) * 78 + 44 + 260
            w = maxw
        if who == "you":
            bx1, bx0 = x1 - 30, x1 - 30 - w
            d.rounded_rectangle([bx0, y, bx1, y + h], 34, fill=USER_BG)
            ty = y + 20
            if photo and text.startswith("[photo]"):
                leaf(d, bx0 + 30, y + 24, bx1 - 30, y + 250)
                ty += 260
            for l in lines:
                d.text((bx0 + 30, ty), l, font=f, fill=PAPER)
                ty += 78
        else:
            bx0, bx1 = x0 + 30, x0 + 30 + w
            d.rounded_rectangle([bx0, y, bx1, y + h], 34, fill=AI_BG)
            ty = y + 20
            for l in lines:
                d.text((bx0 + 30, ty), l, font=f, fill=INK)
                ty += 78
        y += h + 34
        if y > y1:
            raise ValueError("conversation too long for the screen: " + text[:40])


def leaf(d, x0, y0, x1, y1):
    """A simple drawn houseplant 'photo' inside a bubble."""
    d.rounded_rectangle([x0, y0, x1, y1], 20, fill=(200, 200, 200))
    cx = (x0 + x1) / 2
    d.polygon([(cx - 60, y1 - 20), (cx + 60, y1 - 20), (cx + 45, y1 - 90), (cx - 45, y1 - 90)], fill=(90, 90, 90))
    for dx, dy, r in ((-70, -150, 60), (0, -175, 65), (70, -150, 60), (-30, -120, 45), (35, -118, 45)):
        d.ellipse([cx + dx - r, y1 + dy - r * 0.6, cx + dx + r, y1 + dy + r * 0.6], fill=(150, 150, 150), outline=(70, 70, 70), width=4)


CHATS = {
    "fig-chat-hello": [
        ("you", "Hello! I'm new to AI. What are three useful things you can help me with?"),
        ("ai", "Welcome! I can help with:\n1. Writing letters and cards\n2. Explaining confusing words\n3. Ideas for meals and trips\nWhat shall we try first?"),
    ],
    "fig-chat-followup": [
        ("you", "Write a short thank-you note to my neighbor Linda for the soup."),
        ("ai", "Dear Linda, thank you so much for the soup. It was a real comfort!"),
        ("you", "Less formal, and say it was the best soup ever."),
        ("ai", "Linda, you're a star! Best soup I've ever had. Thank you!"),
    ],
    "fig-chat-trip": [
        ("you", "Plan day 1 in Washington, D.C. We are in our 70s and walk slowly."),
        ("ai", "A gentle day 1:\n10:00  Museum\n12:30  Lunch\n1:30  Rest at hotel\n4:00  Monuments by taxi\n6:00  Early dinner"),
    ],
    "fig-chat-doctor": [
        ("you", "I'm seeing my doctor about knee pain. What should I ask?"),
        ("ai", "Good questions:\n1. What is causing it?\n2. Which exercises help?\n3. Do I need physical therapy?\n4. What pain relief is safe for me?"),
    ],
    "fig-chat-memories": [
        ("you", "Interview me for a memory book, one question at a time."),
        ("ai", "Lovely! Where did you grow up, and what was your home like?"),
        ("you", "A small farm in Iowa, with a red barn and lots of chickens."),
        ("ai", "What a picture! What was your favorite job on the farm?"),
    ],
    "fig-chat-scam": [
        ("you", "Is this a scam? \"Package on hold. Pay $1.99 now: [link]\""),
        ("ai", "Very likely a scam:\n- You didn't expect it\n- It wants payment by link\n- It rushes you\nDon't tap the link."),
    ],
    "fig-chat-photo": [
        ("you", "[photo] What plant is this? How do I look after it?"),
        ("ai", "It looks like a peace lily. Keep it out of strong sun, and water when the soil feels dry."),
    ],
}


def chat_figure(path, turns):
    img = Image.new("RGB", (PHONE_W + 40, PHONE_H + 40), PAPER)
    d, box = phone(img, 20, 20)
    bubbles(d, box, turns, photo=any(t.startswith("[photo]") for _, t in turns))
    img.convert("L").save(path, dpi=(300, 300))


def screen_parts(path):
    LEFT, RIGHT = 600, 480                       # room for labels on each side of the phone
    img = Image.new("RGB", (LEFT + PHONE_W + 40 + RIGHT, PHONE_H + 40), PAPER)
    d, box = phone(img, LEFT, 20)
    bubbles(d, box, [("you", "Hello!"), ("ai", "Hello! How can I help you today?")])
    f = font(50, True)
    sx0, sx1 = LEFT + 34, LEFT + PHONE_W - 34
    top_y, msg_y = 20 + 34 + 110, 20 + PHONE_H - 34 - 100
    ai_y = box[1] + 10 + 98 + 34 + 49           # middle of the assistant's reply bubble
    left = [("Menu and", "old chats", (sx0 + 50, top_y)),
            ("The", "conversation", (sx0 + 30, ai_y)),
            ("Message box:", "type here", (sx0 + 34, msg_y))]
    right = [("New chat", None, (sx1 - 110, top_y)), ("Send button", None, (sx1 - 42, msg_y))]
    for a, b, (px, py) in left:
        d.line([px, py, LEFT - 40, py], fill=INK, width=6)
        d.ellipse([px - 14, py - 14, px + 14, py + 14], fill=INK)
        d.text((LEFT - 60, py - 30), a, font=f, fill=INK, anchor="rm")
        d.text((LEFT - 60, py + 32), b, font=f, fill=INK, anchor="rm")
    rx = LEFT + PHONE_W + 80
    for a, _, (px, py) in right:
        d.line([px, py, rx - 20, py], fill=INK, width=6)
        d.ellipse([px - 14, py - 14, px + 14, py + 14], fill=INK)
        d.text((rx, py), a, font=f, fill=INK, anchor="lm")
    img.convert("L").save(path, dpi=(300, 300))


def build_figures(out_dir):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, turns in CHATS.items():
        chat_figure(out_dir / f"{name}.png", turns)
    screen_parts(out_dir / "fig-screen-parts.png")


if __name__ == "__main__":
    build_figures(Path(__file__).resolve().parent.parent / "manuscript" / "images")
    print("figures done")
