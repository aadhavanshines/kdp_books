"""21.5 Fast Power: base ** exp % mod in O(log exp) multiplications."""


def fast_power(base, exp, mod):
    result = 1
    base %= mod
    while exp:
        if exp & 1:  # this bit of the exponent is set
            result = result * base % mod
        base = base * base % mod  # base, base^2, base^4, ...
        exp >>= 1
    return result % mod


def fast_power_builtin(base, exp, mod):
    return pow(base, exp, mod)


SOLUTIONS = [fast_power, fast_power_builtin]
EXAMPLES = [((2, 10, 1000), 24), ((3, 0, 7), 1), ((5, 3, 1), 0)]


def random_case(rng):
    return (
        rng.randint(0, 10**6),
        rng.randint(0, 10**12),
        rng.randint(1, 10**9),
    )
