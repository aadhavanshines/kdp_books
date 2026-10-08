"""An MCP server for the bakery's ingredient stock.

Any MCP client can use it: an Agent SDK agent, Claude Code, or Claude
Desktop. It runs as a separate program and talks over standard input and
output (stdio).
Test it by itself with:  python stock_server.py --check
"""

import json
import sys
from datetime import date
from pathlib import Path

from mcp.server.fastmcp import FastMCP

STOCK = Path(__file__).parent / "data" / "stock.json"
LOG = Path(__file__).parent / "data" / "usage-log.jsonl"

mcp = FastMCP(
    "bakery-stock", instructions="Ingredient stock for Amudha's Home Bakes."
)


def load():
    return json.loads(STOCK.read_text())


def save(stock):
    STOCK.write_text(json.dumps(stock, indent=2))


@mcp.tool()
def list_stock() -> str:
    """List every ingredient with the amount in stock, its unit, how much
    is used in a normal week, the reorder level, the supplier and the price
    per unit."""
    rows = []
    for name, s in load().items():
        flag = "  LOW" if s["qty"] <= s["reorder_at"] else ""
        rows.append(
            f"{name}: {s['qty']} {s['unit']} (uses {s['weekly_use']}/week, "
            f"reorder at {s['reorder_at']}, "
            f"{s['supplier']}, Rs. {s['price']}/{s['unit']}){flag}"
        )
    return "\n".join(rows)


@mcp.tool()
def record_usage(ingredient: str, amount: float, note: str = "") -> str:
    """Subtract an amount used in baking from the stock. The amount is in
    the ingredient's unit."""
    stock = load()
    if ingredient not in stock:
        raise ValueError(
            f"Unknown ingredient '{ingredient}'. Known: {', '.join(stock)}"
        )
    if amount <= 0 or amount > stock[ingredient]["qty"]:
        raise ValueError(
            f"Amount must be between 0 and {stock[ingredient]['qty']}."
        )
    stock[ingredient]["qty"] = round(stock[ingredient]["qty"] - amount, 3)
    save(stock)
    with LOG.open("a") as f:
        f.write(
            json.dumps(
                {
                    "date": date.today().isoformat(),
                    "ingredient": ingredient,
                    "amount": amount,
                    "note": note,
                }
            )
            + "\n"
        )
    left = stock[ingredient]
    return f"Recorded. {ingredient} left: {left['qty']} {left['unit']}."


@mcp.tool()
def draft_purchase_order(supplier: str, items: list[dict]) -> str:
    """Write a purchase order for one supplier as a file for Amudha to check
    and send. items: a list like [{"ingredient": "butter", "qty": 10}].
    Returns the file name.
    """
    stock = load()
    header = f"Purchase order for {supplier}"
    lines, total = [header, f"Date: {date.today():%d %B %Y}", ""], 0
    for item in items:
        name = item["ingredient"]
        s = stock.get(name)
        # Say exactly what's wrong, so the agent can fix its next call.
        if s is None:
            known = ", ".join(stock)
            raise ValueError(f"Unknown ingredient '{name}'. Known: {known}")
        if s["supplier"] != supplier:
            raise ValueError(
                f"{name} comes from {s['supplier']}, not {supplier}."
            )
        cost = round(s["price"] * item["qty"], 2)
        total += cost
        lines.append(
            f"- {item['ingredient']}: {item['qty']} {s['unit']} x Rs. "
            f"{s['price']} = Rs. {cost:,.2f}"
        )
    lines += ["", f"Total: Rs. {total:,.2f}", "", "Status: DRAFT, not sent"]
    out = (
        Path(__file__).parent
        / "data"
        / "purchase-orders"
        / f"po-{supplier.lower().replace(' ', '-')}.txt"
    )
    out.parent.mkdir(exist_ok=True)
    out.write_text("\n".join(lines) + "\n")
    saved = f"purchase-orders/{out.name}"
    return f"Draft saved as {saved}. Total Rs. {total:,.2f}."


@mcp.resource("stock://reorder-rules")
def reorder_rules() -> str:
    """How Amudha likes to reorder."""
    return (
        "Order enough to last two weeks of normal baking. Butter and cream "
        "go to Fresh Dairy Supplies; flour and sugar to Sundar Traders; "
        "cocoa and boxes to Green Leaf Bakery Supplies. Never order more "
        "than Rs. 25,000 from one supplier in one order without asking "
        "Amudha."
    )


if __name__ == "__main__":
    if "--check" in sys.argv:
        print(list_stock())
    else:
        mcp.run()  # stdio
