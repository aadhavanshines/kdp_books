"""Sessions: each conversation's transcript, one JSON line per message.

The owner's direct messages on every channel share one session, "main",
so a chat started on Telegram can continue in the web chat."""

from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path


class Sessions:
    def __init__(self, folder: Path):
        self.folder = folder
        (folder / "archive").mkdir(parents=True, exist_ok=True)

    def path(self, key: str) -> Path:
        return self.folder / (re.sub(r"[^\w.-]", "_", key) + ".jsonl")

    def append(self, key: str, role: str, text: str, now: datetime) -> None:
        record = {
            "time": now.isoformat(timespec="seconds"),
            "role": role,
            "text": text,
        }
        with open(self.path(key), "a") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    def history(self, key: str, turns: int) -> list[dict]:
        path = self.path(key)
        if not path.exists():
            return []
        records = [
            json.loads(line)
            for line in path.read_text().splitlines()
            if line.strip()
        ]
        return records[-turns * 2 :]

    def reset(self, key: str, now: datetime) -> Path | None:
        """Start afresh; the old transcript is kept in archive/."""
        path = self.path(key)
        if not path.exists():
            return None
        target = (
            self.folder
            / "archive"
            / f"{path.stem}-{now:%Y%m%d-%H%M%S}.jsonl"
        )
        path.rename(target)
        return target


def render(history: list[dict], speaker: str) -> str:
    """The conversation so far, as plain text for the prompt."""
    lines = []
    for record in history:
        who = "Sparrow" if record["role"] == "assistant" else speaker
        lines.append(f"[{record['time'][:16]}] {who}: {record['text']}")
    return "\n".join(lines)
