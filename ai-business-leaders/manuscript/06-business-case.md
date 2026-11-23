# Chapter 6: The Business Case, With Real Numbers

This is the chapter most AI books skip. It shows how to build a business case for an AI use case that a skeptical finance director will accept, step by step, using Northfield's customer email project. You can copy the structure for any use case; Appendix A has a blank template.

The goal is not a perfect forecast. The goal is an honest one: every cost included, every benefit traceable to a number you can measure, and a clear view of what would make the case fail.

## Step 1: Describe Today's Process in Numbers

Start with the baseline. For Northfield's customer service team, Priya pulled four weeks of data from the email system and the payroll records:

| Baseline item | Value |
| --- | --- |
| Customer service agents | 38 |
| Fully loaded cost per agent (salary, benefits, taxes, equipment) | $62,000 a year |
| Customer emails received | About 4,200 a week |
| Share that are routine (order status, delivery, stock, account questions) | About 60 percent |
| Average handling time per email | 7 minutes |
| Average time until the customer gets a first reply | 9 hours |
| Overtime paid to clear email backlogs | $48,000 a year |
| Planned hires next year for 8 percent volume growth | 3 agents |

Two numbers on this list matter more than the rest: the overtime and the planned hires. They are the places where saved time can turn into saved money.

## Step 2: Describe the Change

Be specific about what will be different. Northfield's proposal:

- Every incoming customer email is read by AI, which looks up the order, delivery and stock information in Northfield's systems and drafts a reply.
- The agent reviews the draft, edits it if needed, and sends it. Nothing is sent without a person.
- Non-routine emails (complaints, disputes, complex technical questions) are flagged and routed to senior agents, with a summary.
- A team leader reviews a random 5 percent sample of sent replies each week for quality.

The vendor's demo and a two-week test on old emails suggested that handling time for routine emails could fall from 7 minutes to about 4.5 minutes. Priya's team decided to treat that as a hypothesis to prove in the pilot, not a fact.

## Step 3: Count the Benefits Honestly

Here is the trap. The obvious calculation goes like this:

> 2,520 routine emails a week x 2.5 minutes saved = 6,300 minutes, or 105 hours a week. Over 48 working weeks, that is 5,040 hours. At $32 an hour, that is about $161,000 a year.

That number is real time. It is not real money, unless something changes. Northfield will still employ 38 agents and pay the same salaries. Marcus, the CFO, pointed this out in the first review, and he was right.

So the team asked: where can the saved time become money?

- **Avoided hires.** Northfield planned to hire three agents next year to handle growth. If AI absorbs the extra volume, it can hire one instead of three. Two avoided hires at $62,000 = **$124,000 a year**.
- **Lower overtime.** With faster handling, backlogs shrink. The team estimated overtime would fall by half: **$24,000 a year**.

That makes the hard, countable benefit **$148,000 a year** once the system is fully running. It is less than the $161,000 "time saved" figure, and much easier to defend, because both parts appear as lines in the budget.

What about the rest of the saved time? It still has value. Agents can call back customers with complex problems, chase overdue quotes, or simply work without the constant stress of a backlog. But Northfield listed these as **upside, not counted**, along with the possible revenue effect of faster replies on quotes. If the pilot showed a revenue effect, it would be added later with evidence.

> **Remember:** Put only hard benefits in the base case: costs that disappear from the budget and revenue you can measure. List everything else as upside. A conservative business case that comes true builds more trust than an ambitious one that doesn't.

### Year One Is Not a Full Year

Benefits don't start on day one. Northfield's plan had a three-month pilot and rollout before the hiring decision mattered, so it counted the avoided hires for nine months of year one ($93,000) and three-quarters of the overtime saving ($18,000). Year one benefit: **$111,000**.

## Step 4: Count Every Cost

This is where most AI business cases fall short. The license is the cost everyone sees. Here is the full list for Northfield:

| Cost | Year 1 | Year 2 | Year 3 |
| --- | --- | --- | --- |
| Licenses: 40 seats at $30 a month | $14,400 | $14,400 | $14,400 |
| Integration with order and email systems (one-time) | $45,000 | - | - |
| Internal product owner: half-time for 6 months, then 20 percent | $30,000 | $24,000 | $24,000 |
| Training and process documentation | $8,000 | $3,000 | $3,000 |
| Quality review: 4 hours a week of team leader time | $8,640 | $8,640 | $8,640 |
| **Total cost** | **$106,040** | **$50,040** | **$50,040** |

Notice what is in this list:

