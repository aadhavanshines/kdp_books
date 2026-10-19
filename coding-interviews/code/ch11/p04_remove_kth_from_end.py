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


def remove_main(values, k):
    return list_values(remove_from_end(build_list(values), k))


def remove_brute(values, k):
    values = list(values)
    del values[len(values) - k]
    return values


SOLUTIONS = [remove_main, remove_brute]
EXAMPLES = [
    (([1, 2, 3, 4, 5], 2), [1, 2, 3, 5]),
    (([1], 1), []),
    (([1, 2], 2), [2]),
]


def random_case(rng):
    n = rng.randint(1, 9)
    return (list(range(n)), rng.randint(1, n))
