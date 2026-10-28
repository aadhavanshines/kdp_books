"""Building a long string: += in a loop or ''.join()?"""

import bench


def make(n):
    return (["word"] * n,)


def plus_equals(words):
    text = ""
    for w in words:
        text += w
    return text


def join(words):
    return "".join(words)


def plus_equals_two_names(words):
    text = ""
    for w in words:
        alias = text  # a second reference to the same string
        text += w
    return alias


sizes = [5_000, 10_000, 20_000, 40_000]
results = {
    "+=": bench.doubling(plus_equals, make, sizes),
    "join": bench.doubling(join, make, sizes),
    "+= (shared)": bench.doubling(plus_equals_two_names, make, sizes),
}
bench.table(results)
