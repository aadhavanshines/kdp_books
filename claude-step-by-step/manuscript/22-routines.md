# Chapter 22: Routines That Run Themselves

The last four workflows bring everything together: connectors (Chapter 12), Projects (Chapter 9) and scheduled tasks (Chapter 14). Each one is meant to run automatically, so the work is waiting for you when you need it.

**Before you schedule any routine, test it once by hand.** That's exactly what I did for each of these: I pasted in a sample of the email and calendar it would normally read (fictional, for this book), ran the instructions in a normal chat, and checked the result. Only when the test looks right should you create the scheduled task with the same wording. Keep "Always ask" on for sending and deleting (Chapter 12).

## Workflow 47: The Weekday Morning Briefing

**Reads:** your email and calendar through connectors. **Schedule:** weekdays, 7:30am.

The scheduled task's instructions:

```prompt
Look at my calendar for today and my email from the last 16 hours. Write a short briefing I can read in two minutes:
1. Today's meetings, with one line each on what to prepare (look for related emails).
2. Emails that need a reply from me today, most urgent first, with a one-line summary each.
3. Anything with a deadline in the next 3 days.
Skip newsletters, receipts and automatic notifications. Don't reply to or archive anything.
```

For the test run I pasted a day's calendar (a stand-up, a budget review, an interview, a call with a moving company) and six emails, including a newsletter and an order receipt. The real result:

```result
The calendar is dated Thursday Dec 3, but today is Nov 26. I've written this as if it's the morning of Dec 3, which matches Karen's "tomorrow's budget review."

Today's meetings
- 9:30 Team stand-up: No related emails. You could mention the Riverside install date (Jan 12) and that you still need someone to let the technician in.
- 11:00 Budget review with Karen: Bring the updated supplies forecast, and check the October numbers first, since Karen thinks they look off.
- 2:00 Interview with Alex Kim (Operations Assistant): Read Alex's resume and the interview questions in Priya's email. Score as you go, since scores are due Monday.
- 4:30 Call with Swift Movers: Review the revised $8,100 quote beforehand. If you're happy with it, you can confirm on the call and keep the Feb 27 date.

Emails needing a reply today
- Swift Movers: They want confirmation of the $8,100 quote by tomorrow (Fri Dec 4) to hold Feb 27. You could reply after the 4:30 call.
- Karen (Finance): She asked for the updated supplies forecast. A quick "will do" before 11:00 is optional, since bringing it is the real answer.
- Tom (IT): The Riverside internet install is booked for Jan 12, and he needs to know who will let the technician in.

Deadlines in the next 3 days
- Fri Dec 4: Confirm the Swift Movers quote.
- Mon Dec 7: Send Alex Kim's interview scores to Priya. This is just past the 3-day window, but worth knowing.

I skipped the Weekly Office Digest and the Amazon receipt.
```

Every meeting is linked to the email that matters for it, and the briefing even suggests confirming the mover on the 4:30 call. **Why "don't reply to or archive anything":** a briefing task should only read. Saying so explicitly is a good habit for every read-only task.

## Workflow 48: The Monday Week Planner

**Reads:** calendar, plus a to-do list in a connected app or a Project file. **Schedule:** Mondays, 7am.

```prompt
Look at my calendar for this week and my to-do list. Make a realistic plan for the week with:
- a table of days with my fixed meetings and 2 or 3 to-dos fitted into the free time on each day;
- warnings for any day that's overbooked (more than 6 hours of meetings) or any clash;
- the 3 most important things to finish this week.
Keep Friday afternoon free if possible. Don't change any calendar events; just suggest.
```

The test week I pasted had two problems hidden in it. Claude found both:

