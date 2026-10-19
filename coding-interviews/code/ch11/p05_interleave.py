"""11.5 Interleave a List: reorder L0, L1, ..., Ln into L0, Ln, L1,
Ln-1, ... in place."""

from common.structures import build_list, list_values


def interleave(head):
    if head is None:
        return head
    # 1. Find the middle.
    slow = fast = head
    while fast.next and fast.next.next:
        slow, fast = slow.next, fast.next.next
    # 2. Reverse the second half.
    prev, cur = None, slow.next
    slow.next = None
    while cur:
        cur.next, prev, cur = prev, cur, cur.next
    # 3. Weave the two halves together.
    first, second = head, prev
    while second:
        first.next, first = second, first.next
        second.next, second = first, second.next
    return head


def interleave_main(values):
    return list_values(interleave(build_list(values)))


def interleave_brute(values):
    out, i, j = [], 0, len(values) - 1
    while i <= j:
        out.append(values[i])
        if i != j:
            out.append(values[j])
        i, j = i + 1, j - 1
    return out


SOLUTIONS = [interleave_main, interleave_brute]
EXAMPLES = [
    (([1, 2, 3, 4, 5],), [1, 5, 2, 4, 3]),
    (([1, 2, 3, 4],), [1, 4, 2, 3]),
    (([],), []),
    (([9],), [9]),
]


def random_case(rng):
    return (list(range(rng.randint(0, 10))),)
