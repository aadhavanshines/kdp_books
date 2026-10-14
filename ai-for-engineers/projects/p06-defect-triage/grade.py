"""Grade a triage against the engineer's labels, with confusion matrices.

Run it with:  python grade.py output/triage-sonnet-run1.json
"""

import json
import sys
from collections import Counter
from pathlib import Path

LABELS = Path(__file__).resolve().parent.parent / "wlc200" / "labels" / "defect-labels.json"


def matrix(pairs, classes):
    counts = Counter(pairs)
    width = max(max(len(c) for c in classes), len("engineer \\ tool")) + 1
    lines = ["engineer \\ tool".ljust(width) + " ".join(c[:5].rjust(5) for c in classes)]
    for a in classes:
        lines.append(a.ljust(width) + " ".join(
            (str(counts[(a, b)]) if counts[(a, b)] else ".").rjust(5) for b in classes))
    return "\n".join(lines)


def grade(path, show=True):
    labels = json.loads(LABELS.read_text())
    tri = {t["id"]: t for t in json.loads(Path(path).read_text())["answer"]["triage"]}
    comp = [(labels[i]["component"], tri[i]["component"]) for i in labels]
    sev = [(labels[i]["severity"], tri[i]["severity"]) for i in labels]
    true_dups = {(i, l["duplicate_of"]) for i, l in labels.items() if l["duplicate_of"]}
    tool_dups = {(i, t["duplicate_of"]) for i, t in tri.items() if t["duplicate_of"]}
    found = true_dups & tool_dups
    out = {
        "component_right": sum(a == b for a, b in comp),
        "severity_right": sum(a == b for a, b in sev),
        "severity_off_by_more_than_one": sum(abs(int(a[1]) - int(b[1])) > 1 for a, b in sev),
        "s1_missed": sorted(i for i in labels if labels[i]["severity"] == "S1" and tri[i]["severity"] != "S1"),
        "duplicates_found": len(found), "duplicates_true": len(true_dups),
        "duplicates_wrong": sorted(f"{a}->{b}" for a, b in tool_dups - true_dups),
        "duplicates_missed": sorted(f"{a}->{b}" for a, b in true_dups - tool_dups),
        "total": len(labels),
    }
    if show:
        print(matrix(sev, ["S1", "S2", "S3", "S4"]))
        print()
        classes = sorted({c for p in comp for c in p})
        print(matrix(comp, classes))
        for i in labels:
            if labels[i]["component"] != tri[i]["component"] or labels[i]["severity"] != tri[i]["severity"]:
                print(f"  {i}: engineer {labels[i]['component']}/{labels[i]['severity']}, "
                      f"tool {tri[i]['component']}/{tri[i]['severity']}: {tri[i]['reason'][:110]}")
    return out


if __name__ == "__main__":
    print(json.dumps(grade(sys.argv[1])))
