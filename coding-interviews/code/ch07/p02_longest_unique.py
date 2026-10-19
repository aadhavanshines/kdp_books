"""7.2 Longest Unique Run: longest stretch of a string with no repeats."""


def longest_unique_brute(s):
    best = 0
    for i in range(len(s)):
        for j in range(i, len(s)):
            part = s[i : j + 1]
            if len(set(part)) == len(part):
                best = max(best, len(part))
    return best


def longest_unique(s):
    last_seen = {}  # character -> last index where it appeared
    start = 0
    best = 0
    for i, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= start:
            start = last_seen[ch] + 1  # jump past the earlier copy
        last_seen[ch] = i
        best = max(best, i - start + 1)
    return best


SOLUTIONS = [longest_unique, longest_unique_brute]
EXAMPLES = [
    (("abcabcbb",), 3),
    (("bbbb",), 1),
    (("",), 0),
    (("dvdf",), 3),
    (("abba",), 2),
]


def random_case(rng):
    return ("".join(rng.choice("abcd") for _ in range(rng.randint(0, 12))),)
