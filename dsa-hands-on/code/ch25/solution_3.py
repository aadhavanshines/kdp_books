"""Exercise 25.3: is `small` a subsequence of `big` (its letters appear
in order, not necessarily side by side)? One pointer in each string."""


def is_subsequence(small, big):
    i = 0
    for ch in big:
        if i < len(small) and small[i] == ch:
            i += 1
    return i == len(small)


print(is_subsequence("ace", "abcde"), is_subsequence("aec", "abcde"))
