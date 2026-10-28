"""The singly linked list in action."""

from linked_list import LinkedList

s = LinkedList(["b", "c"])
s.push_front("a")
s.append("d")
print(s, f"(length {len(s)})")
s.remove("c")
print(s)
s.reverse()
print(s)
print("popped", s.pop_front(), "leaving", s)
