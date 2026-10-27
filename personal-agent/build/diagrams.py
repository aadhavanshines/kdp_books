"""Generate this book's diagrams as 300 DPI PNGs (print-safe in grayscale).

Drawing helpers are shared with the earlier books, in diagrams_ref.py.
Usage:  python3 build/diagrams.py
"""
from pathlib import Path

from diagrams_ref import (BOLD, ITAL, LIGHT, MID, NAVY, PALE, REG, W, WHITE,
                          INK, arrow, box, canvas, f, poly_arrow)

OUT = Path(__file__).resolve().parent.parent / "manuscript" / "images"
ORANGE = (194, 84, 0)


def label(d, xy, text, size=28, color=MID, anchor="ma", font=ITAL,
          patch=False):
    if patch:  # a white background, so lines behind stay readable
        box_ = d.textbbox(xy, text, font=f(font, size), anchor=anchor)
        d.rectangle((box_[0] - 8, box_[1] - 4, box_[2] + 8, box_[3] + 4),
                    fill=WHITE)
    d.text(xy, text, font=f(font, size), fill=color, anchor=anchor)


def architecture():
    img, d = canvas(1500)
    # Channels
    for i, (name, sub) in enumerate([("Telegram", "on your phone"),
                                     ("Web chat", "in your browser"),
                                     ("Terminal", "on this computer")]):
        x = 40 + i * 440
        box(d, (x, 30, x + 400, 170), name, PALE, sub=sub, outline=MID,
            font=f(BOLD, 36))
        arrow(d, (x + 200, 170), (x + 200, 262))
    label(d, (W / 2 - 20, 200), "channels", 30, anchor="ra")
    # Gateway
    box(d, (40, 270, W - 40, 560), "", NAVY, WHITE)
    d.text((W / 2, 290), "Gateway", font=f(BOLD, 44), fill=WHITE, anchor="ma")
    parts = ["Pairing", "Commands", "Sessions", "Scheduler", "Heartbeat"]
    for i, part in enumerate(parts):
        x = 70 + i * 252
        box(d, (x, 370, x + 232, 470), part, LIGHT, font=f(BOLD, 30))
    label(d, (W / 2, 495), "one long-running process on your computer",
          28, (210, 220, 235))
    # Brain and tools
    box(d, (40, 650, 560, 860), "Brain", LIGHT, sub="Claude, through the "
        "Claude Agent SDK", font=f(BOLD, 40))
    box(d, (820, 650, W - 40, 860), "Tools", LIGHT, sub="memory, files, "
        "to-dos, schedule, web, commands, skills", font=f(BOLD, 40))
    arrow(d, (300, 560), (300, 642))
    arrow(d, (560, 720), (812, 720))
    arrow(d, (820, 790), (568, 790), color=MID)
    label(d, (690, 670), "calls", 28)
    label(d, (690, 805), "results", 28)
    # Safety layer
    d.rounded_rectangle((40, 940, W - 40, 1230), radius=22, outline=ORANGE,
                        width=5)
    d.text((W / 2, 960), "Safety layer", font=f(BOLD, 38), fill=ORANGE,
           anchor="ma")
    safety = ["Privacy router", "Egress policy", "Vault", "Sandbox",
              "Approvals"]
    for i, part in enumerate(safety):
        x = 70 + i * 252
        box(d, (x, 1030, x + 232, 1140), part, PALE, font=f(BOLD, 28),
            outline=MID)
    label(d, (W / 2, 1165), "every tool call and every request to the "
          "model passes through here", 27)
    arrow(d, (1100, 860), (1100, 932))
    # Workspace
    box(d, (40, 1300, W - 40, 1460), "Workspace", PALE,
        sub="SOUL.md, USER.md, AGENTS.md, MEMORY.md, HEARTBEAT.md, "
        "TODO.md, skills, your files: plain files you can read and edit",
        outline=MID, font=f(BOLD, 36))
    arrow(d, (W / 2, 1230), (W / 2, 1292))
    return img


def one_turn():
    steps = [
        ("Message arrives", "from a channel"),
        ("Who is it?", "owner, guest or stranger (pairing)"),
        ("Command?", "/new, /status, /approve ... answered directly"),
        ("Budget left today?", "otherwise stop politely"),
        ("Build the prompt", "workspace files, memory, skills, history"),
        ("Hide private values", "the privacy router swaps in placeholders"),
        ("Brain and tools", "Claude decides; every tool call is checked"),
        ("Put values back", "save the transcript, log, reply"),
    ]
    h = 120
    img, d = canvas(60 + len(steps) * (h + 38))
    for i, (title, sub) in enumerate(steps):
        y = 30 + i * (h + 38)
        dark = i in (0, 7)
        box(d, (230, y, W - 230, y + h), title, NAVY if dark else LIGHT,
            WHITE if dark else INK, sub=sub, font=f(BOLD, 34))
        d.text((170, y + h / 2), str(i + 1), font=f(BOLD, 44), fill=MID,
               anchor="mm")
        if i < len(steps) - 1:
            arrow(d, (W / 2, y + h), (W / 2, y + h + 32))
    return img


