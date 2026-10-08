"""Run every agent for real, once, and grade it. Used before each release of the book's
code (for example after upgrading the SDK). Costs about $3 at Sonnet prices.

Usage:  python tests/verify_all.py            (writes tests/verification.json)
"""
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
P = ROOT / "projects"


def sh(cmd, cwd, timeout=1500):
    r = subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True, timeout=timeout)
    return r.returncode, r.stdout + r.stderr


def cost_of(log):
    """The run's cost: the agents print 'Done: ... $x', the eval runners print a total."""
    totals = re.findall(r"(?:Cost: |total )\$([\d.]+)", log)
    if totals:
        return float(totals[-1])
    costs = [float(c) for c in re.findall(r"Done: .*?\$([\d.]+)", log)]
    return round(max(costs), 4) if costs else 0.0


def graded(project, prep, run, grade, ok):
    folder = P / project
    for path in prep:
        target = folder / path
        if target.is_dir():
            shutil.rmtree(target)
        else:
            target.unlink(missing_ok=True)
    code, log = sh(run, folder)
    gcode, gout = sh(grade, folder) if grade else (0, "")
    passed = code == 0 and cost_of(log) > 0 and ok(log, gout)
    return {"project": project, "passed": passed, "cost_usd": cost_of(log),
            "detail": gout.strip()[-400:] if not passed else ""}


def main():
    py = sys.executable
    shutil.copy(P / "07-stock-mcp/stock.start.json", P / "07-stock-mcp/stock.json")
    jpass = lambda key="passed": (lambda log, out: json.loads(out)[key] is True)  # noqa: E731
    results = [
        graded("01-pantry-chef", ["shopping-list.txt"],
               f"{py} agent.py 'I want to make chicken biryani on Sunday for 6 people. What do I need to buy?'",
               "cat shopping-list.txt", lambda log, out: "check_pantry" in log and out.count("- ") >= 3),
        graded("02-inbox-triage", ["output"], f"{py} agent.py", f"{py} grade.py", jpass()),
        graded("03-receipt-scanner", [], f"{py} agent.py", f"{py} grade.py", jpass()),
        graded("04-research-analyst", [], f"{py} agent.py", f"{py} grade.py", jpass()),
        graded("05-data-analyst", ["output", "analysis.py"], f"{py} agent.py", f"{py} grade.py", jpass()),
        graded("06-support-desk", [], f"{py} evals/run_evals.py", "", lambda log, out: "11 of 11" in log),
        graded("07-stock-mcp", ["orders"], f"{py} agent.py", f"{py} grade.py", jpass()),
        graded("08-launch-team", ["launch-kit", "scripts"], f"{py} agent.py", f"{py} grade.py", jpass()),
        graded("09-shopmate", [], f"{py} evals/run_evals.py 1", "", lambda log, out: "2 of 2 briefs passed" in log),
    ]
    import claude_agent_sdk
    out = {"time": datetime.now(timezone.utc).isoformat(timespec="seconds"),
           "sdk": claude_agent_sdk.__version__, "results": results,
           "passed": sum(r["passed"] for r in results), "total": len(results)}
    (ROOT / "tests" / "verification.json").write_text(json.dumps(out, indent=2))
    for r in results:
        print(f"{'PASS' if r['passed'] else 'FAIL'}  {r['project']}  ${r['cost_usd']}  {r['detail'][:200]}")
    print(f"{out['passed']} of {out['total']} agents verified with SDK {out['sdk']}")


if __name__ == "__main__":
    main()
