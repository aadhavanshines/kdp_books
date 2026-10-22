"""Chapter 9: consistent hashing with virtual nodes, versus mod-N."""

import hashlib
from bisect import bisect


def h(text):
    return int.from_bytes(hashlib.md5(text.encode()).digest()[:8], "big")


class HashRing:
    def __init__(self, nodes, vnodes=100):
        self.vnodes = vnodes
        self.points = []  # sorted (hash, node) pairs around the ring
        for node in nodes:
            self.add(node)

    def add(self, node):
        for i in range(self.vnodes):
            self.points.append((h(f"{node}#{i}"), node))
        self.points.sort()

    def remove(self, node):
        self.points = [p for p in self.points if p[1] != node]

    def owner(self, key):
        i = bisect(self.points, (h(key), "")) % len(self.points)
        return self.points[i][1]  # first point clockwise from the key


def mod_owner(key, nodes):
    return nodes[h(key) % len(nodes)]


def moved_fraction(keys, before, after):
    return sum(before(k) != after(k) for k in keys) / len(keys)


def demo():
    keys = [f"user:{i}" for i in range(20_000)]
    nodes = [f"node{i}" for i in range(10)]
    ring = HashRing(nodes)
    before = {k: ring.owner(k) for k in keys}
    ring.add("node10")
    ring_moved = moved_fraction(keys, before.get, ring.owner)
    mod_moved = moved_fraction(
        keys,
        lambda k: mod_owner(k, nodes),
        lambda k: mod_owner(k, nodes + ["node10"]),
    )
    print(f"adding an 11th node: ring moves {ring_moved:.0%} of keys,")
    print(f"                     mod-N moves {mod_moved:.0%} of keys")
    for v in [1, 10, 100]:
        r = HashRing(nodes, vnodes=v)
        counts = {}
        for k in keys:
            counts[r.owner(k)] = counts.get(r.owner(k), 0) + 1
        ratio = max(counts.values()) / (len(keys) / len(nodes))
        print(
            f"{v:>3} virtual nodes each: busiest node has {ratio:.2f}x its share"
        )


def test():
    keys = [f"k{i}" for i in range(5000)]
    nodes = [f"n{i}" for i in range(8)]
    ring = HashRing(nodes)
    before = {k: ring.owner(k) for k in keys}
    ring.add("n8")
    for k in keys:  # keys only ever move to the new node
        assert ring.owner(k) in (before[k], "n8")
    ring.remove("n8")
    assert all(ring.owner(k) == before[k] for k in keys)
