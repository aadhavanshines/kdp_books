"""ShopMate's read-only tools. They gather facts; the agent decides what matters."""
import csv
import json
import sqlite3
from collections import Counter
from datetime import date, timedelta

from claude_agent_sdk import ToolAnnotations, create_sdk_mcp_server, tool

from config import DATA, today

READ_ONLY = ToolAnnotations(readOnlyHint=True)


def text(value):
    return {"content": [{"type": "text", "text": value}]}


@tool("list_inbox", "List today's inbox: id, sender, date and subject of every email.", {},
      annotations=READ_ONLY)
async def list_inbox(args):
    rows = []
    for path in sorted((DATA / "inbox-today").glob("*.txt")):
        head = dict(line.split(": ", 1) for line in path.read_text().splitlines()[:3])
        rows.append(f"{path.stem} | {head['From']} | {head['Date']} | {head['Subject']}")
    return text("\n".join(rows))


@tool("read_email", "Read one email by id, for example '002'.", {"email_id": str},
      annotations=READ_ONLY)
async def read_email(args):
    path = DATA / "inbox-today" / f"{args['email_id']}.txt"
    return text(path.read_text() if path.exists() else "No such email.")


def sales_for(day):
    files = [DATA / "orders.csv", DATA / "orders-october.csv"]
    rows = [r for f in files for r in csv.DictReader(f.open()) if r["date"] == day]
    return len(rows), sum(int(r["amount"]) for r in rows), rows


@tool("sales_report", "Orders and revenue for yesterday, compared with the same weekday "
      "a week earlier, and yesterday's top products.", {}, annotations=READ_ONLY)
async def sales_report(args):
    yesterday = date.fromisoformat(today()) - timedelta(days=1)
    week_before = yesterday - timedelta(days=7)
    n, revenue, rows = sales_for(yesterday.isoformat())
    n0, revenue0, _ = sales_for(week_before.isoformat())
    change = round((revenue - revenue0) / revenue0 * 100, 1) if revenue0 else None
    top = Counter(r["product"] for r in rows).most_common(3)
    return text(f"Yesterday ({yesterday:%A %d %B %Y}): {n} orders, revenue Rs. {revenue}.\n"
                f"Same day last week ({week_before:%d %B}): {n0} orders, Rs. {revenue0}.\n"
                f"Change in revenue: {change}%.\n"
                f"Top products: {', '.join(f'{p} ({c})' for p, c in top)}.")


@tool("support_queue", "Refunds that aren't paid yet and open tickets for Amudha.", {},
      annotations=READ_ONLY)
async def support_queue(args):
    db = sqlite3.connect(DATA / "shop.db")
    refunds = db.execute("SELECT order_id, amount, reason, status, created FROM refunds "
                         "WHERE status != 'paid'").fetchall()
    paid = db.execute("SELECT order_id, amount FROM refunds WHERE status = 'paid'").fetchall()
    tickets = db.execute("SELECT order_id, urgency, summary, created FROM tickets "
                         "WHERE status = 'open'").fetchall()
    lines = ["Unpaid refunds:"] + [f"- {o}: Rs. {a}, {s}, since {c} ({r})"
                                   for o, a, r, s, c in refunds] or ["- none"]
    lines += ["Paid refunds:"] + [f"- {o}: Rs. {a}" for o, a in paid]
    lines += ["Open tickets:"] + [f"- {o} [{u}] since {c}: {s}" for o, u, s, c in tickets]
    return text("\n".join(lines))


@tool("read_notes", "Yesterday's follow-up list (ShopMate's memory between days).", {},
      annotations=READ_ONLY)
async def read_notes(args):
    path = DATA / "notes.json"
    if not path.exists():
        return text("No notes yet: this is the first run.")
    return text(path.read_text())


shop_server = create_sdk_mcp_server(name="shop", version="1.0.0", tools=[
    list_inbox, read_email, sales_report, support_queue, read_notes])
