"""Long-term memory: Markdown files the owner can read, plus a search
index that Sparrow can query."""

from __future__ import annotations

import re
import sqlite3
from datetime import datetime
from pathlib import Path

from .workspace import Workspace

WORD = re.compile(r"[\w'-]+")


def append_line(path: Path, line: str) -> None:
    """Add a line, starting a new one if the file doesn't end with one."""
    text = path.read_text() if path.exists() else ""
    with open(path, "a") as f:
        if text and not text.endswith("\n"):
            f.write("\n")
        f.write(line + "\n")


class Memory:
    def __init__(self, workspace: Workspace, index_path: Path):
        self.ws = workspace
        index_path.parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(index_path, check_same_thread=False)
        self.db.executescript(
            "CREATE VIRTUAL TABLE IF NOT EXISTS chunks USING fts5("
            "  source UNINDEXED, text);"
            "CREATE TABLE IF NOT EXISTS indexed("
            "  source TEXT PRIMARY KEY, mtime REAL);"
        )

    # Writing ---------------------------------------------------------

    def remember(self, fact: str, now: datetime) -> str:
        """Add a durable fact to MEMORY.md."""
        fact = " ".join(fact.split())  # one line, no tricks
        append_line(self.ws.root / "MEMORY.md", f"- {now:%Y-%m-%d}: {fact}")
        return f"Saved to memory: {fact}"

    def note(self, text: str, now: datetime) -> Path:
        """Append to today's daily note, memory/YYYY-MM-DD.md."""
        path = self.ws.memory_dir / f"{now:%Y-%m-%d}.md"
        if not path.exists():
            path.write_text(f"# {now:%A %d %B %Y}\n\n")
        append_line(path, f"- {now:%H:%M} {' '.join(text.split())}")
        return path

    # Searching -------------------------------------------------------

    def files(self) -> list[Path]:
        return [
            self.ws.root / "MEMORY.md",
            *sorted(self.ws.memory_dir.glob("*.md")),
        ]

    def refresh(self) -> None:
        """Re-index any memory file that changed since last time."""
        for path in self.files():
            if not path.exists():
                continue
            source, mtime = (
                str(path.relative_to(self.ws.root)),
                path.stat().st_mtime,
            )
            row = self.db.execute(
                "SELECT mtime FROM indexed WHERE source = ?", (source,)
            ).fetchone()
            if row and row[0] == mtime:
                continue
            self.db.execute(
                "DELETE FROM chunks WHERE source = ?", (source,)
            )
            for line in path.read_text().splitlines():
                line = line.strip(" -#")
                if line:
                    self.db.execute(
                        "INSERT INTO chunks VALUES (?, ?)", (source, line)
                    )
            self.db.execute(
                "INSERT OR REPLACE INTO indexed VALUES (?, ?)",
                (source, mtime),
            )
        self.db.commit()

    def search(self, query: str, limit: int = 5) -> list[tuple[str, str]]:
        """Best-matching lines for any of the query's words."""
        self.refresh()
        words = WORD.findall(query.lower())
        if not words:
            return []
        match = " OR ".join('"' + w.replace('"', "") + '"' for w in words)
        return self.db.execute(
            "SELECT source, text FROM chunks WHERE chunks MATCH ? "
            "ORDER BY bm25(chunks) LIMIT ?",
            (match, limit),
        ).fetchall()
