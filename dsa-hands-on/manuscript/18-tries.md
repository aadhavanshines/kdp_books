# Chapter 18: Tries

Type "can" into a search box and it suggests "candle", "candy", "canvas". To do that, the program must find every stored word that starts with what you've typed, fast, on every keystroke. A hash table can't help: "candle" and "can" have unrelated hashes. A sorted list with binary search can. But there's a structure built exactly for questions about prefixes: the **trie**, or prefix tree.

## The Idea

A trie stores words letter by letter along paths from the root. Each node maps a letter to a child node, so the path from the root to any node spells a prefix. Words that share a prefix share the path for it: "candle", "candy" and "cane" all go through the nodes for c, a, n. A flag on a node marks that a whole word ends there, since "can" is a word but "ca" isn't.

```python
@include code/ch18/trie.py#L1-L46
```

`insert` walks down the word, creating any missing nodes with `dict.setdefault`, and marks the last node as a word end. `_walk` follows a prefix from the root and returns the node it reaches, or `None` if the path breaks off. Both `__contains__` and `has_prefix` are one walk: their cost is the length of the word, **O(L)**, however many words are stored. A million words or ten, looking up "candle" takes six steps.

## Autocomplete

```python
@include code/ch18/trie.py#L47-L58
```

`complete` walks to the prefix's node, then explores everything below it with a stack, collecting the words. Pushing children in reverse alphabetical order means they come off the stack in alphabetical order, so the suggestions come out sorted, and `limit` stops the search after the first few.

```python
@include code/ch18/autocomplete.py
```

```
@include code/ch18/autocomplete.out
```

The cost of `complete` is the length of the prefix plus the size of the part of the trie below it, which is why autocomplete systems cap the number of suggestions.

## Testing

```python
@include code/ch18/test_trie.py
```

```
@include code/ch18/test_trie.out
```

The random test makes 500 words from just three letters, so they share prefixes heavily, then checks 300 random prefixes against a plain scan with `startswith`, including the empty prefix, which must return every word.

## Timing

Does any of n words start with a given prefix? A scan, the trie, and binary search on a sorted list:

```python
@include code/ch18/bench_trie.py
```

```
@include code/ch18/bench_trie.out
```

The scan doubles with n. The trie takes the same time at every size: O(L), here four letters. Binary search on a sorted list is almost as fast, growing only by log n: the first word that sorts at or after the prefix is the only one that might start with it. In Python that makes a sorted list with `bisect` a very good alternative to a trie, with less memory: each trie node is a dictionary.

So when do tries win? When the work really is letter by letter: longest-prefix matching, wildcard search (Exercise 2), or walking many words that share prefixes at once, as a spell checker or a word game does.

> **Real-World Use:** When a router forwards a packet, it must find the most specific route that matches the destination address: the **longest prefix match**. Linux stores its IPv4 routing table in a compressed trie of address bits (`fib_trie`) and has done so since kernel 2.6.39, descending it bit by bit on every lookup.

> **Interesting Fact:** Edward Fredkin named the trie in 1960, from the middle of the word "retrieval", and pronounced it "tree". Many people say "try" instead, to tell the two apart.

## Key Takeaways

- A trie stores strings letter by letter; words with a common prefix share the path for it.
- Insert, look up and prefix checks cost O(L), the length of the string, independent of how many strings are stored.
- Autocomplete is a walk to the prefix's node plus a traversal of the subtree below it.
- Tries use more memory than a sorted list; in Python, `bisect` on a sorted list is a strong alternative for simple prefix lookups.
- Tries shine for letter-by-letter work: longest prefix match, wildcards, word games.

## Exercises

1. **Longest common prefix.** Find the longest prefix shared by all of a list of words, by walking down a trie of them while each node has exactly one child.
2. **Wildcards.** Search a trie with patterns where `.` matches any single letter, such as `".ad"` or `"b.."`.
