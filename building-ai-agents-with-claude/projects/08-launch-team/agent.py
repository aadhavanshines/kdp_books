"""Diwali Launch Team: a coordinator agent with four specialist subagents.

The coordinator plans the work and hands each part to a specialist. Each
specialist has its own instructions and only the tools it needs. Their files
go in launch-kit/.
Run it with:  python agent.py
"""

import asyncio
import time
from pathlib import Path

from claude_agent_sdk import (
    AgentDefinition,
    ClaudeAgentOptions,
    HookMatcher,
    query,
)

from watch import console, show

HERE = Path(__file__).parent
started = time.time()

# Only "python3 ..." commands may run, from the project folder. Every
# specialist is told this, and writes scripts with the Write tool instead
# of using cd, mkdir or heredocs.
SHELL_RULES = (
    " The only shell commands allowed are python3 commands run from the "
    "project folder, like 'python3 scripts/price.py'. Write scripts to the "
    "scripts/ folder with the Write tool first; cd, mkdir and other "
    "commands are blocked."
)

TEAM = {
    "researcher": AgentDefinition(
        description="Finds facts in the sales data and customer survey. "
        "Use first.",
        prompt=(
            "You research facts for a Diwali campaign for Amudha's Home "
            "Bakes, using data/orders.csv and data/survey-results.md. "
            "Compute numbers with python3 scripts, never by eye. Find: "
            "Diwali 2025 sales (14 to 21 October 2025) versus a normal "
            "week, the best-selling products, the eggless share of cake "
            "orders in the latest 3 months, and the fastest-growing area. "
            "Write the facts, each "
            "with how you got it, to launch-kit/research.md." + SHELL_RULES
        ),
        tools=["Read", "Glob", "Write", "Bash"],
        model="sonnet",
        background=False,  # the coordinator waits for the answer
    ),
    "pricing": AgentDefinition(
        description="Prices the Diwali hampers from "
        "data/hamper-costs.json.",
        prompt=(
            "You price gift hampers. Follow the rule in "
            "data/hamper-costs.json exactly, and calculate with a python3 "
            "script, not in your head. Write a table of each hamper's "
            "items, cost, price and margin to launch-kit/pricing.md."
            + SHELL_RULES
        ),
        tools=["Read", "Write", "Bash"],
        model="sonnet",
        background=False,  # the coordinator waits for the answer
    ),
    "copywriter": AgentDefinition(
        description="Writes Instagram posts and a WhatsApp message from "
        "the research and prices.",
        prompt=(
            "You write warm, short marketing copy for a Chennai home "
            "bakery. Read launch-kit/research.md and "
            "launch-kit/pricing.md. Use only facts and prices from those "
            "files. Write three Instagram captions (under 80 words each, "
            "one of them in Tamil) and one WhatsApp broadcast (under 120 "
            "words) to launch-kit/posts.md."
        ),
        tools=["Read", "Write"],
        model="sonnet",
        background=False,  # the coordinator waits for the answer
    ),
    "fact-checker": AgentDefinition(
        description="Checks every number and claim in the copy against "
        "the source files.",
        prompt=(
            "You check marketing copy. For every number, price and claim "
            "in launch-kit/posts.md, find its source in "
            "launch-kit/research.md, launch-kit/pricing.md or the data "
            "folder. Write launch-kit/factcheck.md: a table of claim, "
            "source and OK or WRONG, then a verdict line that starts with "
            "'VERDICT: PASS' or 'VERDICT: FAIL'. If anything is wrong, fix "
            "it in posts.md and say what you changed."
        ),
        tools=["Read", "Grep", "Write", "Edit"],
        model="sonnet",
        background=False,  # the coordinator waits for the answer
    ),
}


async def subagent_started(input_data, tool_use_id, context):
    console.print(
        f"[magenta]{time.time() - started:5.0f}s  ▶ "
        f"{input_data.get('agent_type')} started[/]"
    )
    return {}


async def subagent_stopped(input_data, tool_use_id, context):
    console.print(
        f"[magenta]{time.time() - started:5.0f}s  ■ "
        f"{input_data.get('agent_type')} finished[/]"
    )
    return {}


options = ClaudeAgentOptions(
    model="claude-sonnet-5-5",
    cwd=str(HERE),
    system_prompt=(
        "You coordinate a small team preparing the Diwali 2026 hamper "
        "launch for Amudha's Home Bakes. Use the researcher and pricing "
        "specialists first (they can work at the same time), then the "
        "copywriter, then the fact-checker. Wait for each specialist's "
        "result before the next step (run them in the foreground). Don't "
        "do their work yourself, and don't change the file names they use. "
        "Finish with a short summary of the launch kit for Amudha."
    ),
    agents=TEAM,
    tools=["Agent", "Read", "Write", "Edit", "Glob", "Grep", "Bash"],
    allowed_tools=[
        "Agent",
        "Read",
        "Write",
        "Edit",
        "Glob",
        "Grep",
        "Bash(python3 *)",
    ],
    permission_mode="dontAsk",
    hooks={
        "SubagentStart": [HookMatcher(hooks=[subagent_started])],
        "SubagentStop": [HookMatcher(hooks=[subagent_stopped])],
    },
    max_turns=30,
    max_budget_usd=3.00,
)


async def main():
    (HERE / "launch-kit").mkdir(exist_ok=True)
    async for message in query(
        prompt="Prepare the Diwali hamper launch kit.", options=options
    ):
        show(message)


if __name__ == "__main__":
    asyncio.run(main())
