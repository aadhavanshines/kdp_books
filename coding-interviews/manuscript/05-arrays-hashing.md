# Part II: The Patterns

# Chapter 5: Arrays and Hashing

More interview problems are solved with a hash map than with any other tool. The idea is simple: instead of searching through a list again and again, remember what you have seen in a dictionary or set, and look it up in O(1). It turns many O(n²) brute-force solutions into O(n) ones.

## When to Use It

Signals in the problem statement:

- "Find a pair (or element) that matches..." or "has this value been seen before?"
- "Count how many times..." or "group items that share a property".
- "Are these two things equivalent?" (same letters, same pattern, same counts).
- The brute force compares every item with every other item.

The recipe:

1. Decide what to remember about the items you have already processed, and what key will let you look it up.
2. Walk through the input once; for each item, look up what you need, then record the item.
3. Choose the right container: a **set** to remember "seen", a **dict** to remember "where" or "how many", a `Counter` for counts, a `defaultdict(list)` for groups.

The order of steps 2's "look up" and "record" matters, as the first problem shows.

## 5.1 Budget Pair (Easy)

A gift shop lists the prices of its items in a list. A customer has an exact budget and wants two *different* items whose prices add up to exactly that amount. Return the positions of the two items, smaller position first, or an empty list if no pair exists. If several pairs work, any one is acceptable.

```
@include code/ch05/p01_budget_pair.examples.txt
```

**Think first:** For a given price, which other price would complete the pair?

**Brute force.** Try every pair of positions i < j and check whether the prices add up to the budget. That is O(n²) time and O(1) space; with 100,000 prices it means about five billion checks.

**The better idea.** For each price, the partner it needs is fixed: `budget - price`. So walk through the list once, and for each price ask a dictionary whether its partner has already been seen. Store each price with its position *after* checking, so an item can never be paired with itself.

```python
@include code/ch05/p01_budget_pair.py::budget_pair
```

**Complexity:** O(n) time, with one dictionary lookup per price; O(n) extra space for the dictionary.

> **Common Mistake:** Storing the price before checking for its partner. With prices `[5]` and a budget of 10, the item would find itself and return `[0, 0]`.

> **Follow-Up:** If the prices were sorted, could you solve it without extra memory? Yes, with two pointers (Problem 6.2). What if you needed *all* pairs, without duplicates? Then sort and use two pointers, skipping repeated values, as in Problem 6.3.

## 5.2 First Repeat Visitor (Easy)

A building records each visitor's badge ID in the order they enter. Return the first badge ID that appears for the second time, that is, the repeat that happens earliest in the log. Return `None` if no badge appears twice.

```
@include code/ch05/p02_first_repeat.examples.txt
```

**Think first:** As you read the log, what do you need to remember in order to recognize a repeat immediately?

**Brute force.** For each position, check whether the badge appeared anywhere earlier. That costs O(n²) time.

**The better idea.** Keep a set of the badges seen so far. The first badge that is already in the set is the answer.

```python
@include code/ch05/p02_first_repeat.py::first_repeat
```

**Complexity:** O(n) time, O(n) space.

> **Common Mistake:** Returning the badge whose *first* appearance is earliest among those that repeat. In `["A7", "B2", "C9", "B2", "A7"]`, A7 appears first, but B2 is the first to be *seen again*. Clarify this with the interviewer; it changes the answer.

> **Follow-Up:** If badge IDs were integers from 1 to n in a list of length n + 1, could you find a repeat in O(1) extra space without changing the list? (Yes: treat the values as "next" pointers and use the cycle detection idea of Problem 11.2.)

## 5.3 Anagram Shelves (Medium)

A librarian wants to shelve words together if they contain exactly the same letters, such as *listen*, *silent* and *enlist*. Given a list of lowercase words, return the groups. The order of groups and of words within a group doesn't matter.

```
@include code/ch05/p03_anagram_shelves.examples.txt
```

**Think first:** What could serve as a "label" that is identical for all anagrams of a word?

**Brute force.** Compare every pair of words by sorting their letters, and merge matching words into groups. That is O(n² × k log k) for n words of length k.

