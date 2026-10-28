"""Tests for DynamicArray, including random operations checked
against Python's own list."""

import random

import pytest

from dynamic_array import DynamicArray


def test_append_and_index():
    a = DynamicArray()
    for x in "abc":
        a.append(x)
    assert len(a) == 3
    assert a[0] == "a" and a[2] == "c" and a[-1] == "c"
    a[1] = "B"
    assert list(a) == ["a", "B", "c"]


def test_bad_index_raises():
    a = DynamicArray()
    a.append(1)
    for i in (1, -2):
        with pytest.raises(IndexError):
            a[i]
    with pytest.raises(IndexError):
        DynamicArray().pop()


def test_insert_and_pop_shift_items():
    a = DynamicArray()
    for x in [1, 2, 4]:
        a.append(x)
    a.insert(2, 3)
    a.insert(0, 0)
    assert list(a) == [0, 1, 2, 3, 4]
    assert a.pop(0) == 0 and a.pop() == 4
    assert list(a) == [1, 2, 3]


def test_capacity_grows_and_shrinks():
    a = DynamicArray()
    for i in range(100):
        a.append(i)
        assert a._capacity >= len(a)
    while len(a) > 1:
        a.pop()
    assert a._capacity <= 4  # shrank as it emptied


def test_random_operations_match_list():
    rng = random.Random(2026)
    a, expected = DynamicArray(), []
    for _ in range(5000):
        op = rng.choice(["append", "append", "insert", "pop", "set"])
        if op == "append":
            x = rng.randint(0, 99)
            a.append(x)
            expected.append(x)
        elif op == "insert":
            i, x = rng.randint(-5, len(expected) + 5), rng.randint(0, 99)
            a.insert(i, x)
            expected.insert(i, x)
        elif expected:
            i = rng.randrange(-len(expected), len(expected))
            if op == "pop":
                assert a.pop(i) == expected.pop(i)
            else:
                a[i] = expected[i] = rng.randint(0, 99)
        assert len(a) == len(expected)
    assert list(a) == expected
