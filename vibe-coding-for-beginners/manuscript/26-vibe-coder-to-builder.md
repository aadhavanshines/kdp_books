# Chapter 26: From Vibe Coder to Builder

You started this book with an empty folder. Since then, you've built a tip calculator, a to-do app, an expense tracker, a full-stack habit tracker, an AI-powered flashcard tool, and a mobile app for iPhone and Android. You've redesigned an app for accessibility, debugged a time zone bug, written specs, set up guardrails, connected a browser, put apps online, prepared an app for the app stores, and shipped versioned releases. That's a lot of ground.

This last chapter is about what comes next: the habits that keep improving your results, a plan for practice, ideas for projects, and how to keep up as the tools change.

## The Habits That Matter Most

If you remember only ten things from this book, make them these:

1. **Picture the result before you prompt.** Who uses it, where, with what inputs and outputs.
2. **Say what "done" looks like.** Give Claude a way to check its work: tests, examples, a command to run.
3. **Plan bigger changes first.** Explore, plan, build, commit.
4. **Build in small slices**, and commit after each one.
5. **Read what Claude tells you**, especially what it hasn't tested and what it warns about.
6. **Test like a skeptic**, with awkward inputs, other time zones, and old data.
7. **Ask "why?" until you understand.** Understanding is how you check the AI's work.
8. **Keep a fresh context.** `/clear` between tasks; restart rather than argue.
9. **Put hard rules in guardrails**, not just instructions, and test the guardrails.
10. **Review security before you share.** Every time.

These habits are what separate people who get impressive demos from people who build things that keep working. Appendix A collects the best practices from every chapter into one checklist.

## The Skills You're Really Building

It may feel like Claude does the "real" work. It doesn't. Look at what you actually did in each project:

- You **specified**: turning fuzzy ideas into precise requests and specs.
- You **designed**: choosing between static and dynamic, browser storage and a database, accounts or no accounts.
- You **verified**: testing, reviewing, and catching what the AI missed.
- You **decided**: which review comments to act on, which risks to accept, what to build next.

These are the skills of product managers, engineers, and founders. The AI took over much of the typing; it didn't take over the thinking. If anything, the thinking now matters more, because it's the bottleneck.

## Learning to Read Code, Gradually

You don't need to become a programmer, but the more code you can read, the better you'll steer. A painless way to learn:

- When Claude makes a change, ask it to **explain the diff** in plain English.
- Each week, pick one file from your projects and ask for a **line-by-line walkthrough**.
- Try **small edits by hand**: change a color, a message, a number. Then ask Claude to check your edit.
- Ask Claude to **quiz you** on your own project: "Ask me five questions about how the habit tracker works, then tell me how I did."

Within a few months, you'll find that you can read most of what Claude writes, and spot when something looks wrong before you even run it.

## A 30-Day Practice Plan

**Week 1: Rebuild from memory.** Without looking at the book, rebuild one of the projects from scratch with your own prompts. Compare your results with the book's. What did you forget to ask for?

**Week 2: Your own idea.** Take one of the app ideas you wrote down in Chapter 1. Run the interview prompt from Chapter 7, write a spec, and build the first slice.

**Week 3: Make it solid.** Add tests for everything important, a CLAUDE.md, a `/ship-check` skill, and a reviewer subagent. Run a security review.

**Week 4: Ship it.** Put it online, share it with three people, and fix the first real bugs they report.

## Project Ideas by Level

**Beginner (front end only)**

- A unit converter for cooking (cups, grams, ounces).
- A countdown timer for workouts, with sounds.
- A personal reading list that remembers what you've read.
- A random team generator for games or class groups.

**Intermediate (back end and database)**

- A shared shopping list for your household.
- A booking sheet for a club or a small business.
- A recipe box with search and tags.
- A tool that reads a spreadsheet and produces a monthly report.

**Advanced (AI, automation, and integrations)**

- An AI writing coach that gives feedback on essays in a specific style.
- A daily email digest summarizing news on topics you choose.
- A GitHub workflow that triages new issues with labels and a summary.
- A personal knowledge base that answers questions from your own notes.

For each idea, start with the smallest slice that's useful, and grow from there.

## Bringing Vibe Coding to Work

Some of the most valuable vibe coding happens at work, building the small internal tools that no IT department will ever prioritize: a script that reformats a weekly report, a dashboard for a team's data, a checker that validates files before they're sent. These tools save hours every week.

At work, add a few rules:

- **Check your organization's policy** on AI tools and on what data may be shared with them.
- **Use test data**, never real customer or employee data, while building.
- **Keep it reviewable.** Put the tool in version control, write a README, and include tests, so a colleague can understand and maintain it.
- **Know the stakes.** A tool that formats a report is low risk. Anything touching money, safety, or personal data deserves review by someone with the right expertise.

## Staying Current

AI coding tools change fast. To keep up without being overwhelmed:

- **Type `/help`** in Claude Code to see what's available in your version.
- **Ask Claude Code about itself**: "What's new in Claude Code?" or "How do I set up a hook that does X?" It can look up its own documentation.
- **Read the official documentation** at code.claude.com, especially the best practices and common workflows pages.
- **Check the changelog** occasionally for features that fit how you work.
- **Ignore most of the hype.** A new feature is worth learning when it solves a problem you actually have.

The fundamentals in this book (clear descriptions, verification, small steps, guardrails, and security) will stay valuable whatever changes in the tools.

## A Final Word

When software was hard to write, most ideas never became software. Now they can. That's a remarkable change, and it puts a new kind of responsibility on everyone who builds: to make things that work, that are safe, and that treat their users well.

You have the skills to do that now. Go build something you care about, test it like a skeptic, and share it with the people it will help.

## Key Takeaways

- Ten habits matter most: picture the result, define "done," plan, slice, read replies, test skeptically, ask why, keep context fresh, use guardrails, and review security.
- Your real skills are specifying, designing, verifying, and deciding.
- Learn to read code gradually by asking for explanations and quizzes.
- Practice with a 30-day plan: rebuild, build your own idea, make it solid, and ship it.
- At work, follow policy, use test data, keep tools reviewable, and respect the stakes.
- Stay current through `/help`, the official docs, and the changelog, and focus on fundamentals.
