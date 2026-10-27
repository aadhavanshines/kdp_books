"""Write transcripts/system-prompt.txt: the system prompt Sparrow builds
for its owner, from a fresh workspace with a short USER.md and one
remembered fact, at a fixed time. No model is called.

Usage: python build/prompt_example.py
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

home = Path(tempfile.mkdtemp(prefix="sparrow-prompt-"))
(home / "sparrow.yaml").write_text("timezone: Europe/Lisbon\n")
now = datetime(2026, 10, 27, 9, 0, tzinfo=ZoneInfo("Europe/Lisbon"))
core = Core(load_settings(home), clock=lambda: now)
(core.workspace.root / "USER.md").write_text(
    "# About Your Owner\n\nAsha Rao lives in Lisbon and works as a "
    "hospital pharmacist.\nShe likes short, practical answers. Her "
    "partner is Tomas.\n")
core.memory.remember("Priya (sister) has her birthday on 14 November", now)
prompt = core.workspace.system_prompt(
    now, core.skills.index(), "Asha", "telegram:100")
(ROOT / "transcripts" / "system-prompt.txt").write_text(prompt + "\n")
print(prompt)
