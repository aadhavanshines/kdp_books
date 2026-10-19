"""16.5 Word Steps: change start into goal one letter at a time; every
intermediate word must be in the dictionary. How many words are in the
shortest chain, counting start and goal? 0 if impossible."""

from collections import deque
from string import ascii_lowercase


def word_steps(start, goal, words):
    words = set(words)
    if goal not in words:
        return 0
    queue = deque([(start, 1)])
    seen = {start}
    while queue:
        word, length = queue.popleft()
        if word == goal:
            return length
        for i in range(len(word)):
            for ch in ascii_lowercase:
                nxt = word[:i] + ch + word[i + 1 :]
                if nxt in words and nxt not in seen:
                    seen.add(nxt)
                    queue.append((nxt, length + 1))
    return 0


def word_steps_pairs(start, goal, words):
    """Compare every pair of words directly instead of trying letters."""
    nodes = list(dict.fromkeys([start] + list(words)))
    if goal not in words:
        return 0

    def one_apart(a, b):
        return sum(x != y for x, y in zip(a, b)) == 1

    dist = {start: 1}
    queue = deque([start])
    while queue:
        w = queue.popleft()
        if w == goal:
            return dist[w]
        for v in nodes:
            if v not in dist and one_apart(w, v):
                dist[v] = dist[w] + 1
                queue.append(v)
    return 0


SOLUTIONS = [word_steps, word_steps_pairs]
EXAMPLES = [
    (("cat", "dog", ["cot", "cut", "cog", "dot", "dog"]), 4),
    (("cat", "dog", ["cut", "cog", "dot", "dog"]), 0),
    (("aa", "aa", ["aa"]), 1),
]


def random_case(rng):
    def word():
        return "".join(rng.choice("abc") for _ in range(3))

    words = list({word() for _ in range(rng.randint(1, 12))})
    return (word(), rng.choice(words), words)
