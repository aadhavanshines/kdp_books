"""Exercise 30.2: can text be split into dictionary words?
ok[i] means text[:i] can be split."""


def word_break(text, words):
    words = set(words)
    ok = [True] + [False] * len(text)
    for i in range(1, len(text) + 1):
        ok[i] = any(ok[j] and text[j:i] in words for j in range(i))
    return ok[-1]


words = ["apple", "pen", "pine", "pineapple"]
print(word_break("pineapplepenapple", words), word_break("pinepen", words))
print(word_break("applepie", words))
