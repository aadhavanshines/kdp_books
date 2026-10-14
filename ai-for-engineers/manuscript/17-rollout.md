# Chapter 17: Rolling It Out: Pilots, Metrics, Training and Governance

A tool that works on your laptop is a prototype. A tool that thirty engineers use every day, that an auditor can ask about, and that still works after the next model release is a product. Most AI initiatives in engineering fail in the step between the two: not because the model was wrong, but because nobody owned the tool, nobody measured whether it helped, people didn't trust it, or they trusted it too much. This chapter is a plan for that step, built on the habits of the earlier chapters.

## Start With One Pilot

Pick one tool, one team and one real task for six to eight weeks. A good first pilot has:

- **A frequent task**, so the team uses the tool often enough to learn it. The nightly report (Chapter 15) and requirement reviews (Chapter 5) are good candidates.
- **A checkable output**, so you can measure quality. Every project in this book has one.
- **A modest consequence of errors**, so mistakes during learning are cheap. Start with tools that draft for review, not tools whose output feeds a decision.
- **A willing team lead**, who will report honestly what didn't work.

Avoid starting with the tool that would save the most time if everything went well. Start with the one most likely to show clearly whether it helps.

## Measure Before and After

Decide the measures before the pilot starts, and measure the current way of working first. Useful measures for engineering tools:

| Measure | How to collect it | Watch out for |
| --- | --- | --- |
| Time per task | Engineers log time for a sample of tasks, before and during the pilot | Time saved drafting can be lost reviewing |
| Review findings | How many corrections the reviewer makes to AI drafts, and of what kind | Fewer corrections can also mean less careful review |
| Quality escapes | Problems found later that the tool's output should have caught | Small numbers; collect them over months |
| Grader scores | Rerun the grader monthly and after every change | A grader only covers the cases you have |
| Usage | How often the tool is used, by whom | High use isn't the same as value |
| Cost | Token cost per task, from the tool's own records | Small in this book: cents per task |

Two numbers from this book give a sense of scale. A checked requirement review of 36 requirements took about 40 seconds and five cents; a checked nightly report took 16 seconds and six cents. The cost of the AI is almost never the issue. The cost of the engineer's review time, and of errors that get through, is what matters.

> **Warning:** Be careful with "hours saved" figures. If an engineer saves an hour drafting test cases and then spends forty minutes reviewing them carefully, the real saving is twenty minutes, and the careful review is the part you must protect. A pilot that reports large savings and no review findings should worry you.

## Train People to Review, Not Just to Prompt

Most AI training teaches people to write prompts. Engineers using tools like these need something different: how to review AI output well.

- **Know the tool's typical errors.** From this book: invented limits in test cases (caught by checks), a model that follows evidence and misses never-seen failure modes, conclusions drawn from missing facts, procedure text with a self-correction left in, ratings that vary between runs. Show reviewers real examples from your own pilot.
- **Know what the checks cover and what they don't.** A number check proves the numbers exist, not that the reasoning is right. A coverage check proves every requirement has a test, not that the test is good.
- **Review the reasons, not just the result.** The FMEA draft explains each rating; the reviewer should argue with the reason.
- **Record the review.** Who reviewed what, and what they changed. It's both quality evidence and the best data for improving the tool.

A one-hour session with real outputs from your pilot, including the bad ones, teaches more than a day of prompting tips.

## Governance: Who Owns What

Every tool in use needs answers to a few questions, written down in one place, such as a **tool register**:

| Question | Example answer for the Test Report Writer |
| --- | --- |
| Who owns the tool? | Validation tools team, named owner |
| What is it for, and what is it not for? | Drafting the nightly report; not for release decisions |
| What data does it send, to which service, under which terms? | A fact sheet without names, to the Claude API under the company's commercial agreement |
| Which model, prompt and checks are in use? | Sonnet 5.5; prompt and checks at version 3 in the repository |
| How was it validated, and when was it last revalidated? | Three graded runs, October 2026; monthly regrade |
| Who reviews its output? | The test lead on duty |
| What happens when it fails? | Report written by hand; incident logged with the owner |
| How is a change approved? | Owner reruns the grader; test manager approves |

Add the tool's classification from your tool qualification procedure (Chapter 13) and you have most of what an auditor will ask.

### Changes

Treat changes to the prompt, the checks, the schema or the model as tool changes. The process in this book is light enough to follow every time: change, rerun the grader, compare with the previous scores, record the decision. Pin model IDs in the code, so a provider's new release never changes a validated tool silently.

### Incidents

When a tool's output causes or nearly causes a problem (a wrong limit reaches a test specification, a report states a wrong conclusion), handle it like any process escape: contain it, find the cause, fix the tool or the check, and add a case to the grader so it can't happen again. Chapter 8's edge-case log is an example of that last step.

## Scaling Up

After a successful pilot, scale carefully:

1. **Same tool, more teams.** Each new team adapts the prompt to its templates and writes labels for a sample of its own data. Grade before use.
2. **More tools, same team.** Add tools whose inputs and checks already exist. The nightly assistant reuses the analyzer and the report writer; its new parts are small.
3. **Shared building blocks.** The helper that calls Claude, the price table, the number-check function and the grader pattern are reused in every project in this book. A small internal library saves each team from rebuilding them, and from repeating their mistakes.
4. **A shared evaluation habit.** Keep every tool's grader running on a schedule, and show the scores on a simple dashboard.

## Common Failure Patterns

| Pattern | What it looks like | What to do |
| --- | --- | --- |
| The demo trap | A great demo, no measurements, then quiet disappointment | Labels and graders before rollout |
| Silent drift | Scores drop after a model or prompt change nobody noticed | Pin models; regrade on every change and monthly |
| Rubber-stamping | Reviews get shorter as trust grows | Track review findings; spot-check reviewed outputs |
| Shadow tools | Engineers paste work data into personal chat accounts | Provide an approved tool that's easier to use; Chapter 3's rules |
| One-person tool | Only its author can run or fix it | Owner, register, code in a shared repository |
| Everything is AI | AI used for measurement and arithmetic | Code for facts and arithmetic, AI for language |

## A First Ninety Days

| Weeks | Activity |
| --- | --- |
| 1 to 2 | Choose the pilot task and team; agree measures; write labels for 30 to 50 items; measure the current way of working |
| 3 to 4 | Build or adapt the tool; grade it on the labels over several runs; fix what fails |
| 5 to 10 | Pilot: the team uses the tool on real work, records reviews and time; weekly short review of problems |
| 11 to 12 | Compare measures; decide to stop, adjust or scale; write the tool register entry; plan the next tool |

## Key Takeaways

- Start with one frequent, checkable, low-consequence task, one willing team, and measures agreed before the pilot.
- Measure review findings and quality escapes, not only time saved; protect the review.
- Train people to review AI output, using real examples of its typical errors.
- Give every tool an owner and a register entry; treat prompt, check and model changes as tool changes, and regrade before every change.
- Scale with shared building blocks and a standing evaluation habit.
