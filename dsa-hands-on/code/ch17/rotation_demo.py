"""Insert 1 to 7 in order. A plain BST would become a chain; the AVL
tree rotates and ends perfectly balanced."""

from avl import AVLTree


def draw(node, depth=0):
    if node:
        draw(node.right, depth + 1)
        print("    " * depth + str(node.key))
        draw(node.left, depth + 1)


t = AVLTree()
for k in range(1, 8):
    t.put(k, None)
    if k in (3, 5, 7):
        print(f"after inserting 1 to {k}:")
        draw(t.root)
