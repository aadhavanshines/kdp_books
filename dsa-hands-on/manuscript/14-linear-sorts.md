# Chapter 14: Sorting Without Comparing

Every sort so far works by comparing two items at a time. This chapter shows why no comparison sort can beat O(n log n), and then breaks the barrier anyway, for the right kind of data: small integers, or anything that can be keyed by them. Counting sort and radix sort never compare two items. And then the benchmark delivers a lesson about Python.

## The Speed Limit for Comparison Sorts

A list of n distinct items can be in n! ("n factorial", n × (n - 1) × ... × 1) different orders, and a sort must tell them all apart, since each needs different rearranging. Each comparison is a yes-or-no question, so at best it splits the remaining possibilities in half. To narrow n! possibilities down to one takes at least log₂(n!) comparisons, and log₂(n!) grows like n log₂ n:

```python
@include code/ch14/lower_bound.py
```

```
@include code/ch14/lower_bound.out
```

`math.lgamma(n + 1)` is the natural logarithm of n!, computed without making the huge number itself; dividing by `math.log(2)` converts it to log₂. The bound is within about 10% of n log₂ n at these sizes. So merge sort, heapsort and Timsort are, up to a constant factor, as good as comparison sorting can ever be. To go faster, a sort must learn something about the items without comparing them.

## Counting Sort

If the items are integers from 0 to some small `largest`, just count them:

```python
@include code/ch14/linear_sorts.py::counting_sort
```

One pass counts how many times each value appears; a second pass writes each value out that many times. That's O(n + k) time and O(k) extra memory, where k is the range of values. For a million test scores from 0 to 100, it's linear.

The catch is k. Sorting a few numbers between 0 and a billion would allocate a billion counters. Counting sort only makes sense when the range of values is not much bigger than the number of items.

The version above rebuilds the values from their counts, which works for plain numbers. To sort *records* by an integer key, keeping each record and keeping the sort stable, compute where each key's records start and drop each record into place:

```python
@include code/ch14/linear_sorts.py::counting_sort_by
```

After counting, `starts[v]` is the position where the first record with key v belongs: the total count of all smaller keys. Then each record, taken in input order, goes into the next free position for its key. Records with equal keys come out in the order they went in: stable.

## Radix Sort

Radix sort extends counting sort to large integers. Sort the numbers by their last digit, then by the second-to-last digit, and so on, with a stable counting sort each time:

```python
@include code/ch14/radix_demo.py
```

```
@include code/ch14/radix_demo.out
```

After sorting by the ones digit, then the tens digit, the numbers are sorted by their last two digits: stability keeps the ones-digit order among numbers with the same tens digit. After the last digit, they're fully sorted. With d digits, that's d passes of O(n + base) each. The library version uses base 256, one byte at a time, so 32-bit numbers take just four passes:

```python
@include code/ch14/linear_sorts.py::radix_sort
```

> **Interesting Fact:** Radix sorting is older than electronic computers. Mechanical punched-card sorters, descendants of the machines Herman Hollerith built for the 1890 United States census, dropped each card into a pocket according to the digit punched in one column, one column per pass through the machine. To sort a deck by a multi-digit number, operators ran it through once per column, starting with the least significant column: exactly the least-significant-digit radix sort in this chapter.

## Testing

```python
@include code/ch14/test_linear_sorts.py
```

```
@include code/ch14/test_linear_sorts.out
```

The stability test sorts words by length and checks that words of the same length keep their order. Radix sort is tested in bases 2, 10 and 256, on numbers up to a billion.

## The Benchmark's Lesson

In theory, counting sort and radix sort are O(n), and `sorted()` is O(n log n). Here's what happens in Python, with n numbers from 0 to 999:

```python
@include code/ch14/bench_linear.py
```

```
@include code/ch14/bench_linear.out
```

All three double when n doubles: at these sizes, log n changes so slowly that O(n log n) looks linear too. Counting sort, with a range of only 1,000, is about four times faster than `sorted()`: its loops are simple, and `out.extend([value] * count)` does most of the work in C. But radix sort, despite its better Big O, is about three times *slower* than `sorted()`. Each of its passes runs a key function and several Python-level loops over every item, while Timsort runs entirely in C.

This is the theme of the book's benchmarks in its sharpest form: Big O tells you how time grows, but the constant factor, which in Python is often "Python code against C code", can be bigger than log n for any practical n. Measure before you decide.

> **Tip:** In Python, `sorted()` is almost always the fastest way to sort. Counting sort is worth it for large inputs with a small range of integer keys, like ages or scores. For heavy numeric sorting, NumPy's `numpy.sort` runs entirely in compiled code.

## Key Takeaways

- Any comparison sort needs at least log₂(n!) comparisons, about n log₂ n: merge sort and Timsort are optimal up to a constant.
- Counting sort sorts integers in a range of size k in O(n + k) time, without comparing.
- A stable counting sort by key can sort records, and is the building block of radix sort.
- Radix sort sorts d-digit numbers with d stable passes, least significant digit first.
- In Python, constant factors matter: a C-coded O(n log n) sort can beat a Python-coded O(n) one.

## Exercises

1. **Sort by age.** Sort (name, age) records by age, from 0 to 120, with a stable counting sort; people of the same age must keep their order.
2. **Bucket sort.** For n floating-point numbers spread evenly between 0 and 1, put each into one of n buckets by its value, sort each bucket and join them. Why is this O(n) on average?
