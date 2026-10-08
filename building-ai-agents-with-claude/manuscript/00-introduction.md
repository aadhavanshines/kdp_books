# Introduction

A chatbot answers questions. An **agent** gets things done.

Ask a chatbot "Which of my ingredients are running low?" and it will tell you it can't see your kitchen. Give the same question to an agent with the right tools, and it opens your stock list, compares each item with how much you use in a week, drafts purchase orders for three suppliers, keeps every order under your spending limit, and tells you which one is most urgent. That's the difference this book is about.

Agents are the most exciting thing happening in software right now. They are also the easiest thing to get wrong. An agent that can issue refunds can issue the wrong refund. An agent that reads email can be tricked by an email. An agent that writes code can write code that looks right and isn't. This book teaches you to build agents that are **useful, safe and reliable**, and to prove they are, with **Claude** and the **Claude Agent SDK**.

## What Makes This Book Different

**Everything is real.** Every agent in this book was run for real while the book was being written, and the outputs you see are from those runs: shortened in places to save space, but not rewritten. When an agent failed, gave up, broke a rule or got something subtly wrong, you'll see that too. Some of the most useful lessons in the book came from those failures, including a data analyst that "succeeded" with empty answers, an evaluation that gave a passing score to an agent that wasn't running at all, and a production container that couldn't write its own log file.

**Everything is checked by code.** Every agent comes with a grader: a short program that checks the agent's work against answers a person worked out, or against facts recomputed with plain Python. Receipts are compared field by field. Research quotes are matched word for word against their source files. Sales figures are recomputed with pandas. Refunds are checked in the database, not in the agent's description of what it did. Each agent was run several times, and the scores are in the book.

**It goes all the way to production.** Most agent tutorials stop when the demo works. This book keeps going: evaluations, Docker, scheduled runs, secrets, cost limits, monitoring, alerts, a dashboard, model upgrades, and what to do when an agent should be retired. The capstone project, ShopMate, goes through the whole lifecycle, from a one-page plan to a running service with a maintenance routine.

> **Note:** Claude's answers vary from run to run, even with the same instructions and data. Your agents' wording, and sometimes their choices, will differ from what's printed here. That's normal, and it's exactly why this book teaches you to measure agents instead of trusting a single good run.

## Who This Book Is For

- **Beginners with a little Python** who want to build something more useful than a chatbot. If you can follow a 20-line script, you can follow this book.
- **Small business owners and professionals** who want an assistant that handles real work: email, receipts, reports, customer questions.
- **Developers new to AI agents** who want a structured, honest path from first agent to production.
- **Students and career changers** who want portfolio projects that show judgement, not just a demo.

You don't need to know machine learning, and you don't need to have used an AI API before. If you're completely new to Python, read a free beginner's tutorial first; the official one at docs.python.org is enough.

## What You'll Build

All nine projects work for one fictional small business: **Amudha's Home Bakes**, a home bakery in Chennai run by Amudha, who bakes celebration cakes, takes orders on Instagram and WhatsApp, and is about to open a second kitchen. Using one business throughout means each agent builds on the last, and by the end you'll have a complete AI back office.

| Project | What it does | You'll learn |
| --- | --- | --- |
| 1. Pantry Chef | Suggests a dinner from your pantry and writes the shopping list | Your first agent, custom tools |
| 2. Inbox Triage | Sorts 24 emails, spots scams, drafts replies | Structured output, labels and graders, prompt injection |
| 3. Receipt Scanner | Turns photos of bills into a checked Excel sheet | Vision, "the model reads, code checks" |
| 4. Research Analyst | Answers a business question from documents, with verified quotes | Built-in tools, grounding, catching made-up facts |
| 5. Data Analyst | Writes and runs its own Python to analyse a year of orders | Running code safely, permissions, charts |
| 6. Support Desk | A web chat that answers customers and issues refunds | Conversations, guardrails in code, a web front end |
| 7. Kitchen Manager | Plans ingredient orders through your own MCP server | Building an MCP server, using it from agents and Claude Code |
| 8. Launch Team | Four specialist agents prepare a Diwali campaign | Subagents, coordination, fact-checking |
| 9. ShopMate | A morning brief agent, taken all the way to production | Memory, evals, Docker, scheduling, monitoring, maintenance |

## How This Book Is Organized

The book climbs steadily from beginner to advanced. Each chapter starts with a level label so you always know where you are.

**Part I: Foundations** explains what an agent is, sets up your workshop, builds your first agent, opens up the agent loop so you can see every step, and teaches you to design tools that Claude uses well.

**Part II: Agents That Do Real Work** builds four agents that handle the kind of work that fills a small business owner's week: email, receipts, research and data. Each one introduces a new technique and a new way to check the agent's work.

**Part III: Agents That Talk to People** builds a customer support desk, then covers the guardrails, permissions and hooks that keep an agent inside its rules, and puts the agent on the web.

**Part IV: Advanced Agents** builds your own MCP server, a team of cooperating agents, and agents that remember. It ends with evals, the single most important skill for anyone building agents.

**Part V: The Full Lifecycle** takes ShopMate from idea to production in six chapters: plan, build, test, deploy, operate and maintain.

**Part VI: Going Further** covers security and responsible use, and where to go next.

The **appendices** contain an agent builder's checklist, a library of system prompts and tool descriptions, a troubleshooting guide, an Agent SDK cheat sheet, a glossary, and a list of official resources.

## Choose Your Reading Path

| If you are... | Read |
| --- | --- |
| New to agents and to Python | Every chapter, in order |
| A Python developer new to agents | Chapter 1, skim Chapter 2, then in order |
| Interested mainly in business automation | Parts I and II, then Chapters 10 and 16 |
| Taking an agent to production | Chapters 4, 5, 11 and 16, then Part V |
| Responsible for safety or compliance | Chapters 6, 10, 11, 16 and 23 |

## Conventions Used in This Book

Code from the project files appears in shaded boxes. It is printed directly from the tested files, so it matches what was run:

```
async def main():
    async for message in query(prompt=request, options=options):
        show(message)
```

Output from real runs appears in boxes labelled "Terminal output". Long outputs are shortened, and the cuts are marked with "...":

```
Terminal output:
→ check_pantry {}
  ← rice: 2 kg · toor dal: 500 g · onions: 6 · ...
Done: 2 turns, 8.5 s, $0.0192
```

Commands you type in a terminal look like this:

```
python agent.py
```

Throughout the book you'll also find four kinds of callout:

> **Tip:** A shortcut or a good habit.

> **Note:** Background that helps but isn't essential.

> **Warning:** Something that can cost you money, data or trust.

> **Try It:** A short exercise to do before moving on.

## What It Costs

Agents use the Claude API, which charges for each request according to the amount of text sent and received. Every run in this book reports its own cost, so you'll always know. To give you a feel: running all nine projects once cost about one US dollar on Claude Sonnet 5.5, and the most expensive single run (four agents working together) cost under 80 cents. Chapter 2 shows you how to set a spending limit before you start, so a mistake can never surprise you.

## The Example Projects and Data

Everything you need is printed in this book. The project code is in the chapters, and the sample data (emails, documents, receipts, orders and stock) is in Appendix G, together with the short scripts that create the larger files for you. Every business, person, email, order, receipt and number in the examples is made up. The bakery, its customers, its suppliers and its scam emails were all written for this book, so you can run everything without touching anyone's real data.

The facts about Claude, the Agent SDK and the tools in this book were checked against the official documentation in October 2026, and every project was verified with Claude Agent SDK version 0.2.164. Software moves fast. Where something may have changed, the book tells you how to check.

Let's build some agents.
