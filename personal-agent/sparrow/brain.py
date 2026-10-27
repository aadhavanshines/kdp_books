"""The brain: given the prompt and the tools, decide what to do and say.

ClaudeBrain uses Claude through the Claude Agent SDK. ScriptedBrain
follows a fixed script; the tests use it to check everything around the
model without paying for, or depending on, a real model call."""

from __future__ import annotations

import asyncio
import tempfile
from dataclasses import dataclass, field

from claude_agent_sdk import (
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

    async def once(self, turn: Turn) -> Reply:
        result = None
        async with asyncio.timeout(turn.timeout):
            async for message in query(
                prompt=turn.prompt, options=self.options(turn)
            ):
                if isinstance(message, ResultMessage):
                    result = message
        if result is None:
            return Reply("", error="no result from the model")
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
        for attempt in range(self.retries + 1):
            try:
                return await self.once(turn)
            except (ClaudeSDKError, TimeoutError, OSError) as error:
                # Retry only if no tool ran: a retry must never repeat
                # something that already happened.
                if turn.ctx.calls or attempt == self.retries:
                    return Reply(
                        "",
                        error=f"{type(error).__name__}: {error}",
                        tool_calls=turn.ctx.calls,
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
