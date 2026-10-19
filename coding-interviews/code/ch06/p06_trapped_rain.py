"""6.6 Trapped Rain: how much rain stays on a skyline of blocks?"""


def trapped_rain_brute(heights):
    water = 0
    for i in range(len(heights)):
        left_max = max(heights[: i + 1])
        right_max = max(heights[i:])
        water += min(left_max, right_max) - heights[i]
    return water


def trapped_rain(heights):
    left, right = 0, len(heights) - 1
    left_max = right_max = 0
    water = 0
    while left < right:
        if heights[left] < heights[right]:
            # The right side has a wall at least this tall, so the
            # water here is limited only by left_max.
            left_max = max(left_max, heights[left])
            water += left_max - heights[left]
            left += 1
        else:
            right_max = max(right_max, heights[right])
            water += right_max - heights[right]
            right -= 1
    return water


SOLUTIONS = [trapped_rain, trapped_rain_brute]
EXAMPLES = [
    (([3, 0, 2, 0, 4],), 7),
    (([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],), 6),
    (([],), 0),
    (([5, 4, 3],), 0),
]


def random_case(rng):
    return ([rng.randint(0, 6) for _ in range(rng.randint(0, 12))],)
