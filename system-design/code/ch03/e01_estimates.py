"""Chapter 3: the estimation helpers, checked on round numbers."""

from common.estimates import (
    GB,
    TB,
    bandwidth,
    human,
    in_flight,
    peak,
    per_second,
    servers,
    storage,
    table,
)


def daily_to_qps(per_day):
    return round(per_second(per_day), 1)


SOLUTIONS = [daily_to_qps]
EXAMPLES = [
    ((86_400,), 1.0),
    ((1_000_000,), 11.6),
    ((1_000_000_000,), 11574.1),
]


def demo():
    # A photo-sharing app: 10 million uploads a day, 2 MB each,
    # kept for 5 years with 3 copies; 100 views per upload.
    uploads = per_second(10_000_000)
    views = uploads * 100
    table(
        [
            ("uploads per second (avg)", human(uploads)),
            ("uploads per second (peak x3)", human(peak(uploads))),
            ("views per second (avg)", human(views)),
            (
                "upload bandwidth",
                human(bandwidth(uploads, 2 * 10**6), "B") + "/s",
            ),
            (
                "view bandwidth",
                human(bandwidth(views, 2 * 10**6), "B") + "/s",
            ),
            (
                "storage, 5 years x 3",
                human(storage(2 * 10**6, 10**7, 5 * 365, 3), "B"),
            ),
            (
                "web servers (1,000 rps each)",
                int(servers(peak(views), 1000)),
            ),
            (
                "requests in flight (200 ms)",
                human(in_flight(peak(views), 0.2)),
            ),
        ]
    )


def test():
    assert human(1500) == "1.5K" and human(2.5 * TB, "B") == "2.5 TB"
    assert storage(1 * GB, 1, 10, 3) == 30 * GB
    assert servers(1, 1000) == 1 and servers(2000, 1000, 1.0) == 2
    assert servers(2001, 1000, 1.0) == 3
    assert in_flight(100, 0.5) == 50
