# Chapter 22: Maintain: Upgrades, New Models and Retirement

An agent that works today can stop working without anyone touching it. The model it calls gets updated or retired. The SDK gets a new version. A tool it depends on changes. The business changes what it needs. Maintenance is the work of noticing those changes and handling them deliberately, instead of finding out from a broken brief at 6 in the morning.

This chapter is built on things that actually happened while this book was being written: an SDK too old for a new model, a new model whose cost the SDK couldn't calculate, a model comparison that found two bugs in the evals, and a prompt change made to fix one of them.

## What Changes Under a Running Agent

| What changes | How you find out | What can break |
| --- | --- | --- |
| The model is updated, deprecated or retired | Anthropic's deprecation notices; your evals | Quality, cost, or the agent stops running |
| A new model is released | Release announcements | Nothing, until you switch, but you may be paying too much |
| The Agent SDK has a new version | Its changelog | New features, changed defaults, bug fixes or new bugs |
| An MCP server or library changes | Its changelog; pinned versions protect you | Tools renamed, behaviour changed |
| The data changes shape | Errors, odd briefs, new eval failures | Tools fail or return misleading results |
| The business changes | Talking to the user | The agent does the wrong job well |

The rule for all of them is the same: **change one thing at a time, run the evals, compare, then deploy.**

## The Upgrade Routine

Whenever you upgrade anything (the SDK, a library, the model, the prompt):

1. **Read the release notes.** Look for changed defaults and anything about permissions, tools or output.
2. **Change one version**, in a branch or pull request.
3. **Run the evals**, several times, exactly as before. The GitHub Actions workflow from Chapter 20 does this automatically for every pull request.
4. **Compare** pass rates, cost per run and time per run with the previous results. Read any failures.
5. **Deploy** only if nothing got worse, or if you've decided a trade-off is worth it.
6. **Watch the run log** for the first few days.
7. **Keep a way back.** The previous version is one commit, or one image tag, away.

## A Real Upgrade: The SDK Was Too Old for the Model

Early in this book's testing, the projects were pinned to Agent SDK version 0.2.123. When the support desk's eval was run with Claude Opus 5.5, the scenarios failed instantly with this error:

```
API Error: 400 Claude Code 2.1.215 does not support this model; version
2.1.280 or newer is required.
```

Each Agent SDK release bundles a particular version of the Claude Code engine, and this one predated the model. The fix was an SDK upgrade, done by the routine above: upgrade to 0.2.164, then rerun every project's checks before trusting it. All nine agents passed on the new version, for a total of about one US dollar, and `requirements.txt` was updated to the new pin.

Notice what would have happened without pinning: the next deployment would have installed whatever version was newest that day, and the first sign of a change would have been a production failure.

> **Tip:** When a model needs a newer SDK, the error usually says so, as it did here. Upgrade the SDK on its own first, run the evals, then switch the model as a separate step. Two changes at once make it impossible to tell which one caused a problem.

## A Real New Model: Claude Haiku 5.5

While this book was being written, Anthropic released Claude Haiku 5.5, a fast model priced at 10 US cents per million input tokens and 50 cents per million output tokens (for prompts up to 100,000 tokens; longer prompts cost five times as much): one tenth of the price of Claude Haiku 4.5. That's exactly the moment maintenance is for. Is it good enough to use, and would it really save money?

The first surprise came before any quality question. The SDK printed a warning on every run:

```
[claude-code:unrecognized_model] {"model":"claude-haiku-5-5"}
```

The model worked, but the SDK's built-in price table didn't know it, so its cost estimates were wrong. The support desk's eleven conversations reported a cost of $0.38. Calculated from the actual token counts and the published prices, they cost $0.0195: the estimate was about twenty times too high. An estimate that's wrong in the other direction would be worse, because spending limits based on it wouldn't protect you.

The fix is to calculate cost yourself from the token counts in `ResultMessage.model_usage`, with a price table you keep up to date:

```
@include tests/prices.py::PRICES,cost_from_usage
```

The comparisons below all use this calculation. Two more things showed up in `model_usage`: every run also made a small call to Claude Haiku 4.5, which the engine uses for housekeeping, costing about a tenth of a US cent; and cache reads and writes are priced differently from ordinary input, so leaving them out would understate the cost.

> **Warning:** Your real bill is in the Claude Console. The SDK's `total_cost_usd` is a local estimate. Check it against the Console whenever you start using a new model.

## Comparing Models on Your Own Evals

Published benchmarks tell you how models do on someone else's tasks. Your evals tell you how they do on yours. `tests/model_comparison.py` runs the same graded tasks with four models and records the score, the cost (calculated from tokens) and the time.

### Round 1

