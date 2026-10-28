"""Build a tree from n sorted keys, then look up every key: a plain
BST against an AVL tree."""

import bench
from avl import AVLTree
from bst import BST  # a copy of Chapter 16's bst.py


def build_and_search(make, n):
    t = make()
    for k in range(n):
        t.put(k, None)
    for k in range(n):
        k in t


sizes = [500, 1_000, 2_000, 4_000]
results = {
    "BST": bench.doubling(build_and_search, lambda n: (BST, n), sizes),
    "AVLTree": bench.doubling(
        build_and_search, lambda n: (AVLTree, n), sizes
    ),
}
bench.table(results)
bench.chart(results, "ch17_avl.png", "Sorted keys: build, then search")
