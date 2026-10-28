"""Show each call and return, indented by the depth of the stack."""


def factorial(n, depth=0):
    pad = "  " * depth
    print(f"{pad}factorial({n}) called")
    result = 1 if n <= 1 else n * factorial(n - 1, depth + 1)
    print(f"{pad}factorial({n}) returns {result}")
    return result


factorial(4)
