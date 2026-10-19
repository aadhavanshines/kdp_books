"""23.1 Log Summary: summarize web-server log lines like
    "2026-10-01T12:00:03Z GET /api/orders 200 123ms"
For each path: number of requests, number of errors (status >= 500) and
the slowest time in ms. Skip lines that don't match the format and report
how many were skipped."""

import re

LINE = re.compile(
    r"^\S+ (?:GET|POST|PUT|DELETE) (?P<path>/\S*) (?P<status>\d{3}) "
    r"(?P<ms>\d+)ms$"
)


def log_summary(lines):
    stats = {}
    skipped = 0
    for line in lines:
        m = LINE.match(line.strip())
        if not m:
            skipped += 1
            continue
        path, status, ms = m["path"], int(m["status"]), int(m["ms"])
        count, errors, slowest = stats.get(path, (0, 0, 0))
        stats[path] = (
            count + 1,
            errors + (status >= 500),
            max(slowest, ms),
        )
    return dict(sorted(stats.items())), skipped


def log_summary_split(lines):
    stats, skipped = {}, 0
    for line in lines:
        parts = line.split()
        ok = (
            len(parts) == 5
            and parts[1] in ("GET", "POST", "PUT", "DELETE")
            and parts[2].startswith("/")
            and len(parts[3]) == 3
            and parts[3].isdigit()
            and parts[4].endswith("ms")
            and parts[4][:-2].isdigit()
        )
        if not ok:
            skipped += 1
            continue
        path, status, ms = parts[2], int(parts[3]), int(parts[4][:-2])
        c, e, s = stats.get(path, (0, 0, 0))
        stats[path] = (c + 1, e + (status >= 500), max(s, ms))
    return dict(sorted(stats.items())), skipped


SOLUTIONS = [log_summary, log_summary_split]
LOG = [
    "2026-10-01T12:00:03Z GET /api/orders 200 123ms",
    "2026-10-01T12:00:04Z POST /api/orders 503 870ms",
    "2026-10-01T12:00:05Z GET /health 200 2ms",
    "garbage line",
    "2026-10-01T12:00:06Z GET /api/orders 200 98ms",
]
EXAMPLES = [
    ((LOG,), ({"/api/orders": (3, 1, 870), "/health": (1, 0, 2)}, 1)),
    (([],), ({}, 0)),
]


def random_case(rng):
    lines = []
    for _ in range(rng.randint(0, 10)):
        if rng.random() < 0.2:
            lines.append(
                rng.choice(
                    [
                        "",
                        "oops",
                        "x GET /a 2000 1ms",
                        "x GET /a 200 ms",
                        "x PATCH /a 200 1ms",
                    ]
                )
            )
        else:
            lines.append(
                f"t {rng.choice(['GET', 'POST'])} "
                f"{rng.choice(['/a', '/b', '/'])} "
                f"{rng.choice([200, 404, 500, 503])} "
                f"{rng.randint(0, 999)}ms"
            )
    return (lines,)
