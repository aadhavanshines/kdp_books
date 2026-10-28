"""Trie tests, with prefix queries checked against a plain scan."""

import random

from trie import Trie


def test_insert_and_lookup():
    t = Trie(["car", "cart", "care", "cat", "dog"])
    t.insert("car")  # a duplicate is not counted twice
    assert len(t) == 5
    assert "car" in t and "ca" not in t and "cars" not in t
    assert t.has_prefix("ca") and not t.has_prefix("cow")
    assert t.complete("car") == ["car", "care", "cart"]
    assert t.complete("ca", limit=2) == ["car", "care"]
    assert t.complete("x") == [] and t.complete("") == sorted(
        ["car", "cart", "care", "cat", "dog"]
    )


def test_random_words_match_a_scan():
    rng = random.Random(2026)
    words = {
        "".join(rng.choices("abc", k=rng.randint(1, 6))) for _ in range(500)
    }
    t = Trie(words)
    for _ in range(300):
        prefix = "".join(rng.choices("abc", k=rng.randint(0, 3)))
        expected = sorted(w for w in words if w.startswith(prefix))
        assert t.complete(prefix) == expected
    assert all(w in t for w in words)
    assert "d" not in t and len(t) == len(words)
