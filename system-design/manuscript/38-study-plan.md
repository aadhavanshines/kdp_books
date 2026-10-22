# Chapter 38: Your Study Plan

System design skill grows from two things: understanding the building blocks well enough to explain why they work, and practicing complete designs out loud often enough that the framework becomes automatic. These plans combine both. Adjust them to the time you have; they assume an hour or two on weekdays and a longer session on the weekend.

## How to Practice a Design

1. **Pick a prompt** from Part III or from the list below, and read only the prompt.
2. **Set a timer for 40 minutes** and design out loud, on paper or in a drawing tool, following the seven steps of Chapter 2.
3. **Compare** with the worked design: did you ask the important questions? Did your estimates point to the same bottlenecks? Did you find the hard part?
4. **Write down** the one or two things you missed, and revisit them a week later.
5. **Run the code** for the building blocks you're least sure about, and change a parameter to see what happens.

## The Two-Week Plan

| Days | Focus |
| --- | --- |
| 1 | Chapters 1 to 3: what's evaluated, the framework, estimation |
| 2 | Chapters 5 and 6: scaling out, caching |
| 3 | Chapters 7 and 8: databases, replication |
| 4 | Chapters 9 and 10: partitioning, queues |
| 5 | Practice: Link Shortener (Chapter 16), timed |
| 6 | Chapters 11 and 14: rate limiting, reliability |
| 7 | Practice: News Feed (Chapter 22) and Chat (Chapter 23) |
| 8 | Chapters 12, 13 and 15: IDs, probabilistic structures, observability |
| 9 | Practice: Notification Service (21) and Key-Value Store (18) |
| 10 | Practice: Payment System (29) and Ticket Booking (30) |
| 11 | Mock 1 and Mock 2 from Chapter 36, timed, before reading them |
| 12 | Practice two designs you haven't read, from the list below |
| 13 | Mock 3 or 4, ideally with a partner as interviewer; Chapter 37 |
| 14 | Review Appendix A, your notes and the template in Appendix C. Rest |

## The Six-Week Plan

| Week | Building blocks | Designs (practice first, then read) |
| --- | --- | --- |
| 1 | Chapters 1 to 6 | Link Shortener, Distributed Rate Limiter |
| 2 | Chapters 7 to 10 | Key-Value Store, Unique ID Generator, Web Crawler |
| 3 | Chapters 11 to 15 | Notification Service, News Feed, Chat |
| 4 | Revisit weak blocks | Autocomplete, Video Streaming, File Sync, Nearby Places |
| 5 | Run and modify the models | Ride Matching, Payments, Ticket Booking, Metrics, Job Scheduler |
| 6 | Chapter 37 | Leaderboard, Collaborative Editing, Message Queue; all four mocks |

## More Prompts for Practice

Apply the framework to prompts not covered in this book:

- A pastebin (share text snippets by link)
- A hotel or restaurant reservation system
- A food delivery platform
- An online code judge that runs untrusted code
- A distributed cache (Mock 2 shows one approach)
- A stock exchange order matching engine
- An ad click aggregation pipeline
- A recommendation feed ("people you may know")
- An email service for millions of mailboxes
- A global feature-flag service (Mock 4 shows one approach)

For each, write down which Part III designs it resembles. Most new prompts are combinations of building blocks and patterns you've already seen.

## Practicing With Other People

The design interview is a conversation, so practice it as one. Take turns as interviewer with a friend or colleague: the interviewer reads a prompt, answers clarifying questions, adds a constraint halfway through ("now make it multi-region"), and writes notes like the ones at the end of each mock interview. Being the interviewer teaches you what interviewers notice.

## The Week Before

- **Ask your recruiter** whether your round is infrastructure-focused or product-focused, and which tool you'll draw in.
- **Practice drawing** in that tool until it's effortless.
- **Review**, don't cram: Appendix A's numbers, Appendix B's building blocks, the template in Appendix C.
- **Sleep.** Design interviews reward clear thinking more than recall.

## Key Takeaways

- Practice complete designs out loud and timed, before reading the worked answers.
- Alternate building-block study with full designs; each makes the other stick.
- Run and modify the models to build intuition for the numbers.
- Practice with a partner, and take turns as interviewer.
