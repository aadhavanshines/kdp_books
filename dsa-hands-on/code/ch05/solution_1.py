"""Exercise 5.1: fast power. Halving n at each step means about
2 log2(n) multiplications instead of n - 1."""

multiplications = 0


def power(x, n):
    global multiplications
    if n == 0:
        return 1
    if n % 2 == 0:
        half = power(x, n // 2)
        multiplications += 1
        return half * half
    multiplications += 1
    return x * power(x, n - 1)


for n in [10, 1_000, 1_000_000]:
    multiplications = 0
    assert power(3, n) == 3**n
    print(f"n = {n:>9,}: {multiplications} multiplications")
