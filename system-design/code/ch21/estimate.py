"""Chapter 21: notification service estimates."""

from common.estimates import human, peak, per_second, table


def demo():
    per_day = 2_000_000_000  # push, email and SMS combined
    rate = per_second(per_day)
    table(
        [
            ("notifications per second (avg)", human(rate)),
            ("peak (x10, e.g. breaking news)", human(peak(rate, 10))),
            (
                "queue storage, 1 day (1 KB each)",
                human(per_day * 1000, "B"),
            ),
            (
                "dedup keys kept 1 hour (50 B each)",
                human(rate * 3600 * 50, "B"),
            ),
        ]
    )
