# Chapter 24: Where to Go Next

You've built nine agents, from a 20-line pantry helper to a production service with evals, a container, a schedule, a dashboard and a maintenance routine. This last chapter looks outward: the other ways to build agents with Claude, ideas for what to build next, and how to keep up in a field that changes every month.

## Other Ways to Build With Claude

This book used the Claude Agent SDK for Python, because it gives you a complete agent loop, built-in tools, permissions, hooks, sessions and MCP support in one library. Everything you learned carries over to the other options; only the code that wires it together changes.

| Option | What it is | Choose it when |
| --- | --- | --- |
| **Agent SDK for TypeScript** | The same SDK for JavaScript and TypeScript | Your application is a Node.js or web project |
| **Claude API with tool use** | You send messages to Claude, it asks for tools, your code runs them and sends the results back | You want full control of the loop, or you don't need built-in file and shell tools |
| **The API's tool runner** | A helper in the client SDKs that runs the tool-use loop for you, while your code supplies the tools | You want API-level control without writing the loop yourself |
| **Claude Managed Agents** | Anthropic runs the agent loop and a sandbox for its tools, on its servers | You'd rather not host the agent yourself; long-running or scheduled agents |
| **Claude Code** | Anthropic's coding agent, in a terminal, an IDE or the desktop app | Building software, or running agent tasks from the command line |

A quick way to choose:

- If your agent mostly calls **your own tools** (databases, business systems) and you want the lightest possible dependency, the **Claude API with tool use** or its tool runner is enough. Your tools, prompts, schemas and evals move across unchanged.
- If your agent needs **files, shell commands, subagents, MCP servers and permissions** out of the box, stay with the **Agent SDK**.
- If you don't want to run **servers, schedules and sandboxes** yourself, look at **Managed Agents**.

> **Note:** All of these change quickly. Before you choose, read the current documentation (Appendix F lists where), and check which features are in beta.

## The Skills That Transfer

Look back at what made the agents in this book work. Almost none of it was specific to one library:

- **Small, well-described tools** that gather facts and return short, clear text (Chapter 5).
- **Instructions that define terms** and say what to do in unusual cases (Chapter 6).
- **Structured output**, checked by code (Chapters 6 and 7).
- **"The model reads, code checks"**: arithmetic, totals and rules in code (Chapter 7).
- **Least privilege**, limits and human approval (Chapters 10 and 11).
- **Evals**, run repeatedly, with must-pass checks (Chapter 16).
- **The lifecycle**: plan, build, test, deploy, operate, maintain (Part V).

These are the skills that make an agent reliable, whichever framework, model or year it is.

## Ideas for Your Next Agent

Start from your own work: a task that takes time every week, needs some judgement, and where a mistake can be caught. Some ideas, roughly in order of difficulty:

| Idea | Builds on | New thing to learn |
| --- | --- | --- |
| Weekly expense summary from receipt photos | Receipt Scanner | Scheduling, emailing a report |
| Meeting notes to action items | Inbox Triage | Long documents, assigning owners |
| Answering staff questions from your own documents | Research Analyst | Larger document sets, search |
| Monthly sales report with charts, automatically | Data Analyst, ShopMate | Combining analysis with deployment |
| Supplier price watch | Kitchen Manager | Comparing new data with history |
| Customer WhatsApp assistant | Support Desk | A messaging platform's API, stricter safety |
| Your own MCP server for a tool you use daily | Chapter 13 | Sharing one capability with every agent |

For each one, write the one-page plan from Chapter 17 first. You'll often find the plan is the hardest and most valuable part.

> **Try It:** Pick one idea, write its plan, and build the smallest version that does something useful. Then write five eval cases before adding anything else.

## Keeping Up

The models, the SDK and the best practices change every month. A few habits keep you current without drowning:

- **Read the release notes** of the SDK and the API when you upgrade, not after something breaks.
- **Keep your evals running.** When a new model comes out, run them: it takes minutes and tells you more than any announcement.
- **Read the official documentation first.** Blog posts and videos age quickly; the docs are kept up to date.
- **Build small things often.** Most of what this book teaches was learned by running agents and reading what they actually did.

## A Last Word

The difference between an agent that impresses in a demo and one that people rely on every morning isn't the model. It's everything around the model: clear instructions, careful tools, limits in code, honest evals, and someone paying attention after launch.

You now know how to build all of that. Amudha's bakery has an AI back office that reads her email, checks her receipts, answers her customers, plans her stock, launches her campaigns and briefs her every morning, and every piece of it has been tested.

Now go and build something for your own work. Plan it, test it, and measure it. Then keep it running.
