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
    (([4, 8, 2, 6, 5, 3, 7, 1], 3), 13),
    (([5, 5, 5, 5], 2), 10),
    (([7], 1), 7),
]


def random_case(rng):
    parcels = [rng.randint(1, 9) for _ in range(rng.randint(1, 10))]
    return (parcels, rng.randint(1, len(parcels)))
