"""Print every message the agent loop produces, one line each, to see the loop.

Usage:  python messages.py [max_turns]
"""

import asyncio
import sys
from dataclasses import replace

from claude_agent_sdk import (
    AssistantMessage,
    ResultMessage,
    SystemMessage,
    TextBlock,
    ToolResultBlock,
    ToolUseBlock,
    UserMessage,
    query,
)

from agent import options

QUESTION = "What do I need to buy to make kesari for 4 people?"


def describe(message):
    """One short line per message: its type and what's inside."""
    name = type(message).__name__
    if isinstance(message, SystemMessage):
        return f"{name} ({message.subtype})"
    if isinstance(message, (AssistantMessage, UserMessage)):
        parts = []
        for block in (
            message.content if isinstance(message.content, list) else []
        ):
            if isinstance(block, TextBlock):
                parts.append(f"text: {block.text[:50]!r}")
            elif isinstance(block, ToolUseBlock):
                parts.append(f"tool call: {block.name.split('__')[-1]}")
            elif isinstance(block, ToolResultBlock):
                parts.append("tool result")
        return f"{name}: {', '.join(parts)}"
    if isinstance(message, ResultMessage):
        return (
            f"{name} ({message.subtype}): {message.num_turns} turns, "
            f"${message.total_cost_usd:.4f}"
        )
    return name


async def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else options.max_turns
    try:
        async for message in query(
            prompt=QUESTION, options=replace(options, max_turns=limit)
        ):
            print(describe(message))
    except Exception as error:  # the SDK raises after an error result
        print(f"Stopped: {error}")


if __name__ == "__main__":
    asyncio.run(main())
