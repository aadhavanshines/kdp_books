"""Print an agent's messages as they arrive, so you can watch it work.

Every project in this book uses this same file. It shows Claude's text, each tool
call and its result, and a summary line with the turns, time and cost.
"""
import json

from claude_agent_sdk import (AssistantMessage, ResultMessage, TextBlock, ToolResultBlock,
                              ToolUseBlock, UserMessage)
from rich.console import Console
from rich.panel import Panel

console = Console(highlight=False)


def short(value, limit=300):
    """Shorten long text so one tool result doesn't fill the screen."""
    text = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False)
    text = " · ".join(line.strip() for line in text.splitlines() if line.strip())
    return text if len(text) <= limit else text[:limit] + " ..."


def tool_label(name):
    """Turn 'mcp__pantry__check_pantry' into 'check_pantry'."""
    return name.split("__")[-1]


def show(message):
    """Print one message from the agent's stream. Returns the final result text, if any."""
    if isinstance(message, AssistantMessage):
        for block in message.content:
            if isinstance(block, TextBlock) and block.text.strip():
                console.print(Panel(block.text.strip(), title="Claude", title_align="left",
                                    border_style="green"))
            elif isinstance(block, ToolUseBlock):
                console.print(f"[bold cyan]→ {tool_label(block.name)}[/] [dim]{short(block.input)}[/]")
    elif isinstance(message, UserMessage) and isinstance(message.content, list):
        for block in message.content:
            if isinstance(block, ToolResultBlock):
                content = block.content
                if isinstance(content, list):
                    content = " ".join(c.get("text", "") for c in content if isinstance(c, dict))
                style = "red" if block.is_error else "yellow"
                console.print(f"  [{style}]← {short(content or '', 200)}[/]")
    elif isinstance(message, ResultMessage):
        cost = message.total_cost_usd or 0
        console.print(f"[dim]Done: {message.num_turns} turns, {message.duration_ms / 1000:.1f} s, "
                      f"${cost:.4f}[/]")
        return message.result
    return None
