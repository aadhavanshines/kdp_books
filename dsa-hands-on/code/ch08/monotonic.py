"""A monotonic stack: for each day, how many days until it is warmer?

The stack holds the days still waiting for a warmer one, coldest on
top. Each new day pops every waiting day it is warmer than. Every day is
pushed and popped at most once, so the whole thing takes linear time.
"""


def days_until_warmer(temps):
    answer = [0] * len(temps)
    waiting = []  # indexes of days, temperatures decreasing upward
    for day, t in enumerate(temps):
        while waiting and temps[waiting[-1]] < t:
            earlier = waiting.pop()
            answer[earlier] = day - earlier
        waiting.append(day)
    return answer  # days never followed by a warmer one stay 0


temps = [21, 19, 18, 22, 20, 25, 24, 24]
print(temps)
print(days_until_warmer(temps))
