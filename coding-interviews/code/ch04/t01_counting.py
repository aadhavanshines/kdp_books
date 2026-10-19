"""Counting and grouping with Counter and defaultdict."""

from collections import Counter, defaultdict


def demo():
    tags = ["db", "api", "db", "ui", "api", "db"]
    counts = Counter(tags)
    print(counts["db"], counts["missing"])  # missing keys count as 0
    print(counts.most_common(2))

    by_length = defaultdict(list)  # a new key starts as []
    for word in ["ox", "cat", "dog", "emu", "go"]:
        by_length[len(word)].append(word)
    print(dict(by_length))