| Task | Haiku 5.5 | Haiku 4.5 | Sonnet 5.5 | Opus 5.5 |
| --- | --- | --- | --- | --- |
| Receipts: fields correct (of 56) | 0 | 56 | 56 | 56 |
| Inbox: categories (of 24), prompt v1 | 22 | 18 | 19 | 21 |
| Support desk: scenarios (of 11) | 11 | 11 | 11 | 11 |
| ShopMate: briefs passing (of 4) | 0 | 2 | 3 | 4 |

(Round 1's costs aren't shown. They were calculated with a mistake in our own price table, which charged Sonnet 5.5's cache reads at $0.20 per million tokens instead of $0.10, and the token counts weren't kept to recalculate them. Check your price table against the official pricing page, not against the SDK's estimate, which had the same mistake.)

At first glance, Haiku 5.5 failed the receipts completely and every ShopMate brief. Reading the failures told a different story.

**Receipts: zero, because of a file name.** Haiku 5.5 read every receipt correctly but wrote each file name as `receipts/receipt-01.jpg` instead of `receipt-01.jpg`. The grader matched by exact name, found nothing, and scored zero. The schema had never said which form to use. The fix went in two places: the schema's description now says "File name, like receipt-01.jpg", and the agent's code normalises the name before saving.

**ShopMate: a check for something nobody asked for.** Every Haiku 5.5 brief failed one check, "every scam ignored, none in today's tasks", while passing all the others. The check required each scam's email ID in the "ignore" list, but the prompt only said to list scams there. Haiku 5.5 named them by sender instead, which was a fair reading of the instruction. So the prompt now asks for "each one ... with its email id (for example "004")", and the check accepts either the ID or a word from the sender's address.

**ShopMate with Sonnet: a WhatsApp message that was too long.** That was the failure Chapter 19 described, fixed with `maxLength` in the schema.

**The support desk: no difference in safety.** All four models passed all eleven scenarios, including the prompt injection and the attempts to get other customers' details. For this agent, the safety comes mostly from the code, which is the same whichever model runs it.

Those were three real problems: two in the evals and one in the agent. None would have been found by running a single model. **A model comparison is also a test of your evals.**

### Round 2, After the Fixes

With the receipt schema fixed, the inbox prompt at version 2 (Chapter 6), the ShopMate prompt at version `brief-v4`, the `maxLength` limit in place, and the grader bugs fixed, the comparison ran again. This time ShopMate ran both days five times for each model, ten briefs in all:

| Task | Haiku 5.5 | Haiku 4.5 | Sonnet 5.5 | Opus 5.5 |
| --- | --- | --- | --- | --- |
| Receipts: fields (of 56), flags (of 8) | 56, 8 | 56, 8 | 56, 8 | 56, 8 |
| Inbox: categories (of 24), prompt v2 | 23 | 20 | 24 | 24 |
| Inbox: safety checks | Pass | Pass | Pass | Pass |
| ShopMate: briefs passing (of 10) | 4 | 6 | 10 | 10 |
| Receipts cost | $0.006 | $0.054 | $0.076 | $0.202 |
| Inbox cost | $0.010 | $0.064 | $0.103 | $0.223 |
| ShopMate cost per brief | $0.014 | $0.040 | $0.064 | $0.161 |
| ShopMate time per brief | 75 s | 48 s | 33 s | 45 s |

Sonnet 5.5 and Opus 5.5 now pass everything. The two Haiku models still fail ShopMate briefs, and reading those failures is more useful than the scores:

**Haiku 4.5 missed scams, and once believed one.** In four briefs it left one or two scam emails out of the "ignore" list. In one, it listed "Check FSSAI food safety licence expiry: renewal available for Rs. 499" as a task for the day, taking the fake renewal email at face value. Another brief's WhatsApp text said "4 refunds pending (Rs. 11,950)", a total that appears nowhere in the data: the rupee check caught a made-up number, exactly as it was designed to.

**Haiku 5.5 listed every scam, but kept turning them into chores.** In six briefs, every scam was correctly ignored, but the agent also added a task such as "Check your FSSAI licence expiry on the official FSSAI site. Do not use the link in the email." That's cautious, and you could argue it's helpful. But the plan's goal is to save Amudha's time, and one of those briefs asked her to "check your Razorpay dashboard directly for the settlement (Rs 46,210)", a figure that existed only in the scam. The check stays strict.

**A fourth bug in the checker.** One Haiku 4.5 brief described butter as "CRITICALLY LOW". The check for day 1 only accepted statuses starting with "low", so it failed a correct answer. The checker now accepts "critically low" and "very low" too. That brief failed anyway, because of the invented refund total, so no score changed, but the next model that writes "CRITICALLY LOW" won't be failed for it. (The third checker bug came earlier in round 2: a correct Opus brief described the allergy case as "a reaction to hazelnuts" without the word "allergy", and the check required that word.)

**One good run isn't the whole story.** Haiku 5.5 scored 56 of 56 on the receipts this time. In two earlier attempts at the same task it scored 42 of 56. In the one we inspected, it had read every receipt correctly but given two of them each other's file names, so the hotel bill appeared under the fuel receipt's name. The arithmetic checks can't catch that kind of mistake; only the truth file did. And Haiku 5.5's ShopMate briefs went from 2 of 4 in one attempt to 4 of 4 in another, before ten briefs showed the real rate of 4 in 10. Small samples flatter cheap models and penalise good ones at random. Run enough to see the pattern.

## Choosing a Model

The comparison doesn't produce one winner. It produces a decision for each agent:

| Agent | Choice | Why |
| --- | --- | --- |
| ShopMate | Sonnet 5.5 | 10 of 10 at 6.4 cents a brief, and the fastest. Opus 5.5 was just as accurate at two and a half times the cost |
| Inbox Triage | Sonnet 5.5, or Haiku 5.5 to save money | Sonnet scored 24 of 24; Haiku 5.5 scored 23 for a tenth of the cost, with every safety check passed |
| Receipt Scanner | Sonnet 5.5 | Every model read the receipts correctly this time, but Haiku 5.5's earlier file-name mix-up is the kind of error code checks miss. If volume makes Haiku 5.5 worth it, send one photo per request, so a mix-up is impossible |
| Support Desk | Sonnet 5.5, with Haiku 5.5 worth a longer trial | All four models passed all eleven scenarios in round 1, and Haiku 5.5 cost a small fraction of the others. The safety lives in the code, but tone with customers needs more than eleven conversations to judge |

Two general lessons:

- **Price per token isn't price per task.** A cheaper model that takes more turns, writes longer answers or needs a retry can cost more per task than its price suggests. Measure the cost of the whole task.
- **Re-run the comparison when things change.** A new model, a new prompt, or a new kind of input can change the answer.

## Versioning Prompts

ShopMate's prompt has a version label, `PROMPT_VERSION` in `config.py`, and every line of the run log records it. When the prompt changed from `brief-v3` to `brief-v4`, the change was one sentence: scams are now listed "with its email id (for example "004")". Treat a prompt change like a code change:

- **Change the version label** in the same commit.
- **Write down why**, in the commit message: "Ask for scam IDs; Haiku 5.5 named scams by sender and failed the scam check."
- **Run the evals** before and after, with the models you use.
- **Look at the run log** after deployment, grouped by prompt version, to confirm that cost and quality moved the way the evals predicted.

## When a Model Is Retired

Anthropic deprecates older models and eventually retires them, with notice in advance, listed on the documentation's model deprecations page. A retired model stops working, so an agent hard-wired to it stops too. Three habits make this painless:

- **Keep the model name in configuration**, not scattered through the code. ShopMate reads it from `SHOPMATE_MODEL`.
- **Set a `fallback_model`**, so a temporary outage of the main model doesn't stop the run.
- **Check the deprecation page every few months**, and run your model comparison on the replacement well before the retirement date.

## A Maintenance Calendar

| How often | What |
| --- | --- |
| Every run | Run log, alerts, health check (automatic) |
| Weekly | Glance at the dashboard; read one output in full |
| Monthly | Compare cost with the Console; ask the user for feedback; review the eval set |
| Every few months | Check for SDK releases and model deprecations; run the model comparison |
| Every change | Evals before and after, on every pull request (automatic) |
| Yearly | Ask whether the agent should still exist |

## Retiring an Agent

The last stage of the lifecycle is the one people forget. Agents should be retired when their job has gone, when something better has replaced them, or when keeping them safe costs more than they save. Signs that it's time: nobody reads the output any more; the users have built a workaround; the evals keep failing for reasons that no longer matter; or the data it was built on has changed beyond recognition.

Retiring ShopMate would take six steps:

1. **Tell the users** and agree a date. Amudha might want a final week of overlap with whatever replaces it.
2. **Stop the schedule**: disable the workflow.
3. **Revoke its API key** in the Console, so a forgotten copy can't run.
4. **Delete or archive its data** according to your retention rules: briefs, tool logs, notes, transcripts.
5. **Archive the code and the evals.** The eval set, in particular, is valuable for whatever comes next.
6. **Write down what you learned.** What worked, what didn't, and what the next agent should do differently.

That last step is how each agent you build makes the next one better.

## Key Takeaways

- Models, SDKs, tools, data and needs all change under a running agent. Change one thing at a time, run the evals, compare, then deploy.
- Pin versions, and upgrade on purpose. A model may need a newer SDK, as Opus 5.5 did here.
- A new model may not be in the SDK's price table. Calculate cost from token counts, and check the Console.
- Compare models on your own evals, and read the failures: comparisons find bugs in the evals as well as in the agents.
- Choose a model per agent, on quality, cost per task and speed together.
- Version prompts like code, and record the version on every run.
- Keep the model name in configuration, set a fallback, and watch for deprecations.
- Plan for retirement: stop the schedule, revoke the key, handle the data, keep the evals, write down the lessons.
