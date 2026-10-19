"""11.4 Remove the k-th Node From the End, in one pass."""

from common.structures import ListNode, build_list, list_values


def remove_from_end(head, k):
    dummy = ListNode(0, head)
    lead = trail = dummy
    for _ in range(k):  # put lead k nodes ahead of trail
        lead = lead.next
    while lead.next:
        lead = lead.next
        trail = trail.next
    trail.next = trail.next.next  # trail is just before the target
    return dummy.next


def removed_values(values, k):
    return list_values(remove_from_end(build_list(values), k))


def remove_brute(values, k):
    values = list(values)
    del values[len(values) - k]
    return values


SOLUTIONS = [removed_values, remove_brute]
EXAMPLES = [
    (([6, 7, 8, 9], 3), [6, 8, 9]),
    (([1], 1), []),
    (([1, 2], 2), [2]),
]


def random_case(rng):
    n = rng.randint(1, 9)
    return (list(range(n)), rng.randint(1, n))
