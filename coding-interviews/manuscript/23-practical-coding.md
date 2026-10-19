# Part III: Beyond Algorithms

# Chapter 23: Practical Coding Rounds

Not every coding interview is a puzzle. Many companies also run rounds that look more like a day at work: parse a log file, join two tables, validate a sequence of commands, build a rate limiter. Candidates report these "practical" or "real-world" rounds especially often at companies that build physical products and infrastructure, and in later rounds for experienced engineers. The algorithms are simple; what's being tested is whether your code is **correct on messy input, readable, and easy to change**.

## What Changes in a Practical Round

| Algorithm round | Practical round |
| --- | --- |
| Clean input, exactly as described | Malformed lines, missing fields, unexpected values |
| One clever idea | Several simple steps, done carefully |
| Optimal complexity is the goal | Clarity and correctness come first; efficiency where it matters |
| One function | Often a small class or several functions, sometimes in an existing codebase |
| Follow-ups make it faster | Follow-ups add requirements: "now also report...", "now handle..." |

Habits that score well:

- **Ask what to do with bad input**, and then do it consistently: skip and count, raise an error, or use a default.
- **Name things after the domain**: `orders`, `status`, `slowest`, not `a`, `x`, `tmp`.
- **Keep parsing separate from the logic.** A function that turns text into records, and another that works on records, are each easy to test and change.
- **Use the standard library**: `csv`, `re`, `collections`, `datetime`, `json`. Writing your own CSV parser is a red flag, because quoted fields with commas will break it.
- **Test as you go**, with one normal line, one bad line and one edge case.

## 23.1 Log Summary (Medium)

A web server writes one line per request, such as `2026-10-01T12:00:03Z GET /api/orders 200 123ms`: a timestamp, a method, a path, a status code and a response time. For each path, report the number of requests, the number of server errors (status 500 or above) and the slowest response time. Skip lines that don't match the format, and report how many were skipped.

```
@include code/ch23/p01_log_summary.examples.txt
```

**Think first:** What are all the ways a line could be malformed?

**The idea.** One regular expression describes a valid line exactly, with named groups for the fields; anything that doesn't match is skipped and counted. A dictionary accumulates the statistics for each path.

```python
@include code/ch23/p01_log_summary.py::LINE,log_summary
```

**Complexity:** O(total length of the lines).

A version without regular expressions, which splits each line and checks each field, gives the same results on thousands of random lines, including deliberately broken ones such as a four-digit status or a missing time. Both are fine in an interview; the regular expression is shorter, the explicit checks are easier for some interviewers to read.

> **Interviewer's View:** Practical rounds often add a requirement halfway through: "also report the 95th-percentile time" or "group by hour". If your parsing is separate from your counting, the change is small. Say this when you structure the code.

## 23.2 Telemetry Spikes (Medium)

A sensor sends a stream of readings. Flag every reading that differs from the average of the previous k readings by more than a limit. The first k readings are never flagged. Return the indices of the flagged readings.

```
@include code/ch23/p02_telemetry_spikes.examples.txt
```

**Brute force.** Recompute the average of the previous k readings at every step: O(n × k).

**The idea.** A sliding window with a running sum (Chapter 7): add each reading after checking it, and subtract the reading that leaves the window. Each step is O(1).

```python
@include code/ch23/p02_telemetry_spikes.py::spikes
```

**Complexity:** O(n) time, O(k) space.

Look closely at the first example. The spike at index 3 is flagged, as it should be, but so are the normal readings at indices 4, 5 and 6. The spike is still inside the window, pulling the average up to about 17, so readings near 10 now look abnormal. The code does exactly what the specification says, and the specification is the problem.

> **Follow-Up:** "How would you stop one spike from flagging the readings after it?" Good answers: leave flagged readings out of the window; compare with the *median* of the window, which a single outlier barely moves; or use an exponentially weighted average with a limit that adapts to the noise. Raising this yourself, before the interviewer does, is exactly the kind of engineering judgement practical rounds look for.

## 23.3 Launch Sequence Validator (Medium)

A (fictional) rocket controller moves through states: IDLE, FUELING, ARMED, IGNITION and LIFTOFF, plus SAFED after an abort. Given a list of events, return the final state, or the index of the first event that isn't allowed in the current state.

```
IDLE --fuel--> FUELING --arm--> ARMED --ignite--> IGNITION
IGNITION --release--> LIFTOFF
any state before LIFTOFF --abort--> SAFED
SAFED --reset--> IDLE
```

```
@include code/ch23/p03_launch_sequence.examples.txt
```

**The idea.** A *state machine* is best written as data: a dictionary from (state, event) to the next state. The loop then only looks up each transition. The rule "abort is allowed from any state before liftoff" is a set of states rather than five separate entries.

```python
@include code/ch23/p03_launch_sequence.py::TRANSITIONS,ABORTABLE,run_sequence
```

**Complexity:** O(number of events).

The same logic as a chain of `if` statements works too, and the tests compare the two, but every new state or event means editing the chain. With a table, adding a "hold" state is one line, and the table can be printed or drawn as a diagram for review.

