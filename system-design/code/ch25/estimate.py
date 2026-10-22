"""Chapter 25: video streaming estimates."""

from common.estimates import human, per_second, table


def demo():
    uploads_hours = 500 * 60 * 24  # 500 hours uploaded every minute
    renditions_mbps = sum([0.4, 1.0, 2.5, 5.0, 8.0])
    bytes_per_hour = renditions_mbps * 1e6 / 8 * 3600
    concurrent = 20_000_000
    table(
        [
            ("hours uploaded per day", human(uploads_hours)),
            (
                "storage per day, all renditions",
                human(uploads_hours * bytes_per_hour, "B"),
            ),
            ("concurrent viewers (peak)", human(concurrent)),
            (
                "egress at 3 Mbps average",
                human(concurrent * 3e6 / 8, "B") + "/s",
            ),
            (
                "videos per second (10 min average)",
                human(per_second(uploads_hours * 6)),
            ),
        ]
    )
