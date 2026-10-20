# Chapter 14: Intervals and Greedy Choices

Interval problems are about ranges of time or space: meetings, bookings, shifts, reservations. Nearly all of them start the same way: **sort the intervals**, by start or by end, and then make one pass. Greedy problems, more generally, are those where making the locally best choice at each step leads to the best overall answer. The hard part is not the code, which is usually short, but convincing yourself, and the interviewer, that the greedy choice is safe.

## When to Use It

- **Merging**, **inserting**, or **counting overlaps** of intervals.
- **Scheduling**: the most non-overlapping events, the fewest rooms, the fewest removals.
- "Can you reach the end?", "Which starting point works?": problems where a single running value (the farthest reachable point, a balance) captures everything.

Decide which end to sort by:

- Sort by **start** to merge overlapping intervals or to process them in time order.
- Sort by **end** to choose the most intervals that don't overlap: always keep the one that finishes first, since it leaves the most room for the rest.

Check the meaning of "overlap" with the interviewer: do [1, 3] and [3, 5] overlap? For closed intervals, yes; for half-open meetings like [1:00, 3:00), no.

## 14.1 Merge Bookings (Medium)

Combine overlapping bookings `[start, end]` into the smallest set of non-overlapping ranges. Bookings that touch, such as [1, 4] and [4, 5], are merged.

```
@include code/ch14/p01_merge_bookings.examples.txt
```

**The idea.** Sort by start. Each booking either overlaps the last merged range, so extend it, or starts after it, so begin a new range.

```python
@include code/ch14/p01_merge_bookings.py::merge_bookings
```

**Complexity:** O(n log n) time for sorting, O(n) space for the result.

> **Common Mistake:** Setting the merged end to the new booking's end instead of the maximum of the two. [1, 10] followed by [2, 3] must stay [1, 10].

## 14.2 Insert a Booking (Medium)

Insert a new booking into a sorted list of non-overlapping bookings, merging where necessary.

```
@include code/ch14/p02_insert_booking.examples.txt
```

**The idea.** The list is already sorted, so no sorting is needed: copy the bookings that end before the new one starts, absorb every booking that overlaps it, then copy the rest.

```python
@include code/ch14/p02_insert_booking.py::insert_booking
```

**Complexity:** O(n) time.

## 14.3 Rooms Needed (Medium)

Meetings run over half-open times `[start, end)`. What is the fewest number of rooms needed so that no two meetings in the same room overlap?

```
@include code/ch14/p03_rooms_needed.examples.txt
```

**The idea.** Process meetings by start time, keeping a min-heap of the end times of meetings in progress. If the earliest-ending meeting has finished by the time the next one starts, reuse its room; otherwise open a new one. The heap's final size is the number of rooms.

```python
@include code/ch14/p03_rooms_needed.py::rooms_needed
```

An equally good "sweep line" turns each meeting into a +1 event at its start and a -1 at its end, and tracks the running total; sorting puts an end before a start at the same time, so back-to-back meetings share a room.

```python
@include code/ch14/p03_rooms_needed.py::rooms_sweep
```

**Complexity:** O(n log n) time for both.

## 14.4 Fewest Cancellations (Medium)

Cancel as few bookings `[start, end)` as possible so that the rest don't overlap.

```
@include code/ch14/p04_fewest_cancellations.examples.txt
```

**Think first:** Among all bookings, which one should you definitely keep?

**The idea.** Keep the booking that ends earliest: any solution can swap its first booking for this one without creating an overlap, so keeping it is never worse. Then repeat with the bookings that start after it. Sorting by end time makes this one pass.

```python
@include code/ch14/p04_fewest_cancellations.py::fewest_cancellations
```

**Complexity:** O(n log n) time; O(n) space for the sorted copy, or O(1) extra if you may sort the input in place.

> **Interviewer's View:** That one-sentence "exchange argument" (swapping in the earliest-ending booking never hurts) is the proof the interviewer is looking for. Practice saying it.

## 14.5 Reach the Last Stone (Medium)

Stones are in a row; from stone i you may jump forward up to `hops[i]` stones. Starting on the first stone, can you reach the last?

```
@include code/ch14/p05_reach_last.examples.txt
```

**The idea.** Track the farthest stone reachable so far. If you ever stand on a stone beyond it, it can't be reached, and neither can anything after it.

```python
@include code/ch14/p05_reach_last.py::reach_last
```

**Complexity:** O(n) time, O(1) space, compared with O(n²) for the dynamic-programming solution used in the tests.

> **Follow-Up:** "What is the fewest number of jumps?" Treat it as a breadth-first search in levels: the stones reachable with one jump, then with two, tracking the farthest point of each level, still in O(n).

## 14.6 Charging Loop (Medium)

A delivery robot drives around a loop of charging stations. At station i it gains `charge[i]` and then spends `cost[i]` to reach the next station. From which station can it start, with an empty battery, and complete the loop without ever going below zero? Return the smallest such index, or -1.

```
@include code/ch14/p06_charging_loop.examples.txt
```

**Think first:** If the robot starts at station s and first runs out of charge reaching station i + 1, could any station between s and i be a valid start?

**The idea.** If the total charge is less than the total cost, no start works. Otherwise, run once around: whenever the battery goes negative after station i, no station from the current start to i can be the answer (each would arrive at i with even less charge), so restart from i + 1. The last start chosen is the answer.

```python
@include code/ch14/p06_charging_loop.py::charging_loop
```

**Complexity:** O(n) time, O(1) space.

## Key Takeaways

- Sort intervals first: by start to merge, by end to select non-overlapping ones.
- A min-heap of end times, or a sweep over +1/-1 events, counts simultaneous intervals.
- Greedy algorithms need a reason: an exchange argument, or a proof that skipped options can't work.
- Many "can you reach / where to start" problems reduce to one running value and one pass.
