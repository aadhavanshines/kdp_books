# Chapter 16: Evals: How to Know Your Agent Works

Every project so far has ended the same way: run the agent several times, and let code check its work. That practice has a name, **evals** (short for evaluations), and it's the single most important skill in building agents. Without evals, you're guessing. With them, you can change a prompt, switch a model or upgrade the SDK, and know within minutes whether you made things better or worse.

This chapter pulls together everything the book's graders taught: what to check, how to check it, how many times to run, and the surprisingly common ways that evals themselves go wrong.

## Why Agents Need Evals

Ordinary code gives the same output every time, so one test proves something. An agent doesn't. Run the inbox agent three times and you'll get three slightly different reports. Change one sentence in its prompt and some answers improve while others quietly get worse. You can't see that by reading a few outputs; you can only see it by measuring.

An eval is a fixed set of inputs, plus a way to judge the outputs, that you run again and again:

- **before you trust an agent** with real work;
- **after every change** to its prompt, tools, model or SDK version;
- **on a schedule**, to catch changes you didn't make, such as an updated model or a new kind of input.

## What Every Agent in This Book Is Graded On

| Project | Inputs | How it's checked | Results |
| --- | --- | --- | --- |
| Inbox Triage | 24 emails | Labels written by a person; safety checks | Safety passed every run; categories 24/24 in three of four runs after the prompt fix (Chapter 6) |
| Receipt Scanner | 8 receipt photos | Field-by-field truth file; arithmetic flags | 56/56 fields, 8/8 flags, every Sonnet run |
| Research Analyst | 6 documents | Every quote found in its source by code; conflict found; recommendation | 54 of 54 quotes verified over four runs |
| Data Analyst | 3,448 orders | Every number recomputed independently with pandas | 9 of 9 checks, every run of the fixed agent |
| Support Desk | 11 scripted conversations, including attacks | The database after each conversation; words that must not appear | 11 of 11 with Sonnet 5.5 |
| Kitchen Manager | Stock file | Purchase orders checked against computed needs | 5 of 5 runs after the fixes |
| Launch Team | Data, survey, costs | Prices recomputed; prices in the copy; Tamil present; verdict present | 3 of 3 runs |
| ShopMate | Two business days | Sales recomputed; allergy first; scams ignored; memory day to day | Chapter 19 |

## Kinds of Check

The graders use a handful of techniques again and again. In rough order of preference:

**1. Recompute it with code.** If the answer is a number, a total or a date that code can work out, compute it independently and compare. The data analyst's grader recomputes every figure with pandas. The receipt checker re-adds every bill. These checks are exact and free, and they can't be fooled by confident wording.

**2. Check the effect, not the words.** For agents that act, look at what actually changed. The support desk eval reads the refunds table after each conversation. An agent that *says* "I've refunded you" without doing it fails; an agent that refunds while saying "I can't" also fails.

**3. Compare with labels.** For judgements, such as which category an email belongs to, have a person write the right answers first, then measure agreement. Expect some disagreement where reasonable people would differ, and look for patterns in it (Chapter 6).

**4. Verify against sources.** When an agent quotes or cites, check that the quote exists in the source (Chapter 8). It catches invented facts; it can't prove the reasoning is sound.

**5. Look for things that must never appear.** No PIN in a draft reply. No customer's address in a reply to a stranger. No "@" in a reply to "what's my email?". Simple string checks catch serious leaks.

**6. Ask a model to judge.** For qualities code can't measure, such as tone, helpfulness or whether a summary is fair, you can ask a second model to grade the output against a written rubric. It's useful, but slower, more expensive, and itself imperfect, so this book uses it nowhere that a code check would do. If you use it, test the judge on examples you've graded yourself first, and keep its rubric specific.

**7. Have a person read it.** Some things, such as whether a Tamil caption reads naturally or whether a memo's reasoning holds, need a human. Make it a deliberate step, on a sample, not an afterthought.

## Scores and Must-Pass Checks

Keep two kinds of result separate, as the inbox grader does:

- **Scores** measure quality: 21 of 24 categories, priorities within one level. You want them high, and you watch them over time.
- **Must-pass checks** guard against harm: the allergy email must be urgent; scams must never get a reply; refunds must never exceed the order. One failure fails the whole run, however good the scores.

An agent with high scores and one must-pass failure isn't nearly ready. It's not ready at all.

## Run It More Than Once

Because agents vary, one run of an eval tells you little. This book ran most evals three to five times, and reported every run. Repeats show you two things a single run hides:

