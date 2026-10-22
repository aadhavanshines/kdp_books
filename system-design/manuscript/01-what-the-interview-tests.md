# Part I: The Interview and the Method

# Chapter 1: What the System Design Interview Tests

In a coding interview, the interviewer can check your answer against a known solution. In a system design interview, they can't, because there isn't one. A good design for a startup's first million users is a bad design for a company with a billion, and both can be defended. So the interviewer isn't grading the design itself. They are grading how you got there: the questions you asked, the numbers you estimated, the trade-offs you saw, and how you responded when they pushed back.

This chapter explains what that means in practice, how the interview is scored at different levels, and what large companies say about it.

## The Format

Most system design interviews follow the same shape:

- **About 45 to 60 minutes**, in person on a whiteboard or remotely with a shared drawing tool.
- **One open-ended prompt**, usually a product you know: "Design a news feed", "Design a ride-sharing service", "Design a rate limiter."
- **A conversation, not a presentation.** The interviewer answers questions, adds constraints ("now make it work across three regions"), and chooses where to go deep.
- **Little or no code.** You may be asked to write an API signature, a schema or a short piece of pseudocode, but the focus is architecture.

Some companies run a variant focused on product and APIs rather than infrastructure. Candidates describe Meta's design rounds, for example, as either a "system design" round, centered on backend infrastructure, or a "product architecture" round, centered on APIs, data models and client-server interaction for a user-facing product. Both use the same skills; the emphasis differs. Ask your recruiter which one you'll get.

## Who Gets a System Design Interview

The round is usually part of the loop for mid-level engineers and above, and it carries more weight the more senior the role. Amazon is unusually explicit: its interview prep page for senior software engineers (SDE III) says that half of the interview time is spent on Leadership Principles questions and the other half on coding problems and system design. Candidates report similar patterns elsewhere: a design round or two for mid-level and senior roles, and often none for new graduates, who may get an extra coding round instead.

Because the design round often decides the level of an offer, it's worth preparing for even if you are early in your career. A mid-level candidate who designs like a senior one can be hired at the higher level.

## What Interviewers Evaluate

Rubrics differ between companies, but the same five areas appear everywhere:

| Area | What strong looks like | What weak looks like |
| --- | --- | --- |
| **Problem exploration** | Asks about users, scale and the most important features; agrees on scope before drawing | Starts drawing boxes immediately; designs features nobody asked for |
| **Estimation** | Turns requirements into numbers (requests per second, storage) and uses them to choose a design | Skips numbers, or computes them and never uses them |
| **Architecture** | A clear, simple high-level design; explains how one request flows through it | A diagram full of fashionable components with no explanation of why each is there |
| **Depth and trade-offs** | Goes deep on the hardest part; compares at least two options and explains the choice | Names technologies instead of explaining mechanisms; "we'll use Kafka" with no reason |
| **Communication** | Drives the conversation, checks in with the interviewer, adapts to new constraints | Monologues; ignores hints; argues instead of reasoning |

> **Interviewer's View:** The most common reason strong engineers fail this round isn't a lack of knowledge. It's a lack of structure: they spend 20 minutes on one detail, run out of time, and never show a complete design. The framework in Chapter 2 exists to prevent exactly that.

## How Expectations Change With Level

The same prompt is graded differently depending on the level you're interviewing for:

- **Mid-level:** a working, sensible design with a clear data model and API, correct use of common building blocks (load balancers, caches, a database, a queue), and reasonable answers when asked about scale. The interviewer may lead the deep dives.
- **Senior:** you drive. You identify the hardest parts yourself, quantify them, compare alternatives, and discuss failure modes: what happens when a node, a region or a dependency fails. You know where the bottlenecks will appear as traffic grows.
- **Staff and above:** everything above, plus judgment about the broader picture: operational cost, team boundaries, migration from an existing system, how to roll out safely, and what not to build. Breadth across the whole system and depth in two or three areas.

## What Companies Say

Companies publish less about system design than about coding interviews, so treat any detailed description of "the format at company X" with care.

| Company | What is published or reported | Type of source |
| --- | --- | --- |
| Amazon | For senior software engineers, half of the interview time goes to Leadership Principles and half to coding and system design | Amazon's SDE III interview prep page |
| Meta | Design rounds described as "system design" or "product architecture", about 45 minutes, depending on role and level; select roles also include an AI-assisted coding round | Candidate reports and preparation guides; Meta's hiring page (AI-assisted round) |
| Google | Design rounds of about 45 minutes, mainly for mid-level and senior candidates; feedback reviewed by a hiring committee | Candidate reports; Google's general candidate guidance to think out loud, clarify and discuss trade-offs |

Across all of them, the advice converges: clarify before you design, think out loud, use numbers, and discuss trade-offs honestly.

## Key Takeaways

- System design interviews grade your process: exploration, estimation, architecture, trade-offs and communication.
- There's no single right answer; a defensible design with clear reasoning beats a fashionable one.
- Expectations rise with level: seniors drive the conversation and discuss failure modes; staff engineers add cost, operations and rollout.
- Ask your recruiter whether your round is infrastructure-focused or product-focused.

## Sources

- Amazon, "SDE III Interview Prep", amazon.jobs (half Leadership Principles, half coding and system design).
- Meta Careers, hiring process page (authorized AI assistant for select roles); descriptions of design rounds are from candidates' reports and preparation guides published in 2025 and 2026.
- Google, "Preparing for Google technical internship interviews" (candidate guide: think out loud, clarify, state assumptions, discuss trade-offs); descriptions of design rounds are from candidates' reports.
