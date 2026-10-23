# Appendix B: Building Blocks Reference

A one-page reminder of each building block: what it's for, its main trade-off, and where it appears in this book.

| Building block | Use it for | Main trade-off | Chapters |
| --- | --- | --- | --- |
| Load balancer | Spreading requests; removing unhealthy instances | Another hop; balancers must be redundant | 5 |
| Stateless service | Easy horizontal scaling and deployment | State must live elsewhere | 5 |
| CDN | Static and media content near users | Staleness; purge and versioning needed | 4, 25 |
| Cache (cache-aside) | Read-heavy data | Staleness, invalidation, stampedes, hot keys | 6, 16, 22 |
| Relational database | Structured data, transactions, joins | Write scaling beyond one node | 7, 29 |
| Key-value / wide-column store | Huge volumes of reads and writes by key | Limited queries; no cross-row transactions | 7, 18, 23 |
| Object storage | Large binary files | High per-request latency | 7, 25, 26 |
| Search index | Full-text search and ranking | Updated asynchronously | 7, 24 |
| Replication (leader-follower) | Read scaling, availability | Replication lag; failover | 8 |
| Quorums | Tunable consistency without a leader | Latency of waiting for replicas | 8, 18 |
| Partitioning (sharding) | More data or writes than one node | Cross-partition queries; hot keys | 9 |
| Consistent hashing | Adding and removing nodes cheaply | Uneven load without virtual nodes | 9, 18 |
| Message queue | Decoupling, absorbing bursts, task distribution | Asynchronous; duplicates | 10, 21 |
| Partitioned log | Event streams, replay, several consumers | Order only per partition | 10, 35 |
| Outbox pattern | Reliable events alongside database writes | Extra table and publisher | 10, 29 |
| Rate limiter (token bucket) | Protecting services, fairness | Shared state across servers | 11, 17 |
| Time-ordered IDs | Unique, sortable keys without coordination | Clock dependence | 12, 19 |
| Vector clocks | Detecting concurrent updates | Metadata size; merge logic | 12, 18 |
| Bloom filter | Fast "definitely not present" checks | False positives | 13, 20 |
| Count-Min sketch | Approximate counts, heavy hitters | Overestimates | 13, 24 |
| HyperLogLog | Counting distinct items | About 1 to 2% error | 13 |
| Timeouts, retries, backoff, jitter | Surviving transient failures | Duplicates; retry storms if done badly | 14 |
| Circuit breaker | Failing fast when a dependency is down | Tuning thresholds | 14 |
| Merkle tree | Finding differences between replicas | Rebuild cost | 18 |
| Geohash / spatial index | "Near me" queries | Cell sizes vary with latitude | 27, 28 |
| Idempotency keys | Safe retries of non-read operations | Storage for keys and results | 4, 29 |
| Double-entry ledger | Correct, auditable money movement | More rows; balances are sums | 29 |
| Optimistic concurrency (versions) | Preventing lost updates and double booking | Retries under contention | 17, 26, 30 |
| Leases and fencing tokens | Recovering work from crashed workers safely | At-least-once execution | 32 |
| Operational transformation / CRDTs | Concurrent editing that converges | Complexity; metadata | 34 |
