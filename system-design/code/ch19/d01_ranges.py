"""Chapter 19: handing out ID ranges so servers rarely coordinate.

A central allocator gives each server a block of 1,000 IDs. Servers
hand IDs out locally. A crashed server loses the rest of its block,
leaving gaps but never duplicates.
"""


class Allocator:
    def __init__(self, block=1000):
        self.next_start, self.block = 1, block

    def lease(self):
        start = self.next_start
        self.next_start += self.block  # persisted before replying
        return start, start + self.block


class IdServer:
    def __init__(self, allocator):
        self.allocator, self.cur, self.end = allocator, 0, 0

    def next_id(self):
        if self.cur >= self.end:
            self.cur, self.end = self.allocator.lease()
        self.cur += 1
        return self.cur - 1


def run(schedule, servers=3):
    """schedule: list of server numbers asking for an ID, or ('crash', n)."""
    alloc = Allocator(block=5)
    pool = [IdServer(alloc) for _ in range(servers)]
    out = []
    for step in schedule:
        if isinstance(step, tuple):
            pool[step[1]] = IdServer(alloc)  # restarted: its block is lost
        else:
            out.append(pool[step].next_id())
    return out


SOLUTIONS = [run]
EXAMPLES = [(([0, 0, 1, ("crash", 0), 0, 1],), [1, 2, 6, 11, 7])]


def test():
    import random

    rng = random.Random(3)
    sched = [
        ("crash", rng.randrange(3))
        if rng.random() < 0.05
        else rng.randrange(3)
        for _ in range(5000)
    ]
    ids = run(sched)
    assert len(ids) == len(set(ids))  # gaps are fine, duplicates are not
