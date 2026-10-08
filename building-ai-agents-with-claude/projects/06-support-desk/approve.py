"""Ask a person before every refund, with the can_use_tool callback.

issue_refund is left out of allowed_tools, so each refund needs permission.
The callback shows the refund and waits for the owner to type y or n.
Usage:  python approve.py
"""

import asyncio
from dataclasses import replace

from claude_agent_sdk import (
    ClaudeSDKClient,
    PermissionResultAllow,
    PermissionResultDeny,
)

from desk import Desk
from watch import console, show


async def ask_owner(tool_name, tool_input, context):
    """Called whenever a tool needs permission. Returns allow or deny."""
    if tool_name != "mcp__desk__issue_refund":
        return PermissionResultDeny(message="Not allowed.")
    console.print(
        f"[bold yellow]Approve refund of Rs. {tool_input['amount']} on "
        f"{tool_input['order_id']}? ({tool_input['reason']})[/]"
    )
    answer = await asyncio.to_thread(input, "Owner, type y or n: ")
    if answer.strip().lower() == "y":
        return PermissionResultAllow()
    return PermissionResultDeny(
        message="The owner declined this refund. Offer a replacement "
        "cake instead, and escalate if the customer isn't happy."
    )


async def main():
    desk = Desk(now="Wednesday 07 October 2026, 10:00")
    options = desk.options()
    options = replace(
        options,
        allowed_tools=["mcp__desk__find_order", "mcp__desk__escalate"],
        can_use_tool=ask_owner,
    )
    async with ClaudeSDKClient(options=options) as client:
        await client.query(
            "My black forest cake (order CB-1187, phone ends 1187) arrived "
            "squashed last night at about 7 pm. Please refund it."
        )
        async for message in client.receive_response():
            show(message)


if __name__ == "__main__":
    asyncio.run(main())
