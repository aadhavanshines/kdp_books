"""Check that everything works: Python, the Agent SDK and your API key.
Run it with:  python hello.py
"""

import asyncio

from claude_agent_sdk import ClaudeAgentOptions, ResultMessage, query


async def main():
    options = ClaudeAgentOptions(
        model="claude-sonnet-5-5", tools=[], max_turns=1
    )
    async for message in query(
        prompt="Say hello to a new agent builder in one short line, no emoji.",
        options=options,
    ):
        if isinstance(message, ResultMessage):
            print(message.result)
            print(f"Cost: ${message.total_cost_usd:.4f}")


asyncio.run(main())
