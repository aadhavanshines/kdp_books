# Chapter 19: Test: Proving ShopMate Works

ShopMate's first brief looked right. This chapter turns "looks right" into evidence. You'll build test data for two business days, write a checker that recomputes the facts with plain code, run the whole thing repeatedly, and fix what the runs reveal. One of those fixes is in the agent; another is in the checker itself.

## Test Data You Control

You can't test a morning brief against the real inbox: it changes every day, so you'd never know what the right answer was. Instead, `setup_demo.py` puts the shop's data into one of two known states:

| | Demo day 1: Wednesday 7 October | Demo day 2: Thursday 8 October |
| --- | --- | --- |
| Inbox | 24 emails, including an allergy complaint and five scams | The same, plus Lakshmi's "refund received" email |
| Refunds | CB-1170 (Rs. 950) pending since 26 September; CB-1201 awaiting approval | CB-1170 now paid |
| Tickets | Allergy complaint about order CB-1204, open | Still open |
| Stock | Butter 4 kg, below its reorder level | Butter 14 kg: the delivery arrived |
| Notes | None: the first run | Whatever ShopMate saved on day 1 |
| Orders | A year of history, plus the first week of October | The same |

Day 2 is the interesting one. It tests whether ShopMate *notices change*: the overdue refund should drop off the urgent list and be marked done in the follow-ups; the allergy follow-up should stay open, because nothing in the data says it's resolved; and butter should no longer be low. A brief that just repeats yesterday's would fail.

Every value in these days was chosen by a person, so the right answers are known before the agent runs.

## The Checker

`evals/check_brief.py` checks a brief against facts that plain code works out:

```
@include projects/09-shopmate/evals/check_brief.py::SCAMS,is_low,check
```

Each check comes straight from the plan's risks table (Chapter 17), and each uses one of the techniques from Chapter 16:

- **Recompute it.** The sales numbers are recalculated from the order files with the same function the tool uses, then compared exactly.
- **Check the order, not just the presence.** The allergy complaint must be the *first* urgent item, not merely somewhere in the brief.
- **Look for things that must never appear.** No scam's ID or sender may appear in today's tasks.
- **Verify against sources.** Every rupee amount in the WhatsApp text must appear somewhere in the tool results that ShopMate received. The `PostToolUse` hook in `run_daily.py` keeps those results for exactly this purpose. A brief that rounds Rs. 14,275 to "about Rs. 14,000" fails, and so does one that invents a number.
- **Check memory across days.** On day 2, the follow-ups must reflect what changed overnight.

## The Eval Runner

`evals/run_evals.py` plays the two days in order, as many times as you ask, and scores each brief:

```
@include projects/09-shopmate/evals/run_evals.py::one_day
```

Each round starts day 1 with no notes, then runs day 2 with the notes day 1 saved, so the memory is tested exactly as it works in production. The results, including each brief, go into `evals/results/`, one file per model, so you can compare runs later and read any brief that failed.

```
python evals/run_evals.py 2
```

## The First Round: Three Out of Four

The first proper eval of ShopMate (prompt version `brief-v3`) ran both days twice with Claude Sonnet 5.5:

| Run | Day | Result | Cost | Time | Turns |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 | Pass | $0.066 | 32 s | 23 |
| 1 | 2 | Pass | $0.078 | 36 s | 19 |
| 2 | 1 | Pass | $0.057 | 30 s | 18 |
| 2 | 2 | **Fail**: WhatsApp message over 600 characters | $0.078 | 32 s | 22 |

Three briefs passed every check. The fourth was a perfectly good brief, accurate and well ordered, whose WhatsApp text was too long for the plan's limit. The prompt *asked* for under 600 characters, and most of the time Claude complied. "Most of the time" is what a single good run hides, and what repeated runs reveal.

The fix wasn't a stronger sentence in the prompt. It was a rule in the schema: `"maxLength": 600` on the `whatsapp` field, which you saw in Chapter 18. Claude sees the schema, so it usually keeps to the limit first time. And if it doesn't, the SDK rejects the output and Claude has to try again, before anything reaches your code.

You can watch that happen. `evals/schema_limit_demo.py` asks Claude to put a 105-character message into a field limited to 40 characters:

```
@include projects/09-shopmate/evals/runs/schema-limit.txt
```

The SDK checked the output against the schema, rejected it with a precise reason, and Claude wrote a shorter message. Your code only ever sees output that matches the schema.

> **Tip:** When an agent breaks a rule occasionally, ask whether the rule can move out of the prompt and into something that's enforced: the schema, a tool's input check, or the options. Prompts are requests; schemas are rules.

## When the Checker Was Wrong

Before that round, an earlier version of the checker had failed a brief that was actually right. On day 2 it checked that butter was no longer low by making sure the word "low" didn't appear in butter's status. ShopMate had written:

```
Claude's reply:
OK: 14 kg in stock, above the reorder level of 6 kg, so it is not low
any more.
```

The brief was right and the checker was wrong: "not low" contains "low". The fix was to check only how the status *starts*, which is the label ShopMate uses ("LOW", "OK", "Watch"). That's the `is_low` function above, and its comment records why, so nobody "simplifies" it back. (It later learned to accept "CRITICALLY LOW" too, after another model used that label. Chapter 22 has the story.)

This is the lesson from Chapter 16 in miniature: when a check fails, read the brief before you change anything. Here, the checker needed fixing. In the WhatsApp case, the agent did.

## After the Fixes

With the schema limit in place and the prompt at version `brief-v4`, the same eval ran again with Sonnet 5.5:

```
@include tests/eval-shopmate-sonnet.txt
```

Every brief passed every check on both days. The runs cost 6 to 8 US cents each, well inside the plan's 20-cent estimate.

## What the Evals Don't Cover

Be honest about the limits of a test set:

- **Two days are not two months.** The demo days cover the important situations, but real inboxes will bring new kinds of email. Chapter 21 shows how real problems become new eval cases.
- **Code checks the facts, not the judgement.** Whether "reply to Janani about a wedding tasting" belongs above "check the BoxKraft delivery" is a matter of taste. Amudha's opinion, after two weeks of use, is the success criterion for that, and it's in the plan.
- **Model and SDK changes can break anything.** That's why the evals run again before every change (Chapter 20) and why Chapter 22 is about maintenance.

## Key Takeaways

- Test against data you control: fixed demo days whose right answers you know.
- Include a second day, so you test what changed, and whether memory works.
- Check briefs with code: recompute the numbers, check the order of urgent items, check every amount against the tool results, and look for scams in the tasks.
- Run the eval repeatedly. A rule the agent follows "most of the time" only shows up in repeats.
- Move rules from the prompt into the schema or the code when you can.
- When a check fails, read the output first. Sometimes the checker is wrong.
