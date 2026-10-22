"""Chapter 12: base-62 encoding for short, URL-safe identifiers."""

import string

ALPHABET = string.digits + string.ascii_lowercase + string.ascii_uppercase


def encode(n):
    if n == 0:
        return ALPHABET[0]
    out = []
    while n:
        n, r = divmod(n, 62)
        out.append(ALPHABET[r])
    return "".join(reversed(out))


def decode(s):
    n = 0
    for ch in s:
        n = n * 62 + ALPHABET.index(ch)
    return n


def round_trip(n):
    return decode(encode(n))


def identity(n):
    return n


SOLUTIONS = [round_trip, identity]
EXAMPLES = [
    ((0,), 0),
    ((61,), 61),
    ((3_521_614_606_207,), 3_521_614_606_207),
]


def random_case(rng):
    return (rng.randint(0, 10**15),)


def test():
    assert encode(61) == "Z" and encode(62) == "10"
    assert len(encode(62**7 - 1)) == 7 and len(encode(62**7)) == 8
