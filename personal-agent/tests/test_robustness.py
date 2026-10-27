"""Non-functional tests that need no model: retries, concurrency and
ordering, and the command line."""

from __future__ import annotations

import asyncio
import stat
import time

import pytest
from claude_agent_sdk import ClaudeSDKError

from sparrow.__main__ import main, supervise
from sparrow.brain import ClaudeBrain, Reply, Turn
from sparrow.privacy import PrivacyRouter
from sparrow.sandbox import backend
from sparrow.tools import Context

from conftest import owner_says, stranger_says

pytestmark = pytest.mark.anyio


# Retries ------------------------------------------------------------------


def turn_for(core):
    ctx = Context(core, "telegram:100", "owner", PrivacyRouter())
    return Turn("system", "prompt", [], ctx, "claude-sonnet-5-5")


@pytest.fixture
def no_waiting(monkeypatch):
    async def instant(seconds):
        return None

    monkeypatch.setattr(asyncio, "sleep", instant)


async def test_brain_retries_a_failed_call(core, monkeypatch, no_waiting):
    attempts = []

    async def flaky(self, turn):
        attempts.append(1)
        if len(attempts) < 3:
            raise ClaudeSDKError("overloaded")
        return Reply("Done")

    monkeypatch.setattr(ClaudeBrain, "once", flaky)
    reply = await ClaudeBrain(retries=2).respond(turn_for(core))
    assert reply.text == "Done" and len(attempts) == 3


async def test_brain_never_retries_after_a_tool_ran(
    core, monkeypatch, no_waiting
):
    attempts = []

    async def fails_after_tool(self, turn):
        attempts.append(1)
        turn.ctx.calls.append(("remember", {}, "Saved"))
        raise ClaudeSDKError("connection lost")

    monkeypatch.setattr(ClaudeBrain, "once", fails_after_tool)
    reply = await ClaudeBrain(retries=2).respond(turn_for(core))
    assert len(attempts) == 1 and "connection lost" in reply.error


async def test_brain_gives_up_after_its_retries(
    core, monkeypatch, no_waiting
):
    async def always_down(self, turn):
        raise TimeoutError()

    monkeypatch.setattr(ClaudeBrain, "once", always_down)
    reply = await ClaudeBrain(retries=1).respond(turn_for(core))
    assert reply.error.startswith("TimeoutError")


# Concurrency --------------------------------------------------------------


class SlowBrain:
    """Takes 0.2 s per answer and records the order it saw messages."""

    def __init__(self):
        self.seen = []

    async def respond(self, turn):
        message = turn.prompt.rsplit("\n", 1)[-1]
        self.seen.append(message)
        await asyncio.sleep(0.2)
        return Reply(f"echo {message}")


async def test_conversations_run_in_parallel_but_each_in_order(
    make_gateway, core
):
    gateway, _, telegram = make_gateway([])
    gateway.brain = SlowBrain()
    for n in range(10):
        core.pairing.request(f"telegram:{n}", f"Guest {n}", core.now())
        core.pairing.approve(core.pairing.list()[-1]["code"])
    jobs = [
        gateway.handle(stranger_says(f"guest {n}", sender=str(n)))
        for n in range(10)
    ]
    jobs += [gateway.handle(owner_says(f"owner {n}")) for n in range(3)]
    start = time.perf_counter()
    await asyncio.gather(*jobs)
    took = time.perf_counter() - start
    # 13 answers at 0.2 s each: about 0.6 s, not 2.6 s, because guests
    # run side by side while the owner's three wait their turn
    assert took < 1.2
    owner = [m for m in gateway.brain.seen if m.startswith("owner")]
    assert owner == ["owner 0", "owner 1", "owner 2"]
    assert len(telegram.sent) == 13


async def test_placeholders_are_explained_to_the_model(make_gateway, core):
    gateway, brain, _ = make_gateway([[("say", "ok")], [("say", "ok")]])
    await gateway.handle(owner_says("hi"))
    assert "# Private Values" in brain.turns[0].system
    core.settings.privacy = "off"
    await gateway.handle(owner_says("hi"))
    assert "# Private Values" not in brain.turns[1].system


async def test_a_part_that_stops_stops_sparrow_with_an_error():
    async def forever():
        await asyncio.sleep(3600)

    async def crashes():
        raise OSError("address already in use")

    async def ends():
        return None

    running = [asyncio.create_task(forever()) for _ in range(3)]
    crash = asyncio.create_task(crashes())
    with pytest.raises(OSError, match="already in use"):
        await supervise([running[0], crash])
    with pytest.raises(RuntimeError, match="stopped unexpectedly"):
        await supervise([running[1], asyncio.create_task(ends())])
    chat = asyncio.create_task(ends())  # the terminal chat may end
    await supervise([running[2], chat], may_finish=chat)
    for task in running:
        task.cancel()


# The command line ---------------------------------------------------------


@pytest.mark.skipif(backend() is None, reason="doctor checks the sandbox")
def test_init_doctor_status_and_pairing(
    tmp_path, capsys, core, monkeypatch
):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test")
    home = tmp_path / "home"
    assert main(["--home", str(home), "init"]) == 0
    secrets = home / "state" / "secrets.env"
    assert stat.S_IMODE(secrets.stat().st_mode) == 0o600
    assert "SPARROW_WEB_TOKEN=" in secrets.read_text()
    assert (home / "workspace" / "SOUL.md").exists()
    assert main(["--home", str(home), "doctor"]) == 0
    assert "All good." in capsys.readouterr().out
    main(["--home", str(home), "status"])
    assert "Spent today: US$0.0000" in capsys.readouterr().out
    main(["--home", str(home), "pairing", "approve", "NOPE"])
    assert "No such pending code." in capsys.readouterr().out
