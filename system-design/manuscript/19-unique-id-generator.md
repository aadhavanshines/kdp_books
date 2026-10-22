# Chapter 19: Unique ID Generator

**The prompt:** "Design a service that generates unique IDs for all the systems in a large company."

It sounds trivial until you add the requirements: millions of IDs per second, no duplicates ever, IDs that sort roughly by time, and no single point of failure.

## Requirements

**Functional:**

1. Generate unique 64-bit integer IDs.
2. IDs generated later should generally be larger (sortable by creation time), so they make good database keys.

**Non-functional:**

- About 2 million IDs per second at peak across the company.
- Very low latency: ID generation is on the path of almost every write.
- Highly available: no single point of failure.

## Estimates

```
@include code/ch19/estimate.demo.txt
```

One Snowflake-style generator can produce over 4 million IDs per second in theory, so throughput is not the constraint; availability and latency are. That suggests generating IDs as close to the caller as possible.

## Options

Chapter 12 compared the main schemes. For this prompt, three are worth presenting:

1. **A database counter** with auto-increment: simple and sortable, but every ID is a database write, and the database is a single point of failure. Even with two databases, one handing out odd and one even numbers, it scales poorly.
2. **Range allocation:** a central service hands out blocks of IDs; servers generate IDs locally within their block.
3. **Snowflake-style IDs:** each generator combines a timestamp, its machine ID and a sequence number, with no coordination per ID.

## Design A: Range Allocation

The allocator stores one number, the start of the next free block, in a strongly consistent store. A server asks for a block (say 1,000 IDs), and hands out IDs from it without talking to anyone until it runs out.

```python
@include code/ch19/d01_ranges.py::Allocator,IdServer
```

With blocks of 5 for illustration: server 0 takes IDs 1 to 5, server 1 takes 6 to 10, then server 0 crashes and restarts. Its unused IDs, 3 to 5, are lost, and its next block starts at 11:

```
@include code/ch19/d01_ranges.examples.txt
```

That's the defining trade-off: **gaps are allowed, duplicates are not**. The allocator must persist the new block boundary *before* returning a block, so a crash of the allocator can never hand out the same block twice. The test runs 5,000 requests across three servers with random crashes and checks that no ID repeats.

IDs from range allocation are only roughly time-ordered: a server with a large block may hand out "old" low numbers long after others have moved on.

## Design B: Snowflake-Style Generators

Each generator holds a 10-bit machine ID and produces IDs from its clock (Chapter 12). Generators can run inside each application server as a library, so getting an ID is a local function call with no network at all.

The hard part is **assigning machine IDs** uniquely, especially with containers that start and stop all the time. Options: lease machine IDs from a coordination service (such as etcd or ZooKeeper) with a time-to-live that the generator renews; or derive them from a unique deployment slot. Two generators must never share a machine ID, or they will produce duplicates.

The second hard part is **clocks**. If a server's clock jumps backwards, the generator must stop and wait, or fail, rather than reuse timestamps. Keep clocks synchronized, and monitor clock drift.

## Choosing

| | Range allocation | Snowflake-style |
| --- | --- | --- |
| Coordination | One call per block | Once, to get a machine ID |
| Time ordering | Rough | By millisecond |
| Clock dependence | None | Yes; backwards clocks must be handled |
| Information leaked | IDs reveal rough volume | IDs reveal creation time and machine |
| Failure impact | Lost blocks leave gaps | None, if machine IDs are unique |

For a company-wide service, Snowflake-style generators embedded as a library, with machine IDs leased from a coordination service, are the stronger answer: no network hop per ID and time-ordered results. Range allocation is a fine choice for a single product, such as the link shortener of Chapter 16.

## Wrap-Up

- **Single points of failure:** none on the hot path; the coordination service is needed only at startup.
- **Ordering across machines:** only approximate (within clock skew), which is enough for database locality but not for strict event ordering.
- **Capacity:** 69 years from the chosen epoch; choose a recent epoch.

## Follow-Up Questions

- "We need 128-bit IDs or standard formats." UUIDv7 (RFC 9562) gives time-ordered 128-bit IDs with random bits instead of machine IDs, so no machine-ID assignment is needed.
- "Make IDs non-guessable." Use random UUIDs for public identifiers and keep time-ordered IDs internal.
- "More than 1,024 generators." Change the bit split: fewer sequence bits, more machine bits.

## Key Takeaways

- A central counter is simple but a bottleneck and single point of failure.
- Range allocation needs one call per block; it allows gaps but never duplicates, provided the allocator persists before replying.
- Snowflake-style generators need no coordination per ID; the hard parts are unique machine IDs and backwards clocks.
- Generate IDs as close to the caller as possible.
