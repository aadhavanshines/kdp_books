"""Run the morning brief once. This is what the scheduler (cron, GitHub
Actions or a cloud job) calls every morning at 6 am.

It retries once on failure, records every attempt in out/runs.jsonl, saves
the brief and the WhatsApp text, writes ShopMate's notes for tomorrow, and
writes out/ALERT.txt if the brief couldn't be made, so a person finds out.
Usage:  python run_daily.py
"""

import asyncio
import json
import time

from claude_agent_sdk import ResultMessage, SystemMessage, query

import brief
from config import MODEL, OUT, PROMPT_VERSION, today
from runlog import record

TOOL_LOG = []


async def log_tool(input_data, tool_use_id, context):
    """Hook: keep every tool result, so checks can compare the brief with
    its sources."""
    TOOL_LOG.append(
        {
            "tool": input_data["tool_name"].split("__")[-1],
            "result": str(input_data.get("tool_response")),
        }
    )
    return {}


async def run_once():
    return await run_once_with(MODEL)


async def run_once_with(model):
    started = time.time()
    TOOL_LOG.clear()
    result = None
    try:
        async for message in query(
            prompt="Prepare this morning's brief.",
            options=brief.options(model=model, on_tool=log_tool),
        ):
            if (
                isinstance(message, SystemMessage)
                and message.subtype == "init"
            ):
                status = {
                    s["name"]: s["status"]
                    for s in message.data.get("mcp_servers", [])
                }
                if status.get("stock") != "connected":
                    raise RuntimeError(
                        f"stock server not connected: {status}"
                    )
            if isinstance(message, ResultMessage):
                result = message
    except Exception as error:
        # The SDK raises after an error result; report the result's own
        # words if we have them.
        reason = (
            result.result
            if result is not None and result.result
            else str(error)
        )
        raise RuntimeError(reason) from error
    if (
        result is None
        or result.subtype != "success"
        or not result.structured_output
    ):
        raise RuntimeError(
            "no brief produced "
            f"({result.subtype if result else 'no result'})"
        )
    return result, round(time.time() - started, 1)


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for attempt in (1, 2):
        try:
            result, seconds = await run_once()
        except Exception as error:  # noqa: BLE001
            # Any failure: log it, then retry once.
            record(
                day=today(),
                attempt=attempt,
                status="failed",
                error=str(error)[:300],
                model=MODEL,
                prompt_version=PROMPT_VERSION,
            )
            print(f"Attempt {attempt} failed: {error}")
            continue
        b = result.structured_output
        (OUT / "brief.json").write_text(
            json.dumps(b, indent=2, ensure_ascii=False)
        )
        (OUT / "brief.md").write_text(brief.render(b))
        (OUT / "whatsapp.txt").write_text(b["whatsapp"] + "\n")
        (OUT / "tool-log.json").write_text(json.dumps(TOOL_LOG, indent=1))
        brief.remember(b)
        (OUT / "ALERT.txt").unlink(missing_ok=True)
        entry = record(
            day=today(),
            attempt=attempt,
            status="ok",
            model=MODEL,
            prompt_version=PROMPT_VERSION,
            turns=result.num_turns,
            seconds=seconds,
            cost_usd=round(result.total_cost_usd or 0, 4),
            urgent=len(b["urgent"]),
        )
        print(
            f"Brief ready: {entry['urgent']} urgent items, "
            f"{entry['turns']} turns, {seconds} s, ${entry['cost_usd']}"
        )
        print(b["whatsapp"])
        return
    (OUT / "ALERT.txt").write_text(
        f"ShopMate could not make the brief for {today()}. "
        "Check out/runs.jsonl.\n"
    )
    raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(main())
