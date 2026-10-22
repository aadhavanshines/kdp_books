# Research log: The System Design Interview Playbook (checked October 2026)

Policy: official company guidance is cited as such; everything else about interview formats is labeled "candidates report". Designs in the book are generic teaching designs, not descriptions of any company's real systems, unless a published source (paper, engineering post) is named. All designs, wording, numbers in worked estimates and diagrams are the book's own. Readers are told formats change and to confirm with their recruiter.

## Interview formats
- Amazon, amazon.jobs "SDE III Interview Prep" (confirmed via search snippet, October 2026): "Half of the time will be spent on questions that focus on our Leadership Principles and the other half will be spent on coding problems and system design." The page could not be fetched directly from the build environment; the quote is from search results.
- Meta: the hiring process page confirms an authorized AI assistant in CoderPad for select roles (checked for Book 7). Design-round details (system design vs "product architecture", round count by level, about 45 minutes) come from third-party guides and candidate reports; label as reported.
- Google: no official system-design page found. Third-party guides report about 45-minute design rounds, mainly for mid-level and senior candidates, and hiring committee review. Label as reported. Google's candidate guide (services.google.com, 2018) advice: think out loud, clarify, state assumptions, discuss trade-offs.

## Foundational sources (well established; cited by title, authors, venue, year)
- Consistent hashing: Karger, Lehman, Leighton, Panigrahy, Levine, Lewin, "Consistent Hashing and Random Trees", STOC 1997.
- Dynamo: DeCandia et al., "Dynamo: Amazon's Highly Available Key-value Store", SOSP 2007 (consistent hashing with virtual nodes, sloppy quorum, hinted handoff, vector clocks, Merkle trees for anti-entropy).
- Bigtable: Chang et al., OSDI 2006. GFS: Ghemawat, Gobioff, Leung, SOSP 2003. MapReduce: Dean and Ghemawat, OSDI 2004.
- Kafka: Kreps, Narkhede, Rao, "Kafka: a Distributed Messaging System for Log Processing", NetDB 2011.
- Spanner: Corbett et al., OSDI 2012 (TrueTime).
- Raft: Ongaro and Ousterhout, "In Search of an Understandable Consensus Algorithm", USENIX ATC 2014. Paxos: Lamport, "The Part-Time Parliament", ACM TOCS 1998.
- Logical clocks: Lamport, "Time, Clocks, and the Ordering of Events in a Distributed System", CACM 1978.
- CAP: Brewer, PODC 2000 keynote; proof by Gilbert and Lynch, SIGACT News 2002. PACELC: Abadi, IEEE Computer 2012.
- B-tree: Bayer and McCreight, 1972. LSM-tree: O'Neil, Cheng, Gawlick, O'Neil, Acta Informatica 1996.
- Bloom filter: Bloom, CACM 1970. Count-Min sketch: Cormode and Muthukrishnan, 2005. HyperLogLog: Flajolet, Fusy, Gandouet, Meunier, 2007.
- Little's law: Little, Operations Research 1961 (L = lambda W).
- Exponential backoff with jitter: Marc Brooker, AWS Architecture Blog, "Exponential Backoff And Jitter", 2015. Circuit breaker pattern: Michael Nygard, "Release It!", 2007.
- CRDTs: Shapiro, Preguica, Baquero, Zawirski, 2011. Operational transformation: Ellis and Gibbs, SIGMOD 1989.
- Geohash: Gustavo Niemeyer, 2008 (public domain).
- Snowflake IDs: announced by Twitter in June 2010; 64 bits = 1 unused sign bit, 41-bit millisecond timestamp from a custom epoch, 10-bit machine ID, 12-bit sequence (4,096 IDs per millisecond per machine; about 69 years of timestamps). Sources: Wikipedia "Snowflake ID" and implementations.
- UUIDv7: RFC 9562 (2024), 48-bit Unix millisecond timestamp in the high bits, then version and variant bits and random bits; sortable by creation time across milliseconds.
- HTTP/3: RFC 9114 (2022); QUIC: RFC 9000 (2021). WebSocket: RFC 6455 (2011).
- Latency numbers: "Latency numbers every programmer should know", popularized by Jeff Dean and Peter Norvig (about 2009-2012). The book uses them only as orders of magnitude, with the warning that hardware changes the exact values.

## Originality
No text, figures or problem lists are copied from other system-design books or courses. Common design prompts (link shortener, chat, news feed) are standard industry exercises; all requirements, numbers, diagrams, deep dives and code are the book's own.
