# Chapter 17: Measuring What Matters

The rule in this book's title depends on measurement. You can't prove anything before you scale if you don't measure the right things, in the right way, before and after. This chapter shows what to measure, how to keep measurement honest, and how Northfield's pilot turned out.

## Four Layers of Metrics

Measure every AI use case at four layers. Each answers a different question.

| Layer | Question | Examples |
| --- | --- | --- |
| 1. Adoption | Are people using it? | Share of eligible tasks where AI is used; active users per week |
| 2. Quality | Is it good enough? | Error rate in sampled outputs; edit rate; complaints |
| 3. Process | Is the work faster or better? | Handling time; turnaround time; throughput; backlog |
| 4. Business | Is the company better off? | Costs avoided; revenue; margin; customer retention |

The layers build on each other. No adoption means no process change. Poor quality means people stop using it, or worse, keep using it and cause damage. Process improvement without a business effect means the saved time went nowhere.

Many AI programs report only Layer 1 ("70 percent of staff used the assistant this month"). That tells you almost nothing about value. Many others jump straight to Layer 4 with numbers no one can trace. Measure all four.

## Keeping Measurement Honest

AI results are easy to overstate, usually without anyone intending to. Five habits keep you honest.

**1. Measure the baseline the same way as the pilot.** If the baseline handling time came from a sample of 50 emails timed by hand and the pilot figure comes from the help desk system, they are not comparable.

**2. Use a comparison group where you can.** If some teams or branches use AI and others don't yet, compare them over the same period. This separates the AI's effect from seasonal swings, new hires and everything else changing at the same time.

**3. Watch for the novelty effect.** Teams in a pilot often work harder because they are being watched. Keep measuring for several weeks after the excitement fades.

**4. Count the checking time.** If handling time drops but team leaders now spend hours reviewing AI output, include their time.

**5. Report what didn't work.** A results summary that only lists successes isn't trusted. Show the misses and what you learned.

## How Northfield's Pilot Performed

The customer email pilot ran for six weeks: 12 volunteer agents for the first two weeks, then all 38 agents. The team compared results with the four-week baseline and with the same weeks of the previous year to allow for seasonal patterns.

| Metric | Baseline | Target | Week 6 result | Met? |
| --- | --- | --- | --- | --- |
| Share of routine emails using AI draft | 0 | At least 70% | 76% | Yes |
| Handling time, routine emails | 7.0 min | 5.0 min or less | 4.8 min | Yes |
| Time to first reply | 9 hours | 4 hours or less | 3.5 hours | Yes |
| Errors in sampled replies | 2.1% | No worse | 1.8% | Yes |
| Agent satisfaction (1 to 5) | - | 3.5 or higher | 3.9 | Yes |

All five targets were met. But the averages hid three things the team needed to know.

**Adoption took time.** Week two adoption was 41 percent; it reached 70 percent only in week five, after the fixes in two skeptical branches (Chapter 16). If the pilot had been judged at week three, it would have looked like a failure.

**Some email types didn't improve.** Drafts for questions about special orders were edited heavily and saved little time, because the special-order system wasn't connected. The team excluded them from the rollout and added the connection to the year-two plan.

**Quality checking took longer than planned at first.** Team leaders spent about seven hours a week on the quality sample in the early weeks, not four, because they were still learning what to look for. By week six it was down to about four.

On these results, the AI council approved the rollout. The decision note was half a page: targets met, two exclusions, one open issue (the special-order connection), and a commitment to report actual hiring and overtime figures at six and twelve months.

## Twelve Months Later

At the twelve-month review, Northfield compared actual results with the business case:

| Item | Business case, year 1 | Actual, year 1 |
| --- | --- | --- |
| Avoided hires | 2 hires, from month 4 | 2 hires avoided; 1 planned hire made |
| Overtime | Down 50% at full run rate | Down about 45% |
| Hard benefit | $111,000 | About $108,000 |
| Total cost | $106,040 | About $112,000 |
| Net | $4,960 | About -$4,000 |

Year one came in slightly below break-even, mostly because the integration took longer than planned and the extra checking time in the early weeks. Year two was on track to match the business case. Marcus's comment at the board meeting: "It came in close to what we said it would. That is why I'm willing to fund the next three."

There were also benefits outside the business case. Customer satisfaction scores for email rose by about six points. Two experienced agents moved into a new role handling key-account service, which the sales director credited with winning back a large contractor. None of this was in the hard numbers. All of it mattered.

> **Remember:** A modest, accurate result is worth more than a large, unprovable one. It earns the trust that funds the next project.

## A One-Page Results Report

For each AI use case in production, report quarterly on one page:

1. **Use case and owner.**
2. **Adoption:** current level and trend.
3. **Quality:** error rate from samples, complaints, any incidents.
4. **Process:** the main process metrics against baseline.
5. **Business:** hard benefits to date against the business case, and costs to date.
6. **Issues and changes:** what went wrong, what was changed.
7. **Next:** what's planned, and any decision needed.

The AI council reviews these each quarter. Use cases that stop delivering are fixed or switched off. Yes, switched off: an AI use case is not a permanent fixture just because it was launched.

## Measuring the Broad Assistant Rollout

The general AI assistant is harder to measure, because people use it for many small tasks. Don't pretend to more precision than you have. Reasonable measures include:

- **Active use:** the share of licensed users who use it weekly. If it stays below about 30 percent after training, reduce licenses or change your approach.
- **A short survey** every six months: what people use it for, roughly how much time it saves, and what gets in the way.
- **Examples:** a collection of real uses, which often become ideas for process use cases.
- **Cost per active user**, not per license.

At Northfield, about 60 percent of office staff used the assistant weekly after six months. The survey's median estimate was two hours saved per person per week. Marcus treated that as a reasonable estimate of value, not a hard saving, and reduced the license count by 15 percent to match actual use.

## Key Points

- Measure four layers: adoption, quality, process and business results.
- Measure the baseline the same way as the pilot, use comparison groups, and keep measuring after the novelty fades.
- Include checking time and report what didn't work.
- Look beneath the averages: adoption curves, email types and team differences tell you what to fix.
- Compare actual results to the business case at six and twelve months, honestly.
- Be willing to switch off use cases that stop delivering.

## Questions for Your Leadership Team

1. For each AI use case we run, can we show all four layers of metrics?
2. Are our baselines measured the same way as our results?
3. Where could we use a comparison group?
4. When did we last switch something off because it wasn't delivering?
5. How do we report AI results to our board, and would a skeptic believe them?
