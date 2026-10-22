"""Chapter 5: load-balancing strategies compared on the same traffic.

Requests arrive one per tick. Most finish in 1 to 4 ticks, but one in
five takes 120 ticks, like a slow report among quick page loads.
We measure the largest number of requests any server holds at once.
"""

import random


def simulate(strategy, servers=10, requests=20_000, seed=1):
    rng = random.Random(seed)
    finish = [[] for _ in range(servers)]  # end ticks of active requests
    turn = 0
    worst = 0
    for tick in range(requests):
        for active in finish:  # drop finished requests
            active[:] = [t for t in active if t > tick]
        load = [len(active) for active in finish]
        if strategy == "round robin":
            s = turn % servers
            turn += 1
        elif strategy == "random":
            s = rng.randrange(servers)
        elif strategy == "two choices":  # pick the lighter of two
            a, b = rng.randrange(servers), rng.randrange(servers)
            s = a if load[a] <= load[b] else b
        else:  # least connections: needs every server's load
            s = min(range(servers), key=load.__getitem__)
        finish[s].append(tick + rng.choice([1, 2, 3, 4, 120]))
        worst = max(worst, len(finish[s]))
    return worst


def demo():
    for name in ["random", "round robin", "two choices", "least"]:
        print(f"{name:<12} busiest server held {simulate(name)} requests")


def test():
    results = {
        n: simulate(n, requests=5000) for n in ["random", "two choices"]
    }
    assert results["two choices"] < results["random"]
