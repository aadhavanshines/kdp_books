"""Generate the fictional WLC-200 HIL bench logs for the night of 6 October 2026.

Each run is a CSV file with one row per sample. The generator also writes
the truth file the book's analyzer is graded against: the values an engineer
measured by hand, and the faults that were put in on purpose.

Columns:
  time_ms        time since the start of the run
  supply_v       supply voltage at the controller
  switch         door switch: 1 up (close), -1 down (open), 0 released
  motor_cmd      H-bridge command: 1 close, -1 open, 0 off
  current_a      motor current
  position_mm    window position from the Hall sensor, 0 = fully closed
  pinch_force_n  force on the bench pinch rod (10 N/mm)
  temp_est_c     the controller's estimated motor temperature
  can_tx         1 when a WLC_Status frame was sent in this sample
  dtc            diagnostic trouble code stored in this sample, else empty

Run: python data/make_hil_logs.py   (from the wlc200 folder)
"""

import csv
import json
import random
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
# What differs between the nights: the software and its faults
NIGHTS = {
    "2026-10-06": dict(software="2.4.0-rc3", latency={"R04": 14}, can_drop=6400,
                       hot_open_fault=True, current_limit=15.0, seed=0,
                       truth="hil-truth.json"),
    "2026-10-07": dict(software="2.4.0-rc4", latency={"R03": 13, "R04": 13}, can_drop=None,
                       hot_open_fault=False, current_limit=14.6, seed=100,
                       truth="hil-truth-2026-10-07.json"),
}
NIGHT = OUT = TRUTH = CFG = None
FULL_OPEN = 480.0
ROD_STIFFNESS = 10.0          # N per mm of compression


def speed_mm_per_ms(volts, ambient):
    """Closing speed: 126 mm/s at 13.5 V and 23 °C."""
    s = 0.126 * (volts / 13.5) ** 0.8
    if ambient < 0:
        s *= 0.85             # cold grease
    return s


class Run:
    def __init__(self, run_id, test_id, volts, ambient, sample_ms=1, seed=1):
        self.id, self.test, self.volts, self.ambient = run_id, test_id, volts, ambient
        self.dt = sample_ms
        self.rng = random.Random(seed)
        self.rows = []
        self.t = 0
        self.next_can = 20 + self.rng.randint(0, 5)
        self.drop_can_at = None

    def can(self):
        if self.t >= self.next_can:
            due = self.next_can
            self.next_can = due + 50 + self.rng.choice([-1, 0, 0, 1])
            if self.drop_can_at is not None and due >= self.drop_can_at:
                self.drop_can_at = None
                self.next_can = due + 62    # one frame lost, next one 12 ms late
                return 0
            return 1
        return 0

    def add(self, sw, cmd, cur, pos, force, temp, volts=None, dtc=""):
        v = (self.volts if volts is None else volts) + self.rng.gauss(0, 0.02)
        if cmd and cur > 8:
            v -= 0.4          # supply sags on inrush
        self.rows.append([
            self.t, round(v, 2), sw, cmd,
            round(max(cur + self.rng.gauss(0, 0.08), 0) if cmd else abs(self.rng.gauss(0, 0.02)), 2),
            round(pos * 2) / 2,                 # Hall resolution 0.5 mm
            round(force + self.rng.gauss(0, 0.3), 1),
            round(temp, 1), self.can(), dtc])
        self.t += self.dt

    def write(self):
        OUT.mkdir(parents=True, exist_ok=True)
        with open(OUT / f"{self.id}.csv", "w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["time_ms", "supply_v", "switch", "motor_cmd", "current_a",
                        "position_mm", "pinch_force_n", "temp_est_c", "can_tx", "dtc"])
            w.writerows(self.rows)


