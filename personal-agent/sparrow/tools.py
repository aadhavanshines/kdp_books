"""Sparrow's tools, and the one place every tool call passes through.

call_tool() checks who is asking, puts private values back (the model
only saw placeholders), runs the tool, scrubs secrets and private data
from the result, and writes the call to the audit log."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from pathlib import Path
from typing import Awaitable, Callable
from urllib.parse import urlsplit

from .core import Core
from .privacy import PrivacyRouter
from .sandbox import run_sandboxed

MAX_READ = 50_000


@dataclass
class Context:
    core: Core
    route: str  # where the conversation is: 'telegram:123'
    role: str  # 'owner', 'guest' or 'heartbeat'
    privacy: PrivacyRouter
    calls: list = field(default_factory=list)  # (name, args, result)
    notices: list = field(default_factory=list)  # lines for the owner


Handler = Callable[[Context, dict], Awaitable[str]]


@dataclass
class Tool:
    name: str
    description: str
    schema: dict
    handler: Handler
    guests: bool = False  # may paired guests use it?


def schema(**params) -> dict:
    """params: name=(type, description); a type ending in '?' is
    optional, for example ('string?', 'a due date')."""
    props, required = {}, []
    for name, (kind, text) in params.items():
        props[name] = {"type": kind.rstrip("?"), "description": text}
        if not kind.endswith("?"):
            required.append(name)
    return {"type": "object", "properties": props, "required": required}


def untrusted(source: str, text: str) -> str:
    """Mark content from outside, so the model treats it as data."""
    text = text.replace("</untrusted>", "</ untrusted>")
    return f'<untrusted source="{source}">\n{text}\n</untrusted>'


def safe_path(ctx: Context, name: str) -> Path:
    """A path inside the files folder, or an error: no ../ escapes and
    no symbolic links that point outside."""
    root = ctx.core.workspace.files.resolve()
    path = (root / name).resolve()
    if path != root and root not in path.parents:
        raise PermissionError(f"{name} is outside the files folder")
    return path


# Memory ---------------------------------------------------------------


async def memory_search(ctx, args):
    hits = ctx.core.memory.search(args["query"])
    if not hits:
        return f"Nothing in memory matches {args['query']!r}."
    return "\n".join(f"- ({source}) {text}" for source, text in hits)


async def remember(ctx, args):
    ctx.core.memory.note(f"Remembered: {args['fact']}", ctx.core.now())
    return ctx.core.memory.remember(args["fact"], ctx.core.now())


# Files ----------------------------------------------------------------


async def list_files(ctx, args):
    root = ctx.core.workspace.files
    names = sorted(
        str(p.relative_to(root)) for p in root.rglob("*") if p.is_file()
    )
    return "\n".join(names) or "The files folder is empty."


async def read_file(ctx, args):
    path = safe_path(ctx, args["path"])
    if not path.is_file():
        return f"There is no file called {args['path']}."
    text = path.read_text(errors="replace")[:MAX_READ]
    return untrusted(f"file:{args['path']}", text)


async def write_file(ctx, args):
    path = safe_path(ctx, args["path"])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(args["content"])
    return f"Saved {args['path']} ({len(args['content'])} characters)."


# To-dos ---------------------------------------------------------------


async def todo_add(ctx, args):
    number = ctx.core.todo.add(args["text"], args.get("due") or None)
    return f"Added to-do {number}: {args['text']}"


async def todo_list(ctx, args):
    return ctx.core.todo.show(include_done=False)


async def todo_done(ctx, args):
    text = ctx.core.todo.complete(int(args["number"]))
    return f"Marked done: {text}"


# Schedule -------------------------------------------------------------


async def schedule(ctx, args):
    job_id, first, repeat = ctx.core.scheduler.add(
        args["kind"],
        args["message"],
        args["when"],
        ctx.route,
        ctx.core.now(),
    )
    again = f", repeating {repeat}" if repeat else ""
    return f"Scheduled job {job_id} for {first:%a %Y-%m-%d %H:%M}{again}."


async def list_schedule(ctx, args):
    jobs = ctx.core.scheduler.list()
    if not jobs:
        return "Nothing is scheduled."
    return "\n".join(
        f"{j['id']}. {j['next_run'][:16].replace('T', ' ')} "
        f"[{j['kind']}{', ' + j['repeat'] if j['repeat'] else ''}] "
        f"{j['message']}"
        for j in jobs
    )


async def cancel_schedule(ctx, args):
    if ctx.core.scheduler.cancel(int(args["job_id"])):
        return f"Cancelled job {args['job_id']}."
    return f"There is no active job {args['job_id']}."


# The web --------------------------------------------------------------


async def web_fetch(ctx, args):
    url = args["url"]
    status, text = await ctx.core.fetcher.fetch(url)
    ctx.core.audit.log(
        ctx.core.now(),
        "egress",
        url=url,
        verdict=status,
        reason=text if status != "ok" else "",
    )
    if status == "ok":
        return untrusted(url, text)
    if status == "ask":
        host = urlsplit(url).hostname
        code = ctx.core.approvals.request(
            "allow_host",
            {"host": host},
            f"visit {host}",
            ctx.route,
            ctx.core.now(),
        )
        ctx.notices.append(
            f"Approval needed: let Sparrow visit {host}? "
            f"Reply /approve {code} or /deny {code}"
        )
        return (
            f"Waiting for approval: your owner has been asked to "
            f"allow {host} (code {code})."
        )
    return f"Blocked: {text}."


# Commands -------------------------------------------------------------


async def run_command(ctx, args):
    core = ctx.core
    code, output = await asyncio.to_thread(
        run_sandboxed,
        args["command"],
        core.workspace.files,
        core.workspace.skills_dir,
        core.settings.sandbox,
    )
    return untrusted("sandbox", f"exit code {code}\n{output}")


# Skills ---------------------------------------------------------------


async def read_skill(ctx, args):
    return ctx.core.skills.read(args["name"])


async def write_skill(ctx, args):
    payload = {
        "name": args["name"],
        "description": args["description"],
        "instructions": args["instructions"],
    }
    code = ctx.core.approvals.request(
        "install_skill",
        payload,
        f"install the skill {args['name']}",
        ctx.route,
        ctx.core.now(),
    )
    ctx.notices.append(
        f"Approval needed: install the new skill "
        f"{args['name']!r}? Reply /approve {code} or "
        f"/deny {code}"
    )
    return (
        f"Waiting for approval: your owner must approve new skills "
        f"(code {code})."
    )


S = schema
TOOLS = [
    Tool(
        "memory_search",
        "Search long-term memory and daily notes.",
        S(query=("string", "words to look for")),
        memory_search,
    ),
    Tool(
        "remember",
        "Save one durable fact about the owner to memory.",
        S(fact=("string", "the fact, in one sentence")),
        remember,
    ),
    Tool("list_files", "List the owner's files.", S(), list_files),
    Tool(
        "read_file",
        "Read a text file from the owner's files.",
        S(path=("string", "path inside the files folder")),
        read_file,
    ),
    Tool(
        "write_file",
        "Create or replace a text file in the owner's files.",
        S(
            path=("string", "path inside the files folder"),
            content=("string", "the full new text"),
        ),
        write_file,
    ),
    Tool(
        "todo_add",
        "Add a to-do.",
        S(
            text=("string", "what to do"),
            due=("string?", "due date, YYYY-MM-DD"),
        ),
        todo_add,
    ),
    Tool(
        "todo_list", "Show open to-dos with their numbers.", S(), todo_list
    ),
    Tool(
        "todo_done",
        "Mark a to-do done by its number.",
        S(number=("integer", "the to-do's number")),
        todo_done,
    ),
    Tool(
        "schedule",
        "Schedule a reminder (sent word for word) or a task "
        "(you will be asked to do it then). 'when' must look like: "
        "2026-10-28 09:00, in 30 minutes, tomorrow 07:30, daily 08:00, "
        "weekdays 08:00, weekly mon 09:00, every 2 hours.",
        S(
            kind=("string", "remind or task"),
            message=("string", "the reminder text or the task"),
            when=("string", "when, in one of the forms above"),
        ),
        schedule,
    ),
    Tool("list_schedule", "List scheduled jobs.", S(), list_schedule),
    Tool(
        "cancel_schedule",
        "Cancel a scheduled job by its number.",
        S(job_id=("integer", "the job's number")),
        cancel_schedule,
    ),
    Tool(
        "web_fetch",
        "Fetch a web page as text. Some sites need the "
        "owner's approval first.",
        S(url=("string", "the full URL")),
        web_fetch,
    ),
    Tool(
        "run_command",
        "Run a shell command in a sandbox, in the "
        "owner's files folder (no network). Python 3 is available.",
        S(command=("string", "the shell command")),
        run_command,
    ),
    Tool(
        "read_skill",
        "Read a skill's instructions before using it.",
        S(name=("string", "the skill's name")),
        read_skill,
        guests=True,
    ),
    Tool(
        "write_skill",
        "Propose a new skill (needs owner approval).",
        S(
            name=("string", "lowercase-with-hyphens"),
            description=("string", "one line: when to use it"),
            instructions=("string", "the steps, in Markdown"),
        ),
        write_skill,
    ),
]
BY_NAME = {t.name: t for t in TOOLS}


def tools_for(role: str) -> list[Tool]:
    return [t for t in TOOLS if role != "guest" or t.guests]


async def call_tool(ctx: Context, name: str, args: dict) -> str:
    """Run one tool call safely, whoever asked for it."""
    tool = BY_NAME.get(name)
    if tool is None or tool not in tools_for(ctx.role):
        result = f"Error: the tool {name} is not available here."
    else:
        try:
            result = await tool.handler(ctx, ctx.privacy.restore_args(args))
        except Exception as error:  # the model sees the reason, not a crash
            result = f"Error: {error}"
    result = ctx.privacy.redact(ctx.core.vault.scrub(result))
    ctx.calls.append((name, args, result))
    ctx.core.audit.log(
        ctx.core.now(),
        "tool",
        route=ctx.route,
        tool=name,
        args=args,
        result=result[:500],
    )
    return result
