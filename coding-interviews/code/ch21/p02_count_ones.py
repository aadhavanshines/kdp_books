"""21.2 Count the Ones: for every number 0..n, how many 1 bits does it
have?"""


def count_ones(n):
    ones = [0] * (n + 1)
    for i in range(1, n + 1):
        ones[i] = ones[i >> 1] + (i & 1)  # i/2 has the same bits, shifted
    return ones


def count_ones_kernighan(n):
    out = []
    for i in range(n + 1):
        c = 0
        while i:
            i &= i - 1  # clears the lowest 1 bit
            c += 1
        out.append(c)
    return out


def count_ones_bin(n):
    return [bin(i).count("1") for i in range(n + 1)]


SOLUTIONS = [count_ones, count_ones_kernighan, count_ones_bin]
EXAMPLES = [((5,), [0, 1, 1, 2, 1, 2]), ((0,), [0])]


def random_case(rng):
    return (rng.randint(0, 300),)
