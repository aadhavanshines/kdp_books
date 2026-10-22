"""Chapter 26: splitting files into chunks for sync and deduplication.

Fixed-size chunks are simple, but inserting one byte near the start
shifts every later chunk, so all of them look new. Content-defined
chunking cuts where a rolling hash of the last few bytes hits a pattern,
so boundaries move with the content and most chunks are reused.
"""

import hashlib
import random

WINDOW = 16
MASK = (1 << 11) - 1  # cut on average every 2 KiB
MIN, MAX = 512, 8192


def fixed_chunks(data, size=2048):
    return [data[i : i + size] for i in range(0, len(data), size)]


def cdc_chunks(data):
    """Cut where a rolling hash over the last WINDOW bytes has its low
    bits all zero (bounded by MIN and MAX chunk sizes)."""
    base, mod = 257, (1 << 61) - 1
    drop = pow(base, WINDOW, mod)
    chunks, start, h = [], 0, 0
    for i, byte in enumerate(data):
        h = (h * base + byte) % mod
        if i - start >= WINDOW:
            h = (h - data[i - WINDOW] * drop) % mod  # slide the window
        size = i - start + 1
        if (size >= MIN and h & MASK == 0) or size >= MAX:
            chunks.append(data[start : i + 1])
            start, h = i + 1, 0
    if start < len(data):
        chunks.append(data[start:])
    return chunks


def fingerprint(chunk):
    return hashlib.sha256(chunk).hexdigest()


def new_chunks(old, new, split):
    """How many chunks of `new` the server doesn't already have."""
    have = {fingerprint(c) for c in split(old)}
    return sum(fingerprint(c) not in have for c in split(new)), len(
        split(new)
    )


def demo():
    rng = random.Random(1)
    old = bytes(rng.randrange(256) for _ in range(1_000_000))
    new = old[:1000] + b"X" + old[1000:]  # insert one byte near the start
    for name, split in [
        ("fixed 2 KiB", fixed_chunks),
        ("content-defined", cdc_chunks),
    ]:
        changed, total = new_chunks(old, new, split)
        print(
            f"{name:<16} upload {changed:>4} of {total} chunks after a 1-byte insert"
        )


def rebuild(data):
    return b"".join(cdc_chunks(data))


def identity(data):
    return data


SOLUTIONS = [rebuild, identity]
EXAMPLES = [((b"sync me",), b"sync me"), ((b"",), b"")]


def random_case(rng):
    return (bytes(rng.randrange(4) for _ in range(rng.randint(0, 20_000))),)


def test():
    rng = random.Random(3)
    data = bytes(rng.randrange(256) for _ in range(200_000))
    sizes = [len(c) for c in cdc_chunks(data)]
    assert all(s <= MAX for s in sizes) and all(
        s >= MIN for s in sizes[:-1]
    )
