"""Chapter 23: chat estimates."""

from common.estimates import human, per_second, storage, table


def demo():
    dau = 500_000_000
    msgs_day = dau * 40
    table(
        [
            ("messages per second (avg)", human(per_second(msgs_day))),
            ("open connections (60% online)", human(dau * 0.6)),
            (
                "gateway servers (100K conns each)",
                f"{dau * 0.6 / 100_000:,.0f}",
            ),
            (
                "storage per year (200 B/msg)",
                human(storage(200, msgs_day, 365), "B"),
            ),
        ]
    )
