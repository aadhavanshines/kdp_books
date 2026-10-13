"""Grade an impact analysis against the engineer's answer.

Run it with:  python grade.py output/impact-sonnet-run1.json
"""

import json
import sys
from pathlib import Path

LABELS = Path(__file__).resolve().parent.parent / "wlc200" / "labels"
RERUN = {"update_and_rerun", "rerun"}


def grade(path):
    truth = json.loads((LABELS / "impact-truth.json").read_text())
    change_truth = json.loads((LABELS / "change-truth.json").read_text())
    out = json.loads(Path(path).read_text())
    a = out["answer"]
    actions = {t["id"]: t["action"] for t in a["tests"]}
    concerns = " ".join(c["test"] + " " + c["concern"] for c in a["concerns"])
    notes = []
    score = {"right": 0, "total": 0}

    def mark(ok, text):
        score["total"] += 1
        score["right"] += ok
        if not ok:
            notes.append(text)

    for tid in truth["update_and_rerun"]:
        mark(actions.get(tid) in RERUN, f"{tid}: must be rerun, got {actions.get(tid)}")
    for tid in truth["remove_deleted_trace"]:
        mark(actions.get(tid) in {"remove_trace"} | RERUN,
             f"{tid}: trace to a deleted requirement, got {actions.get(tid)}")
    for tid in truth["retire"]:
        if tid in truth.get("judgement", {}):
            ok = actions.get(tid) != "retire" or tid in concerns
            mark(ok, f"{tid}: retired silently, without a concern")
        else:
            mark(actions.get(tid) == "retire", f"{tid}: should be retired, got {actions.get(tid)}")
    for tid in truth["no_rerun_needed"]:
        mark(actions.get(tid) == "no_action", f"{tid}: editorial change, got {actions.get(tid)}")
    kinds = {c["id"]: c["kind"] for c in a["changes"]}
    for rid in change_truth["changed"]:
        mark(kinds.get(rid) == "meaning", f"{rid}: meaning changed, got {kinds.get(rid)}")
    for rid in change_truth["editorial"]:
        mark(kinds.get(rid) == "editorial", f"{rid}: editorial, got {kinds.get(rid)}")
    added = {x["id"]: x for x in a["added"]}
    for rid in truth["needs_new_test"]:
        mark(rid in added, f"{rid}: no test planned")
    for rid, tid in truth["new_or_extend"].items():
        mark(rid in added, f"{rid}: not handled")
    extra = sorted(t for t, act in actions.items() if act in RERUN
                   and t not in truth["update_and_rerun"] + truth["remove_deleted_trace"])
    return {"right": score["right"], "total": score["total"],
            "extra_reruns": extra, "concerns": len(a["concerns"]),
            "grounding_flags": len(out["problems"]), "notes": notes}


if __name__ == "__main__":
    g = grade(sys.argv[1])
    for n in g.pop("notes"):
        print(" ", n)
    print(json.dumps(g))
