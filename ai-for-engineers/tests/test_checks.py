"""Offline tests for the checks in every project. No API calls.

Each check is the safety net for a project, so each one is tested with an
answer that is deliberately wrong in the way a model's answer could be.
Run with:  python -m pytest tests -q
"""

import importlib.util
import json
import sqlite3
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent / "projects"
sys.path.insert(0, str(ROOT / "common"))


def load(rel, name):
    spec = importlib.util.spec_from_file_location(name, ROOT / rel)
    mod = importlib.util.module_from_spec(spec)
    sys.path.insert(0, str((ROOT / rel).parent))
    spec.loader.exec_module(mod)
    return mod


review = load("p01-req-review/review.py", "review")
generate = load("p02-test-gen/generate.py", "generate")
impact = load("p03-impact/impact.py", "impact")
report = load("p05-test-report/report.py", "report")
triage = load("p06-defect-triage/triage.py", "triage")
fmea = load("p07-fmea/fmea.py", "fmea")
knowledge = load("p08-knowledge/ask.py", "ask")
server = load("p09-testdb-mcp/testdb_server.py", "testdb_server")
nightly = load("p10-nightly/nightly.py", "nightly")

SPEC12 = (ROOT / "wlc200/spec/WLC-200-SRS-v1.2.md").read_text()
SPEC13 = (ROOT / "wlc200/spec/WLC-200-SRS-v1.3.md").read_text()


# Project 1 ---------------------------------------------------------------
def finding(rid, issue="ok", quote="", rewrite="", related=()):
    return {"id": rid, "issue": issue, "related": list(related), "quote": quote,
            "explanation": "", "rewrite": rewrite}


def all_ok(reqs):
    return [finding(r) for r in reqs]


def test_review_counts_requirements():
    assert len(review.requirements(SPEC12)) == 36
    assert len(review.requirements(SPEC13)) == 34   # 36 - 5 deleted + 3 added


def test_review_accepts_a_clean_answer():
    reqs = review.requirements(SPEC12)
    assert review.check(all_ok(reqs), reqs, SPEC12) == []


def test_review_catches_missing_and_unknown_requirements():
    reqs = review.requirements(SPEC12)
    answer = all_ok(reqs)[1:] + [finding("WLC-099")]
    problems = review.check(answer, reqs, SPEC12)
    assert any("WLC-001 reviewed 0 times" in p for p in problems)
    assert any("WLC-099 is not in the specification" in p for p in problems)


def test_review_catches_a_made_up_quote():
    reqs = review.requirements(SPEC12)
    answer = all_ok(reqs)
    answer[11] = finding("WLC-012", "ambiguous", quote="as fast as possible")
    assert any("quote not found" in p for p in review.check(answer, reqs, SPEC12))


def test_review_catches_an_invented_value_in_a_rewrite():
    reqs = review.requirements(SPEC12)
    answer = all_ok(reqs)
    answer[11] = finding("WLC-012", "ambiguous", quote="quickly",
                         rewrite="The window shall close within 2.5 s of rain.")
    assert any("invents the value 2.5 s" in p for p in review.check(answer, reqs, SPEC12))


def test_review_needs_a_partner_for_a_conflict():
    reqs = review.requirements(SPEC12)
    answer = all_ok(reqs)
    answer[6] = finding("WLC-007", "conflict", quote="for 45 s")
    assert any("without a related" in p for p in review.check(answer, reqs, SPEC12))


# Project 2 ---------------------------------------------------------------
def test_values_reads_ranges_and_ignores_codes():
    v = generate.values("store B1A02 above 25 A; every 50 ms ± 5 ms; -14 V; 9.0 V")
    # the tolerance (5 ms) is a value too; the ends of the range are added
    assert v == {"25 A", "50 ms", "5 ms", "45 ms", "55 ms", "-14 V", "9 V"}


def tc(tid, reqs, limit, procedure=("Do it.",), measure="x"):
    return {"id": tid, "title": "", "requirements": list(reqs), "method": "HIL",
            "procedure": list(procedure), "pass_criteria": [{"measure": measure, "limit": limit}]}


def test_test_generator_flags_an_invented_limit():
    reqs = generate.requirements(SPEC13)
    tests = [tc("TC-001", ["WLC-014"], "> 85 N")]
    report_ = generate.check(tests, reqs, generate.definitions(SPEC13))
    assert "TC-001: 85 N not in WLC-014" in report_["ungrounded"]


def test_test_generator_reports_uncovered_requirements():
    reqs = generate.requirements(SPEC13)
    report_ = generate.check([tc("TC-001", ["WLC-014"], "80 N")], reqs)
    assert "WLC-001" in report_["uncovered"] and "WLC-014" not in report_["uncovered"]


def test_definitions_values_are_allowed():
    assert {"0 mm", "480 mm", "4 mm", "200 mm"} <= generate.definitions(SPEC13)


