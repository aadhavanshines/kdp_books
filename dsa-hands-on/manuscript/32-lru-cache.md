# Part VII: Putting It Together

# Chapter 32: Project: An LRU Cache

A **cache** keeps copies of recently used results close at hand, so they don't have to be fetched or computed again: web pages in a browser, database rows in an application server, function results in a Python program. A cache can't keep everything, so when it's full and something new arrives, it has to **evict** something. The most popular rule is **least recently used** (LRU): throw away the entry that has gone the longest without being used, on the bet that the recent past predicts the near future.

"Design an LRU cache with O(1) get and put" is also one of the best-known interview questions, because no single structure from this book can do it alone. A hash map finds entries in O(1) but has no idea of order. A linked list keeps order and moves nodes in O(1), but finding a node takes O(n). Together, they do everything in O(1). This chapter builds the combination, tests it against a model, uses it as a decorator, sizes it, and times it against the standard library.

## The Design

- A **dict** maps each key to its node in the list.
- A **doubly linked list** (Chapter 7) holds the entries in order of use: most recent at the front, least recent at the back.
- **get(key)**: look up the node in the dict. If it's there, unlink it and push it to the front: it was just used.
- **put(key, value)**: if the key is there, update the value and move the node to the front. If not, and the cache is full, unlink the node at the back and delete its key from the dict; then add the new node at the front.

The list has to be *doubly* linked: unlinking a node from the middle needs its predecessor, and only a backward link finds it in O(1). And each node stores its key, not just its value, so that when the back node is evicted, the cache knows which key to delete from the dict.

## The Code

```python
@include code/ch32/lru_cache.py
```

A **sentinel** node, which holds no entry, links the two ends of the list into a circle: its `next` is the front and its `prev` is the back. With the sentinel, the list is never truly empty, so `_unlink` and `_push_front` need no special cases for the first or last node. `__slots__` on the node class saves memory, since a full cache has one node per entry. The `hits` and `misses` counters cost almost nothing and are the first thing you'll want to know about a real cache.

## Watching It Work

```python
@include code/ch32/lru_demo.py
```

```
@include code/ch32/lru_demo.out
```

Reading `a` moves it to the front, so when `d` arrives in a full cache, `b`, now the least recently used, is evicted, and the later `get b` misses. Then `get c` saves `c`, and `put e` evicts `a`.

## Testing Against a Model

```python
@include code/ch32/test_lru_cache.py
```

```
@include code/ch32/test_lru_cache.out
```

The main test runs 5,000 random operations at each of four capacities, including capacity 1, where every new key evicts the previous one, and compares every result and the full order of keys with a **model**: a simple, obviously correct implementation built on `OrderedDict`. Checking the order after every operation catches a broken link immediately, at the operation that caused it, instead of many operations later.

## A Memoizing Decorator

Chapter 5 sped up Fibonacci with `functools.cache`, which never forgets anything. A long-running program can't remember every result forever, so the standard library also has `functools.lru_cache(maxsize=...)`, a decorator with an LRU cache inside. Here's the same thing built on our class:

```python
@include code/ch32/memoize.py
```

```
@include code/ch32/memoize.out
```

The arguments tuple is the key. Both decorators compute `fib(80)` with exactly 81 misses, one for each of `fib(0)` to `fib(80)`, and 78 hits. The standard version is written in C, using the same design: a dictionary plus a doubly linked list.

## How Big Should the Cache Be?

```python
@include code/ch32/hit_rate.py
```

```
@include code/ch32/hit_rate.out
```

Real traffic is uneven: a few popular items get most of the requests. This simulation draws 200,000 requests from 10,000 pages, with page k requested in proportion to 1 / k, a pattern known as **Zipf's law** that fits many real request logs roughly. Holding just 1% of the pages (100) answers about 39% of requests; 10% of the pages answers about two thirds. Each tenfold increase in size buys less than the last. Measuring the hit rate on a realistic workload is how cache sizes are chosen in practice.

## Timing

```python
@include code/ch32/bench_lru.py
```

```
@include code/ch32/bench_lru.out
```

Our cache handles 100,000 mixed requests in about 46 milliseconds, under half a microsecond each. An LRU cache built on `OrderedDict`, whose `move_to_end` and `popitem(last=False)` do the linked-list work in C, is about 1.7 times faster. A plain dict that never evicts anything is about nine times faster than ours, the price of keeping order in pure Python. In an interview, build it yourself; in production, use `functools.lru_cache` or `OrderedDict` (Exercise 1).

> **Real-World Use:** Redis, the in-memory database used as a cache by many large websites, can evict keys by LRU when it runs out of memory, but it deliberately doesn't use the exact design from this chapter. A linked list over millions of keys would cost memory for two pointers per key and work on every read. Instead, Redis keeps a last-access time with each key and, when it must evict, samples a few random keys (five by default, set by `maxmemory-samples`) and evicts the least recently used of the sample. It's an approximation of LRU that's nearly as good in practice, and much cheaper.

> **Interview Tip:** Explain the design before writing code: "a dict for O(1) lookup, a doubly linked list for O(1) reordering and eviction, and each node stores its key so eviction can clean up the dict." Mention the sentinel, which removes edge cases. If time is short, ask whether `OrderedDict` is allowed; it turns the problem into ten lines.

## Key Takeaways

- An LRU cache combines a hash map (find in O(1)) with a doubly linked list (reorder and evict in O(1)).
- Nodes store their keys, so evicting from the list can delete from the map.
- A sentinel node removes the special cases at the ends of the list.
- Test a data structure against a simple model, after every operation, on random sequences.
- Choose a cache size by measuring the hit rate on a realistic workload; returns diminish quickly.
- In production, use `functools.lru_cache` or `OrderedDict`; both are the same design, written in C.

## Exercises

1. **The short version.** Write an LRU cache with `OrderedDict`, using `move_to_end` and `popitem(last=False)`.
2. **Entries that expire.** Add a time-to-live: `get` treats an entry older than `ttl` seconds as missing. Make the clock a parameter so that tests can move time forward.
