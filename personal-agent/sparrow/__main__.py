"""Sparrow's command line.

python -m sparrow init       create ~/.sparrow with a starter config
python -m sparrow doctor     check that everything is set up
python -m sparrow chat       chat in this terminal
python -m sparrow run        run the gateway with every channel
python -m sparrow status     show spending, jobs and approvals
python -m sparrow pairing approve CODE
"""

from __future__ import annotations

import argparse
import asyncio
import os
import secrets
import shutil
import sys
from pathlib import Path

from .config import load_settings
from .core import Core
from .sandbox import run_sandboxed
from .skills import SkillLibrary
from .vault import Vault

STARTER = """\
# Sparrow's settings. See Appendix A of the book for every option.
owner_name: {name}
owners: []            # e.g. ["telegram:123456789"] once you know your ID
model: claude-sonnet-5-5
heartbeat_model: claude-haiku-4-5
timezone: {zone}
daily_budget_usd: 2.00
privacy: redact       # redact, block or off
webchat:
  enabled: true
  port: 8765
telegram:
  enabled: false
heartbeat:
  every_minutes: 30
  active_hours: [8, 22]
egress:
  allow: [en.wikipedia.org, "*.wikipedia.org"]
  deny: []
  unknown: ask        # ask or deny
"""


def init(home: Path) -> None:
    home.mkdir(parents=True, exist_ok=True)
    config = home / "sparrow.yaml"
    if not config.exists():
        zone = os.environ.get("TZ", "UTC")
        config.write_text(
            STARTER.format(name=os.environ.get("USER", "Owner"), zone=zone)
        )
    secrets_file = home / "state" / "secrets.env"
    secrets_file.parent.mkdir(parents=True, exist_ok=True)
    if not secrets_file.exists():
        secrets_file.write_text(
            f"SPARROW_WEB_TOKEN={secrets.token_urlsafe(24)}\n"
        )
        secrets_file.chmod(0o600)
    Core(load_settings(home)).close()  # creates the workspace
    print(f"Sparrow's home is ready: {home}")
    print(
        f"Edit {home / 'sparrow.yaml'} and "
        f"{home / 'workspace' / 'USER.md'}, then run: "
        "python -m sparrow doctor"
    )


def load_model_key(home: Path) -> None:
    """Read ANTHROPIC_API_KEY from state/model.env (which must be
    chmod 600) unless it's set already. Then no service file has to
    hold the key: a macOS launch agent would keep it in plain text."""
    if not os.environ.get("ANTHROPIC_API_KEY"):
        model_env = Vault(home / "state" / "model.env")
        if key := model_env.get("ANTHROPIC_API_KEY"):
            os.environ["ANTHROPIC_API_KEY"] = key


def doctor(home: Path) -> int:
    problems = 0

    def check(ok: bool, good: str, bad: str) -> None:
        nonlocal problems
        print(("  ok   " if ok else "  FIX  ") + (good if ok else bad))
        problems += not ok

    settings = load_settings(home)
    core = Core(settings)
    print(f"Checking {home}")
    login = (
        "ANTHROPIC_API_KEY is set"
        if os.environ.get("ANTHROPIC_API_KEY")
        else "Claude Code's login will be used"
        if shutil.which("claude")
        else ""
    )
    check(bool(login), login, "set ANTHROPIC_API_KEY (see Chapter 3)")
    code, out = run_sandboxed(
        "echo sandbox-ok",
        core.workspace.files,
        core.workspace.skills_dir,
        settings.sandbox,
    )
    check(
        code == 0 and "sandbox-ok" in out,
        "the sandbox works",
        f"the sandbox failed: {out.strip()[:200]}",
    )
    library = SkillLibrary(core.workspace.skills_dir)
    skills = library.load()
    check(
        not library.problems,
        f"{len(skills)} skills load",
        "; ".join(library.problems),
    )
    if settings.telegram.enabled:
        check(
            bool(core.vault.get(settings.telegram.token_env)),
            "the Telegram token is set",
            f"put {settings.telegram.token_env}=... in state/secrets.env",
        )
        check(
            bool(settings.owners),
            "an owner is listed",
            "add your Telegram ID to owners in sparrow.yaml",
        )
    if settings.webchat.enabled:
        check(
            bool(core.vault.get(settings.webchat.token_env)),
            "the web chat token is set",
            f"put {settings.webchat.token_env}=... in state/secrets.env",
        )
    print("All good." if not problems else f"{problems} thing(s) to fix.")
    core.close()
    return 1 if problems else 0


