"""Chapter 35: a partitioned log with consumer groups and offsets.

Messages with the same key go to the same partition, so they stay in
order. Each consumer group stores, per partition, the offset of the next
message to read. A consumer that crashes before committing makes the
group re-read from the last commit: at-least-once delivery.
"""

import zlib


class Log:
    def __init__(self, partitions):
        self.parts = [[] for _ in range(partitions)]
        self.committed = {}  # (group, partition) -> next offset

    def produce(self, key, value):
        p = zlib.crc32(key.encode()) % len(self.parts)
        self.parts[p].append((key, value))
        return p, len(self.parts[p]) - 1

    def poll(self, group, partition, max_n=10):
        start = self.committed.get((group, partition), 0)
        return start, self.parts[partition][start : start + max_n]

    def commit(self, group, partition, next_offset):
        self.committed[(group, partition)] = next_offset


def consume(log, group, crash_after=None):
    """Read every partition; optionally crash once after processing
    `crash_after` messages without committing them."""
    seen, processed = [], 0
    for p in range(len(log.parts)):
        while True:
            start, batch = log.poll(group, p, max_n=3)
            if not batch:
                break
            for msg in batch:
                seen.append(msg)
                processed += 1
            if crash_after is not None and processed >= crash_after:
                crash_after = None  # crash: this batch is never committed
                continue
            log.commit(group, p, start + len(batch))
    return seen


def test():
    log = Log(partitions=4)
    for i in range(60):
        log.produce(f"user{i % 7}", i)
    plain = consume(log, "billing")
    assert sorted(v for _, v in plain) == list(range(60))  # each once
    for key in {k for k, _ in plain}:  # per-key order is preserved
        vals = [v for k, v in plain if k == key]
        assert vals == sorted(vals)
    again = consume(log, "billing")
    assert again == []  # everything committed
    crashy = consume(log, "analytics", crash_after=10)
    values = [v for _, v in crashy]
    assert set(values) == set(range(60)) and len(values) > 60  # replays


def demo():
    log = Log(partitions=3)
    for i in range(12):
        log.produce(f"order{i % 4}", f"event {i}")
    got = consume(log, "emails", crash_after=4)
    print(f"12 events, consumer crashed once: {len(got)} deliveries")
    print(
        "duplicates:",
        sorted({v for _, v in got if [x for _, x in got].count(v) > 1}),
    )
