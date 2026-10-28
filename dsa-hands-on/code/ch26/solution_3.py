"""Exercise 26.3: the longest run of 1s if you may flip at most k 0s:
the longest window holding at most k zeros."""


def longest_ones(bits, k):
    left = zeros = best = 0
    for right, b in enumerate(bits):
        zeros += b == 0
        while zeros > k:
            zeros -= bits[left] == 0
            left += 1
        best = max(best, right - left + 1)
    return best


print(longest_ones([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2))
