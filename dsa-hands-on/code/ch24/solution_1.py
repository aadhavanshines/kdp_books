"""Exercise 24.1: two sum on a stream. Numbers arrive one at a time;
after each, say whether any two seen so far add up to the target.
A set of the numbers seen answers each step in O(1)."""


def stream_two_sum(numbers, target):
    seen, found = set(), False
    for x in numbers:
        found = found or (target - x) in seen  # once true, stays true
        seen.add(x)
        yield x, found


for x, found in stream_two_sum([3, 8, 1, 6, 5], 11):
    print(f"after {x}: {'yes' if found else 'no'}")
