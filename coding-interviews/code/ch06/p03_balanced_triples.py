"""6.3 Balanced Triples: all distinct triples of readings that sum to 0."""

from itertools import combinations


def balanced_triples_brute(readings):
    found = {
        tuple(sorted(c)) for c in combinations(readings, 3) if sum(c) == 0
    }
    return sorted(list(t) for t in found)


def balanced_triples(readings):
    nums = sorted(readings)
    result = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue  # same first value: same triples again
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total < 0:
                left += 1
            elif total > 0:
                right -= 1
            else:
                result.append([nums[i], nums[left], nums[right]])
                left += 1
                while left < right and nums[left] == nums[left - 1]:
                    left += 1
                right -= 1
    return result


SOLUTIONS = [balanced_triples, balanced_triples_brute]
EXAMPLES = [
    (([-3, 1, 2, -1, 0, 1],), [[-3, 1, 2], [-1, 0, 1]]),
    (([0, 0, 0, 0],), [[0, 0, 0]]),
    (([1, 2],), []),
]


def NORMALIZE(r):
    return sorted(r)


def CHECK(args, result):
    return sorted(result) == balanced_triples_brute(*args)


def random_case(rng):
    return ([rng.randint(-4, 4) for _ in range(rng.randint(0, 9))],)
