"""11.2 Detect a Loop: does following next pointers ever revisit a node?"""

from common.structures import build_list


def has_loop_set(head):
    seen = set()
    while head:
        if id(head) in seen:
            return True
        seen.add(id(head))
        head = head.next
    return False


def has_loop(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next  # one step
        fast = fast.next.next  # two steps
        if slow is fast:
            return True
    return False


def make(values, pos):
    """Build a list; if pos >= 0, link the tail back to node pos."""
    head = build_list(values)
    if pos >= 0 and head:
        tail, target, i = head, None, 0
        node = head
        while node:
            if i == pos:
                target = node
            tail = node
            node = node.next
            i += 1
        tail.next = target
    return head


def loop_exists(values, pos):
    return has_loop(make(values, pos))


def loop_exists_set(values, pos):
    return has_loop_set(make(values, pos))


SOLUTIONS = [loop_exists, loop_exists_set]
EXAMPLES = [
    (([3, 2, 0, -4], 1), True),
    (([1, 2], -1), False),
    (([1], 0), True),
    (([], -1), False),
]


def random_case(rng):
    n = rng.randint(0, 8)
    return (list(range(n)), rng.randint(-1, n - 1) if n else -1)
