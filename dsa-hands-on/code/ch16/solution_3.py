"""Exercise 16.3: the k-th smallest key (k = 1 is the smallest): walk
in order and stop after k keys."""

from itertools import islice

from bst import BST

t = BST()
for k in [50, 30, 70, 20, 40, 60, 80]:
    t.put(k, None)
for k in (1, 3, 7):
    print(k, next(islice(iter(t), k - 1, None)))