def pinch_run(run_id, test_id, volts, ambient, rod_mm, latency_ms, reversal_mm,
              start_mm=300.0, manual=False, seed=1):
    """Express (or manual) close onto the pinch rod, then reverse."""
    r = Run(run_id, test_id, volts, ambient, seed=seed)
    v = speed_mm_per_ms(volts, ambient)
    pos, temp = start_mm, ambient + 8
    for _ in range(200):
        r.add(0, 0, 0, pos, 0, temp)
    t_start = r.t
    press = 1500 if manual else 200
    cross_t = stop_t = None
    peak = 0.0
    # closing
    while True:
        sw = 1 if r.t - t_start < press else 0
        since = r.t - t_start
        cur = 3.4 + 9 * max(0, 1 - since / 40)
        force = max(0.0, (rod_mm - pos) * ROD_STIFFNESS)
        cur += force * 0.05
        peak = max(peak, force)
        if cross_t is None and force > 80:
            cross_t = r.t
        if cross_t is not None and r.t - cross_t >= latency_ms:
            stop_t = r.t
            break
        r.add(sw, 1, cur, pos, force, temp)
        pos -= v * min(1.0, since / 15)
    stop_pos = pos
    # brake: 30 ms off, window coasts briefly
    for i in range(30):
        coast = v * max(0, 1 - i / 4)
        pos -= coast
        force = max(0.0, (rod_mm - pos) * ROD_STIFFNESS)
        peak = max(peak, force)
        r.add(0, 0, 0, pos, force, temp)
    min_pos = pos
    target = min(min_pos + reversal_mm, FULL_OPEN)
    i = 0
    while pos < target:
        cur = 3.2 + 8 * max(0, 1 - i / 40)
        force = max(0.0, (rod_mm - pos) * ROD_STIFFNESS)
        r.add(0, -1, cur, pos, force, temp)
        pos = min(target, pos + v * 1.1 * min(1.0, i / 15 + 0.05))
        i += 1
    for _ in range(300):
        r.add(0, 0, 0, pos, 0, temp)
    r.write()
    return r, measure_pinch(r.rows)


def measure_pinch(rows):
    """The engineer's method, applied to the logged samples (not the model):
    the stop latency runs from the first sample above 80 N to the first
    later sample whose motor command is no longer 'close'; the reversal is
    the final position minus the lowest position before reversing."""
    cross = next(row[0] for row in rows if row[6] > 80)
    stop = next(row[0] for row in rows if row[0] > cross and row[3] != 1)
    first_open = next(row[0] for row in rows if row[3] == -1)
    lowest = min(row[5] for row in rows if row[0] < first_open)
    return {"stop_latency_ms": stop - cross,
            "peak_force_n": max(row[6] for row in rows),
            "reversal_mm": rows[-1][5] - lowest}


