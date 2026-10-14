"""Grade the nightly assistant's decisions for one night.
Run it with:  python grade.py output/2026-10-07/summary.json
"""

import json
import sys
from pathlib import Path

TRUTH = Path(__file__).resolve().parent.parent / "wlc200" / "labels" / "nightly-truth.json"


def grade(path):
    s = json.loads(Path(path).read_text())
    want = json.loads(TRUTH.read_text())[s["night"]]
    notes = [f"{t}: got {s['decisions'].get(t)}, expected {d}"
             for t, d in want.items() if s["decisions"].get(t) != d]
    return {"night": s["night"], "right": len(want) - len(notes), "total": len(want),
            "failed_tests_right": sorted(s["failed"]) == sorted(want),
            "check_problems": len(s["problems"]), "cost_usd": s["cost_usd"], "notes": notes}


if __name__ == "__main__":
    g = grade(sys.argv[1])
    for n in g.pop("notes"):
        print(" ", n)
    print(json.dumps(g))
