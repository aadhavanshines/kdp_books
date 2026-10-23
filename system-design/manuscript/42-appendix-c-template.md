# Appendix C: One-Page Design Template

Use this template to practice, and keep it in your head during interviews. The times are for a 45-minute round.

## 1. Requirements (5 minutes)

- **Users and core actions:** three to five functional requirements, phrased as user actions.
- **Out of scope:** say it explicitly.
- **Scale:** users, daily active users, data volume.
- **Latency:** which operations must be fast?
- **Consistency:** where is stale data acceptable, and where not?
- **Durability and availability:** what must never be lost; what must never be down?
- **Geography:** one region or global?

## 2. Estimates (3 to 5 minutes)

- Reads and writes per second, average and peak.
- Storage over the data's lifetime, with replication.
- Bandwidth for large objects.
- Memory for caches; connections for real-time features.
- **One sentence on what the numbers imply.**

## 3. API (3 minutes)

- Main endpoints or functions, with key parameters and responses.
- Cursor pagination; idempotency keys for writes; authentication.

## 4. Data Model (2 to 3 minutes)

- Main entities and key fields.
- Access patterns, and the store chosen for each.
- Partition key, if partitioned.

## 5. High-Level Design (10 minutes)

- Five to ten boxes: clients, load balancer, services, stores, caches, queues, CDN.
- **Trace one read and one write end to end.**

## 6. Deep Dives (12 to 15 minutes)

For each of the two or three hardest parts:

1. The problem, with numbers.
2. Two or three options.
3. The comparison on the requirements that matter.
4. The choice, and what you'd monitor.

Common deep dives: hot keys, fan-out, consistency and conflicts, idempotency, ordering, failover, cache invalidation, rate limiting, search and ranking.

## 7. Wrap-Up (3 to 5 minutes)

- **Bottlenecks** at ten times the traffic.
- **Failure modes:** each major component and a region.
- **Observability:** what you'd measure and alert on.
- **Security and privacy:** authentication, authorization, encryption, sensitive data.
- **Next steps:** what you'd build or improve with more time.

## Questions to Ask Yourself When Stuck

- What's the read/write ratio, and what does it imply?
- Does the data fit on one machine? In memory?
- What's the hottest key, and what happens to it?
- What happens if this component is slow? If it's down?
- Where can I make it asynchronous?
- What must be strongly consistent, and what can be eventual?
- Which operations need to be idempotent?
