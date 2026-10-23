# Introduction

A system design interview starts with a sentence like "Design a chat app" or "Design a service that shortens links." There is no single right answer, no compiler, and no test that passes or fails. For 45 minutes you and an experienced engineer sketch a system that could serve millions of people, and talk through the choices: where the data lives, what happens when a machine dies, how the system grows when traffic grows tenfold.

For many engineers, this is the most intimidating interview of all. Coding questions can be practiced by solving hundreds of problems; system design feels open-ended, and it's often the round that decides the level of an offer, and with it the salary. This book is designed to make it learnable.

## What Makes This Book Different

**A method, not a list of answers.** Interviewers rarely ask exactly the design you memorized, and they change the requirements halfway through. Chapter 2 gives a step-by-step framework for any design question, and every worked design in Part III follows it, so by the end of the book the framework is a habit.

**Every building block is real, tested code.** Most system design books describe ideas such as consistent hashing, quorums, rate limiters and Bloom filters in words and diagrams. Here, each one is also a short Python model you can run, and each model is tested: on Python 3.12, 3.13, 3.14 and 3.15, usually against a simpler version on thousands of random inputs. The outputs printed in this book were produced by running that code. When the book says that adding a server to a consistent-hashing ring moves about 9% of keys while a naive scheme moves 91%, that's a measurement, not a claim.

**Every estimate is computed.** Each worked design starts with back-of-the-envelope numbers. They are computed by the same small helper functions you'll learn in Chapter 3, so they are consistent and checkable, and you can change an assumption and rerun them.

**Twenty complete designs.** Part III works through twenty common interview prompts, from a link shortener to a payment system and a collaborative editor, each with requirements, estimates, an API, a data model, a high-level diagram, deep dives, trade-offs and the follow-up questions interviewers like to ask.

**Practice like the real thing.** Part IV contains four full mock interviews, written as conversations between candidate and interviewer, with the interviewer's notes at the end of each.

**Real stories, checked.** Systems are easier to understand when you see them fail. Throughout the book, **Real-World Story** and **Interesting Fact** boxes connect each idea to something that actually happened: a famous outage, a published design, a surprising number. Chapter 37 retells eight well-known outages in depth. Every story is taken from the company's own postmortem, paper or public statement, and the sources are listed in Appendix F.

**Interesting Fact:** When Facebook agreed to buy Instagram in April 2012 for about $1 billion, the app had around 30 million users and a team of just 13 people. Small teams can run very large systems when the design is simple and built from well-understood building blocks, which is what this book teaches.

## How the Book Is Organized

- **Part I, The Interview and the Method:** what the interview tests, a framework for 45 minutes, estimation, and the networking and API basics every design relies on.
- **Part II, Building Blocks:** load balancing, caching, databases and storage engines, replication, partitioning, queues and logs, rate limiting, IDs and time, probabilistic data structures, reliability patterns, and observability and security.
- **Part III, Twenty Worked Designs.**
- **Part IV, Practice:** four mock interviews, lessons from eight real outages, the common mistakes and how to recover from them, and study plans.
- **Appendices:** the numbers every designer should know, a building-block reference, a one-page design template, an index of the designs, a glossary, and the sources for the real-world stories.

## How to Use the Code

You don't need to run the code to follow the book; every listing is short, explained in the text, and shown with its output. But running and changing it is the fastest way to build intuition. Change the number of virtual nodes in the hashing ring, or the quorum sizes, and watch what happens. All models use only Python's standard library.

> **Note:** The models are teaching tools that capture the essential behavior of each technique in a few dozen lines. Production systems add networking, persistence, monitoring and many edge cases. The book points out the most important differences as they come up.

## A Note on Companies, Products and Dates

The book refers to companies such as Google, Meta and Amazon when describing interviews, and to widely used technologies such as Redis, Kafka and PostgreSQL when describing building blocks. Where a company publishes its own guidance, the book relies on it and says so; where information comes from candidates' reports, the book says that too. The designs in Part III are generic teaching designs, not descriptions of any company's internal systems. The Real-World Story and Interesting Fact boxes, and Chapter 37, retell events that companies have described publicly, using their own postmortems, papers and statements, listed in Appendix F; they are told without blame and claim nothing beyond what was published. Interview formats change, so always confirm the details with your recruiter. The descriptions in this book reflect what was published as of **October 2026**.

If you have read *The Coding Interview Playbook*, you will recognize the structure: the same emphasis on method, on testing, and on explaining your thinking out loud. If you haven't, nothing in this book depends on it.

Let's begin with what the interviewer is actually looking for.
