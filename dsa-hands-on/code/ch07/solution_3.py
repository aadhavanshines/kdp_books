"""Exercise 7.3: where does a cycle start? After the pointers meet,
restart one from the head; moving both one step at a time, they meet
again exactly at the first node of the cycle."""

from linked_list import LinkedList


def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            slow = head
            while slow is not fast:
                slow, fast = slow.next, fast.next
            return slow
    return None


chain = LinkedList(range(10))
print(cycle_start(chain.head))
node = chain.find(6)
chain.tail.next = node  # 9 now points back to 6
print(cycle_start(chain.head).value)
