"""Chapter 31: downsampling metrics and a "for 5 minutes" alert rule.

Raw points (every 10 s) are rolled up into 1-minute buckets keeping
count, sum, min and max, so averages and extremes stay exact. An alert
fires only when a condition holds for a whole window, which avoids
paging someone for a single spike.
"""


def rollup(points, bucket=60):
    """points: (timestamp, value). Returns {bucket_start: (count, sum,
    min, max)}."""
    out = {}
    for t, v in points:
        b = t - t % bucket
        c, s, lo, hi = out.get(b, (0, 0, v, v))
        out[b] = (c + 1, s + v, min(lo, v), max(hi, v))
    return dict(sorted(out.items()))


def rollup_brute(points, bucket=60):
    starts = sorted({t - t % bucket for t, _ in points})
    out = {}
    for b in starts:
        vals = [v for t, v in points if b <= t < b + bucket]
        out[b] = (len(vals), sum(vals), min(vals), max(vals))
    return out


SOLUTIONS = [rollup, rollup_brute]
EXAMPLES = [
    (
        ([(0, 5), (10, 7), (65, 1), (70, 3)],),
        {0: (2, 12, 5, 7), 60: (2, 4, 1, 3)},
    )
]


def random_case(rng):
    pts = [
        (t * 10 + rng.randint(0, 9), rng.randint(0, 100))
        for t in range(rng.randint(0, 50))
    ]
    return (pts,)


def alert_times(series, threshold, hold):
    """series: (minute, value) per minute. Return the minutes at which an
    alert starts firing: value > threshold for `hold` minutes in a row."""
    fired, run = [], 0
    for minute, value in series:
        run = run + 1 if value > threshold else 0
        if run == hold:
            fired.append(minute)
    return fired


def demo():
    # CPU %: one short spike at minute 3, a real problem from minute 10.
    cpu = [
        40,
        42,
        41,
        97,
        43,
        40,
        44,
        41,
        42,
        45,
        92,
        95,
        96,
        94,
        98,
        97,
        60,
    ]
    series = list(enumerate(cpu))
    print("alert on any minute > 90%:  ", alert_times(series, 90, 1))
    print("alert after 5 minutes > 90%:", alert_times(series, 90, 5))
