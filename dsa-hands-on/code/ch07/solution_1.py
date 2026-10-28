"""Exercise 7.1: remove the k-th node from the end in one pass,
using two pointers k nodes apart."""

from linked_list import LinkedList, Node


def remove_kth_from_end(head, k):
    dummy = Node(None, head)
    lead = trail = dummy
    for _ in range(k):
        lead = lead.next  # lead is now k nodes ahead of trail
    while lead.next:
        lead, trail = lead.next, trail.next
    trail.next = trail.next.next  # trail is just before the target
    return dummy.next


def values(head):
    while head:
        yield head.value
        head = head.next


for k in (1, 2, 5):
    head = LinkedList([1, 2, 3, 4, 5]).head
    print(k, list(values(remove_kth_from_end(head, k))))
