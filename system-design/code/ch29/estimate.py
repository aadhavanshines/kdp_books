"""Chapter 29: payment system estimates."""

from common.estimates import human, per_second, storage, table


def demo():
    per_day = 50_000_000
    table(
        [
            ("payments per second (avg)", human(per_second(per_day))),
            ("peak (x10, holiday sales)", human(per_second(per_day) * 10)),
            ("ledger rows per day (2 per payment)", human(per_day * 2)),
            (
                "ledger storage, 7 years (200 B/row)",
                human(storage(200, per_day * 2, 7 * 365), "B"),
            ),
        ]
    )
