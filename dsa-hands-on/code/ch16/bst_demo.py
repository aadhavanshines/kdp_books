"""Build a small BST, draw it, then delete the root."""

from bst import BST


def draw(node, depth=0):
    if node:
        draw(node.right, depth + 1)
        print("    " * depth + str(node.key))
        draw(node.left, depth + 1)


t = BST()
for k in [50, 30, 70, 20, 40, 60, 80]:
    t.put(k, None)
draw(t.root)
t.delete(50)  # 60, the next key, takes its place
print("after deleting 50:")
draw(t.root)
