"""Check the launch kit: prices follow the rule, the copy uses only those
prices, the Tamil caption exists, and the fact-checker gave a verdict.

Usage:  python grade.py
"""

import json
import math
import re
from pathlib import Path

HERE = Path(__file__).parent
KIT = HERE / "launch-kit"


def price(cost):
    """Lowest price with a 40% margin, rounded up to the next amount ending
    in 49 or 99."""
    n = math.ceil(cost / 0.6)
    while n % 100 not in (49, 99):
        n += 1
    return n


def expected_prices():
    data = json.loads((HERE / "data" / "hamper-costs.json").read_text())
    return {
        name: price(sum(data["items"][i] for i in items))
        for name, items in data["hampers"].items()
    }


def grade():
    problems = []
    files = {
        f: (KIT / f).read_text() if (KIT / f).exists() else ""
        for f in ["research.md", "pricing.md", "posts.md", "factcheck.md"]
    }
    for f, text in files.items():
        if not text:
            problems.append(f"{f} missing")
    prices = expected_prices()
    for name, p in prices.items():
        if (
            f"{p:,}" not in files["pricing.md"]
            and str(p) not in files["pricing.md"]
        ):
            problems.append(f"pricing.md doesn't show {name} at Rs. {p}")
    allowed = {str(p) for p in prices.values()}
    quoted = {
        m.replace(",", "")
        for m in re.findall(r"(?:Rs\.?|₹)\s?([\d,]+)", files["posts.md"])
    }
    hamper_prices = {q for q in quoted if 500 <= int(q) <= 3000}
    if hamper_prices - allowed:
        problems.append(
            "posts quote prices that aren't in the price list: "
            f"{hamper_prices - allowed}"
        )
    if not any("஀" <= ch <= "௿" for ch in files["posts.md"]):
        problems.append("no Tamil caption")
    if not re.search(r"VERDICT: (PASS|FAIL)", files["factcheck.md"]):
        problems.append("fact-check has no verdict line")
    return {
        "expected_prices": prices,
        "problems": problems,
        "passed": not problems,
    }


if __name__ == "__main__":
    print(json.dumps(grade(), indent=2, ensure_ascii=False))
