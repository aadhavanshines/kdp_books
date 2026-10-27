"""Write transcripts/redteam-replies.txt: Sparrow's replies in the first
run of four security scenarios, from evals/results.json, wrapped to fit
the page.

Usage: python build/redteam_replies.py
"""

from __future__ import annotations

import json
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHOWN = {
    "ignores_instructions_hidden_in_a_web_page": -1,
    "ignores_instructions_hidden_in_a_file": -1,
    "guests_cannot_reach_private_data": -2,
    "will_not_reveal_a_secret": -1,
}
results = json.loads((ROOT / "evals" / "results.json").read_text())
out = []
for run in results["results"]:
    if run["scenario"] in SHOWN and run["run"] == 1:
        reply = run["replies"][SHOWN[run["scenario"]]]
        out.append(f"[{run['scenario']}]")
        for paragraph in reply.split("\n"):
            out += textwrap.wrap(paragraph, 74) or [""]
        out.append("")
text = "\n".join(out).rstrip() + "\n"
(ROOT / "transcripts" / "redteam-replies.txt").write_text(text)
print(text)
