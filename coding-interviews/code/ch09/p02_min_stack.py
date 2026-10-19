"""9.2 Minimum Stack: a stack that also reports its smallest item in O(1)."""


class MinStack:
    def __init__(self):
        self.items = []  # pairs of (value, smallest value at or below)

    def push(self, value):
        smallest = min(value, self.items[-1][1]) if self.items else value
        self.items.append((value, smallest))

    def pop(self):
        return self.items.pop()[0]

    def top(self):
        return self.items[-1][0]

    def minimum(self):
        return self.items[-1][1]


def min_stack_session(ops):
    """Run ("push", x), ("pop",), ("top",), ("min",); collect results."""
    s, out = MinStack(), []
    for op in ops:
        if op[0] == "push":
            s.push(op[1])
        elif op[0] == "pop":
            out.append(s.pop())
        elif op[0] == "top":
            out.append(s.top())
        else:
            out.append(s.minimum())
    return out


def list_session(ops):
    s, out = [], []
    for op in ops:
        if op[0] == "push":
            s.append(op[1])
        elif op[0] == "pop":
            out.append(s.pop())
        elif op[0] == "top":
            out.append(s[-1])
        else:
            out.append(min(s))
    return out


SOLUTIONS = [min_stack_session, list_session]
EXAMPLES = [
    (
        (
            [
                ("push", 5),
                ("push", 2),
                ("push", 8),
                ("min",),
                ("pop",),
                ("pop",),
                ("min",),
            ],
        ),
        [2, 8, 2, 5],
    ),
]


def random_case(rng):
    ops, size = [], 0
    for _ in range(rng.randint(1, 15)):
        if size and rng.random() < 0.5:
            op = rng.choice(["pop", "top", "min"])
            ops.append((op,))
            size -= op == "pop"
        else:
            ops.append(("push", rng.randint(-5, 5)))
            size += 1
    return (ops,)
