"""Grade an FMEA draft: does it cover the failure modes the engineer expects,
and are the severities in the expected range?

A row covers an expected failure mode when it belongs to one of the
expected functions and its failure mode contains one of the keywords.
Matches are a first pass; the engineer reviews them.
Run it with:  python grade.py output/dfmea-sonnet-run1.json
"""

import json
import re
import sys
from pathlib import Path

EXPECTED = Path(__file__).resolve().parent.parent / "wlc200" / "labels" / "fmea-expected.json"


STRUCTURE = EXPECTED.parent.parent / "fmea" / "structure.md"
FUNCTIONS = [line[3:].strip().rstrip(".").lower() for line in STRUCTURE.read_text().splitlines()
             if re.match(r"^\d\. ", line)]


def function_number(row):
    text = row["function"].lower()
    for n, f in enumerate(FUNCTIONS, 1):
        if f[:20] in text:
            return n
    m = re.match(r"\s*(\d)", text)
    return int(m.group(1)) if m else None


def matches(row, expected):
    text = row["failure_mode"].lower()
    return (function_number(row) in expected["functions"]
            and any(k in text for k in expected["keywords"]))


def grade(path, show=True):
    expected = json.loads(EXPECTED.read_text())
    rows = json.loads(Path(path).read_text())["rows"]
    covered, sev_out, lines = 0, 0, []
    for e in expected:
        hits = [r for r in rows if matches(r, e)]
        if hits:
            covered += 1
            lo, hi = e["severity_range"]
            sevs = sorted({r["severity"] for r in hits})
            if not any(lo <= s <= hi for s in sevs):
                sev_out += 1
                lines.append(f"{e['id']} {e['failure_mode']}: severity {sevs}, expected {lo}-{hi}")
            if show:
                lines.append(f"{e['id']} covered by: " + " / ".join(h["failure_mode"][:60] for h in hits[:2]))
        else:
            lines.append(f"{e['id']} MISSING: {e['failure_mode']}")
    return {"rows": len(rows), "expected": len(expected), "covered": covered,
            "severity_outside_range": sev_out,
            "actions": sum(r["action_needed"] for r in rows), "lines": lines}


if __name__ == "__main__":
    g = grade(sys.argv[1])
    for line in g.pop("lines"):
        print(" ", line)
    print(json.dumps(g))
