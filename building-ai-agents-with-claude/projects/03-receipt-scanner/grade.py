"""Compare the scanner's receipts.json with the correct answers in
evals/truth.json.

Usage:  python grade.py [receipts.json]
"""

import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
FIELDS = [
    "shop",
    "bill_no",
    "date",
    "gstin",
    "subtotal",
    "gst_amount",
    "total",
]


def same(a, b):
    if isinstance(b, (int, float)):
        return isinstance(a, (int, float)) and abs(a - b) < 0.01
    return str(a).strip().lower() == str(b).strip().lower()


def grade(receipts, truth):
    got = {r["file"]: r for r in receipts}
    fields_ok = fields_total = 0
    wrong = []
    flags_ok = 0
    for name, t in truth.items():
        r = got.get(name)
        if r is None:
            wrong.append(f"{name}: missing")
            continue
        for f in FIELDS:
            fields_total += 1
            if same(r[f], t[f]):
                fields_ok += 1
            else:
                wrong.append(f"{name} {f}: got {r[f]!r}, expected {t[f]!r}")
        if len(r["items"]) != t["items"]:
            wrong.append(
                f"{name}: {len(r['items'])} items, expected {t['items']}"
            )
        flagged = bool(r.get("problems"))
        expected_flag = t["should_flag"] is not None
        flags_ok += flagged == expected_flag
        if flagged != expected_flag:
            wrong.append(
                f"{name}: flagged={flagged}, expected {expected_flag}"
            )
    return {
        "fields": f"{fields_ok}/{fields_total}",
        "flags": f"{flags_ok}/{len(truth)}",
        "passed": not wrong,
        "wrong": wrong,
    }


if __name__ == "__main__":
    path = (
        Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "receipts.json"
    )
    truth = json.loads((HERE / "evals" / "truth.json").read_text())
    print(json.dumps(grade(json.loads(path.read_text()), truth), indent=2))
