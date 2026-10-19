"""17.5 Cheapest Trip With Few Stops: cheapest price from src to dst using
at most k stops (k + 1 flights). -1 if impossible."""


def cheap_flights(n, flights, src, dst, k):
    inf = float("inf")
    price = [inf] * n
    price[src] = 0
    for _ in range(k + 1):  # each round allows one more flight
        new = price[:]  # read last round's prices only
        for u, v, p in flights:
            if price[u] + p < new[v]:
                new[v] = price[u] + p
        price = new
    return -1 if price[dst] == inf else price[dst]


def cheap_flights_brute(n, flights, src, dst, k):
    best = float("inf")

    def fly(city, cost, used):
        nonlocal best
        if city == dst:
            best = min(best, cost)
        if used == k + 1:
            return
        for u, v, p in flights:
            if u == city:
                fly(v, cost + p, used + 1)

    fly(src, 0, 0)
    return -1 if best == float("inf") else best


SOLUTIONS = [cheap_flights, cheap_flights_brute]
EXAMPLES = [
    (
        (
            4,
            [
                (0, 1, 100),
                (1, 2, 100),
                (2, 0, 100),
                (1, 3, 600),
                (2, 3, 200),
            ],
            0,
            3,
            1,
        ),
        700,
    ),
    ((3, [(0, 1, 100), (1, 2, 100), (0, 2, 500)], 0, 2, 1), 200),
    ((3, [(0, 1, 100), (1, 2, 100), (0, 2, 500)], 0, 2, 0), 500),
]


def random_case(rng):
    n = rng.randint(2, 5)
    flights = [
        (rng.randrange(n), rng.randrange(n), rng.randint(1, 20))
        for _ in range(rng.randint(0, 7))
    ]
    flights = [f for f in flights if f[0] != f[1]]
    src, dst = rng.sample(range(n), 2)
    return (n, flights, src, dst, rng.randint(0, 3))
