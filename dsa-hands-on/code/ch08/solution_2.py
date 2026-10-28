"""Exercise 8.2: evaluate an expression in reverse Polish notation,
where each operator follows its two numbers: "3 4 + 2 *" is (3+4)*2."""

import operator

OPS = {
    "+": operator.add,
    "-": operator.sub,
    "*": operator.mul,
    "/": operator.truediv,
}


def rpn(expression):
    stack = []
    for token in expression.split():
        if token in OPS:
            right, left = stack.pop(), stack.pop()  # the order matters
            stack.append(OPS[token](left, right))
        else:
            stack.append(float(token))
    if len(stack) != 1:
        raise ValueError("not a complete expression")
    return stack[0]


for e in ["3 4 + 2 *", "5 1 2 + 4 * + 3 -", "10 4 /"]:
    print(f"{e} = {rpn(e):g}")
