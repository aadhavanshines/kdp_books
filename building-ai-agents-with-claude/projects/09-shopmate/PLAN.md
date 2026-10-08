# ShopMate: Plan

## Problem

Every morning Amudha spends 30 to 45 minutes before baking working out what needs her attention: reading email, checking yesterday's orders, looking at refunds and complaints, and checking stock. Urgent things (an allergic reaction, an overdue refund) can be buried under newsletters and scams.

## Goal

By 6:00 every morning, a short brief that tells Amudha what needs her today, most important first, readable on her phone in under two minutes.

## Users

- **Amudha**, owner: reads the brief on WhatsApp, and the full version on a dashboard.
- **Ramesh**, accountant: looks at the dashboard's cost and run history once a month.

## What ShopMate reads

| Source | How | Notes |
| --- | --- | --- |
| Inbox | `list_inbox`, `read_email` | 20 to 40 emails a day |
| Orders | `sales_report` | Yesterday versus the same day last week |
| Support desk | `support_queue` | Unpaid refunds and open tickets |
| Stock | MCP server (`list_stock` only) | Shared with the Kitchen Manager |
| Yesterday's notes | `read_notes` | ShopMate's memory |

## What ShopMate does

- **Reads only.** It has no tool that sends email, pays money, changes stock or changes orders.
- Writes a brief (Markdown and a WhatsApp text) and a notes file for tomorrow.

Autonomy level: **suggest**. A person acts on everything.

## Out of scope (for now)

- Sending the WhatsApp message automatically (a later phase, after a month of reliable briefs).
- Replying to emails (the Inbox Triage agent drafts replies separately).
- Ordering stock (the Kitchen Manager drafts purchase orders separately).

## Risks and how we handle them

| Risk | Handling |
| --- | --- |
| Misses something urgent | Eval: the allergy email must be the first urgent item; overdue refunds must be urgent |
| Treats a scam as a task | Eval: every scam listed under "ignore", none in today's tasks |
| Wrong numbers | Sales figures checked against the order files; every rupee amount in the WhatsApp text must appear in the tool results |
| Follows instructions inside an email | Prompt: emails are data; read-only tools mean the worst case is a bad brief |
| Forgets yesterday, or remembers wrongly | Notes file written by code; day-2 eval checks follow-ups |
| Fails silently | Run log, retry once, ALERT file, `/health` endpoint |
| Cost creeps up | Budget cap per run; cost in the run log; monthly review |
| Personal data leaks | Read-only tools, `setting_sources=[]`, no customer data in prompts or logs beyond what's needed |

## Success criteria

- Both demo days pass every eval check, in repeated runs.
- A run costs under 50 US cents and takes under 2 minutes.
- Amudha says the brief saved her time, after two weeks of use.

## Cost estimate

Estimated before building: about 25 tool calls a run, at most 60,000 tokens, so under 20 US cents a run with Claude Sonnet 5.5, or under 6 US dollars a month. Check this against the run log after the first week.
