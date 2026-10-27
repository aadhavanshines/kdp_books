"""Sparrow's settings, read from sparrow.yaml in the home folder."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

import yaml


@dataclass
class TelegramSettings:
    enabled: bool = False
    token_env: str = "SPARROW_TELEGRAM_TOKEN"
    api_url: str = "https://api.telegram.org"


@dataclass
class WebChatSettings:
    enabled: bool = True
    host: str = "127.0.0.1"
    port: int = 8765
    token_env: str = "SPARROW_WEB_TOKEN"


@dataclass
class HeartbeatSettings:
    every_minutes: int = 30
    active_hours: tuple[int, int] = (8, 22)


@dataclass
class SandboxSettings:
    enabled: bool = True
    timeout_seconds: int = 20
    memory_mb: int = 512
    max_output_chars: int = 4000


@dataclass
class EgressSettings:
    allow: list[str] = field(default_factory=list)
    deny: list[str] = field(default_factory=list)
    # Unknown hosts: "ask" the owner, or "deny" outright
    unknown: str = "ask"


@dataclass
class Settings:
    home: Path
    owner_name: str = "Owner"
    owners: list[str] = field(default_factory=list)  # "telegram:123"
    model: str = "claude-sonnet-5-5"
    heartbeat_model: str = "claude-haiku-4-5"
    timezone: str = "UTC"
    history_turns: int = 12
    daily_budget_usd: float = 2.00
    privacy: str = "redact"  # "redact", "block" or "off"
    telegram: TelegramSettings = field(default_factory=TelegramSettings)
    webchat: WebChatSettings = field(default_factory=WebChatSettings)
    heartbeat: HeartbeatSettings = field(default_factory=HeartbeatSettings)
    sandbox: SandboxSettings = field(default_factory=SandboxSettings)
    egress: EgressSettings = field(default_factory=EgressSettings)
    # Host -> {header: name of the secret}, added to outgoing requests
    secrets_for_hosts: dict[str, dict[str, str]] = field(
        default_factory=dict
    )

    @property
    def workspace(self) -> Path:
        return self.home / "workspace"

    @property
    def state(self) -> Path:
        return self.home / "state"


SECTIONS = {
    "telegram": TelegramSettings,
    "webchat": WebChatSettings,
    "heartbeat": HeartbeatSettings,
    "sandbox": SandboxSettings,
    "egress": EgressSettings,
}


def load_settings(home: str | Path | None = None) -> Settings:
    """Read sparrow.yaml; anything missing keeps its default."""
    home = Path(home or os.environ.get("SPARROW_HOME", "~/.sparrow"))
    home = home.expanduser()
    path = home / "sparrow.yaml"
    raw = yaml.safe_load(path.read_text()) if path.exists() else {}
    raw = raw or {}
    values = {}
    for key, value in raw.items():
        if key in SECTIONS:
            if key == "heartbeat" and "active_hours" in value:
                value = {
                    **value,
                    "active_hours": tuple(value["active_hours"]),
                }
            values[key] = SECTIONS[key](**value)
        elif key in Settings.__dataclass_fields__ and key != "home":
            values[key] = value
        else:
            raise ValueError(f"Unknown setting in {path}: {key}")
    return Settings(home=home, **values)
