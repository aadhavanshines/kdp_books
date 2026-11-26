# Chapter 22: Routines That Run Themselves

The last four workflows bring everything together: connectors (Chapter 12), Projects (Chapter 9) and scheduled tasks (Chapter 14). Each one runs automatically, so the work is waiting for you when you need it.

**Before you schedule any of these:** run the instructions once by hand in a normal chat, check the result, and adjust. Only then create the scheduled task with the final wording. Keep "Always ask" on for sending and deleting (Chapter 12).

## Workflow 47: The Weekday Morning Briefing

**Uses:** Gmail or Outlook, and calendar connectors. **Schedule:** weekdays, 7:30am.

**Name:** Morning briefing

**Instructions:**

```prompt
Look at my calendar for today and my email from the last 16 hours. Write a short briefing I can read in two minutes:
1. Today's meetings, with one line each on what to prepare (look for related emails).
2. Emails that need a reply from me today, most urgent first, with a one-line summary each.
3. Anything with a deadline in the next 3 days.
Skip newsletters, receipts and automatic notifications. Don't reply to or archive anything.
```

**Why "don't reply to or archive anything":** a briefing task should only read. Saying so explicitly is a good habit for every read-only task.

## Workflow 48: The Monday Week Planner

**Uses:** calendar connector, and a to-do list in a connected app or a Project file. **Schedule:** Mondays, 7am.

**Name:** Plan my week

**Instructions:**

```prompt
Look at my calendar for this week and my to-do list. Make a realistic plan for the week:
- a table of days with my fixed meetings and 2 or 3 to-dos fitted into the free time on each day
- warnings for any day that's overbooked (more than 6 hours of meetings) or any clash
- the 3 most important things to finish this week
Keep Friday afternoon free if possible. Don't change any calendar events; just suggest.
```

**Next:** Reply in the result chat: "Move the budget review to Wednesday and rebalance." Claude adjusts the plan in conversation.

## Workflow 49: The Friday Status Report

**Uses:** a "Work Reports" Project with past reports as examples, plus your notes or task app. **Schedule:** Fridays, 2pm.

**Name:** Weekly status draft

**Instructions:**

```prompt
Using my notes and completed tasks from this week, draft my weekly status report in the same format as the example reports in this project: Done, In progress, Blocked (with what I need), Next week. Under 250 words. Put anything late or at risk at the top in bold. Save it as a draft for me to review; don't send it.
```

This is Workflow 17 on autopilot. You spend two minutes reviewing a draft instead of twenty minutes writing it.

## Workflow 50: Sunday Meal Plan and Shopping List

**Uses:** a "Meals" Project with your family's preferences as instructions. **Schedule:** Sundays, 5pm.

**Name:** Next week's dinners

**Instructions:**

```prompt
Plan 5 weeknight dinners for next week following the family preferences in this project. Don't repeat any dinner from the last two weeks' plans. Use what's in season. Include one vegetarian night and one "leftovers remix" night. Then give me a shopping list grouped by store section, with quantities, and mark the items we usually already have so I can check the cupboard first.
```

**Tip:** Reply to each week's plan with what the family liked and didn't ("kids loved the burrito bowls, nobody ate the fish"). Ask Claude to note it in the project, and the plans get better every week.

## Your Own Routine

Every routine follows the same shape. Use this template for your own:

| Part | Your answer |
| --- | --- |
| Name | Something you'll recognize in a list |
| When | Day and time it should run |
| Reads from | Which connected apps, project files or folders |
| Produces | The finished thing: briefing, report, plan, list |
| Format | Length, sections, table or bullets |
| Must not | Send, delete, change, buy, reply |

Fill in the table, turn it into instructions, test once by hand, then schedule it.
