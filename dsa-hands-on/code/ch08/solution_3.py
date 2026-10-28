"""Exercise 8.3: next greater element. For each number, the first
larger number to its right, or -1. A monotonic stack, as for days
until warmer."""


def next_greater(numbers):
    answer = [-1] * len(numbers)
    waiting = []
    for i, x in enumerate(numbers):
        while waiting and numbers[waiting[-1]] < x:
            answer[waiting.pop()] = x
        waiting.append(i)
    return answer


print(next_greater([4, 5, 2, 25, 7, 6, 30]))
print(next_greater([5, 4, 3]))
