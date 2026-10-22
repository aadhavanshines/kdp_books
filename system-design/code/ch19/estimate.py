"""Chapter 19: unique ID generator estimates."""

from common.estimates import human, table


def demo():
    peak = 2_000_000  # IDs per second across the company
    per_machine = 4096 * 1000  # Snowflake: 4,096 per millisecond
    table(
        [
            ("IDs per second needed (peak)", human(peak)),
            (
                "max per Snowflake worker",
                human(per_machine) + " per second",
            ),
            ("worker IDs available (10 bits)", f"{2**10:,}"),
            (
                "years of 41-bit milliseconds",
                f"{2**41 / 1000 / 86_400 / 365.25:.1f}",
            ),
            ("64-bit IDs per day at peak", human(peak * 86_400)),
        ]
    )
