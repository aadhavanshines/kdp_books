# Chapter 19: Audit Log and Spending Limits

The last two protections don't stop anything from happening; they make sure you can always find out what happened, and that a mistake can only cost so much. An **audit log** records every message, tool call, decision and reply. A **spending ledger** records the cost of every model call and stops Sparrow for the day when it reaches your limit.

## Why an Audit Log

When an agent does something surprising, the first question is always "what did it do, and why?" The chat transcript only shows what was said. The audit log shows what was *done*: which tools ran with which arguments, what each returned, what the egress policy decided about each web address, which turns failed and why, and what each turn cost.

It's also how the tests in Part IV check behavior. An end-to-end test that asks "did Sparrow read the skill before logging the expense?" reads the audit log, not the reply.

## The Audit Module

`sparrow/audit.py`:

```python
@include sparrow/audit.py#L1-L39
```

Each event is one line of JSON in a file for the day, such as `state/audit/2026-10-27.jsonl`: the time, the event type, and whatever fields the caller adds. **JSON Lines** suits logs well: each line stands alone, so a crash halfway through writing can damage at most the last line, you can append without reading the file, and standard tools work on it. To see every tool Sparrow used today, for example:

```
$ grep '"event": "tool"' ~/.sparrow/state/audit/2026-10-27.jsonl
```

Before a line is written, the vault scrubs it, so a secret that somehow reached a tool result or an error message is replaced with its label and never stored. `default=str` lets values that JSON can't represent, such as an exception, be written as text instead of crashing the logger. The log is opened, appended and closed for every event, so it's always complete on disk.

Here are the first six events of the chat session from Chapter 3, with long text shortened to fit the page:

```
@include transcripts/audit-sample.txt
```

You can follow the turn exactly: the owner's message arrives; Sparrow reads the expense-log skill, finds there's no `expenses.csv` yet, and writes one; the turn summary records the model, the cost (1.28 US cents) and the tools used; and the reply is delivered. The `turn` event's time is when the turn started.

These are the event types Sparrow writes:

| Event | Written when |
| --- | --- |
| `inbound` | A message arrives (with the sender's role) |
| `tool` | A tool is called (arguments and the start of the result) |
| `egress` | A web address is checked (with the verdict and reason) |
| `turn` | A conversation turn ends (model, cost, error, tools) |
| `outbound` | A message is sent (and whether a channel delivered it) |
| `privacy_block` | A message is refused in `block` mode |
| `job` | A scheduled job runs (and whether it was late) |
| `heartbeat` | A heartbeat ends with `HEARTBEAT_OK` |
| `error`, `scheduler_error`, `channel_error` | Something failed |

> **Note:** The audit log contains your messages and Sparrow's replies, and tool results include parts of your files. It's as private as the workspace. It lives in `state/`, next to the secrets, and Chapter 26 shows how to rotate old logs.

## The Spending Ledger

```python
@include sparrow/audit.py#L42-L67
```

Every turn adds a row to the `spending` table: the day, the model, the kind of turn (a message, a heartbeat, a flush before `/new`) and the cost in US dollars that the Agent SDK reported. `spent` totals today's rows, and `over_budget` compares that with the daily limit.

The gateway checks `over_budget` at the start of every turn (Chapter 9), before calling the model, and tells you if the limit is reached. Scheduled reminders still arrive, because they don't use the model, but tasks, heartbeats and conversations wait until tomorrow. The default limit is US$2.00 a day, about a hundred typical turns; set `daily_budget_usd` to what suits you.

Why a daily limit, when each turn already has `max_turns` and a timeout? Because those cap a single turn, and the expensive failures are loops of many turns: a scheduled task set to run every five minutes by mistake, a guest who chats all day, or a bug that makes the heartbeat speak every time and then answer itself. The ledger caps all of them together. Chapter 21 tests that a turn is refused, with no model call, once the limit is reached.

> **Tip:** Set a monthly spending limit in the Anthropic Console as well. Sparrow's ledger is your first guard; the provider's limit is the one that holds even if Sparrow itself has a bug.

## Part III in Review

You now have every protection from the threat model in Chapter 13:

- **At the door:** pairing sorts owners, guests and strangers before anything else (Chapter 14).
- **For risky, rare actions:** approval codes you answer in code, never through the model (Chapter 15).
- **For commands:** a sandbox with no network, no home folder, no secrets and hard limits (Chapter 16).
- **For the network:** deny by default, ask about new sites, never the local network, and check every redirect (Chapter 17).
- **For secrets:** a vault that adds keys outside the model and scrubs them from everything (Chapter 17).
- **For private data:** placeholders that keep structured values on your machine (Chapter 18).
- **For everything:** an audit log and a spending limit (this chapter).

Each is enforced in code. Part IV proves it: every protection has tests that try to break it, first with a scripted brain that does exactly what an attacker would want, then with the real model facing real-looking attacks.

## Key Takeaways

- An audit log records what Sparrow did, not just what it said: messages, tool calls, policy decisions, turns, costs and errors.
- Write one JSON line per event, scrubbed of secrets, to a file per day.
- The audit log is how you investigate surprises, and how tests check behavior.
- A daily spending limit, checked before every model call, caps runaway loops of many turns.
- Reminders keep working when the budget is spent; anything that needs the model waits.
