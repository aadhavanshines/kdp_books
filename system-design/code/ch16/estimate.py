"""Chapter 16: link shortener estimates."""

from common.estimates import human, peak, per_second, storage, table


def demo():
    new_per_day = 100_000_000 / 30  # 100 million links a month
    writes = per_second(new_per_day)
    reads = writes * 100  # 100 redirects per link
    table(
        [
            ("new links per second (avg)", human(writes)),
            ("redirects per second (avg)", human(reads)),
            ("redirects per second (peak x5)", human(peak(reads, 5))),
            (
                "storage per year (500 B/link)",
                human(storage(500, new_per_day, 365), "B"),
            ),
            ("7-char base-62 codes", human(62**7)),
            (
                "years until codes run out",
                f"{62**7 / (new_per_day * 365):,.0f}",
            ),
        ]
    )
