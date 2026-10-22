"""Chapter 28: matching riders to the nearest available driver.

Drivers are indexed in a grid of cells about 1 km wide. A request
searches rings of cells outward and stops once no unsearched cell could
hold a closer driver than the best found.
"""

import math

CELL = 0.01  # degrees, about 1.1 km of latitude


def cell(lat, lon):
    return int(math.floor(lat / CELL)), int(math.floor(lon / CELL))


def dist(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1])  # fine for short distances


class Dispatcher:
    def __init__(self):
        self.grid, self.where = {}, {}

    def update(self, driver, lat, lon):  # a driver's location ping
        if driver in self.where:
            self.grid[cell(*self.where[driver])].discard(driver)
        self.where[driver] = (lat, lon)
        self.grid.setdefault(cell(lat, lon), set()).add(driver)

    def remove(self, driver):
        self.grid[cell(*self.where.pop(driver))].discard(driver)

    def match(self, lat, lon, max_rings=50):
        """Nearest driver (ties: smallest name), removed from the pool."""
        cy, cx = cell(lat, lon)
        best = None
        for r in range(max_rings + 1):
            if best and (r - 1) * CELL > best[0]:
                break  # every unsearched cell is farther than best
            for dy in range(-r, r + 1):
                for dx in range(-r, r + 1):
                    if max(abs(dy), abs(dx)) != r:
                        continue  # only the ring at distance r
                    for d in self.grid.get((cy + dy, cx + dx), ()):
                        cand = (dist((lat, lon), self.where[d]), d)
                        best = min(best, cand) if best else cand
        if best:
            self.remove(best[1])
            return best[1]
        return None


def run(drivers, requests):
    disp = Dispatcher()
    for name, lat, lon in drivers:
        disp.update(name, lat, lon)
    return [disp.match(lat, lon) for lat, lon in requests]


def run_brute(drivers, requests):
    pool = {n: (lat, lon) for n, lat, lon in drivers}
    out = []
    for p in requests:
        if not pool:
            out.append(None)
            continue
        d = min(pool, key=lambda n: (dist(p, pool[n]), n))
        out.append(d)
        del pool[d]
    return out


SOLUTIONS = [run, run_brute]
EXAMPLES = [
    (
        (
            [("d1", 40.70, -74.00), ("d2", 40.75, -73.99)],
            [(40.74, -73.99), (40.74, -73.99), (40.74, -73.99)],
        ),
        ["d2", "d1", None],
    )
]


def random_case(rng):
    drivers = [
        (f"d{i}", 40.7 + rng.uniform(0, 0.2), -74 + rng.uniform(0, 0.2))
        for i in range(rng.randint(0, 25))
    ]
    requests = [
        (40.7 + rng.uniform(0, 0.2), -74 + rng.uniform(0, 0.2))
        for _ in range(rng.randint(1, 10))
    ]
    return (drivers, requests)
