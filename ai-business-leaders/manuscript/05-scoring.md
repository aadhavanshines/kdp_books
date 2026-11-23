# Chapter 5: Scoring and Choosing Your First Bets

A long list of ideas is not a plan. You need a fast, fair way to decide which two or three use cases to try first, and a way to explain the choice to people whose favorite idea did not make the cut.

This chapter gives you a scoring method that fits on one page. It is deliberately simple. The aim is not mathematical precision; it is a structured conversation that leads to a decision your team can defend.

## Three Questions for Every Use Case

Score each candidate from 1 (low) to 5 (high) on three questions.

### Value: How much does it matter if this works?

Consider all four kinds of value from Chapter 1: cost, revenue, speed, and risk and quality. A rough annual estimate is enough at this stage.

| Score | Rough guide for a mid-sized company |
| --- | --- |
| 5 | Clear, measurable effect worth more than $250,000 a year, or tied directly to a top strategic goal |
| 4 | $100,000 to $250,000 a year |
| 3 | $25,000 to $100,000 a year |
| 2 | Under $25,000, or mostly convenience |
| 1 | Hard to name any business effect |

Adjust the dollar bands to your size. A 40-person company might use $50,000 as its top band.

### Feasibility: How easily can we make this work?

Consider data, systems, skills and the process change involved.

| Score | Meaning |
| --- | --- |
| 5 | Works with tools we already have; data is available and clean; small process change |
| 4 | Needs a standard product or a simple connection to one system; data mostly ready |
| 3 | Needs connections to two or more systems, or data cleanup, or a significant process change |
| 2 | Needs custom development or a large data project |
| 1 | Depends on data or technology we don't have |

### Safety: How much can go wrong?

Score this the other way round: a high score means low risk.

| Score | Meaning |
| --- | --- |
| 5 | Internal use only; a person checks every output; no sensitive data |
| 4 | Output reaches customers or suppliers only after a person approves it |
| 3 | Uses personal or confidential data, or a person checks only a sample of outputs |
| 2 | AI takes actions on its own that affect customers, money or employees |
| 1 | Decisions with legal effect on people (hiring, credit, pricing to individuals) without human review |

## The Priority Score

Combine the three scores like this:

> **Note:** Priority score = (Value x 2) + Feasibility + Safety. The maximum is 20.

Value counts double because a use case that works but doesn't matter is a waste of your best people's time. Feasibility and safety count once each because both can be improved with effort, while low value usually cannot.

Treat the scores as a guide for discussion. If the team strongly believes a lower-scoring use case should go first, ask why. Sometimes the answer is a strategic reason the scores missed. Sometimes it is enthusiasm, and the scores are a useful check on it.

## Scoring Northfield's List

Northfield's working group scored all twelve candidates in a two-hour meeting. Each person scored alone first, then the group discussed the biggest disagreements before agreeing on final scores.

| Use case | Value | Feas. | Safety | Priority |
| --- | --- | --- | --- | --- |
| Customer email replies | 5 | 4 | 4 | 18 |
| Quote drafting | 5 | 3 | 3 | 16 |
| Invoice data extraction | 4 | 4 | 4 | 16 |
| Customer history summaries | 3 | 4 | 5 | 15 |
| Catalog product descriptions | 3 | 5 | 4 | 15 |
| Seasonal stock prediction | 4 | 2 | 4 | 14 |
| Product spec answers for staff | 3 | 3 | 4 | 13 |
| Collection emails | 3 | 4 | 3 | 13 |
| Delivery rebooking agent | 4 | 2 | 2 | 12 |
| HR policy questions | 2 | 4 | 3 | 11 |
| Management commentary | 2 | 4 | 3 | 11 |
| Contract review | 3 | 3 | 2 | 11 |

The discussion mattered more than the numbers. Three moments stood out.

**Customer email replies scored highest**, but only after a debate about safety. Priya wanted to send AI replies automatically for simple order-status questions. The group agreed to start with every reply checked by an agent, which raised the safety score from 3 to 4, and to revisit automatic sending after the pilot.

**Quote drafting had the highest value** alongside email. Faster quotes win more business, and the sales director had numbers to prove it. But it needed connections to the product catalog, the pricing system and the customer's account terms. The group kept it as the second bet and started the data work early.

**The delivery rebooking agent was everyone's favorite** in the first round of interviews. It was also the riskiest: an agent changing delivery bookings on its own, with direct effects on customers and drivers. It scored 12. The group agreed it was a good idea for year two, after the company had experience running AI in production.

## Choosing a Portfolio

Don't just pick the top three. Pick a balanced set. A good first portfolio for a mid-sized company has:

- **One flagship:** a high-value process use case that will prove AI can move a number the finance team cares about.
- **One quick win:** a high-feasibility, low-risk use case that delivers something visible within a few weeks, to build confidence.
- **One foundation:** something that prepares data or skills for the next round, such as getting product data into shape.

Northfield chose:

1. **Flagship:** customer email replies (priority 18).
2. **Quick win:** catalog product descriptions (priority 15, feasibility 5). The marketing team could start within days using the approved assistant, with no system connection beyond exporting product data to a spreadsheet.
3. **Foundation:** cleaning and connecting product and pricing data, which quote drafting and product spec answers both needed. This was a data project with AI as the reason, not an AI project itself.

Invoice data extraction also scored 16. The group put it first in line for the next round because the finance team was in the middle of a system upgrade. Timing is a legitimate reason to wait.

## When to Say No

The scoring will produce a list of ideas you are not doing yet. Tell people clearly why. Most ideas fall into one of these groups:

- **Not yet:** good value but low feasibility or safety today. Revisit after the first projects, when data and skills have improved. (Northfield's rebooking agent.)
- **Personal productivity instead:** low value as a process, but useful to individuals with the general assistant. (Northfield's management commentary.)
- **Not worth it:** low value however you look at it. Drop it.

A clear "not yet" with a reason keeps people's ideas coming. A silent "no" stops them.

> **Tip:** Run the scoring again every quarter. Feasibility scores rise as your data and skills improve, and AI products change fast enough that an idea scored 2 for feasibility in January may be a 4 by July.

## For Smaller Companies

With a short list of three to five ideas, you can score them in 20 minutes. The same three questions apply. Most small companies should pick just one use case, do it well, and add the next only when the first is running smoothly.

## Key Points

- Score each use case 1 to 5 on value, feasibility and safety (where 5 means lowest risk).
- Priority = (Value x 2) + Feasibility + Safety, out of 20.
- Use the scores to structure a discussion, not to replace judgment.
- Pick a balanced portfolio: a flagship, a quick win and a foundation.
- Tell people clearly why their idea is "not yet," "personal productivity instead" or "not worth it."
- Re-score every quarter.

## Questions for Your Leadership Team

1. Which of our candidate use cases would most move a number the CFO already tracks?
2. Where are we most likely to overestimate feasibility because of a good demo?
3. Which use cases involve decisions about people, money or legal rights, and so need the most care?
4. What is our flagship, our quick win and our foundation?
5. How will we explain to teams why their idea is not first?
