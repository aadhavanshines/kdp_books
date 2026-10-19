"""9.4 Next Warmer Day: for each day, how many days until a warmer one
(0 if never)?"""


def next_warmer_brute(temps):
    out = []
    for i, t in enumerate(temps):
        wait = 0
        for j in range(i + 1, len(temps)):
            if temps[j] > t:
                wait = j - i
                break
        out.append(wait)
    return out


def next_warmer(temps):
    out = [0] * len(temps)
    waiting = []  # indices of days still waiting, temps decreasing
    for i, t in enumerate(temps):
        while waiting and temps[waiting[-1]] < t:
            j = waiting.pop()
            out[j] = i - j
        waiting.append(i)
    return out


SOLUTIONS = [next_warmer, next_warmer_brute]
EXAMPLES = [
    (([21, 19, 23, 22, 20, 25],), [2, 1, 3, 2, 1, 0]),
    (([30, 30, 30],), [0, 0, 0]),
    (([],), []),
]


def random_case(rng):
    return ([rng.randint(10, 20) for _ in range(rng.randint(0, 12))],)
