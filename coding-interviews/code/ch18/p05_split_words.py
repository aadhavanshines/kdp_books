"""18.5 Split Into Words: can text be split into words from the dictionary
(words may be reused)?"""

from functools import cache


def split_words(text, words):
    words = set(words)
    longest = max(map(len, words), default=0)
    ok = [True] + [False] * len(text)  # ok[i]: text[:i] can be split
    for i in range(1, len(text) + 1):
        for j in range(max(0, i - longest), i):
            if ok[j] and text[j:i] in words:
                ok[i] = True
                break
    return ok[len(text)]


def split_words_memo(text, words):
    @cache
    def can(i):
        if i == len(text):
            return True
        return any(
            text.startswith(w, i) and can(i + len(w)) for w in words if w
        )

    return can(0)


SOLUTIONS = [split_words, split_words_memo]
EXAMPLES = [
    (("applepenapple", ["apple", "pen"]), True),
    (("catsandog", ["cats", "dog", "sand", "and", "cat"]), False),
    (("", ["a"]), True),
]


def random_case(rng):
    words = list(
        {
            "".join(rng.choice("ab") for _ in range(rng.randint(1, 3)))
            for _ in range(rng.randint(1, 4))
        }
    )
    text = "".join(rng.choice("ab") for _ in range(rng.randint(0, 9)))
    return (text, words)
