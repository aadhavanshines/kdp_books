"""Check a research answer: all quotes verified, the rent conflict found, OMR chosen.

Usage:  python grade.py [answer.json]
"""
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent


def grade(result):
    quotes_ok = sum(f["verified"] for f in result["findings"])
    conflicts = " ".join(result["conflicts"]).replace(",", "")
    checks = {
        "every quote found in its file": quotes_ok == len(result["findings"]),
        "at least 8 findings": len(result["findings"]) >= 8,
        "rent conflict found (45000 vs 48000)": "45000" in conflicts and "48000" in conflicts,
        "recommends OMR / Thoraipakkam": any(w in result["answer"]
                                             for w in ("OMR", "Thoraipakkam")),
        "lists missing information": len(result["not_in_documents"]) >= 1,
    }
    return {"quotes": f"{quotes_ok}/{len(result['findings'])}", "checks": checks,
            "passed": all(checks.values())}


if __name__ == "__main__":
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "answer.json"
    print(json.dumps(grade(json.loads(path.read_text())), indent=2))
