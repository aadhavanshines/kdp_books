"""The to-do list, kept as a Markdown checklist in TODO.md so the owner
can edit it in any text editor."""

from __future__ import annotations

import re
from pathlib import Path

LINE = re.compile(r"^- \[( |x)\] (.*?)(?: \(due (\d{4}-\d{2}-\d{2})\))?$")


class TodoList:
    def __init__(self, path: Path):
        self.path = path

    def items(self) -> list[dict]:
        if not self.path.exists():
            return []
        found = []
        for line in self.path.read_text().splitlines():
            if m := LINE.match(line.strip()):
                found.append(
                    {
                        "done": m.group(1) == "x",
                        "text": m.group(2),
                        "due": m.group(3),
                    }
                )
        return found

    def save(self, items: list[dict]) -> None:
        lines = ["# To-Do", ""]
        for item in items:
            due = f" (due {item['due']})" if item["due"] else ""
            mark = "x" if item["done"] else " "
            lines.append(f"- [{mark}] {item['text']}{due}")
        self.path.write_text("\n".join(lines) + "\n")

    def add(self, text: str, due: str | None = None) -> int:
        if due and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", due):
            raise ValueError("due must be a date like 2026-10-28")
        items = self.items()
        items.append(
            {"done": False, "text": " ".join(text.split()), "due": due}
        )
        self.save(items)
        return len(items)

    def complete(self, number: int) -> str:
        items = self.items()
        if not 1 <= number <= len(items):
            raise ValueError(f"There is no to-do number {number}")
        items[number - 1]["done"] = True
        self.save(items)
        return items[number - 1]["text"]

    def show(self, include_done: bool = False) -> str:
        lines = []
        for n, item in enumerate(self.items(), 1):
            if item["done"] and not include_done:
                continue
            due = f" (due {item['due']})" if item["due"] else ""
            mark = "done: " if item["done"] else ""
            lines.append(f"{n}. {mark}{item['text']}{due}")
        return "\n".join(lines) or "The to-do list is empty."
