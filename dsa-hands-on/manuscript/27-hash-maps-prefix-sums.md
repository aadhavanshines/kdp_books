# Chapter 27: Hash Maps and Prefix Sums

Chapter 24's two-sum problem went from O(n²) to O(n) with one idea: instead of searching the earlier items again for each new one, **remember** them in a hash map, so "have I seen what I need?" costs O(1). That idea solves a surprising share of interview problems. This chapter collects its most useful forms: grouping by a key, counting, set lookups, and its partner, the **prefix sum**, which turns any question about the sum of a range into one subtraction.

## Grouping and Counting

```python
@include code/ch27/hashing_patterns.py#L7-L18
```

To group anagrams, give every word a **key** that's the same for all words in a group: its letters in sorted order ("eat", "tea" and "ate" all become "aet"). A `defaultdict(list)` collects the words under each key, in one pass. Choosing the key is the whole trick; other problems use a tuple of letter counts, a word's shape, or a normalized form of a record.

To find the first character that appears only once, count first with `Counter` (one pass), then scan again for the first character with a count of 1. Two passes of O(n) beat the O(n²) of counting each character separately.

## Sets for Instant Lookups

```python
@include code/ch27/hashing_patterns.py#L21-L31
```

The longest run of consecutive integers in an unsorted list, such as 1, 2, 3, 4 in `[100, 4, 200, 1, 3, 2]`. Sorting first takes O(n log n). A set does it in O(n): put every number in a set, then only *start* counting at a number whose predecessor is missing, the start of a run. That condition is what keeps it linear. Without it, the loop would count the run 1, 2, 3, 4 from every one of its numbers, O(n²) on one long run; with it, each run is counted once, from its start, and every number is looked at a constant number of times.

## Prefix Sums

```python
@include code/ch27/hashing_patterns.py#L34-L40
```

`prefix[i]` holds the sum of the first i numbers, with `prefix[0] = 0`. Then the sum of any range `nums[i:j]` is `prefix[j] - prefix[i]`: the first j numbers minus the first i. One O(n) pass to build the list, then every range sum in O(1). If you'll ask for many range sums of data that doesn't change, this beats summing each range.

## Prefix Sums Meet Hash Maps

The two ideas combine into one of the most useful interview techniques. How many runs of neighboring numbers add up to k, when the numbers can be negative? Chapter 26's sliding window can't help, because with negatives, growing or shrinking the window doesn't move the sum in a predictable direction.

```python
@include code/ch27/hashing_patterns.py#L43-L52
```

A run ending at the current position sums to k exactly when the running total *before* the run started was `total - k`. So the number of runs ending here is the number of earlier prefix sums equal to `total - k`, which a `Counter` of the prefix sums seen so far answers in O(1). The counter starts with one 0, the empty prefix, for runs that start at the very beginning. It's two sum again, on prefix sums instead of the numbers.

```python
@include code/ch27/hashing_demo.py
```

```
@include code/ch27/hashing_demo.out
```

In `[1, 2, 3, -3, 1, 2]`, six runs add up to 3, including `[3, -3, 1, 2]` and `[1, 2, 3, -3]`, which only exist because of the negative number.

## Prefix Sums in Two Dimensions

```python
@include code/ch27/grid_sums.py
```

```
@include code/ch27/grid_sums.out
```

The same idea works on a grid. `table[r][c]` holds the sum of the whole rectangle above and to the left of cell (r, c). Building it uses **inclusion-exclusion**: the cell, plus the rectangle above, plus the rectangle to the left, minus their overlap, which was added twice. Then the sum of any rectangle takes four lookups, whatever its size.

> **Real-World Use:** This table has two names. Frank Crow introduced it to computer graphics in 1984 as the **summed-area table**, for texture mapping. In 2001, Paul Viola and Michael Jones made it famous in computer vision as the **integral image**: their face detector, fast enough to run in real time, compared the sums of light and dark rectangles at every position and scale of a picture, and the table made each rectangle cost four lookups.

## Testing

```python
@include code/ch27/test_hashing_patterns.py
```

```
@include code/ch27/test_hashing_patterns.out
```

## Timing

```python
@include code/ch27/bench_subarrays.py
```

```
@include code/ch27/bench_subarrays.out
```

The brute force already uses a running total, so it's O(n²) rather than O(n³), and it quadruples with each doubling. Prefix sums with a hash map double: at 4,000 numbers, about 500 times faster.

> **Interview Tip:** When a problem asks "how many" or "does any" about pairs or ranges, ask yourself what you'd need to have remembered from earlier positions to answer it at the current one. If that's a value, a count or a position, a dictionary keyed by it usually gives an O(n) solution.

## Key Takeaways

- A hash map turns "have I seen this before?" into an O(1) question, so many O(n²) pair searches become one pass.
- To group items, compute a key that's equal for every item in a group.
- `Counter` and `defaultdict` cover most counting and grouping in a line or two.
- Prefix sums give the sum of any range in O(1) after an O(n) pass; in two dimensions, any rectangle in four lookups.
- Prefix sums in a hash map count ranges with a given sum, even with negative numbers.

## Exercises

1. **A nearby duplicate.** Does a list contain two equal values at most k positions apart?
2. **Product of all the others.** For each position, return the product of all the *other* numbers, without using division (which fails when a number is 0). (Hint: the products of everything before each position, and of everything after it.)
3. **Top k words.** Find the k most frequent words in a text, breaking ties alphabetically.
