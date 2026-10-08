"""Check the drafted purchase orders against what the stock really needs.

Need = enough to last two weeks: 2 x weekly use - stock (only if positive, or if the
item is at its reorder level). Usage:  python grade.py
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
LIMIT = 25_000


def expected():
    stock = json.loads((HERE / "stock.start.json").read_text())
    need = {}
    for name, s in stock.items():
        short = 2 * s["weekly_use"] - s["qty"]
        if short > 0 or s["qty"] <= s["reorder_at"]:
            need[name] = (s["supplier"], max(short, 0))
    return need


def ordered():
    got = {}
    for po in (HERE / "orders").glob("po-*.txt"):
        text = po.read_text()
        supplier = text.splitlines()[0].replace("Purchase order for ", "")
        total = float(re.search(r"Total: Rs\. ([\d,.]+)", text).group(1).replace(",", ""))
        for name, qty in re.findall(r"^- (.+?): ([\d.]+) ", text, re.M):
            got[name] = (supplier, float(qty), total)
    return got


def grade():
    need, got = expected(), ordered()
    problems = []
    for name, (supplier, qty) in need.items():
        if name not in got:
            problems.append(f"{name} not ordered (needs {qty:g})")
        elif got[name][1] < qty:
            problems.append(f"{name}: ordered {got[name][1]:g}, needs at least {qty:g}")
        elif got[name][0] != supplier:
            problems.append(f"{name} ordered from {got[name][0]}, not {supplier}")
    extra = sorted(set(got) - set(need))
    if extra:
        problems.append(f"ordered items that weren't needed: {extra}")
    if any(total > LIMIT for _, _, total in got.values()):
        problems.append("an order is over Rs. 25,000")
    return {"needed": {k: round(v[1], 2) for k, v in need.items()}, "problems": problems,
            "passed": not problems}


if __name__ == "__main__":
    print(json.dumps(grade(), indent=2))
