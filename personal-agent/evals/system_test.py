"""Black-box system test: run Sparrow exactly as a user would
(python -m sparrow run) against a fake Telegram server, talk to it only
from outside, crash it, restart it, and check what comes out.

Uses the real model (a few US cents). Run from the project folder:
    python evals/system_test.py
"""

from __future__ import annotations

import asyncio
import json
import os
import shutil
import signal
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import httpx
import websockets

ROOT = Path(__file__).resolve().parent.parent
PYTHON = sys.executable
TG_PORT, WEB_PORT = 18081, 18765
TG_TOKEN = "123456:TEST-TOKEN"
WEB_TOKEN = "system-test-token-0123456789"
FAKE = f"http://127.0.0.1:{TG_PORT}"

CONFIG = f"""
owner_name: Asha
owners: ["telegram:100"]
timezone: Europe/Lisbon
model: claude-sonnet-5-5
webchat: {{enabled: true, port: {WEB_PORT}}}
telegram: {{enabled: true, api_url: "{FAKE}"}}
heartbeat: {{every_minutes: 600}}
"""

checks: list[tuple[str, bool]] = []


def check(name: str, ok: bool) -> None:
    checks.append((name, ok))
    print(("PASS " if ok else "FAIL ") + name, flush=True)


def start_sparrow(home: Path) -> subprocess.Popen:
    log = open(home / "gateway.log", "a")
    return subprocess.Popen(
        [PYTHON, "-m", "sparrow", "--home", str(home), "run"],
        cwd=ROOT, stdout=log, stderr=subprocess.STDOUT)


async def say(client, user_id: int, text: str, name="Asha") -> None:
    await client.post(f"{FAKE}/test/say", json={
        "user_id": user_id, "text": text, "name": name})


async def wait_for(client, predicate, timeout: float = 120):
    """Poll what Sparrow sent until predicate(sent) is true."""
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        sent = (await client.get(f"{FAKE}/test/sent")).json()
        if predicate(sent):
            return sent
        await asyncio.sleep(1)
    return (await client.get(f"{FAKE}/test/sent")).json()


def to(chat: int):
    return lambda sent: [m["text"] for m in sent if m["chat_id"] == chat]


async def main() -> int:
    home = Path(tempfile.mkdtemp(prefix="sparrow-system-"))
    (home / "sparrow.yaml").write_text(CONFIG)
    secrets = home / "state" / "secrets.env"
    secrets.parent.mkdir(parents=True)
    secrets.write_text(f"SPARROW_TELEGRAM_TOKEN={TG_TOKEN}\n"
                       f"SPARROW_WEB_TOKEN={WEB_TOKEN}\n")
    secrets.chmod(0o600)
    fake = subprocess.Popen([PYTHON, "tests/fake_telegram.py",
                             str(TG_PORT)], cwd=ROOT)
    sparrow = start_sparrow(home)
    owner, stranger = to(100), to(777)
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            await asyncio.sleep(4)
            check("gateway is running", sparrow.poll() is None)

            # 1. A stranger is held at the door
            await say(client, 777, "hi, I'm a friend of Asha", "Marco")
            sent = await wait_for(client, lambda s: stranger(s) and
                                  owner(s), 30)
            check("stranger gets a pairing code",
                  "approve code" in " ".join(stranger(sent)))
            check("owner is told about the stranger",
                  "Marco" in " ".join(owner(sent)))

            # 2. Commands answer without the model
            await say(client, 100, "/status")
            sent = await wait_for(client, lambda s: any(
                "Spent today" in t for t in owner(s)), 30)
            check("/status works", any("Spent today" in t
                                       for t in owner(sent)))

            # 3. A real conversation, then a reminder
            await say(client, 100, "Remind me in 2 minutes to stretch.")
            sent = await wait_for(client, lambda s: len(owner(s)) >= 3)
            check("owner gets a real answer", len(owner(sent)) >= 3)

            # 4. Crash the gateway, then start it again
            sparrow.send_signal(signal.SIGKILL)
            sparrow.wait()
            check("gateway was killed", sparrow.returncode is not None)
            await asyncio.sleep(5)
            sparrow = start_sparrow(home)
            sent = await wait_for(client, lambda s: any(
                t.startswith("Reminder:") for t in owner(s)), 240)
            reminders = [t for t in owner(sent)
                         if t.startswith("Reminder:")]
            check("reminder delivered after the crash", len(reminders) == 1
                  and "stretch" in reminders[0].lower())

            # 5. The web chat, through a real WebSocket
            url = f"ws://127.0.0.1:{WEB_PORT}/ws?token={WEB_TOKEN}"
            async with websockets.connect(url) as socket:
                await socket.send(json.dumps(
                    {"text": "Reply with just the word pong."}))
                messages = []
                while not any("from" in m for m in messages):
                    messages.append(json.loads(await asyncio.wait_for(
                        socket.recv(), 120)))
            reply = [m["text"] for m in messages if "from" in m][0]
            check("web chat answers", "pong" in reply.lower())
            try:
                async with websockets.connect(url.replace(WEB_TOKEN,
                                                          "wrong")) as bad:
                    await bad.recv()
                refused = False
            except websockets.InvalidStatus as rejected:
                refused = rejected.response.status_code == 403
            check("web chat refuses a wrong token", refused)

        # 6. The record on disk
        logs = " ".join(p.read_text() for p in
                        (home / "state" / "audit").glob("*.jsonl"))
        check("audit log written", '"event": "turn"' in logs)
        check("no tokens in the audit log",
              TG_TOKEN not in logs and WEB_TOKEN not in logs)
    finally:
        for process in (sparrow, fake):
            process.terminate()
        for process in (sparrow, fake):
            process.wait(timeout=10)
    passed = sum(ok for _, ok in checks)
    print(f"{passed} of {len(checks)} checks passed")
    if passed == len(checks):
        shutil.rmtree(home)
    else:
        print(f"Kept {home} for inspection")
    return 0 if passed == len(checks) else 1


if __name__ == "__main__":
    os.chdir(ROOT)
    sys.exit(asyncio.run(main()))
