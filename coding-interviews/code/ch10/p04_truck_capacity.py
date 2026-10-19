"""10.4 Truck Capacity: parcels must ship in the given order over `days`
days. What is the smallest truck capacity that makes it possible?"""


def days_needed(parcels, capacity):
    days, load = 1, 0
    for p in parcels:
        if load + p > capacity:
            days += 1
            load = 0
        load += p
    return days


def truck_capacity_brute(parcels, days):
    capacity = max(parcels)
    while days_needed(parcels, capacity) > days:
        capacity += 1
    return capacity


def truck_capacity(parcels, days):
    lo, hi = max(parcels), sum(parcels)  # the answer is in this range
    while lo < hi:
        mid = (lo + hi) // 2
        if days_needed(parcels, mid) <= days:
            hi = mid  # mid works; maybe something smaller does too
        else:
            lo = mid + 1
    return lo


SOLUTIONS = [truck_capacity, truck_capacity_brute]
EXAMPLES = [
    (([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5), 15),
    (([3, 2, 2, 4, 1, 4], 3), 6),
    (([7], 1), 7),
]


def random_case(rng):
    parcels = [rng.randint(1, 9) for _ in range(rng.randint(1, 10))]
    return (parcels, rng.randint(1, len(parcels)))
