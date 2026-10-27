"""The audit log and the spending ledger.

Every message, tool call, decision and cost is written as one JSON line
in state/audit/YYYY-MM-DD.jsonl, with secrets scrubbed, so you can always
answer "what did Sparrow do, and why?"."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from .store import Store
from .vault import Vault


class Audit:
    def __init__(self, folder: Path, vault: Vault):
        self.folder = folder
        self.vault = vault
        folder.mkdir(parents=True, exist_ok=True)

    def log(self, now: datetime, event: str, **fields) -> None:
        record = {
            "time": now.isoformat(timespec="seconds"),
            "event": event,
            **fields,
        }
        line = self.vault.scrub(
            json.dumps(record, ensure_ascii=False, default=str)
        )
        with open(self.folder / f"{now:%Y-%m-%d}.jsonl", "a") as f:
            f.write(line + "\n")

    def read(self, day: str) -> list[dict]:
        path = self.folder / f"{day}.jsonl"
        if not path.exists():
            return []
        return [json.loads(line) for line in path.read_text().splitlines()]


class Ledger:
    def __init__(self, store: Store, daily_budget: float):
        self.store = store
        self.daily_budget = daily_budget

    def add(
        self, now: datetime, model: str, kind: str, cost: float
    ) -> None:
        self.store.run(
            "INSERT INTO spending VALUES (?, ?, ?, ?)",
            f"{now:%Y-%m-%d}",
            model,
            kind,
            cost,
        )

    def spent(self, now: datetime) -> float:
        row = self.store.rows(
            "SELECT COALESCE(SUM(cost_usd), 0) AS total"
            " FROM spending WHERE day = ?",
            f"{now:%Y-%m-%d}",
        )
        return round(row[0]["total"], 4)

    def over_budget(self, now: datetime) -> bool:
        return self.spent(now) >= self.daily_budget