async def supervise(tasks: list, may_finish=None) -> None:
    """Run until one task stops. Only the terminal chat may stop
    normally; anything else stopping is a failure, raised so Sparrow
    exits with an error and a service manager restarts it."""
    done, _ = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
    for task in done:
        if task.exception():
            raise task.exception()
        if task is not may_finish:
            raise RuntimeError("part of Sparrow stopped unexpectedly")


async def serve(home: Path, terminal: bool) -> None:
    from .brain import ClaudeBrain
    from .gateway import Gateway

    settings = load_settings(home)
    core = Core(settings)
    gateway = Gateway(core, ClaudeBrain())
    jobs = [gateway.run_scheduler()]
    if terminal:
        from .channels.terminal import TerminalChannel

        channel = TerminalChannel()
        gateway.add_channel(channel)
        jobs.append(channel.run(gateway))
    else:
        if settings.webchat.enabled:
            from .channels.webchat import WebChatChannel

            token = core.vault.get(settings.webchat.token_env)
            if not token:
                core.close()
                raise SystemExit(
                    f"Set {settings.webchat.token_env} in "
                    "state/secrets.env (python -m sparrow doctor helps)"
                )
            web = WebChatChannel(token)
            gateway.add_channel(web)
            # In a container, SPARROW_WEB_HOST=0.0.0.0 (see the Dockerfile)
            host = os.environ.get("SPARROW_WEB_HOST", settings.webchat.host)
            port = settings.webchat.port
            jobs.append(web.run(gateway, host, port))
            print(f"Web chat: http://{host}:{port}/?token=...")
        if settings.telegram.enabled:
            from .channels.telegram import TelegramChannel

            telegram = TelegramChannel(
                core.vault.get(settings.telegram.token_env),
                settings.telegram.api_url,
            )
            gateway.add_channel(telegram)
            jobs.append(telegram.run(gateway))
    print("Sparrow is running. Press Ctrl+C to stop.", flush=True)
    tasks = [asyncio.create_task(job) for job in jobs]
    # Stop when the terminal chat ends, or run until interrupted
    await supervise(tasks, may_finish=tasks[-1] if terminal else None)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="sparrow")
    parser.add_argument(
        "--home",
        type=Path,
        default=Path(os.environ.get("SPARROW_HOME", "~/.sparrow")),
    )
    sub = parser.add_subparsers(dest="command", required=True)
    for name in ("init", "doctor", "chat", "run", "status"):
        sub.add_parser(name)
    pairing = sub.add_parser("pairing")
    pairing.add_argument("action", choices=["list", "approve", "remove"])
    pairing.add_argument("value", nargs="?")
    args = parser.parse_args(argv)
    home = args.home.expanduser()
    if args.command in ("doctor", "chat", "run"):
        load_model_key(home)

    if args.command == "init":
        init(home)
    elif args.command == "doctor":
        return doctor(home)
    elif args.command in ("chat", "run"):
        try:
            asyncio.run(serve(home, terminal=args.command == "chat"))
        except KeyboardInterrupt:
            print("\nStopped.")
    elif args.command == "status":
        from .gateway import Gateway

        core = Core(load_settings(home))
        print(Gateway(core, brain=None).status(core.now()))
        core.close()
    elif args.command == "pairing":
        core = Core(load_settings(home))
        if args.action == "list":
            for p in core.pairing.list():
                print(p["identity"], p["name"], p["status"], p["code"])
        elif args.action == "approve":
            who = core.pairing.approve(args.value or "")
            print(f"Paired {who}." if who else "No such pending code.")
        else:
            print(
                "Removed."
                if core.pairing.remove(args.value or "")
                else "No such guest."
            )
        core.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
