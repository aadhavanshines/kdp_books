"""A trie (prefix tree) for words. Each node maps a letter to a child;
a path from the root spells a prefix, and a flag marks whole words."""


class TrieNode:
    __slots__ = ("children", "is_word")

    def __init__(self):
        self.children = {}
        self.is_word = False


class Trie:
    def __init__(self, words=()):
        self.root = TrieNode()
        self._n = 0
        for w in words:
            self.insert(w)

    def __len__(self):
        return self._n

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        if not node.is_word:
            node.is_word = True
            self._n += 1

    def _walk(self, prefix):
        """The node reached by spelling prefix, or None."""
        node = self.root
        for ch in prefix:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def __contains__(self, word):
        node = self._walk(word)
        return node is not None and node.is_word

    def has_prefix(self, prefix):
        return self._walk(prefix) is not None

    def complete(self, prefix, limit=None):
        """Words starting with prefix, in alphabetical order."""
        start = self._walk(prefix)
        out = []
        stack = [(start, prefix)] if start else []
        while stack and (limit is None or len(out) < limit):
            node, word = stack.pop()
            if node.is_word:
                out.append(word)
            for ch in sorted(node.children, reverse=True):
                stack.append((node.children[ch], word + ch))
        return out
