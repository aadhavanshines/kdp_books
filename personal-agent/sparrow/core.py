"""Sparrow's parts, built once from the settings and shared by the
gateway, the tools and the scheduler."""

from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from .approvals import Approvals
from .audit import Audit, Ledger
from .config import Settings
from .egress import EgressPolicy, Fetcher
from .memory import Memory
from .pairing import Pairing
from .scheduler import Scheduler
from .sessions import Sessions
from .skills import SkillLibrary
from .store import Store
from .todo import TodoList
from .vault import Vault
from .workspace import Workspace


class Core:
    def __init__(
        self, settings: Settings, clock=None, http_client=None, resolve=None
    ):
        self.settings = settings
        self.zone = ZoneInfo(settings.timezone)
        self.clock = clock or (lambda: datetime.now(self.zone))
        state = settings.state
        self.workspace = Workspace(settings.workspace)
        self.workspace.create()
        self.store = Store(state / "sparrow.db")
        self.memory = Memory(self.workspace, state / "memory-index.db")
        self.skills = SkillLibrary(self.workspace.skills_dir)
        self.todo = TodoList(self.workspace.root / "TODO.md")
        self.sessions = Sessions(state / "sessions")
        self.scheduler = Scheduler(self.store)
        self.approvals = Approvals(self.store)
        self.vault = Vault(
            state / "secrets.env", settings.secrets_for_hosts
        )
        # The terminal and the token-protected web chat are the owner
        self.pairing = Pairing(
            self.store, settings.owners + ["terminal:owner", "web:owner"]
        )
        self.egress = EgressPolicy(
            settings.egress, state / "approved-hosts.txt"
        )
        self.fetcher = Fetcher(
            self.egress, self.vault, http_client, resolve
        )
        self.audit = Audit(state / "audit", self.vault)
        self.ledger = Ledger(self.store, settings.daily_budget_usd)

    def now(self) -> datetime:
        return self.clock()

    def close(self) -> None:
        self.store.close()
        self.memory.close()
