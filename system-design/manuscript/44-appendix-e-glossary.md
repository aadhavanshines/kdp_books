# Appendix E: Glossary

**ACID.** Atomicity, consistency, isolation, durability: the guarantees of database transactions (Chapter 7).

**Adaptive bitrate (ABR).** Switching video quality per segment to match network conditions (Chapter 25).

**Anti-entropy.** Background comparison and repair of replicas, often with Merkle trees (Chapter 18).

**At-least-once delivery.** Every message is delivered, possibly more than once (Chapter 10).

**Backpressure.** Signals that slow producers when consumers can't keep up (Chapter 10).

**Blast radius.** How much of a system one failure or one change can affect; good designs keep it small (Chapter 37).

**Bloom filter.** A compact set membership test with false positives but no false negatives (Chapter 13).

**CAP theorem.** During a network partition, a system must choose between consistency and availability (Chapter 8).

**CDN (content delivery network).** Edge servers that cache content close to users (Chapter 4).

**Chaos engineering.** Deliberately injecting failures, such as stopping servers, to prove that a system survives them (Chapter 14).

**Circuit breaker.** A wrapper that stops calling a failing dependency for a while (Chapter 14).

**Compaction.** Merging storage files and discarding overwritten or deleted values (Chapter 7).

**Consensus.** Agreement among nodes on a value despite failures, as in Paxos and Raft (Chapter 8).

**Consistent hashing.** Placing keys and nodes on a ring so adding a node moves about 1/N of keys (Chapter 9).

**Count-Min sketch.** A fixed-size structure that estimates item frequencies, never underestimating (Chapter 13).

**CRDT.** A conflict-free replicated data type: replicas converge without coordination (Chapter 34).

**Cursor pagination.** Fetching "items after this one" instead of by page number (Chapter 4).

**Dead-letter queue.** Where messages go after repeated processing failures (Chapter 10).

**Double-entry bookkeeping.** Recording every transfer as two entries that sum to zero (Chapter 29).

**Erasure coding.** Storing data as fragments plus parity, surviving lost fragments with less overhead than full copies (Chapter 26).

**Error budget.** The amount of failure an SLO allows (Chapter 15).

**Eventual consistency.** Replicas agree eventually if writes stop (Chapter 8).

**Fan-out.** Delivering one event to many recipients, on write or on read (Chapter 22).

**Fencing token.** An increasing number that lets a resource reject requests from an outdated lease holder (Chapter 32).

**Geohash.** A string encoding of a location in which nearby points usually share a prefix (Chapter 27).

**Hinted handoff.** Storing a write temporarily on another node until the intended replica returns (Chapter 18).

**Hot key.** A key that receives a disproportionate share of traffic (Chapters 6 and 9).

**HyperLogLog.** An estimator for the number of distinct items, using a few kilobytes (Chapter 13).

**Idempotency key.** A client-supplied ID that makes retries of an operation safe (Chapters 4 and 29).

**Lease.** Time-limited ownership of a resource or job, renewed by heartbeats (Chapter 32).

**Little's law.** Items in a system = arrival rate × time in the system (Chapter 3).

**LSM-tree.** A log-structured merge tree: writes to memory, flushed to sorted files, merged by compaction (Chapter 7).

**Merkle tree.** A tree of hashes used to find differences between datasets efficiently (Chapter 18).

**Monotonic clock.** A clock that never goes backwards, used to measure durations; wall-clock time can jump (Chapter 12).

**Object storage.** Storage of immutable blobs by key, built for durability and capacity (Chapter 7).

**Offset.** A message's position in a log partition (Chapters 10 and 35).

**Operational transformation (OT).** Rewriting concurrent edits so all replicas converge (Chapter 34).

**Optimistic concurrency control.** Updating only if a version is unchanged since it was read (Chapter 30).

**Outbox pattern.** Writing events to a table in the same transaction as data changes, then publishing them (Chapter 10).

**PACELC.** Even without partitions, systems trade latency against consistency (Chapter 8).

**Partition (shard).** A subset of data stored on its own node or group of nodes (Chapter 9).

**Percentile (p99).** The value below which 99% of measurements fall (Chapter 15).

**Postmortem.** A written, blameless analysis of an incident: what happened, why it spread, and what will change (Chapter 37).

**Quorum.** The number of replicas that must respond for a read (R) or write (W) to succeed (Chapter 8).

**Rate limiter.** A component that caps requests per client per period (Chapter 11).

**Read repair.** Fixing stale replicas when a read notices them (Chapter 18).

**Replication lag.** How far a follower is behind its leader (Chapter 8).

**SLI, SLO, SLA.** Service level indicator (a measurement), objective (a target), agreement (a contract) (Chapter 15).

**Snowflake ID.** A 64-bit, time-ordered ID made of timestamp, machine and sequence bits (Chapter 12).

**Staged rollout (canary).** Releasing a change to a small part of the system first and expanding only while health checks pass (Chapter 37).

**Stateless service.** A service that keeps no request-to-request state in its own memory (Chapter 5).

**Thundering herd (stampede).** Many requests missing a cache at once and overloading the source (Chapter 6).

**Token bucket.** A rate limiter that refills tokens at a fixed rate and allows bounded bursts (Chapter 11).

**Vector clock.** Per-node counters that reveal whether versions are ordered or concurrent (Chapter 12).

**Virtual nodes.** Multiple ring positions per physical node to spread load evenly (Chapter 9).

**WebSocket.** A persistent, two-way connection between client and server (Chapter 4).
