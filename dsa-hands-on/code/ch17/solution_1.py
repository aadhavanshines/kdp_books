"""Exercise 17.1: count the rotations while inserting 1,000 keys in
sorted order and in random order."""

import random

import avl

rotations = 0
original_right, original_left = avl.rotate_right, avl.rotate_left


def counted(rotate):
    def wrapper(node):
        global rotations
        rotations += 1
        return rotate(node)

    return wrapper


avl.rotate_right = counted(original_right)
avl.rotate_left = counted(original_left)
rng = random.Random(2026)
for name, keys in [
    ("sorted", range(1000)),
    ("random", rng.sample(range(1000), 1000)),
]:
    rotations = 0
    t = avl.AVLTree()
    for k in keys:
        t.put(k, None)
    print(f"{name}: {rotations} rotations, height {t.height()}")
