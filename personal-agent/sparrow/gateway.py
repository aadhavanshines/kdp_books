"""The gateway: the one long-running process at the centre of Sparrow.

Channels hand it messages; it decides who is talking, handles commands,
runs one conversation turn at a time per session, and sends replies back.
It also runs scheduled jobs and the heartbeat."""

from __future__ import annotations

import asyncio
import json
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timedelta

from .core import Core
from .privacy import PrivacyRouter
from .sessions import render
from .tools import Context, tools_for
from .brain import Reply, Turn

HELP = """Commands:
/new - start a fresh conversation (memory is kept)
/status - model, spending, jobs and approvals
/approve CODE, /deny CODE - answer an approval request
/pair approve CODE, /pair list, /pair remove ID - manage guests"""

PRIVATE_VALUES = """# Private Values

Some values appear as placeholders such as <EMAIL_1> or <PHONE_2>. Each
stands for a real value that stays on your owner's computer. Use the
placeholders exactly as written: tools receive the real values, and your
owner sees them in your replies."""

FLUSH = (
    "This conversation is about to be cleared. If anything in it is "
    "worth keeping, save it now with the remember tool. Then reply "
    "only with DONE."
)


@dataclass
class Inbound:
    channel: str  # 'telegram', 'web', 'terminal'
    sender_id: str
    sender_name: str
    chat_id: str
    text: str

    @property
    def identity(self) -> str:
        return f"{self.channel}:{self.sender_id}"

    @property
    def route(self) -> str:
        return f"{self.channel}:{self.chat_id}"


