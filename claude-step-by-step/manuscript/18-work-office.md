# Chapter 18: Work and Office

These eight workflows take over the routine parts of office work: reports, spreadsheets, presentations, planning and preparing for difficult conversations.

## Workflow 17: The Weekly Status Report

**For:** the report your manager wants every Friday. **You'll use:** a Project with past reports, then a skill or scheduled task. **Time:** 5 minutes, then 1 minute a week.

```prompt
Here are my notes from this week. Write my weekly status report in the same format as the examples in this project: Done, In progress, Blocked (with what I need), Next week. Under 250 words. Put anything that's late or at risk at the top in bold.

[paste notes]
```

**Make it repeatable:** After two good weeks, ask Claude to turn this into a skill. If your notes live in a connected app, make it a Friday scheduled task (Chapter 14).

## Workflow 18: Clean Up a Messy Spreadsheet

**For:** exported data with inconsistent names, dates and blanks. **You'll use:** file upload; Claude returns an Excel file. **Time:** 5 minutes.

```prompt
This spreadsheet is our volunteer sign-up list exported from three different forms. Clean it up: one row per person, consistent name capitalization, phone numbers in the format (555) 123-4567, dates as YYYY-MM-DD, and merge duplicates (same email = same person). Put anything you weren't sure about on a separate sheet called "Check" with the reason. Give me the cleaned Excel file and a summary of what you changed.
```

The "Check" sheet means Claude never quietly guesses. You review only the doubtful rows. **Make it repeatable:** Save the request; the next export needs only "same cleanup as last time."

## Workflow 19: Explain a Spreadsheet Someone Else Built

**For:** inheriting a colleague's workbook full of formulas. **You'll use:** file upload, or Claude for Excel (Chapter 15). **Time:** 5 minutes.

```prompt
I've inherited this budget workbook. Explain it sheet by sheet in plain English: what each sheet is for, where the inputs are, and what the key formulas calculate. Then list anything that looks fragile or wrong, such as hard-coded numbers in formulas, broken references or totals that don't include every row.
```

**Next:** "Fix the problems you found and give me the corrected file, with a list of every cell you changed." **Make it repeatable:** Do this for any workbook before you trust it.

## Workflow 20: A Presentation from Your Notes

**For:** team updates, pitches, training sessions. **You'll use:** slide deck creation (Chapter 7); a design system for your brand (Chapter 13). **Time:** 15 minutes.

```prompt
Make an 8-slide deck from my notes for a 15-minute talk to the board about last quarter's customer satisfaction results. One idea per slide, no more than 15 words of text per slide, a simple chart on slide 3 using the numbers in my notes, and speaker notes for every slide. The final slide should ask for one specific decision.

[paste notes]
```

**Next:** "Now give me the three questions the board is most likely to ask, with short answers." **Make it repeatable:** A design system so every deck matches your company look.

## Workflow 21: Plan a Project Week by Week

**For:** an office move, an event, a product launch, a website redesign. **You'll use:** a chat, then a Project. **Time:** 10 minutes.

```prompt
Plan our office move. 22 people, moving from 4th Street to the Riverside building, last working day in the old office is February 27, first day in the new one is March 2. Make a week-by-week plan for the 8 weeks before, as a table with task, owner role (office manager, IT, everyone), and week. Include the things people usually forget. Then give me a one-page checklist for moving weekend.
```

```result
[trimmed to the first three weeks and the "usually forgotten" list]

| Week | Task | Owner |
| 8 weeks before | Confirm move date with both landlords and the moving company | Office manager |
| 8 weeks before | Check internet installation lead time at Riverside (often 4 to 6 weeks) | IT |
| 7 weeks before | Floor plan and seating chart for the new office | Office manager |
| 7 weeks before | List equipment to move, sell or recycle | Everyone |
| 6 weeks before | Order new keys or access cards for 22 people | Office manager |
| 6 weeks before | Update address with bank, insurer, suppliers and on the website | Office manager |

Usually forgotten:
- Mail forwarding and updating your address on invoices and email signatures
- Booking the elevator at both buildings for moving day
- Testing the new internet and phones before moving weekend, not on it
- Returning the old office keys and recording meter readings
- First-day welcome: where to park, coffee, Wi-Fi password
```

**Make it repeatable:** Put the plan in a Project and add a weekly scheduled task: "Tell me what's due this week and what's overdue."

## Workflow 22: Prepare for a Difficult Conversation

**For:** asking for a raise, giving hard feedback, saying no to your boss. **You'll use:** a chat, then voice mode to practice (Chapter 15). **Time:** 15 minutes.

```prompt
I need to tell my employee Marcus that his reports have been late four times this month and it's affecting the team. He's usually great and I think something might be going on at home. Help me plan a 10-minute conversation: how to open it, the key message in one sentence, three questions to understand what's happening, and how to agree on next steps. Then play Marcus so I can practice. Be realistic, not easy.
```

Practicing out loud with Claude playing the other person is one of the most valuable things in this book. People who try it feel noticeably calmer in the real conversation. **Make it repeatable:** Not needed; each conversation is different.

## Workflow 23: Write a Clear How-To for Your Team

**For:** any process people keep asking you about. **You'll use:** dictation, then document creation. **Time:** 10 minutes.

```prompt
I'm going to describe how we process a customer refund. Turn it into a step-by-step guide for new staff, as a Word document: a one-line purpose, what you need before you start, numbered steps with the exact button names, a "common mistakes" box, and who to ask for help. Ask me questions if any step is unclear.

[describe the process, or dictate it]
```

**Make it repeatable:** Keep all your guides in one "Team Guides" project, so Claude can keep them consistent and spot contradictions between them.

## Workflow 24: Turn Feedback into a Plan

**For:** survey results, customer reviews, comments from a performance review. **You'll use:** file upload. **Time:** 5 minutes.

```prompt
Here are 120 comments from our end-of-year customer survey. Group them into themes, and for each theme give the number of comments, two typical quotes and one suggested action. Order by how often each theme appears. Then list any single comment that's serious enough to deal with right away, even if only one person said it.
```

**Why the last line matters:** grouping by theme hides rare but serious problems, such as a safety issue mentioned once. Asking for them separately makes sure you see them. **Make it repeatable:** Run the same request on every survey so you can compare themes year to year.