**The better idea.** Give every word a key that anagrams share, and group by key with a `defaultdict(list)`. The simplest key is the word's letters in sorted order: *listen*, *silent* and *enlist* all become "eilnst".

```python
@include code/ch05/p03_anagram_shelves.py::anagram_shelves
```

An alternative key avoids sorting: count each of the 26 letters, and use the tuple of counts as the key. (A list can't be a dictionary key, but a tuple can.)

```python
@include code/ch05/p03_anagram_shelves.py::anagram_shelves_counts
```

**Complexity:** with sorted keys, O(n × k log k) time; with counts, O(n × k). Both use O(n × k) space for the groups.

> **Follow-Up:** What if the words could contain any Unicode characters? The count-array key no longer works; use the sorted-letters key, or a `Counter` frozen into a sorted tuple of items.

## 5.4 Longest Unbroken Streak (Medium)

A fitness app records the days (as integers) on which a user exercised, in no particular order and possibly with duplicates. What is the length of the longest run of consecutive days? Aim for O(n).

```
@include code/ch05/p04_longest_streak.examples.txt
```

**Think first:** How can you tell, in O(1), that a day is the *first* day of a streak?

**The obvious idea.** Sort the days, remove duplicates, and count runs of consecutive numbers. That is O(n log n), which is often acceptable, so mention it.

```python
@include code/ch05/p04_longest_streak.py::longest_streak_sorting
```

**The better idea.** Put all days in a set. A day starts a streak only if the day before it is *not* in the set. From each start, count forward while the next day is present. Every day is counted forward at most once, because counting only starts at streak beginnings.

```python
@include code/ch05/p04_longest_streak.py::longest_streak
```

**Complexity:** O(n) time, because each day is visited a constant number of times; O(n) space.

> **Common Mistake:** Counting forward from *every* day, not just from streak starts. On a single streak of n days that does n + (n-1) + ... + 1 steps: O(n²).

## 5.5 Product Without Me (Medium)

For each position in a list of numbers, compute the product of all the *other* numbers, without using division. (Division fails when a value is zero, and the interviewer wants to see a different idea.)

```
@include code/ch05/p05_weights_without_one.examples.txt
```

**Think first:** The product of "everything except position i" is the product of everything to its left times everything to its right.

**Brute force.** For each position, multiply all the others: O(n²).

**The better idea.** Make two passes. Going left to right, store in each position the product of everything before it. Then go right to left with a running product of everything after it, and multiply it in.

```python
@include code/ch05/p05_weights_without_one.py::without_one
```

**Complexity:** O(n) time; O(1) extra space besides the output list.

> **Follow-Up:** How would you handle the same question for very large numbers where products overflow (in Java or C++)? You might work with logarithms, or with the product modulo a prime, if the interviewer allows.

## 5.6 Same Pattern (Easy)

Two product codes "follow the same pattern" if the letters of one can be replaced consistently to give the other: every occurrence of a letter maps to the same letter, and no two different letters map to the same letter. *moon* and *feet* follow the same pattern; *tree* and *tool* do not.

```
@include code/ch05/p06_same_pattern.examples.txt
```

**Think first:** What must you remember for each letter you have seen, in each direction?

**Brute force.** For every pair of positions, check that the letters are equal in one code exactly when they are equal in the other: O(n²).

**The better idea.** Keep two dictionaries, one mapping letters of `a` to letters of `b` and one mapping back. `setdefault` records a mapping the first time and returns the existing one afterward; any disagreement means the patterns differ.

```python
@include code/ch05/p06_same_pattern.py::same_pattern
```

**Complexity:** O(n) time; O(k) space for k distinct letters.

> **Common Mistake:** Checking only one direction. With *ab* and *aa*, the forward map a→a, b→a looks consistent; only the backward map reveals that two letters were mapped to the same one.

## Key Takeaways

- A hash map or set turns "search for it again" into an O(1) lookup, typically turning O(n²) into O(n).
- Decide what to remember, and in what order to look up and record.
- Good keys capture what matters: sorted letters or letter counts for anagrams, a value's partner for pairs.
- Sets can also tell you where a run starts, as in the streak problem.
