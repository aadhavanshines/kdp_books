"""Mock 2: My Calendar. book(start, end) adds [start, end) and returns True
unless it would overlap an existing booking, in which case it returns
False and adds nothing. Find the place to check with binary search."""

from bisect import bisect_right


class Calendar:
    def __init__(self):
        self.starts, self.ends = [], []  # sorted, non-overlapping

    def book(self, start, end):
        i = bisect_right(self.starts, start)  # bookings before i start <=
        if i > 0 and self.ends[i - 1] > start:
            return False  # the previous booking runs into ours
        if i < len(self.starts) and self.starts[i] < end:
            return False  # ours runs into the next booking
        self.starts.insert(i, start)
        self.ends.insert(i, end)
        return True


def calendar_session(requests):
    cal = Calendar()
    return [cal.book(s, e) for s, e in requests]


def calendar_session_brute(requests):
    booked, out = [], []
    for s, e in requests:
        ok = all(e <= bs or be <= s for bs, be in booked)
        if ok:
            booked.append((s, e))
        out.append(ok)
    return out


SOLUTIONS = [calendar_session, calendar_session_brute]
EXAMPLES = [
    (([(9, 12), (11, 13), (12, 14), (8, 9)],), [True, False, True, True])
]


def random_case(rng):
    reqs = []
    for _ in range(rng.randint(1, 12)):
        s = rng.randint(0, 30)
        reqs.append((s, s + rng.randint(1, 6)))
    return (reqs,)
