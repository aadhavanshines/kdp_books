"""Chapter 30: holding and booking seats without double booking.

A hold reserves a seat for a few minutes while the buyer pays. Every
seat row has a version number; an update succeeds only if the version
is unchanged since it was read (optimistic concurrency control).
"""

import random


class Seats:
    def __init__(self, n, hold_seconds=300):
        self.rows = {
            s: {"state": "free", "who": None, "until": 0, "v": 0}
            for s in range(n)
        }
        self.hold_seconds = hold_seconds

    def read(self, seat, now):
        row = dict(self.rows[seat])
        if row["state"] == "held" and now >= row["until"]:
            row.update(state="free", who=None)  # the hold expired
        return row

    def write_if_unchanged(self, seat, expected_v, **changes):
        row = self.rows[seat]
        if row["v"] != expected_v:
            return False  # someone else changed the seat first
        row.update(changes)
        row["v"] += 1
        return True

    def hold(self, seat, user, now):
        row = self.read(seat, now)
        if row["state"] != "free":
            return False
        return self.write_if_unchanged(
            seat,
            row["v"],
            state="held",
            who=user,
            until=now + self.hold_seconds,
        )

    def confirm(self, seat, user, now):
        row = self.read(seat, now)
        if row["state"] != "held" or row["who"] != user:
            return False  # the hold expired or belongs to someone else
        return self.write_if_unchanged(seat, row["v"], state="sold")


def simulate(seed, seats=5, users=30, steps=400):
    """Users race to hold and pay for seats; reads and writes of
    different users interleave. Returns the sales made."""
    rng = random.Random(seed)
    s = Seats(seats, hold_seconds=20)
    sold, now = [], 0
    for _ in range(steps):
        now += rng.randint(0, 3)
        user, seat = f"u{rng.randrange(users)}", rng.randrange(seats)
        if rng.random() < 0.6:
            s.hold(seat, user, now)
        elif s.confirm(seat, user, now):
            sold.append((seat, user))
    return sold


def test():
    for seed in range(50):
        sold = simulate(seed)
        seats = [seat for seat, _ in sold]
        assert len(seats) == len(set(seats))  # never sold twice
    # Two users read the same free seat; only the first write wins.
    s = Seats(1)
    a, b = s.read(0, 0), s.read(0, 0)
    assert s.write_if_unchanged(
        0, a["v"], state="held", who="ann", until=300
    )
    assert not s.write_if_unchanged(
        0, b["v"], state="held", who="bob", until=300
    )
