# Appendix A: Numbers Every Designer Should Know

These figures are for back-of-the-envelope estimates. They are orders of magnitude, not benchmarks: real values depend on hardware, configuration and workload, and they change over time. State them as assumptions in an interview.

## Time and Rates

| Fact | Value |
| --- | --- |
| Seconds in a day | 86,400 (about 10⁵) |
| Seconds in a month | about 2.6 million |
| Seconds in a year | about 31.5 million |
| 1 million per day | about 12 per second |
| 100 million per day | about 1,200 per second |
| 1 billion per day | about 12,000 per second |
| Peak versus average | 2 to 10 times; state your assumption |

## Sizes

| Unit | Bytes |
| --- | --- |
| 1 KB | 10³ |
| 1 MB | 10⁶ |
| 1 GB | 10⁹ |
| 1 TB | 10¹² |
| 1 PB | 10¹⁵ |
| 2¹⁰, 2²⁰, 2³⁰, 2⁴⁰ (KiB, MiB, GiB, TiB) | about 10³, 10⁶, 10⁹, 10¹² (2⁴⁰ is about 10% more than 10¹²) |

| Item | Typical size |
| --- | --- |
| An ID (64-bit integer) | 8 bytes |
| A UUID | 16 bytes |
| A short string (name, URL) | tens to a few hundred bytes |
| A database row with a few fields | a few hundred bytes to 1 KB |
| A compressed photo | 100 KB to a few MB |
| A minute of video | about 3 to 60 MB, depending on quality |

## Latency, by Order of Magnitude

These are the classic "latency numbers every programmer should know", popularized by Jeff Dean and Peter Norvig, rounded to orders of magnitude. Modern hardware has improved some (SSDs especially), but the ratios still guide design.

| Operation | Order of magnitude |
| --- | --- |
| Read from CPU cache | about 1 nanosecond |
| Read from main memory | about 100 nanoseconds |
| Read 1 MB sequentially from memory | tens to hundreds of microseconds |
| Random read from an SSD | tens to about 100 microseconds |
| Round trip within a data center | hundreds of microseconds |
| Read 1 MB sequentially from an SSD | about a millisecond |
| Disk seek on a spinning hard drive | about 10 milliseconds |
| Round trip across a continent | tens of milliseconds |
| Round trip between continents | 100 to 200 milliseconds |

The lessons: memory is about a thousand times faster than a network round trip in the data center, and a cross-continent round trip is about a hundred times slower again. Avoid sequential network calls on the request path, and keep data close to the users who read it.

## Rough Capacities for Planning

Assumptions used in this book's estimates; adjust for your hardware and workload.

| Component | Planning figure |
| --- | --- |
| Stateless web or API server | about 1,000 to 10,000 simple requests per second |
| Relational database, single node | thousands to tens of thousands of simple queries per second |
| In-memory cache node | 100,000 or more operations per second |
| Log partition (message queue) | about 10 MB per second |
| Long-lived connections per server | about 100,000 |
| Usable memory per cache server | about 64 to 256 GB |
| Usable disk per storage node | a few to tens of TB |

## Availability

| Availability | Downtime per year | Downtime per 30 days |
| --- | --- | --- |
| 99% | about 3.7 days | about 7.2 hours |
| 99.9% | about 8.8 hours | about 43 minutes |
| 99.99% | about 53 minutes | about 4.3 minutes |
| 99.999% | about 5 minutes | about 26 seconds |

Components in series multiply their availabilities: two services at 99.9% each, both required for a request, give about 99.8%. Redundant components in parallel fail only if all fail, which is why redundancy raises availability.

## Little's Law

**Requests in the system = arrival rate × time in the system.** At 2,000 requests per second and 50 ms each, about 100 requests are in progress at any moment, so you need at least 100 concurrent workers or connections.