def workspace_tree():
    img, d = canvas(1060)
    lines = [
        ("~/.sparrow/", BOLD, 0, ""),
        ("sparrow.yaml", REG, 1, "settings"),
        ("workspace/", BOLD, 1, "what Sparrow knows: edit freely"),
        ("SOUL.md", REG, 2, "personality and tone"),
        ("USER.md", REG, 2, "about you"),
        ("AGENTS.md", REG, 2, "house rules"),
        ("MEMORY.md", REG, 2, "long-term facts"),
        ("HEARTBEAT.md", REG, 2, "what to check every half hour"),
        ("TODO.md", REG, 2, "your to-do list"),
        ("memory/", REG, 2, "one note per day"),
        ("skills/", REG, 2, "one folder per skill"),
        ("files/", REG, 2, "your documents (the sandbox's /work)"),
        ("state/", BOLD, 1, "what Sparrow keeps: don't edit"),
        ("sparrow.db", REG, 2, "jobs, approvals, guests, spending"),
        ("secrets.env", REG, 2, "tokens and keys (chmod 600)"),
        ("sessions/", REG, 2, "conversation transcripts"),
        ("audit/", REG, 2, "everything Sparrow did, by day"),
    ]
    for i, (name, font, depth, note) in enumerate(lines):
        y = 30 + i * 60
        x = 60 + depth * 70
        d.text((x, y), name, font=f(font, 36), fill=NAVY if font == BOLD
               else INK)
        if note:
            d.text((700, y + 4), note, font=f(ITAL, 30), fill=MID)
    return img


def trust_boundaries():
    img, d = canvas(1180)
    box(d, (W / 2 - 300, 470, W / 2 + 300, 690), "Sparrow", NAVY, WHITE,
        sub="gateway, brain, tools", font=f(BOLD, 44))
    who = [
        ((40, 30, 420, 230), "You (owner)", "full access"),
        ((500, 30, 880, 230), "Guests", "paired by you: chat only"),
        ((960, 30, W - 40, 230), "Strangers", "a pairing code, nothing "
         "else"),
        ((40, 930, 420, 1130), "Web pages", "untrusted text; hosts by "
         "policy"),
        ((500, 930, 880, 1130), "Files and skills", "untrusted text; new "
         "skills need approval"),
        ((960, 930, W - 40, 1130), "Model provider", "sees placeholders, "
         "never your keys"),
    ]
    for xy, title, sub in who:
        box(d, xy, title, PALE, sub=sub, outline=MID, font=f(BOLD, 34))
    for x in (230, 690, 1150):
        arrow(d, (x, 230), (x if x == 690 else (x + 690) / 2 + (x - 690)
                            * 0.35, 462), color=MID)
        arrow(d, (x if x == 690 else (x + 690) / 2 + (x - 690) * 0.35,
                  698), (x, 922), color=MID)
    d.line((40, 330, W - 40, 330), fill=ORANGE, width=5)
    d.line((40, 830, W - 40, 830), fill=ORANGE, width=5)
    label(d, (W / 2, 316), "trust boundary: pairing, roles, commands",
          26, ORANGE, "ma", patch=True)
    label(d, (W / 2, 816), "trust boundary: policy, sandbox, privacy, "
          "vault", 26, ORANGE, "ma", patch=True)
    return img


def sandbox_view():
    img, d = canvas(980)
    d.rounded_rectangle((40, 30, W - 40, 950), radius=26, outline=NAVY,
                        width=6)
    d.text((W / 2, 50), "What a sandboxed command can see",
           font=f(BOLD, 40), fill=NAVY, anchor="ma")
    rows = [
        ("/usr, /bin, /lib", "read-only", "programs such as Python"),
        ("/work", "read and write", "your files folder, and nothing else"),
        ("/skills", "read-only", "skill scripts"),
        ("/tmp", "scratch", "empty, gone afterwards"),
        ("network", "none", "no internet, no local network"),
        ("your home folder", "invisible", "no keys, no SSH, no browser"),
        ("environment", "empty", "no API keys or tokens"),
        ("other processes", "invisible", "its own process list"),
        ("limits", "enforced", "time, memory, file size"),
    ]
    for i, (what, access, note) in enumerate(rows):
        y = 130 + i * 90
        dark = access in ("read and write",)
        box(d, (80, y, 520, y + 72), what, NAVY if dark else LIGHT,
            WHITE if dark else INK, font=f(BOLD, 30), radius=16)
        d.text((560, y + 36), access, font=f(BOLD, 30), fill=ORANGE
               if access in ("none", "invisible", "empty") else INK,
               anchor="lm")
        d.text((820, y + 36), note, font=f(REG, 28), fill=MID, anchor="lm")
    return img


