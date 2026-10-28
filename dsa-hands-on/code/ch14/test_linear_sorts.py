"""The linear-time sorts against sorted()."""

import random

from linear_sorts import counting_sort, counting_sort_by, radix_sort


def test_counting_sort():
    rng = random.Random(2026)
    for _ in range(200):
        data = [rng.randint(0, 30) for _ in range(rng.randint(0, 60))]
        assert counting_sort(data, 30) == sorted(data)


def test_counting_sort_by_is_stable():
    words = ["pear", "fig", "kiwi", "apple", "plum", "yam"]
    by_length = counting_sort_by(words, len, 10)
    assert by_length == ["fig", "yam", "pear", "kiwi", "plum", "apple"]


def test_radix_sort_any_base():
    rng = random.Random(2026)
    for base in (2, 10, 256):
        for _ in range(100):
            data = [
                rng.randint(0, 10**9) for _ in range(rng.randint(0, 50))
            ]
            assert radix_sort(data, base) == sorted(data)
