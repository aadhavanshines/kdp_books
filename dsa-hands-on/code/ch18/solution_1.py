"""Exercise 18.1: the longest prefix shared by every word: walk down
the trie while there is exactly one child and no word ends."""

from trie import Trie


def longest_common_prefix(words):
    node, prefix = Trie(words).root, ""
    while len(node.children) == 1 and not node.is_word:
        ch, node = next(iter(node.children.items()))
        prefix += ch
    return prefix


print(longest_common_prefix(["flower", "flow", "flight"]))
print(longest_common_prefix(["interview", "internet", "interval"]))
print(repr(longest_common_prefix(["dog", "car"])))