> **Tip:** Safety-critical systems are full of state machines: flight software, medical devices, payment flows. In an interview with an engineering company, mentioning that invalid transitions should be *rejected and logged*, never silently ignored, shows you understand why the design matters.

## 23.4 Join Two Tables (Medium)

Two CSV files arrive as text: orders (`order_id,customer_id,amount`) and customers (`customer_id,name`). Produce `(order_id, customer_name, amount)` for every order, sorted by order ID. Orders whose customer is missing get the name "UNKNOWN". (In database terms, this is a *left join*.)

```
@include code/ch23/p04_join_tables.examples.txt
```

**Brute force.** For each order, search the customer list: O(orders × customers).

**The idea.** Build a dictionary from customer ID to name first, then look up each order in O(1). That's a *hash join*, the same method databases use for this kind of query.

```python
@include code/ch23/p04_join_tables.py::join_tables
```

**Complexity:** O(orders + customers) plus the sort.

> **Common Mistake:** Splitting lines on commas yourself. The customer `"Lee, Jordan"` contains a comma inside quotes, which `line.split(",")` breaks into two fields. The `csv` module handles quoting correctly; using it is the professional answer.

## 23.5 Token Bucket Rate Limiter (Medium)

A service limits each client with a *token bucket*: the bucket holds up to `capacity` tokens and refills continuously at `rate` tokens per second. Each request takes one token if one is available, and is rejected otherwise. The bucket starts full. Given request times in seconds, in non-decreasing order, return whether each request is allowed.

```
@include code/ch23/p05_token_bucket.examples.txt
```

**Think first:** Do you need a timer that adds tokens every second?

**The idea.** No timer is needed. Store the number of tokens and the time of the last request. When a request arrives, add the tokens earned since then, capped at the capacity, and then try to take one. This *lazy* refill computes the state only when it's needed.

```python
@include code/ch23/p05_token_bucket.py::TokenBucket
```

**Complexity:** O(1) per request, O(1) memory per client.

The test reference recomputes the bucket from the beginning for every request, a slow but obviously correct "replay". Comparing the two on random request times is how you would test a rate limiter in real life.

> **Follow-Up:** "How does this work across many servers?" Store each client's bucket (tokens and last time) in a shared store such as Redis, and update it atomically. Chapter 25 discusses rate limiting as a system design topic.

## 23.6 Config Diff (Medium)

Compare two nested configuration dictionaries, and list the differences as `(dotted.path, kind, old, new)` tuples sorted by path, where kind is "added", "removed" or "changed".

```
@include code/ch23/p06_config_diff.examples.txt
```

**The idea.** Recurse into keys that are dictionaries on both sides, extending the path; compare everything else directly. Iterating over the sorted union of the keys produces the output in order.

```python
@include code/ch23/p06_config_diff.py::config_diff
```

**Complexity:** O(total number of keys) plus sorting at each level.

How do you test a diff when there is no simpler program to compare against? This book's tests use a **property**: applying the changes to the old configuration must produce the new one. A small `apply_changes` function makes that check, and thousands of random nested dictionaries confirm it.

```python
@include code/ch23/p06_config_diff.py::apply_changes
```

An earlier, "flattened" reference implementation disagreed with this one when a key changed from a dictionary to a plain value: one reported a single change, the other reported every old nested key as removed and the new value as added. Neither was wrong; the specification didn't say. The property test settles what matters, that the diff is complete and correct, without forcing one arbitrary choice.

> **Interviewer's View:** Ask about ambiguous cases like this one before coding: "If `db` changes from a dictionary to a string, should that be one change or several?" Interviewers in practical rounds often leave such gaps deliberately.

## 23.7 Parse a Duration (Easy)

Turn strings such as "1h30m", "45s" or "2h5s" into a number of seconds. Each of the units h, m and s may appear at most once, in that order. Anything else is an error. (The examples show errors as `'error'`; the function itself raises `ValueError`.)

```
@include code/ch23/p07_parse_duration.examples.txt
```

**The idea.** A regular expression with three optional groups describes every valid string. `fullmatch` requires the whole string to match, and an explicit check rejects the empty string, which matches a pattern where everything is optional.

```python
@include code/ch23/p07_parse_duration.py::PATTERN,parse_duration
```

**Complexity:** O(length of the text).

> **Common Mistake:** Using `match` or `search` instead of `fullmatch`. Then "1h30mXYZ" would be accepted as 5,400 seconds, ignoring the garbage at the end. Validation code should always describe the entire input.

## Key Takeaways

- Practical rounds reward clean structure, careful handling of bad input, and the standard library.
- Write state machines and rules as data (dictionaries and sets), not long `if` chains.
- Build a dictionary first, then look up: the hash join turns O(n × m) into O(n + m).
- When there's no simple reference to compare against, test a property, such as "applying the diff gives the new version".
- Question the specification: a spike that corrupts its own baseline is a design flaw, and noticing it is a strong signal.
