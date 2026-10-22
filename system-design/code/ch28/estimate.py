"""Chapter 28: ride matching estimates."""

from common.estimates import human, table


def demo():
    drivers = 5_000_000  # online at peak
    table(
        [
            ("drivers online (peak)", human(drivers)),
            ("location pings per second (every 4 s)", human(drivers / 4)),
            ("ping size", "about 100 B"),
            ("ingest bandwidth", human(drivers / 4 * 100, "B") + "/s"),
            ("live driver index (100 B each)", human(drivers * 100, "B")),
            ("ride requests per second (peak)", human(50_000)),
        ]
    )
