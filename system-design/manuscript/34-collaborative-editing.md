# Chapter 34: Collaborative Document Editing

**The prompt:** "Design a collaborative document editor where several people edit the same document at the same time and see each other's changes live."

The defining problem is **concurrent edits**: two people type at the same moment in different places, or the same place, and both must end up with exactly the same document, without locking anyone out.

## Requirements

**Functional:**

1. Several users edit a document simultaneously; changes appear for everyone within a fraction of a second.
2. Everyone converges on the same final text.
3. Show other users' cursors; keep version history.
4. Edits made offline sync when the user reconnects (a follow-up).

**Non-functional:**

- Millions of documents open at once; typically a few editors per document, occasionally hundreds.
- Local typing must feel instant, without waiting for the server.

## Estimates

```
@include code/ch34/estimate.demo.txt
```

Tens of millions of small operations per second in total, but each document's traffic is tiny and independent. That's the key to scaling: **partition by document**.

## High-Level Design

![Collaborative editing: each client applies its own edits immediately and sends operations over a WebSocket to the document's session server, which transforms them against concurrent operations, assigns an order, broadcasts them and appends them to the operation log.](images/diagram-collab.png)

- Each open document is assigned to one **session server** (by consistent hashing on the document ID). All editors of that document connect to it over WebSockets.
- Clients apply their own edits immediately and send **operations** ("insert 'h' at position 1").
- The session server establishes one order of operations, transforms concurrent ones, broadcasts them, and appends them to an **operation log**.
- Periodic **snapshots** of the document let new editors load quickly without replaying the entire log, and serve as version history.

## Deep Dive 1: Why Concurrent Operations Need Transforming

Start with "cat". User 1 inserts "h" at position 1 ("chat"); at the same moment, user 2 deletes position 2, the "t" ("ca"). If user 1 then applies user 2's operation unchanged, it deletes position 2 of "chat", which is now "a":

```
@include code/ch34/d01_ot.demo.txt
```

User 1 would see "cht" while user 2 sees "cha". **Operational transformation** (OT), introduced by Ellis and Gibbs in 1989, rewrites each incoming operation to account for the concurrent ones already applied: since user 1's insert came before position 2, user 2's delete must shift to position 3.

```python
@include code/ch34/d01_ot.py::transform
```

The four cases are insert-insert (shift if the other insert came first; break ties by site ID), insert-delete, delete-insert, and delete-delete (deleting the same character twice becomes a no-op). The test generates 20,000 random pairs of concurrent operations on random short texts and checks that both sites always converge.

This model handles two concurrent operations. Full OT systems handle long sequences of concurrent operations by having the server define a single order and transform each incoming operation against everything the client hadn't seen; that's where most of the complexity, and many of the historical bugs, of OT lives.

## Deep Dive 2: OT or CRDTs?

**CRDTs** (conflict-free replicated data types, formalized by Shapiro and colleagues in 2011) take a different approach: every character gets a unique, ordered identifier, so concurrent inserts and deletes commute by construction and replicas converge without a central server transforming operations.

| | OT | CRDT |
| --- | --- | --- |
| Needs a central server | Typically yes, to order operations | No; works peer to peer and offline |
| Metadata | Small | Per-character identifiers; larger documents |
| Offline editing | Harder | Natural |
| Track record | Long, in centralized editors | Growing, especially for local-first apps |

For a centralized editor with a server per document, OT is a natural fit. For offline-first or peer-to-peer collaboration, CRDTs are the usual choice. Naming the trade-off is what interviewers look for.

**Real-World Story:** Figma's engineering blog explained in 2019 why its multiplayer editing doesn't use operational transformation: OT was designed for text, and a design file is a tree of objects with properties. Instead, a server process per document holds the authoritative copy, and if two people change the same property of the same object at the same time, the last change the server receives wins. The approach borrows ideas from CRDTs while keeping a server in charge. Choosing the simplest model that fits your data is a design decision worth saying out loud.

## Deep Dive 3: Session Servers and Persistence

- **One owner per document** keeps ordering simple. If the session server fails, clients reconnect, a new server loads the latest snapshot plus the log, and clients resend unacknowledged operations, deduplicated by operation ID.
- **Popular documents** with hundreds of editors still fit on one server; documents viewed by thousands can stream updates through a separate read-only fan-out.
- **Cursors and presence** are ephemeral messages, not stored in the log.

## Wrap-Up

- **History:** snapshots plus the operation log give version history and undo for free.
- **Permissions:** checked when joining the session and on every operation.
- **Rich text:** formatting is an additional attribute on ranges, with its own transformation rules.

## Follow-Up Questions

- "Offline editing for hours." Buffer operations locally; on reconnect, transform them against everything that happened meanwhile, or use a CRDT.
- "Comments anchored to text." Anchor to stable positions that move with edits (transformed like cursors).
- "Search across documents." Index snapshots asynchronously.

## Key Takeaways

- Clients apply their own edits instantly and exchange operations; everyone must converge.
- Operational transformation rewrites concurrent operations so they apply correctly; ties need a deterministic rule.
- CRDTs converge without a central server and suit offline editing; OT suits centralized editors.
- Partition by document: one session server per document orders its operations.
