"""7.6 Smallest Cover: the shortest block of text that contains every
character of needed (with repeats). Return "" if there is none. If there
are several shortest blocks, return the leftmost."""

from collections import Counter


def smallest_cover_brute(text, needed):
    if not needed:
        return ""
    need = Counter(needed)
    best = ""
    for i in range(len(text)):
        for j in range(i, len(text)):
            part = text[i : j + 1]
            if not need - Counter(part):
                if best == "" or len(part) < len(best):
                    best = part
                break
    return best


def smallest_cover(text, needed):
    if not needed:
        return ""
    need = Counter(needed)
    missing = len(needed)  # characters still missing from the window
    left = 0
    best_start, best_len = 0, len(text) + 1
    for right, ch in enumerate(text):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        while missing == 0:  # window covers everything: try to shrink
            if right - left + 1 < best_len:
                best_start, best_len = left, right - left + 1
            need[text[left]] += 1
            if need[text[left]] > 0:
                missing += 1
            left += 1
    if best_len > len(text):
        return ""
    return text[best_start : best_start + best_len]


SOLUTIONS = [smallest_cover, smallest_cover_brute]
EXAMPLES = [
    (("PLANETARY", "TAN"), "ANET"),
    (("a", "aa"), ""),
    (("aa", "aa"), "aa"),
    (("xyz", ""), ""),
]


def random_case(rng):
    t = "".join(rng.choice("abc") for _ in range(rng.randint(0, 10)))
    n = "".join(rng.choice("abc") for _ in range(rng.randint(0, 3)))
    return (t, n)