- **Internal people time.** Someone has to own the system, adjust its instructions, deal with problems and report results. That is a cost even if they are already on the payroll, because they are not doing something else.
- **Ongoing checking.** The 5 percent quality sample costs real hours every week, forever. It is the price of safety, and it belongs in the case.
- **Ongoing training.** New hires need training, and the process will keep changing.

Costs often missing from AI business cases include data cleanup, security reviews, legal review of the vendor contract, extra usage fees as volume grows, and the time of the pilot users while they learn. Ask about each one.

## Step 5: Put It Together

| | Year 1 | Year 2 | Year 3 | Total |
| --- | --- | --- | --- | --- |
| Benefits | $111,000 | $148,000 | $148,000 | $407,000 |
| Costs | $106,040 | $50,040 | $50,040 | $206,120 |
| **Net** | **$4,960** | **$97,960** | **$97,960** | **$200,880** |

Over three years, Northfield expects to spend about $206,000 and gain about $407,000: a net benefit of about $201,000, or a return of roughly 97 percent on the money spent. The project roughly breaks even in year one and pays well in years two and three.

This is not a spectacular business case. It is a good, believable one. That is exactly what a first AI project should be.

## Step 6: Test What Could Go Wrong

A business case is only useful if you know which assumptions matter most. Change each important assumption and see what happens. This is called sensitivity analysis, and it can be done in a spreadsheet in twenty minutes.

Northfield tested three:

| Scenario | What changes | Three-year net |
| --- | --- | --- |
| Base case | As above | $200,880 |
| Half the adoption | Agents use the drafts on only half the routine emails, so benefits halve | About -$2,600 (break-even) |
| Integration costs double | $90,000 instead of $45,000 | $155,880 |
| Volume grows 15 percent instead of 8 | Four hires were planned, three avoided | About $371,000 |

The result was striking: **the case depends far more on adoption than on cost.** Doubling the integration cost still left a strong return. Halving adoption wiped out the return entirely.

That insight shaped the whole project. Northfield spent more on training, made the AI drafts appear automatically in the agents' normal screen instead of in a separate window, and set adoption as the first metric to watch in the pilot. Chapter 16 explains how.

> **Tip:** In almost every AI business case, adoption is the biggest risk. If people don't use the tool in their daily work, nothing else matters. Look for it in your own sensitivity analysis.

## Step 7: Set the Pilot Targets

Finally, turn the business case into targets the pilot must hit before Northfield spends the money to scale. Priya's team agreed on these:

| Metric | Baseline | Pilot target (after 6 weeks) |
| --- | --- | --- |
| Share of routine emails where agents use the AI draft | 0 | At least 70 percent |
| Average handling time for routine emails | 7 minutes | 5 minutes or less |
| Average time to first reply | 9 hours | 4 hours or less |
| Quality: share of sampled replies with an error | Measure in baseline | No worse than baseline |
| Agent satisfaction with the tool (survey, 1 to 5) | - | 3.5 or higher |

If the pilot hit these, the business case would hold and the rollout would go ahead. If it missed them, the team would find out why and decide whether to fix or stop. Chapter 17 shows how Northfield's pilot actually performed.

## Presenting the Case

When you present an AI business case to a board or a finance committee, keep it to one page with an appendix. The one page should answer:

1. The problem and its cost today.
2. The change, in plain words.
3. Hard benefits, with the line in the budget each one affects.
4. Full costs, including people time and ongoing checking.
5. Three-year net and payback.
6. The biggest risk and how you will manage it.
7. Pilot targets and the decision date.

Marcus approved Northfield's case on the second reading. His comment: "It's the first AI proposal I've seen that lists the boring costs. That's why I believe the benefits."

## For Smaller Companies

The same steps work at any size; the numbers are just smaller. A 25-person accounting firm might find that AI drafting of client emails and meeting notes avoids hiring one administrator as the firm grows ($45,000 a year), against costs of $9,000 a year in licenses and a few days of setup time. The structure, hard benefits against full costs, with adoption as the main risk, is identical.

## Key Points

- Start from a measured baseline: volumes, times, costs, overtime and planned hires.
- Time saved is not money saved. Count only benefits that change a budget line: avoided hires, lower overtime or contractors, measurable revenue.
- List everything else as upside, not counted.
- Include every cost: licenses, integration, internal people time, training and ongoing checking.
- Test the assumptions. In most AI cases, adoption matters more than cost.
- Turn the business case into pilot targets with a decision date.

## Questions for Your Leadership Team

1. For our flagship use case, which budget line will actually change?
2. What costs are we tempted to leave out because they are "already paid for"?
3. Which assumption, if wrong, would break our case?
4. What pilot results would convince our CFO to fund the rollout?
5. Who will present the case, and are they prepared to stop the project if the numbers don't come through?
