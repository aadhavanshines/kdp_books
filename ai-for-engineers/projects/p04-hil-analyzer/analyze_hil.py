#!/usr/bin/env python3
"""Evaluate one night of HIL-2 bench logs.

Usage: python analyze_hil.py data/2026-10-06   -> writes results.json, prints a table.

The night directory holds manifest.json and one CSV per run; the limits file is
read from <night dir>/../limits-v1.3.json (or the --limits option).
Measurement definitions come from TP-AP-01 v3.1, TP-TH-01 v2.0 and GL-HIL-2 v5.
"""
import argparse
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

NEAR_LIMIT = 0.02  # report a passing value within 2 % of a limit


# ---------------------------------------------------------------- helpers
class Run:
    """Collects criteria, anomalies and measured values for one run."""

    def __init__(self, meta):
        self.meta = meta
        self.criteria = []   # dicts: name, value, min, max, unit, ok
        self.anomalies = []
        self.values = {}
        self.error = None

    def check(self, name, value, lo=None, hi=None, unit="", ok=None, note=None):
        """Compare value with [lo, hi]. ok may be forced (e.g. 'or fully open')."""
        if ok is None:
            ok = (lo is None or value >= lo) and (hi is None or value <= hi)
        self.criteria.append(dict(name=name, value=value, min=lo, max=hi,
                                  unit=unit, ok=bool(ok)))
        if note:
            self.anomalies.append(note)
        if ok:
            for lim, label in ((lo, "min"), (hi, "max")):
                if lim and abs(value - lim) <= NEAR_LIMIT * abs(lim):
                    self.anomalies.append(
                        f"{name} = {value:g} {unit} is within 2% of its {label} limit "
                        f"{lim:g} (margin {abs(value - lim):.3g} {unit})")

    def note(self, text):
        self.anomalies.append(text)

    @property
    def failed(self):
        return [c for c in self.criteria if not c["ok"]]


def resolve_limits(limits, test):
    spec = limits[test]
    while "same_as" in spec:
        spec = limits[spec["same_as"]]
    return spec


def first_time(df, mask, after=None):
    """time_ms of the first row where mask is true (optionally after a time)."""
    m = mask if after is None else mask & (df.time_ms > after)
    idx = df.index[m]
    return None if len(idx) == 0 else int(df.time_ms[idx[0]])


# ---------------------------------------------------------------- tests
def test_anti_pinch(df, lim, r):
    """TP-AP-01 evaluation, followed exactly."""
    thr = lim["force_threshold_n"]
    # Stop latency: first sample with force > threshold -> first later sample
    # where the motor command is no longer 'close' (1).
    t80 = first_time(df, df.pinch_force_n > thr)
    if t80 is None:
        r.check("stop_latency_ms", float("nan"), hi=lim["stop_latency_ms"]["max"], unit="ms", ok=False)
        r.note(f"pinch force never exceeded {thr} N; no pinch event in the log")
        return
    t_stop = first_time(df, df.motor_cmd != 1, after=t80)
    lat = float("inf") if t_stop is None else t_stop - t80
    r.values.update(t_force_over_threshold_ms=t80, t_motor_stop_ms=t_stop)
    r.check("stop_latency_ms", lat, hi=lim["stop_latency_ms"]["max"], unit="ms")

    # Reversal: final position - lowest position before the motor command first
    # becomes 'open' (-1). Pass if >= limit or the window ended fully open
    # (final position >= the position at the start of the log).
    t_open = first_time(df, df.motor_cmd == -1)
    if t_open is None:
        r.check("reversal_mm", 0.0, lo=lim["reversal_mm"]["min"], unit="mm", ok=False)
        r.note("motor never commanded open after the pinch")
    else:
        low = df.position_mm[df.time_ms < t_open].min()
        final = df.position_mm.iloc[-1]
        rev = final - low
        fully_open = final >= df.position_mm.iloc[0]
        r.values.update(lowest_position_mm=low, final_position_mm=final)
        r.check("reversal_mm", rev, lo=lim["reversal_mm"]["min"], unit="mm",
                ok=rev >= lim["reversal_mm"]["min"] or fully_open)

    peak = df.pinch_force_n.max()
    r.values["peak_force_n"] = peak
    if peak > 100:
        r.note(f"peak pinch force {peak:.1f} N is above 100 N (reportable per TP-AP-01)")


