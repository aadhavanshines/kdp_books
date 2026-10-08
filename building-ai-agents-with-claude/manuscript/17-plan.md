# Part V: The Full Lifecycle: ShopMate

# Chapter 17: Plan: Deciding What the Agent Should Do

Every project so far has been a single agent, built and tested in one chapter. Real agents live much longer than that. Someone has to decide what the agent is for, build it, prove it works, put it somewhere it can run every day, watch it, and keep it working as the models, the SDK and the business change around it. When it's no longer needed, someone has to switch it off.

Part V follows one agent through that whole life. **ShopMate** prepares Amudha's morning brief: a short summary, ready before she starts baking, of everything that needs her attention that day. It brings together most of what you've learned: tools, an MCP server, structured output, memory, guardrails, evals. Then it goes further, into the parts of agent building that most tutorials skip.

## The Agent Lifecycle

| Stage | The question it answers | What you produce | Chapter |
| --- | --- | --- | --- |
| Plan | Should this be an agent, and what exactly should it do? | A one-page plan, with risks and success criteria | 17 |
| Build | How does it work? | Tools, prompt, schema, a script that runs it once | 18 |
| Test | How do we know it works? | Test data, a grader, repeated eval runs | 19 |
| Deploy | Where does it run, and how does it start? | A container, a schedule, secrets, storage for memory | 20 |
| Operate | Is it working today? | A run log, alerts, a health check, a dashboard | 21 |
| Maintain | Is it still working after things change? | Upgrade routine, model comparisons, prompt versions | 22 |
| Retire | Should it still exist? | A decision, and a clean shutdown | 22 |

The stages form a loop, not a line. Problems you find while operating become new eval cases. A model upgrade during maintenance sends you back to testing. A new request from Amudha starts a new, small plan.

## Start With the Problem, Not the Agent

Here's how Amudha describes her mornings:

> "Before I start baking, I spend half an hour or more just working out what needs me. I read the emails, check yesterday's orders, look at the refunds and complaints, check whether I have enough butter. Last month an allergy complaint sat in my inbox for a day because it was under a pile of newsletters."

That's a good problem for an agent, and it's worth checking why, using the questions from Chapter 1:

- **Does it need judgement?** Yes. Deciding that an allergy complaint matters more than a wholesale enquiry, that a refund promised eleven days ago is now urgent, and that a "GST refund" email is a scam, all need reading and judgement. A fixed script can't do it.
- **Does it need several steps and several sources?** Yes: email, orders, the support desk, the stock list and yesterday's notes.
- **Can a mistake be caught?** Yes. Amudha reads the brief and acts on it herself. A bad brief wastes some of her time; it can't spend money or send an email.
- **Is it worth it?** Thirty minutes a day is over 180 hours a year, for a few rupees a day.

If any of these answers had been different, the plan might have been something simpler. If the sources had been clean and the rules fixed, a script with a daily report would do. If the brief could cause real harm, the agent would need human approval built in from the start.

## The One-Page Plan

Before writing any code, write the plan down. One page is enough, and the act of writing it forces the decisions that matter. Here is ShopMate's, exactly as it sits in the project folder as `PLAN.md`:

```
@include projects/09-shopmate/PLAN.md
```

Every section is there for a reason.

**Problem and goal.** The goal is specific and testable: by 6:00, readable on a phone, in under two minutes. "Help Amudha with her mornings" would be impossible to test.

**Users.** Two people with different needs: Amudha wants the brief on her phone; Ramesh, the accountant, wants to see what the agent costs. Both shape the design.

**What it reads.** A list of sources, each with the tool that reads it. Writing this table showed that the stock data already had a home: the Kitchen Manager's MCP server from Chapter 13. ShopMate reuses it rather than reading the stock file itself.

**What it does, and doesn't do.** The most important line in the plan is "Reads only". ShopMate has no tool that sends, pays or changes anything.

**Out of scope.** Writing down what you *won't* build is how you stop an agent from growing until nobody can test it. Sending WhatsApp messages automatically is a good idea, but a later one.

**Risks.** Each risk has a handling, and almost every handling is something you can test.

**Success criteria and cost.** These turn "is it good?" into questions with answers.

## Choosing How Much the Agent May Do

