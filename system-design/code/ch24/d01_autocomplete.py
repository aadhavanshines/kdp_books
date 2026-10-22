"""Chapter 24: a trie that stores the top suggestions at every node.

Each node keeps the k most popular completions below it, so a lookup is
a walk down the prefix with no search of the subtree.
"""


class Node:
    __slots__ = ("children", "top")

    def __init__(self):
        self.children, self.top = {}, []  # top: [(-count, phrase)]


class Autocomplete:
    def __init__(self, k=3):
        self.root, self.k, self.counts = Node(), k, {}

    def record(self, phrase, times=1):
        count = self.counts.get(phrase, 0) + times
        self.counts[phrase] = count
        node = self.root
        for ch in phrase:
            node = node.children.setdefault(ch, Node())
            entries = [e for e in node.top if e[1] != phrase]
            entries.append((-count, phrase))
            node.top = sorted(entries)[: self.k]

    def suggest(self, prefix):
        node = self.root
        for ch in prefix:
            node = node.children.get(ch)
            if node is None:
                return []
        return [p for _, p in node.top]


def run(queries, prefix):
    ac = Autocomplete(k=3)
    for q in queries:
        ac.record(q)
    return ac.suggest(prefix)


def run_brute(queries, prefix):
    counts = {}
    for q in queries:
        counts[q] = counts.get(q, 0) + 1
    ranked = sorted(
        (-c, q)
        for q, c in counts.items()
        if q.startswith(prefix) and prefix
    )
    return [q for _, q in ranked[:3]]


SOLUTIONS = [run, run_brute]
EXAMPLES = [
    (
        (
            [
                "rain",
                "rainbow",
                "rain",
                "railway",
                "rainbow",
                "rain",
                "rails",
            ],
            "rai",
        ),
        ["rain", "rainbow", "rails"],
    )
]


def random_case(rng):
    words = ["sun", "sunset", "sunday", "sung", "sum", "summit", "sub"]
    return (
        [rng.choice(words) for _ in range(rng.randint(0, 30))],
        rng.choice(["s", "su", "sun", "sum", "x"]),
    )
