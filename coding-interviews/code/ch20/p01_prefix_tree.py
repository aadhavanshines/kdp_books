"""20.1 Prefix Tree: store words; check whole words and prefixes quickly."""


class Trie:
    def __init__(self):
        self.root = {}  # each node is a dict: letter -> child node

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True  # marks the end of a whole word

    def _walk(self, text):
        node = self.root
        for ch in text:
            if ch not in node:
                return None
            node = node[ch]
        return node

    def contains(self, word):
        node = self._walk(word)
        return node is not None and "$" in node

    def has_prefix(self, prefix):
        node = self._walk(prefix)
        return bool(node)  # an empty node means no word goes this way


def trie_session(ops):
    t, out = Trie(), []
    for op, arg in ops:
        if op == "add":
            t.insert(arg)
        elif op == "word":
            out.append(t.contains(arg))
        else:
            out.append(t.has_prefix(arg))
    return out


def set_session(ops):
    words, out = set(), []
    for op, arg in ops:
        if op == "add":
            words.add(arg)
        elif op == "word":
            out.append(arg in words)
        else:
            out.append(any(w.startswith(arg) for w in words))
    return out


SOLUTIONS = [trie_session, set_session]
EXAMPLES = [
    (
        (
            [
                ("add", "apple"),
                ("word", "apple"),
                ("word", "app"),
                ("prefix", "app"),
                ("add", "app"),
                ("word", "app"),
            ],
        ),
        [True, False, True, True],
    ),
]


def random_case(rng):
    def w():
        return "".join(rng.choice("ab") for _ in range(rng.randint(0, 4)))

    return (
        [
            (rng.choice(["add", "word", "prefix"]), w())
            for _ in range(rng.randint(1, 12))
        ],
    )
