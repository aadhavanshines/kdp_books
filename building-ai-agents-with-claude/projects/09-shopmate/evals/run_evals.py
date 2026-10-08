"""Play day 1 then day 2, several times, and score each brief.

This is the test you run before every change: a new prompt, a new model, a
new SDK version. It saves the scores in evals/results/ so you can compare.
Usage:  python evals/run_evals.py [runs] [model]
"""

import asyncio
import json
import os
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent
sys.path.insert(0, str(ROOT))


async def one_day(day, model):
    subprocess.run(
        [sys.executable, str(ROOT / "setup_demo.py"), str(day)],
        check=True,
        capture_output=True,
    )
    import config
    import run_daily
    from check_brief import check

    config.MODEL = model
    run_daily.brief.MODEL = model
    started = time.time()
    try:
        result, _ = await run_daily.run_once_with(model)
    except Exception as error:  # noqa: BLE001
        return {"day": day, "passed": False, "error": str(error)[:200]}
    b = result.structured_output
    run_daily.brief.remember(b)
    checks = check(b, run_daily.TOOL_LOG, day)
    return {
        "day": day,
        "passed": all(checks.values()),
        "model_usage": result.model_usage,
        "failed_checks": [k for k, v in checks.items() if not v],
        "cost_usd": round(result.total_cost_usd or 0, 4),
        "seconds": round(time.time() - started, 1),
        "turns": result.num_turns,
        "brief": b,  # kept so a failure can be read later
    }


async def main():
    runs = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    model = (
        sys.argv[2]
        if len(sys.argv) > 2
        else os.environ.get("SHOPMATE_MODEL", "claude-sonnet-5-5")
    )
    results = []
    for n in range(runs):
        (ROOT / "data" / "notes.json").unlink(
            missing_ok=True
        )  # day 1 starts with no memory
        for day in (1, 2):
            r = await one_day(day, model)
            results.append(r)
            print(
                f"run {n + 1} day {day}: "
                f"{'PASS' if r['passed'] else 'FAIL'} "
                f"{r.get('failed_checks') or r.get('error') or ''}  "
                f"${r.get('cost_usd', 0)}"
            )
    passed = sum(r["passed"] for r in results)
    cost = sum(r.get("cost_usd", 0) for r in results)
    print(
        f"\n{passed} of {len(results)} briefs passed with {model}; total "
        f"${cost:.3f}"
    )
    out = HERE / "results" / f"{model}.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(
        json.dumps(
            {
                "model": model,
                "passed": passed,
                "total": len(results),
                "cost_usd": round(cost, 4),
                "results": results,
            },
            indent=2,
        )
    )
    sys.exit(0 if passed == len(results) else 1)


if __name__ == "__main__":
    asyncio.run(main())
