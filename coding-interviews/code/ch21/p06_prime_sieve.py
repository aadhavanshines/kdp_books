"""21.6 Primes Below n: all prime numbers less than n."""


def primes_below(n):
    if n < 3:
        return []
    is_prime = [True] * n
    is_prime[0] = is_prime[1] = False
    p = 2
    while p * p < n:
        if is_prime[p]:
            # Smaller multiples were already crossed out by smaller primes.
            for m in range(p * p, n, p):
                is_prime[m] = False
        p += 1
    return [i for i in range(n) if is_prime[i]]


def primes_below_trial(n):
    return [
        k
        for k in range(2, n)
        if all(k % d for d in range(2, int(k**0.5) + 1))
    ]


SOLUTIONS = [primes_below, primes_below_trial]
EXAMPLES = [((10,), [2, 3, 5, 7]), ((2,), []), ((3,), [2])]


def random_case(rng):
    return (rng.randint(0, 500),)
