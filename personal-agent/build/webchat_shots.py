"""Screenshots of the real web chat, talking to the real model.

Sparrow runs here with the evaluation harness's pretend internet (the
fictional .example sites), the real web chat server, and Chromium driven
by Playwright typing the messages. Costs a few US cents.

Usage: python build/webchat_shots.py
"""

from __future__ import annotations

import asyncio
import os
import re
import sys
from pathlib import Path

import uvicorn
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "evals"))

from harness import make_sparrow  # noqa: E402

from sparrow.channels.webchat import WebChatChannel  # noqa: E402

TOKEN = "screenshot-token-0123456789"
PORT = 18770
OUT = ROOT / "manuscript" / "images"
TRANSCRIPTS = ROOT / "transcripts"


async def chat(page, text: str) -> str:
    replies = page.locator(".msg.sparrow")
    before = await replies.count()
    await page.fill("#text", text)
    await page.press("#text", "Enter")
    await replies.nth(before).wait_for(timeout=180_000)
    return await replies.nth(before).inner_text()


async def shoot(page, path: Path) -> None:
    """Screenshot without the empty space between the last message and
    the message box."""
    from PIL import Image
    await page.screenshot(path=path)
    scale = 2
    last = await page.locator(".msg").last.bounding_box()
    form = await page.locator("form").bounding_box()
    image = Image.open(path)
    top = image.crop((0, 0, image.width,
                      int((last["y"] + last["height"] + 24) * scale)))
    bottom = image.crop((0, int(form["y"] * scale), image.width,
                         image.height))
    joined = Image.new("RGB", (image.width, top.height + bottom.height))
    joined.paste(top, (0, 0))
    joined.paste(bottom, (0, top.height))
    joined.save(path)


async def main() -> None:
    sparrow = make_sparrow()
    web = WebChatChannel(TOKEN)
    web.gateway = sparrow.gateway
    sparrow.gateway.add_channel(web)
    server = uvicorn.Server(uvicorn.Config(web.app, host="127.0.0.1",
                                           port=PORT, log_level="warning"))
    serving = asyncio.create_task(server.serve())
    while not server.started:
        await asyncio.sleep(0.1)
    lines = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=os.environ.get("CHROMIUM_PATH"))
        page = await browser.new_page(viewport={"width": 640, "height": 960},
                                      device_scale_factor=2)
        await page.goto(f"http://127.0.0.1:{PORT}/?token={TOKEN}")
        for text in [
            "Hi Sparrow! My sister Priya's birthday is 14 November. "
            "Please remember that.",
            "Remind me on 10 November at 09:00 to buy her a present.",
            "What's coming up for me this month?",
        ]:
            lines += [f"You: {text}", f"Sparrow: {await chat(page, text)}"]
        await shoot(page, OUT / "shot-webchat-memory.png")

        await page.goto(f"http://127.0.0.1:{PORT}/?token={TOKEN}")
        question = "What's the top story on https://news.example/today ?"
        first = await chat(page, question)
        code = re.search(r"/approve ([A-Z0-9]{6})", first).group(1)
        lines += [f"You: {question}", f"Sparrow: {first}"]
        second = await chat(page, f"/approve {code}")
        lines += [f"You: /approve {code}", f"Sparrow: {second}"]
        await shoot(page, OUT / "shot-webchat-approval.png")
        await browser.close()
    server.should_exit = True
    await serving
    TRANSCRIPTS.mkdir(exist_ok=True)
    (TRANSCRIPTS / "webchat.txt").write_text("\n\n".join(lines) + "\n")
    print("\n\n".join(lines))
    print(f"cost: US${sparrow.cost():.4f}")


if __name__ == "__main__":
    asyncio.run(main())
