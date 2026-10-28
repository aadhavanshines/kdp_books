"""Are the brackets balanced? A stack remembers what must close next."""

PAIRS = {")": "(", "]": "[", "}": "{"}


def balanced(text):
    stack = []
    for ch in text:
        if ch in "([{":
            stack.append(ch)
        elif ch in PAIRS:
            if not stack or stack.pop() != PAIRS[ch]:
                return False  # a closer with no matching opener
    return not stack  # anything left open is unbalanced


for text in ["(a[b]{c})", "([)]", "((", "f(x) = [1, {2: 3}]", ""]:
    print(f"{text!r:>22}: {balanced(text)}")
