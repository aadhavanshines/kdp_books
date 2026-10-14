"""Project 9: an agent that answers questions from the test database
through the MCP server. The same server works in Claude Code (see .mcp.json).
Run it with:  python agent.py "Which tests failed on 2026-10-06?"
         or:  python agent.py --all     (the 10 test questions)
"""

import asyncio
import json
import sys
from pathlib import Path

from claude_agent_sdk import (ClaudeAgentOptions, ResultMessage, SystemMessage,
                              query)

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "common"))
from claude_call import save_json  # noqa: E402
from prices import cost_from_usage  # noqa: E402

HERE = Path(__file__).parent

SYSTEM = """\
You answer questions about the WLC-200 validation results using the
wlc200-testdb tools. Look the facts up with the tools; never guess a value.
Give a short answer, then put only the values that directly answer the
question in "items", exactly as the database writes them: the IDs for
"which", the number for "how many", the value for "what was". Leave out
context such as run IDs or dates that the question didn't ask for. If the
database can't answer the question, say so and leave items empty."""

SCHEMA = {"type": "object", "properties": {
    "answer": {"type": "string"},
    "items": {"type": "array", "items": {"type": "string"}}},
    "required": ["answer", "items"]}

QUESTIONS = [
    ("d01", "Which tests failed on 2026-10-06?"),
    ("d02", "On which night did TC-AP-05 first pass after failing?"),
    ("d03", "Which open defects have severity S1?"),
    ("d04", "Which test cases trace to requirement WLC-014?"),
    ("d05", "On how many nights did TC-TH-03 fail?"),
    ("d06", "What was the maximum WLC_Status period in TC-CAN-01 on 2026-10-04?"),
    ("d07", "Which software version was tested on 2026-10-03?"),
    ("d08", "Which open defects are not linked to any test case?"),
    ("d09", "Which component has the most open defects?"),
    ("d10", "Who is the owner of defect DR-1012?"),
]


def options():
    return ClaudeAgentOptions(
        model="claude-sonnet-5-5",
        system_prompt=SYSTEM,
        tools=[],
        mcp_servers={"wlc200-testdb": {
            "type": "stdio", "command": sys.executable,
            "args": [str(HERE / "testdb_server.py")], "alwaysLoad": True}},
        allowed_tools=["mcp__wlc200-testdb__*"],
        permission_mode="dontAsk",
        setting_sources=[],
        output_format={"type": "json_schema", "schema": SCHEMA},
        max_turns=15,
        max_budget_usd=0.50,
    )


async def ask(question, limit):
    async with limit:
        result, tools_used, status = None, [], None
        async for m in query(prompt=question, options=options()):
            if isinstance(m, SystemMessage) and m.subtype == "init":
                status = {s["name"]: s["status"] for s in m.data.get("mcp_servers", [])}
            if hasattr(m, "content") and isinstance(m.content, list):
                tools_used += [b.name.split("__")[-1] for b in m.content
                               if type(b).__name__ == "ToolUseBlock"]
            if isinstance(m, ResultMessage):
                result = m
        if result is None or result.is_error or result.structured_output is None:
            raise RuntimeError(f"{question}: {getattr(result, 'result', 'no result')}")
        return {"answer": result.structured_output, "tools": tools_used,
                "servers": status, "turns": result.num_turns,
                "cost_usd": cost_from_usage(result.model_usage or {})}


async def run_all(tag):
    limit = asyncio.Semaphore(3)
    results = await asyncio.gather(*(ask(q, limit) for _, q in QUESTIONS))
    out = [{"id": i, "question": q, **r} for (i, q), r in zip(QUESTIONS, results)]
    for o in out:
        print(f"{o['id']} {o['answer']['items']}  tools: {', '.join(o['tools'])}")
    print(f"${sum(o['cost_usd'] for o in out):.4f}")
    save_json(HERE / "output" / f"answers-{tag}.json", out)


if __name__ == "__main__":
    if sys.argv[1] == "--all":
        asyncio.run(run_all(sys.argv[2] if len(sys.argv) > 2 else "sonnet"))
    else:
        r = asyncio.run(ask(sys.argv[1], asyncio.Semaphore(1)))
        print(r["answer"]["answer"])
        print("Tools used:", ", ".join(r["tools"]))
