"""The brain: given the prompt and the tools, decide what to do and say.

ClaudeBrain uses Claude through the Claude Agent SDK. ScriptedBrain
follows a fixed script; the tests use it to check everything around the
model without paying for, or depending on, a real model call."""

from __future__ import annotations

import asyncio
import tempfile
from dataclasses import dataclass, field

from claude_agent_sdk import (
    AssistantMessage,
    ClaudeAgentOptions,
    ClaudeSDKError,
    ResultMessage,
    create_sdk_mcp_server,
    query,
    tool,
)

from .tools import Context, Tool, call_tool


@dataclass
class Turn:
    system: str
    prompt: str
    tools: list[Tool]
    ctx: Context
    model: str
    max_turns: int = 12
    timeout: float = 180


@dataclass
class Reply:
    text: str
    cost_usd: float = 0.0
    error: str | None = None
    tool_calls: list = field(default_factory=list)


# US$ per million input and output tokens, for estimating the cost of a
# turn that ended without the SDK's total (a timeout or an error). An
# unknown model counts at the highest price, so the estimate errs high.
PRICES = {"claude-sonnet-5-5": (2.0, 10.0), "claude-haiku-4-5": (1.0, 5.0)}
HIGHEST = (10.0, 50.0)
MARGIN = 1.25  # for tokens the stream doesn't show, such as thinking


def estimate_cost(model: str, calls) -> float:
    per_in, per_out = PRICES.get(model, HIGHEST)
    total = 0.0
    for u in calls:
        tokens_in = (
            u.get("input_tokens", 0)
            + 2 * u.get("cache_creation_input_tokens", 0)  # 1-hour cache
            + 0.1 * u.get("cache_read_input_tokens", 0)
        )
        # The streamed output count can be a partial one, so take at
        # least a third of the characters written (a token is 3 or 4)
        tokens_out = max(
            u.get("output_tokens", 0), u.get("written", 0) // 3
        )
        total += tokens_in * per_in + tokens_out * per_out
    return total * MARGIN / 1_000_000


def add_usage(usage: dict, message: AssistantMessage) -> None:
    """Record a message's token counts under its model call; one call
    can arrive as several messages, one per block it wrote."""
    call = usage.setdefault(message.message_id or id(message), {})
    call["written"] = call.get("written", 0) + sum(
        len(str(block)) for block in message.content
    )
    call.update(message.usage)


def as_sdk_tool(t: Tool, ctx: Context):
    """Wrap one of our tools for the SDK; every call goes via call_tool."""

    @tool(t.name, t.description, t.schema)
    async def handler(args):
        text = await call_tool(ctx, t.name, args)
        return {"content": [{"type": "text", "text": text}]}

    return handler


class ClaudeBrain:
    def __init__(self, retries: int = 2):
        self.retries = retries
        self.scratch = tempfile.mkdtemp(prefix="sparrow-brain-")

    def options(self, turn: Turn) -> ClaudeAgentOptions:
        server = create_sdk_mcp_server(
            "sparrow", "1.0", [as_sdk_tool(t, turn.ctx) for t in turn.tools]
        )
        return ClaudeAgentOptions(
            system_prompt=turn.system,
            model=turn.model,
            mcp_servers={"sparrow": server},
            allowed_tools=[f"mcp__sparrow__{t.name}" for t in turn.tools],
            tools=[],  # none of the SDK's built-in tools
            setting_sources=[],  # ignore any local settings files
            cwd=self.scratch,
            max_turns=turn.max_turns,
        )

    async def once(self, turn: Turn, usage: dict) -> Reply:
        """`usage` collects each model call's token counts as they
        arrive, so a turn cut short can still be priced."""
        result = None
        async with asyncio.timeout(turn.timeout):
            async for message in query(
                prompt=turn.prompt, options=self.options(turn)
            ):
                if isinstance(message, AssistantMessage) and message.usage:
                    add_usage(usage, message)
                if isinstance(message, ResultMessage):
                    result = message
        if result is None:
            cost = estimate_cost(turn.model, usage.values())
            error = "no result from the model"
            return Reply("", cost, error, turn.ctx.calls)
        error = (
            None
            if result.subtype == "success" and not result.is_error
            else result.subtype
        )
        return Reply(
            result.result or "",
            result.total_cost_usd or 0.0,
            error,
            turn.ctx.calls,
        )

    async def respond(self, turn: Turn) -> Reply:
        spent = 0.0  # by failed attempts, which cost money too
        for attempt in range(self.retries + 1):
            usage: dict = {}
            try:
                reply = await self.once(turn, usage)
                reply.cost_usd += spent
                return reply
            except (ClaudeSDKError, TimeoutError, OSError) as error:
                spent += estimate_cost(turn.model, usage.values())
                # Retry only if no tool ran: a retry must never repeat
                # something that already happened.
                if turn.ctx.calls or attempt == self.retries:
                    return Reply(
                        "",
                        spent,
                        f"{type(error).__name__}: {error}",
                        turn.ctx.calls,
                    )
                await asyncio.sleep(2 ** (attempt + 1))
        raise AssertionError("unreachable")


class ScriptedBrain:
    """Plays back scripted turns. A script is a list of steps:
    ("tool", name, args) calls a tool; ("say", text) adds to the reply;
    ("say", function) adds function(results so far). Give a list of
    scripts (one per turn) or a function turn -> script."""

    def __init__(self, scripts):
        self.scripts = scripts
        self.turns: list[Turn] = []

    async def respond(self, turn: Turn) -> Reply:
        self.turns.append(turn)
        if callable(self.scripts):
            script = self.scripts(turn)
        else:
            script = self.scripts.pop(0)
        results, said = [], []
        for step in script:
            if step[0] == "tool":
                results.append(await call_tool(turn.ctx, step[1], step[2]))
            elif step[0] == "say":
                said.append(
                    step[1](results) if callable(step[1]) else step[1]
                )
            elif step[0] == "fail":
                raise ClaudeSDKError(step[1])
        return Reply("\n".join(said), 0.0, None, turn.ctx.calls)
