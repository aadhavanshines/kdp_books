"""Tests for MinHeap, with random operations checked against heapq."""

import heapq
import random

import pytest

from binary_heap import MinHeap


def is_heap(items):
    return all(
        items[(i - 1) // 2] <= items[i] for i in range(1, len(items))
    )


def test_pops_come_out_sorted():
    h = MinHeap()
    for x in [5, 3, 8, 1, 9, 2]:
        h.push(x)
    assert [h.pop() for _ in range(6)] == [1, 2, 3, 5, 8, 9]
    with pytest.raises(IndexError):
        h.pop()


def test_heapify_makes_a_valid_heap():
    rng = random.Random(2026)
    for n in range(50):
        h = MinHeap.heapify([rng.randint(0, 20) for _ in range(n)])
        assert is_heap(h._items)


def test_random_operations_match_heapq():
    rng = random.Random(2026)
    h, expected = MinHeap(), []
    for _ in range(10000):
        if rng.random() < 0.6 or not expected:
            x = rng.randint(0, 999)
            h.push(x)
            heapq.heappush(expected, x)
        else:
            assert h.pop() == heapq.heappop(expected)
        assert len(h) == len(expected)
        assert is_heap(h._items)
