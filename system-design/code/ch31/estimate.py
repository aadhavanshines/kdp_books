"""Chapter 31: metrics and alerting estimates."""

from common.estimates import human, storage, table


def demo():
    series = 100_000_000  # active time series
    points = series / 10  # one point every 10 s
    table(
        [
            ("points per second", human(points)),
            (
                "raw, 15 days (2 B/point compressed)",
                human(storage(2, points * 86_400, 15), "B"),
            ),
            (
                "1-minute rollups, 1 year (16 B)",
                human(storage(16, series * 1440, 365), "B"),
            ),
            (
                "1-hour rollups, 5 years (16 B)",
                human(storage(16, series * 24, 5 * 365), "B"),
            ),
        ]
    )
