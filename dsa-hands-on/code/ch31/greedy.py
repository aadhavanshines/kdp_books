"""Greedy algorithms: make the choice that looks best right now, and
never reconsider. Fast and simple, but only right when a proof (or a
counterexample search) says so."""

import heapq


def most_meetings(meetings):
    """The most non-overlapping (start, end) meetings in one room: always
    take the meeting that ends first. Ending early leaves the most
    room for everything after."""
    chosen, free_at = [], float("-inf")
    for start, end in sorted(meetings, key=lambda m: m[1]):
        if start >= free_at:
            chosen.append((start, end))
            free_at = end
    return chosen


def merge_intervals(intervals):
    """Merge overlapping intervals, sorted by start."""
    out = []
    for start, end in sorted(intervals):
        if out and start <= out[-1][1]:
            out[-1][1] = max(out[-1][1], end)
        else:
            out.append([start, end])
    return out


def rooms_needed(meetings):
    """The fewest rooms for all meetings: a heap holds the end times of
    meetings in progress; reuse the room that frees up first."""
    ends = []
    for start, end in sorted(meetings):
        if ends and ends[0] <= start:
            heapq.heapreplace(ends, end)
        else:
            heapq.heappush(ends, end)
    return len(ends)


def can_reach_end(jumps):
    """Each number is the longest jump from that spot. Can we reach the
    last spot? Track the furthest reachable position."""
    furthest = 0
    for i, j in enumerate(jumps):
        if i > furthest:
            return False
        furthest = max(furthest, i + j)
    return True


def greedy_coins(coins, amount):
    """Take the biggest coin that fits, again and again."""
    count = 0
    for c in sorted(coins, reverse=True):
        count += amount // c
        amount %= c
    return count if amount == 0 else -1
