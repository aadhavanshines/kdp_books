"""Research Analyst: answers a business question from a folder of documents.

Every finding must come with a word-for-word quote and the file it came from.
After the agent finishes, plain code checks that each quote really is in that file,
so you can see at a glance whether anything was made up.
Run it with:  python agent.py "your question"
"""
import asyncio
import json
import re
import sys
from pathlib import Path

from claude_agent_sdk import ClaudeAgentOptions, ResultMessage, query

from watch import show

HERE = Path(__file__).parent
DOCS = HERE / "docs"
QUESTION = "Should Amudha open a second kitchen, and if so, where?"

SCHEMA = {
    "type": "object",
    "properties": {
        "answer": {"type": "string", "description": "A direct answer in 2 or 3 sentences"},
        "findings": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "claim": {"type": "string"},
                    "file": {"type": "string", "description": "File name, e.g. rent-quotes.md"},
                    "quote": {"type": "string",
                              "description": "Exact words copied from the file"},
                },
                "required": ["claim", "file", "quote"],
            },
        },
        "conflicts": {"type": "array", "items": {"type": "string"},
                      "description": "Places where the documents disagree"},
        "not_in_documents": {"type": "array", "items": {"type": "string"},
                             "description": "Things you'd need to know that the documents don't say"},
    },
    "required": ["answer", "findings", "conflicts", "not_in_documents"],
}

options = ClaudeAgentOptions(
    model="claude-sonnet-5-5",
    cwd=str(DOCS),
    system_prompt=(
        "You are a careful business analyst. Answer only from the documents in the "
        "current folder; read all of them first. Support every finding with a quote "
        "copied word for word from one file (one sentence or table row is enough). "
        "If documents disagree, say which is newer and use it. If the documents don't "
        "contain something, list it under not_in_documents instead of guessing."),
    tools=["Read", "Glob", "Grep"],
    allowed_tools=["Read", "Glob", "Grep"],
    output_format={"type": "json_schema", "schema": SCHEMA},
    max_turns=30,
    max_budget_usd=1.00,
)


def squash(text):
    """Ignore differences in spacing, line breaks and Markdown table bars."""
    return re.sub(r"[\s|*]+", " ", text).strip().lower()


def verify(result):
    """Check every quote against its file. Returns the findings with a 'verified' flag."""
    for f in result["findings"]:
        path = DOCS / Path(f["file"]).name
        f["verified"] = path.exists() and squash(f["quote"]) in squash(path.read_text())
    return result


def write_memo(question, result, path):
    lines = [f"# {question}", "", result["answer"], "", "## Findings", ""]
    for n, f in enumerate(result["findings"], 1):
        mark = "verified" if f["verified"] else "NOT FOUND IN SOURCE"
        lines.append(f"{n}. {f['claim']}  \n   > \"{f['quote']}\" ({f['file']}, {mark})")
    for title, key in [("Where the documents disagree", "conflicts"),
                       ("Not in the documents", "not_in_documents")]:
        lines += ["", f"## {title}", ""] + [f"- {x}" for x in result[key] or ["None"]]
    path.write_text("\n".join(lines) + "\n")


async def main():
    question = " ".join(sys.argv[1:]) or QUESTION
    async for message in query(prompt=question, options=options):
        show(message)
        if isinstance(message, ResultMessage) and message.structured_output:
            result = verify(message.structured_output)
            (HERE / "answer.json").write_text(json.dumps(result, indent=2, ensure_ascii=False))
            write_memo(question, result, HERE / "memo.md")
            ok = sum(f["verified"] for f in result["findings"])
            print(f"Quotes verified: {ok} of {len(result['findings'])}. Memo saved to memo.md")


if __name__ == "__main__":
    asyncio.run(main())
