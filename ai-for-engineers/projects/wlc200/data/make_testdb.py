"""Build the team's v1.3 test suite and the fictional test database.

Writes tests/test-suite-v1.3.csv and testdb/wlc200.db (SQLite) with ten
nights of HIL regression results, 27 September to 6 October 2026.
The last night matches the logs in hil/2026-10-06.
"""
import csv
import json
import random
import sqlite3
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
rng = random.Random(7)

# 1. The v1.3 suite, as the validation team updated it by hand
suite = list(csv.DictReader(open(HERE / "tests" / "test-suite-v1.2.csv")))
upd = {
    "TC-MV-02": dict(requirements="WLC-007",
                     procedure="Switch ignition off; press the switch at 55 s and at 65 s; repeat with a front door opened at 10 s.",
                     pass_criteria="Movement at 55 s; no movement at 65 s; no movement after the door is opened."),
    "TC-MV-07": dict(title="Close on WLC_CloseAll",
                     procedure="With the window half open, send the CAN request WLC_CloseAll; repeat with the pinch rod at 100 mm.",
                     pass_criteria="Window closes in express mode; the pinch is detected and the window reverses."),
    "TC-TH-02": dict(pass_criteria="Above 130 °C, motor current never above 15 A, including the end-stop stall."),
    "TC-CAN-01": dict(pass_criteria="Period 50 ms ± 5 ms; all four signals present."),
    "TC-DG-02": dict(requirements="WLC-030, WLC-037, WLC-038"),
    "TC-PW-04": dict(requirements="WLC-004"),
    "TC-AP-09": dict(requirements="WLC-016",
                     procedure="Close on the rough-road vibration profile RR-04, in manual and express mode.",
                     pass_criteria="No pinch detected in 20 closes (kept after LL-2021-07, although WLC-018 was deleted)."),
}
for t in suite:
    if t["id"].startswith("TC-AP-0") and t["id"] <= "TC-AP-05":
        if t["id"] == "TC-AP-01":
            t["pass_criteria"] = "Motor stops within 10 ms of the force exceeding 80 N; reversal of at least 150 mm."
    t.update(upd.get(t["id"], {}))
suite = [t for t in suite if t["id"] != "TC-UX-01"]
suite.append(dict(id="TC-AP-10", title="Express close inhibited after a pinch", requirements="WLC-039",
                  method="HIL", procedure="Cause a pinch reversal, then give a short press up at 1.0 s and at 2.5 s after the reversal ends.",
                  pass_criteria="No movement at 1.0 s; express close at 2.5 s."))
