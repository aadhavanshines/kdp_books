"""Kitchen Manager: plans this week's ingredient orders using the stock MCP
server.

The agent starts stock_server.py as a separate program and talks to it over
MCP.
Run it with:  python agent.py
"""

import asyncio
import sys
from pathlib import Path

from claude_agent_sdk import ClaudeAgentOptions, SystemMessage, query

from watch import show

HERE = Path(__file__).parent

options = ClaudeAgentOptions(
    model="claude-sonnet-5-5",
    system_prompt=(
        "You manage ingredient stock for a home bakery. Read the reorder "
        "rules resource before planning, then follow it exactly."
    ),
    mcp_servers={
        "stock": {
            "type": "stdio",
            "command": sys.executable,
            "args": [str(HERE / "stock_server.py")],
            "alwaysLoad": True,
        }  # load its tools before the first turn
    },
    tools=["ListMcpResourcesTool", "ReadMcpResourceTool"],
    allowed_tools=[
        "mcp__stock__list_stock",
        "mcp__stock__draft_purchase_order",
        "ListMcpResourcesTool",
        "ReadMcpResourceTool",
    ],
    disallowed_tools=[
        "mcp__stock__record_usage"
    ],  # planning only: it can't change stock
    max_turns=20,
    max_budget_usd=0.75,
)

TASK = (
    "Check the stock and plan this week's orders. Order anything that is "
    "at or below its reorder level, or that won't last two weeks at normal "
    "use. Draft one purchase order per supplier, then give me a short "
    "summary."
)


async def main():
    async for message in query(prompt=TASK, options=options):
        if isinstance(message, SystemMessage) and message.subtype == "init":
            status = {
                s["name"]: s["status"]
                for s in message.data.get("mcp_servers", [])
            }
            if status.get("stock") != "connected":
                raise SystemExit(
                    f"Stock server not connected ({status}). Stopping."
                )
        show(message)


if __name__ == "__main__":
    asyncio.run(main())
