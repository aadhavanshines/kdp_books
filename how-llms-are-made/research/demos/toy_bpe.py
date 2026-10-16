"""A toy byte-pair-encoding (BPE) tokenizer, trained on one sentence.

Shows how BPE learns tokens: start from single characters and repeatedly
merge the most frequent adjacent pair. Used for Chapter 3.
"""
from collections import Counter

text = "low lower lowest slow slower newest widest"
words = [list(w) + ["_"] for w in text.split()]   # "_" marks a word's end

print("Start:", " ".join("".join(w) for w in words))
for step in range(1, 9):
    pairs = Counter()
    for w in words:
        for a, b in zip(w, w[1:]):
            pairs[(a, b)] += 1
    (a, b), count = pairs.most_common(1)[0]
    merged = a + b
    for w in words:
        i = 0
        while i < len(w) - 1:
            if w[i] == a and w[i + 1] == b:
                w[i:i + 2] = [merged]
            else:
                i += 1
    print(f"Merge {step}: '{a}' + '{b}' -> '{merged}' (seen {count} times)")
print("Result:", " | ".join(" ".join(w) for w in words))
