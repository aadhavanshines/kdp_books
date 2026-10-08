"""Put the shop's data into the state of a given demo day.

Day 1 (Wednesday 7 October 2026) is the state used throughout the book. Day 2 is the
next morning: butter has arrived, Lakshmi's refund was paid, and one new email came in.
Usage:  python setup_demo.py 1   (or 2)
"""
import csv
import json
import random
import shutil
import sqlite3
import sys
from datetime import date, timedelta
from pathlib import Path

HERE = Path(__file__).parent
DATA = HERE / "data"
DB = DATA / "shop.db"

ORDERS = [  # id, customer, phone, item, amount, status, ordered on, address, delivered at
    ("CB-1170", "Lakshmi P", "9840011170", "Butterscotch cake 1 kg", 950, "cancelled",
     "2026-09-24", "12 Lake View Road, Velachery", None),
    ("CB-1187", "Rahul N", "9840011187", "Black forest cake 2 kg", 1800, "delivered",
     "2026-10-04", "5 Second Avenue, Anna Nagar", "2026-10-06 19:10"),
    ("CB-1201", "Vikram I", "9840011201", "120 brownies (corporate)", 7200, "delivered",
     "2026-10-02", "TechSoft Solutions, OMR", "2026-10-06 11:00"),
    ("CB-1204", "Karthik S", "9840011204", "Walnut brownies (box of 6)", 420, "delivered",
     "2026-10-04", "3 Temple Street, Mylapore", "2026-10-04 16:00"),
]


def october_orders():
    """A week of new orders, 1 to 7 October 2026, in the same format as orders.csv."""
    rnd = random.Random(7)
    products = [("Chocolate truffle cake", "cake", 950), ("Rasmalai cake", "cake", 1150),
                ("Black forest cake", "cake", 850), ("Red velvet cake", "cake", 1050),
                ("Walnut brownies (box of 6)", "brownies", 420),
                ("Assorted cupcakes (6)", "cupcakes", 450), ("Festive hamper", "hamper", 1600)]
    areas = ["Anna Nagar", "Velachery", "OMR", "Adyar", "T. Nagar", "Other"]
    rows, n = [], 0
    for i in range(7):
        d = date(2026, 10, 1) + timedelta(days=i)
        for _ in range(rnd.randint(9, 15) + (5 if d.weekday() >= 5 else 0)):
            n += 1
            name, cat, price = rnd.choices(products, [24, 12, 12, 10, 12, 10, 6])[0]
            qty = rnd.choice([0.5, 1, 1, 1.5, 2]) if cat == "cake" else rnd.choice([1, 1, 2])
            rows.append([f"CB-2{n:04d}", d.isoformat(), rnd.choices(areas, [30, 18, 12, 12, 10, 8])[0],
                         name, cat, "yes" if rnd.random() < 0.35 else "no", qty,
                         round(price * qty), 120, "Instagram", 5])
    with (DATA / "orders.csv").open() as f:
        header = next(csv.reader(f))
    with (DATA / "orders-october.csv").open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)


def setup(day):
    shutil.copy(DATA / "stock.start.json", DATA / "stock.json")
    DB.unlink(missing_ok=True)
    db = sqlite3.connect(DB)
    db.executescript("""
        CREATE TABLE orders (id TEXT PRIMARY KEY, customer TEXT, phone TEXT, item TEXT,
            amount INTEGER, status TEXT, ordered_on TEXT, address TEXT, delivered_at TEXT);
        CREATE TABLE refunds (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT,
            amount INTEGER, reason TEXT, status TEXT, created TEXT);
        CREATE TABLE tickets (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT,
            urgency TEXT, summary TEXT, status TEXT, created TEXT);
    """)
    db.executemany("INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?)", ORDERS)
    db.executemany("INSERT INTO refunds (order_id, amount, reason, status, created) VALUES "
                   "(?,?,?,?,?)", [
                       ("CB-1170", 950, "Order cancelled by customer", "pending", "2026-09-26"),
                       ("CB-1201", 7200, "Brownies stale (corporate order)",
                        "awaiting owner approval", "2026-10-07"),
                   ])
    db.execute("INSERT INTO tickets (order_id, urgency, summary, status, created) VALUES "
               "('CB-1204', 'urgent', 'Allergic reaction after walnut brownies; customer "
               "wants the full ingredient list and a call today.', 'open', '2026-10-06')")
    shutil.rmtree(DATA / "inbox-today", ignore_errors=True)
    shutil.copytree(DATA / "inbox", DATA / "inbox-today")
    today = "2026-10-07"
    if day == 2:
        today = "2026-10-08"
        db.execute("UPDATE refunds SET status = 'paid' WHERE order_id = 'CB-1170'")
        stock = json.loads((DATA / "stock.json").read_text())
        stock["butter"]["qty"] = 14
        (DATA / "stock.json").write_text(json.dumps(stock, indent=2))
        (DATA / "inbox-today" / "025.txt").write_text(
            "From: lakshmi.p@gmail.com\nDate: Thu, 8 Oct 2026 07:55\nSubject: Refund received, "
            "thank you\n\nHi, the Rs. 950 refund reached my account last night. Thank you for "
            "sorting it out.\n\nLakshmi\n")
    db.commit()
    (DATA / "today.txt").write_text(today + "\n")
    print(f"Demo day {day} ready: today is {today}")


if __name__ == "__main__":
    october_orders()
    setup(int(sys.argv[1]) if len(sys.argv) > 1 else 1)
