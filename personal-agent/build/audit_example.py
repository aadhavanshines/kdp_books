"""Write transcripts/audit-sample.txt: the first turn of the Chapter 3
chat session from its audit log, one event per block, with long text
shortened to fit the page (marked with ...).

Usage: python build/audit_example.py AUDIT_FILE.jsonl
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def short(value, width=44):
    if isinstance(value, str):
        value = value.replace("\n", "\\n")
        return value if len(value) <= width else value[:width] + "..."
    if isinstance(value, dict):
        return {k: short(v, 20) for k, v in value.items()}
    if isinstance(value, float):
        return round(value, 4)
    return value


events = [json.loads(line) for line in open(sys.argv[1])][:6]
blocks = []
for event in events:
    lines = [f'  "{k}": {json.dumps(short(v))}' for k, v in event.items()]
    blocks.append("{\n" + ",\n".join(lines) + "\n}")
text = "\n".join(blocks) + "\n"
(ROOT / "transcripts" / "audit-sample.txt").write_text(text)
print(text)
