"""Tests for BST, with random operations checked against a dict."""

import random

import pytest

from bst import BST


def test_put_get_and_order():
    t = BST()
    for k in [50, 30, 70, 20, 40, 60, 80]:
        t.put(k, str(k))
    assert list(t) == [20, 30, 40, 50, 60, 70, 80]
    assert t.get(40) == "40" and t.get(45) is None and 60 in t
    assert t.min() == 20 and t.height() == 2
    assert t.floor(65) == 60 and t.floor(10) is None


def test_delete_leaf_one_child_two_children_root():
    t = BST()
    for k in [50, 30, 70, 20, 40, 60, 80, 65]:
        t.put(k, k)
    t.delete(20)  # a leaf
    t.delete(60)  # one child (65)
    t.delete(30)  # one child left after the leaf went (40)
    t.delete(50)  # the root, with two children
    assert list(t) == [40, 65, 70, 80] and len(t) == 4
    with pytest.raises(KeyError):
        t.delete(50)


def test_random_operations_match_dict():
    rng = random.Random(2026)
    t, expected = BST(), {}
    for _ in range(20000):
        k = rng.randint(0, 200)
        if rng.random() < 0.6:
            t.put(k, -k)
            expected[k] = -k
        elif k in expected:
            t.delete(k)
            del expected[k]
        assert len(t) == len(expected)
    assert list(t) == sorted(expected)
    assert all(t.get(k) == v for k, v in expected.items())
