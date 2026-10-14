"""Grade the database agent. The right answers come from SQL, not from a
person, so they stay right if the database changes.
Run it with:  python grade.py output/answers-sonnet-run1.json
"""

import json
import sqlite3
import sys
from collections import Counter
from pathlib import Path

DB = Path(__file__).resolve().parent.parent / "wlc200" / "testdb" / "wlc200.db"


def truth():
    db = sqlite3.connect(DB)
    q = lambda sql, *a: [r[0] for r in db.execute(sql, a)]  # noqa: E731
    ap05 = db.execute("SELECT night, verdict FROM results WHERE test_id='TC-AP-05' ORDER BY night").fetchall()
    first_pass = next(n for (n, v), (_, prev) in zip(ap05[1:], ap05) if v == "PASS" and prev == "FAIL")
    tests = db.execute("SELECT id, requirements FROM tests").fetchall()
    comps = Counter(q("SELECT component FROM defects WHERE status='open'"))
    return {
        "d01": set(q("SELECT test_id FROM results WHERE night='2026-10-06' AND verdict='FAIL'")),
        "d02": {first_pass},
        "d03": set(q("SELECT id FROM defects WHERE status='open' AND severity='S1'")),
        "d04": {t for t, reqs in tests if "WLC-014" in [r.strip() for r in reqs.split(",")]},
        "d05": {str(len(q("SELECT night FROM results WHERE test_id='TC-TH-03' AND verdict='FAIL'")))},
        "d06": {f"{q('SELECT value FROM results WHERE test_id=? AND night=?', 'TC-CAN-01', '2026-10-04')[0]:g}"},
        "d07": set(q("SELECT software FROM nights WHERE night='2026-10-03'")),
        "d08": set(q("SELECT id FROM defects WHERE status='open' AND test_id IS NULL")),
        # a tie is possible: every component with the highest count is right
        "d09": {c for c, n in comps.items() if n == max(comps.values())},
        "d10": set(),          # the database has no owners: the agent must say so
    }


def normal(item):
    item = item.strip().replace(" ms", "")
    try:
        return f"{float(item):g}"
    except ValueError:
        return item


def grade(path):
    want = truth()
    answers = json.loads(Path(path).read_text())
    right, notes = 0, []
    for a in answers:
        got = {normal(i) for i in a["answer"]["items"]}
        ok = got == {normal(i) for i in want[a["id"]]}
        right += ok
        if not ok:
            notes.append(f"{a['id']}: got {sorted(got)}, expected {sorted(want[a['id']])}")
    return {"right": right, "total": len(answers),
            "cost_usd": round(sum(a["cost_usd"] for a in answers), 4), "notes": notes}


if __name__ == "__main__":
    if len(sys.argv) == 1:
        print({k: sorted(v) for k, v in truth().items()})
    else:
        g = grade(sys.argv[1])
        for n in g.pop("notes"):
            print(" ", n)
        print(json.dumps(g))
