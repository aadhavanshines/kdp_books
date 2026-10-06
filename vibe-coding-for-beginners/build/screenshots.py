"""Capture real screenshots of the book's five projects (needs Playwright + Chromium).

Usage: CHROMIUM_PATH=/path/to/chromium python3 build/screenshots.py [name ...]
Writes manuscript/images/shot-*.png. Not part of build.py because it needs a browser.
The Sip shot needs the app's web build: set SIP_DIST, or build projects/06-sip/dist first.
"""
import datetime as dt
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
PROJ = ROOT / "projects"
OUT = ROOT / "manuscript" / "images"
SCALE = 2.5  # device pixels per CSS pixel, so ~300 DPI at the printed size


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def trim_bottom(path):
    """Cut away empty rows at the bottom (same color as the last row), keeping a small margin."""
    from PIL import Image
    img = Image.open(path).convert("RGB")
    w, h = img.size
    bg = img.getpixel((w // 2, h - 1))
    y = h - 1
    while y > 0 and all(img.getpixel((x, y)) == bg for x in range(0, w, 7)):
        y -= 1
    img.crop((0, 0, w, min(h, y + 40))).save(path)


def shoot(page, name, selector="main"):
    path = OUT / f"shot-{name}.png"
    page.locator(selector).first.screenshot(path=str(path))
    trim_bottom(path)
    print("wrote", path.name)


def tip(browser):
    page = browser.new_page(viewport={"width": 420, "height": 900}, device_scale_factor=SCALE, locale="en-US")
    page.goto((PROJ / "01-tip-calculator" / "index.html").as_uri())
    page.fill("#bill", "100")
    page.fill("#people", "3")
    page.check("#roundUp")
    shoot(page, "tip-calculator")


def todo(browser):
    ctx = browser.new_context(viewport={"width": 560, "height": 700}, device_scale_factor=SCALE, locale="en-US",
                              timezone_id="America/New_York")
    page = ctx.new_page()
    page.clock.set_fixed_time(dt.datetime(2026, 10, 6, 10, 0))
    page.goto((PROJ / "02-todo-app" / "before-redesign" / "index.html").as_uri())
    for text, due in [("Buy milk", ""), ("Call the dentist", "2026-10-03"), ("Finish chapter 3", "2026-10-06"),
                      ("Book train tickets", "2026-10-09")]:
        page.fill("#new-task", text)
        page.fill("#new-due", due)
        page.press("#new-task", "Enter")
    page.locator("#task-list li", has_text="Buy milk").locator("input[type=checkbox]").check()
    shoot(page, "todo-app", ".card")
    ctx.close()


def todo_before_after(browser):
    """Chapter 8: the to-do app on a phone, before and after the accessibility redesign."""
    from PIL import Image, ImageDraw, ImageFont
    shots = []
    for folder in ("before-redesign", ""):
        ctx = browser.new_context(viewport={"width": 390, "height": 700}, device_scale_factor=SCALE,
                                  locale="en-US", has_touch=True, is_mobile=True)
        page = ctx.new_page()
        page.goto((PROJ / "02-todo-app" / folder / "index.html").as_uri())
        for text in ("Buy milk", "Call the dentist", "Finish chapter 3"):
            page.fill("#new-task", text)
            page.press("#new-task", "Enter")
        page.locator("#task-list input[type=checkbox]").first.check()
        path = OUT / f"_tmp_{folder or 'after'}.png"
        page.locator(".card, main").first.screenshot(path=str(path))
        trim_bottom(path)
        shots.append(Image.open(path).convert("RGB"))
        path.unlink()
        ctx.close()
    gap, label_h = 60, 110
    h = max(s.height for s in shots) + label_h
    out = Image.new("RGB", (sum(s.width for s in shots) + gap, h), (255, 255, 255))
    d = ImageDraw.Draw(out)
    font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 64)
    x = 0
    for s, label in zip(shots, ("Before", "After")):
        d.text((x + s.width / 2, 20), label, font=font, fill=(31, 58, 95), anchor="ma")
        out.paste(s, (x, label_h))
        x += s.width + gap
    out.save(OUT / "shot-todo-before-after.png")
    print("wrote shot-todo-before-after.png")


def habits(browser):
    tmp = Path(tempfile.mkdtemp())
    shutil.copytree(PROJ / "04-habit-tracker", tmp / "app")
    port = free_port()
    env = dict(os.environ, PORT=str(port), DATABASE_PATH=str(tmp / "habits.db"))
    proc = subprocess.Popen([sys.executable, "app.py"], cwd=tmp / "app", env=env,
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    url = f"http://127.0.0.1:{port}"
    for _ in range(50):
        try:
            urllib.request.urlopen(url + "/api/habits")
            break
        except OSError:
            time.sleep(0.1)
    today = dt.date.today()
    for name, back in [("Drink water", [0, 1, 2, 3, 5]), ("Read 20 pages", [1, 2, 3, 4, 5, 6])]:
        req = urllib.request.Request(url + "/api/habits", data=json.dumps({"name": name}).encode(),
                                     headers={"Content-Type": "application/json"})
        hid = json.load(urllib.request.urlopen(req))["id"]
        for b in back:
            d = (today - dt.timedelta(days=b)).isoformat()
            urllib.request.urlopen(urllib.request.Request(
                f"{url}/api/habits/{hid}/toggle", data=json.dumps({"date": d}).encode(),
                headers={"Content-Type": "application/json"}))
    page = browser.new_page(viewport={"width": 600, "height": 700}, device_scale_factor=SCALE, locale="en-US")
    page.goto(url)
    page.wait_for_selector(".habit")
    shoot(page, "habit-tracker")
    proc.terminate()
    proc.wait()


def study_buddy(browser):
    sys.path.insert(0, str(PROJ / "05-study-buddy"))
    from werkzeug.serving import make_server
    import app as app_module

    cards = [{"question": "What does photosynthesis turn light energy into?",
              "answer": "Chemical energy, stored as glucose."},
             {"question": "Where in the plant cell does photosynthesis happen?", "answer": "In the chloroplasts."},
             {"question": "Which gas do plants take in for photosynthesis?", "answer": "Carbon dioxide."}]

    class Fake:
        class messages:
            @staticmethod
            def create(**kw):
                class B:
                    type = "text"
                    text = json.dumps({"flashcards": cards})

                class R:
                    stop_reason = "end_turn"
                    content = [B()]
                return R()

    srv = make_server("127.0.0.1", 0, app_module.create_app(client=Fake()))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    page = browser.new_page(viewport={"width": 560, "height": 900}, device_scale_factor=SCALE, locale="en-US")
    page.goto(f"http://127.0.0.1:{srv.server_port}")
    page.fill("#notes", "Photosynthesis is how plants turn light energy into chemical energy. It happens in the "
                        "chloroplasts. Plants take in carbon dioxide and water and release oxygen.")
    page.click("#make")
    page.wait_for_selector("#card-view:not([hidden])")
    page.click("#next")
    shoot(page, "study-buddy")
    srv.shutdown()


def sip(browser):
    """Chapter 20: the Sip mobile app's web build on a phone, in light and dark mode."""
    import functools
    import http.server
    from PIL import Image, ImageDraw, ImageFont
    dist = os.environ.get("SIP_DIST") or str(PROJ / "06-sip" / "dist")
    if not os.path.exists(os.path.join(dist, "index.html")):
        print("skipped Sip: no web build at", dist)
        return
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=dist))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    shots = []
    for scheme in ("light", "dark"):
        ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=SCALE,
                                  locale="en-US", timezone_id="America/New_York", color_scheme=scheme,
                                  has_touch=True, is_mobile=True)
        page = ctx.new_page()
        page.clock.set_fixed_time(dt.datetime(2026, 10, 6, 15, 0, tzinfo=dt.timezone(dt.timedelta(hours=-4))))
        page.goto(f"http://127.0.0.1:{srv.server_port}")
        page.wait_for_selector("text=of 2,000 ml goal")
        for name in ("+250 ml", "+500 ml", "+500 ml"):
            page.get_by_role("button", name=name, exact=True).click()
        page.wait_for_selector("text=63%")
        path = OUT / f"_tmp_sip_{scheme}.png"
        page.screenshot(path=str(path))
        shots.append(Image.open(path).convert("RGB"))
        path.unlink()
        ctx.close()
    srv.shutdown()
    gap, label_h = 60, 110
    out = Image.new("RGB", (sum(s.width for s in shots) + gap, shots[0].height + label_h), (255, 255, 255))
    d = ImageDraw.Draw(out)
    font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", 64)
    x = 0
    for s, label in zip(shots, ("Light mode", "Dark mode")):
        d.text((x + s.width / 2, 20), label, font=font, fill=(31, 58, 95), anchor="ma")
        out.paste(s, (x, label_h))
        x += s.width + gap
    out.save(OUT / "shot-sip.png")
    print("wrote shot-sip.png")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH") or None)
        shots = (tip, todo, todo_before_after, habits, study_buddy, sip)
        wanted = sys.argv[1:]
        for fn in shots:
            if not wanted or fn.__name__ in wanted:
                fn(browser)
        browser.close()


if __name__ == "__main__":
    main()
