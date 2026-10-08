"""Data Analyst: answers questions about a sales file by writing and
running Python.

Claude writes its own pandas code, runs it, draws charts with matplotlib
and writes a short report. It may only run "python3 ..." commands inside
this folder. Run it with:  python agent.py
"""

import asyncio
import json
from pathlib import Path

from claude_agent_sdk import ClaudeAgentOptions, ResultMessage, query

from watch import show

HERE = Path(__file__).parent

TASK = """\
Analyse data/orders.csv, one year of orders for Amudha's Home Bakes (1
October 2025 to 30 September 2026). Revenue means the "amount" column; it
does not include delivery charges. Answer these questions:

1. Revenue for each month, and the best month.
2. The top 5 products by revenue.
3. Which area grew fastest: compare the number of orders in October-December
2025 with July-September 2026, as a percentage change.
4. The share of cake orders that were eggless in October-December 2025 and
in July-September 2026.
5. The average rating for each channel.

Write your analysis as analysis.py and run it with python3. Save three
charts as PNG files in output/: monthly-revenue.png, area-growth.png and
top-products.png. Then write output/report.md: a one-page summary for
Amudha, in plain English, with the charts and three practical suggestions.
Use rupee amounts like Rs. 3,36,755."""

SCHEMA = {
    "type": "object",
    "properties": {
        "monthly_revenue": {
            "type": "object",
            "description": "YYYY-MM -> revenue",
            "additionalProperties": {"type": "number"},
        },
        "best_month": {"type": "string", "description": "YYYY-MM"},
        "top_products": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Top 5 product names, highest first",
        },
        "fastest_growing_area": {"type": "string"},
        "area_growth_percent": {
            "type": "object",
            "additionalProperties": {"type": "number"},
        },
        "eggless_share_percent": {
            "type": "object",
            "properties": {
                "oct_dec_2025": {"type": "number"},
                "jul_sep_2026": {"type": "number"},
            },
            "required": ["oct_dec_2025", "jul_sep_2026"],
        },
        "rating_by_channel": {
            "type": "object",
            "additionalProperties": {"type": "number"},
        },
    },
    "required": [
        "monthly_revenue",
        "best_month",
        "top_products",
        "fastest_growing_area",
        "area_growth_percent",
        "eggless_share_percent",
        "rating_by_channel",
    ],
}

options = ClaudeAgentOptions(
    model="claude-sonnet-5-5",
    cwd=str(HERE),
    system_prompt=(
        "You are a data analyst. Always compute numbers with code; never "
        "estimate them by reading the file. pandas and matplotlib are "
        "installed. The only shell commands you can run are python3 "
        "commands, such as 'python3 analysis.py'. Other commands (cd, ls, "
        "head) are blocked, so use the Read and Glob tools to look at "
        "files. If you can't finish, say so instead of returning empty "
        "answers."
    ),
    tools=["Read", "Write", "Edit", "Glob", "Bash"],
    allowed_tools=["Read", "Write", "Edit", "Glob", "Bash(python3 *)"],
    # Anything not allowed above is refused, without asking anyone.
    permission_mode="dontAsk",
    output_format={"type": "json_schema", "schema": SCHEMA},
    max_turns=30,
    max_budget_usd=1.50,
)


async def main():
    (HERE / "output").mkdir(exist_ok=True)
    async for message in query(prompt=TASK, options=options):
        show(message)
        if isinstance(message, ResultMessage) and message.structured_output:
            if not message.structured_output["monthly_revenue"]:
                print(
                    "The agent returned empty answers, so nothing was "
                    "saved."
                )
                return
            (HERE / "output" / "answers.json").write_text(
                json.dumps(message.structured_output, indent=2)
            )
            print(
                "Answers saved to output/answers.json; report in "
                "output/report.md"
            )


if __name__ == "__main__":
    asyncio.run(main())
