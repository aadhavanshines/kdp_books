"""Run every scenario against the real model, several times each, and
save the results.

    python evals/run_evals.py                 # 3 runs of everything
    python evals/run_evals.py --runs 1 --only remembers
    python evals/run_evals.py --model claude-haiku-4-5

Costs roughly US$0.02 to US$0.10 per scenario run."""

from __future__ import annotations

import argparse
import asyncio
import json
import statistics
import sys
import time
from pathlib import Path

from harness import make_sparrow
from scenarios import FUNCTIONAL, SECURITY

HERE = Path(__file__).resolve().parent


async def run_one(fn, model: str) -> dict:
    sparrow = make_sparrow(model=model)
    start = time.perf_counter()
    try:
        checks = await fn(sparrow)
        error = None
    except Exception as exc:  # a crash is a failure, with the reason
        checks, error = [], f"{type(exc).__name__}: {exc}"
    return {
        "passed": bool(checks) and all(ok for _, ok in checks),
        "checks": [[name, bool(ok)] for name, ok in checks],
        "error": error,
        "seconds": round(time.perf_counter() - start, 1),
        "turn_seconds": [round(x, 1) for x in sparrow.brain.seconds],
        "cost_usd": sparrow.cost(),
        "replies": [text for _, text in sparrow.telegram.sent],
    }


async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--runs", type=int, default=3)
    parser.add_argument("--only", default="")
    parser.add_argument("--model", default="claude-sonnet-5-5")
    parser.add_argument("--out", default="results")
    args = parser.parse_args()
    groups = [("functional", FUNCTIONAL), ("security", SECURITY)]
    results, failed = [], 0
    for group, scenarios in groups:
        for fn in scenarios:
            if args.only not in fn.__name__:
                continue
            for n in range(args.runs):
                run = await run_one(fn, args.model)
                run.update(group=group, scenario=fn.__name__, run=n + 1)
                results.append(run)
                mark = "PASS" if run["passed"] else "FAIL"
                print(
                    f"{mark} {group:10} {fn.__name__} #{n + 1} "
                    f"${run['cost_usd']:.4f} {run['seconds']}s",
                    flush=True,
                )
                for name, ok in run["checks"]:
                    if not ok:
                        print(f"     failed check: {name}")
                if run["error"]:
                    print(f"     error: {run['error']}")
                failed += not run["passed"]
    turns = [t for r in results for t in r["turn_seconds"]]
    summary = {
        "model": args.model,
        "runs": len(results),
        "passed": len(results) - failed,
        "cost_usd": round(sum(r["cost_usd"] for r in results), 4),
        "turn_seconds_median": round(statistics.median(turns), 1)
        if turns
        else None,
        "turn_seconds_p90": round(statistics.quantiles(turns, n=10)[-1], 1)
        if len(turns) >= 10
        else None,
    }
    out = HERE / f"{args.out}.json"
    out.write_text(
        json.dumps(
            {"summary": summary, "results": results},
            indent=2,
            ensure_ascii=False,
        )
        + "\n"
    )
    print(json.dumps(summary, indent=2))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
