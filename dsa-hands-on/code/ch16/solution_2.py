"""Exercise 16.2: the keys between low and high, in order, visiting
only the parts of the tree that can hold them."""

from bst import BST


def keys_between(node, low, high):
    if node is None:
        return
    if low < node.key:  # smaller keys may be on the left
        yield from keys_between(node.left, low, high)
    if low <= node.key <= high:
        yield node.key
    if node.key < high:  # bigger keys may be on the right
        yield from keys_between(node.right, low, high)


t = BST()
for k in [50, 30, 70, 20, 40, 60, 80, 35, 65]:
    t.put(k, None)
print(list(keys_between(t.root, 33, 66)))
