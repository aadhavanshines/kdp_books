"""Chapter 33: leaderboard estimates."""

from common.estimates import human, table


def demo():
    players = 50_000_000
    table(
        [
            ("players", human(players)),
            ("score updates per second (peak)", human(100_000)),
            ("rank reads per second (peak)", human(300_000)),
            (
                "sorted-set memory (about 100 B/player)",
                human(players * 100, "B"),
            ),
            (
                "Fenwick tree for scores 0..1,000,000",
                human(1_000_001 * 8, "B"),
            ),
        ]
    )
