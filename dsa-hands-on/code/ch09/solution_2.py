"""Exercise 9.2: count words with your own ChainedMap, then list the
three most common."""

from chained_map import ChainedMap

text = """the quick brown fox jumps over the lazy dog the fox
the dog sleeps and the fox runs"""

counts = ChainedMap()
for word in text.split():
    counts[word] = counts[word] + 1 if word in counts else 1
top = sorted(counts, key=lambda w: (-counts[w], w))[:3]
for word in top:
    print(word, counts[word])
