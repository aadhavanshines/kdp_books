# Appendix A: Exercise Solutions

Here are worked solutions to the exercises. Each one was run on Python 3.12, 3.13, 3.14 and 3.15, and the output shown is the output it produced. There's usually more than one good answer: if yours gives the same result and you can explain it, it's right.

## Chapter 3: NumPy Essentials

**Exercise 1.**

```python
@include code/ch03/solution_1.py
```

```
@include code/ch03/solution_1.out
```

**Exercise 2.**

```python
@include code/ch03/solution_2.py
```

```
@include code/ch03/solution_2.out
```

The coin-flip simulation gives 0.0584, close to the exact probability of 56/1024, about 0.055. With more runs, it would get closer.

## Chapter 4: Series and DataFrames

**Exercise 1.**

```python
@include code/ch04/solution_1.py
```

```
@include code/ch04/solution_1.out
```

**Exercise 2.**

```python
@include code/ch04/solution_2.py
```

```
@include code/ch04/solution_2.out
```

## Chapter 5: Loading and Saving Data

**Exercise 1.**

```python
@include code/ch05/solution_1.py
```

```
@include code/ch05/solution_1.out
```

**Exercise 2.**

```python
@include code/ch05/solution_2.py
```

```
@include code/ch05/solution_2.out
```

## Chapter 6: Selecting and Filtering

**Exercise 1.**

```python
@include code/ch06/solution_1.py
```

```
@include code/ch06/solution_1.out
```

**Exercise 2.**

```python
@include code/ch06/solution_2.py
```

```
@include code/ch06/solution_2.out
```

## Chapter 7: Cleaning Messy Data

**Exercise 1.**

```python
@include code/ch07/solution_1.py
```

```
@include code/ch07/solution_1.out
```

`errors="coerce"` turns "n/a" and the empty string into missing values, which `mean()` skips.

**Exercise 2.**

```python
@include code/ch07/solution_2.py
```

```
@include code/ch07/solution_2.out
```

## Chapter 8: Transforming Columns

**Exercise 1.**

```python
@include code/ch08/solution_1.py
```

```
@include code/ch08/solution_1.out
```

**Exercise 2.**

```python
@include code/ch08/solution_2.py
```

```
@include code/ch08/solution_2.out
```

## Chapter 9: Grouping and Aggregating

**Exercise 1.**

```python
@include code/ch09/solution_1.py
```

```
@include code/ch09/solution_1.out
```

`idxmax()` on each category's group returns a (category, product) pair; `.str[1]` takes the product name from each pair.

**Exercise 2.**

```python
@include code/ch09/solution_2.py
```

```
@include code/ch09/solution_2.out
```

## Chapter 10: Combining Tables

**Exercise 1.**

```python
@include code/ch10/solution_1.py
```

```
@include code/ch10/solution_1.out
```

Nine customers never ordered.

**Exercise 2.**

```python
@include code/ch10/solution_2.py
```

```
@include code/ch10/solution_2.out
```

## Chapter 11: Reshaping Data

**Exercise 1.**

```python
@include code/ch11/solution_1.py
```

```
@include code/ch11/solution_1.out
```

**Exercise 2.**

```python
@include code/ch11/solution_2.py
```

```
@include code/ch11/solution_2.out
```

## Chapter 12: Dates and Time Series

**Exercise 1.**

```python
@include code/ch12/solution_1.py
```

```
@include code/ch12/solution_1.out
```

The last week is only partly in the data (sessions end on 28 October), so its rate is based on fewer sessions.

**Exercise 2.**

```python
@include code/ch12/solution_2.py
```

```
@include code/ch12/solution_2.out
```

## Chapter 13: Working With Text

**Exercise 1.**

```python
@include code/ch13/solution_1.py
```

```
@include code/ch13/solution_1.out
```

**Exercise 2.**

```python
@include code/ch13/solution_2.py
```

```
@include code/ch13/solution_2.out
```

Named groups `(?P<kind>...)` become the column names.

## Chapter 14: Charts With matplotlib

```python
@include code/ch14/solution_1.py
```

```
@include code/ch14/solution_1.out
```

The chart is saved as `pages.png`; the printed line confirms how many bars it drew.

## Chapter 16: Describing Data With Statistics

**Exercise 1.**

```python
@include code/ch16/solution_1.py
```

```
@include code/ch16/solution_1.out
```

**Exercise 2.**

```python
@include code/ch16/solution_2.py
```

```
@include code/ch16/solution_2.out
```

## Chapter 17: Comparing Groups and A/B Tests

```python
@include code/ch17/solution_1.py
```

```
@include code/ch17/solution_1.out
```

The interval excludes zero, so on mobile alone the data still supports B being better.

## Chapter 18: SQL for Analysts

**Exercise 1.**

```python
@include code/ch18/solution_1.py
```

```
@include code/ch18/solution_1.out
```

**Exercise 2.**

```python
@include code/ch18/solution_2.py
```

```
@include code/ch18/solution_2.out
```

## Chapter 27: Bigger Data and Faster Code

```python
@include code/ch27/solution_1.py
```

```
@include code/ch27/solution_1.out
```

The sessions table shrinks to under 40% of its size.