- **Consistency.** The receipt scanner scored 56 of 56 in every run, so you can trust it on similar receipts. The ShopMate brief passed three of four times in one batch with Sonnet, which told us there was a real problem to find (Chapter 19).
- **Systematic disagreement.** The inbox agent made the *same* three category choices in every run. Repeated, identical disagreement points at unclear instructions, not bad luck.

For an important decision, such as switching models or launching, run more: ten runs of a scenario will show you a one-in-ten failure that three runs would probably miss.

## When the Eval Is Wrong

Evals are code, and code has bugs. This book's evals were wrong at least seven times:

- **Too strict about wording.** ShopMate's check for "butter is low" looked for the word "low", and failed a brief that correctly said "OK: 14 kg in stock ... it is not low". The fix: check the status label, not any word in the sentence.
- **Looking for one word.** ShopMate's check that the allergy case comes first looked for the word "allergy". A correct brief from Opus 5.5 wrote "a reaction to hazelnuts" instead, and failed. The check now also accepts the order number or the customer's name.
- **Not expecting a new label.** Another model described butter as "CRITICALLY LOW". The check only accepted statuses starting with "low" (Chapter 22).
- **Too strict about format.** The receipt grader matched files by exact name. Haiku 5.5 wrote `receipts/receipt-01.jpg` instead of `receipt-01.jpg`, read every receipt correctly, and scored zero. The schema never said which form to use, so the fix went in both places: a clearer schema description, and code that normalises the name.
- **Testing something nobody asked for.** ShopMate's scam check required each scam to be listed by its email ID, but the instructions only said to list them. With Haiku 5.5 that check failed on every brief, while every other check passed. The fix was to ask for IDs in the prompt and to accept either the ID or the sender's address in the check.
- **Expecting one right answer when there were two.** The support desk expected a refund "awaiting approval" for stale brownies; the agent escalated instead, which the policy also allowed.
- **Passing an agent that wasn't running.** When the account hit its usage limit, every request failed instantly, and the support desk eval reported 5 of 11 scenarios passed, because a dead agent pays no refunds and leaks no data. Now any error result, or a run that cost nothing, counts as a failure.

So when an eval fails, read the agent's actual output before changing anything. Sometimes the agent is wrong; sometimes the eval is. And test your eval, too: run it against a deliberately bad output and make sure it fails.

> **Warning:** Never fix a failing eval by loosening it until it passes, unless you've confirmed the agent's answer was genuinely right. An eval you edit to match whatever the agent does measures nothing.

## The Improvement Loop

Evals turn agent building into a repeatable loop:

1. **Measure** the current version, several times.
2. **Read the failures**, not just the scores. Look for patterns.
3. **Decide whether the agent or the eval is wrong.**
4. **Change one thing**: a sentence in the prompt, a tool description, a schema field, a model.
5. **Measure again**, the same way, and compare.
6. **Keep the change** only if the numbers improved and no must-pass check got worse.

The inbox chapter went through this loop once and moved categories from 20 or 21 to 24 out of 24. ShopMate goes through it in Chapter 22, when a model change and a prompt change are compared side by side.

## Building Your Own Eval Set

When you build an agent for real work, start the eval set on the first day:

- **Collect real examples.** Twenty to fifty is a good start: emails, documents, questions, conversations.
- **Cover the range**: the common cases, the difficult ones, the rare but important ones (an allergy, a big refund), and attacks (an email that gives instructions, a customer pretending to be the developer).
- **Write the expected results before running the agent**, so the agent's answers don't influence them.
- **Keep it in version control** alongside the code, and add a new case every time something goes wrong in real use.
- **Keep some back.** A small set you never look at while tuning tells you whether your improvements generalise.

## What Evals Cost

Running evals costs money, but much less than not running them. A full run of the support desk's eleven conversations cost between 8 and 17 US cents with Sonnet 5.5. Two days of ShopMate cost about 15 cents with Sonnet 5.5. Running every agent in this book once cost about a dollar. Chapter 20 runs the ShopMate eval automatically on every proposed change, for a few cents each time.

## Key Takeaways

- An eval is a fixed set of inputs plus a way to judge outputs, run before trusting an agent and after every change.
- Prefer checks code can compute: recompute numbers, inspect the effects, verify quotes, look for forbidden strings. Use labels for judgements, and people for what only people can judge.
- Separate scores from must-pass checks.
- Run evals several times. Repeated identical failures point at unclear instructions.
- Evals have bugs. Read the output before changing anything, test the eval on bad output, and never loosen a check just to pass.
- Measure, read, change one thing, measure again.
