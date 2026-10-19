"""21.4 Power of Two: is n a power of two? Also: reverse the bits of a
32-bit unsigned number."""


def is_power_of_two(n):
    return n > 0 and n & (n - 1) == 0  # exactly one bit set


def is_power_of_two_loop(n):
    if n <= 0:
        return False
    while n % 2 == 0:
        n //= 2
    return n == 1


def reverse_bits(x):
    result = 0
    for _ in range(32):
        result = (result << 1) | (x & 1)  # move x's lowest bit across
        x >>= 1
    return result


SOLUTIONS = [is_power_of_two, is_power_of_two_loop]
EXAMPLES = [
    ((1,), True),
    ((16,), True),
    ((18,), False),
    ((0,), False),
    ((-8,), False),
]


def random_case(rng):
    return (rng.choice([rng.randint(-5, 300), 1 << rng.randint(0, 40)]),)


def test():
    assert reverse_bits(0b1011) == 0b1101 << 28
    for x in (0, 1, 123456789, 2**32 - 1):
        assert reverse_bits(x) == int(f"{x:032b}"[::-1], 2)
