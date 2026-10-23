# Appendix D: Design Index

The twenty worked designs of Part III, with the building blocks each relies on and the behavior its tested model demonstrates, followed by the four mock interviews of Chapter 36.

| Chapter | Design | Key building blocks | Tested model |
| --- | --- | --- | --- |
| 16 | Link Shortener | Base-62 IDs, cache-aside, 301 vs 302 | Code generator with aliases and expiry |
| 17 | Distributed Rate Limiter | Token bucket, atomic updates, fail open/closed | Lost updates vs compare-and-set |
| 18 | Key-Value Store | Consistent hashing, quorums, hinted handoff | Merkle-tree anti-entropy |
| 19 | Unique ID Generator | Snowflake IDs, range allocation | Block allocator with crashes |
| 20 | Web Crawler | URL normalization, politeness, Bloom filter | Polite per-host frontier |
| 21 | Notification Service | Priority queues, dedup, quiet hours | Send/skip decision rules |
| 22 | News Feed | Fan-out on write vs read, hybrid | Hybrid feed vs pull-all |
| 23 | Chat and Messaging | WebSockets, sequence numbers, client IDs | Sync after reconnect, no gaps |
| 24 | Search Autocomplete | Trie with top-k, offline pipeline | Top-k trie vs brute force |
| 25 | Video Streaming | Transcoding, segments, CDN, ABR | Buffer-based bitrate selection |
| 26 | File Storage and Sync | Chunking, dedup, versions, erasure coding | Content-defined chunking |
| 27 | Nearby Places | Geohash, neighbor cells | Latitude-aware geohash search |
| 28 | Ride Matching | Live grid index, atomic reservation | Ring search vs brute force |
| 29 | Payment System | Idempotency, double-entry ledger, reconciliation | Ledger with retries |
| 30 | Ticket Booking | Waiting room, optimistic concurrency, holds | No double booking under races |
| 31 | Metrics and Alerting | Time-series storage, rollups, cardinality | Exact rollups; sustained alerts |
| 32 | Distributed Job Scheduler | Leases, heartbeats, fencing tokens | Crash-tolerant job leasing |
| 33 | Real-Time Leaderboard | Sorted sets, rank by counting | Fenwick-tree ranks |
| 34 | Collaborative Document Editing | Operational transformation, CRDTs | OT convergence on 20,000 pairs |
| 35 | Distributed Message Queue | Partitioned replicated log, offsets | Consumer groups and replay |

## Mock Interviews

| Mock | Prompt | Level |
| --- | --- | --- |
| Mock 1 | Photo Sharing | Mid-level |
| Mock 2 | Distributed Cache | Senior |
| Mock 3 | Online Auctions | Senior |
| Mock 4 | Global Configuration Service | Staff |