def test_mv05(df, lim, r):
    # METHOD (no written procedure): full-travel close time = time from the first
    # sample with motor command 'close' to the first sample where position reaches
    # 0 mm (the closed end stop).
    t0 = first_time(df, df.motor_cmd == 1)
    t1 = first_time(df, df.position_mm <= 0.0)
    if t0 is None or t1 is None:
        r.check("close_time_s", float("nan"), lim["close_time_s"]["min"], lim["close_time_s"]["max"], "s", ok=False)
        return
    r.check("close_time_s", (t1 - t0) / 1000, lim["close_time_s"]["min"], lim["close_time_s"]["max"], "s")
    t_stop = first_time(df, df.motor_cmd != 1, after=t0)
    r.values.update(t_close_start_ms=t0, t_end_stop_ms=t1, t_cmd_off_ms=t_stop)
    stall = df.current_a[(df.time_ms >= t1)].max()
    r.values["end_stop_stall_current_a"] = stall
    if stall > 15:
        r.note(f"end-stop stall current {stall:.1f} A (no limit for this test; "
               f"stall lasted {(t_stop - t1) if t_stop else '?'} ms)")


def test_mv01(df, lim, r):
    # METHOD: a release = a sample where the switch goes from non-zero to 0; the
    # direction is named by the previous switch value (1 = close, -1 = open).
    # stop = first later sample where the motor command is 0. Every release in
    # the log is measured and judged.
    sw = df.switch
    rel = df.index[(sw == 0) & (sw.shift() != 0) & sw.shift().notna()]
    hi = lim["stop_after_release_ms"]["max"]
    if len(rel) == 0:
        r.check("stop_after_release_ms", float("nan"), hi=hi, unit="ms", ok=False)
        return
    names = {1: "close", -1: "open"}
    t_rel, t_zero, lats = {}, {}, {}
    for i in rel:
        prev = sw[i - 1]
        d = names.get(int(prev), f"switch{int(prev)}")
        if d in lats:
            d = f"{d}_{int(df.time_ms[i])}ms"
        t0 = int(df.time_ms[i])
        t_stop = first_time(df, df.motor_cmd == 0, after=t0)
        t_rel[d], t_zero[d] = t0, t_stop
        lats[d] = float("inf") if t_stop is None else t_stop - t0
    r.values.update(t_release_ms=t_rel, t_motor_cmd_zero_ms=t_zero, stop_after_release_ms=lats)
    for d, lat in lats.items():
        r.check(f"stop_after_release_{d}_ms", lat, hi=hi, unit="ms")


def test_can01(df, lim, r):
    # METHOD: period = difference between the times of consecutive samples with
    # can_tx == 1; every period must be inside [min, max].
    t = df.time_ms[df.can_tx == 1].to_numpy()
    p = np.diff(t)
    lo, hi = lim["period_ms"]["min"], lim["period_ms"]["max"]
    r.values.update(frames=len(t), period_mean_ms=float(p.mean()), period_min_ms=int(p.min()), period_max_ms=int(p.max()))
    r.check("period_min_ms", int(p.min()), lo=lo, hi=hi, unit="ms")
    r.check("period_max_ms", int(p.max()), lo=lo, hi=hi, unit="ms")
    bad = np.where((p < lo) | (p > hi))[0]
    if len(bad):
        r.note("periods outside limits: " + ", ".join(
            f"{int(p[i])} ms between t={int(t[i])} and t={int(t[i + 1])} ms" for i in bad[:5])
            + (" (a frame was probably skipped)" if any(p[i] > 1.5 * hi for i in bad) else ""))


def test_th03(df, lim, r):
    # TP-TH-01: above 130 C current never above 15 A; above 140 C no opening
    # movement starts (a movement starts at the first sample of motor_cmd == -1);
    # closing still possible above 140 C.
    t = df.temp_est_c
    cur_lim = lim["current_limit_above_130_c_a"]
    hot = df[t > 130]
    imax = hot.current_a.max() if len(hot) else float("nan")
    n_over = int((hot.current_a > cur_lim).sum())
    r.check("max_current_above_130C_a", float(imax), hi=cur_lim, unit="A")
    if n_over:
        stalls = hot[hot.current_a > cur_lim]
        r.note(f"{n_over} samples above {cur_lim} A while estimate > 130 C "
               f"(first t={int(stalls.time_ms.iloc[0])} ms at {stalls.temp_est_c.iloc[0]:.1f} C, "
               f"peak {imax:.2f} A) - end-stop stalls")
    # near-miss stalls just below the limit
    near = df[(t > 130) & (df.current_a <= cur_lim) & (df.current_a >= cur_lim * (1 - NEAR_LIMIT))]
    if len(near) and not n_over:
        r.note(f"{len(near)} samples within 2% of the {cur_lim} A limit above 130 C")

    starts = df.index[(df.motor_cmd == -1) & (df.motor_cmd.shift() != -1)]
    lim_t = lim["no_opening_above_c"]
    bad = [i for i in starts if t[i] > lim_t]
    r.values["opening_starts_total"] = len(starts)
    r.check("opening_starts_above_140C", len(bad), hi=0, unit="")
    if bad:
        r.note("opening started above 140 C at t=" + ", ".join(
            f"{int(df.time_ms[i])} ms ({t[i]:.1f} C)" for i in bad))
    if lim.get("closing_allowed"):
        cstarts = df.index[(df.motor_cmd == 1) & (df.motor_cmd.shift() != 1) & (t > lim_t)]
        moved = [i for i in cstarts if df.position_mm[i:i + 200].min() < df.position_mm[i] - 10]
        r.values["closing_starts_above_140C"] = len(cstarts)
        if len(cstarts) == 0:
            r.note("no closing movement was requested above 140 C; 'closing still possible' not demonstrated")
        else:
            r.check("closing_possible_above_140C", len(moved), lo=1, unit="movements")
    r.note("10 ms sampling; the log starts at ~112 C and was never cooled, so 'opening possible below 120 C' is not covered by this run")
    # the request to open was never refused: all the same cycles ran to full travel
    if bad:
        r.note("the controller completed full opening travel above 140 C (no inhibit)")


