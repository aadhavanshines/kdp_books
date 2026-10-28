"""Exercise 18.2: search with wildcards, where "." matches any one
letter: at a ".", try every child."""

from trie import Trie


def matches(node, pattern):
    if not pattern:
        return node.is_word
    ch, rest = pattern[0], pattern[1:]
    if ch == ".":
        return any(matches(child, rest) for child in node.children.values())
    child = node.children.get(ch)
    return child is not None and matches(child, rest)


t = Trie(["bad", "dad", "mad", "made"])
for p in ["pad", "bad", ".ad", "b..", "ma.e", "...."]:
    print(p, matches(t.root, p))
