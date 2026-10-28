# Chapter 9: Hash Tables

The dictionary is Python's most important data structure. Every module's global variables live in one, so do most objects' attributes, and so do the keyword arguments of every call. It finds a key among millions in about a tenth of a microsecond. This chapter builds the structure behind it, a **hash table**, in both of its classic forms, measures how full a table can get before it slows down, and stages the attack that made Python change how it hashes strings.

## The Idea

A hash table keeps its entries in an array of **buckets** (or slots). To store a key, compute `hash(key)`, a number, and reduce it to a bucket number with `% len(buckets)`. To find the key later, do the same arithmetic and look in that bucket. No searching through the other keys.

Two different keys can land in the same bucket: that's a **collision**, and it's unavoidable, because there are more possible keys than buckets. A hash table is defined by how it handles collisions. The two classic answers are **separate chaining**, where each bucket holds a small list of all the keys that landed there, and **open addressing**, where a key that finds its slot taken tries other slots in the same table.

## Separate Chaining

```python
@include code/ch09/chained_map.py
```

Each bucket is a list of `[key, value]` pairs. A lookup computes the bucket, then compares the key with each pair there using `==`. With a good hash function, keys spread evenly, so a bucket holds about `n / buckets` pairs on average. That number is the **load factor**. Keep it below a constant, here 0.75, and each bucket holds less than one pair on average, so every operation is O(1) on average.

To keep the load factor down, `__setitem__` doubles the number of buckets when it's exceeded, and `_rehash` moves every pair into the bucket its hash chooses in the bigger table. Each pair moves to a new bucket, because `hash % size` changes when the size does. As with the dynamic array, doubling makes this O(1) amortized.

The class defines the special methods `__getitem__`, `__setitem__`, `__delitem__`, `__contains__`, `__len__` and `__iter__`, so it works with Python's normal syntax: `m[key]`, `m[key] = value`, `del m[key]`, `key in m`, `len(m)` and `for key in m`. Here's a look inside:

```python
@include code/ch09/map_demo.py
```

```
@include code/ch09/map_demo.out
```

10 and 14 both land in bucket 2 and share its list; 7 has bucket 3 to itself. (Small integers hash to themselves, which makes them easy to follow. Strings hash to large, scrambled numbers.)

> **Real-World Use:** Java's `HashMap` uses separate chaining with the same 0.75 load factor as `ChainedMap`, plus a defense: when one bucket collects 8 or more entries, it turns that bucket's list into a balanced search tree (Chapter 17), so even a flood of colliding keys costs O(log n) per lookup rather than O(n).

## Open Addressing

Open addressing stores every pair directly in one table. A key starts at slot `hash(key) % size`; if another key is there, it tries the next slot, then the next, wrapping around at the end: **linear probing**. A search follows the same path until it finds the key or an empty slot.

```python
@include code/ch09/open_map.py
```

Deleting needs care. If you simply emptied a deleted key's slot, a search for a key stored *after* it on the same probe path would stop at the gap and wrongly report "not found". So a deleted pair leaves a **tombstone**: a marker that says "keep looking past me". `_find` remembers the first tombstone it passes, so a new key can reuse that slot. Exercise 3 shows what goes wrong without tombstones.

The table rehashes when two thirds of its slots are used, counting tombstones, so there's always plenty of empty space to end searches quickly. Rehashing also clears out the tombstones.

## Testing Both

```python
@include code/ch09/test_maps.py
```

```
@include code/ch09/test_maps.out
```

The collision test uses keys 0, 8, 16, 24 and 32, which all start at slot 0 of an 8-slot table, then deletes one from the middle of the probe chain. The random test runs 20,000 operations on a small key range against a `dict`, so the same keys are inserted, deleted and re-inserted over and over: exactly the situation where tombstone bugs hide.

## How Full Is Too Full?

For linear probing, there's a classic formula for the average number of slots a successful search examines: about (1 + 1/(1 - a)) / 2, where a is the load factor. As the table fills, 1 - a shrinks toward zero and the searches get longer, slowly at first, then fast. Let's measure it against the formula with 100,000 slots:

