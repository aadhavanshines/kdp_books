"""Exercise 26.1: does text contain an anagram of word? A window of
len(word) letters slides along, its letter counts updated as it moves."""

from collections import Counter


def has_anagram(word, text):
    k = len(word)
    target, window = Counter(word), Counter(text[:k])
    if window == target:
        return True
    for right in range(k, len(text)):
        window[text[right]] += 1
        window[text[right - k]] -= 1
        if window[text[right - k]] == 0:
            del window[text[right - k]]  # so == compares fairly
        if window == target:
            return True
    return False


print(has_anagram("ab", "eidbaooo"), has_anagram("ab", "eidboaoo"))
