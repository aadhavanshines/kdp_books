"""Pairing: who may talk to Sparrow at all.

Owners are listed in sparrow.yaml. Anyone else who messages Sparrow gets
a pairing code and nothing more: their message never reaches the model.
The owner approves the code to let them in, as a guest."""

from __future__ import annotations

from datetime import datetime

from .approvals import new_code
from .store import Store


class Pairing:
    def __init__(self, store: Store, owners: list[str]):
        self.store = store
        self.owners = set(owners)

    def role(self, identity: str) -> str:
        """'owner', 'guest' (paired) or 'stranger'."""
        if identity in self.owners:
            return "owner"
        row = self.store.rows(
            "SELECT status FROM people WHERE identity = ?", identity
        )
        if row and row[0]["status"] == "paired":
            return "guest"
        return "stranger"

    def request(
        self, identity: str, name: str, now: datetime
    ) -> tuple[str, bool]:
        """Return (code, is_new). A stranger keeps one code."""
        row = self.store.rows(
            "SELECT code FROM people WHERE identity = ?", identity
        )
        if row:
            return row[0]["code"], False
        code = new_code()
        self.store.run(
            "INSERT INTO people VALUES (?, ?, 'pending', ?, ?)",
            identity,
            name[:40],
            code,
            now.isoformat(),
        )
        return code, True

    def approve(self, code: str) -> str | None:
        """Pair the person with this code; return their identity."""
        rows = self.store.rows(
            "SELECT identity FROM people WHERE code = ? AND "
            "status = 'pending'",
            code.strip().upper(),
        )
        if not rows:
            return None
        self.store.run(
            "UPDATE people SET status = 'paired' WHERE identity = ?",
            rows[0]["identity"],
        )
        return rows[0]["identity"]

    def remove(self, identity: str) -> bool:
        return (
            self.store.run(
                "DELETE FROM people WHERE identity = ?", identity
            ).rowcount
            > 0
        )

    def list(self) -> list:
        return self.store.rows("SELECT * FROM people ORDER BY created")
