# Chapter 22: Designing Data Structures

"Design a cache", "design a hit counter": these problems ask you to build a small class whose methods meet stated time limits, usually O(1) or O(log n) per operation. They test whether you can **combine** basic structures, a hash map plus a linked list, a hash map plus a list, so that each covers the other's weakness. They are also popular because they look like real engineering work: an API, state, and trade-offs.

## How to Approach a Design Problem

1. **List the operations and their required costs.** Write them down: `get` O(1), `put` O(1), evict the least recently used key.
2. **For each operation, name a structure that does it fast.** Lookup by key: a hash map. Order of use: a list. Random access by position: an array.
3. **Connect the structures** so that they stay consistent. Usually the hash map points into the other structure.
4. **Walk through every operation**, including the edge cases: an empty structure, a full one, a repeated key.

The examples in this chapter replay a *session*: a list of operations applied to a fresh object, with the results of the queries collected in a list. That's the format most interview platforms use, and it's how the tests drive each class.

## 22.1 Recently Used Cache (Medium)

Design a cache with a fixed capacity. `get(key)` returns the value, or -1 if the key is absent. `put(key, value)` stores a value; if the cache is full, it first evicts the **least recently used** key. Both operations count as a "use", and both must take O(1) time.

```
@include code/ch22/p01_lru_cache.examples.txt
```

**Think first:** A hash map gives O(1) lookup, but how do you find the least recently used key in O(1), and move a key to "most recent" in O(1)?

**The idea.** Keep the keys in a **doubly linked list** ordered from oldest to newest, and a **hash map** from each key to its list node. Using a key unlinks its node and appends it at the newest end, both O(1) given the node. Evicting removes the node at the oldest end. Two *sentinel* nodes, `head` and `tail`, which never hold data, mean the list is never empty, so there are no special cases for the first or last node.

```python
@include code/ch22/p01_lru_cache.py::Node,LRUCache
```

**Complexity:** O(1) per operation; O(capacity) space.

In Python, `OrderedDict` already combines a hash map with a linked list, so the whole class shrinks to a few lines:

```python
@include code/ch22/p01_lru_cache.py::LRUCacheOrdered
```

> **Interviewer's View:** Most interviewers accept the `OrderedDict` version only after you've shown you could build it yourself. A good approach: say "in production I'd use `OrderedDict`", then ask whether they want the version with an explicit linked list.

> **Common Mistake:** Forgetting to delete the evicted key from the hash map, or to update the value when `put` is called with an existing key. The random tests against `OrderedDict` catch both.

## 22.2 Hit Counter (Medium)

Record hits with a timestamp in seconds; timestamps never decrease. `count(t)` returns the number of hits in the last 300 seconds, that is, with a timestamp in the range (t - 300, t].

```
@include code/ch22/p02_hit_counter.examples.txt
```

**The idea.** Keep hits in a queue, oldest first. A query first discards hits that are too old; since time never goes backwards, they can never count again. Grouping hits in the same second into one `(timestamp, count)` entry keeps the queue short under heavy traffic.

```python
@include code/ch22/p02_hit_counter.py::HitCounter
```

**Complexity:** amortized O(1) for `hit`; `count` is O(entries in the window), at most 300 thanks to the grouping. Keeping a running total, adjusted as entries enter and leave, makes `count` amortized O(1) too.

> **Follow-Up:** "Hits arrive at millions per second from many servers." Discuss a fixed array of 300 buckets indexed by `t % 300`, which uses constant memory, and then sharding the counter across machines and summing the shards. That turns a coding question into a small system design discussion (Chapter 25).

## 22.3 Versioned Store (Medium)

Design a key-value store that keeps history. `set(key, value, time)` records a value at a time, and `get(key, time)` returns the value as of that time: the value set at the latest time less than or equal to it, or "" if there was none. Times for each key are given in increasing order.

```
@include code/ch22/p03_versioned_store.examples.txt
```

**The idea.** For each key, append the times and values to two lists. Because times arrive in increasing order, the lists stay sorted for free, and `get` is a binary search for the last time that is not after the query time.

```python
@include code/ch22/p03_versioned_store.py::VersionedStore
```

**Complexity:** O(1) amortized for `set`, O(log n) for `get`.

## 22.4 Random Pick Set (Medium)

Design a set with `add(x)` and `remove(x)`, each returning whether the set changed, and `pick()`, which returns a member chosen uniformly at random. All must take O(1) on average.

```
@include code/ch22/p04_random_set.examples.txt
```

**Think first:** A Python `set` adds and removes in O(1), but can't pick a random member in O(1). A list can pick randomly, but removing from the middle is O(n). How do you get both?

**The idea.** Store the members in a list for random picking, plus a hash map from each member to its index. To remove a member in O(1), move the *last* item into its slot, update that item's index, and pop the end of the list. The order of the list doesn't matter, so the swap is harmless.

```python
@include code/ch22/p04_random_set.py::RandomSet
```

**Complexity:** O(1) average per operation.

> **Tip:** How do you test randomness? This book's test picks 30,000 times from three members with a fixed random seed and checks that each count is between 9,000 and 11,000. Mentioning a statistical check like this answers the inevitable "how would you test it?"

## 22.5 Least-Frequently Used Cache (Hard)

A variation of 22.1: when the cache is full, evict the key used the **fewest times**; among keys tied for the fewest uses, evict the least recently used. Every operation must still be O(1).

```
@include code/ch22/p05_lfu_cache.examples.txt
```

**The idea.** Group keys into buckets by their use count, and keep each bucket in least-recently-used order: a dictionary from count to an `OrderedDict` of keys. Using a key moves it from bucket u to bucket u + 1. Track `min_uses`, the smallest non-empty bucket: a new key always resets it to 1, and touching a key raises it only when the key's old bucket becomes empty and was the minimum.

```python
@include code/ch22/p05_lfu_cache.py::LFUCache
```

**Complexity:** O(1) per operation.

> **Interviewer's View:** This is a hard problem mainly because there are many states to keep consistent. Talk through a sequence of operations on the whiteboard before writing code; then the code is a transcription. A simple "brute force" class that scans for the victim, as in this book's tests, is a good first step if time is short.

## 22.6 Flatten Iterator (Medium)

Write an iterator that yields the integers of an arbitrarily nested list in order, lazily: one at a time, without building the flattened list first.

```
@include code/ch22/p06_flatten_iterator.examples.txt
```

**The simple idea.** A recursive generator with `yield from` is three lines:

```python
@include code/ch22/p06_flatten_iterator.py::flatten_gen
```

**The robust idea.** Recursion fails on lists nested more deeply than Python's recursion limit, about 1,000 levels. An explicit stack of iterators, one for each list currently open, removes that limit: take the next item from the top iterator; open a new list by pushing its iterator; pop iterators that are finished.

```python
@include code/ch22/p06_flatten_iterator.py::Flattener
```

**Complexity:** O(1) amortized per item; O(depth) space.

> **Follow-Up:** "Add `has_next()`." Python iterators don't have one, but Java's do. Implement it by fetching the next item in advance and keeping it until `next()` is called.

## Key Takeaways

- Design problems combine structures: a hash map for lookup, plus a list, linked list or heap for order.
- The hash map usually stores *where* an item is in the other structure, so both can be updated in O(1).
- Sentinel nodes remove the special cases at the ends of a linked list.
- Swap-with-last makes removal from an unordered list O(1).
- Test design problems with long random sessions against a simple, slow reference class.
