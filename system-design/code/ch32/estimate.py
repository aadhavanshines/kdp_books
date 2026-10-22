"""Chapter 32: job scheduler estimates."""

from common.estimates import human, per_second, table


def demo():
    jobs_day = 1_000_000_000
    table(
        [
            ("jobs per second (avg)", human(per_second(jobs_day))),
            (
                "jobs due on the hour (x20 spike)",
                human(per_second(jobs_day) * 20),
            ),
            (
                "heartbeats per second (50K running, every 5 s)",
                human(50_000 / 5),
            ),
            (
                "job rows kept 30 days (500 B)",
                human(jobs_day * 30 * 500, "B"),
            ),
        ]
    )
