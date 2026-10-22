"""Chapter 18: finding differences between two replicas with Merkle trees.

Keys are grouped into buckets by hash. Each bucket's hash covers its
keys and values; parents hash their children. Replicas compare roots and
descend only into subtrees whose hashes differ.
"""

import hashlib


def digest(text):
    return hashlib.sha256(text.encode()).hexdigest()[:16]


def bucket_of(key, buckets):
    return int(digest(key), 16) % buckets


def build(data, buckets=16):
    """Return the tree as a list of levels, leaves first."""
    groups = [[] for _ in range(buckets)]
    for k, v in data.items():  # one pass: put each key in its bucket
        groups[bucket_of(k, buckets)].append((k, v))
    leaves = [digest(repr(sorted(g))) for g in groups]
    levels = [leaves]
    while len(levels[-1]) > 1:
        prev = levels[-1]
        levels.append(
            [digest(prev[i] + prev[i + 1]) for i in range(0, len(prev), 2)]
        )
    return levels


def differing_buckets(a, b, buckets=16):
    """Walk both trees from the root; return differing leaf buckets and
    how many hashes were compared."""
    ta, tb = build(a, buckets), build(b, buckets)
    compared, frontier = 0, [0]
    for depth in range(len(ta) - 1, -1, -1):
        level_a, level_b = ta[depth], tb[depth]
        nxt = []
        for i in frontier:
            compared += 1
            if level_a[i] != level_b[i]:
                nxt.extend([2 * i, 2 * i + 1] if depth else [i])
        frontier = nxt
    return sorted(frontier), compared


def keys_to_sync(a, b):
    buckets, _ = differing_buckets(a, b)
    keys = set(a) | set(b)
    return sorted(
        k
        for k in keys
        if bucket_of(k, 16) in buckets and a.get(k) != b.get(k)
    )


def keys_to_sync_brute(a, b):
    return sorted(k for k in set(a) | set(b) if a.get(k) != b.get(k))


SOLUTIONS = [keys_to_sync, keys_to_sync_brute]
EXAMPLES = [
    (({"a": 1, "b": 2, "c": 3}, {"a": 1, "b": 5, "d": 4}), ["b", "c", "d"])
]


def random_case(rng):
    base = {f"k{i}": rng.randint(0, 3) for i in range(rng.randint(0, 40))}
    other = dict(base)
    for _ in range(rng.randint(0, 4)):
        if other and rng.random() < 0.5:
            other.pop(rng.choice(sorted(other)))
        else:
            other[f"k{rng.randint(0, 50)}"] = rng.randint(0, 3)
    return (base, other)


def demo():
    a = {f"user:{i}": i for i in range(100_000)}
    b = dict(a)
    b["user:42"] = -1  # one replica missed a single update
    buckets, compared = differing_buckets(a, b, buckets=1024)
    in_bucket = sum(bucket_of(k, 1024) in buckets for k in a)
    print(f"100,000 keys, 1,024 buckets: {compared} hashes compared;")
    print(
        f"{len(buckets)} bucket differs, holding {in_bucket} keys to compare"
    )
