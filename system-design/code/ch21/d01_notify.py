"""Chapter 21: deciding which notifications to send.

Rules, in order: skip channels the user turned off; drop duplicates of
the same event within an hour; during quiet hours only critical
notifications go out; at most `cap` non-critical sends per user per hour.
"""

HOUR = 3600


def decide(events, prefs, cap=3):
    """events: (time, user, event_key, channel, critical) sorted by time.
    prefs: user -> {"off": set of channels, "quiet": (start_h, end_h)}.
    Returns a list of 'send' or the reason it was skipped."""
    last_sent = {}  # (user, event_key) -> time
    recent = {}  # user -> times of non-critical sends
    out = []
    for t, user, key, channel, critical in events:
        p = prefs.get(user, {})
        hour = (t // HOUR) % 24
        start, end = p.get("quiet", (0, 0))
        quiet = (
            start <= hour < end
            if start <= end
            else hour >= start or hour < end
        )
        times = [x for x in recent.get(user, []) if x > t - HOUR]
        if channel in p.get("off", set()):
            out.append("channel off")
        elif t - last_sent.get((user, key), -HOUR) < HOUR:
            out.append("duplicate")
        elif quiet and not critical:
            out.append("quiet hours")
        elif not critical and len(times) >= cap:
            out.append("rate cap")
        else:
            out.append("send")
            last_sent[(user, key)] = t
            if not critical:
                times.append(t)
        recent[user] = times
    return out


SOLUTIONS = [decide]
H = HOUR
EXAMPLES = [
    (
        (
            [
                (9 * H, "ana", "like:7", "push", False),
                (9 * H + 60, "ana", "like:7", "push", False),
                (9 * H + 120, "ana", "news", "email", False),
                (23 * H, "ana", "promo", "push", False),
                (23 * H + 5, "ana", "login-alert", "push", True),
            ],
            {"ana": {"off": {"email"}, "quiet": (22, 7)}},
        ),
        ["send", "duplicate", "channel off", "quiet hours", "send"],
    )
]


def test():
    import random

    rng = random.Random(6)
    events, t = [], 0
    for _ in range(3000):
        t += rng.randint(0, 400)
        events.append(
            (
                t,
                rng.choice("abc"),
                rng.choice(["e1", "e2", "e3", "e4"]),
                "push",
                rng.random() < 0.1,
            )
        )
    out = decide(events, {}, cap=3)
    sent = [e for e, d in zip(events, out) if d == "send"]
    for i, e in enumerate(sent):  # no duplicate of an event within an hour
        assert not any(
            f[1:3] == e[1:3] and 0 <= e[0] - f[0] < HOUR for f in sent[:i]
        )
        window = [
            f
            for f in sent[: i + 1]
            if f[1] == e[1] and not f[4] and f[0] > e[0] - HOUR
        ]
        assert len(window) <= 3  # the cap holds
