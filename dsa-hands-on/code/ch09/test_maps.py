"""Tests for both hash maps, with random operations checked against
Python's dict."""

import random

import pytest

from chained_map import ChainedMap
from open_map import OpenMap

MAPS = [ChainedMap, OpenMap]


@pytest.mark.parametrize("make", MAPS)
def test_set_get_replace_delete(make):
    m = make()
    m["apple"] = 1
    m["pear"] = 2
    m["apple"] = 3  # replace
    assert m["apple"] == 3 and len(m) == 2 and "pear" in m
    del m["pear"]
    assert "pear" not in m and len(m) == 1
    with pytest.raises(KeyError):
        m["pear"]
    with pytest.raises(KeyError):
        del m["pear"]


@pytest.mark.parametrize("make", MAPS)
def test_keys_that_collide(make):
    m = make()
    keys = [0, 8, 16, 24, 32]  # all in slot 0 of an 8-slot table
    for k in keys:
        m[k] = str(k)
    del m[8]  # the open map leaves a tombstone between the others
    assert [m[k] for k in (0, 16, 24, 32)] == ["0", "16", "24", "32"]
    assert 8 not in m


@pytest.mark.parametrize("make", MAPS)
def test_random_operations_match_dict(make):
    rng = random.Random(2026)
    m, expected = make(), {}
    for _ in range(20000):
        key = rng.randint(0, 300)
        op = rng.random()
        if op < 0.5:
            m[key] = expected[key] = rng.randint(0, 999)
        elif op < 0.8:
            if key in expected:
                del m[key]
                del expected[key]
            else:
                with pytest.raises(KeyError):
                    del m[key]
        else:
            assert (key in m) == (key in expected)
            if key in expected:
                assert m[key] == expected[key]
        assert len(m) == len(expected)
    assert sorted(m) == sorted(expected)
