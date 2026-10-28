"""Exercise 27.3: the k most frequent words, ties broken alphabetically:
Counter, then a heap of size k (heapq.nsmallest with a key)."""

import heapq
from collections import Counter

text = "to be or not to be that is the question to be"
counts = Counter(text.split())
top = heapq.nsmallest(3, counts, key=lambda w: (-counts[w], w))
print([(w, counts[w]) for w in top])
