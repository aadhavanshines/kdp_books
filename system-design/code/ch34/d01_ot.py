"""Chapter 34: operational transformation (OT) for two editors.

Each user edits a local copy and sends operations. Before applying a
concurrent remote operation, a site transforms it against its own
operation so both sites end with the same text. Operations: insert
(pos, char) and delete (pos). Ties between inserts at the same position
are broken by site ID.
"""

import random


def apply(text, op):
    if op[0] == "ins":
        _, pos, ch, _site = op
        return text[:pos] + ch + text[pos:]
    if op[0] == "del":
        return text[: op[1]] + text[op[1] + 1 :]
    return text  # a no-op


def transform(a, b):
    """Rewrite op `a` so it can be applied after concurrent op `b`."""
    if a[0] == "noop" or b[0] == "noop":
        return a
    if a[0] == "ins" and b[0] == "ins":
        if a[1] < b[1] or (a[1] == b[1] and a[3] < b[3]):
            return a
        return ("ins", a[1] + 1, a[2], a[3])
    if a[0] == "ins" and b[0] == "del":
        return a if a[1] <= b[1] else ("ins", a[1] - 1, a[2], a[3])
    if a[0] == "del" and b[0] == "ins":
        return a if a[1] < b[1] else ("del", a[1] + 1)
    if a[1] == b[1]:  # both deleted the same character
        return ("noop",)
    return a if a[1] < b[1] else ("del", a[1] - 1)


def random_op(rng, text, site):
    if text and rng.random() < 0.4:
        return ("del", rng.randrange(len(text)))
    return ("ins", rng.randint(0, len(text)), rng.choice("xyz"), site)


def converge(text, op1, op2):
    """Site 1 applies op1 then op2'; site 2 applies op2 then op1'."""
    site1 = apply(apply(text, op1), transform(op2, op1))
    site2 = apply(apply(text, op2), transform(op1, op2))
    return site1, site2


def demo():
    text = "cat"
    op1 = ("ins", 1, "h", 1)  # user 1: "chat"
    op2 = ("del", 2)  # user 2 deletes "t": "ca"
    naive = apply(apply(text, op1), op2)
    print("without transforming, site 1 gets:", repr(naive))
    print("with OT, both sites get:          ", converge(text, op1, op2))


def test():
    rng = random.Random(5)
    for _ in range(20_000):
        text = "".join(rng.choice("abc") for _ in range(rng.randint(0, 6)))
        op1, op2 = random_op(rng, text, 1), random_op(rng, text, 2)
        s1, s2 = converge(text, op1, op2)
        assert s1 == s2, (text, op1, op2)
