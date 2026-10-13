"""Grade a review against the engineer's labels.

Run it with:  python grade.py output/review-WLC-200-SRS-v1.2.json
"""

import json
import sys
from pathlib import Path

LABEL_DIR = Path(__file__).resolve().parent.parent / "wlc200" / "labels"
LABELS = LABEL_DIR / "review-labels.json"
ADJUDICATION = LABEL_DIR / "review-adjudication.json"


def accepted(label):
    """Every issue type the engineer would accept for this requirement."""
    return {label["issue"], *label.get("also", [])}


def load_labels(adjudicated=False):
    labels = json.loads(LABELS.read_text())
    # A duplicate pair may be reported on either requirement
    for rid, label in list(labels.items()):
        if label["issue"] == "duplicate":
            other = labels[label["with"]]
            other.setdefault("also", []).append("duplicate")
            other.setdefault("with", rid)
    if adjudicated:
        for rid, extra in json.loads(ADJUDICATION.read_text()).items():
            if rid.startswith("WLC-"):
                labels[rid].setdefault("also", []).extend(extra["accept"])
                if "with" in extra:
                    labels[rid].setdefault("with", extra["with"])
    return labels


def grade(review_path, adjudicated=False):
    labels = load_labels(adjudicated)
    findings = {f["id"]: f for f in json.loads(Path(review_path).read_text())["answer"]["findings"]}
    tp = fp = fn = tn = right_type = 0
    lines = []
    for rid, label in labels.items():
        f = findings.get(rid, {"issue": "missing", "related": []})
        ok_allowed = "ok" in accepted(label)
        should_flag = label["issue"] != "ok"
        flagged = f["issue"] != "ok"
        if flagged and f["issue"] in accepted(label):
            if should_flag:
                tp += 1
            else:
                tn += 1          # borderline: flagging it is also accepted
            type_ok = True
            if label.get("with") and label["with"] not in f["related"]:
                type_ok = False
                lines.append(f"{rid}: right type, wrong partner {f['related']} (expected {label['with']})")
            if should_flag:
                right_type += type_ok
        elif flagged and should_flag:
            tp += 1
            lines.append(f"{rid}: flagged as {f['issue']}, engineer said {label['issue']}")
        elif flagged:
            fp += 1
            lines.append(f"{rid}: flagged as {f['issue']} ({f.get('quote', '')!r}), engineer said ok")
        elif should_flag and not ok_allowed:
            fn += 1
            lines.append(f"{rid}: missed ({label['issue']})")
        else:
            tn += 1
    precision = tp / (tp + fp) if tp + fp else 0
    recall = tp / (tp + fn) if tp + fn else 0
    flagged_true = sum(1 for l in labels.values() if l["issue"] != "ok")
    return {
        "true_positives": tp, "false_positives": fp, "missed": fn, "true_negatives": tn,
        "precision": round(precision, 2), "recall": round(recall, 2),
        "right_type": right_type, "labelled_issues": flagged_true,
        "details": lines,
    }


if __name__ == "__main__":
    g = grade(sys.argv[1], adjudicated="--adjudicated" in sys.argv)
    for line in g.pop("details"):
        print(" ", line)
    print(json.dumps(g))
