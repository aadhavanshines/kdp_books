"""Recompute every answer with pandas and compare it with the agent's answers.

Usage:  python grade.py [output/answers.json]
"""
import json
import sys
from pathlib import Path

import pandas as pd

HERE = Path(__file__).parent


def truth():
    d = pd.read_csv(HERE / "data" / "orders.csv", parse_dates=["date"])
    month = d.groupby(d["date"].dt.strftime("%Y-%m"))["amount"].sum()
    early = d[d["date"] < "2026-01-01"]
    late = d[d["date"] >= "2026-07-01"]
    growth = ((late["area"].value_counts() / early["area"].value_counts() - 1) * 100).round(1)
    cakes_e, cakes_l = early[early["category"] == "cake"], late[late["category"] == "cake"]
    return {
        "monthly_revenue": month.to_dict(),
        "best_month": month.idxmax(),
        "top_products": d.groupby("product")["amount"].sum().nlargest(5).index.tolist(),
        "fastest_growing_area": growth.idxmax(),
        "area_growth_percent": growth.to_dict(),
        "eggless_share_percent": {
            "oct_dec_2025": round((cakes_e["eggless"] == "yes").mean() * 100, 1),
            "jul_sep_2026": round((cakes_l["eggless"] == "yes").mean() * 100, 1)},
        "rating_by_channel": d.groupby("channel")["rating"].mean().round(2).to_dict(),
    }


def close(a, b, tol):
    return all(abs(a.get(k, 1e9) - v) <= tol for k, v in b.items())


def grade(answers):
    t = truth()
    checks = {
        "monthly revenue (to the rupee)": close(answers["monthly_revenue"], t["monthly_revenue"], 1),
        "best month": answers["best_month"] == t["best_month"],
        "top 5 products in order": answers["top_products"] == t["top_products"],
        "fastest growing area": answers["fastest_growing_area"] == t["fastest_growing_area"],
        "area growth (within 0.5 points)": close(answers["area_growth_percent"],
                                                 t["area_growth_percent"], 0.5),
        "eggless share (within 0.5 points)": close(answers["eggless_share_percent"],
                                                   t["eggless_share_percent"], 0.5),
        "rating by channel (within 0.01)": close(answers["rating_by_channel"],
                                                 t["rating_by_channel"], 0.01),
        "three charts saved": all((HERE / "output" / f).exists() for f in
                                  ["monthly-revenue.png", "area-growth.png", "top-products.png"]),
        "report written": (HERE / "output" / "report.md").exists(),
    }
    return {"checks": checks, "passed": all(checks.values()), "truth": t}


if __name__ == "__main__":
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "output" / "answers.json"
    result = grade(json.loads(path.read_text()))
    print(json.dumps({k: v for k, v in result.items() if k != "truth"}, indent=2))