```result
Here's a realistic plan for the week of Dec 7. It assumes a lunch break around 12-1 and that the scorecards are for Wednesday's interviews.

| Day | Fixed meetings | Suggested to-dos (in free time) |
| Mon | 9-10 Leadership, 1-2 Vendor call | 10:00-10:30 Confirm mover, 10:30-12:30 Draft move-day plan, 2:00-5:00 Finish expense policy |
| Tue (warning) | 9-12 Training workshop, 1-5 Quarterly planning | None. The day is full. |
| Wed | 10-11 1:1 Sam, 11-12 Budget review, 2-3 Interview, 3-4 Interview | 9:00-10:00 Clear inbox backlog, 4:00-5:00 Review 2 interview scorecards (while they're fresh) |
| Thu (warning) | 9:30-10 Stand-up, 10-11 Office move check-in, 10:30-11:30 Client call (Harbor Co) | 1:00-3:00 Prepare Q1 hiring request [...] |
| Fri | 9:30-10 Stand-up, 2-3 Team social | 10:00-12:00 Buffer for anything that slipped. Afternoon kept free apart from the social. |

Warnings
- Tuesday is overbooked: 7 hours of meetings with no free work time. Nothing is planned for it, so expect email to pile up until Wednesday morning.
- Thursday has a clash: the Office move check-in (10-11) and the Harbor Co client call (10:30-11:30) overlap by 30 minutes. You could ask whether the check-in can wrap up by 10:30, send someone in your place, or share your move-day plan ahead of time so you can leave early. I'd prioritise the client call.

3 most important things to finish this week
1. Expense policy. It's the largest task, so it's scheduled first on Monday, when you have a long free block.
2. Confirm the mover and draft the move-day plan. Both need to be done before Thursday's office move check-in.
3. Q1 hiring request. [...]
```

Notice the scheduling logic: the scorecards go right after the interviews "while they're fresh," and the move tasks land before the move check-in. **Next:** Reply in the result: "Move the budget review to Wednesday afternoon and rebalance."

## Workflow 49: The Friday Status Report

**Reads:** your notes and completed tasks, plus past reports in a "Work Reports" Project. **Schedule:** Fridays, 2pm.

```prompt
Using my notes and completed tasks from this week, draft my weekly status report in the same format as the example reports in this project: Done, In progress, Blocked (with what I need), Next week. Under 250 words. Put anything late or at risk at the top in bold. Save it as a draft for me to review; don't send it.
```

My test run, with a week's notes pasted in:

```result
At risk: The Riverside internet install is Jan 12, and nobody is confirmed yet to let the technician in.
Waiting on Karen: The Q1 hiring request is drafted but can't move until she signs off on the budget.

Done
- Finished the expense policy and sent it to Karen
- Booked the mover: Swift, $8,100, move date Feb 27
- Interviewed 2 candidates for Operations Assistant and sent scorecards to HR

In progress
- Move-day plan, about half done

Blocked
- Q1 hiring request: needs budget sign-off from Karen
- Riverside internet install (Jan 12): needs someone confirmed to be on site to let the technician in

Next week
- Finish the move-day plan
- Get the Q1 hiring request approved
- Order packing crates
- Confirm who will be on site for the Jan 12 install

I added the install confirmation to next week's list since it's the open risk. Your notes didn't include it, so remove it if someone [...]
```

This is Workflow 17 on autopilot, and again Claude tells you exactly what it added that wasn't in your notes. You spend two minutes reviewing a draft instead of twenty minutes writing it.

## Workflow 50: Sunday Meal Plan and Shopping List

**Reads:** a "Meals" Project with your family's preferences and past plans. **Schedule:** Sundays, 5pm.

```prompt
Plan 5 weeknight dinners for next week following the family preferences in this project. Don't repeat any dinner from the last two weeks' plans. Use what's in season. Include one vegetarian night and one "leftovers remix" night. Then give me a shopping list grouped by store section, with quantities, and mark the items we usually already have so I can check the cupboard first.
```

For the test, I pasted the family's preferences (no spicy food, the 7-year-old won't eat mushrooms, under 40 minutes, about $120), the cupboard staples, the last two weeks' dinners, and last week's feedback: "kids loved the quesadillas; nobody ate the fish tacos."

```result
Here's next week's plan (Mon Nov 30 - Fri Dec 4). I left fish out after the taco flop. Tuesday's bake is close to the quesadillas the kids loved without repeating them. Nothing contains mushrooms or heat.

Dinners

Mon: Honey-orange glazed chicken, rice and roasted broccoli (~30 min)
[...] Cook all 3 lb of chicken and a double batch of rice. About a third of each is for Thursday.

Tue: Cheesy sweet potato and black bean enchilada bake (vegetarian) (~35 min)
[...] Check that the enchilada sauce says "mild."

Wed: Mini meatloaves, mashed potatoes and honey-butter carrots (~40 min)
[... Thursday's leftovers remix and Friday's pizza night ...]

Shopping list
(check mark) = usually on hand, so check the cupboard first.

Produce
Broccoli, 2 crowns
Sweet potatoes, 2 lb
[...]
(check mark) Onions, 2
(check mark) Garlic, 1 head
[...]
```

The feedback line did the most work here: fish dropped, a cousin of the quesadillas added. **Tip:** Reply to each week's plan with what the family liked and didn't, and ask Claude to note it in the Project. The plans get better every week.

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
