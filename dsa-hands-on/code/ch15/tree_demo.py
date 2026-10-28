"""One tree, four orders of visiting it."""

from tree import draw, from_levels, inorder, levels, postorder, preorder

t = from_levels(["A", "B", "C", "D", "E", None, "F"])
draw(t)
print("preorder: ", *preorder(t))
print("inorder:  ", *inorder(t))
print("postorder:", *postorder(t))
print("levels:   ", levels(t))
