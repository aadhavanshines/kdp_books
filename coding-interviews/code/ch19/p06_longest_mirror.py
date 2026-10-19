"""19.6 Longest Mirror: the longest consecutive block of text that is a
palindrome. If several are equally long, return the leftmost."""


def longest_mirror(text):
    best_start, best_len = 0, 0
    for centre in range(len(text)):
        for left, right in ((centre, centre), (centre, centre + 1)):
            while (
                left >= 0
                and right < len(text)
                and text[left] == text[right]
            ):
                left -= 1
                right += 1
            length = right - left - 1
            start = left + 1
            if length > best_len or (
                length == best_len and start < best_start
            ):
                best_start, best_len = start, length
    return text[best_start : best_start + best_len]


def longest_mirror_brute(text):
    best = ""
    for i in range(len(text)):
        for j in range(i, len(text)):
            part = text[i : j + 1]
            if part == part[::-1] and len(part) > len(best):
                best = part
    return best


SOLUTIONS = [longest_mirror, longest_mirror_brute]
EXAMPLES = [
    (("noonday",), "noon"),
    (("xyz",), "x"),
    (("",), ""),
    (("a",), "a"),
]


def random_case(rng):
    return ("".join(rng.choice("ab") for _ in range(rng.randint(0, 10))),)
