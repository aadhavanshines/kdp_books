"""Autocomplete: suggest words as the user types."""

from trie import Trie

words = """apple apply apricot banana band bandana bank banner
           can candle candy cane cannon canvas""".split()
t = Trie(words)
for typed in ["ap", "ban", "can", "cand", "cat"]:
    print(f"{typed!r:>7}: {t.complete(typed, limit=3)}")
