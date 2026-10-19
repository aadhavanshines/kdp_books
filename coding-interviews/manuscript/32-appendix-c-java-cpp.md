# Appendix C: From Python to Java and C++

Most companies let you choose your interview language, and Python is the most popular choice. But some roles expect Java or C++, especially in systems, embedded and aerospace work, where candidates commonly report C++ being expected. The ideas in this book don't depend on the language; the tools do. This appendix maps each Python tool to its Java and C++ equivalents, and shows two solutions translated into both.

## Containers

| Python | Java | C++ |
| --- | --- | --- |
| `list` | `ArrayList<T>` | `std::vector<T>` |
| `dict` | `HashMap<K, V>` | `std::unordered_map<K, V>` |
| `set` | `HashSet<T>` | `std::unordered_set<T>` |
| Sorted dict / set (no built-in) | `TreeMap<K, V>`, `TreeSet<T>` | `std::map<K, V>`, `std::set<T>` |
| `collections.deque` | `ArrayDeque<T>` | `std::deque<T>` |
| Stack (a `list`) | `ArrayDeque<T>` with `push` / `pop` | `std::stack<T>` or `std::vector<T>` |
| `heapq` (min-heap) | `PriorityQueue<T>` (min-heap) | `std::priority_queue<T>` (**max**-heap by default) |
| `collections.Counter` | `HashMap<K, Integer>` with `merge(k, 1, Integer::sum)` | `std::unordered_map<K, int>` with `++m[k]` |
| `defaultdict(list)` | `computeIfAbsent(k, x -> new ArrayList<>())` | `m[k].push_back(v)` (creates the entry) |
| Tuple `(a, b)` | a small `record` class, or `int[]` | `std::pair<A, B>` or `std::tuple` |

## Everyday Operations

| Python | Java | C++ |
| --- | --- | --- |
| `len(x)` | `x.size()`, `arr.length`, `s.length()` | `x.size()` |
| `x in d` | `d.containsKey(x)`, `s.contains(x)` | `d.count(x)` or `d.find(x) != d.end()` |
| `sorted(x)` / `x.sort()` | `Collections.sort(x)`, `Arrays.sort(a)` | `std::sort(x.begin(), x.end())` |
| Sort with a key | `x.sort(Comparator.comparingInt(...))` | `std::sort(..., [](auto& a, auto& b) {...})` |
| `bisect_left(a, x)` | `Collections.binarySearch` (returns a negative value if absent) | `std::lower_bound(a.begin(), a.end(), x)` |
| `bisect_right(a, x)` | write it yourself | `std::upper_bound(...)` |
| `float("inf")` | `Integer.MAX_VALUE`, `Long.MAX_VALUE` | `INT_MAX`, `LLONG_MAX`, `std::numeric_limits` |
| `a // b` | `Math.floorDiv(a, b)` | careful: `/` truncates toward zero |
| `a % b` (never negative for positive b) | `Math.floorMod(a, b)` | `((a % b) + b) % b` |
| `s[::-1]` | `new StringBuilder(s).reverse().toString()` | `std::string(s.rbegin(), s.rend())` |
| `"".join(parts)` | `String.join("", parts)` or `StringBuilder` | `std::string` with `+=`, or `std::ostringstream` |
| `@cache` | a `HashMap` as memo | a `std::unordered_map` or array as memo |

## Pitfalls When Switching From Python

- **Integer overflow.** Python integers never overflow; `int` in Java and C++ holds values up to about 2.1 billion. Sums of many values, products and prefix sums often need `long` (Java) or `long long` (C++).
- **Integer division and remainder with negatives.** In Java and C++, `-7 / 2` is `-3` and `-7 % 2` is `-1`; in Python they're `-4` and `1`. This matters in the "divisible runs" problem (8.6), where remainders must be normalized.
- **C++ heaps are max-heaps.** `std::priority_queue<int>` returns the largest item. Use `std::greater<int>` for a min-heap, or negate values, as in Python's max-heap trick.
- **Comparing objects in Java.** `==` compares references for `Integer` objects and strings. It seems to work for small integers, from -128 to 127, because Java reuses those objects, and then fails for larger values. Use `.equals`.
- **Recursion depth.** Java and C++ allow deeper recursion than Python's default limit of about 1,000, but very deep recursion can still overflow the stack. Iterative versions remain safer for large inputs.
- **Modifying a collection while iterating** over it throws `ConcurrentModificationException` in Java and invalidates iterators in C++. Python raises an error for dictionaries and sets, but not for lists, so habits from Python may not protect you.

## Two Solutions, Translated

The Budget Pair (Problem 5.1) and Kth Largest Score (Problem 13.1) solutions in Java:

```java
@include code/appendix_c/BudgetPair.java
```

And in C++:

```cpp
@include code/appendix_c/budget_pair.cpp
```

Both programs print the same results as the Python versions:

```
@include code/appendix_c/expected.txt
```

The book's test suite compiles both programs, runs them and compares their output with these expected results, alongside the Python tests.

> **Tip:** If you will interview in Java or C++, re-solve one problem from each pattern chapter in that language. The ideas transfer immediately; fluency with the standard library takes practice.
