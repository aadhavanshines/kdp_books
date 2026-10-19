"""11.3 Merge Two Sorted Linked Lists into one sorted list."""

from common.structures import ListNode, build_list, list_values


def merge_lists(a, b):
    dummy = ListNode()  # a fixed node before the head saves special cases
    tail = dummy
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next


def merge_main(a, b):
    return list_values(merge_lists(build_list(a), build_list(b)))


def merge_brute(a, b):
    return sorted(a + b)


SOLUTIONS = [merge_main, merge_brute]
EXAMPLES = [(([1, 4, 6], [2, 4, 5]), [1, 2, 4, 4, 5, 6]), (([], []), [])]


def random_case(rng):
    a = sorted(rng.randint(0, 9) for _ in range(rng.randint(0, 6)))
    b = sorted(rng.randint(0, 9) for _ in range(rng.randint(0, 6)))
    return (a, b)
