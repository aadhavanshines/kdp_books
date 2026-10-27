"""One question to Claude through the Agent SDK, with one tool."""

import asyncio

from claude_agent_sdk import (
    ClaudeAgentOptions,
    ResultMessage,
    create_sdk_mcp_server,
    query,
    tool,
)

ADD_SCHEMA = {
    "type": "object",
    "properties": {"a": {"type": "number"}, "b": {"type": "number"}},
    "required": ["a", "b"],
}


@tool("add", "Add two numbers.", ADD_SCHEMA)
async def add(args):
    print(f"(the model called add with {args})")
    total = args["a"] + args["b"]
    return {"content": [{"type": "text", "text": str(total)}]}


async def main():
    server = create_sdk_mcp_server("demo", "1.0", [add])
    options = ClaudeAgentOptions(
        model="claude-sonnet-5-5",
        mcp_servers={"demo": server},
        allowed_tools=["mcp__demo__add"],
        tools=[],
        setting_sources=[],
        max_turns=4,
    )
    question = "What is 1234.5 plus 678.25? Use the add tool."
    async for message in query(prompt=question, options=options):
        if isinstance(message, ResultMessage):
            print(message.result)
            print(
                f"turns: {message.num_turns}, "
                f"cost: US${message.total_cost_usd:.4f}"
            )


asyncio.run(main())
