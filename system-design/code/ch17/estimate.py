"""Chapter 17: distributed rate limiter estimates."""

from common.estimates import human, peak, table


def demo():
    rps = 500_000  # API gateway traffic at peak
    clients = 10_000_000  # active API keys
    table(
        [
            ("checks per second (peak)", human(rps)),
            ("store ops per check", "1 (an atomic script)"),
            ("bucket state per client", "16 B (tokens + timestamp)"),
            ("state for all clients", human(clients * 16, "B")),
            (
                "store shards (100K ops/s each)",
                int(-(-peak(rps, 1) // 100_000)),
            ),
            ("added latency budget per check", "1-2 ms (same data center)"),
        ]
    )
