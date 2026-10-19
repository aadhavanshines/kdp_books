# Chapter 26: Behavioral Interviews

Technical candidates often treat behavioral questions as small talk before the real interview. That's a costly mistake. At most large companies, behavioral interviews are scored with the same care as coding rounds, and a weak one can sink an otherwise strong loop. Amazon is the clearest example: its own guides say behavioral questions are based on its Leadership Principles, and that for software roles roughly half of the interview process covers them. Other companies use different names, "Googleyness and leadership" in candidate reports about Google, for example, but they ask very similar questions.

The good news: behavioral interviews are the most *preparable* part of the process. The questions are predictable, and the stories come from your own experience.

## What Interviewers Are Assessing

- **Ownership:** do you take responsibility for outcomes, including problems you didn't cause?
- **Impact:** did your work make a measurable difference?
- **Collaboration and conflict:** can you disagree constructively and work with difficult people?
- **Learning:** do you reflect on failures and improve?
- **Judgment under ambiguity:** how do you decide with incomplete information?
- **Leadership,** at any level: did you influence others, mentor, or raise the bar?
- **Communication:** can you tell a clear, structured story?

## The STAR Method

Amazon's interview guides recommend structuring answers with **STAR**, and it works everywhere:

| Part | What to say | Share of the answer |
| --- | --- | --- |
| **Situation** | The context: team, project, what was at stake | about 15% |
| **Task** | Your specific responsibility or goal | about 10% |
| **Action** | What *you* did, step by step, and why | about 50% |
| **Result** | The outcome, with numbers if possible, and what you learned | about 25% |

The most common failure is spending two minutes on the situation and twenty seconds on the actions. The actions are what's being scored.

> **Tip:** Say "I", not "we", when describing your actions. Amazon's guidance makes this point explicitly: interviewers need to know what *you* did. Credit the team in the situation and result, and be precise about your part in the action.

## An Example Answer

**Question:** "Tell me about a time you disagreed with a technical decision."

**Situation:** Our team of five was building the checkout service for a food delivery app, with a launch date six weeks away. Our tech lead proposed storing orders in a new document database the team hadn't used before.

**Task:** I owned the order data model, so I was responsible for the storage decision working in production.

**Action:** I was worried about two things: we needed transactions across orders and payments, and nobody on call knew how to operate the new database. Instead of arguing in the meeting, I asked for two days to compare options. I wrote a one-page comparison and built a small prototype of the payment flow on both databases. The prototype showed that the new database would need a custom retry mechanism to keep orders and payments consistent. I shared the results with the lead first, privately, and then we presented them together to the team.

**Result:** We kept our existing relational database for orders and used the new one only for the menu catalog, where it fitted well. We launched on time, with no data-consistency incidents in the first six months. I learned that a quick prototype settles a disagreement faster than a debate, and since then I've suggested time-boxed prototypes whenever the team is split.

Why it works: the disagreement is about substance, not personality; the candidate gathers data instead of escalating; the relationship with the lead is respected; the result is concrete; and there's a lesson.

## Build a Story Bank

Prepare **eight to ten stories** from the last few years, and map each to several themes. One good story can answer three or four different questions.

| Theme | Typical questions |
| --- | --- |
| Conflict | "Tell me about a disagreement with a teammate or manager." |
| Failure | "Tell me about a time you failed." "What's a mistake you made?" |
| Ownership | "Tell me about a time you went beyond your role." |
| Impact | "What's the project you're proudest of?" |
| Ambiguity | "Tell me about a decision you made without all the information." |
| Deadline pressure | "Tell me about a time you had to cut scope." |
| Influence | "How did you convince others to adopt your idea?" |
| Learning | "Tell me about something you learned quickly." |
| Customer focus | "Tell me about a time you improved things for users." |
| Mentoring or leadership | "Tell me about helping someone grow." |

For each story, write bullet points, not a script: the situation in one line, your three or four key actions, the result with a number, and the lesson. Practice telling each one aloud in about two minutes.

> **Common Mistake:** Choosing a "failure" that is really a disguised success ("I work too hard"). Interviewers see through it. Choose a real failure with real consequences, show what you did to recover, and, most important, what you changed afterward.

## Questions About You and the Company

Expect these at every company, and prepare them as carefully as the stories:

- **"Tell me about yourself."** A 60- to 90-second summary: what you do now, one or two highlights, and why you're interested in this role. It isn't your life story.
- **"Why this company?"** Be specific: a product you use, a technical problem that interests you, something from their engineering blog. Generic praise ("it's a great company") is a weak answer.
- **"Do you have questions for me?"** Always have two or three. Apple's interview tips suggest asking about the team and how success is measured. Good examples: "What does a successful first six months look like in this role?" and "What's the hardest technical problem the team is working on?"

## Behavioral Questions in Technical Rounds

Behavior is assessed in every round, not only in behavioral interviews. In a coding round, interviewers notice whether you take hints well, stay calm when stuck, and admit a bug instead of hiding it. In system design, they notice whether you listen. Treat every round as a conversation with a future colleague.

## Key Takeaways

- Behavioral rounds are scored seriously; at some companies they're half the process.
- Use STAR, and spend most of the time on your own actions.
- Build a bank of eight to ten stories that cover the common themes, with numbers and lessons.
- Say "I" for your actions; give credit to the team elsewhere.
- Prepare "tell me about yourself", "why this company" and your own questions.

## Sources

- Amazon: "Your complete guide to the Amazon interview process" and related interview guides on aboutamazon.com and amazon.jobs (STAR method, Leadership Principles, use "I").
- Apple careers: interview tips (open-ended questions about past performance; questions about the team).
