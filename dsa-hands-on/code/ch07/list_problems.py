"""Three classic linked-list interview problems."""

from linked_list import LinkedList, Node


def middle(head):
    """The middle node: a fast pointer moves two steps per slow step."""
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow


def has_cycle(head):
    """Floyd's cycle detection: if the list loops, the fast pointer
    laps the slow one and they meet. Constant extra memory."""
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True
    return False


def merge_sorted(a, b):
    """Merge two sorted chains of nodes into one, reusing the nodes."""
    dummy = tail = Node(None)  # a dummy head avoids special cases
    while a and b:
        if a.value <= b.value:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next


def values(head):
    out = []
    while head:
        out.append(head.value)
        head = head.next
    return out


print(middle(LinkedList([1, 2, 3, 4, 5]).head).value)
print(middle(LinkedList([1, 2, 3, 4]).head).value)

looped = LinkedList([1, 2, 3, 4])
print(has_cycle(looped.head))
looped.tail.next = looped.head.next  # 4 now points back to 2
print(has_cycle(looped.head))

merged = merge_sorted(
    LinkedList([1, 4, 6]).head, LinkedList([2, 3, 7]).head
)
print(values(merged))
