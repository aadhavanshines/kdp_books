# Part IV: Practice

# Chapter 28: Four Full Mock Interviews

This chapter replays four complete 45-minute coding interviews, as conversations between a candidate and an interviewer. They are written to show the parts of an interview that solutions alone can't: clarifying questions, thinking aloud, getting stuck, taking hints, finding a bug, and answering follow-ups. Each one ends with the interviewer's notes, the kind of written feedback that goes to a hiring committee or a hiring manager.

The interviews are fictional, and the problems are original to this book, but the structure matches the six-step method of Chapter 2.

**How to use this chapter:** before reading each interview, read only the problem statement and try it yourself for 30 minutes, out loud, with a timer. Then read the conversation and compare: not just your code, but your clarifying questions, your explanation and your testing.

## Mock 1: Bus Transfers (Medium)

**The problem.** A city has bus routes; `routes[i]` lists the stops that bus i visits, in a loop, in both directions. You may change buses at any stop they share. What is the fewest number of buses you must ride to get from stop `src` to stop `dst`? Return 0 if they're the same stop, and -1 if it's impossible.

**Interviewer:** Here's the problem. Take a moment to read it, and tell me how you'd like to start.

**Candidate:** Let me make sure I understand. We're minimizing the number of buses, not the number of stops traveled. So riding one bus through ten stops counts as one. Is that right?

**Interviewer:** Yes.

**Candidate:** And a bus can be ridden from any of its stops to any other of its stops, because it loops. Can a stop appear twice in a route, and roughly how large are the inputs?

**Interviewer:** No repeated stops within a route. Up to about 500 routes, and up to 10⁵ stops in total across all routes.

**Candidate:** OK. Let me write an example. Routes `[1, 4, 9]`, `[9, 5, 6]` and `[6, 2, 8]`, from stop 1 to stop 8. I take the first bus from 1 to 9, change to the second bus to 6, then the third to 8. Three buses. And if `src` equals `dst`, the answer is 0 without riding anything.

**Interviewer:** Good. How would you approach it?

**Candidate:** "Fewest" with each step costing the same, one bus, suggests BFS. My first instinct is a BFS over stops, where neighbors are stops reachable on any bus through the current stop... but then each level is one bus ride, so the BFS level is exactly the number of buses. That works.

**Interviewer:** What's the cost?

**Candidate:** If I'm careless, a lot. A stop with many buses would rescan each bus's entire route every time any of its stops is dequeued. The trick is that once I've ridden a bus, all its stops are reachable at that level, so I never need to expand that bus again. I'll keep a set of used buses. Then each bus is expanded once and each stop is queued once, so it's linear in the total size of the routes.

**Interviewer:** Sounds good. Go ahead.

*The candidate writes the code, talking through each part: the map from stop to buses, the queue of (stop, rides) pairs, and the two "seen" sets.*

```python
@include code/ch28/m1_bus_transfers.py::bus_transfers
```

**Candidate:** Let me trace my example. The queue starts with (1, 0). Stop 1 has bus 0, unused: I mark it and scan stops 1, 4 and 9. None is 8, so 4 and 9 are queued with one ride. From 4, bus 0 is used, so nothing. From 9, bus 1 is new: stops 9, 5, 6 are scanned and 5 and 6 queued with two rides. From 5, nothing new; from 6, bus 2: stop 8 is the destination, return 2 + 1 = 3. Correct.

**Interviewer:** What if `dst` isn't on any route?

**Candidate:** Then the queue empties and we return -1. And `src == dst` is handled first, even if the stop isn't on any route. One more edge case: `src` on no route at all. `buses_at[src]` is an empty list, the loop does nothing, and we return -1. Good.

```
@include code/ch28/m1_bus_transfers.examples.txt
```

**Interviewer:** Nice. Last question: is there another way to model the graph?

**Candidate:** Make the buses the nodes, and connect two buses if they share a stop. Then BFS from all the buses through `src`. It's conceptually clean, but building the edges by comparing every pair of buses is O(B² × route length) in the worst case, so I prefer the stop-based version with the used-bus set.

**Interviewer's notes.** *Strong hire signal. Clarified the objective (buses, not stops) and the input size before designing. Identified BFS immediately and, importantly, anticipated the cost of re-expanding buses before coding. Clean code with clear names. Traced an example accurately and covered edge cases without prompting. Discussed an alternative model and its trade-off.*

## Mock 2: My Calendar (Medium)

**The problem.** Implement a calendar class with a method `book(start, end)` that adds the half-open interval `[start, end)` and returns True, unless it would overlap an existing booking, in which case it returns False and adds nothing.

**Candidate:** Half-open, so a booking ending at 12 and one starting at 12 don't overlap. Are start and end integers, and is `start < end` guaranteed?

