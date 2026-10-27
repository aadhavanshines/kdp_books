"""Write transcripts/memory-demo.txt: memory files and search results
from a fresh workspace. No model is called.

Usage: python build/memory_example.py
"""

from __future__ import annotations

import sys
import tempfile
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from sparrow.config import load_settings  # noqa: E402
from sparrow.core import Core  # noqa: E402

home = Path(tempfile.mkdtemp(prefix="sparrow-memory-"))
(home / "sparrow.yaml").write_text("timezone: Europe/Lisbon\n")
zone = ZoneInfo("Europe/Lisbon")
memory = Core(load_settings(home)).memory
memory.remember("Priya (sister) has her birthday on 14 November",
                datetime(2026, 10, 20, 18, 5, tzinfo=zone))
memory.remember("Prefers the window seat on flights",
                datetime(2026, 10, 22, 9, 40, tzinfo=zone))
day = datetime(2026, 10, 27, 8, 15, tzinfo=zone)
memory.note("Asked for a packing list for Porto (2 nights, work)", day)
memory.note("Booked the 07:09 train to Porto for Thursday",
            day.replace(hour=8, minute=17))
root = memory.ws.root
out = ["$ cat MEMORY.md", (root / "MEMORY.md").read_text(),
       "$ cat memory/2026-10-27.md",
       (root / "memory" / "2026-10-27.md").read_text()]
for query in ["Priya's birthday", "Porto train", "seat", "dentist"]:
    out.append(f">>> memory.search({query!r})")
    out.append("\n".join(map(repr, memory.search(query))) or "[]")
text = "\n".join(out).rstrip() + "\n"
(ROOT / "transcripts" / "memory-demo.txt").write_text(text)
print(text)