class Gateway:
    def __init__(self, core: Core, brain):
        self.core = core
        self.brain = brain
        self.channels = {}
        self.locks = defaultdict(asyncio.Lock)

    def add_channel(self, channel) -> None:
        self.channels[channel.name] = channel

    async def send(self, route: str, text: str) -> None:
        name, chat_id = route.split(":", 1)
        channel = self.channels.get(name)
        self.core.audit.log(
            self.core.now(),
            "outbound",
            route=route,
            text=text[:500],
            delivered=bool(channel),
        )
        if channel:
            await channel.send(chat_id, text)

    def owner_route(self) -> str:
        default = (
            self.core.settings.owners[0]
            if self.core.settings.owners
            else "terminal:owner"
        )
        return self.core.store.get("owner_route", default)

    # Incoming messages ------------------------------------------------

    async def handle(self, msg: Inbound) -> None:
        """Answer one incoming message. Never raises: a broken message
        must not stop the channel that delivered it."""
        try:
            await self.handle_message(msg)
        except Exception as error:
            self.core.audit.log(
                self.core.now(), "error", route=msg.route, error=repr(error)
            )

    async def handle_message(self, msg: Inbound) -> None:
        core = self.core
        role = core.pairing.role(msg.identity)
        core.audit.log(
            core.now(),
            "inbound",
            route=msg.route,
            sender=msg.identity,
            role=role,
            text=msg.text[:500],
        )
        if role == "stranger":
            await self.stranger(msg)
            return
        if role == "owner":
            core.store.put("owner_route", msg.route)
        text = msg.text.strip()
        if text.startswith("/"):
            reply = await self.command(msg, role, text)
        else:
            session = "main" if role == "owner" else msg.identity
            reply = await self.converse(
                session, role, msg.route, msg.sender_name, text
            )
        await self.send(msg.route, reply)

    async def stranger(self, msg: Inbound) -> None:
        code, new = self.core.pairing.request(
            msg.identity, msg.sender_name, self.core.now()
        )
        if not new:
            return  # one answer per stranger; no spam, no model call
        owner = self.core.settings.owner_name
        await self.send(
            msg.route,
            (
                f"Hi! I'm a private assistant and I don't know you yet. "
                f"If {owner} knows you, ask them to approve code {code}."
            ),
        )
        await self.send(
            self.owner_route(),
            (
                f"{msg.sender_name} ({msg.identity}) wants to talk to me. "
                f"Reply /pair approve {code} to let them in."
            ),
        )

    # One conversation turn --------------------------------------------

    async def converse(
        self,
        session: str,
        role: str,
        route: str,
        speaker: str,
        text: str,
        model: str | None = None,
        kind: str = "message",
    ) -> str:
        core, settings = self.core, self.core.settings
        async with self.locks[session]:
            now = core.now()
            if core.ledger.over_budget(now):
                return (
                    f"I've reached today's spending limit "
                    f"(US${settings.daily_budget_usd:.2f}), so I'm "
                    "pausing until tomorrow."
                )
            privacy = PrivacyRouter(settings.privacy)
            if kinds := privacy.blocked(text):
                core.audit.log(
                    now, "privacy_block", route=route, kinds=kinds
                )
                return (
                    "I didn't send that to the model because it "
                    f"contains private data ({', '.join(kinds)}). "
                    "Please leave it out."
                )
            history = core.sessions.history(session, settings.history_turns)
            prompt = f"New message from {speaker}:\n{text}"
            if history:
                prompt = (
                    "Conversation so far:\n"
                    + render(history, speaker)
                    + "\n\n"
                    + prompt
                )
            ws, skills = core.workspace, core.skills.index()
            if role == "guest":
                system = ws.guest_prompt(now, skills, speaker, route)
            else:
                system = ws.system_prompt(now, skills, speaker, route)
            if settings.privacy == "redact":
                system += "\n\n" + PRIVATE_VALUES
            ctx = Context(core, route, role, privacy)
            turn = Turn(
                privacy.redact(system),
                privacy.redact(prompt),
                tools_for(role),
                ctx,
                model or settings.model,
            )
            try:
                reply = await self.brain.respond(turn)
            except Exception as error:  # never leave the owner hanging
                reply = Reply("", error=repr(error))
            core.ledger.add(now, turn.model, kind, reply.cost_usd)
            if reply.error:
                answer = (
                    "Sorry, something went wrong on my side, so I "
                    "couldn't finish that. Please try again."
                )
            else:
                answer = privacy.restore(reply.text).strip()
            core.sessions.append(session, "user", text, now)
            core.sessions.append(session, "assistant", answer, now)
            core.audit.log(
                now,
                "turn",
                route=route,
                session=session,
                kind=kind,
                model=turn.model,
                cost_usd=reply.cost_usd,
                error=reply.error,
                tools=[c[0] for c in ctx.calls],
            )
            if ctx.notices:
                answer += "\n\n" + "\n".join(ctx.notices)
            return answer

    # Commands ---------------------------------------------------------

    async def command(self, msg: Inbound, role: str, text: str) -> str:
        core, now = self.core, self.core.now()
        word, _, rest = text.partition(" ")
        word, rest = word.lower(), rest.strip()
        session = "main" if role == "owner" else msg.identity
        if word == "/help":
            return HELP
        if word == "/new":
            if role == "owner":
                await self.converse(
                    session,
                    role,
                    msg.route,
                    msg.sender_name,
                    FLUSH,
                    kind="flush",
                )
            core.sessions.reset(session, now)
            return "Fresh start. (Long-term memory is kept.)"
        if role != "owner":
            return "Only my owner can use that command."
        if word == "/status":
            return self.status(now)
        if word in ("/approve", "/deny"):
            return await self.decide(rest, word == "/approve", msg)
        if word == "/pair":
            return self.pair(rest)
        return f"Unknown command {word}. Try /help."

    def status(self, now: datetime) -> str:
        core = self.core
        return (
            f"Model: {core.settings.model}\n"
            f"Spent today: US${core.ledger.spent(now):.4f} of "
            f"US${core.settings.daily_budget_usd:.2f}\n"
            f"Scheduled jobs: {len(core.scheduler.list())}\n"
            f"Waiting for approval: {len(core.approvals.pending(now))}\n"
            f"Guests: {
                sum(p['status'] == 'paired' for p in core.pairing.list())
            }"
        )

    async def decide(self, code: str, approve: bool, msg: Inbound) -> str:
        row = self.core.approvals.decide(code, approve, self.core.now())
        if row is None:
            return f"No pending request with code {code or '(none)'}."
        if not approve:
            return f"Denied: {row['summary']}."
        payload = json.loads(row["payload"])
        if row["action"] == "allow_host":
            self.core.egress.approve(payload["host"])
            note = f"Approved: {row['summary']}."
        elif row["action"] == "install_skill":
            self.core.skills.write(
                payload["name"],
                payload["description"],
                payload["instructions"],
            )
            note = f"Approved: the skill {payload['name']} is installed."
        else:
            return f"Unknown action {row['action']}."
        # Let Sparrow carry on with what it was doing
        follow_up = await self.converse(
            "main",
            "owner",
            row["route"],
            msg.sender_name,
            f"(System note: the owner approved: {row['summary']}. "
            "Continue with the request that needed it.)",
        )
        return note + "\n\n" + follow_up

    def pair(self, rest: str) -> str:
        pairing = self.core.pairing
        action, _, arg = rest.partition(" ")
        if action == "approve":
            who = pairing.approve(arg)
            return f"Paired {who}." if who else f"No pending code {arg}."
        if action == "remove":
            return (
                f"Removed {arg}."
                if pairing.remove(arg)
                else f"No guest {arg}."
            )
        people = pairing.list()
        return (
            "\n".join(
                f"{p['identity']} {p['name']} ({p['status']})"
                for p in people
            )
            or "No guests."
        )

    # Scheduled jobs and the heartbeat ---------------------------------

    async def tick(self) -> None:
        """Run whatever is due. Called every few seconds."""
        now = self.core.now()
        for job in self.core.scheduler.due(now):
            planned = datetime.fromisoformat(job["next_run"])
            late = now - planned > timedelta(minutes=10)
            note = (
                f" (late: this was due at {planned:%H:%M})" if late else ""
            )
            if job["kind"] == "remind":
                await self.send(
                    job["route"], f"Reminder: {job['message']}{note}"
                )
            else:
                answer = await self.converse(
                    "main",
                    "owner",
                    job["route"],
                    "Scheduler",
                    f"(Scheduled task{note}) {job['message']}",
                )
                await self.send(job["route"], answer)
            self.core.scheduler.done(job, now)
            self.core.audit.log(now, "job", id=job["id"], late=late)
        await self.heartbeat(now)

    async def heartbeat(self, now: datetime) -> None:
        settings, store = self.core.settings.heartbeat, self.core.store
        last = store.get("last_heartbeat")
        every = timedelta(minutes=settings.every_minutes)
        if last is None:  # just started: first beat after one interval
            store.put("last_heartbeat", now.isoformat())
            return
        if now - datetime.fromisoformat(last) < every:
            return
        store.put("last_heartbeat", now.isoformat())
        start, end = settings.active_hours
        if not start <= now.hour < end:
            return  # quiet hours
        checklist = self.core.workspace.read("HEARTBEAT.md")
        answer = await self.converse(
            "heartbeat",
            "heartbeat",
            self.owner_route(),
            "Heartbeat",
            f"Heartbeat at {now:%H:%M}. Follow your checklist:\n\n"
            f"{checklist}",
            model=self.core.settings.heartbeat_model,
            kind="heartbeat",
        )
        if answer.strip().startswith("HEARTBEAT_OK"):
            self.core.audit.log(now, "heartbeat", result="ok")
            return
        await self.send(self.owner_route(), answer)

    async def run_scheduler(self, every_seconds: float = 20) -> None:
        while True:
            try:
                await self.tick()
            except Exception as error:  # keep the loop alive
                self.core.audit.log(
                    self.core.now(), "scheduler_error", error=repr(error)
                )
            await asyncio.sleep(every_seconds)