```python
@include code/ch09/probe_lengths.py
```

```
@include code/ch09/probe_lengths.out
```

The measurements match the formula almost exactly. Half full, a search looks at 1.5 slots on average. Two thirds full, about 2. At 90%, over 5, and climbing steeply toward the end. That's why real hash tables resize long before they're full, trading memory for speed.

> **Real-World Use:** CPython's dict uses open addressing, not chaining, and resizes when two thirds full, exactly like `OpenMap`. Two refinements make it faster than linear probing. Its probe sequence mixes in more bits of the hash (a "perturbation") so keys with similar hashes don't follow the same path. And since Python 3.6 it's **compact**: the table holds small indexes into a separate array of entries kept in insertion order, which is why dictionaries remember the order of their keys and use less memory.

## Timing Lookups

```python
@include code/ch09/bench_maps.py
```

```
@include code/ch09/bench_maps.out
```

All three are flat from a thousand to a million keys: O(1), as promised. Python's `dict` takes about 110 nanoseconds per lookup, our maps two or three times that. A lookup in our maps runs several lines of Python; `dict`'s runs in C.

## When Hashing Goes Wrong

Everything above assumes the hash function spreads keys out. What if it doesn't? This benchmark fills a dictionary with keys whose `__hash__` returns 42 for every key:

```python
@include code/ch09/hash_flood.py
```

```
@include code/ch09/hash_flood.out
```

With good hashes, filling the dictionary takes linear time. When every key has the same hash, every insertion probes past all the keys already there, comparing with each: O(n) per insertion, O(n²) to fill. The ratio column quadruples, and 4,000 keys take hundreds of times longer.

This isn't just a curiosity. If a web server puts request parameters into a dictionary, and an attacker can choose parameter names that collide, a single request full of crafted names can keep a processor busy for a long time. This attack, called **hash flooding**, was demonstrated at the Chaos Communication Congress in December 2011 against PHP, Python, Java, Ruby and other platforms at once.

> **Real-World Use:** Python's defense is **hash randomization**: since Python 3.3, `hash()` of a `str` or `bytes` mixes in a random value chosen when the interpreter starts, so attackers can't predict which strings will collide. That's why `hash("apple")` gives a different number every time you start Python, and why this chapter's demos use integer keys, whose hashes don't change. Setting the environment variable `PYTHONHASHSEED` fixes the seed when you need repeatable runs.

## Making Your Own Classes Hashable

To use your own objects as dictionary keys, define `__eq__` and `__hash__` consistently: objects that are equal must have equal hashes. The easy, correct way is to hash a tuple of the same fields that `__eq__` compares, which Exercise 1 does. Python's `dataclass` can generate both for you with `@dataclass(frozen=True)`.

> **Common Mistake:** Defining `__eq__` without `__hash__`. Python then sets `__hash__` to `None`, making the objects unhashable, which is a safe default. Worse is a `__hash__` that uses fields `__eq__` ignores, or fields that change after the object is stored: the dictionary then looks in the wrong bucket and can't find a key that's right there.

## Key Takeaways

- A hash table turns each key into a bucket number with `hash(key) % size`, so it can find keys without searching.
- Collisions are handled by chaining (a list per bucket) or by open addressing (probe other slots in one table).
- Keep the load factor low by resizing (doubling) when it passes a threshold: 0.75 for `ChainedMap` and Java, two thirds for `OpenMap` and CPython.
- Open addressing needs tombstones for deletion; searches must skip past them.
- Average search length for linear probing grows like 1/(1 - load): fine at half full, bad near full. The measurements match the theory.
- Bad hashes make every operation O(n); Python randomizes string hashes to stop attackers from causing that deliberately.

## Exercises

1. **A hashable Point.** Write a `Point` class with `x` and `y` that can be a dictionary key: two `Point` objects with the same coordinates must find the same entry.
2. **Word counts.** Count the words in a paragraph using your `ChainedMap`, then print the three most common.
3. **Why tombstones?** Subclass `OpenMap` so that deleting empties the slot instead of leaving a tombstone, and show a lookup that wrongly fails.
