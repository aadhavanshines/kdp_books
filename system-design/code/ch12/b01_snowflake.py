"""Chapter 12: Snowflake-style 64-bit IDs.

Layout: 41 bits of milliseconds since a custom epoch, 10 bits of
machine ID, 12 bits of sequence within the millisecond.
"""

EPOCH_MS = 1_767_225_600_000  # 2026-01-01T00:00:00Z, chosen for this book


class SnowflakeGenerator:
    def __init__(self, machine_id, clock_ms):
        if not 0 <= machine_id < 1024:
            raise ValueError("machine_id must fit in 10 bits")
        self.machine, self.clock = machine_id, clock_ms
        self.last_ms, self.sequence = -1, 0

    def next_id(self):
        now = self.clock()
        if now < self.last_ms:
            raise RuntimeError(
                "clock moved backwards; refusing to reuse IDs"
            )
        if now == self.last_ms:
            self.sequence = (self.sequence + 1) & 0xFFF
            if self.sequence == 0:  # 4,096 IDs used this millisecond
                while now <= self.last_ms:
                    now = self.clock()  # wait for the next millisecond
        else:
            self.sequence = 0
        self.last_ms = now
        return (now - EPOCH_MS) << 22 | self.machine << 12 | self.sequence


def parse(snowflake):
    return {
        "time_ms": (snowflake >> 22) + EPOCH_MS,
        "machine": (snowflake >> 12) & 0x3FF,
        "sequence": snowflake & 0xFFF,
    }


def ids_for(ticks, machine):
    """Generate one ID per entry of ticks (a list of clock readings)."""
    readings = iter(ticks)
    gen = SnowflakeGenerator(machine, lambda: next(readings))
    return [parse(gen.next_id()) for _ in range(len(ticks))]


SOLUTIONS = [ids_for]
EXAMPLES = [
    (
        ([EPOCH_MS + 5, EPOCH_MS + 5, EPOCH_MS + 6], 7),
        [
            {"time_ms": EPOCH_MS + 5, "machine": 7, "sequence": 0},
            {"time_ms": EPOCH_MS + 5, "machine": 7, "sequence": 1},
            {"time_ms": EPOCH_MS + 6, "machine": 7, "sequence": 0},
        ],
    )
]


def test():
    import random

    rng = random.Random(1)
    now = [EPOCH_MS]

    def clock():
        now[0] += rng.choice([0, 0, 0, 1])  # many IDs per millisecond
        return now[0]

    gens = [SnowflakeGenerator(m, clock) for m in range(3)]
    ids = [g.next_id() for _ in range(5000) for g in gens]
    assert len(set(ids)) == len(ids)  # unique across machines
    for m in range(3):
        own = ids[m::3]
        assert own == sorted(own)  # increasing on each machine
    years = (1 << 41) / 1000 / 86_400 / 365.25
    assert 69 < years < 70  # 41 bits of milliseconds last about 69 years
    back = iter([EPOCH_MS + 10, EPOCH_MS + 9])
    g = SnowflakeGenerator(0, lambda: next(back))
    g.next_id()
    try:
        g.next_id()
        raise AssertionError("expected an error")
    except RuntimeError:
        pass
