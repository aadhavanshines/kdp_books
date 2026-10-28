"""Hash maps and prefix sums: remember what you've seen, so a question
about earlier items is answered in constant time."""

from collections import Counter, defaultdict


def group_anagrams(words):
    """Words with the same letters share a key: their sorted letters."""
    groups = defaultdict(list)
    for w in words:
        groups["".join(sorted(w))].append(w)
    return list(groups.values())


def first_unique(text):
    """Index of the first character that appears once, or -1."""
    counts = Counter(text)
    return next((i for i, ch in enumerate(text) if counts[ch] == 1), -1)


def longest_consecutive(nums):
    """Length of the longest run of consecutive integers, in any order,
    in O(n): only start counting at a number with no predecessor."""
    present, best = set(nums), 0
    for x in present:
        if x - 1 not in present:
            length = 1
            while x + length in present:
                length += 1
            best = max(best, length)
    return best


def prefix_sums(nums):
    """prefix[i] is the sum of the first i numbers, so the sum of
    nums[i:j] is prefix[j] - prefix[i]: any range in one subtraction."""
    prefix = [0]
    for x in nums:
        prefix.append(prefix[-1] + x)
    return prefix


def count_subarrays_with_sum(nums, k):
    """How many runs of neighbors add up to k? A run ending here sums to
    k exactly when an earlier prefix sum equals (this prefix - k)."""
    seen = Counter({0: 1})  # the empty prefix
    total = count = 0
    for x in nums:
        total += x
        count += seen[total - k]
        seen[total] += 1
    return count
