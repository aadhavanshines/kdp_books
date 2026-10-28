"""Exercise 31.1: every string of n pairs of balanced brackets. Add "("
while some are left; add ")" only while it closes an open one."""


def brackets(n):
    out = []

    def go(text, opened, closed):
        if len(text) == 2 * n:
            out.append(text)
            return
        if opened < n:
            go(text + "(", opened + 1, closed)
        if closed < opened:
            go(text + ")", opened, closed + 1)

    go("", 0, 0)
    return out


print(brackets(3))
print([len(brackets(n)) for n in range(1, 9)])
