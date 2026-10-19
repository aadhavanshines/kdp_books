"""20.5 Pack and Unpack: turn a list of strings (which may contain any
characters) into one string and back, losslessly."""


def pack(strings):
    return "".join(f"{len(s)}:{s}" for s in strings)  # length prefixes


def unpack(packed):
    out, i = [], 0
    while i < len(packed):
        colon = packed.index(":", i)
        length = int(packed[i:colon])
        start = colon + 1
        out.append(packed[start : start + length])
        i = start + length
    return out


def round_trip(strings):
    return unpack(pack(strings))


def identity(strings):
    return list(strings)


SOLUTIONS = [round_trip, identity]
EXAMPLES = [
    ((["hello", "", "a:b", "12:"],), ["hello", "", "a:b", "12:"]),
    (([],), []),
]


def random_case(rng):
    return (
        [
            "".join(rng.choice("a:1# ") for _ in range(rng.randint(0, 5)))
            for _ in range(rng.randint(0, 5))
        ],
    )


def test():
    assert pack(["ab", ""]) == "2:ab0:"
