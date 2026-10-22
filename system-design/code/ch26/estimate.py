"""Chapter 26: file storage and sync estimates."""

from common.estimates import human, table


def demo():
    users = 200_000_000
    per_user = 10 * 10**9  # 10 GB used on average
    raw = users * per_user
    table(
        [
            ("logical data", human(raw, "B")),
            ("after dedup (assume 30% saved)", human(raw * 0.7, "B")),
            (
                "stored with 1.5x erasure coding",
                human(raw * 0.7 * 1.5, "B"),
            ),
            ("vs. 3 full copies", human(raw * 0.7 * 3, "B")),
            ("metadata rows (1,000 files/user)", human(users * 1000)),
        ]
    )
