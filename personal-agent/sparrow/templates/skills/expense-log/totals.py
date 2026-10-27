"""Total expenses.csv by category for one month: totals.py 2026-10"""

import collections
import csv
import sys

month = sys.argv[1]
totals = collections.Counter()
with open("expenses.csv", newline="") as f:
    for row in csv.DictReader(f):
        if row["date"].startswith(month):
            totals[row["category"]] += float(row["amount"])
for category, amount in totals.most_common():
    print(f"{category:<10} {amount:>9.2f}")
print(f"{'total':<10} {sum(totals.values()):>9.2f}")