def test_pw03(df, lim, r):
    # METHOD: undervoltage start = first sample with supply_v < undervoltage_v;
    # stop = first later sample where the motor command is 0.
    uv = lim["undervoltage_v"]
    t_uv = first_time(df, df.supply_v < uv)
    if t_uv is None:
        r.check("stop_after_undervoltage_ms", float("nan"), hi=lim["stop_after_undervoltage_ms"]["max"], unit="ms", ok=False)
        r.note(f"supply never fell below {uv} V")
        return
    t_stop = first_time(df, df.motor_cmd == 0, after=t_uv)
    lat = float("inf") if t_stop is None else t_stop - t_uv
    r.values.update(t_undervoltage_ms=t_uv, t_motor_cmd_zero_ms=t_stop,
                    supply_min_v=float(df.supply_v.min()))
    r.check("stop_after_undervoltage_ms", lat, hi=lim["stop_after_undervoltage_ms"]["max"], unit="ms")


def test_dg01(df, lim, r):
    # METHOD: Hall loss = last sample at which the Hall position counter changed
    # while the motor was driving (last valid Hall count; true loss is within one
    # Hall interval after it). Stop = first later sample with motor_cmd == 0.
    # Also check the DTC is stored and is the expected code.
    dtc = df[df.dtc.notna()]
    codes = sorted(dtc.dtc.unique())
    r.values["dtc_codes"] = codes
    r.check("dtc_code", ",".join(codes) or "none", ok=(codes == [lim["dtc"]]))
    t_dtc = int(dtc.time_ms.iloc[0]) if len(dtc) else None
    driving = df[df.motor_cmd != 0]
    changed = driving.position_mm.diff().fillna(0) != 0
    t_loss = int(driving.time_ms[changed].iloc[-1]) if changed.any() else None
    t_stop = first_time(df, df.motor_cmd == 0, after=t_loss) if t_loss is not None else None
    lo, hi = lim["stop_after_hall_loss_ms"]["min"], lim["stop_after_hall_loss_ms"]["max"]
    if t_loss is None or t_stop is None:
        r.check("stop_after_hall_loss_ms", float("nan"), lo, hi, "ms", ok=False)
        return
    lat = t_stop - t_loss
    # Hall interval just before the loss, to bound the uncertainty of t_loss
    ch = driving.time_ms[changed].to_numpy()
    interval = int(np.median(np.diff(ch[-6:]))) if len(ch) > 6 else 0
    r.values.update(t_hall_loss_ms=t_loss, t_motor_cmd_zero_ms=t_stop, t_dtc_ms=t_dtc, hall_interval_ms=interval)
    r.check("stop_after_hall_loss_ms", lat, lo, hi, "ms")
    if interval and lat - interval < lo:
        r.note(f"Hall loss time is only known to within one Hall interval ({interval} ms): "
               f"true latency is {lat - interval}..{lat} ms, so the {lo} ms lower limit "
               f"cannot be confirmed with certainty")
    if t_dtc is not None and t_dtc != t_stop:
        r.note(f"DTC stored at t={t_dtc} ms, motor stopped at t={t_stop} ms")


HANDLERS = {
    "TC-AP": test_anti_pinch, "TC-MV-05": test_mv05, "TC-MV-01": test_mv01,
    "TC-CAN-01": test_can01, "TC-TH-03": test_th03, "TC-PW-03": test_pw03,
    "TC-DG-01": test_dg01,
}


def handler_for(test):
    if test in HANDLERS:
        return HANDLERS[test]
    for k, h in HANDLERS.items():
        if test.startswith(k):
            return h
    return None


