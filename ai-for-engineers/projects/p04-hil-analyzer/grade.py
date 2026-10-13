"""Grade the analyzer's results.json against the engineer's measurements.

Run it with:  python grade.py results.json
"""

import json
import sys
from pathlib import Path

TRUTH = Path(__file__).resolve().parent.parent / "wlc200" / "labels" / "hil-truth.json"

# truth key -> (analyzer name, tolerance)
SAME = {
    "stop_latency_ms": ("stop_latency_ms", 0),
    "reversal_mm": ("reversal_mm", 0),
    "peak_force_n": ("peak_force_n", 0.05),
    "close_time_s": ("close_time_s", 0.01),
    "max_period_ms": ("period_max_ms", 0),
    "min_period_ms": ("period_min_ms", 0),
    "max_current_above_130_c": ("max_current_above_130C_a", 0.005),
    "stop_after_undervoltage_ms": ("stop_after_undervoltage_ms", 0),
    "stop_after_hall_loss_ms": ("stop_after_hall_loss_ms", 0),
    "dtc": ("dtc_code", 0),
}


def found(result, name):
    for c in result["criteria"]:
        if c["name"] == name:
            return c["value"]
    return result["values"].get(name)


def grade(path):
    truth = json.loads(TRUTH.read_text())
    results = {r["run"]: r for r in json.loads(Path(path).read_text())["results"]}
    verdicts = values = 0
    notes, compared = [], 0
    for run, t in truth.items():
        r = results[run]
        verdicts += r["status"] == t["verdict"]
        if r["status"] != t["verdict"]:
            notes.append(f"{run}: verdict {r['status']}, engineer {t['verdict']}")
        for key, want in t["measured"].items():
            if key in SAME:
                name, tol = SAME[key]
                got = found(r, name)
                compared += 1
                ok = got == want if isinstance(want, str) else (
                    got is not None and abs(got - want) <= tol)
                values += ok
                if not ok:
                    notes.append(f"{run}: {key} = {got}, engineer measured {want}")
            elif key == "stop_after_release_ms":
                got = found(r, "stop_after_release_ms")
                for n, (direction, want_ms) in enumerate(want.items()):
                    compared += 1
                    # the analyzer must report every release, not only the first
                    ok = (got.get(direction) == want_ms if isinstance(got, dict)
                          else n == 0 and got == want_ms)
                    values += ok
                    if not ok:
                        notes.append(f"{run}: {direction} release {want_ms} ms not reported (got {got})")
            elif key == "open_started_above_140_c":
                compared += 1
                got = found(r, "opening_starts_above_140C")
                ok = got == len(want)
                values += ok
                if not ok:
                    notes.append(f"{run}: {got} openings above 140 °C, engineer found {len(want)}")
    return {"verdicts_right": verdicts, "runs": len(truth),
            "values_right": values, "values_compared": compared, "notes": notes}


if __name__ == "__main__":
    g = grade(sys.argv[1])
    for n in g.pop("notes"):
        print(" ", n)
    print(json.dumps(g))
