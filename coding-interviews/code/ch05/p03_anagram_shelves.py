"""5.3 Anagram Shelves: group words made of exactly the same letters."""

from collections import defaultdict


def anagram_shelves(words):
    shelves = defaultdict(list)
    for word in words:
        key = "".join(sorted(word))
        shelves[key].append(word)
    return list(shelves.values())


def anagram_shelves_counts(words):
    shelves = defaultdict(list)
    for word in words:
        counts = [0] * 26
        for ch in word:
            counts[ord(ch) - ord("a")] += 1
        shelves[tuple(counts)].append(word)
    return list(shelves.values())


SOLUTIONS = [anagram_shelves, anagram_shelves_counts]
EXAMPLES = [
    (
        (["listen", "enlist", "google", "silent", "elgoog", "cat"],),
        [
            ["listen", "enlist", "silent"],
            ["google", "elgoog"],
            ["cat"],
        ],
    ),
    (([],), []),
    ((["", ""],), [["", ""]]),
]


def NORMALIZE(groups):
    return sorted(sorted(g) for g in groups)


def CHECK(args, result):
    (words,) = args
    expected = anagram_shelves(words)
    return NORMALIZE(result) == NORMALIZE(expected)


def random_case(rng):
    words = [
        "".join(rng.choice("abc") for _ in range(rng.randint(0, 3)))
        for _ in range(rng.randint(0, 8))
    ]
    return (words,)