with open(HERE / "tests" / "test-suite-v1.3.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(suite[0].keys()))
    w.writeheader()
    w.writerows(suite)

# 2. The database
db_path = HERE / "testdb" / "wlc200.db"
db_path.parent.mkdir(exist_ok=True)
db_path.unlink(missing_ok=True)
db = sqlite3.connect(db_path)
db.executescript("""
CREATE TABLE tests (id TEXT PRIMARY KEY, title TEXT, requirements TEXT, method TEXT,
                    procedure TEXT, pass_criteria TEXT);
CREATE TABLE nights (night TEXT PRIMARY KEY, software TEXT, spec TEXT, bench TEXT);
CREATE TABLE results (night TEXT, test_id TEXT, run_id TEXT, verdict TEXT,
                      measure TEXT, value REAL, unit TEXT, limit_text TEXT,
                      PRIMARY KEY (night, test_id));
CREATE TABLE defects (id TEXT PRIMARY KEY, title TEXT, status TEXT, component TEXT,
                      severity TEXT, test_id TEXT, opened TEXT);
""")
db.executemany("INSERT INTO tests VALUES (?,?,?,?,?,?)",
               [(t["id"], t["title"], t["requirements"], t["method"], t["procedure"], t["pass_criteria"]) for t in suite])

nights = [f"2026-09-{d}" for d in (27, 28, 29, 30)] + [f"2026-10-0{d}" for d in range(1, 7)]
def sw(n):
    return "2.4.0-rc1" if n < "2026-10-02" else "2.4.0-rc2" if n < "2026-10-05" else "2.4.0-rc3"
def spec(n):
    return "v1.2" if n < "2026-10-03" else "v1.3"
db.executemany("INSERT INTO nights VALUES (?,?,?,?)", [(n, sw(n), spec(n), "HIL-2") for n in nights])

truth = json.load(open(HERE / "labels" / "hil-truth.json"))
last = nights[-1]
rows = []
for n in nights:
    v13 = spec(n) == "v1.3"
    for i, (run, tr) in enumerate(truth.items()):
        test, m = tr["test"], tr["measured"]
        if n == last:   # the real logs
            key = {"TC-MV-05": ("close_time_s", m.get("close_time_s"), "s", "3.0 to 4.5"),
                   "TC-MV-01": ("stop_after_release_ms", max(m.get("stop_after_release_ms", {0: 0}).values()) if test == "TC-MV-01" else None, "ms", "<= 100"),
                   "TC-CAN-01": ("max_period_ms", m.get("max_period_ms"), "ms", "45 to 55"),
                   "TC-TH-03": ("open_started_above_140_c", (m.get("open_started_above_140_c") or [None])[0], "°C", "no opening above 140"),
                   "TC-PW-03": ("stop_after_undervoltage_ms", m.get("stop_after_undervoltage_ms"), "ms", "<= 50"),
                   "TC-DG-01": ("stop_after_hall_loss_ms", m.get("stop_after_hall_loss_ms"), "ms", "200 to 250")}.get(test)
            if test.startswith("TC-AP"):
                if "reversal_mm" in tr["failed_criteria"] or test == "TC-AP-05":
                    key = ("reversal_mm", m["reversal_mm"], "mm", ">= 150")
                else:
                    key = ("stop_latency_ms", m["stop_latency_ms"], "ms", "<= 10")
            rows.append((n, test, run, tr["verdict"], *key))
            continue
        # earlier nights: plausible history
        if test == "TC-AP-04":
            v = rng.choice([13, 14, 15]); rows.append((n, test, run, "FAIL", "stop_latency_ms", v, "ms", "<= 10")); continue
        if test == "TC-AP-05":
            v = 146.0 if sw(n) != "2.4.0-rc3" else 151.0
            lim = 150 if v13 else 125
            rows.append((n, test, run, "PASS" if v >= lim else "FAIL", "reversal_mm", v, "mm", f">= {lim}")); continue
        if test.startswith("TC-AP"):
            v = rng.choice([4, 5, 6, 7]); rows.append((n, test, run, "PASS", "stop_latency_ms", v, "ms", "<= 10")); continue
        if test == "TC-CAN-01":
            v = (rng.choice([101, 102, 103]) if not v13 else rng.choice([51, 52]))
            lim = "45 to 55" if v13 else "90 to 110"
            rows.append((n, test, run, "PASS", "max_period_ms", v, "ms", lim)); continue
        if test == "TC-TH-03":
            v = round(rng.uniform(140.6, 144.5), 1); rows.append((n, test, run, "FAIL", "open_started_above_140_c", v, "°C", "no opening above 140")); continue
        if test == "TC-MV-05":
            v = round(rng.uniform(3.78, 3.86), 2); rows.append((n, test, run, "PASS", "close_time_s", v, "s", "3.0 to 4.5")); continue
        if test == "TC-MV-01":
            v = rng.choice([58, 61, 62, 64]); rows.append((n, test, run, "PASS", "stop_after_release_ms", v, "ms", "<= 100")); continue
        if test == "TC-PW-03":
            v = rng.choice([19, 21, 22]); rows.append((n, test, run, "PASS", "stop_after_undervoltage_ms", v, "ms", "<= 50")); continue
        if test == "TC-DG-01":
            v = rng.choice([202, 203, 204]); rows.append((n, test, run, "PASS", "stop_after_hall_loss_ms", v, "ms", "200 to 250")); continue
db.executemany("INSERT INTO results VALUES (?,?,?,?,?,?,?,?)", rows)

defects = json.load(open(HERE / "defects" / "defects.json"))
labels = json.load(open(HERE / "labels" / "defect-labels.json"))
link = {"DR-1001": "TC-AP-04", "DR-1006": "TC-AP-04", "DR-1012": "TC-TH-03", "DR-1019": "TC-TH-03",
        "DR-1016": "TC-DG-03", "DR-1030": "TC-AP-05", "DR-1009": "TC-DG-02", "DR-1029": "TC-DG-02",
        "DR-1018": "TC-DG-01", "DR-1027": "TC-DG-01", "DR-1014": "TC-MV-01", "DR-1022": "TC-DG-03",
        "DR-1008": "TC-AP-09", "DR-1023": "TC-AP-09", "DR-1007": "TC-PW-04", "DR-1024": "TC-PW-05",
        "DR-1020": "TC-MV-08", "DR-1002": "TC-MV-02", "DR-1015": "TC-MV-02", "DR-1013": "TC-PS-01"}
closed = {"DR-1003", "DR-1005", "DR-1025", "DR-1028", "DR-1030", "DR-1017", "DR-1021"}
db.executemany("INSERT INTO defects VALUES (?,?,?,?,?,?,?)", [
    (d["id"], d["title"],
     "duplicate" if labels[d["id"]]["duplicate_of"] else "closed" if d["id"] in closed else "open",
     labels[d["id"]]["component"], labels[d["id"]]["severity"], link.get(d["id"]), d["date"])
    for d in defects])
db.commit()
for q in ("SELECT COUNT(*) FROM tests", "SELECT COUNT(*) FROM results",
          "SELECT night, SUM(verdict='FAIL') FROM results GROUP BY night",
          "SELECT status, COUNT(*) FROM defects GROUP BY status"):
    print(q, db.execute(q).fetchall())
