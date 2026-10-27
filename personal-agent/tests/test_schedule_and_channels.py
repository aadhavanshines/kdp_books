"""Functional tests for time-driven work (reminders, tasks, heartbeat)
and for the three channels: terminal, web chat and Telegram."""

from __future__ import annotations

from datetime import timedelta

import httpx
import pytest
from fastapi.testclient import TestClient

from sparrow.channels.telegram import TelegramChannel, chunks
from sparrow.channels.terminal import TerminalChannel
from sparrow.channels.webchat import WebChatChannel
from sparrow.config import load_settings
from sparrow.core import Core
from sparrow.gateway import Gateway

from conftest import owner_says
from fake_telegram import TOKEN, FakeTelegram

pytestmark = pytest.mark.anyio


# Reminders and tasks ------------------------------------------------------


async def test_reminder_arrives_on_time(make_gateway, core, clock):
    gateway, brain, telegram = make_gateway(
        [
            [
                (
                    "tool",
                    "schedule",
                    {
                        "kind": "remind",
                        "message": "Call the vet",
                        "when": "in 30 minutes",
                    },
                ),
                ("say", "I'll remind you at 09:30."),
            ]
        ]
    )
    core.settings.heartbeat.every_minutes = 10_000  # no heartbeat
    await gateway.handle(owner_says("Remind me to call the vet in 30 min"))
    clock.advance(minutes=29)
    await gateway.tick()
    assert telegram.texts() == ["I'll remind you at 09:30."]
    clock.advance(minutes=1)
    await gateway.tick()
    assert telegram.sent[-1] == ("100", "Reminder: Call the vet")
    await gateway.tick()  # only once
    assert len(telegram.sent) == 2 and len(brain.turns) == 1


async def test_task_job_runs_sparrow_and_repeats(make_gateway, core, clock):
    gateway, brain, telegram = make_gateway(
        lambda turn: [("say", "Good morning! 2 to-dos today.")]
    )
    core.settings.heartbeat.every_minutes = 10_000
    core.scheduler.add(
        "task",
        "Send my daily briefing",
        "daily 08:00",
        "telegram:100",
        clock.now,
    )
    clock.advance(hours=23)  # 08:00 next day
    await gateway.tick()
    assert (
        "(Scheduled task) Send my daily briefing" in brain.turns[0].prompt
    )
    assert telegram.texts() == ["Good morning! 2 to-dos today."]
    assert core.scheduler.list()[0]["next_run"].startswith("2026-10-29T08")


async def test_jobs_survive_a_restart_and_say_they_are_late(home, clock):
    first = Core(load_settings(home), clock=clock)
    first.scheduler.add(
        "remind",
        "Take the cake out",
        "in 10 minutes",
        "telegram:100",
        clock.now,
    )
    del first  # Sparrow stops...
    clock.advance(hours=2)  # ...and is off for 2 hours
    second = Core(load_settings(home), clock=clock)
    second.settings.heartbeat.every_minutes = 10_000
    gateway = Gateway(second, brain=None)
    from conftest import Recorder

    telegram = Recorder("telegram")
    gateway.add_channel(telegram)
    await gateway.tick()
    assert telegram.texts() == [
        "Reminder: Take the cake out (late: this was due at 09:10)"
    ]


# Heartbeat ----------------------------------------------------------------


def beat_due(core, clock):
    """Pretend the last heartbeat was one interval ago."""
    core.store.put(
        "last_heartbeat", (clock.now - timedelta(minutes=30)).isoformat()
    )


async def test_first_heartbeat_waits_one_interval(make_gateway, clock):
    gateway, brain, _ = make_gateway(lambda turn: [("say", "HEARTBEAT_OK")])
    await gateway.tick()  # just started: no beat
    clock.advance(minutes=30)
    await gateway.tick()
    assert len(brain.turns) == 1


async def test_heartbeat_ok_stays_silent(make_gateway, core, clock):
    gateway, brain, telegram = make_gateway(
        lambda turn: [("say", "HEARTBEAT_OK")]
    )
    beat_due(core, clock)
    await gateway.tick()
    assert len(brain.turns) == 1 and telegram.sent == []
    assert brain.turns[0].model == "claude-haiku-4-5"
    assert "Heartbeat Checklist" in brain.turns[0].prompt


async def test_heartbeat_speaks_up_when_needed(make_gateway, core):
    core.todo.add("Pay electricity bill", "2026-10-27")
    gateway, _, telegram = make_gateway(
        lambda turn: [
            ("tool", "todo_list", {}),
            ("say", "Reminder: the electricity bill is due today."),
        ]
    )
    beat_due(core, core.clock)
    await gateway.tick()
    assert telegram.sent == [
        ("100", "Reminder: the electricity bill is due today.")
    ]


async def test_heartbeat_interval_and_quiet_hours(
    make_gateway, core, clock
):
    gateway, brain, _ = make_gateway(lambda turn: [("say", "HEARTBEAT_OK")])
    beat_due(core, clock)
    await gateway.tick()  # 09:00 runs
    clock.advance(minutes=20)
    await gateway.tick()  # too soon
    clock.advance(minutes=10)
    await gateway.tick()  # 09:30 runs
    assert len(brain.turns) == 2
    clock.advance(hours=13)  # 22:30: quiet hours
    await gateway.tick()
    assert len(brain.turns) == 2


async def test_heartbeat_goes_to_the_last_channel_used(make_gateway, core):
    gateway, _, _ = make_gateway(lambda turn: [("say", "Bill due!")])
    web = gateway.channels["web"]
    core.store.put("owner_route", "web:owner")
    beat_due(core, core.clock)
    await gateway.tick()
    assert web.sent == [("owner", "Bill due!")]


