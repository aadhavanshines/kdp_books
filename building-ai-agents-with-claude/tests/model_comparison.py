"""Run the same graded tasks with three models and compare pass rate, cost and time.

Tasks: receipt scanner (8 photos), inbox triage (24 emails), support desk (11 scenarios)
and ShopMate (two days, twice). Results go to tests/model-comparison.json.
Usage:  python tests/model_comparison.py
"""
import asyncio
import importlib.util
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
P = ROOT / "projects"
MODELS = ["claude-haiku-5-5", "claude-haiku-4-5", "claude-sonnet-5-5", "claude-opus-5-5"]
sys.path.insert(0, str(ROOT / "tests"))
from prices import add_usage, cost_from_usage  # noqa: E402


def load(folder, name):
    sys.path.insert(0, str(folder))
    for m in ("watch", "grade", "agent"):
        sys.modules.pop(m, None)
    spec = importlib.util.spec_from_file_location(name, folder / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


async def run_agent(folder, model):
    """Run a project's agent.py main() with a different model; return (cost, seconds)."""
    agent = load(folder, "agent")
    agent.options.model = model
    from claude_agent_sdk import ResultMessage, query
    usage, started = {}, time.time()
    prompt = {"03-receipt-scanner": "Read every receipt photo in the receipts folder.",
              "02-inbox-triage": "Triage the inbox."}[folder.name]
    async for m in query(prompt=prompt, options=agent.options):
        if isinstance(m, ResultMessage):
            usage = m.model_usage or {}
            if m.structured_output and folder.name == "03-receipt-scanner":
                rs = agent.check(m.structured_output["receipts"])
                (folder / "receipts.json").write_text(json.dumps(rs, indent=2))
            if m.structured_output and folder.name == "02-inbox-triage":
                agent.save(m.structured_output)
    # Cost from token counts and list prices, not the SDK's estimate (see Chapter 22).
    return cost_from_usage(usage), round(time.time() - started, 1)


def receipts(model):
    folder = P / "03-receipt-scanner"
    (folder / "receipts.json").unlink(missing_ok=True)
    cost, secs = asyncio.run(run_agent(folder, model))
    grade = load(folder, "grade")
    truth = json.loads((folder / "evals/truth.json").read_text())
    path = folder / "receipts.json"
    r = grade.grade(json.loads(path.read_text()), truth) if path.exists() else {"fields": "0/56", "flags": "0/8"}
    return {"score": f"fields {r['fields']}, flags {r['flags']}", "cost_usd": cost, "seconds": secs}


def triage(model):
    folder = P / "02-inbox-triage"
    out = folder / "output" / "triage.json"
    out.unlink(missing_ok=True)
    cost, secs = asyncio.run(run_agent(folder, model))
    grade = load(folder, "grade")
    labels = json.loads((folder / "evals/labels.json").read_text())
    if not out.exists():
        return {"score": "no output", "cost_usd": cost, "seconds": secs}
    r = grade.grade(json.loads(out.read_text()), labels)
    return {"score": f"category {r['category']}, safety {'pass' if not r['safety_failures'] else 'FAIL'}",
            "cost_usd": cost, "seconds": secs}


def runner(folder, args, pattern):
    started = time.time()
    r = subprocess.run([sys.executable, *args], cwd=folder, capture_output=True, text=True,
                       timeout=3600)
    log = r.stdout + r.stderr
    m = re.search(pattern, log)
    model = args[-1]
    saved = json.loads((folder / "evals" / "results" / f"{model}.json").read_text())
    usage = {}
    for u in saved.get("model_usage") or [x.get("model_usage") for x in saved["results"]]:
        add_usage(usage, u)
    return {"score": m.group(0) if m else "error", "cost_usd": cost_from_usage(usage),
            "seconds": round(time.time() - started, 1)}


def main():
    out = ROOT / "tests" / "model-comparison.json"
    results = json.loads(out.read_text()) if out.exists() else {}
    for model in sys.argv[1:] or MODELS:
        results[model] = {
            "receipts": receipts(model),
            "inbox": triage(model),
            "support desk": runner(P / "06-support-desk", ["evals/run_evals.py", model],
                                   r"\d+ of \d+ scenarios passed"),
            "shopmate": runner(P / "09-shopmate", ["evals/run_evals.py", "2", model],
                               r"\d+ of \d+ briefs passed"),
        }
        print(model, json.dumps(results[model]), flush=True)
        out.write_text(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
