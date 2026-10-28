"""Tests for the tree helpers."""

import random

from tree import (
    TreeNode,
    from_levels,
    height,
    inorder,
    inorder_loop,
    levels,
    postorder,
    preorder,
)


def sample():
    #       1
    #     2   3
    #    4 5    6
    return from_levels([1, 2, 3, 4, 5, None, 6])


def test_traversals():
    t = sample()
    assert list(preorder(t)) == [1, 2, 4, 5, 3, 6]
    assert list(inorder(t)) == [4, 2, 5, 1, 3, 6]
    assert list(postorder(t)) == [4, 5, 2, 6, 3, 1]
    assert levels(t) == [[1], [2, 3], [4, 5, 6]]


def test_height_and_empty_tree():
    assert height(sample()) == 2
    assert height(None) == -1 and levels(None) == []
    assert list(inorder(from_levels([]))) == []


def random_tree(rng, n):
    if n == 0:
        return None
    left = rng.randint(0, n - 1)
    return TreeNode(
        rng.randint(0, 99),
        random_tree(rng, left),
        random_tree(rng, n - 1 - left),
    )


def test_loop_matches_recursion_on_random_trees():
    rng = random.Random(2026)
    for _ in range(300):
        t = random_tree(rng, rng.randint(0, 40))
        assert list(inorder_loop(t)) == list(inorder(t))
