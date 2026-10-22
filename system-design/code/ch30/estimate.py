"""Chapter 30: ticket booking estimates."""

from common.estimates import human, table


def demo():
    seats = 60_000  # a stadium concert
    fans = 3_000_000  # trying in the first minutes
    table(
        [
            ("seats on sale", human(seats)),
            ("fans arriving in 10 minutes", human(fans)),
            ("arrivals per second", human(fans / 600)),
            ("buyers per seat", f"{fans / seats:.0f}"),
            (
                "queue admission rate (sell in ~30 min)",
                human(seats / 1800 * 3) + " per second",
            ),
        ]
    )
