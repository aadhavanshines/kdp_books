# Introduction

In early 2026, an open-source project called OpenClaw became one of the most talked-about pieces of software in the world. It was not a new AI model. It was a program you run on your own computer that connects a model you already had access to with the chat apps you already use: you message it on WhatsApp or Telegram like a friend, and it answers, remembers what you told it last week, reads your files, runs commands, checks the web, and taps you on the shoulder when something needs your attention. People called it a **personal agent**: not a chatbot in a browser tab, but an assistant that lives with you and works for you.

Within weeks, the same project also showed how much can go wrong. Hundreds of the add-on "skills" people shared turned out to be malware. A bug let a single malicious link take over an agent. Tens of thousands of agents were found answering anyone on the open internet. In March 2026 NVIDIA released NemoClaw, which wraps OpenClaw in a sandbox with a network policy, secrets the model never sees, and a router that keeps private data on your machine. The lesson was clear: a personal agent is only as good as the protections around it.

This book shows you how to build one yourself, end to end, with both halves: the useful assistant and the safety layer. You'll write **Sparrow**, a personal agent in plain Python with Claude as its brain, and you'll test every part of it.

## What You'll Build

By the end of the book, Sparrow will:

- chat with you on Telegram, in a web page on your computer, and in the terminal, keeping one conversation across all three;
- remember facts about you in plain Markdown files you can read and edit, and search them when it needs to;
- keep your to-do list, read and write your files, and look things up on the web;
- learn **skills**, short instruction files that teach it a task such as logging expenses or writing a packing list, and propose new ones (which you approve);
- send reminders on time, run tasks on a schedule ("every weekday at 08:00, send me my briefing"), and check in on its own with a **heartbeat**, staying silent when there's nothing worth saying;
- answer only you, give limited access to guests you approve, and hand strangers a pairing code instead of an answer;
- run commands in a **sandbox** with no network and no view of your home folder;
- visit only the web addresses you allow, asking you before it goes anywhere new;
- use API keys without ever seeing them;
- swap email addresses, phone numbers and card numbers for placeholders before anything leaves your machine;
- ask for your approval before risky actions, keep a full audit log, and stop at a daily spending limit.

## What Makes This Book Different

**Every line is here, and every line is tested.** Sparrow is about 2,900 lines of Python, and every one of them is printed in this book, in order, with an explanation. Nothing is left as "an exercise" or "see the repository." The listings come straight from the files that were tested, so what you read is exactly what ran.

**Testing is half the book, not an afterthought.** An agent is hard to test: the model's answers vary, it acts in the world, and attackers can talk to it. Part IV shows how to test one completely. 136 automated tests check every part and the whole gateway with a scripted stand-in for the model, so they run in about fifteen seconds and cost nothing. Then 16 end-to-end scenarios run against the real model, three times each, and check what Sparrow *did* (files, memory, network requests, the audit log), not only what it said. Six of those scenarios are attacks. A system test starts Sparrow as a user would, kills it mid-task, restarts it, and checks that nothing was lost. A benchmark measures how much time Sparrow itself adds. You'll see every result, including the failures that led to fixes.

**The bugs are real.** The tests found real problems while Sparrow was being built, and the book shows them as they happened. The most serious one: a secret API key could be read from inside the sandbox through a file in `/proc`, even though the sandbox cleared the environment. You'll see how a test found it, why the first version of that test missed it, and the one-line fix.

**Real-world stories, checked.** **Real-World Story** and **Interesting Fact** boxes connect each technique to what actually happened with OpenClaw, NemoClaw and other agents. Each comes from a published source, listed in Appendix F.

## Who This Book Is For

You should know basic Python: functions, classes, dictionaries, `async` and `await` at the level of "I've seen them," and how to run a program from a terminal. You don't need to know anything about AI models, agents or security; the book explains every idea it uses.

It suits developers who want their own assistant and want to understand it fully, engineers evaluating agent frameworks who want to know what's inside, and anyone responsible for deploying agents safely, because the safety and testing parts apply to any agent, not just Sparrow.

## How the Book Is Organized

- **Part I, Understanding Personal Agents:** what a personal agent is, how OpenClaw and NemoClaw work, Sparrow's architecture, and setting up.
- **Part II, Building Sparrow:** the brain, the workspace, tools, memory, skills, the gateway, three channels, and scheduled work.
- **Part III, Making It Safe:** the threat model, pairing, approvals, the sandbox, network and secret control, the privacy router, the audit log and spending limits.
- **Part IV, Testing It Completely:** a test strategy for agents, functional tests, end-to-end evaluations with the real model, red-teaming, and reliability and performance testing.
- **Part V, Running It:** deploying as a service or in a container, operating it day to day, and where to go next.
- **Appendices:** a configuration reference, a tool reference, the full test report, troubleshooting, a glossary and sources.

## How to Use the Code

Type the listings in as you go if you can; you'll understand each part better for it. Chapter 3 sets up the project folder, and every listing names its file. The code is formatted to fit the page: no line is longer than 76 characters, so nothing in a listing is wrapped. The tests in Part IV are the fastest way to check your copy: if `pytest` passes, your Sparrow behaves like the one in the book.

Sparrow runs fully on Linux. On Windows, use WSL2, which is Linux; on a Mac, everything works except the sandbox, which needs Linux, so Sparrow refuses to run commands until you run it in a Linux container or virtual machine (Chapter 25 shows how).

> **Note:** All people, messages, websites and data in the examples are fictional. Example web addresses use the reserved `.example` domain, which can never belong to a real site. Real projects and events appear only in the clearly marked real-world boxes, as published by their sources.

> **Warning:** Sparrow is a teaching project that is tested and works, but it is software that acts for you with your data. Read Part III before you connect it to anything you care about, and keep its safety settings on.

Let's start with what a personal agent actually is.
