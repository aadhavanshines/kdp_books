# Part V: Production Apps, End to End

# Chapter 22: Choosing the Right Model for Accurate Results

The projects so far were built with Claude Code's default settings. For a production app that takes real money from real customers, it's worth asking a sharper question: which model, and how much thinking, gives the most accurate code? This chapter answers it with real measurements. The same two coding tasks were given to Claude Haiku, Claude Sonnet, and Claude Opus at different effort levels, and every result was scored by tests the models never saw. The results were clear, and a little surprising.

## Models, Effort, and Why They Matter

Claude Code can run on several **models**, each a different version of Claude with its own balance of skill, speed, and cost. In October 2026, the main choices were:

| Model | Alias | Best for |
| --- | --- | --- |
| Claude Haiku 4.5 | `haiku` | Fast, simple tasks where you check every result |
| Claude Sonnet 5.5 | `sonnet` | Everyday coding: features, fixes, tests |
| Claude Opus 5.5 | `opus` | Complex reasoning: architecture, tricky bugs, security |
| Claude Fable 5.1 | `fable` | The largest and longest tasks, worked through with little supervision |

An **alias** like `opus` always points to the latest version of that model, so you don't need to remember version numbers. Which model you start on by default depends on your plan and your organization's settings. On most paid plans, it's Opus 5.5. The project sessions earlier in this book ran in a cloud environment whose default was Sonnet 5.5, so every project before this part of the book was built with Sonnet.

The second setting is **effort**: how much the model thinks before and during each step. The levels are `low`, `medium`, `high`, `xhigh`, and `max`. Higher effort means more careful reasoning, more checking, and more cost and time. Opus 5.5 and Sonnet 5.5 start at `medium`.

Type `/model` to see the choices:

![The /model picker on a standard account, where the default is Opus 5.5. Use the arrow keys to pick a model, and left and right to change the effort.](images/term-09-model-picker.png)

You can change both at any time:

```
/model opus
/effort high
```

Or choose them when you start a session:

```
claude --model opus --effort high
```

Two more options are worth knowing. The `opusplan` setting uses Opus while you're in plan mode and switches to Sonnet to carry out the plan, which pairs Opus's judgment with Sonnet's speed. And typing the word `ultrathink` anywhere in a prompt asks for deeper reasoning on that one request, without changing your effort setting.

## The Experiment

To see how much the choice matters, two realistic tasks were run in fresh sessions with each configuration, twice each, and scored by 36 hidden tests: tests written and checked independently for this book, which the models never saw. The tests ran on a server set to New York time, to catch any code that silently depended on the machine's time zone.

**Task 1: build from a written spec.** The models received a detailed billing specification for QuickBite, the food delivery app in the next chapters: item totals in paise, delivery fees by distance, a small-order fee, three coupons with conditions, a late-night fee in India time, and GST with specific rounding rules. The prompt:

```
Read BILLING_RULES.md and implement computeBill in src/bill.ts
exactly as specified. Write your own tests in src/bill.test.ts and
run them with npm test before you finish.
```

**Task 2: find the bugs.** The models received a version of the same code with seven planted bugs, the kind real code has: a rounding mistake, a missing check, a discount applied in the wrong order, and a time zone bug. The buggy code passed only 17 of the 36 hidden tests. The prompt gave no hints:

```
Customers report that some QuickBite bills are wrong, but nobody
knows which ones. BILLING_RULES.md is the specification. Review
src/bill.ts against it, fix every bug you find, and add tests in
src/bill.test.ts that would have caught them. Run the tests before
you finish.
```

## The Results

| Model and effort | Task 1 (of 36) | Task 2 (of 36) | Cost per run | Time per run |
| --- | --- | --- | --- | --- |
| Haiku 4.5 | 35, 35 | 19, 20 | about $0.20 | 1.5 to 2 min |
| Sonnet 5.5, medium | 36, 36 | 36, 36 | $0.19 to $0.31 | about 1 min |
| Sonnet 5.5, high | 36, 36 | 36, 36 | $0.33 to $0.49 | 1.5 to 2 min |
| Opus 5.5, medium | 36, 36 | 36, 36 | $0.45 to $0.87 | 1.5 to 3 min |
| Opus 5.5, high | 36, 36 | 36, 36 | $0.49 to $0.79 | 2 to 2.5 min |

Costs are the API list-price estimates Claude Code reported; on a subscription plan, they show how much of your usage each run takes. Fable 5.1 was included in the plan for the experiment but couldn't run: this account had no usage credits for it, and Fable bills to usage credits on some plans.

Three findings stand out.

**1. With a clear spec, Sonnet and Opus were perfect.** Every Sonnet and Opus run passed all 36 hidden tests on Task 1. Haiku came close but missed one rule each time, and a different one each time. In the first run, it treated a blank coupon code as invalid, although the spec said only non-empty codes count. In the second, it recorded the free-delivery coupon as a discount, which changed the tax calculation. Both are the kind of small misreading that slips into production.

**2. On the bug hunt, the gap was dramatic.** Sonnet and Opus found and fixed all seven bugs in every run. Haiku fixed five and six. Both Haiku runs missed the same bug: the late-night fee used the *server's* clock instead of India time. Here's the line that should have been caught:

