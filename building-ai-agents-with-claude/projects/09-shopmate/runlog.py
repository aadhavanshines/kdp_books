"""Record every run: when, which model and prompt version, turns, cost, result.
In production this file is how you notice cost creeping up or runs failing."""
import json
from datetime import datetime, timezone

from config import OUT


def record(**fields):
    OUT.mkdir(parents=True, exist_ok=True)
    entry = {"time": datetime.now(timezone.utc).isoformat(timespec="seconds"), **fields}
    with (OUT / "runs.jsonl").open("a") as f:
        f.write(json.dumps(entry) + "\n")
    return entry


def history(limit=30):
    path = OUT / "runs.jsonl"
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text().splitlines()][-limit:]
