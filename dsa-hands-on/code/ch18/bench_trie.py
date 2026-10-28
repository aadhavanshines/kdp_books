"""Is there any word starting with a prefix, among n words? A scan
with startswith(), our Trie, and binary search in a sorted list."""

import bisect
import random

import bench
from trie import Trie

rng = random.Random(2026)


def words(n):
    return sorted(
        {"".join(rng.choices("abcdefghij", k=8)) for _ in range(n)}
    )


def scan(ws, prefix):
    return any(w.startswith(prefix) for w in ws)


def sorted_search(ws, prefix):
    # the first word >= prefix is the only one that can start with it
    i = bisect.bisect_left(ws, prefix)
    return i < len(ws) and ws[i].startswith(prefix)


PREFIX = "jjjj"  # sorts last: a scan has to look at every word
sizes = [10_000, 20_000, 40_000, 80_000]
results = {
    "scan": bench.doubling(scan, lambda n: (words(n), PREFIX), sizes),
    "Trie": bench.doubling(
        Trie.has_prefix, lambda n: (Trie(words(n)), PREFIX), sizes
    ),
    "sorted + bisect": bench.doubling(
        sorted_search, lambda n: (words(n), PREFIX), sizes
    ),
}
bench.table(results)
