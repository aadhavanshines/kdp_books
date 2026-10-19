"""9.1 Balanced Brackets: are (), [] and {} correctly nested?"""


def balanced_brute(s):
    s = "".join(ch for ch in s if ch in "()[]{}")
    while "()" in s or "[]" in s or "{}" in s:
        s = s.replace("()", "").replace("[]", "").replace("{}", "")
    return s == ""


def balanced(s):
    closers = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in closers:
            if not stack or stack.pop() != closers[ch]:
                return False
    return not stack


SOLUTIONS = [balanced, balanced_brute]
EXAMPLES = [
    (("f(a[i]) {}",), True),
    (("([)]",), False),
    (("((",), False),
    (("",), True),
    ((")(",), False),
]


def random_case(rng):
    return (
        "".join(rng.choice("()[]{}x") for _ in range(rng.randint(0, 8))),
    )
