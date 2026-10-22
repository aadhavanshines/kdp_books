"""Chapter 33: a leaderboard with fast rank lookups.

Scores are bounded integers (0 to max_score), so a Fenwick tree over
scores counts how many players beat a given score in O(log max_score),
however many players there are.
"""


class Leaderboard:
    def __init__(self, max_score):
        self.n = max_score + 1
        self.tree = [0] * (self.n + 1)  # Fenwick tree of player counts
        self.score = {}

    def _add(self, s, delta):
        i = s + 1
        while i <= self.n:
            self.tree[i] += delta
            i += i & -i

    def _count_upto(self, s):  # players with score <= s
        i, total = s + 1, 0
        while i > 0:
            total += self.tree[i]
            i -= i & -i
        return total

    def set_score(self, player, s):
        if player in self.score:
            self._add(self.score[player], -1)
        self.score[player] = s
        self._add(s, 1)

    def rank(self, player):
        """1 + number of players with a strictly higher score."""
        s = self.score[player]
        return 1 + len(self.score) - self._count_upto(s)


def run(max_score, updates, queries):
    lb = Leaderboard(max_score)
    for p, s in updates:
        lb.set_score(p, s)
    return [lb.rank(p) for p in queries]


def run_brute(max_score, updates, queries):
    score = dict(updates)
    return [1 + sum(v > score[p] for v in score.values()) for p in queries]


SOLUTIONS = [run, run_brute]
EXAMPLES = [
    (
        (
            100,
            [("ana", 50), ("ben", 70), ("cy", 50), ("ana", 80)],
            ["ana", "ben", "cy"],
        ),
        [1, 2, 3],
    )
]


def random_case(rng):
    players = [f"p{i}" for i in range(rng.randint(1, 15))]
    ups = [
        (rng.choice(players), rng.randint(0, 30))
        for _ in range(rng.randint(1, 40))
    ]
    seen = sorted({p for p, _ in ups})
    return (30, ups, [rng.choice(seen) for _ in range(5)])