def privacy_flow():
    img, d = canvas(900)
    box(d, (40, 30, W - 40, 170), "You: \"Save Ana's email "
        "ana@mail.example in contacts.txt\"", PALE, outline=MID,
        font=f(BOLD, 32))
    arrow(d, (W / 2, 170), (W / 2, 232))
    box(d, (40, 240, W - 40, 380), "The model sees: \"Save Ana's email "
        "<EMAIL_1> in contacts.txt\"", NAVY, WHITE, font=f(BOLD, 32))
    arrow(d, (W / 2, 380), (W / 2, 442))
    box(d, (40, 450, W - 40, 590), "It calls write_file(\"contacts.txt\", "
        "\"Ana: <EMAIL_1>\")", LIGHT, font=f(BOLD, 32))
    arrow(d, (W / 2, 590), (W / 2, 652))
    box(d, (40, 660, W - 40, 800), "The file gets: \"Ana: "
        "ana@mail.example\"", PALE, outline=MID, font=f(BOLD, 32))
    label(d, (W / 2, 835), "the real value never leaves your computer",
          30, ORANGE)
    return img


def test_pyramid():
    img, d = canvas(1000)
    levels = [
        ("System test", "the real gateway process, crashed and restarted"),
        ("End-to-end evaluations", "the real model, graded by code"),
        ("Functional tests", "the whole gateway, with a scripted brain"),
        ("Unit tests", "each part on its own"),
    ]
    for i, (title, sub) in enumerate(levels):
        y = 40 + i * 225
        inset = 300 - i * 90
        box(d, (40 + inset, y, W - 40 - inset, y + 190), title,
            NAVY if i < 2 else LIGHT, WHITE if i < 2 else INK, sub=sub,
            font=f(BOLD, 36))
    label(d, (60, 120), "slow, costs money", 28, ORANGE, "la")
    label(d, (60, 955), "fast, free", 28, NAVY, "la")
    return img


def heartbeat_timeline():
    img, d = canvas(620)
    d.line((80, 300, W - 60, 300), fill=MID, width=6)
    ticks = [("08:00", "briefing task", True), ("08:30", "HEARTBEAT_OK",
                                                False),
             ("09:00", "HEARTBEAT_OK", False), ("09:20", "reminder", True),
             ("09:30", "bill due today!", True), ("10:00", "HEARTBEAT_OK",
                                                  False)]
    for i, (time, what, spoke) in enumerate(ticks):
        x = 150 + i * 216
        d.ellipse((x - 18, 282, x + 18, 318), fill=NAVY if spoke else LIGHT,
                  outline=NAVY, width=4)
        d.text((x, 240), time, font=f(BOLD, 32), fill=INK, anchor="mm")
        d.text((x, 360), what, font=f(REG if not spoke else BOLD, 24),
               fill=NAVY if spoke else MID, anchor="mm")
        if spoke:
            arrow(d, (x, 400), (x, 470), color=ORANGE, width=5, head=20)
            d.text((x, 500), "message", font=f(ITAL, 26), fill=ORANGE,
                   anchor="mm")
    label(d, (W / 2, 40), "Filled dots send you a message; the others "
          "stay silent", 30, MID)
    label(d, (W / 2, 90), "(heartbeat every 30 minutes, plus scheduled "
          "jobs)", 28, MID)
    return img


DIAGRAMS = {
    "architecture": architecture,
    "one-turn": one_turn,
    "workspace-tree": workspace_tree,
    "trust-boundaries": trust_boundaries,
    "sandbox-view": sandbox_view,
    "privacy-flow": privacy_flow,
    "test-pyramid": test_pyramid,
    "heartbeat-timeline": heartbeat_timeline,
}


def build_diagrams(out_dir=OUT):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, make in DIAGRAMS.items():
        make().save(out_dir / f"{name}.png", dpi=(300, 300))
    return list(DIAGRAMS)


if __name__ == "__main__":
    print(build_diagrams())