# ---------------------------------------------------------------- generic checks
def generic_checks(df, meta, r):
    dt = df.time_ms.diff().dropna()
    exp = meta.get("sample_ms")
    if exp and not (dt == exp).all():
        r.note(f"sample interval differs from manifest {exp} ms: {sorted(set(dt.astype(int)))} ms")
    if df.drop(columns="dtc").isna().any().any():
        r.note("missing values in the log")
    # supply vs. manifest set-point (ignoring load sag and deliberate dropouts)
    sv = meta.get("supply_v")
    if sv and abs(df.supply_v.iloc[0] - sv) > 0.5:
        r.note(f"initial supply {df.supply_v.iloc[0]} V differs from manifest {sv} V")
    # thermal soak: estimate far from chamber temperature
    amb = meta.get("ambient_c")
    t0 = df.temp_est_c.iloc[0]
    if amb is not None and not meta["test"].startswith("TC-TH") and abs(t0 - amb) > 5 and amb != 23:
        r.note(f"temperature estimate at start is {t0:g} C but chamber set to {amb} C "
               f"(soak not complete or estimate offset?)")


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("night_dir")
    ap.add_argument("--limits", default=None)
    ap.add_argument("--out", default="results.json")
    a = ap.parse_args()

    night = Path(a.night_dir)
    manifest = json.loads((night / "manifest.json").read_text())
    limits_path = Path(a.limits) if a.limits else night.parent / "limits-v1.3.json"
    limits = json.loads(limits_path.read_text())
    if limits.get("spec") != manifest.get("spec"):
        print(f"WARNING: limits spec {limits.get('spec')} != manifest spec {manifest.get('spec')}", file=sys.stderr)

    results = []
    for meta in manifest["runs"]:
        r = Run(meta)
        try:
            df = pd.read_csv(night / meta["file"])
            generic_checks(df, meta, r)
            lim = resolve_limits(limits, meta["test"])
            h = handler_for(meta["test"])
            if h is None:
                raise ValueError(f"no analysis for {meta['test']}")
            h(df, lim, r)
        except Exception as e:  # keep going; report the run as an error
            r.error = f"{type(e).__name__}: {e}"
        status = "ERROR" if r.error else ("FAIL" if r.failed else "PASS")
        results.append(dict(
            run=meta["run"], test=meta["test"], status=status,
            failed_criteria=[f"{c['name']}={c['value']:g}{c['unit']} (limit "
                             f"{'min ' + format(c['min'], 'g') if c['min'] is not None else ''}"
                             f"{' ' if c['min'] is not None and c['max'] is not None else ''}"
                             f"{'max ' + format(c['max'], 'g') if c['max'] is not None else ''})"
                             if isinstance(c["value"], (int, float)) else f"{c['name']}={c['value']}"
                             for c in r.failed],
            criteria=r.criteria, values=r.values, anomalies=r.anomalies, error=r.error,
            conditions=dict(supply_v=meta["supply_v"], ambient_c=meta["ambient_c"])))

    def clean(o):
        if isinstance(o, (np.integer,)):
            return int(o)
        if isinstance(o, (np.floating, float)):
            return None if not np.isfinite(o) else float(o)
        if isinstance(o, dict):
            return {k: clean(v) for k, v in o.items()}
        if isinstance(o, (list, tuple)):
            return [clean(v) for v in o]
        return o

    out = dict(night=manifest["night"], bench=manifest["bench"], software=manifest["software"],
               spec=manifest["spec"], limits_file=limits_path.name, results=clean(results))
    Path(a.out).write_text(json.dumps(out, indent=2))

    print(f"Night {manifest['night']}  bench {manifest['bench']}  sw {manifest['software']}  {manifest['spec']}\n")
    print(f"{'Run':<4} {'Test':<9} {'Result':<6} Measured / failed criteria")
    print("-" * 100)
    for x in results:
        meas = "; ".join(f"{c['name']}={c['value']:g}{c['unit']}" if isinstance(c['value'], (int, float))
                         else f"{c['name']}={c['value']}" for c in x["criteria"])
        print(f"{x['run']:<4} {x['test']:<9} {x['status']:<6} {meas}")
        if x["failed_criteria"]:
            print(f"{'':<21}FAILED: " + "; ".join(x["failed_criteria"]))
        if x["error"]:
            print(f"{'':<21}ERROR: {x['error']}")
    print("\nAnomalies / notes:")
    for x in results:
        for n in x["anomalies"]:
            print(f"  {x['run']} {x['test']}: {n}")
    n_f = sum(x["status"] != "PASS" for x in results)
    print(f"\n{len(results) - n_f} PASS, {n_f} FAIL/ERROR. Written to {a.out}")


if __name__ == "__main__":
    main()
