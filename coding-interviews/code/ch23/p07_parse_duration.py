"""23.7 Parse a Duration: turn strings like "1h30m", "45s" or "2h5s" into
seconds. Units h, m, s appear at most once each, in that order. Raise
ValueError for anything else."""

import re

PATTERN = re.compile(r"(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?")


def parse_duration(text):
    m = PATTERN.fullmatch(text)
    if not text or not m:
        raise ValueError(f"bad duration: {text!r}")
    h, mins, s = (int(g) if g else 0 for g in m.groups())
    return h * 3600 + mins * 60 + s


def parse_duration_scan(text):
    if not text:
        raise ValueError(f"bad duration: {text!r}")
    total, number, order = 0, "", "hms"
    allowed = 0  # index into order of the next unit allowed
    for ch in text:
        if ch.isdigit():
            number += ch
        elif ch in order[allowed:] and number:
            total += int(number) * {"h": 3600, "m": 60, "s": 1}[ch]
            allowed = order.index(ch) + 1
            number = ""
        else:
            raise ValueError(f"bad duration: {text!r}")
    if number:
        raise ValueError(f"bad duration: {text!r}")
    return total


def safe(fn):
    def wrapper(text):
        try:
            return fn(text)
        except ValueError:
            return "error"

    wrapper.__name__ = fn.__name__
    return wrapper


SOLUTIONS = [safe(parse_duration), safe(parse_duration_scan)]
EXAMPLES = [
    (("1h30m",), 5400),
    (("45s",), 45),
    (("2h5s",), 7205),
    (("",), "error"),
    (("5m1h",), "error"),
    (("10",), "error"),
    (("1h1h",), "error"),
    (("h",), "error"),
]


def random_case(rng):
    parts = [
        str(rng.randint(0, 99)) if rng.random() < 0.8 else ""
        for _ in range(3)
    ]
    units = list("hms")
    if rng.random() < 0.2:
        rng.shuffle(units)
    return (
        "".join(
            p + u for p, u in zip(parts, units) if p or rng.random() < 0.1
        ),
    )