**Interviewer:** Yes to both.

**Candidate:** The simplest solution keeps a list of bookings and checks each one: two intervals overlap when each starts before the other ends. That's O(n) per call. Is that acceptable, or should I aim for something faster?

**Interviewer:** Start there, then improve it.

**Candidate:** For the brute force, the overlap test is `s < be and bs < e`, and a booking is OK if it overlaps none. I'll write it quickly, as a reference for testing:

```python
@include code/ch28/m2_calendar.py::calendar_session_brute
```

**Candidate:** To improve it, I'll keep the bookings sorted by start. Since they never overlap, sorting by start also sorts them by end. A new booking can only conflict with its two neighbors in sorted order: the one before it, which must end by our start, and the one after it, which must start at or after our end. Binary search finds the position.

**Interviewer:** Show me.

```python
@include code/ch28/m2_calendar.py::Calendar
```

**Candidate:** `bisect_right` gives the index of the first booking starting after our start. So `i - 1` is the last booking that starts at or before us. It must end by our start; and the booking at `i`, if any, must start at or after our end. Let me test: book (9, 12) succeeds. (11, 13): `i` is 1, the previous booking ends at 12, which is after 11, so it's rejected. (12, 14): the previous ends at 12, not after 12, so no conflict; nothing after; accepted. Then (8, 9): `i` is 0, nothing before, the next starts at 9, which is not before 9; accepted.

```
@include code/ch28/m2_calendar.examples.txt
```

**Interviewer:** What's the complexity now?

**Candidate:** The binary search is O(log n). But I should be honest: `list.insert` shifts elements, so it's O(n) in the worst case. It's a fast memory move, so in practice it's quick for thousands of bookings. For a guaranteed O(log n), I'd use a balanced binary search tree, for example `SortedList` from the third-party `sortedcontainers` package, or a `TreeMap` in Java.

**Interviewer:** Good. Follow-up: now allow double booking, but never triple booking.

**Candidate:** Then I'd keep two structures: all bookings, and the overlaps between them. A new booking is rejected if it overlaps any existing *overlap*; otherwise, I add its overlaps with existing bookings to the overlap list. That's O(n) per call. For many bookings, a sweep over +1/-1 events, as in the Rooms Needed problem, generalizes to "at most k at once".

**Interviewer's notes.** *Hire. Asked about the interval convention up front, which is where most bugs in this problem come from. Wrote a brute force for testing, then a correct binary-search solution, and traced boundary cases carefully. Was candid that list insertion is O(n), and knew the right structure for a guaranteed bound. Follow-up answer was reasonable, slightly slow to start.*

## Mock 3: Snapshot Array (Medium)

**The problem.** Design an array of n zeros with three operations: `set(i, value)`; `snap()`, which takes a snapshot and returns its ID (0, then 1, then 2, and so on); and `get(i, snap_id)`, which returns the value at index i when that snapshot was taken.

**Candidate:** The obvious solution copies the whole array on every snap, so `get` is a lookup. What sizes should I expect?

**Interviewer:** n up to 50,000, and up to 50,000 calls in total.

**Candidate:** Then copying is too expensive: 50,000 snaps of 50,000 elements is 2.5 billion values. Memory must grow with the number of `set` calls, not with n times the number of snaps.

**Interviewer:** Agreed. What would you store instead?

**Candidate:** For each index, its *history*: a list of (snap ID, value) pairs, recording a change only when `set` is called. A `snap` then just increments a counter. To answer `get(i, s)`, I need the last change to index i made in a snapshot period up to s. The history is sorted by snap ID, because snap IDs only increase, so binary search finds it.

**Interviewer:** What does "made in a snapshot period" mean exactly?

**Candidate:** Good point, let me be precise. Sets between snap k - 1 and snap k belong to snapshot k, because `snap()` returns k and captures them. So I tag each set with the current `snap_id`, the ID the next snapshot will get. And if index i is set twice before the next snap, only the last value matters, so I overwrite the last entry instead of appending. To avoid special cases, every history starts with (-1, 0): the initial zero.

```python
@include code/ch28/m3_snapshot_array.py::SnapshotArray
```

**Candidate:** For the search, I want the last pair whose snap ID is at most `snap_id`. Searching for `(snap_id, infinity)` with `bisect_right` puts me just after all pairs with that snap ID, whatever their values, and stepping back one gives the answer.

**Interviewer:** Let's trace an example.

**Candidate:** Two elements. `set(1, 4)`: history of 1 becomes [(-1, 0), (0, 4)]. `snap()` returns 0. `set(1, 7)`: appended as (1, 7). `snap()` returns 1. `get(1, 0)`: the last pair with ID at most 0 is (0, 4), so 4. `get(1, 1)`: (1, 7), so 7. `get(0, 1)`: index 0 has only (-1, 0), so 0.

