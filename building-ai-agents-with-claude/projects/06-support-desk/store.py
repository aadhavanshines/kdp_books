"""The bakery's order database (SQLite). The support agent can only reach it
through the tools in desk.py.

Run `python store.py` to create a fresh shop.db with sample orders.
"""

import sqlite3
from pathlib import Path

DB = Path(__file__).parent / "shop.db"

# The sample orders were delivered in early October 2026, so the demo runs
# at a fixed time: the morning after the last deliveries.
DEMO_NOW = "Wednesday 07 October 2026, 10:00"

# Each order: id, customer, phone, item, amount, status, ordered on,
# address, delivered at.
ORDERS = [
    (
        "CB-1170",
        "Lakshmi P",
        "9840011170",
        "Butterscotch cake 1 kg",
        950,
        "cancelled",
        "2026-09-24",
        "12 Lake View Road, Velachery",
        None,
    ),
    (
        "CB-1187",
        "Rahul N",
        "9840011187",
        "Black forest cake 2 kg",
        1800,
        "delivered",
        "2026-10-04",
        "5 Second Avenue, Anna Nagar",
        "2026-10-06 19:10",
    ),
    (
        "CB-1192",
        "Anita M",
        "9840011192",
        "Butterscotch cake 1 kg",
        800,
        "confirmed",
        "2026-10-03",
        "88 Kamarajar Salai, Adyar",
        None,
    ),
    (
        "CB-1195",
        "Priya R",
        "9840011195",
        "Chocolate truffle cake 1 kg",
        950,
        "baking",
        "2026-10-06",
        "Pickup at Anna Nagar kitchen",
        None,
    ),
    (
        "CB-1201",
        "Vikram I",
        "9840011201",
        "120 brownies (corporate)",
        7200,
        "delivered",
        "2026-10-02",
        "TechSoft Solutions, OMR",
        "2026-10-06 11:00",
    ),
    (
        "CB-1204",
        "Karthik S",
        "9840011204",
        "Walnut brownies (box of 6)",
        420,
        "delivered",
        "2026-10-04",
        "3 Temple Street, Mylapore",
        "2026-10-04 16:00",
    ),
]


def connect():
    db = sqlite3.connect(DB)
    db.row_factory = sqlite3.Row
    return db


def reset():
    """Create a fresh database with the sample orders."""
    DB.unlink(missing_ok=True)
    with connect() as db:
        db.executescript("""
            CREATE TABLE orders (id TEXT PRIMARY KEY, customer TEXT,
                phone TEXT, item TEXT, amount INTEGER, status TEXT,
                ordered_on TEXT, address TEXT, delivered_at TEXT);
            CREATE TABLE refunds (id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT, amount INTEGER, reason TEXT, status TEXT,
                created TEXT DEFAULT CURRENT_TIMESTAMP);
            CREATE TABLE tickets (id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT, urgency TEXT, summary TEXT,
                created TEXT DEFAULT CURRENT_TIMESTAMP);
        """)
        db.executemany(
            "INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?)", ORDERS
        )
        # The refund for the cancelled order was promised but never paid.
        db.execute(
            "INSERT INTO refunds (order_id, amount, reason, status) VALUES "
            "('CB-1170', 950, 'Order cancelled by customer', 'pending')"
        )


if __name__ == "__main__":
    reset()
    print(f"Created {DB.name} with {len(ORDERS)} orders")
