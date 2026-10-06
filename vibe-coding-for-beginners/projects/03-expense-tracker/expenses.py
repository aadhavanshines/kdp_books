#!/usr/bin/env python3
"""A small command-line expense tracker. Data lives in expenses.csv next to this script."""

import argparse
import csv
import sys
from collections import defaultdict
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent / "expenses.csv"
FIELDS = ["date", "amount", "category", "description"]


class ExpenseError(Exception):
    """A problem with user input or the data file, shown without a traceback."""


def parse_amount(text):
    try:
        amount = Decimal(text)
    except InvalidOperation:
        raise ExpenseError(f"'{text}' is not a valid amount. Use a number like 12.50.")
    if not amount.is_finite():
        raise ExpenseError(f"'{text}' is not a valid amount. Use a number like 12.50.")
    if amount <= 0:
        raise ExpenseError("Amount must be greater than zero.")
    try:
        rounded = amount.quantize(Decimal("0.01"))
    except InvalidOperation:
        raise ExpenseError(f"'{text}' is too large an amount.")
    if amount != rounded:
        raise ExpenseError("Amount can have at most 2 decimal places.")
    return rounded


def parse_date(text):
    try:
        return datetime.strptime(text, "%Y-%m-%d").date().isoformat()
    except ValueError:
        raise ExpenseError(f"'{text}' is not a valid date. Use the format YYYY-MM-DD, e.g. 2026-10-01.")


def parse_month(text):
    try:
        return datetime.strptime(text, "%Y-%m").strftime("%Y-%m")
    except ValueError:
        raise ExpenseError(f"'{text}' is not a valid month. Use the format YYYY-MM, e.g. 2026-10.")


def load_expenses(path):
    if not path.exists():
        return []
    try:
        with open(path, newline="", encoding="utf-8") as f:
            rows = []
            for n, row in enumerate(csv.DictReader(f), start=2):
                try:
                    rows.append({
                        "date": row["date"],
                        "amount": Decimal(row["amount"]),
                        "category": row["category"],
                        "description": row["description"] or "",
                    })
                except (KeyError, InvalidOperation, TypeError):
                    raise ExpenseError(f"{path.name} line {n} is malformed. Fix or remove it and try again.")
            return rows
    except OSError as e:
        raise ExpenseError(f"Could not read {path}: {e.strerror}")


def save_expense(path, expense):
    try:
        is_new = not path.exists() or path.stat().st_size == 0
        with open(path, "a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=FIELDS)
            if is_new:
                writer.writeheader()
            writer.writerow(expense)
    except OSError as e:
        raise ExpenseError(f"Could not write to {path}: {e.strerror}")


def cmd_add(args, path):
    category = args.category.strip().lower()
    if not category:
        raise ExpenseError("Category cannot be empty.")
    amount = parse_amount(args.amount)
    when = parse_date(args.date) if args.date else date.today().isoformat()
    save_expense(path, {
        "date": when,
        "amount": str(amount),
        "category": category,
        "description": (args.description or "").strip(),
    })
    print(f"Added {amount:.2f} to {category} on {when}.")


def cmd_list(args, path):
    expenses = sorted(load_expenses(path), key=lambda e: e["date"])
    if not expenses:
        print("No expenses yet.")
        return
    width = max(len(e["category"]) for e in expenses + [{"category": "category"}])
    print(f"{'date':<10}  {'amount':>10}  {'category':<{width}}  description")
    for e in expenses:
        print(f"{e['date']:<10}  {e['amount']:>10.2f}  {e['category']:<{width}}  {e['description']}")


def cmd_summary(args, path):
    month = parse_month(args.month) if args.month else None
    expenses = load_expenses(path)
    if month:
        expenses = [e for e in expenses if e["date"].startswith(month)]
    if not expenses:
        print(f"No expenses for {month}." if month else "No expenses yet.")
        return
    totals = defaultdict(Decimal)
    for e in expenses:
        totals[e["category"]] += e["amount"]
    ranked = sorted(totals.items(), key=lambda kv: (-kv[1], kv[0]))
    width = max(len(c) for c, _ in ranked + [("TOTAL", 0)])
    if month:
        print(f"Summary for {month}")
    for category, total in ranked:
        print(f"{category:<{width}}  {total:>10.2f}")
    print("-" * (width + 12))
    print(f"{'TOTAL':<{width}}  {sum(totals.values()):>10.2f}")


def build_parser():
    parser = argparse.ArgumentParser(prog="expenses.py", description="Track your expenses.")
    sub = parser.add_subparsers(dest="command", required=True)

    add = sub.add_parser("add", help="record an expense")
    add.add_argument("amount", help="amount spent, e.g. 12.50")
    add.add_argument("category", help="category, e.g. food")
    add.add_argument("description", nargs="?", default="", help="optional description")
    add.add_argument("--date", help="date as YYYY-MM-DD (default: today)")
    add.set_defaults(func=cmd_add)

    ls = sub.add_parser("list", help="list all expenses")
    ls.set_defaults(func=cmd_list)

    summ = sub.add_parser("summary", help="totals per category")
    summ.add_argument("--month", help="only include this month, as YYYY-MM")
    summ.set_defaults(func=cmd_summary)
    return parser


def main(argv=None, path=None):
    args = build_parser().parse_args(argv)
    try:
        args.func(args, Path(path) if path else DATA_FILE)
    except ExpenseError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
