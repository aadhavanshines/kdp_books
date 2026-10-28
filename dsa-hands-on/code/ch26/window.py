"""Sliding window: a range [left, right] that moves through a sequence.
The right edge adds one item at a time; the left edge drops items when
the window breaks a rule. Each item enters and leaves once: O(n)."""

from collections import Counter, deque


def max_sum_k(nums, k):
    """The largest sum of k neighboring numbers (a fixed-size window)."""
    window = sum(nums[:k])
    best = window
    for right in range(k, len(nums)):
        window += nums[right] - nums[right - k]  # slide by one
        best = max(best, window)
    return best


def longest_unique(text):
    """Length of the longest substring with no repeated character."""
    last_seen, left, best = {}, 0, 0
    for right, ch in enumerate(text):
        if last_seen.get(ch, -1) >= left:
            left = last_seen[ch] + 1  # jump past the earlier copy
        last_seen[ch] = right
        best = max(best, right - left + 1)
    return best


def shortest_with_sum(nums, target):
    """Length of the shortest run of positive numbers with sum >= target,
    or 0. Grow on the right; shrink from the left while still enough."""
    left, total, best = 0, 0, 0
    for right, x in enumerate(nums):
        total += x
        while total >= target:
            if not best or right - left + 1 < best:
                best = right - left + 1
            total -= nums[left]
            left += 1
    return best


def min_window(text, needed):
    """The shortest substring of text containing every letter of needed
    (with repeats), or ""."""
    need, missing = Counter(needed), len(needed)
    left, best = 0, ""
    for right, ch in enumerate(text):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        while missing == 0:  # the window has everything: shrink it
            if not best or right - left + 1 < len(best):
                best = text[left : right + 1]
            need[text[left]] += 1
            if need[text[left]] > 0:
                missing += 1
            left += 1
    return best


def window_maxima(nums, k):
    """The maximum of every window of size k. A deque keeps positions of
    possible maxima with their values decreasing from front to back."""
    q, out = deque(), []
    for right, x in enumerate(nums):
        while q and nums[q[-1]] <= x:
            q.pop()  # smaller and older: can never be a maximum again
        q.append(right)
        if q[0] <= right - k:
            q.popleft()  # fell out of the window
        if right >= k - 1:
            out.append(nums[q[0]])
    return out
