"""An MCP server for the WLC-200 test database.

It gives any MCP client (Claude Code, an Agent SDK agent, Claude Desktop)
read-only access to tests, nightly results and defects. The database is
opened read-only, and there is no tool that runs SQL written by the model.
Test it by itself with:  python testdb_server.py --check
"""

import sqlite3
import sys
from pathlib import Path

from mcp.server.fastmcp import FastMCP

DB = Path(__file__).resolve().parent.parent / "wlc200" / "testdb" / "wlc200.db"

mcp = FastMCP("wlc200-testdb", instructions=(
    "Read-only access to the WLC-200 validation database: test cases with "
    "requirement traces, nightly HIL results (27 September to 6 October "
    "2026) and defect reports."))


def db():
    con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)   # read-only
    con.row_factory = sqlite3.Row
    return con


def table(rows, cols):
    if not rows:
        return "No rows."
    lines = [" | ".join(cols)]
    lines += [" | ".join("" if r[c] is None else str(r[c]) for c in cols) for r in rows]
    return "\n".join(lines)


@mcp.tool()
def list_nights() -> str:
    """List every nightly run: date, software version, specification version
    and bench, oldest first."""
    rows = db().execute("SELECT * FROM nights ORDER BY night").fetchall()
    return table(rows, ["night", "software", "spec", "bench"])


@mcp.tool()
def night_results(night: str) -> str:
    """All results of one night (date as YYYY-MM-DD): test, run, verdict,
    the key measurement and its limit."""
    rows = db().execute("SELECT * FROM results WHERE night = ? ORDER BY test_id",
                        (night,)).fetchall()
    if not rows:
        raise ValueError(f"No results for {night}. Use list_nights to see the dates.")
    return table(rows, ["test_id", "run_id", "verdict", "measure", "value", "unit", "limit_text"])


@mcp.tool()
def test_history(test_id: str) -> str:
    """Every nightly result of one test case (for example TC-AP-04), oldest
    first, with the software and specification version of each night."""
    rows = db().execute(
        "SELECT r.night, n.software, n.spec, r.verdict, r.value, r.unit, r.limit_text "
        "FROM results r JOIN nights n USING (night) WHERE r.test_id = ? ORDER BY r.night",
        (test_id,)).fetchall()
    if not rows:
        raise ValueError(f"{test_id} has no nightly results. Nightly tests: "
                         + ", ".join(r[0] for r in db().execute(
                             "SELECT DISTINCT test_id FROM results ORDER BY 1")))
    return table(rows, ["night", "software", "spec", "verdict", "value", "unit", "limit_text"])


@mcp.tool()
def get_test(test_id: str) -> str:
    """The full test case: title, traced requirements, method, procedure and
    pass criteria (test suite for specification v1.3)."""
    r = db().execute("SELECT * FROM tests WHERE id = ?", (test_id,)).fetchone()
    if r is None:
        raise ValueError(f"No test case {test_id}.")
    return "\n".join(f"{k}: {r[k]}" for k in r.keys())


@mcp.tool()
def find_tests(requirement_id: str = "", text: str = "") -> str:
    """Find test cases that trace to a requirement (for example WLC-014),
    or whose title contains a text. Give one or both."""
    rows = db().execute("SELECT id, title, requirements, method FROM tests ORDER BY id").fetchall()
    hits = [r for r in rows
            if (not requirement_id or requirement_id in [x.strip() for x in r["requirements"].split(",")])
            and (not text or text.lower() in r["title"].lower())]
    return table(hits, ["id", "title", "requirements", "method"])


@mcp.tool()
def find_defects(status: str = "", component: str = "", severity: str = "",
                 test_id: str = "") -> str:
    """Find defect reports. Filter by status (open, closed, duplicate),
    component, severity (S1 to S4) or linked test case; leave a filter
    empty to ignore it."""
    sql, args = "SELECT * FROM defects WHERE 1=1", []
    for col, val in (("status", status), ("component", component),
                     ("severity", severity), ("test_id", test_id)):
        if val:
            sql += f" AND {col} = ?"          # column names are fixed, values are parameters
            args.append(val)
    rows = db().execute(sql + " ORDER BY id", args).fetchall()
    return table(rows, ["id", "title", "status", "component", "severity", "test_id", "opened"])


if __name__ == "__main__":
    if "--check" in sys.argv:
        print(list_nights())
        print(night_results("2026-10-06")[:300])
        print(find_defects(status="open", severity="S1"))
    else:
        mcp.run()
