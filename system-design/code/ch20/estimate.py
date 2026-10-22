"""Chapter 20: web crawler estimates."""

from common.estimates import human, per_second, storage, table


def demo():
    pages_per_month = 1_000_000_000
    rate = per_second(pages_per_month / 30)
    table(
        [
            ("pages per second", human(rate)),
            (
                "download bandwidth (500 KB/page)",
                human(rate * 500_000, "B") + "/s",
            ),
            (
                "stored HTML per month (100 KB compressed)",
                human(storage(100_000, pages_per_month, 1), "B"),
            ),
            (
                "links found per month (10 per page)",
                human(pages_per_month * 10),
            ),
            (
                "seen-URL set, 8-byte fingerprints",
                human(pages_per_month * 10 * 8, "B"),
            ),
            ("politeness: 1 fetch/s/host, hosts needed busy", human(rate)),
        ]
    )
