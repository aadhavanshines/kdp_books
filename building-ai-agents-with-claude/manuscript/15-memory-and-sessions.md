# Chapter 15: Memory, Sessions and Long Tasks

A language model doesn't remember anything between requests. Every turn, the SDK sends it the whole conversation so far, and that's all it knows. So when people talk about an agent's "memory", they mean one of several quite different things that your program provides. This chapter separates them, shows a real resumed conversation (and the security lesson hiding in it), and explains how ShopMate, the production agent in Part V, remembers things from one day to the next.

## Four Kinds of Memory

| Kind | Where it lives | Lasts | Example |
| --- | --- | --- | --- |
| The conversation | The session transcript the SDK keeps | One session, and can be resumed | The support desk remembers the order number you gave three messages ago |
| A resumed session | A transcript file on disk, found by its session ID | Until you delete it | A customer comes back tomorrow and continues the same chat |
| Your application's state | Your code, files and database | As long as you keep it | Which orders this customer has verified; refunds already paid |
| Long-term notes | A file or database the agent reads and your code writes | As long as you keep it | ShopMate's list of follow-ups carried from one morning to the next |

The first two are the SDK's job. The last two are yours, and the most common mistake in agent design is confusing them.

## Conversations and Sessions

Every run of an agent is a **session**: the SDK records the prompt, every tool call, every result and every reply in a transcript. By default the transcript is saved on the computer that runs the agent, in Claude Code's folder (`~/.claude/projects/`, in a subfolder named after the working directory). Each session has an ID, which you'll find on every `ResultMessage` as `session_id`.

You've already used the simplest form of session memory: `ClaudeSDKClient` keeps one session open while you send several messages, which is how the support desk holds a conversation (Chapter 10). Three options let you come back to a session later:

| Option | What it does |
| --- | --- |
| `resume="<session id>"` | Continue a specific earlier session, with its full history |
| `continue_conversation=True` | Continue the most recent session in this working directory |
| `fork_session=True`, with `resume` | Start a new branch from an earlier session, leaving the original unchanged |

Forking is useful for trying two different approaches from the same starting point, or for running an eval from a saved mid-conversation state.

## A Conversation That Comes Back

Here's a realistic situation. A customer asks the support desk when their cake was delivered, then leaves. Later they come back, in a new chat request handled by a new process, and ask for a refund. `resume_demo.py` acts this out. Part one is an ordinary conversation that saves its session ID. Part two resumes that session with a brand-new `Desk`:

```
@include projects/06-support-desk/resume_demo.py::part_one,part_two
```

The real run:

```
@include projects/06-support-desk/evals/runs/resume.txt
```

Look at what happened after the resume. Claude remembered the conversation, so it went straight to `issue_refund`. But the refund tool refused: "verify the order with find_order first". Claude's memory came back with the session; the new `Desk`'s list of verified orders did not. Claude then verified the order again, using the phone digits the customer had given earlier in the same conversation, and the refund went through.

That's the right outcome, and it holds a lesson that matters for every agent you build: **the conversation is not your application's state.** Resuming a session gives Claude back its memory of what was *said*. It doesn't restore anything your code was keeping track of, such as which orders are verified, what has been paid, or which user this is. If your code relies on that state, store it yourself (in a database, keyed by the session or the user) or make the agent establish it again, as the refund tool did here.

> **Warning:** A session ID unlocks a conversation that may contain personal details. Treat it like a password: keep it on your server, tie it to the customer it belongs to, and never accept a session ID from a request without checking that it belongs to that customer.

## Long Conversations and Context

A model can only read a limited amount of text at once: its **context window**. Claude Sonnet 5.5's window holds a million tokens, roughly 550,000 words of English, so you'll rarely hit it in a single task. But long conversations still cost more, because every turn re-reads everything before it, and very long ones get slower.

When a session does approach the limit, the SDK **compacts** it: older parts of the conversation are replaced by a summary, so the agent can carry on. That keeps long tasks running, but details from early in the conversation may be lost in the summary. If you need a full record, a `PreCompact` hook (Chapter 11) runs just before compaction, and is the place to save the transcript somewhere permanent.

Three habits keep agents well within their limits:

- **One task per session.** The data analyst starts fresh every run; it doesn't need yesterday's conversation.
- **Small tool results.** A tool that returns three lines instead of three thousand helps on every later turn.
- **Subagents for big reading jobs.** In Chapter 14, the researcher read thousands of rows, but only its summary entered the coordinator's conversation.

## Long-Term Memory You Can Read

Some agents need to remember things across days, not just within a conversation. ShopMate, the morning-brief agent in Part V, needs to know what it told Amudha yesterday, so it can follow up: did the overdue refund get paid? Is the allergy complaint still open?

You could resume yesterday's session, but that would bring back the whole of yesterday's conversation, most of it irrelevant, and it would grow every day. ShopMate does something simpler and more reliable. At the end of each run, code saves just the open follow-ups to a small file:

```
@include projects/09-shopmate/brief.py::remember
```

The next morning, a tool called `read_notes` hands that file to the agent, and the system prompt says what to do with it: carry over open items, mark one "done" only if today's data shows it's finished, and add new items for tomorrow.

Here's the file after the first morning, shortened:

```
@include projects/09-shopmate/evals/runs/day1-notes.json#L1-L14
```

On the second morning, the bakery's data had changed: the refund for order CB-1170 had been paid overnight, and the butter delivery had arrived. ShopMate marked the refund follow-up as done, kept the allergy follow-up open, noticed the butter was no longer low, and added two new items to check the next day. Chapter 19 shows the eval that checks all of this automatically.

This kind of memory has big advantages over a long conversation:

- **You can read it.** It's a short JSON file. If the agent remembers something wrong, you can see it and fix it.
- **You control what's kept.** Code decides what goes in the file. Nothing private gets remembered by accident.
- **It's cheap.** A few hundred tokens a day, no matter how long the agent has been running.
- **It survives anything.** It doesn't depend on transcript files on one particular computer, so ShopMate can run on a fresh machine every morning (Chapter 20).

> **Tip:** For anything an agent must remember across days, prefer a small, explicit notes file or database table that your code writes, over relying on old conversations. Let the agent read memory through a tool, and let code decide what to save.

## Memory and Privacy

Every kind of memory is also a store of data, and often personal data. Decide up front:

- **What is kept, and for how long.** Session transcripts contain everything customers typed. Delete them when you no longer need them.
- **Who can read it.** Transcripts and notes should be as protected as the database they describe.
- **How to forget.** If a customer asks you to delete their data, you need to be able to find and remove it from transcripts and notes too, not just from the orders table.

## Key Takeaways

- The model has no memory of its own. "Memory" is the conversation, saved sessions, your application's state, and notes your code keeps.
- `ClaudeSDKClient` keeps a conversation going; `resume`, `continue_conversation` and `fork_session` bring sessions back.
- Resuming a session restores the conversation, not your code's state. Store that state yourself, or make the agent establish it again.
- Treat session IDs as secrets tied to one user.
- Keep conversations short and tool results small; use subagents for big reading jobs.
- For long-term memory, use a small, readable notes file or table that code writes and the agent reads.
