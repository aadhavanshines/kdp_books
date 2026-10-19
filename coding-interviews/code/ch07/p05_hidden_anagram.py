"""7.5 Hidden Anagram: does text contain a rearrangement of word as a
consecutive block?"""

from collections import Counter


def hidden_anagram_brute(word, text):
    k = len(word)
    target = sorted(word)
    return any(
        sorted(text[i : i + k]) == target for i in range(len(text) - k + 1)
    )


def hidden_anagram(word, text):
    k = len(word)
    if k > len(text):
        return False
    need = Counter(word)
    window = Counter(text[:k])
    if window == need:
        return True
    for i in range(k, len(text)):
        window[text[i]] += 1
        window[text[i - k]] -= 1
        if window[text[i - k]] == 0:
            del window[text[i - k]]
        if window == need:
            return True
    return False


SOLUTIONS = [hidden_anagram, hidden_anagram_brute]
EXAMPLES = [
    (("tea", "slate"), True),
    (("tea", "tablet"), False),
    (("", "abc"), True),
    (("abcd", "abc"), False),
]


def random_case(rng):
    w = "".join(rng.choice("abc") for _ in range(rng.randint(0, 3)))
    t = "".join(rng.choice("abc") for _ in range(rng.randint(0, 8)))
    return (w, t)
