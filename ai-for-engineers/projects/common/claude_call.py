"""One helper used by every project: ask Claude for a structured answer.

ask() sends one prompt with no tools, asks for JSON that matches a schema,
and returns the answer with its cost. Every project checks the answer with
code afterwards; this helper only makes the call.
"""

import asyncio
import json
import time

from claude_agent_sdk import ClaudeAgentOptions, ResultMessage, query

from prices import cost_from_usage

DEFAULT_MODEL = "claude-sonnet-5-5"


class ClaudeError(RuntimeError):
    pass


async def ask_async(prompt, system, schema, model=DEFAULT_MODEL,
                    max_budget_usd=1.00):
    options = ClaudeAgentOptions(
        model=model,
        system_prompt=system,
        tools=[],                      # no files, no commands: text in, JSON out
        setting_sources=[],            # ignore local settings and CLAUDE.md
        output_format={"type": "json_schema", "schema": schema},
        max_turns=3,
        max_budget_usd=max_budget_usd,
    )
    start = time.time()
    result = None
    async for message in query(prompt=prompt, options=options):
        if isinstance(message, ResultMessage):
            result = message      # keep reading until the stream ends
    if result is None:
        raise ClaudeError("No result message")
    message = result
    if message.is_error or message.structured_output is None:
        raise ClaudeError(f"{message.subtype}: {message.result}")
    usage = message.usage or {}
    return {
        "answer": message.structured_output,
        # The SDK's own estimate is wrong for models newer than the SDK,
        # so the cost is worked out from the token counts.
        "cost_usd": cost_from_usage(message.model_usage or {}),
        "model_usage": message.model_usage,
        "input_tokens": usage.get("input_tokens", 0)
        + usage.get("cache_read_input_tokens", 0)
        + usage.get("cache_creation_input_tokens", 0),
        "output_tokens": usage.get("output_tokens", 0),
        "seconds": round(time.time() - start, 1),
        "model": model,
    }


def ask(prompt, system, schema, **kw):
    return asyncio.run(ask_async(prompt, system, schema, **kw))


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
