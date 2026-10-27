"""The workspace: plain Markdown files that make Sparrow who it is."""

from __future__ import annotations

import shutil
from datetime import datetime
from pathlib import Path

TEMPLATES = Path(__file__).parent / "templates"
PROMPT_FILES = ["SOUL.md", "USER.md", "AGENTS.md"]
MEMORY_LIMIT = 6000  # characters of MEMORY.md put in every prompt


class Workspace:
    def __init__(self, root: Path):
        self.root = Path(root)
        self.files = self.root / "files"  # the owner's documents
        self.memory_dir = self.root / "memory"  # daily notes
        self.skills_dir = self.root / "skills"

    def create(self) -> None:
        """Copy the templates in, never overwriting the owner's edits."""
        for folder in (self.root, self.files, self.memory_dir):
            folder.mkdir(parents=True, exist_ok=True)
        for source in TEMPLATES.rglob("*"):
            target = self.root / source.relative_to(TEMPLATES)
            if source.is_dir():
                target.mkdir(parents=True, exist_ok=True)
            elif not target.exists():
                shutil.copy(source, target)

    def read(self, name: str) -> str:
        path = self.root / name
        return path.read_text().strip() if path.exists() else ""

    def system_prompt(
        self, now: datetime, skills_index: str, speaker: str, channel: str
    ) -> str:
        """Everything Sparrow should know before reading a message."""
        parts = [self.read(name) for name in PROMPT_FILES]
        memory = self.read("MEMORY.md")
        if len(memory) > MEMORY_LIMIT:  # keep the newest lines
            memory = "...\n" + memory[-MEMORY_LIMIT:]
        parts.append(memory)
        parts.append(
            "# Skills\n\nWhen a request matches a skill, call "
            "read_skill first and follow it.\n\n" + skills_index
        )
        parts.append(
            "# Right Now\n\n"
            f"- Date and time: {now:%A %Y-%m-%d %H:%M} ({now:%Z})\n"
            f"- You are talking to: {speaker}\n"
            f"- Channel: {channel}"
        )
        return "\n\n".join(p for p in parts if p)

    def guest_prompt(
        self, now: datetime, skills_index: str, speaker: str, channel: str
    ) -> str:
        """For paired guests: the personality, but nothing about the
        owner. A model can't leak what it was never given."""
        return "\n\n".join(
            [
                self.read("SOUL.md"),
                f"# Guest\n\nYou are talking to {speaker}, a guest "
                "your owner has allowed to chat with you. You know "
                "nothing private about your owner and can't use their "
                "files, memory, to-dos or schedule. Help with general "
                "questions only.",
                "# Skills\n\n" + skills_index,
                f"# Right Now\n\n- Date and time: {now:%A %Y-%m-%d %H:%M}\n"
                f"- Channel: {channel}",
            ]
        )
