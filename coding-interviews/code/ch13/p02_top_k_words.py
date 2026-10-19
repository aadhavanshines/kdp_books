"""13.2 Most Common Tags: the k most frequent tags, most frequent first;
ties broken alphabetically."""

import heapq
from collections import Counter


def top_k_sort(tags, k):
    counts = Counter(tags)
    return sorted(counts, key=lambda t: (-counts[t], t))[:k]


def top_k(tags, k):
    counts = Counter(tags)
    return heapq.nsmallest(k, counts, key=lambda t: (-counts[t], t))


def top_k_buckets(tags, k):
    counts = Counter(tags)
    buckets = [[] for _ in range(len(tags) + 1)]  # count -> tags
    for tag, c in counts.items():
        buckets[c].append(tag)
    out = []
    for c in range(len(buckets) - 1, 0, -1):
        for tag in sorted(buckets[c]):
            if len(out) == k:
                return out
            out.append(tag)
    return out


SOLUTIONS = [top_k, top_k_sort, top_k_buckets]
EXAMPLES = [
    ((["db", "api", "db", "ui", "api", "db"], 2), ["db", "api"]),
    ((["b", "a"], 2), ["a", "b"]),
]


def random_case(rng):
    tags = [
        rng.choice(["a", "b", "c", "d", "e"])
        for _ in range(rng.randint(1, 12))
    ]
    return (tags, rng.randint(1, len(set(tags))))
