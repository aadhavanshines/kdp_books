"""17.2 Build Order: packages 0..n-1; (a, b) means b must be built before
a. Return an order that builds everything, or [] if impossible. When
several packages are ready, build the smallest number first."""

import heapq


def build_order(n, deps):
    after = [[] for _ in range(n)]
    waiting_on = [0] * n
    for pkg, before in deps:
        after[before].append(pkg)
        waiting_on[pkg] += 1
    ready = [p for p in range(n) if waiting_on[p] == 0]
    heapq.heapify(ready)  # smallest ready package first
    order = []
    while ready:
        p = heapq.heappop(ready)
        order.append(p)
        for nxt in after[p]:
            waiting_on[nxt] -= 1
            if waiting_on[nxt] == 0:
                heapq.heappush(ready, nxt)
    return order if len(order) == n else []


def build_order_brute(n, deps):
    done, order = set(), []
    while len(order) < n:
        for p in range(n):
            if p not in done and all(b in done for a, b in deps if a == p):
                done.add(p)
                order.append(p)
                break
        else:
            return []
    return order


SOLUTIONS = [build_order, build_order_brute]
EXAMPLES = [
    ((4, [(1, 0), (2, 0), (3, 1), (3, 2)]), [0, 1, 2, 3]),
    ((2, [(0, 1), (1, 0)]), []),
    ((3, [(0, 2)]), [1, 2, 0]),
]


def random_case(rng):
    n = rng.randint(1, 7)
    return (
        n,
        [
            (rng.randrange(n), rng.randrange(n))
            for _ in range(rng.randint(0, 7))
        ],
    )
