"""Grade the knowledge assistant's answers.

Answerable questions: found must be true, the answer must contain the key
facts, and at least one quote must come from an expected document.
Unanswerable questions: found must be false.
Run it with:  python grade.py output/answers-sonnet-run1.json
"""

import json
import sys
from pathlib import Path

QUESTIONS = Path(__file__).resolve().parent.parent / "wlc200" / "labels" / "knowledge-qa.json"


def grade(path):
    truth = {q["id"]: q for q in json.loads(QUESTIONS.read_text())}
    answers = json.loads(Path(path).read_text())
    right, notes = 0, []
    bad_quotes = sum(len(a["problems"]) for a in answers)
    for a in answers:
        t, ans = truth[a["id"]], a["answer"]
        if not t["answerable"]:
            ok = not ans["found"]
            if not ok:
                notes.append(f"{a['id']}: answered a question the documents can't answer: {ans['answer'][:90]}")
        else:
            text = ans["answer"].lower().replace("−", "-")
            missing = [m for m in t["must_contain"] if m.lower() not in text]
            sources = {q["document"] for q in ans["quotes"]}
            ok = ans["found"] and not missing and bool(sources & set(t["sources"])) and not a["problems"]
            if not ok:
                notes.append(f"{a['id']}: found={ans['found']} missing={missing} "
                             f"sources={sorted(sources)} problems={a['problems']}")
        right += ok
    return {"right": right, "total": len(answers), "quote_problems": bad_quotes,
            "cost_usd": round(sum(a["cost_usd"] for a in answers), 4), "notes": notes}


if __name__ == "__main__":
    g = grade(sys.argv[1])
    for n in g.pop("notes"):
        print(" ", n)
    print(json.dumps(g))
