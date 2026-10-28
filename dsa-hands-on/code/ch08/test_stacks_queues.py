"""Tests for the stack and both queues."""

import random
from collections import deque

import pytest

from ring_queue import RingQueue
from stack import Stack
from two_stack_queue import TwoStackQueue


def test_stack_is_last_in_first_out():
    s = Stack()
    for x in [1, 2, 3]:
        s.push(x)
    assert s.peek() == 3 and len(s) == 3
    assert [s.pop(), s.pop(), s.pop()] == [3, 2, 1]
    assert not s
    with pytest.raises(IndexError):
        s.pop()


@pytest.mark.parametrize("make", [RingQueue, TwoStackQueue])
def test_queue_is_first_in_first_out(make):
    q = make()
    for x in range(20):  # more than RingQueue's first 8 slots
        q.enqueue(x)
    assert [q.dequeue() for _ in range(20)] == list(range(20))
    with pytest.raises(IndexError):
        q.dequeue()


@pytest.mark.parametrize("make", [RingQueue, TwoStackQueue])
def test_random_operations_match_deque(make):
    rng = random.Random(2026)
    q, expected = make(), deque()
    for _ in range(5000):
        if rng.random() < 0.55 or not expected:
            x = rng.randint(0, 99)
            q.enqueue(x)
            expected.append(x)
        else:
            assert q.dequeue() == expected.popleft()
        assert len(q) == len(expected)


def test_ring_wraps_around_before_growing():
    q = RingQueue(4)
    for x in range(4):
        q.enqueue(x)
    q.dequeue()
    q.dequeue()
    q.enqueue(4)  # goes into slot 0: the ring wraps
    q.enqueue(5)
    assert len(q._data) == 4  # no growth was needed
    assert [q.dequeue() for _ in range(4)] == [2, 3, 4, 5]
