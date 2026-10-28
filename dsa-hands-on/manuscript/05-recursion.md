# Chapter 5: Recursion and the Call Stack

Many structures in this book are defined in terms of smaller copies of themselves. A tree is a node with smaller trees below it. A list is a first item followed by a shorter list. Algorithms on such structures are most naturally written as functions that call themselves on the smaller copies: **recursion**. This chapter explains how recursion works in Python, what it costs, where it breaks, and the two techniques that fix its problems: memoization and explicit stacks.

## A Function That Calls Itself

Every recursive function has two parts: a **base case**, small enough to answer directly, and a **recursive case**, which reduces the problem to a smaller one of the same kind.

```python
@include code/ch05/factorial.py
```

```
@include code/ch05/factorial.out
```

`factorial(5)` is `5 * factorial(4)`, which is `4 * factorial(3)`, and so on down to `factorial(1)`, which is just 1. `total` sums a list as its first item plus the total of the rest. Each call works on a smaller problem, so eventually one reaches the base case, and the answers flow back up.

> **Common Mistake:** Forgetting the base case, or writing one the recursion never reaches (for example, testing `n == 0` when n can skip past it). The function then calls itself until Python stops it with a `RecursionError`.

`total` has a hidden cost: `items[1:]` copies the rest of the list on every call, so summing n items copies about n²/2 items in all. Recursion can make the code beautiful and the algorithm slow at the same time. Chapter 12's merge sort is careful about exactly this.

## The Call Stack

How does Python keep track of all the unfinished calls? Each call gets a **frame**, holding its local variables and where to continue when the call it made returns. Frames are kept on the **call stack**: a new call pushes a frame on top, and a return pops it off. This listing prints each call and return, indented by how deep the stack is:

```python
@include code/ch05/call_stack.py
```

```
@include code/ch05/call_stack.out
```

The calls go down four levels; then the returns come back up in reverse order: last called, first finished. That's exactly the behavior of the stack data structure you'll build in Chapter 8, and it's no coincidence. Any recursive function can be rewritten with an explicit stack, as you'll see at the end of this chapter.

## The Recursion Limit

Each frame takes memory, and the stack isn't unlimited. Python stops runaway recursion at a fixed depth:

```python
@include code/ch05/recursion_limit.py
```

```
@include code/ch05/recursion_limit.out
```

The default limit is 1,000 frames, counting the frames Python itself is using. Recursion 900 levels deep is fine; 100,000 levels raises `RecursionError`. You can raise the limit with `sys.setrecursionlimit`, and a few listings in this book do, but only for algorithms whose depth is known and moderate. Raising it far is risky: very deep recursion uses a lot of memory, and recursion that passes through C code (a `sorted` key function that recurses, say) can still exhaust the system's stack and crash the interpreter instead of raising a clean error.

> **Tip:** In Python, use recursion when the depth grows like log n, as in balanced trees, merge sort and binary search: a billion items need only about 30 levels. When the depth can grow like n, as in walking a linked list or exploring a long path in a graph, use a loop.

## Fibonacci and the Explosion of Calls

The Fibonacci numbers start 0, 1, and each one after is the sum of the two before: 0, 1, 1, 2, 3, 5, 8, 13, ... The definition translates directly into recursion, and the result is a famous disaster:

```python
@include code/ch05/fibonacci.py
```

```
@include code/ch05/fibonacci.out
```

To compute `fib(25)`, the naive version makes 242,785 calls. It computes `fib(23)` twice, `fib(22)` three times, `fib(21)` five times, and so on; the repeated work grows exponentially, by a factor of about 1.6 for each step up in n.

The fix is **memoization**: remember each answer the first time it's computed, and look it up after that. The `@cache` decorator from `functools` does exactly that, storing results in a dictionary keyed by the arguments. With it, each `fib(k)` is computed once, so `fib(25)` takes 26 calls. The third version, `fib_loop`, computes upward from the start with two variables: no recursion and no memory beyond two numbers.

Timed:

```python
@include code/ch05/bench_fibonacci.py
```

```
@include code/ch05/bench_fibonacci.out
```

Here n goes up by 2 at each row, not doubling, so read the ratios differently: each step of 2 multiplies the naive version's time by about 2.6, which is 1.6 squared, the growth factor per step. That's exponential growth: every few steps of n multiply the time by ten. The memoized version barely grows at all. Memoization is the seed of dynamic programming, which gets two whole chapters in Part VI.

> **Interesting Fact:** The ratio between consecutive Fibonacci numbers approaches the golden ratio, about 1.618, and so does the ratio of the naive function's call counts. The table's ratio of about 2.6 for each step of 2 is 1.618², about 2.618.

## Recursion on Nested Data

Recursion shines on data that is nested to an unknown depth, like lists inside lists:

```python
@include code/ch05/flatten.py
```

```
@include code/ch05/flatten.out
```

`flatten` handles each item: a list is flattened recursively, anything else is kept. It reads exactly like the definition of the problem.

`flatten_loop` does the same job with an explicit stack of iterators instead of the call stack. The top of the stack is the list being worked through. Meeting a nested list pushes an iterator over it; finishing a list pops it, and the `for` loop's `else` clause, which runs only when the loop wasn't stopped by `break`, does the pop. It's harder to read, but it has no depth limit: it flattens a list nested 5,000 levels deep, which would make the recursive version raise `RecursionError`. When depth can be large, this is the trade: a little clarity for unlimited depth.

## Key Takeaways

- A recursive function needs a base case and a recursive case that makes the problem smaller.
- Each call adds a frame to the call stack; Python's default limit is 1,000 frames.
- Use recursion when the depth is logarithmic; use loops or an explicit stack when it can grow with n.
- Naive recursion can repeat work exponentially; memoization (`functools.cache`) computes each subproblem once.
- Any recursion can be rewritten with an explicit stack.

## Exercises

1. **Power.** Write `power(x, n)` recursively using x^n = (x^(n/2))² for even n, and x × x^(n-1) for odd n. Count the multiplications for n = 1,000 and n = 1,000,000. Why is it O(log n)?
2. **Count the ways.** Write a recursive function counting the ways to make an amount of money from coins of 1, 2 and 5 (order doesn't matter). Use `functools.cache` and check your answer for amounts 0 to 10 by brute force. (Hint: either use the largest coin type at least once, or never use it.)
