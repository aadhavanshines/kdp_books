"""6.1 Palindrome Plate: does a label read the same both ways?

Only letters and digits count, and case is ignored."""


def is_palindrome_simple(text):
    kept = [ch.lower() for ch in text if ch.isalnum()]
    return kept == kept[::-1]


def is_palindrome(text):
    left, right = 0, len(text) - 1
    while left < right:
        if not text[left].isalnum():
            left += 1
        elif not text[right].isalnum():
            right -= 1
        elif text[left].lower() != text[right].lower():
            return False
        else:
            left += 1
            right -= 1
    return True


SOLUTIONS = [is_palindrome, is_palindrome_simple]
EXAMPLES = [
    (("Step on no pets!",), True),
    (("Race-car 7",), False),
    (("",), True),
    ((" ,. ",), True),
    (("A1b1a",), True),
]


def random_case(rng):
    s = "".join(rng.choice("aAbB1 ,-") for _ in range(rng.randint(0, 8)))
    if rng.random() < 0.5:
        s = s + s[::-1]
    return (s,)
