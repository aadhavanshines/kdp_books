# Appendix D: Agent SDK Cheat Sheet

A quick reference for the parts of the Claude Agent SDK for Python used in this book, checked against version 0.2.164. The SDK has more options than these; the official reference (Appendix F) lists them all.

## Install and Import

```
pip install claude-agent-sdk
```

```
from claude_agent_sdk import (
    ClaudeAgentOptions, ClaudeSDKClient, query,
    tool, create_sdk_mcp_server, ToolAnnotations,
    HookMatcher, AgentDefinition,
    AssistantMessage, UserMessage, SystemMessage, ResultMessage,
    TextBlock, ToolUseBlock, ToolResultBlock,
    PermissionResultAllow, PermissionResultDeny,
)
```

## Two Ways to Run an Agent

| | `query()` | `ClaudeSDKClient` |
| --- | --- | --- |
| Use for | One task, then finish | A conversation with several messages |
| Shape | `async for m in query(prompt=..., options=...)` | `async with ClaudeSDKClient(options) as c:` then `await c.query(...)` and `async for m in c.receive_response()` |
| Seen in | Most projects | Support desk (Chapter 10) |

## Options Used in This Book

| Option | Example | Purpose |
| --- | --- | --- |
| `model` | `"claude-sonnet-5-5"` | Which Claude model |
| `fallback_model` | `"claude-haiku-4-5"` | Used if the main model is unavailable |
| `system_prompt` | A string | The agent's instructions |
| `tools` | `[]`, `["Read", "Glob"]` | Which built-in tools exist |
| `allowed_tools` | `["mcp__shop__*", "Bash(python3 *)"]` | Run without asking |
| `disallowed_tools` | `["mcp__stock__record_usage"]` | Never run |
| `permission_mode` | `"dontAsk"` | Refuse anything not allowed |
| `can_use_tool` | An async function | Decide undecided calls, for example by asking a person |
| `mcp_servers` | `{"shop": server}` | In-process or external MCP servers |
| `output_format` | `{"type": "json_schema", "schema": SCHEMA}` | Structured output, in `ResultMessage.structured_output` |
| `max_turns` | `25` | Stop a runaway loop |
| `max_budget_usd` | `0.75` | Stop a run that costs too much |
| `cwd` | `"docs"` | The agent's working folder |
| `sandbox` | `{"enabled": True, "allowUnsandboxedCommands": False}` | Run commands in an operating-system sandbox |
| `hooks` | `{"PostToolUse": [HookMatcher(hooks=[log])]}` | Your code at points in the loop |
| `agents` | `{"researcher": AgentDefinition(...)}` | Subagents |
| `setting_sources` | `[]` | Don't load local settings or `CLAUDE.md` files |
| `resume` | A session ID | Continue an earlier session |

## A Custom Tool

```
@tool("check_pantry", "List what's in the pantry.", {},
      annotations=ToolAnnotations(readOnlyHint=True))
async def check_pantry(args):
    return {"content": [{"type": "text", "text": "rice: 2 kg"}]}

kitchen = create_sdk_mcp_server(name="kitchen", version="1.0.0",
                                tools=[check_pantry])
# Its full name, for allowed_tools: "mcp__kitchen__check_pantry"
```

Return `"is_error": True` alongside `content` to tell Claude the call failed.

## An External MCP Server

```
mcp_servers={"stock": {
    "type": "stdio",
    "command": "python",
    "args": ["stock_server.py"],
    "alwaysLoad": True,   # connect before the first turn
}}
```

To check that each server connected, read the first message of the run: a `SystemMessage` whose subtype is `init`. Its `data` lists every MCP server with its status.

## Messages You'll Receive

| Message | Contains |
| --- | --- |
| `SystemMessage` (`subtype="init"`) | Session ID, model, tools, MCP server status |
| `AssistantMessage` | Claude's `TextBlock`s, `ThinkingBlock`s and `ToolUseBlock`s |
| `UserMessage` | `ToolResultBlock`s: the results of tool calls |
| `RateLimitEvent` | A change in rate-limit status |
| `ResultMessage` | The end: `subtype`, `is_error`, `result`, `structured_output`, `num_turns`, `total_cost_usd`, `usage`, `model_usage`, `session_id` |

Result subtypes include `success`, `error_max_turns`, `error_max_budget_usd` and `error_during_execution`. Always check `is_error` too.

## Hooks

```
async def audit(input_data, tool_use_id, context):
    print(input_data["tool_name"], input_data.get("tool_response"))
    return {}

hooks={"PostToolUse": [HookMatcher(hooks=[audit])]}
```

To block a call from a `PreToolUse` hook, return:

```
{"hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Refunds are paused. Escalate instead.",
}}
```

## Asking a Person

```
async def ask_owner(tool_name, tool_input, context):
    if await approved(tool_input):
        return PermissionResultAllow()
    return PermissionResultDeny(message="The owner said no. Offer a "
                                        "replacement instead.")
```

The tool must not be in `allowed_tools`, or the callback is never asked.

## Subagents

```
agents={"fact-checker": AgentDefinition(
    description="Checks every number in the copy against the data.",
    prompt="You are a careful fact-checker...",
    tools=["Read", "Grep", "Edit"],
)}
```

The coordinator needs the `Agent` tool in its own tool list to hand work to subagents.

## Model Names (October 2026)

| Model | ID | Price per million tokens, input / output |
| --- | --- | --- |
| Claude Haiku 5.5 | `claude-haiku-5-5` | $0.10 / $0.50 (prompts up to 100,000 tokens) |
| Claude Haiku 4.5 | `claude-haiku-4-5` | $1 / $5 |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | $2 / $10 |
| Claude Opus 5.5 | `claude-opus-5-5` | $4 / $20 |
| Claude Fable 5.1 | `claude-fable-5-1` | $10 / $50 |

Prices and models change; check the official pricing page (Appendix F) before relying on these numbers. Cache reads cost a small fraction of the input price, and the fraction differs by model, so take those from the pricing page too.
