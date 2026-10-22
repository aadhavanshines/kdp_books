"""Chapter 22: news feed estimates."""

from common.estimates import human, per_second, table


def demo():
    dau = 300_000_000
    posts = per_second(dau * 0.5)  # half of users post once a day
    reads = per_second(dau * 10)  # 10 feed loads per user per day
    fanout = posts * 200  # average 200 followers
    table(
        [
            ("posts per second", human(posts)),
            ("feed reads per second", human(reads)),
            ("inbox writes per second (push)", human(fanout)),
            ("feed cache per user (500 ids x 8 B)", human(500 * 8, "B")),
            ("feed cache for all users", human(dau * 500 * 8, "B")),
        ]
    )
