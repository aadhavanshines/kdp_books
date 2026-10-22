"""Chapter 35: distributed message queue estimates."""

from common.estimates import human, table


def demo():
    msgs = 2_000_000  # messages per second at peak
    size = 1_000
    table(
        [
            ("messages per second (peak)", human(msgs)),
            ("ingest", human(msgs * size, "B") + "/s"),
            ("average rate (peak / 3)", human(msgs / 3)),
            (
                "retained 7 days, 3 replicas",
                human(msgs / 3 * size * 86_400 * 7 * 3, "B"),
            ),
            ("partitions at 10 MB/s each", f"{msgs * size / 10**7:,.0f}"),
        ]
    )
