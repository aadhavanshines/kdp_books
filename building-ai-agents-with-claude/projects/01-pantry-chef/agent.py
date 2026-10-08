"""Pantry Chef: your first agent.

It looks in your pantry, suggests a dinner you can cook, and adds anything
missing to your shopping list. Run it with:  python agent.py
"""

import asyncio
import json
import sys
from pathlib import Path

from claude_agent_sdk import (
    ClaudeAgentOptions,
    create_sdk_mcp_server,
    query,
    tool,
)

from watch import show

HERE = Path(__file__).parent
PANTRY = HERE / "pantry.json"
SHOPPING_LIST = HERE / "shopping-list.txt"


@tool(
    "check_pantry",
    "List every ingredient in the kitchen and how much is left.",
    {},
)
async def check_pantry(args):
    items = json.loads(PANTRY.read_text())
    lines = [f"{name}: {amount}" for name, amount in items.items()]
    return {"content": [{"type": "text", "text": "\n".join(lines)}]}


@tool(
    "add_to_shopping_list",
    "Add one item to the shopping list.",
    {"item": str, "reason": str},
)
async def add_to_shopping_list(args):
    with SHOPPING_LIST.open("a") as f:
        f.write(f"- {args['item']} ({args['reason']})\n")
    message = f"Added {args['item']} to the shopping list."
    return {"content": [{"type": "text", "text": message}]}


kitchen = create_sdk_mcp_server(
    name="kitchen",
    version="1.0.0",
    tools=[check_pantry, add_to_shopping_list],
)

options = ClaudeAgentOptions(
    model="claude-sonnet-5-5",
    system_prompt=(
        "You are a friendly home cook's assistant. Always check the pantry "
        "before suggesting a dish. Suggest one dish, explain it in a few "
        "short steps, and add any missing ingredients to the shopping list."
    ),
    mcp_servers={"kitchen": kitchen},
    tools=[],  # no built-in tools: only the two tools above
    allowed_tools=[
        "mcp__kitchen__check_pantry",
        "mcp__kitchen__add_to_shopping_list",
    ],
    max_turns=10,
    max_budget_usd=0.50,
)


async def main():
    request = (
        " ".join(sys.argv[1:])
        or "What can I cook for dinner tonight for 3 people?"
    )
    async for message in query(prompt=request, options=options):
        show(message)


if __name__ == "__main__":
    asyncio.run(main())