```
@include code/ch28/m3_snapshot_array.examples.txt
```

**Interviewer:** How did you test this while preparing? Assume you had more time.

**Candidate:** I'd keep the slow copy-on-snap version as a reference, because it's obviously correct, and compare the two on thousands of random sequences of operations. That would catch off-by-one errors in the snap IDs, which are the risky part here.

**Interviewer's notes.** *Strong hire. Rejected the naive copy using the stated limits, with a quick estimate. Designed per-index history with binary search independently. When asked to be precise, worked out the snap-ID semantics carefully instead of guessing, and handled repeated sets within one snapshot. The (snap_id, infinity) search key was a neat detail. Testing strategy, a slow reference plus random comparisons, was excellent.*

## Mock 4: Easiest Hike (Medium-Hard)

**The problem.** A grid gives the heights of a terrain. A hike goes from the top-left cell to the bottom-right cell, moving up, down, left or right. The effort of a hike is the *largest* height difference between two consecutive cells along it. Find the smallest possible effort.

**Candidate:** So the cost of a path isn't a sum, it's the maximum step. And we can move in all four directions. Can heights be negative, and how big is the grid?

**Interviewer:** Heights are non-negative integers up to a million; the grid is up to 100 by 100.

**Candidate:** My first idea is dynamic programming, like counting grid paths: the best effort to reach each cell from the cell above or the cell to the left.

**Interviewer:** Does that handle every path?

**Candidate:** Hmm. No: it only considers paths that move right and down. Since we can move up and left, the best path might snake around. For example, if there's a wall of high cells in the middle with a gap at the top, the best route might go down, across and back up. Let me write one:

```
1 9 1 1 1
1 9 1 9 1
1 1 1 9 1
```

**Candidate:** The path down the left column, along the bottom, up the middle column, across the top and down the right side uses only 1s: effort 0. Right-and-down paths must cross a 9 somewhere, effort 8. So DP over right and down moves is wrong.

**Interviewer:** Good catch. So what instead?

**Candidate:** It's a shortest path where the "length" of a path is its largest edge instead of the sum. Dijkstra's algorithm still works, because extending a path can never decrease its maximum, just as extending a path can never decrease its sum with non-negative weights. So I'll run Dijkstra with `max(effort, step)` in place of `distance + weight`.

```python
@include code/ch28/m4_easiest_hike.py::easiest_hike
```

**Candidate:** The heap pops the cell with the smallest effort so far. When the bottom-right cell is popped, its effort is final. The "stale entry" check skips cells that were already reached more cheaply. With r × c cells and up to four edges each, it's O(rc log(rc)).

```
@include code/ch28/m4_easiest_hike.examples.txt
```

**Interviewer:** Any other approach?

**Candidate:** Binary search on the answer. For a given limit, I can check with BFS whether the destination is reachable using only steps no bigger than that limit. If a limit works, any larger one works, so the smallest working limit can be found by binary search over 0 to the height range. That's O(rc × log(height range)): about 20 BFS runs for heights up to a million.

```python
@include code/ch28/m4_easiest_hike.py::reachable,easiest_hike_binary
```

**Interviewer:** Which would you choose?

**Candidate:** Dijkstra is a single pass and doesn't depend on the height range. The binary search is easier to get right under pressure, because the BFS is very standard, and it's a good cross-check: I'd test them against each other.

**Interviewer's notes.** *Hire, leaning strong. Started with an incorrect DP, but found the flaw when prompted and, impressively, built a concrete counterexample. Adapted Dijkstra correctly and justified why it works for a max-cost path. Offered binary search on the answer as an alternative with accurate complexity. Initial mistake is normal at this difficulty; how it was handled is a positive signal.*

## What the Four Interviews Have in Common

- Every candidate **clarified** before designing: the objective, the interval convention, the input sizes.
- Every candidate **estimated** costs from the limits, and used the estimate to reject an approach.
- Mistakes happened, and the candidates **recovered** by reasoning aloud, not by guessing.
- Every candidate **traced an example** through the final code, and named edge cases.
- Every candidate had a view on **testing**: a brute force or slow reference to compare against.

You won't be perfect in an interview, and you don't need to be. Interviewers are looking for the habits above.

## Key Takeaways

- Practice full interviews out loud, with a timer, not just problems.
- Clarify the objective and constraints before choosing an algorithm.
- Use the input limits to estimate, and say the estimate aloud.
- When an interviewer asks "does that handle every case?", look for a counterexample.
- Trace your code on an example and name the edge cases before saying you're done.