```
const hour = input.orderTime.getHours();
```

`getHours()` returns the hour in whatever time zone the computer running the code is set to. On a server in another country, a 1 p.m. order in Bengaluru could be charged a late-night fee. Sonnet's reply, by contrast, listed it clearly:

```
Claude's reply:
6  Late-night fee used the server's local hour instead of India
   time. Hour is taken from the time shifted by +5:30 (IST).
```

**3. The most important finding: the weaker result looked just as confident.** Haiku's summary of its first run ended:

```
Claude's reply:
All 46 tests pass, including specific tests that would have
caught each bug.
```

That was true on the computer it ran on, which was set to UTC, where the time zone bug happened to be invisible. On a server in New York, the same code charged a late-night fee on a midday order, and 17 of the 36 hidden tests failed. The model didn't lie. Its tests were simply too narrow, and nothing in its reply signaled the gap.

> **Note:** This is a small experiment: two tasks and two runs per setting. Treat it as a demonstration, not a benchmark. Its lessons match the official guidance, though: smaller models suit small, well-checked tasks, and the stronger models earn their cost on investigation, judgment, and anything where a subtle mistake is expensive.

## What About Effort?

On these tasks, raising Sonnet and Opus from medium to high effort didn't change the scores, because medium already scored perfectly. Higher effort did change the *behavior*: the high-effort runs took more steps and tested more edge cases. Anthropic's own guidance describes the same pattern: at higher effort, Claude tests more edge cases and verifies more of its work before answering.

Use the levels like this:

- **low**: quick questions and small, obvious edits you'll review immediately.
- **medium**: the default, for everyday features with a clear scope.
- **high**: bug fixes in existing code, and anything where edge cases are likely, such as money, dates, permissions, and payments.
- **xhigh** and **max**: the hardest problems, such as hunting for security issues. They cost more and can overthink, so try them on a task before adopting them broadly.

## A Practical Recipe for Accuracy

For the production app in the rest of this part, these settings were used, and you can use the same recipe:

| Stage | Model and effort | Why |
| --- | --- | --- |
| Planning the architecture | Opus, high, in plan mode | Big decisions are expensive to undo |
| Building features | Opus or Sonnet, medium | Clear tasks with tests to check them |
| Payments, security rules, money | Opus, high | Subtle mistakes cost real money |
| Debugging a confusing problem | Opus, high | Investigation is where the strong models shine |
| Renaming, formatting, small edits | Sonnet or Haiku, low or medium | Fast and cheap, and easy to check |
| Reviewing finished work | A fresh session or subagent on Opus | A second opinion catches what the author missed |

To make a subagent always use a particular model, set it in the subagent's file (Chapter 17), for example `model: opus` for a security reviewer.

But the model is only half of accuracy. The experiment's real lesson is that **a precise spec plus independent tests** is what turned every result from "looks right" into "proven right." The most accurate setup combines:

1. **A written spec** with the exact rules and edge cases.
2. **The right model and effort** for the stakes.
3. **Tests that the model didn't write**, or at least tests you've read.
4. **Tests that run in more than one environment**: other time zones, a clean install, a phone-sized screen.
5. **A review** by a fresh session or subagent before you ship.

> **Warning:** A stronger model reduces mistakes; it doesn't remove them. Even Opus and Sonnet in this experiment needed a precise spec to aim at, and Sonnet's own summary noted, honestly, that it hadn't confirmed each new test fails on the old code. Keep verifying.

## Best Practices for Choosing a Model

- **Match the model to the stakes.** Use a strong model for anything involving money, security, data, or hard-to-undo decisions.
- **Raise effort for investigation**: bug hunts, reviews, and unfamiliar code.
- **Plan with the strongest model you can**, for example with `opusplan` or Opus in plan mode.
- **Use smaller models for small, checkable tasks**, and check them.
- **Never trust "all tests pass" on its own.** Ask what the tests cover, and run them in a different environment.
- **Write specs with exact numbers and edge cases**; every model performed better with a precise target.
- **Pin a model in subagents** that must always be careful, such as security reviewers.
- **Check `/model` and `/effort`** at the start of important sessions, so you know what you're working with.
- **Re-test when models change.** Aliases move to newer models over time, which is usually an improvement, but your tests are what prove it.

> **Try It:** Pick a small but tricky task from one of your projects, such as a date calculation. Run it once with `/model haiku` and once with `/model opus` and `/effort high`, in separate sessions, with the same prompt. Then run both results through tests you wrote yourself. Where did they differ?

## Key Takeaways

- Claude Code offers several models (Haiku, Sonnet, Opus, and Fable) and effort levels from `low` to `max`. Change them with `/model` and `/effort`.
- In the experiment, Sonnet and Opus were perfect on a well-specified task and found all seven planted bugs; Haiku missed spec details and the time zone bug.
- The weaker result sounded just as confident. Accuracy comes from verification, not from the tone of the reply.
- Use Opus with high effort for planning, money, security, and debugging; Sonnet for everyday building; Haiku for small, checkable tasks.
- A precise spec, independent tests, testing in more than one environment, and a fresh review matter as much as the model.
