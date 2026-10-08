"""Re-grade every saved run of the real agents. The runs cost money to make; grading
them again is free and makes sure the graders and the saved results still agree."""
import json

import pytest

from conftest import PROJECTS, load


@pytest.mark.parametrize("n", [1, 2, 3])
def test_inbox_triage_runs(n):
    g = load("02-inbox-triage", "grade")
    labels = json.loads((PROJECTS / "02-inbox-triage/evals/labels.json").read_text())
    r = g.grade(json.loads((PROJECTS / f"02-inbox-triage/evals/runs/run-{n}.json").read_text()), labels)
    assert r["passed"] and r["safety_failures"] == []
    assert int(r["category"].split("/")[0]) >= 20


@pytest.mark.parametrize("n", [1, 2, 3])
def test_receipt_runs(n):
    g = load("03-receipt-scanner", "grade")
    truth = json.loads((PROJECTS / "03-receipt-scanner/evals/truth.json").read_text())
    r = g.grade(json.loads((PROJECTS / f"03-receipt-scanner/evals/runs/run-{n}.json").read_text()), truth)
    assert r["passed"], r["wrong"]


@pytest.mark.parametrize("n", [1, 2, 3])
def test_research_runs(n):
    g = load("04-research-analyst", "grade")
    analyst = load("04-research-analyst", "agent")
    saved = json.loads((PROJECTS / f"04-research-analyst/evals/runs/run-{n}.json").read_text())
    rechecked = analyst.verify(json.loads(json.dumps(saved)))   # check the quotes again
    assert all(f["verified"] for f in rechecked["findings"])
    assert g.grade(saved)["passed"]


@pytest.mark.parametrize("n", [1, 2, 3])
def test_data_analyst_runs(n):
    g = load("05-data-analyst", "grade")
    r = g.grade(json.loads((PROJECTS / f"05-data-analyst/evals/runs/run-{n}.json").read_text()))
    numbers = {k: v for k, v in r["checks"].items() if "chart" not in k and "report" not in k}
    assert all(numbers.values()), numbers


def test_data_analyst_blocked_attempt_was_empty():
    log = (PROJECTS / "05-data-analyst/evals/runs/attempt-0-blocked-command.log").read_text()
    assert "denied" in log and '"monthly_revenue": {}' in log


def test_support_desk_eval_results():
    r = json.loads((PROJECTS / "06-support-desk/evals/results/claude-sonnet-5-5.json").read_text())
    assert r["passed"] == r["total"] == 11


def test_capstone_briefs():
    for day in (1, 2):
        b = json.loads((PROJECTS / f"09-shopmate/evals/runs/day{day}-brief.json").read_text())
        assert "allerg" in (b["urgent"][0]["item"] + b["urgent"][0]["why"]).lower()
        assert all(s in " ".join(b["ignore"]) for s in ["004", "008", "010", "017", "021"])
    day2 = json.loads((PROJECTS / "09-shopmate/evals/runs/day2-brief.json").read_text())
    done = " ".join(f["item"] for f in day2["follow_ups"] if f["status"] == "done")
    assert "1170" in done
