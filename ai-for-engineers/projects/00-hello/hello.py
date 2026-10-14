"""Check that everything works: Python, the Agent SDK, your key, and the
helper every project uses. Run it with:  python hello.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "common"))
from claude_call import ask  # noqa: E402

SCHEMA = {
    "type": "object",
    "properties": {"testable": {"type": "boolean"}, "reason": {"type": "string"}},
    "required": ["testable", "reason"],
}

result = ask(
    "Is this requirement testable? 'The window shall close quickly.'",
    "You are a systems engineer. Answer in one short sentence.",
    SCHEMA,
)
print(result["answer"])
print(f"{result['input_tokens']} tokens in, {result['output_tokens']} out, "
      f"${result['cost_usd']}")
