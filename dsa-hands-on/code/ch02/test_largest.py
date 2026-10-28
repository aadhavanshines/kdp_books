"""Tests for largest(): a few chosen cases, then many random ones."""

import random

import pytest

from largest import largest


def test_one_item():
    assert largest([7]) == 7


def test_largest_first_middle_and_last():
    assert largest([9, 1, 2]) == 9
    assert largest([1, 9, 2]) == 9
    assert largest([1, 2, 9]) == 9


def test_negative_numbers_and_ties():
    assert largest([-5, -2, -9]) == -2
    assert largest([4, 4, 4]) == 4


def test_empty_list_is_an_error():
    with pytest.raises(ValueError):
        largest([])


def test_agrees_with_max_on_random_lists():
    rng = random.Random(2026)  # a fixed seed: the same lists every run
    for _ in range(1000):
        numbers = [
            rng.randint(-100, 100) for _ in range(rng.randint(1, 50))
        ]
        assert largest(numbers) == max(numbers)
