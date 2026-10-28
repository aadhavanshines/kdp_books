"""Recursion fits nested data: flatten lists inside lists."""


def flatten(items):
    out = []
    for x in items:
        if isinstance(x, list):
            out.extend(flatten(x))  # a smaller problem of the same kind
        else:
            out.append(x)
    return out


def flatten_loop(items):
    """The same with an explicit stack instead of recursion."""
    out, stack = [], [iter(items)]
    while stack:
        for x in stack[-1]:
            if isinstance(x, list):
                stack.append(iter(x))
                break
            out.append(x)
        else:  # this list is finished
            stack.pop()
    return out


nested = [1, [2, [3, 4], 5], [], [[6]], 7]
print(flatten(nested))
print(flatten_loop(nested))

deep = [0]
for i in range(1, 5000):
    deep = [deep, i]  # nested 5,000 levels deep
print(len(flatten_loop(deep)))  # the loop has no depth limit
