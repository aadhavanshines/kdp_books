# Chapter 21: Bit Manipulation and Math

A few interview problems hinge on a small mathematical fact or a bit trick: XOR cancels pairs, `n & (n - 1)` clears the lowest set bit, a sum formula finds what's missing. These problems are short, and the insight is the whole answer, so the best preparation is to know the handful of facts that keep coming up.

## The Essential Bit Operations

| Expression | Meaning | Example (in binary) |
| --- | --- | --- |
| `a & b` | AND: bits set in both | `1100 & 1010 = 1000` |
| `a \| b` | OR: bits set in either | `1100 \| 1010 = 1110` |
| `a ^ b` | XOR: bits set in exactly one | `1100 ^ 1010 = 0110` |
| `x << k` | shift left: multiply by 2ᵏ | `0011 << 2 = 1100` |
| `x >> k` | shift right: divide by 2ᵏ, rounding down | `1100 >> 2 = 0011` |
| `x & 1` | the lowest bit: 1 if x is odd | `0101 & 1 = 1` |
| `x & (x - 1)` | x with its lowest set bit cleared | `1100 → 1000` |
| `x & -x` | only the lowest set bit of x | `1100 → 0100` |

Three facts about XOR solve a surprising number of problems: `x ^ x == 0`, `x ^ 0 == x`, and the order of XORs doesn't matter.

> **Warning:** Python integers have unlimited size, and negative numbers behave as if they had infinitely many leading 1 bits. Problems written for 32-bit integers in other languages sometimes need a mask, `x & 0xFFFFFFFF`, to get the same results in Python. Mention it if the problem talks about 32-bit values.

## 21.1 The Lonely Number (Easy)

In a list, every value appears exactly twice except one, which appears once. Find it in O(n) time and O(1) extra space.

```
@include code/ch21/p01_lonely_number.examples.txt
```

**Brute force.** Count with a `Counter`: O(n) time, but O(n) space.

**The idea.** XOR all the values together. Each pair cancels to zero, whatever order the values come in, and the lonely value is all that remains.

```python
@include code/ch21/p01_lonely_number.py::lonely
```

**Complexity:** O(n) time, O(1) space.

> **Follow-Up:** "Now two values appear once." XOR everything to get `a ^ b`. Its lowest set bit is a bit where a and b differ; split all the values into two groups by that bit, and XOR each group separately.

## 21.2 Count the Ones (Easy)

For every number from 0 to n, how many 1 bits does its binary form contain?

```
@include code/ch21/p02_count_ones.examples.txt
```

**The idea.** Shifting i right by one bit gives i // 2, which has the same bits as i except the last one. So the count for i is the count for i // 2, already computed, plus i's last bit. That's dynamic programming on the bits.

```python
@include code/ch21/p02_count_ones.py::count_ones
```

**Complexity:** O(n) time.

For a single number, Brian Kernighan's trick counts the 1 bits by clearing the lowest one until nothing is left, taking one step per 1 bit:

```python
@include code/ch21/p02_count_ones.py::count_ones_kernighan
```

> **Tip:** In everyday Python, `bin(i).count("1")` or, since Python 3.10, `i.bit_count()` is the practical answer. Mention it, then show the technique if asked.

## 21.3 The Missing Ticket (Easy)

Tickets numbered 0 to n were issued, and n of them came back: one is missing. Which one?

```
@include code/ch21/p03_missing_ticket.examples.txt
```

**The idea.** The numbers 0 to n add up to n(n + 1)/2. Subtract the sum of the returned tickets, and the difference is the missing number.

```python
@include code/ch21/p03_missing_ticket.py::missing_ticket
```

**Complexity:** O(n) time, O(1) space.

An XOR version avoids any concern about large sums in languages with fixed-size integers: XOR every index and every ticket together, and all numbers except the missing one cancel in pairs.

```python
@include code/ch21/p03_missing_ticket.py::missing_ticket_xor
```

## 21.4 Power of Two (Easy)

Is n a power of two? And, as a related warm-up: reverse the bits of a 32-bit unsigned number.

```
@include code/ch21/p04_power_of_two.examples.txt
```

**The idea.** A power of two has exactly one 1 bit. Clearing the lowest set bit with `n & (n - 1)` leaves zero exactly in that case. Zero and negative numbers must be excluded first.

```python
@include code/ch21/p04_power_of_two.py::is_power_of_two
```

**Complexity:** O(1).

To reverse 32 bits, take the lowest bit of x 32 times, and shift each one into the result from the right:

```python
@include code/ch21/p04_power_of_two.py::reverse_bits
```

## 21.5 Fast Power (Medium)

Compute `base ** exp % mod` for very large exponents, using O(log exp) multiplications.

```
@include code/ch21/p05_fast_power.examples.txt
```

**Think first:** How can you compute x¹⁶ with only four multiplications?

**The idea.** Square repeatedly: x, x², x⁴, x⁸, x¹⁶. Any exponent is a sum of powers of two, its binary digits, so multiply together the squares that correspond to its 1 bits. Taking the remainder after each step keeps the numbers small.

```python
@include code/ch21/p05_fast_power.py::fast_power
```

**Complexity:** O(log exp) multiplications. Python's built-in `pow(base, exp, mod)` does the same, and the tests check that both agree.

> **Common Mistake:** Forgetting the case `mod == 1`, where every answer is 0. With exponent 0, the loop never runs and `result` stays 1, so the final `% mod` is needed.

## 21.6 Primes Below n (Medium)

List all prime numbers less than n.

```
@include code/ch21/p06_prime_sieve.examples.txt
```

**Brute force.** Test each number by trying divisors up to its square root: about O(n√n) in total.

**The idea.** The Sieve of Eratosthenes, more than 2,000 years old, crosses out multiples instead. For each prime p, cross out its multiples from p² upward; smaller multiples, such as 2p, were already crossed out by smaller primes. The numbers left standing are prime.

```python
@include code/ch21/p06_prime_sieve.py::primes_below
```

**Complexity:** O(n log log n) time, which is nearly linear, and O(n) space.

## Key Takeaways

- XOR cancels pairs: use it to find the odd one out.
- `n & (n - 1)` clears the lowest set bit: it counts bits and tests for powers of two.
- Sum formulas and XOR find a single missing number in O(1) space.
- Repeated squaring computes large powers in O(log n) steps.
- The sieve lists primes far faster than testing each number.
- Remember that Python integers are unbounded; mask when a problem assumes 32 bits.
