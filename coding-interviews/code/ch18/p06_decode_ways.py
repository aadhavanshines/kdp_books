"""18.6 Decode Ways: letters were sent as numbers (A=1 ... Z=26) with the
spaces removed. In how many ways can the digit string be read?"""


def decode_ways(digits):
    prev2, prev1 = 0, 1  # ways for the prefixes two and one shorter
    for i, d in enumerate(digits):
        cur = 0
        if d != "0":
            cur += prev1  # read d as a single letter
        if i > 0 and "10" <= digits[i - 1 : i + 1] <= "26":
            cur += prev2  # read the last two digits as one letter
        prev2, prev1 = prev1, cur
    return prev1 if digits else 0


def decode_ways_brute(digits):
    def count(rest):
        if not rest:
            return 1
        total = 0
        if rest[0] != "0":
            total += count(rest[1:])
            if len(rest) >= 2 and 10 <= int(rest[:2]) <= 26:
                total += count(rest[2:])
        return total

    return count(digits) if digits else 0


SOLUTIONS = [decode_ways, decode_ways_brute]
EXAMPLES = [
    (("12",), 2),
    (("226",), 3),
    (("06",), 0),
    (("10",), 1),
    (("",), 0),
]


def random_case(rng):
    return (
        "".join(rng.choice("0122367") for _ in range(rng.randint(0, 9))),
    )
