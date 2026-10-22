"""Back-of-the-envelope helpers used by every design chapter.

Units: bytes, seconds, requests. Results are rounded for readability,
because estimates are about orders of magnitude, not precision.
"""

SECONDS_PER_DAY = 86_400
KB, MB, GB, TB, PB = 10**3, 10**6, 10**9, 10**12, 10**15


def per_second(per_day):
    """Average rate per second for a daily total."""
    return per_day / SECONDS_PER_DAY


def peak(rate, factor=3):
    """Peak rate, assuming peak traffic is `factor` times the average."""
    return rate * factor


def storage(item_bytes, items_per_day, days, copies=1):
    """Bytes needed to keep `days` of items, with `copies` replicas."""
    return item_bytes * items_per_day * days * copies


def bandwidth(rate, item_bytes):
    """Bytes per second for `rate` items per second."""
    return rate * item_bytes


def servers(rate, per_server, headroom=0.7):
    """Machines needed so each runs at most `headroom` of its capacity."""
    needed = rate / (per_server * headroom)
    return max(1, -(-needed // 1))  # round up


def in_flight(rate, latency_s):
    """Little's law: requests in progress = arrival rate x time in system."""
    return rate * latency_s


def _fmt(v):
    return f"{v:,.0f}" if v >= 1000 else f"{v:.3g}"


def human(n, unit=""):
    """Format a number with K/M/B/T or KB/MB/GB/TB/PB suffixes."""
    if unit == "B":
        steps = [(PB, "PB"), (TB, "TB"), (GB, "GB"), (MB, "MB"), (KB, "KB")]
        for size, name in steps:
            if n >= size:
                return f"{_fmt(n / size)} {name}"
        return f"{n:.3g} B"
    for size, name in [
        (10**12, "T"),
        (10**9, "B"),
        (10**6, "M"),
        (KB, "K"),
    ]:
        if n >= size:
            return f"{_fmt(n / size)}{name}"
    return f"{n:.3g}"


def table(rows):
    """Print (label, value) rows as an aligned two-column table."""
    width = max(len(label) for label, _ in rows)
    for label, value in rows:
        print(f"{label:<{width}}  {value}")