The plan says ShopMate's **autonomy level** is "suggest". It's a useful way to think about every agent you build:

| Level | The agent... | A person... | Example in this book |
| --- | --- | --- | --- |
| Inform | Gathers and summarises | Decides everything | ShopMate, Research Analyst |
| Suggest | Proposes specific actions or drafts | Approves and carries them out | Inbox Triage drafts, Kitchen Manager purchase orders |
| Act with approval | Acts, after a person says yes | Approves each risky action | Support desk refunds over Rs. 2,000 |
| Act within limits | Acts on its own inside firm limits | Reviews afterwards | Support desk refunds under Rs. 2,000 |

Start low, and move up only when the evals and real use have earned it. ShopMate starts by informing and suggesting. If Amudha later wants it to send the WhatsApp message itself, that's a move from "suggest" to "act within limits", and it deserves its own plan, its own risks and its own evals.

> **Tip:** The level of autonomy belongs in the plan, not in the prompt. A sentence like "never send email" is only a request; having no tool that can send email is a guarantee.

## Turning Risks Into Tests

The risks table is where planning meets testing. Each risk that can be checked by code becomes an eval check in Chapter 19:

| Risk in the plan | Becomes the check |
| --- | --- |
| Misses something urgent | "allergy is the first urgent item"; "overdue refund CB-1170 is urgent" |
| Treats a scam as a task | "every scam ignored, none in today's tasks" |
| Wrong numbers | "sales numbers match the order files"; "every rupee amount in WhatsApp is in the sources" |
| Forgets yesterday, or remembers wrongly | "CB-1170 refund follow-up marked done"; "allergy follow-up still open" |
| Too long to read on a phone | "WhatsApp message under 600 characters" |

The risks that code can't check, like "follows instructions inside an email", get a design answer instead: read-only tools, so the worst an injected instruction can do is spoil one brief.

## Estimating Cost Before You Build

You can estimate an agent's cost on paper, and you should, because it tells you whether the idea is worth building at all. The method:

1. **Count the tool calls.** ShopMate will list the inbox, read about 25 emails, and call four other tools: about 30 calls. With parallel reads, that's fewer turns, but count calls to be safe.
2. **Estimate the tokens.** Each turn re-reads the conversation so far, but prompt caching (Chapter 4) makes those re-reads cheap. Earlier projects give a guide: the inbox agent read 24 emails for about 8 to 10 US cents with Sonnet 5.5.
3. **Multiply by the price, and add a margin.** The plan's estimate was under 20 US cents a run.

Then, and this is the part people forget, **write down that you'll check it**. The plan says to compare the estimate with the run log after the first week. (Chapter 21 does: real runs cost 6 to 8 US cents.)

## Drawing the Design

The last planning step is a picture of the pieces and how they connect:

![ShopMate's design. A scheduler starts run_daily.py at 6:00. The agent reads from five read-only sources: the inbox, the orders, the support desk database, yesterday's notes, and the stock MCP server shared with the Kitchen Manager. It returns a structured brief. Plain code then writes the Markdown brief, the WhatsApp text, tomorrow's notes and a line in the run log, and raises an alert if the run failed. A dashboard reads the run log and the latest brief.](images/diagram-shopmate.png)

Notice where the agent sits: in the middle, surrounded by ordinary code. The agent does the one thing that needs judgement, deciding what matters. Code does everything else: starting the run, saving files, remembering, logging, alerting. That's the shape of almost every reliable agent in production.

> **Try It:** Write a one-page plan for an agent you'd like in your own work, using ShopMate's headings. Be strict about "Out of scope", and give every risk a handling you could test.

## Key Takeaways

- An agent's life has stages: plan, build, test, deploy, operate, maintain and, eventually, retire. They form a loop.
- Start with a problem described by the person who has it, and check that it needs judgement, several steps, and that mistakes can be caught.
- Write a one-page plan: problem, goal, users, sources, what the agent may do, out of scope, risks, success criteria, cost.
- Choose the lowest autonomy level that solves the problem, and enforce it with tools, not with prompt sentences.
- Turn every testable risk into an eval check before you build.
- Estimate the cost on paper, then check the estimate against real runs.
- Keep the agent small and surround it with plain code.
