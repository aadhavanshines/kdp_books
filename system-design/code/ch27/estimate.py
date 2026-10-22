"""Chapter 27: nearby places estimates."""

from common.estimates import human, per_second, table


def demo():
    places = 200_000_000
    searches = per_second(5_000_000_000 / 30)  # 5 billion a month
    table(
        [
            ("places", human(places)),
            ("place records (1 KB each)", human(places * 1000, "B")),
            (
                "geo index entries (geohash + id, 24 B)",
                human(places * 24, "B"),
            ),
            ("searches per second", human(searches)),
            ("place updates per day (1%)", human(places * 0.01)),
        ]
    )
