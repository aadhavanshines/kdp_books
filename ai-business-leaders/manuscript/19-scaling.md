# Chapter 19: From Pilots to an AI-Ready Company

The first 90 days give you one proven use case and a way of working. This chapter is about what comes after: running several use cases at once, funding them sensibly, organizing the people who support them, preparing for AI agents, and keeping your strategy current as the technology keeps changing.

## Scaling One Use Case

Scaling a proven pilot is not just "turn it on for everyone." Plan for:

- **Integration hardening.** Pilot connections are often quick fixes. Production needs proper security, monitoring and support.
- **Training at scale.** The pilot group had close support. Everyone else needs training, floor support and champions.
- **Variations.** Different teams, regions or customer types may need different instructions.
- **Support.** Who users call when something goes wrong, and who fixes it.
- **Monitoring.** The quality sampling and metrics from the pilot, now as a permanent routine.

Roll out in waves, measuring each wave, rather than all at once. Northfield rolled out email drafting branch by branch over eight weeks, starting with the branches whose team leaders had been most supportive.

## Managing a Portfolio

After a year, a mid-sized company might have five to ten AI use cases in production and a few more in pilot. Manage them as a portfolio, like any set of investments:

- **Keep the register current** (Chapter 15).
- **Review quarterly:** results against business cases, using the one-page report (Chapter 17).
- **Re-score the pipeline** each quarter, as feasibility and safety scores change.
- **Balance the portfolio:** some low-risk efficiency projects that pay back reliably, some bigger bets on revenue or new capabilities, and some foundation work on data and skills.
- **Stop things.** If a use case no longer delivers, or a better option appears, switch it off and free the budget.

Northfield's portfolio at the end of year one:

| Use case | Status | Result to date |
| --- | --- | --- |
| Customer email drafting | Production | Close to the business case; year one slightly below (Chapter 17) |
| Catalog descriptions | Complete; maintained monthly | 6,400 descriptions; branch stock calls down |
| Collections drafting | Production (assistant-based) | DSO down 2 days |
| HR policy assistant | Production | Routine HR emails down about a third |
| Supplier contract review | Production | Turnaround from 8 days to 3 |
| Seasonal forecasting | Production (vendor module) | Fewer stockouts on seasonal lines |
| Quote drafting | Pilot | Early results promising; pricing checks strict |
| Invoice processing | Vendor selected | Starting after finance system upgrade |
| Delivery rebooking agent | Tier 3 review | Agent to propose, not act, in first phase |

## Funding AI After Year One

Year-one projects are usually funded one by one. That doesn't scale well. Many companies move to one of three models:

1. **A central AI budget** held by the program lead or AI council, allocated to use cases that pass the business case test. Good for starting out and for shared platforms.
2. **Department budgets** with a central standard: each department funds its own use cases but uses the shared business case template, governance and platforms. Good as AI spreads.
3. **Self-funding:** a share of the proven savings from earlier use cases is reinvested in new ones. This works well in companies where trust in the numbers is high, because it ties future spending to past results.

Whichever you choose, keep two things central: the shared standards (business case, governance, measurement) and the shared platforms (approved assistant, integration tools). Without them, every department reinvents the wheel and governance falls apart.

## Organizing for AI

You probably don't need a large AI department. A mid-sized company typically needs:

- **An AI program lead,** possibly full-time once the portfolio grows.
- **A small enabling team** of two to five people: builders who configure AI tools and integrations, someone who looks after data, and someone focused on training and adoption. Some can be part-time or shared with IT.
- **AI product owners** in each department with a live use case: business people who own the results, not technologists.
- **The champions network.**
- **The AI council** for governance and portfolio decisions.

The most important principle: **business leaders own the results; the enabling team helps them get there.** If AI belongs to IT alone, it will be treated as a technology project and judged by technical milestones. If it belongs to the business, it will be judged by business results.

## Preparing for Agents

AI agents, systems that work through multi-step tasks and take actions in your systems, are the direction much of the industry is moving. They could change processes more deeply than today's assistants. They also bring new risks, because they act.

You don't need to rush, but you do need to prepare. The best preparation is the work in this book:

- **Clean, connected data,** because agents need to read your systems reliably.
- **Clear, written processes and rules,** because an agent can only follow rules that exist.
- **Governance that handles actions,** with clear limits on what an agent can do alone, what needs approval, and how every action is logged.
- **Experience with assisting AI first,** because the instructions, checks and metrics you build for Level 1 and Level 2 (Chapter 9) are the foundation for agents.

When you start, use the same pattern as the rest of this book:

1. **Propose before acting.** The agent prepares the action; a person approves it.
2. **Act within narrow limits.** Once proposals are reliably right, let the agent act on its own in one narrow category, with a monetary or scope limit.
3. **Expand on evidence.** Widen the limits one step at a time, measuring at each step.
4. **Keep a way back.** People can always see what the agent did, reverse it, and switch it off.

Northfield's delivery rebooking agent will begin by proposing new delivery slots and drafting customer messages for a dispatcher to approve. Only if proposals are accepted unchanged most of the time for a full quarter will it be allowed to rebook small, local deliveries on its own.

## Keeping Your Strategy Current

AI changes faster than almost any technology you have dealt with. Models improve, prices fall, new products appear and old ones disappear within months. How do you plan for that?

- **Plan in short cycles.** A one-year direction, a quarterly portfolio review, and 90-day execution plans.
- **Avoid deep lock-in.** Prefer shorter contracts, exportable data and configurations, and designs that let you switch models.
- **Re-test what didn't work.** A use case that failed for technical reasons a year ago may work today. Your quarterly re-scoring will catch this.
- **Keep the fundamentals.** Whatever changes in the technology, the method in this book (problem first, baseline, honest business case, pilot, evidence, governance, people) stays the same.

## What an AI-Ready Company Looks Like

After two or three years of disciplined work, an AI-ready company is not one that uses AI everywhere. It is one that:

- Has leaders who use AI themselves and understand its strengths and limits.
- Can turn a business problem into a measured AI pilot in weeks, not months.
- Decides on evidence and stops what doesn't work.
- Has clean, connected data where it matters most.
- Runs light, trusted governance and a current register of everything in use.
- Has employees who are skilled, confident and honest about how they use AI.
- Can point to a set of use cases that measurably improved costs, revenue, speed or risk, and explain each one in a sentence.

That last point is the real test. When your board, your bank or a new investor asks "What has AI done for this company?", you should be able to answer with numbers they believe.

## Key Points

- Scale proven pilots in waves, with hardened integrations, training, support and monitoring.
- Manage AI use cases as a portfolio: review quarterly, re-score the pipeline, and stop what doesn't deliver.
- Keep standards and platforms central even as funding moves to departments.
- Business leaders own the results; a small enabling team helps them.
- Prepare for agents with clean data, written rules, action-aware governance and experience with assisting AI. Let agents propose before they act.
- Plan in short cycles and avoid deep lock-in, because the technology keeps changing.

## Questions for Your Leadership Team

1. How will we fund AI use cases after the first year?
2. Who owns AI results in each of our departments?
3. Which of our processes are written down clearly enough for an agent to follow?
4. Where are we most at risk of lock-in to one vendor?
5. In two years, what do we want to be able to say AI has done for this company?
