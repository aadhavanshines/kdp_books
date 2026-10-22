"""Chapter 20: URL normalization and a polite crawl frontier.

The frontier never fetches from the same host twice within `delay`
seconds, and never queues the same normalized URL twice.
"""

import heapq
from collections import deque
from urllib.parse import urlsplit, urlunsplit


def normalize(url):
    parts = urlsplit(url.strip())
    scheme = parts.scheme.lower()
    host = (parts.hostname or "").lower()
    port = parts.port
    default = {"http": 80, "https": 443}.get(scheme)
    netloc = host if port in (None, default) else f"{host}:{port}"
    path = parts.path or "/"
    return urlunsplit((scheme, netloc, path, parts.query, ""))  # drop #frag


class Frontier:
    def __init__(self, delay):
        self.delay = delay
        self.queues = {}  # host -> deque of URLs
        self.ready = []  # heap of (time host may be fetched again, host)
        self.seen = set()

    def add(self, url):
        url = normalize(url)
        if url in self.seen:
            return False
        self.seen.add(url)
        host = urlsplit(url).hostname
        if host not in self.queues:
            self.queues[host] = deque()
            heapq.heappush(self.ready, (0, host))
        self.queues[host].append(url)
        return True

    def next(self, now):
        """The next URL that may be fetched at time `now`, or None."""
        while self.ready and self.ready[0][0] <= now:
            _, host = heapq.heappop(self.ready)
            q = self.queues[host]
            if q:
                heapq.heappush(self.ready, (now + self.delay, host))
                return q.popleft()
            del self.queues[host]  # empty: forget the host for now
        return None


def norm_all(urls):
    return [normalize(u) for u in urls]


SOLUTIONS = [norm_all]
EXAMPLES = [
    (
        (
            [
                "HTTPS://Example.com:443/a?x=1#top",
                "http://example.com",
                "http://EXAMPLE.com:8080/b",
            ],
        ),
        [
            "https://example.com/a?x=1",
            "http://example.com/",
            "http://example.com:8080/b",
        ],
    )
]


def test():
    import random

    rng = random.Random(2)
    f = Frontier(delay=1.0)
    for i in range(500):
        f.add(
            f"https://site{rng.randrange(5)}.example/page{rng.randrange(80)}"
        )
    last, now, fetched = {}, 0.0, 0
    while f.queues:
        url = f.next(now)
        if url:
            host = urlsplit(url).hostname
            assert now - last.get(host, -9) >= 1.0  # politeness holds
            last[host] = now
            fetched += 1
        now += 0.25
    assert fetched == len(f.seen)
