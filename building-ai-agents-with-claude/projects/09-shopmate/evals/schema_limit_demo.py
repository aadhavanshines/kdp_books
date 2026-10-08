"""What happens when Claude's structured output breaks a schema rule?

Asks for a 105-character message in a field limited to 40 characters, and
prints each step, so you can see the SDK reject it and Claude try again.
Usage:  python evals/schema_limit_demo.py
"""

import asyncio

from claude_agent_sdk import (
    AssistantMessage,
    ClaudeAgentOptions,
    ResultMessage,
    ToolResultBlock,
    ToolUseBlock,
    UserMessage,
    query,
)

SCHEMA = {
    "type": "object",
    "properties": {"msg": {"type": "string", "maxLength": 40}},
    "required": ["msg"],
}
TEXT = (
    "Happy birthday Ravi! Wishing you a wonderful year full of laughter, "
    "cake, good friends and every success."
)


async def main():
    options = ClaudeAgentOptions(
        model="claude-sonnet-5-5",
        tools=[],
        setting_sources=[],
        output_format={"type": "json_schema", "schema": SCHEMA},
        max_turns=6,
    )
    prompt = f"Put exactly this text in msg, unchanged: {TEXT}"
    async for m in query(prompt=prompt, options=options):
        if isinstance(m, (AssistantMessage, UserMessage)) and isinstance(
            m.content, list
        ):
            for block in m.content:
                if isinstance(block, ToolUseBlock):
                    print(f"→ {block.input}")
                elif isinstance(block, ToolResultBlock):
                    print(f"  ← {block.content}")
        if isinstance(m, ResultMessage):
            print(f"Result: {m.structured_output} ({m.num_turns} turns)")


asyncio.run(main())
