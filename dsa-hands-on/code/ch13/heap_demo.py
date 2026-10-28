"""Watch the list behind the heap as items are pushed and popped."""

from binary_heap import MinHeap

h = MinHeap()
for x in [7, 4, 9, 1, 5]:
    h.push(x)
    print(f"push {x}: {h._items}")
while h:
    smallest = h.pop()
    print(f"pop -> {smallest}: {h._items}")
