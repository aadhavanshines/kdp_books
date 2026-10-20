"""9.3 Postfix Calculator: evaluate tokens like ["3", "4", "+", "2", "*"].

Division truncates toward zero."""


def postfix(tokens):
    stack = []
    for tok in tokens:
        if tok in ("+", "-", "*", "/"):
            b = stack.pop()  # the right operand is on top
            a = stack.pop()
            if tok == "+":
                stack.append(a + b)
            elif tok == "-":
                stack.append(a - b)
            elif tok == "*":
                stack.append(a * b)
            else:
                q = abs(a) // abs(b)  # exact integer division
                stack.append(q if (a < 0) == (b < 0) else -q)  # toward zero
        else:
            stack.append(int(tok))
    return stack[0]


def postfix_recursive(tokens):
    """Read the expression from the end: an operator's operands come
    just before it."""
    tokens = list(tokens)

    def take():
        tok = tokens.pop()
        if tok not in ("+", "-", "*", "/"):
            return int(tok)
        b = take()
        a = take()
        if tok == "+":
            return a + b
        if tok == "-":
            return a - b
        if tok == "*":
            return a * b
        return int(a / b)

    return take()


SOLUTIONS = [postfix, postfix_recursive]
EXAMPLES = [
    ((["3", "4", "+", "2", "*"],), 14),
    ((["7", "-2", "/"],), -3),
    ((["5"],), 5),
    ((["2", "3", "4", "*", "-"],), -10),
]


def random_case(rng):
    def build(depth):
        if depth == 0 or rng.random() < 0.3:
            return [str(rng.randint(-9, 9))]
        op = rng.choice("+-*/")
        right = build(depth - 1)
        if op == "/":
            right = [str(rng.choice([-3, -2, -1, 1, 2, 3]))]
        return build(depth - 1) + right + [op]

    return (build(3),)


def test():
    big = 10**20 + 1
    assert postfix([str(big), "3", "/"]) == big // 3
    assert postfix([str(-big), "3", "/"]) == -(big // 3)
