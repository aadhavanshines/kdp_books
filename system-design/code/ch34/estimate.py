"""Chapter 34: collaborative editing estimates."""

from common.estimates import human, table


def demo():
    docs_open = 5_000_000
    table(
        [
            ("documents open at once", human(docs_open)),
            ("editors per active document (avg)", "2"),
            ("operations per second per editor (typing)", "5"),
            ("operations per second, total", human(docs_open * 2 * 5)),
            ("operation size", "about 50 B"),
            (
                "op log per day (8 busy hours, all kept)",
                human(docs_open * 10 * 50 * 3600 * 8, "B"),
            ),
        ]
    )
