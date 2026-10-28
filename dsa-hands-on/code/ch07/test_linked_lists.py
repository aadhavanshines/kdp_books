"""Tests for both linked lists, with random operations checked
against collections.deque."""

import random
from collections import deque

import pytest

from doubly_linked import DoublyLinkedList
from linked_list import LinkedList


def test_singly_basic_operations():
    s = LinkedList([1, 2, 3])
    s.push_front(0)
    s.append(4)
    assert list(s) == [0, 1, 2, 3, 4] and len(s) == 5
    assert s.pop_front() == 0
    s.remove(3)
    s.remove(4)  # the tail: tail must move back
    s.append(5)
    assert list(s) == [1, 2, 5]
    assert s.find(2).value == 2 and s.find(9) is None
    with pytest.raises(ValueError):
        s.remove(9)


def test_reverse():
    for n in range(5):
        s = LinkedList(range(n))
        s.reverse()
        assert list(s) == list(range(n))[::-1]
        s.append("end")  # the tail must be right after reversing
        assert list(s)[-1] == "end"


def test_empty_pops_raise():
    with pytest.raises(IndexError):
        LinkedList().pop_front()
    with pytest.raises(IndexError):
        DoublyLinkedList().pop()


def test_unlink_a_held_node():
    d = DoublyLinkedList("abc")
    middle = d._sentinel.next.next
    assert d.unlink(middle) == "b"
    assert list(d) == ["a", "c"]


def test_random_operations_match_deque():
    rng = random.Random(2026)
    s, d, expected = LinkedList(), DoublyLinkedList(), deque()
    for _ in range(5000):
        op = rng.choice(["front", "back", "popfront", "popback"])
        x = rng.randint(0, 99)
        if op == "front":
            s.push_front(x)
            d.appendleft(x)
            expected.appendleft(x)
        elif op == "back":
            s.append(x)
            d.append(x)
            expected.append(x)
        elif expected and op == "popfront":
            value = expected.popleft()
            assert s.pop_front() == value == d.popleft()
        elif expected:
            value = expected.pop()
            assert d.pop() == value
            s.reverse()  # the singly list can only pop at the front
            assert s.pop_front() == value
            s.reverse()
    assert list(s) == list(d) == list(expected)
    assert len(s) == len(d) == len(expected)
