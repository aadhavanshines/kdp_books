"""Exercise 7.2: is a linked list a palindrome? Constant extra memory:
find the middle, reverse the second half, compare, restore."""

from linked_list import LinkedList


def reverse_chain(node):
    before = None
    while node:
        node.next, before, node = before, node, node.next
    return before


def is_palindrome(items):
    head = LinkedList(items).head
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    second = reverse_chain(slow)
    a, b, same = head, second, True
    while b:
        if a.value != b.value:
            same = False
            break
        a, b = a.next, b.next
    reverse_chain(second)  # put the list back as it was
    return same


for word in ["racecar", "abba", "abca", "", "x"]:
    print(repr(word), is_palindrome(word))
