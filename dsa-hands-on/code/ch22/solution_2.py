"""Exercise 22.2: the cheapest flight with at most k stops. Bellman-Ford
limited to k + 1 rounds, each round relaxing from the previous round's
prices only, so a route never uses more flights than rounds."""

import math


def cheapest(flights, start, goal, k):
    price = {start: 0}
    for _ in range(k + 1):
        new = dict(price)
        for a, b, cost in flights:
            if a in price and price[a] + cost < new.get(b, math.inf):
                new[b] = price[a] + cost
        price = new
    return price.get(goal, -1)


flights = [
    ("A", "B", 100),
    ("B", "C", 100),
    ("A", "C", 500),
    ("C", "D", 100),
    ("B", "D", 600),
]
for k in (0, 1, 2):
    print(f"at most {k} stops: {cheapest(flights, 'A', 'D', k)}")
