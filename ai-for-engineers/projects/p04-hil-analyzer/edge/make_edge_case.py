"""Make one edge-case log that tonight's data doesn't contain: a pinch test
that starts low (150 mm) and reverses only 60 mm. The reversal is short and
the window ends nowhere near fully open (480 mm), so the run must FAIL.
Run it with:  python edge/make_edge_case.py
"""
import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
GEN = HERE.parent.parent / "wlc200" / "data" / "make_hil_logs.py"
spec = importlib.util.spec_from_file_location("gen", GEN)
gen = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gen)

night = HERE / "short-reversal"
gen.OUT = night
run, measured = gen.pinch_run("E01", "TC-AP-01", 13.5, 23, rod_mm=100, latency_ms=6,
                              reversal_mm=60, start_mm=150.0, seed=99)
(night / "manifest.json").write_text(json.dumps({
    "night": "edge-short-reversal", "bench": "HIL-2", "software": "test",
    "spec": "ADS-WLC200-SRS v1.3",
    "runs": [{"run": "E01", "test": "TC-AP-01", "supply_v": 13.5, "ambient_c": 23,
              "sample_ms": 1, "file": "E01.csv"}]}, indent=1))
(night / "expected.json").write_text(json.dumps({"E01": {"verdict": "FAIL", "measured": measured}}, indent=1))
print("E01 expected FAIL:", measured)
