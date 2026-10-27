"""Record real terminal sessions for the book: init, doctor, status and a
chat in the terminal with the real model (a few US cents).

The temporary home folder is shown as ~/.sparrow, as on a reader's own
computer; nothing else in the output is changed.

Usage: python build/transcripts.py
"""

from __future__ import annotations

import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "transcripts"
PYTHON = sys.executable


def run(args: list[str], home: Path, stdin: str | None = None,
        **env: str) -> str:
    result = subprocess.run(
        [PYTHON, "-m", "sparrow", "--home", str(home), *args],
        cwd=ROOT, input=stdin, capture_output=True, text=True,
        env={**os.environ, "TZ": "Europe/Lisbon", **env}, timeout=900)
    text = (result.stdout + result.stderr).replace(str(home), "~/.sparrow")
    return text.rstrip() + "\n"


def main() -> None:
    OUT.mkdir(exist_ok=True)
    home = Path(tempfile.mkdtemp(prefix="sparrow-demo-")) / ".sparrow"
    shown = {
        "init": run(["init"], home),
        # doctor only checks that a key is set, as a reader's would be
        "doctor": run(["doctor"], home, ANTHROPIC_API_KEY="sk-ant-..."),
    }
    (home / "workspace" / "USER.md").write_text(
        "# About Your Owner\n\nAsha Rao lives in Lisbon and works as a "
        "hospital pharmacist. She likes short, practical answers.\n")
    messages = [
        "I spent 12.50 on lunch and 30 on a taxi today. Log them, please.",
        "And yesterday 64.20 on groceries. What are this month's totals?",
        "/status",
    ]
    shown["chat"] = run(["chat"], home, "\n".join(messages) + "\n")
    shown["expenses"] = (home / "workspace" / "files" /
                         "expenses.csv").read_text()
    for name, text in shown.items():
        (OUT / f"{name}.txt").write_text(text)
        print(f"--- {name}\n{text}")


if __name__ == "__main__":
    main()
