"""Shared test fixtures: a Sparrow home in a temporary folder, a clock
the tests control, and a channel that records what Sparrow sends."""

from __future__ import annotations

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import pytest

from sparrow.brain import ScriptedBrain
from sparrow.config import load_settings
from sparrow.core import Core
from sparrow.gateway import Gateway, Inbound

OWNER = "telegram:100"
CONFIG = """
owner_name: Asha
owners: ["telegram:100"]
timezone: Europe/Lisbon
daily_budget_usd: 1.00
egress:
  allow: [docs.example.com, "*.wiki.example"]
  deny: [evil.example]
  unknown: ask
secrets_for_hosts:
  api.weather.example:
    Authorization: "Bearer ${WEATHER_KEY}"
"""


class Clock:
    def __init__(self, start: datetime):
        self.now = start

    def __call__(self) -> datetime:
        return self.now

    def advance(self, **delta) -> None:
        self.now += timedelta(**delta)


class Recorder:
    """A channel that keeps what is sent instead of sending it."""

    def __init__(self, name: str):
        self.name = name
        self.sent: list[tuple[str, str]] = []

    async def send(self, chat_id: str, text: str) -> None:
        self.sent.append((chat_id, text))

    def texts(self) -> list[str]:
        return [text for _, text in self.sent]


@pytest.fixture
def home(tmp_path):
    (tmp_path / "sparrow.yaml").write_text(CONFIG)
    return tmp_path


@pytest.fixture
def clock():
    return Clock(
        datetime(2026, 10, 27, 9, 0, tzinfo=ZoneInfo("Europe/Lisbon"))
    )


@pytest.fixture
def core(home, clock):
    return Core(load_settings(home), clock=clock)


@pytest.fixture
def make_gateway(core):
    """make_gateway(scripts) -> (gateway, brain, telegram recorder)."""

    def make(scripts):
        brain = ScriptedBrain(scripts)
        gateway = Gateway(core, brain)
        telegram = Recorder("telegram")
        gateway.add_channel(telegram)
        gateway.add_channel(Recorder("web"))
        return gateway, brain, telegram

    return make


def owner_says(text: str) -> Inbound:
    return Inbound("telegram", "100", "Asha", "100", text)


def stranger_says(
    text: str, sender: str = "555", name: str = "Ravi"
) -> Inbound:
    return Inbound("telegram", sender, name, sender, text)


@pytest.fixture
def anyio_backend():
    return "asyncio"
