"""Performance benchmark: how much time Sparrow itself adds, apart from
the model. Uses an instant scripted brain, so it costs nothing.

    python evals/benchmark.py
"""

from __future__ import annotations

import asyncio
import json
import resource
import statistics
import sys
import tempfile
import time
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "tests"))

from sparrow.brain import ScriptedBrain  # noqa: E402
from sparrow.config import load_settings  # noqa: E402
from sparrow.core import Core  # noqa: E402
from sparrow.gateway import Gateway, Inbound  # noqa: E402
from sparrow.privacy import PrivacyRouter  # noqa: E402
from sparrow.sandbox import run_sandboxed  # noqa: E402

from conftest import CONFIG, Clock, Recorder  # noqa: E402


def percentile(values: list[float], p: float) -> float:
    values = sorted(values)
    return values[min(len(values) - 1, int(p / 100 * len(values)))]


def fresh_core() -> Core:
    home = Path(tempfile.mkdtemp(prefix="sparrow-bench-"))
    (home / "sparrow.yaml").write_text(CONFIG)
    clock = Clock(datetime(2026, 10, 27, 9, 0,
                           tzinfo=ZoneInfo("Europe/Lisbon")))
    return Core(load_settings(home), clock=clock)


async def gateway_overhead(results: dict) -> None:
    core = fresh_core()
    core.settings.history_turns = 12
    brain = ScriptedBrain(lambda turn: [
        ("tool", "memory_search", {"query": "birthday"}),
        ("say", "ok")])
    gateway = Gateway(core, brain)
    gateway.add_channel(Recorder("telegram"))
    times = []
    for n in range(300):
        start = time.perf_counter()
        await gateway.handle(Inbound("telegram", "100", "Asha", "100",
                                     f"message {n}"))
        times.append((time.perf_counter() - start) * 1000)
    results["owner message, one after another (ms)"] = {
        "median": round(statistics.median(times), 2),
        "p95": round(percentile(times, 95), 2)}
    # 200 guests at once: how many messages per second overall?
    for n in range(200):
        core.pairing.request(f"telegram:{n}", f"G{n}", core.now())
    for row in core.pairing.list():
        core.pairing.approve(row["code"])
    brain.scripts = lambda turn: [("say", "ok")]
    start = time.perf_counter()
    await asyncio.gather(*[
        gateway.handle(Inbound("telegram", str(n), f"G{n}", str(n), "hi"))
        for n in range(200)])
    took = time.perf_counter() - start
    results["200 guests at once (messages per second)"] = round(200 / took)


def memory_search(results: dict) -> None:
    core = fresh_core()
    lines = [f"- 2026-01-01: Fact number {n} about topic {n % 97}"
             for n in range(10_000)]
    lines.append("- 2026-10-27: Priya's birthday is 14 November")
    path = core.workspace.root / "MEMORY.md"
    path.write_text("# Memory\n\n" + "\n".join(lines) + "\n")
    day = datetime(2026, 1, 1, tzinfo=ZoneInfo("Europe/Lisbon"))
    for d in range(365):
        note = core.workspace.memory_dir / \
            f"{day + timedelta(days=d):%Y-%m-%d}.md"
        note.write_text(f"# Day {d}\n\n- 09:00 Walked {d % 9} km\n")
    start = time.perf_counter()
    core.memory.refresh()
    results["index 10,000 facts + 365 notes (ms)"] = round(
        (time.perf_counter() - start) * 1000)
    times = []
    queries = ["Priya birthday", "topic 42", "walked km", "nothing"]
    for query in queries * 25:
        start = time.perf_counter()
        hits = core.memory.search(query)
        times.append((time.perf_counter() - start) * 1000)
    assert core.memory.search("Priya birthday")[0][1].endswith("November")
    results["memory search (ms)"] = {
        "median": round(statistics.median(times), 2),
        "p95": round(percentile(times, 95), 2)}
    del hits


def sandbox_start(results: dict) -> None:
    core = fresh_core()
    times = []
    for _ in range(20):
        start = time.perf_counter()
        code, _ = run_sandboxed("true", core.workspace.files,
                                core.workspace.skills_dir,
                                core.settings.sandbox)
        times.append((time.perf_counter() - start) * 1000)
        assert code == 0
    results["sandbox start, run 'true' (ms)"] = {
        "median": round(statistics.median(times), 1),
        "p95": round(percentile(times, 95), 1)}


def privacy_speed(results: dict) -> None:
    text = ("Call Ana on +351 912 345 678 or ana@mail.example about the "
            "trip on 2026-11-02. ") * 120
    start = time.perf_counter()
    for _ in range(50):
        PrivacyRouter().redact(text)
    each = (time.perf_counter() - start) * 1000 / 50
    results[f"privacy router, {len(text):,} characters (ms)"] = round(
        each, 2)


def prompt_size(results: dict) -> None:
    core = fresh_core()
    for n in range(500):
        core.memory.remember(f"Fact {n}: something worth keeping",
                             core.now())
    prompt = core.workspace.system_prompt(core.now(), core.skills.index(),
                                          "Asha", "telegram:100")
    results["system prompt with a full memory (characters)"] = len(prompt)


async def main() -> None:
    results: dict = {}
    await gateway_overhead(results)
    memory_search(results)
    sandbox_start(results)
    privacy_speed(results)
    prompt_size(results)
    peak = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024
    results["peak memory of this process (MB)"] = round(peak)
    for name, value in results.items():
        print(f"{name:52} {value}")
    (Path(__file__).parent / "benchmark.json").write_text(
        json.dumps(results, indent=2) + "\n")


if __name__ == "__main__":
    asyncio.run(main())
