"""Chapter 24: autocomplete estimates."""

from common.estimates import human, peak, per_second, table


def demo():
    searches = 5_000_000_000  # per day
    keystrokes = searches * 6  # one request per typed character
    table(
        [
            (
                "suggestion requests per second",
                human(per_second(keystrokes)),
            ),
            ("peak (x3)", human(peak(per_second(keystrokes)))),
            ("distinct popular phrases kept", human(100_000_000)),
            (
                "trie + top-5 lists (about 200 B/phrase)",
                human(100_000_000 * 200, "B"),
            ),
            ("latency target per keystroke", "under 100 ms end to end"),
        ]
    )