# Project 3 ---------------------------------------------------------------
def test_impact_diff_by_code():
    old = impact.requirements(ROOT / "wlc200/spec/WLC-200-SRS-v1.2.md")
    new = impact.requirements(ROOT / "wlc200/spec/WLC-200-SRS-v1.3.md")
    d = impact.diff(old, new)
    truth = json.loads((ROOT / "wlc200/labels/change-truth.json").read_text())
    assert sorted(d["changed"]) == sorted(truth["changed"] + truth["editorial"])
    assert sorted(d["added"]) == truth["added"]
    assert sorted(d["deleted"]) == truth["deleted"]


# Project 5 ---------------------------------------------------------------
def test_report_check_catches_a_wrong_number_and_id():
    facts = {"runs": [{"run": "R04", "test": "TC-AP-04", "value": 14}], "failed": 3}
    problems = report.check([("summary", "R04 (TC-AP-04) stopped after 15 ms; see DR-1999.")], facts)
    assert "summary: number 15 is not in the fact sheet" in problems
    assert "summary: DR-1999 is not in the fact sheet" in problems
    assert report.check([("summary", "R04 (TC-AP-04) stopped after 14 ms.")], facts) == []


# Project 6 ---------------------------------------------------------------
def test_triage_duplicate_must_point_back():
    defects = [{"id": "DR-1001"}, {"id": "DR-1002"}]
    tri = [{"id": "DR-1001", "duplicate_of": "DR-1002"}, {"id": "DR-1002", "duplicate_of": None}]
    assert any("not an earlier report" in p for p in triage.check(tri, defects))


# Project 7 ---------------------------------------------------------------
def row(s, o, d, action=""):
    return {"function": "3. Detect a pinch", "element": "", "failure_mode": f"mode {s}{o}{d}",
            "effect": "", "cause": "", "prevention": [], "detection": [],
            "severity": s, "occurrence": o, "detection_rating": d,
            "rating_reasons": "", "recommended_action": action, "evidence": []}


def test_rpn_and_action_rule_are_code():
    rows = fmea.priorities([row(4, 5, 4), row(9, 2, 2), row(5, 5, 5)])
    by = {r["failure_mode"]: r for r in rows}
    assert by["mode 454"]["rpn"] == 80 and not by["mode 454"]["action_needed"]
    assert by["mode 922"]["action_needed"]          # severity 9: always
    assert by["mode 555"]["action_needed"]          # RPN 125


def test_fmea_check_wants_an_action_and_real_evidence():
    structure = (ROOT / "wlc200/fmea/structure.md").read_text()
    r = fmea.priorities([row(9, 2, 2)])
    r[0]["evidence"] = ["DR-4242"]
    problems = fmea.check(r, structure, [{"id": "DR-1001"}])
    assert any("no action proposed" in p for p in problems)
    assert any("DR-4242 does not exist" in p for p in problems)


# Project 8 ---------------------------------------------------------------
def test_quote_check():
    docs = knowledge.library()
    good = {"found": True, "answer": "", "quotes": [
        {"document": "TP-AP-01-anti-pinch-test.md", "text": "spring rate 10 N/mm"}]}
    bad = {"found": True, "answer": "", "quotes": [
        {"document": "TP-AP-01-anti-pinch-test.md", "text": "spring rate 12 N/mm"}]}
    assert knowledge.check_quotes(good, docs) == []
    assert knowledge.check_quotes(bad, docs)
    assert knowledge.check_quotes({"found": True, "answer": "x", "quotes": []}, docs)


# Project 9 ---------------------------------------------------------------
def test_server_is_read_only():
    with pytest.raises(sqlite3.OperationalError):
        server.db().execute("DELETE FROM defects")


def test_server_tools():
    assert "TC-AP-04 | R04 | FAIL" in server.night_results("2026-10-06")
    assert "DR-1001" in server.find_defects(status="open", severity="S1")
    with pytest.raises(ValueError):
        server.night_results("2026-13-01")


# Project 10 --------------------------------------------------------------
def test_nightly_check_catches_bad_decisions():
    failures = [{"test": "TC-AP-03", "criteria": [{"value": 12, "ok": False}]}]
    open_defects = [{"id": "DR-1001"}]
    decisions = [{"test": "TC-AP-03", "covered_by": "DR-1777", "add_to_defect": "", "draft": None}]
    assert any("not an open defect" in p for p in nightly.check_triage(decisions, failures, open_defects))
    decisions = [{"test": "TC-AP-03", "covered_by": None, "add_to_defect": "", "draft": {
        "title": "Late stop", "description": "It was late.", "component": "anti_pinch",
        "severity": "S1", "related": []}}]
    assert any("measured value 12" in p for p in nightly.check_triage(decisions, failures, open_defects))
