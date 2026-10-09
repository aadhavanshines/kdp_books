"""The rules that live in code, tested directly: no model involved, so these are exact."""

import asyncio
import json
import shutil
import sqlite3

import pytest

from conftest import PROJECTS, load


def run(coro):
    return asyncio.run(coro)


@pytest.fixture
def desk(tmp_path, monkeypatch):
    store = load("06-support-desk", "store")
    monkeypatch.setattr(store, "DB", tmp_path / "shop.db")
    store.reset()
    mod = load("06-support-desk", "desk")
    monkeypatch.setattr(mod, "connect", store.connect)
    d = mod.Desk(now="Wednesday 07 October 2026, 10:00")
    tools = {t.name: t.handler for t in d.tools()}
    return d, tools, store


def refunds(store):
    return (
        sqlite3.connect(store.DB)
        .execute(
            "SELECT order_id, amount, status FROM refunds WHERE id > 1"
        )
        .fetchall()
    )


def test_wrong_phone_reveals_nothing(desk):
    d, t, store = desk
    out = run(
        t["find_order"]({"order_id": "CB-1187", "phone_last4": "0000"})
    )
    assert out.get("isError") and "Rahul" not in out["content"][0]["text"]


def test_refund_needs_verification_first(desk):
    d, t, store = desk
    out = run(
        t["issue_refund"](
            {"order_id": "CB-1187", "amount": 1800, "reason": "x"}
        )
    )
    assert out.get("isError") and refunds(store) == []


def test_refund_capped_at_order_amount(desk):
    d, t, store = desk
    run(t["find_order"]({"order_id": "CB-1187", "phone_last4": "1187"}))
    out = run(
        t["issue_refund"](
            {"order_id": "CB-1187", "amount": 50000, "reason": "x"}
        )
    )
    assert out.get("isError") and refunds(store) == []


def test_second_refund_refused(desk):
    d, t, store = desk
    run(t["find_order"]({"order_id": "CB-1187", "phone_last4": "1187"}))
    run(
        t["issue_refund"](
            {"order_id": "CB-1187", "amount": 1800, "reason": "damaged"}
        )
    )
    out = run(
        t["issue_refund"](
            {"order_id": "CB-1187", "amount": 100, "reason": "again"}
        )
    )
    assert out.get("isError") and refunds(store) == [
        ("CB-1187", 1800, "paid")
    ]


def test_big_refund_waits_for_owner(desk):
    d, t, store = desk
    run(t["find_order"]({"order_id": "CB-1201", "phone_last4": "1201"}))
    run(
        t["issue_refund"](
            {"order_id": "CB-1201", "amount": 7200, "reason": "stale"}
        )
    )
    assert refunds(store) == [("CB-1201", 7200, "awaiting owner approval")]


def test_pending_refund_counts_against_the_limit(desk):
    d, t, store = desk
    run(t["find_order"]({"order_id": "CB-1170", "phone_last4": "1170"}))
    out = run(
        t["issue_refund"](
            {"order_id": "CB-1170", "amount": 950, "reason": "again"}
        )
    )
    assert out.get("isError")


def test_receipt_checks_find_mismatch_and_duplicate():
    scanner = load("03-receipt-scanner", "agent")
    base = {
        "shop": "A",
        "bill_no": "1",
        "date": "01/10/2026",
        "gstin": "",
        "category": "food",
        "items": [{"name": "x", "qty": 1, "rate": 100, "amount": 100}],
        "subtotal": 100,
        "gst_amount": 5,
        "total": 105,
    }
    rs = scanner.check(
        [
            dict(base, file="a.jpg"),
            dict(base, file="b.jpg"),
            dict(base, file="c.jpg", bill_no="2", total=205),
        ]
    )
    assert rs[0]["problems"] == []
    assert "duplicate of a.jpg" in rs[1]["problems"][0]
    assert "total should be 105.00" in rs[2]["problems"][0]


def test_quote_checker_catches_made_up_quotes():
    analyst = load("04-research-analyst", "agent")
    result = analyst.verify(
        {
            "findings": [
                {
                    "claim": "",
                    "file": "rent-quotes.md",
                    "quote": "Rent: Rs. 38,000 per month",
                },
                {
                    "claim": "",
                    "file": "rent-quotes.md",
                    "quote": "Rent: Rs. 35,000 per month",
                },
                {
                    "claim": "",
                    "file": "no-such-file.md",
                    "quote": "anything",
                },
            ]
        }
    )
    assert [f["verified"] for f in result["findings"]] == [
        True,
        False,
        False,
    ]


def test_hamper_price_rule():
    grade = load("08-launch-team", "grade")
    assert (
        grade.price(425) == 749
        and grade.price(785) == 1349
        and grade.price(805) == 1349
    )
    assert (
        grade.price(600) == 1049
    )  # 1000 exactly -> next price ending in 49


def test_stock_server_over_real_mcp(tmp_path):
    """Start the MCP server as a separate process and talk to it like a
    client would."""
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client

    folder = tmp_path / "srv"
    shutil.copytree(
        PROJECTS / "07-stock-mcp",
        folder,
        ignore=shutil.ignore_patterns("orders", "evals", "*.log"),
    )
    shutil.copy(folder / "stock.start.json", folder / "stock.json")

    async def go():
        params = StdioServerParameters(
            command="python3", args=[str(folder / "stock_server.py")]
        )
        async with stdio_client(params) as (r, w), ClientSession(r, w) as s:
            await s.initialize()
            names = sorted(t.name for t in (await s.list_tools()).tools)
            listing = (await s.call_tool("list_stock", {})).content[0].text
            bad = await s.call_tool(
                "record_usage", {"ingredient": "butter", "amount": 99}
            )
            ok = await s.call_tool(
                "record_usage", {"ingredient": "butter", "amount": 1}
            )
            rules = (
                (await s.read_resource("stock://reorder-rules"))
                .contents[0]
                .text
            )
            return names, listing, bad, ok, rules

    names, listing, bad, ok, rules = run(go())
    assert names == ["draft_purchase_order", "list_stock", "record_usage"]
    assert "butter: 4 kg" in listing and "LOW" in listing
    assert bad.isError and not ok.isError
    assert (
        json.loads((folder / "stock.json").read_text())["butter"]["qty"]
        == 3
    )
    assert "Rs. 25,000" in rules


def test_watch_helper_is_identical_everywhere():
    copies = {p.read_text() for p in PROJECTS.glob("*/watch.py")}
    assert len(copies) == 1
