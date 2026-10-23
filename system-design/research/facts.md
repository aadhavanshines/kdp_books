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

## Real-world stories and facts (checked 23 October 2026)

Each story in a "Real-World Story" or "Interesting Fact" box, and in Chapter 37, comes from the company's own postmortem or statement where one exists, otherwise from contemporary reporting. Only figures confirmed by the source are used; uncertain figures (GitLab's data size, the exact Ticketmaster user count) are left out.

- AWS S3, us-east-1, 28 Feb 2017: an authorized engineer following a playbook mistyped an input to a command meant to remove a few billing servers; too many servers were removed, including the index and placement subsystems; recovery finished 1:54 PM PST. AWS changed the tool to remove capacity slowly and refuse to go below minimum capacity. Source: AWS, "Summary of the Amazon S3 Service Disruption in the Northern Virginia (US-EAST-1) Region", aws.amazon.com/message/41926.
- GitHub, 21 Oct 2018: maintenance replacing failing 100G optical equipment cut the East Coast hub from the primary data center for 43 seconds; automated MySQL failover moved writes to the West Coast; writes on both sides diverged; 24 hours 11 minutes of degraded service; GitHub chose data integrity over fast recovery. Source: GitHub blog, "October 21 post-incident analysis", 30 Oct 2018.
- Cloudflare, 2 Jul 2019: one WAF rule with a regular expression that backtracked excessively, deployed globally at once, pushed CPU to 100% worldwide for about 27 minutes. Source: Cloudflare blog (John Graham-Cumming), 12 Jul 2019; secondary coverage.
- Facebook, 4 Oct 2021: a command during routine maintenance, meant to assess backbone capacity, took down all backbone connections; an audit tool bug failed to stop it; DNS servers then withdrew their BGP routes, making Facebook unreachable for about six hours. Source: engineering.fb.com, "More details about the October 4 outage", 5 Oct 2021.
- Roblox, 28-31 Oct 2021: 73-hour outage; a newly enabled Consul streaming feature caused contention under load, combined with a BoltDB performance problem; monitoring depended on the same Consul cluster. Source: Roblox blog, "Roblox Return to Service 10/28-10/31 2021".
- Fastly, 8 Jun 2021: a bug deployed on 12 May was triggered by one customer's valid configuration change; 85% of the network returned errors; detected within a minute; 95% of the network normal within 49 minutes. Source: Fastly blog, "Summary of June 8 outage".
- Knight Capital, 1 Aug 2012: new router code reused a flag; one server still ran old code; more than 4 million orders in 45 minutes while trying to fill 212 customer orders; losses over $460 million; 97 warning emails before the open went unread. Source: SEC press release 2013-222 and order, Oct 2013.
- GitLab, 31 Jan 2017: during work on lagging replication, data was accidentally removed from the primary database; database changes from about six hours were lost (about 5,000 projects, 5,000 comments, 700 users); several backup methods turned out not to work. Source: GitLab blog, "Postmortem of database outage of January 31", 10 Feb 2017.
- YouTube, Dec 2014: "Gangnam Style" passed 2,147,483,647 views, the 32-bit signed maximum; YouTube had already moved the counter to a 64-bit integer. Source: YouTube's Google+ post and statement to the press, reported by BBC and others, Dec 2014.
- Pokemon GO, July 2016: teams planned for 1x traffic with a worst case of 5x; actual traffic reached 50x the target, ten times the worst case. Source: Google Cloud blog (Luke Stone), "Bringing Pokemon GO to life on Google Cloud", Sep 2016.
- Ticketmaster, 15 Nov 2022 presale: 3.5 billion total system requests, four times the previous peak, from bots and fans without invite codes; more than 2 million tickets sold that day. Source: Ticketmaster statement, Nov 2022, as reported widely.
- Cloudflare, 1 Jan 2017 leap second: RRDNS (Go) computed a negative duration because the wall clock went backwards; up to about 0.2% of DNS queries affected; fixed by treating values <= 0 as invalid. Source: Cloudflare blog, "How and why the leap second affected Cloudflare DNS".
- Leap second, 30 Jun 2012: a Linux kernel timer bug triggered by the leap second caused high CPU or hangs; Reddit, Mozilla, LinkedIn and the Amadeus reservation system (Qantas check-in) were affected. Source: The Register, 2 Jul 2012, and other contemporary reports.
- WhatsApp, Jan 2012: "over 2 million TCP connections on a single box" (FreeBSD, Erlang). Source: WhatsApp blog, "1 million is so 2011".
- Discord, 2023: messages grew from 12 Cassandra nodes (2017, billions of messages) to 177 nodes (2022, trillions); migrated to 72 ScyllaDB nodes; p99 for historical messages from 40-125 ms to about 15 ms; data services coalesce identical concurrent requests. Source: Discord blog, "How Discord Stores Trillions of Messages", Mar 2023.
- Facebook memcache, NSDI 2013: billions of requests per second, trillions of items; leases address stale sets and thundering herds. Source: Nishtala et al., "Scaling Memcache at Facebook", NSDI 2013.
- CrowdStrike, 19 Jul 2024: a faulty sensor configuration update crashed about 8.5 million Windows devices, less than 1% of Windows machines. Source: Microsoft blog (David Weston), 20 Jul 2024.
- Slack, 4 Jan 2021, the first working day of the year: traffic returning after the holidays saturated AWS Transit Gateways; packet loss, then provisioning limits; Slack's own dashboards were affected. Source: slack.engineering, "Slack's outage on January 4th 2021".
- Twitter timelines (2012-2013 talks by Raffi Krikorian): about 300K timeline reads per second; tweets fanned out to follower timelines in memory, with very large accounts exempted and merged at read time. Source: QCon SF 2012, "Timelines at Scale"; InfoQ.
- Dynamo, SOSP 2007: the shopping cart must accept adds "even if disks are failing, network routes are flapping, or data centers are being destroyed by tornados". Source: DeCandia et al.
- Stripe idempotency keys. Source: Stripe blog, "Designing robust and predictable APIs with idempotency" (Brandur Leach).
- Netflix Chaos Monkey: "randomly disables our production instances". Source: Netflix tech blog, "The Netflix Simian Army", July 2011.
- Uber H3: hexagonal hierarchical index, open-sourced 2018; hexagon neighbors are all the same distance apart. Source: Uber blog (Isaac Brodsky), "H3: Uber's Hexagonal Hierarchical Spatial Index", June 2018.
- Figma multiplayer: one server process per document; CRDT-inspired but centralized; last write to a property wins; OT not used because Figma is not a text editor. Source: Figma blog (Evan Wallace), Oct 2019.
- Akamai uses a Bloom filter so objects are cached only on their second request, because most objects are requested only once ("one-hit wonders"). Source: Maggs and Sitaraman, "Algorithmic Nuggets in Content Delivery", SIGCOMM CCR 2015. The book says "most", not a precise share.
- Reddit view counts (2017) use HyperLogLog; the Redis implementation uses at most 12 KB per counter, standard error 0.81%. Source: Reddit blog, "View Counting at Reddit", May 2017; Redis documentation.
- Google, 2006: a test of 30 results per page instead of 10 cut searches by about 20%; the slower page (about 0.9 s vs 0.4 s) was blamed, though other changes were made at the same time. Source: Marissa Mayer, Web 2.0 Summit 2006, as reported; caveat from Kohavi, Tang and Xu, "Trustworthy Online Controlled Experiments".
- Atlassian, 5 Apr 2022: a script meant to delete a legacy app was given site IDs; 883 sites (775 customers) deleted; restoration up to 14 days; at most five minutes of data lost. Source: Atlassian post-incident review.
- Dyn, 21 Oct 2016: DDoS from Mirai-infected devices (tens of millions of IP addresses) on Dyn's DNS made Twitter, GitHub, Netflix, Reddit and others unreachable for many users. Source: Dyn statements; contemporary reporting.
- Instagram, Apr 2012: acquired for about $1 billion with 13 employees and about 30 million users. Source: CNN Money and others.
- Google, July 2008: "1 trillion unique URLs" known (not indexed), growing by several billion pages a day. Source: Official Google Blog, "We knew the web was big".
- Google autocomplete reduces typing by about 25% and saves over 200 years of typing per day (Google's estimate). Source: Google blog, "How Google autocomplete works in Search", 2018.
- YouTube: more than 500 hours of video uploaded every minute (YouTube, 2019). Source: Tubefilter, May 2019.
- Netflix Open Connect: appliances placed inside ISP networks at no charge to qualifying ISPs (launched 2012). Source: Netflix Open Connect overview.
- Spanner TrueTime: GPS and atomic clocks keep clock uncertainty generally under 10 ms; commits wait out the uncertainty. Source: Corbett et al., OSDI 2012.

## Originality
No text, figures or problem lists are copied from other system-design books or courses. Common design prompts (link shortener, chat, news feed) are standard industry exercises; all requirements, numbers, diagrams, deep dives and code are the book's own.
