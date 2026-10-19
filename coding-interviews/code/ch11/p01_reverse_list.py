"""11.1 Reverse a Linked List."""

from common.structures import build_list, list_values


def reverse_list(head):
    prev = None
    while head:
        nxt = head.next  # remember the rest before we cut the link
        head.next = prev
        prev = head
        head = nxt
    return prev


def reverse_list_recursive(head):
    if head is None or head.next is None:
        return head
    new_head = reverse_list_recursive(head.next)
    head.next.next = head  # the node after us now points back to us
    head.next = None
    return new_head


def run(values, fn):
    return list_values(fn(build_list(values)))


def reverse_main(values):
    return run(values, reverse_list)


def reverse_rec(values):
    return run(values, reverse_list_recursive)


SOLUTIONS = [reverse_main, reverse_rec]
EXAMPLES = [(([1, 2, 3, 4],), [4, 3, 2, 1]), (([],), []), (([7],), [7])]


def random_case(rng):
    return ([rng.randint(0, 9) for _ in range(rng.randint(0, 10))],)