def main(night):
    global NIGHT, OUT, TRUTH, CFG
    NIGHT, CFG = night, NIGHTS[night]
    OUT = HERE / "hil" / night
    TRUTH = HERE / "labels" / CFG["truth"]
    runs, truth = [], {}

    def record(run, measured, verdict, failed=None, notes=""):
        runs.append({"run": run.id, "test": run.test, "supply_v": run.volts,
                     "ambient_c": run.ambient, "sample_ms": run.dt,
                     "file": f"{run.id}.csv"})
        truth[run.id] = {"test": run.test, "verdict": verdict,
                         "measured": measured, "failed_criteria": failed or [],
                         "notes": notes}

    # Pinch tests (limits from v1.3: 80 N, 10 ms, 150 mm)
    pinch = [
        ("R01", "TC-AP-01", 13.5, 23, 100, 6, 162, {}),
        ("R02", "TC-AP-02", 9.0, 23, 100, 7, 160, {}),
        ("R03", "TC-AP-03", 16.0, 23, 100, 5, 163, {}),
        ("R04", "TC-AP-04", 9.0, -30, 100, 14, 158, {}),
        ("R05", "TC-AP-05", 13.5, 85, 100, 6, 151, {}),
        ("R06", "TC-AP-06", 13.5, 23, 20, 6, 161, {"manual": True}),
    ]
    for n, (rid, tc, volts, amb, rod, lat, rev, kw) in enumerate(pinch):
        lat = CFG["latency"].get(rid, lat)
        run, m = pinch_run(rid, tc, volts, amb, rod, lat, rev, seed=10 + n + CFG["seed"], **kw)
        failed = []
        if m["stop_latency_ms"] > 10:
            failed.append("stop_latency_ms")
        if m["reversal_mm"] < 150:
            failed.append("reversal_mm")
        notes = {
            "R03": (f"Late stop at 16 V: {m['stop_latency_ms']} ms against a 10 ms limit."
                    if m["stop_latency_ms"] > 10 else ""),
            "R04": f"Late stop when cold at low voltage: {m['stop_latency_ms']} ms against a 10 ms limit.",
            "R05": "Passes, but the reversal margin is only about 1 mm above the 150 mm limit.",
            "R06": "Manual close (switch held), pinch rod at 20 mm.",
        }.get(rid, "")
        record(run, m, "FAIL" if failed else "PASS", failed, notes)

    # R07: full close time (TC-MV-05)
    r = Run("R07", "TC-MV-05", 13.5, 23, seed=21 + CFG["seed"])
    pos, v = FULL_OPEN, speed_mm_per_ms(13.5, 23)
    for _ in range(200):
        r.add(0, 0, 0, pos, 0, 31)
    t0 = r.t
    while pos > 0:
        since = r.t - t0
        r.add(1 if since < 200 else 0, 1, 3.4 + 9 * max(0, 1 - since / 40), pos, 0, 31)
        pos = max(0.0, pos - v * min(1.0, since / 15))
    t_end = r.t
    for i in range(40):                         # stall against the seal
        r.add(0, 1, 18.0, 0, 0, 31)
    for _ in range(300):
        r.add(0, 0, 0, 0, 0, 31)
    r.write()
    close_s = round((t_end - t0) / 1000, 2)
    record(r, {"close_time_s": close_s}, "PASS" if 3.0 <= close_s <= 4.5 else "FAIL")

    # R08: manual move and stop on release (TC-MV-01)
    r = Run("R08", "TC-MV-01", 13.5, 23, seed=22 + CFG["seed"])
    pos, v = 240.0, speed_mm_per_ms(13.5, 23)
    lat = {}
    for direction, stop_ms in ((1, 62), (-1, 58)):
        for _ in range(300):
            r.add(0, 0, 0, pos, 0, 31)
        t0 = r.t
        while r.t - t0 < 1500 + stop_ms:
            since = r.t - t0
            sw = direction if since < 1500 else 0
            r.add(sw, direction, 3.4 + 9 * max(0, 1 - since / 40), pos, 0, 31)
            pos -= direction * v * min(1.0, since / 15)
        lat["close" if direction == 1 else "open"] = stop_ms
    for _ in range(300):
        r.add(0, 0, 0, pos, 0, 31)
    r.write()
    record(r, {"stop_after_release_ms": lat}, "PASS")

    # R09: WLC_Status timing (TC-CAN-01), one frame lost at about 6.4 s
    r = Run("R09", "TC-CAN-01", 13.5, 23, seed=23 + CFG["seed"])
    r.drop_can_at = CFG["can_drop"]
    pos = 240.0
    while r.t < 10000:
        phase = (r.t // 2500) % 2
        cmd = 1 if phase == 0 else -1
        pos = min(FULL_OPEN, max(0.0, pos - cmd * 0.126))
        r.add(cmd, cmd, 3.4, pos, 0, 33)
    r.write()
    ts = [row[0] for row in r.rows if row[8] == 1]
    gaps = [b - a for a, b in zip(ts, ts[1:])]
    worst = max(gaps)
    record(r, {"frames": len(ts), "min_period_ms": min(gaps), "max_period_ms": worst,
               "gap_at_ms": ts[gaps.index(worst)]},
           "FAIL" if worst > 55 or min(gaps) < 45 else "PASS",
           ["max_period_ms"] if worst > 55 else [],
           f"One WLC_Status frame missing; the gap is {worst} ms against 50 ms ± 5 ms."
           if worst > 55 else "")

    # R10: thermal (TC-TH-02 current limit, TC-TH-03 opening blocked), 10 ms samples
    r = Run("R10", "TC-TH-03", 13.5, 23, sample_ms=10, seed=24 + CFG["seed"])
    temp, pos, cmd = 112.0, FULL_OPEN, 1
    opens_hot = []
    stall_peaks = []
    while True:
        # idle 500 ms
        for _ in range(50):
            temp -= 0.002
            r.add(0, 0, 0, pos, 0, temp)
        want = cmd
        if want == -1 and temp > 140:
            if not opens_hot and CFG["hot_open_fault"]:
                opens_hot.append(round(temp, 1))    # the fault: this open is executed
            else:
                # second request refused: switch pressed, no movement
                for _ in range(30):
                    r.add(-1, 0, 0, pos, 0, temp)
                refused_at = round(temp, 1)
                break
        t0 = r.t
        target = 0.0 if want == 1 else FULL_OPEN
        while abs(pos - target) > 0.01:
            since = r.t - t0
            sw = want if since < 200 else 0
            r.add(sw, want, 3.4 + 9 * max(0, 1 - since / 40), pos, 0, temp)
            pos = max(0.0, min(FULL_OPEN, pos - want * 1.26))
            temp += 0.0062
        limit = CFG["current_limit"] if temp > 130 else 18.0
        stall_peaks.append((round(temp, 1), limit))
        for _ in range(4):                          # 40 ms stall at the end stop
            r.add(0, want, limit, pos, 0, temp)
            temp += 0.05
        cmd = -want
    # closing is still allowed when hot
    t0 = r.t
    while pos > 0:
        since = r.t - t0
        r.add(1 if since < 200 else 0, 1, 3.4 + 9 * max(0, 1 - since / 40), pos, 0, temp)
        pos = max(0.0, pos - 1.26)
    for _ in range(50):
        r.add(0, 0, 0, pos, 0, temp)
    r.write()
    # Measured from the logged samples, which include sensor noise
    hot_current = max(row[4] for row in r.rows if row[7] > 130)
    failed = (["open_started_above_140_c"] if opens_hot else []) + (
        ["max_current_above_130_c"] if hot_current > 15 else [])
    record(r, {"open_started_above_140_c": opens_hot, "open_refused_at_c": refused_at,
               "max_current_above_130_c": hot_current,
               "close_allowed_when_hot": True},
           "FAIL" if failed else "PASS", failed,
           (f"One opening started at an estimated {opens_hot[0]} °C; the next request "
            f"was refused. The current limiter holds 15.0 A, but the logged current "
            f"reaches {hot_current} A with measurement noise; the procedure has no "
            f"tolerance, so this is reported as a failure for an engineer to judge.")
           if opens_hot else
           f"The first opening request above 140 °C was refused at {refused_at} °C.")

    # R11: undervoltage stop (TC-PW-03)
    r = Run("R11", "TC-PW-03", 13.5, 23, seed=25 + CFG["seed"])
    pos, v = 300.0, speed_mm_per_ms(13.5, 23)
    for _ in range(200):
        r.add(0, 0, 0, pos, 0, 31)
    t0 = r.t
    drop = None
    while True:
        since = r.t - t0
        volts = 13.5 if since < 1300 else 5.5
        if volts < 6 and drop is None:
            drop = r.t
        if drop is not None and r.t - drop >= 21:
            break
        r.add(1 if since < 200 else 0, 1, 3.4 + 9 * max(0, 1 - since / 40), pos, 0, 31, volts=volts)
        pos -= v * min(1.0, since / 15) * (1 if volts > 6 else 0.4)
    for _ in range(300):
        r.add(0, 0, 0, pos, 0, 31, volts=5.5)
    r.write()
    record(r, {"stop_after_undervoltage_ms": 21}, "PASS")

    # R12: Hall sensor loss (TC-DG-01)
    r = Run("R12", "TC-DG-01", 13.5, 23, seed=26 + CFG["seed"])
    pos, v = 300.0, speed_mm_per_ms(13.5, 23)
    for _ in range(200):
        r.add(0, 0, 0, pos, 0, 31)
    t0 = r.t
    loss = None
    while True:
        since = r.t - t0
        if since >= 1300 and loss is None:
            loss = r.t
        if loss is not None and r.t - loss >= 203:
            r.add(0, 0, 0, frozen, 0, 31, dtc="B1A01")
            break
        r.add(1 if since < 200 else 0, 1, 3.4 + 9 * max(0, 1 - since / 40),
              pos if loss is None else frozen, 0, 31)
        if loss is None:
            pos -= v * min(1.0, since / 15)
            frozen = pos
    for _ in range(300):
        r.add(0, 0, 0, frozen, 0, 31)
    r.write()
    record(r, {"dtc": "B1A01", "stop_after_hall_loss_ms": 203}, "PASS")

    manifest = {"night": NIGHT, "bench": "HIL-2", "software": CFG["software"],
                "spec": "ADS-WLC200-SRS v1.3", "runs": runs}
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=1) + "\n")
    TRUTH.write_text(json.dumps(truth, indent=1, ensure_ascii=False) + "\n")
    for k, v in truth.items():
        print(k, v["test"], v["verdict"], v["measured"])


if __name__ == "__main__":
    for night in NIGHTS:
        main(night)