# Terminal -----------------------------------------------------------------


async def test_terminal_channel(make_gateway):
    gateway, _, _ = make_gateway([[("say", "Hi from Sparrow")]])
    lines, output = iter(["hello\n", ""]), []
    terminal = TerminalChannel(lambda: next(lines), output.append)
    gateway.add_channel(terminal)
    await terminal.run(gateway)
    assert output[-1] == "\nSparrow: Hi from Sparrow\n"


# Web chat -----------------------------------------------------------------

WEB_TOKEN = "test-token-0123456789abcdef"


def web_client(gateway):
    web = WebChatChannel(WEB_TOKEN)
    web.gateway = gateway
    gateway.add_channel(web)
    return TestClient(web.app)


def test_web_page_needs_the_token(core):
    client = web_client(Gateway(core, brain=None))
    assert client.get("/").status_code == 403
    assert client.get("/?token=wrong").status_code == 403
    page = client.get(f"/?token={WEB_TOKEN}")
    assert page.status_code == 200 and "Message Sparrow" in page.text


def test_web_socket_rejects_a_wrong_token(core):
    from starlette.websockets import WebSocketDisconnect

    client = web_client(Gateway(core, brain=None))
    with pytest.raises(WebSocketDisconnect) as closed:
        with client.websocket_connect("/ws?token=wrong") as socket:
            socket.receive_json()
    assert closed.value.code == 1008


def test_web_chat_round_trip(make_gateway):
    gateway, brain, _ = make_gateway([[("say", "Hello from the web")]])
    client = web_client(gateway)
    with client.websocket_connect(f"/ws?token={WEB_TOKEN}") as socket:
        socket.send_json({"text": "hi"})
        assert socket.receive_json() == {"typing": True}
        assert socket.receive_json() == {
            "from": "sparrow",
            "text": "Hello from the web",
        }
    assert brain.turns[0].ctx.route == "web:owner"


def test_web_socket_rejects_other_sites(make_gateway):
    from starlette.websockets import WebSocketDisconnect

    gateway, _, _ = make_gateway([[("say", "hi")]])
    client = web_client(gateway)
    url = f"/ws?token={WEB_TOKEN}"
    with pytest.raises(WebSocketDisconnect) as closed:
        with client.websocket_connect(
            url, headers={"origin": "https://evil.example"}
        ) as socket:
            socket.receive_json()
    assert closed.value.code == 1008
    with client.websocket_connect(
        url, headers={"origin": "http://testserver"}
    ) as socket:
        socket.send_json({"text": "hi"})
        assert socket.receive_json() == {"typing": True}


def test_short_web_tokens_are_refused():
    with pytest.raises(ValueError):
        WebChatChannel("short")


# Telegram -----------------------------------------------------------------


@pytest.fixture
def fake():
    return FakeTelegram()


def telegram_for(fake):
    client = httpx.AsyncClient(
        transport=httpx.ASGITransport(fake.app), base_url="http://fake"
    )
    return TelegramChannel(TOKEN, "http://fake", client)


async def test_telegram_round_trip(make_gateway, fake):
    gateway, _, _ = make_gateway([[("say", "Hi Asha!")]])
    telegram = telegram_for(fake)
    gateway.add_channel(telegram)
    fake.user_says(100, "hello")
    assert await telegram.poll_once(gateway, wait=0) == 1
    await telegram.drain()
    assert fake.sent == [{"chat_id": 100, "text": "Hi Asha!"}]
    assert await telegram.poll_once(gateway, wait=0) == 0  # offset moved


async def test_telegram_ignores_groups_and_non_text(make_gateway, fake):
    gateway, brain, _ = make_gateway([])
    telegram = telegram_for(fake)
    gateway.add_channel(telegram)
    fake.user_says(100, "hi all", chat_type="group")
    fake.updates.append(
        {
            "update_id": 99,
            "message": {
                "from": {"id": 100},
                "chat": {"id": 100, "type": "private"},
                "photo": [{"file_id": "x"}],
            },
        }
    )
    await telegram.poll_once(gateway, wait=0)
    await telegram.drain()
    assert brain.turns == [] and fake.sent == []


async def test_telegram_strangers_are_paired_not_answered(
    make_gateway, fake
):
    gateway, brain, _ = make_gateway([])
    telegram = telegram_for(fake)
    gateway.add_channel(telegram)
    fake.user_says(555, "who are you?", name="Ravi")
    await telegram.poll_once(gateway, wait=0)
    await telegram.drain()
    assert brain.turns == []
    assert [m["chat_id"] for m in fake.sent] == [555, 100]


async def test_long_replies_are_split(make_gateway, fake):
    gateway, _, _ = make_gateway([[("say", "word " * 2000)]])
    telegram = telegram_for(fake)
    gateway.add_channel(telegram)
    fake.user_says(100, "tell me a lot")
    await telegram.poll_once(gateway, wait=0)
    await telegram.drain()
    assert len(fake.sent) == 3
    assert all(len(m["text"]) <= 4000 for m in fake.sent)


def test_chunks_prefer_line_breaks():
    parts = chunks("a" * 30 + "\n" + "b" * 30, size=40)
    assert parts == ["a" * 30, "b" * 30]


async def test_telegram_wrong_token_is_reported(make_gateway, fake):
    gateway, _, _ = make_gateway([])
    client = httpx.AsyncClient(
        transport=httpx.ASGITransport(fake.app), base_url="http://fake"
    )
    telegram = TelegramChannel("999:WRONG", "http://fake", client)
    with pytest.raises(httpx.HTTPStatusError):
        await telegram.poll_once(gateway, wait=0)
