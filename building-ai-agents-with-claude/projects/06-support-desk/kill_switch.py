"""A kill switch for refunds, built with a PreToolUse hook.

While a file called REFUNDS_PAUSED exists in this folder, every refund is
blocked before it runs, whatever the agent or the customer says. Create the
file to pause refunds; delete it to allow them again.
Usage:  python kill_switch.py
"""

import asyncio
from dataclasses import replace

from claude_agent_sdk import ClaudeSDKClient, HookMatcher

from desk import HERE, Desk
from watch import show

PAUSE_FILE = HERE / "REFUNDS_PAUSED"


async def refunds_paused(input_data, tool_use_id, context):
    """Hook: runs before every issue_refund call and can block it."""
    if PAUSE_FILE.exists():
        return {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": "Refunds are paused by the "
                "owner. Escalate to Amudha instead.",
            }
        }
    return {}


async def main():
    desk = Desk(now="Wednesday 07 October 2026, 10:00")
    options = desk.options()
    hooks = dict(options.hooks)
    hooks["PreToolUse"] = [
        HookMatcher(
            matcher="mcp__desk__issue_refund", hooks=[refunds_paused]
        )
    ]
    async with ClaudeSDKClient(
        options=replace(options, hooks=hooks)
    ) as client:
        await client.query(
            "My black forest cake (order CB-1187, phone ends 1187) arrived "
            "squashed last night at about 7 pm. Please refund it."
        )
        async for message in client.receive_response():
            show(message)


if __name__ == "__main__":
    asyncio.run(main())
