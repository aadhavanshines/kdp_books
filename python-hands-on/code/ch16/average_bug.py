def average(numbers):
    total = 0
    for i in range(1, len(numbers)):        # bug: starts at 1, skipping the first number
        total += numbers[i]
    return total / len(numbers)


print(average([10, 20, 30]))               # we expect 20.0
