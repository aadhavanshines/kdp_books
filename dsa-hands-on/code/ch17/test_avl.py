"""AVL tests: after every random operation the tree must hold exactly
the keys a dict holds, in order, with every node balanced and every
stored height correct."""

import math
import random

import pytest

from avl import AVLTree, height


def check(node):
    """Return the subtree's height, asserting every AVL rule below."""
    if node is None:
        return -1
    left, right = check(node.left), check(node.right)
    assert abs(left - right) <= 1, "unbalanced"
    assert node.height == 1 + max(left, right), "stale height"
    if node.left:
        assert node.left.key < node.key
    if node.right:
        assert node.right.key > node.key
    return node.height


def test_sorted_inserts_stay_balanced():
    t = AVLTree()
    for k in range(1, 1024):
        t.put(k, k)
    assert t.height() == 9  # a perfect tree: 2**10 - 1 nodes
    check(t.root)


def test_random_operations_match_dict():
    rng = random.Random(2026)
    t, expected = AVLTree(), {}
    for _ in range(5000):
        k = rng.randint(0, 300)
        if rng.random() < 0.6:
            t.put(k, -k)
            expected[k] = -k
        elif k in expected:
            t.delete(k)
            del expected[k]
        else:
            with pytest.raises(KeyError):
                t.delete(k)
        check(t.root)
        assert len(t) == len(expected)
        n = len(expected)
        assert height(t.root) <= 1.44 * math.log2(n + 2)
    assert list(t) == sorted(expected)
    assert all(t.get(k) == v for k, v in expected.items())
