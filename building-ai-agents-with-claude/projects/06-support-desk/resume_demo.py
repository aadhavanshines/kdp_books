"""Resume a saved conversation in a new process, with a fresh Desk.

Part 1 verifies an order and saves the session id. Part 2 resumes that
session later. Claude remembers the conversation, but the new Desk has
verified nothing, so the refund tool must ask for verification again.
Usage:  python resume_demo.py
"""

import asyncio
from dataclasses import replace

from claude_agent_sdk import ClaudeSDKClient, ResultMessage

from desk import Desk
from watch import console, show

NOW = "Wednesday 07 October 2026, 10:00"


async def part_one():
    async with ClaudeSDKClient(options=Desk(now=NOW).options()) as client:
        await client.query(
            "Hi, order CB-1187, phone ends 1187. When was it " "delivered?"
        )
        async for message in client.receive_response():
            show(message)
            if isinstance(message, ResultMessage):
                return message.session_id


async def part_two(session_id):
    options = replace(Desk(now=NOW).options(), resume=session_id)
    async with ClaudeSDKClient(options=options) as client:
        await client.query("It arrived squashed. Please refund it.")
        async for message in client.receive_response():
            show(message)


async def main():
    session_id = await part_one()
    console.print(
        f"[bold]--- Session {session_id[:8]}... saved. Later, in "
        "a new process: ---[/]"
    )
    await part_two(session_id)


if __name__ == "__main__":
    asyncio.run(main())
