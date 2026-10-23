# Chapter 38: Common Mistakes and How to Recover

Interviewers see the same mistakes again and again. Most are not gaps in knowledge but habits under pressure, which means they can be fixed with practice. Here are the most common ones, what they look like from the interviewer's side, and how to recover if you catch yourself making one mid-interview.

## 1. Designing Before Understanding

**What it looks like:** drawing a load balancer and three databases thirty seconds after hearing the prompt.

**Why it hurts:** you may design the wrong system, and you lose the chance to show product judgment.

**Recovery:** stop and say, "Let me step back and confirm the requirements before I go further." Interviewers respect the correction far more than they penalize the false start.

## 2. Estimates That Go Nowhere

**What it looks like:** five minutes of arithmetic, then a design that would be identical with numbers a thousand times larger or smaller.

**Recovery:** after each estimate, say what it implies: "So it's read-heavy, so caching matters most." If you realize later that a number should change a decision, go back and change it, out loud.

## 3. Buzzword Architecture

**What it looks like:** "We'll use Kafka, Redis, Cassandra and Kubernetes," with no explanation of what each solves.

**Why it hurts:** naming a technology isn't the same as understanding it, and interviewers will ask "why?"

**Recovery:** describe the mechanism and the need first ("we need a durable, partitioned log so several consumers can read the same events"), then name an example technology if useful.

## 4. Over-Engineering

**What it looks like:** microservices, multi-region active-active replication and a service mesh for a system with 100 requests per second.

**Recovery:** start simple and say how you'd evolve: "One database handles this load comfortably; if writes grow tenfold, I'd partition by user ID." Simplicity justified by numbers is a senior signal.

## 5. Going Deep Too Early

**What it looks like:** twenty minutes on the database schema, and no time left for the rest of the system.

**Recovery:** watch the clock. At about 25 minutes, make sure a complete high-level design is on the board. If you notice you're stuck in a detail, say, "Let me finish the overall design and come back to this."

## 6. Ignoring Failures

**What it looks like:** a design in which nothing ever goes wrong.

**Recovery:** in the wrap-up, walk through the main components and ask yourself, out loud, "What if this fails?" For each: redundancy, timeouts and retries, graceful degradation. Chapter 14 is your checklist.

## 7. One-Sided Answers

**What it looks like:** "We should use NoSQL" with no alternative or downside.

**Recovery:** for every important decision, name at least one alternative and the trade-off: "A relational database gives us transactions; a wide-column store gives cheaper writes at this volume. Since messages need no cross-row transactions, I'd choose the wide-column store."

## 8. Not Listening

**What it looks like:** the interviewer says "let's assume the cache can fail" and the candidate continues with their plan.

**Why it hurts:** hints and constraints are the interviewer steering you toward what they want to evaluate. Ignoring them wastes the interview.

**Recovery:** when a hint comes, follow it, even if you planned something else: "Good point, let's look at cache failure now."

## 9. Silence

**What it looks like:** long pauses while the candidate thinks privately.

**Recovery:** think out loud, even when unsure: "I'm deciding between pushing to followers and pulling at read time. Push makes reads fast but..." The interviewer can only evaluate reasoning they hear.

## 10. Bluffing

**What it looks like:** confidently describing how a technology works, incorrectly.

**Recovery:** say what you know and reason from principles: "I haven't operated that database. If it's log-structured, I'd expect fast writes and reads that may touch several files." Honest reasoning is always better than a confident mistake that the interviewer has to correct.

## A Recovery Phrasebook

| Situation | What to say |
| --- | --- |
| You started drawing too early | "Let me step back and confirm the requirements first." |
| You're stuck | "Here's what I'm considering and what's blocking me..." |
| You realize an earlier choice was wrong | "Given this new constraint, I'd change my earlier choice, because..." |
| You don't know a technology | "I'm not sure how that system implements it; from first principles, I'd expect..." |
| Time is running out | "Let me summarize the full design, then the two things I'd do next." |

## Key Takeaways

- Most mistakes are habits under pressure: rushing, over-building, going too deep, staying silent.
- Every mistake is recoverable if you name it and correct course out loud.
- Justify every component, consider failures, and present alternatives.
- Follow the interviewer's hints; they show you what is being evaluated.
