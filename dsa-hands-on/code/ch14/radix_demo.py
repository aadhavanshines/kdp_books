"""Radix sort in base 10, one digit at a time."""

from linear_sorts import counting_sort_by

numbers = [170, 45, 75, 90, 802, 24, 2, 66]
place = 1
while place <= max(numbers):
    numbers = counting_sort_by(numbers, lambda x: x // place % 10, 9)
    print(f"by the {place}s digit: {numbers}")
    place *= 10
