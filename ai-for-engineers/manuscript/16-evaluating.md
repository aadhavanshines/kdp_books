# Chapter 16: Evaluating Engineering AI: Accuracy You Can Defend in a Review

Sooner or later, someone in a review asks: "How do you know it works?" "We tried it and it looked good" is not an answer an engineer should give about a test tool, and it isn't one for an AI tool either. This chapter collects the evaluation method used in all ten projects into one approach you can defend: what to measure, how to build the answers, how often to run, how to compare models, and how to handle the uncomfortable cases where the tool, the grader or the answers are wrong.

## The Four Parts of an Evaluation

| Part | What it is | In this book |
| --- | --- | --- |
| **Cases** | Inputs that represent the real work, including the hard ones | 36 requirements, 30 defects, 18 questions, two nights of logs |
| **Answers** | What an engineer says the right output is, written before the tool | `labels/` in the WLC-200 data |
| **Grader** | A program that compares the tool's output with the answers | `grade.py` in every project |
| **Runs** | Several runs of the tool, with scores, cost and time recorded | Three Sonnet runs plus Haiku and Opus, per project |

Each part can be wrong, and the rest of this chapter is mostly about catching that.

## Write the Answers First

Labels written after seeing the tool's output are influenced by it, however careful you are. In this book, every answer file was written before its project was built: the review labels, the change truth, the hand measurements of the logs, the defect labels, the expected FMEA failure modes, the knowledge questions. When a tool's output later disagreed, the change was recorded separately (more on that below).

Good cases include the hard ones on purpose:

- **Planted problems** with known answers: a conflict, a duplicate, a missing value, a late stop.
- **Borderline cases** where two answers are acceptable, recorded with an `also` field rather than forced into one.
- **Traps**: questions the documents can't answer, a tie for "the most", a field the database doesn't have. A tool that never says "I don't know" fails these, and that's what you want to find out.
- **Edge cases from review**, such as the short-reversal log in Chapter 8, added when a reviewer finds a bug that the existing cases couldn't show.

## Choose Measures That Match the Risk

One accuracy number rarely tells you what matters:

| Tool | Main measure | Why |
| --- | --- | --- |
| Requirements Reviewer | Recall first, then precision | A missed problem costs more than a finding you dismiss |
| Test Case Generator | Coverage, invented limits, forgotten values | Structural errors that pass a glance |
| Spec Change Impact | Decisions right; silent retirements | A test retired without a word is the dangerous error |
| HIL Log Analyzer | Verdicts and every measured value | A right verdict for the wrong reason hides the next fault |
| Test Report Writer | Numbers and IDs not in the facts | A wrong number in a report is believed |
| Defect Triage | Confusion matrices; S1 missed | Severity errors in one direction matter more than the other |
| FMEA Assistant | Expected failure modes covered | Missing the worst failure mode is the failure |
| Knowledge Assistant | Right facts, quotes verified, "not found" when right | A confident invented answer is the failure |
| Test Database MCP Server | Answers equal to SQL | Exact answers exist, so use them |
| Nightly Assistant | Covered-or-new decisions | A new failure hidden under an old defect is the failure |

## Run It More Than Once

The same prompt and data give different outputs. Across this book's runs, the variation was real and it mattered:

- The requirements reviewer's precision ranged from 0.69 to 0.82 across three Sonnet runs, while recall stayed at 1.0.
- One of six Sonnet triage runs rated the two Hall-loss defects S2 instead of S1. The other five rated them S1.
- FMEA occurrence and detection ratings for the same failure mode moved by up to four points, doubling some RPNs, while severity didn't move at all.
- The FMEA drafts covered 14, 16 and 16 of the expected failure modes in three Sonnet runs.

Three runs is the minimum to see whether a tool is stable. If a result matters for safety, such as an S1 rating, one bad run in six is reason enough to keep that decision with a person, whatever the average looks like.

## Comparing Models

Every project that uses a single model call was also run once with Haiku 5.5 and once with Opus 5.5. The pattern wasn't "bigger is better":

| Project | Sonnet 5.5 (3 runs) | Haiku 5.5 | Opus 5.5 |
| --- | --- | --- | --- |
| Requirements Reviewer | Recall 1.0; precision 0.90 to 1.00 (adjudicated); $0.05 | Recall 1.0; precision 0.69; $0.01 | Recall 1.0; precision 1.00; $0.10 |
| Test Case Generator | All checks clean; 1 TBD; $0.08 | 15 TBDs; 4 minutes; $0.03 | All checks clean; 3 TBDs; $0.34 |
| Spec Change Impact | 26/26; $0.11 | 26/26, but 5 copied limits; $0.02 | 26/26; $0.26 |
| Defect Triage (no names) | Severity 25 to 26/30; no S1 missed; $0.07 | 24/30; one S1 missed; $0.01 | 26/30; no S1 missed; $0.13 |
| FMEA Assistant (method) | 14 to 16 of 16; $0.20 | 11 of 16; a defect list; $0.04 | 13 of 16; $0.39 |
| Knowledge Assistant | 18/18; $0.07 to $0.20 | 17/18; $0.03 | 18/18 (engineer); $0.41 |

Sonnet was the right default for every project: as good as or better than Opus on these tasks at about half the price, and clearly better than Haiku on the tasks that need judgement or coverage. Haiku was fine where the task was narrow and the checks strong (triage of components and duplicates, answering from documents) and weak where the task needed systematic thinking (FMEA) or calibrated caution (test limits). Opus was never better than Sonnet on these tasks, was worse on FMEA coverage, and cost about twice as much. Your tasks may differ, which is exactly why you run the comparison.

> **Tip:** Calculate cost from the token counts and the published prices, as `claude_call.py` does. During this book's runs, the SDK's own estimate was wrong for models newer than the SDK version, once by a factor of forty.

## When the Grader Is Wrong

Graders are code, and code has bugs. This book's graders and checks were wrong at least nine times, in both directions:

| Error | Direction | Found by |
| --- | --- | --- |
| "B1A01" read as "1 A" | False alarm | Reading the flagged items |
| Definitions and tolerances not allowed in limits | False alarm | Reading the flagged items |
| Test points counted as limits | False alarm | Reading the flagged items; fixed in the schema |
| Requirement values looked for only in limits | False alarm | Reading the flagged items |
| A duplicate pair accepted on one side only | Correct answer marked wrong | Reading the "false positives" |
| FMEA keywords too loose | Wrong answers marked right | Comparing the matches with the rows |
| FMEA function name matched exactly | False alarm | Reading the flagged items; fixed with an enum |
| Knowledge key phrase too literal | Correct answer marked wrong | Reading the answer |
| A single release accepted as both releases | Missing value hidden | Writing the grader for both directions |

The habit that caught them is simple: **read the output behind every surprising score**, both the failures and some of the passes. A grader that only ever finds the tool wrong deserves as much suspicion as a tool that's always right. And test the checks themselves with deliberately wrong inputs; the book's offline tests do exactly that.

## When the Answers Are Wrong

Twice, the tool was right, and the answer file was wrong: the requirements reviewer found two real problems the labels had missed, and the log analyzer measured a current of 15.16 A where the truth file said 15.0 A. Handle that with rules you'd defend to an auditor:

1. **Never edit the original answers quietly.** Keep the original file unchanged.
2. **Record the correction separately**, with the date, the old value, the new value and the reason: `review-adjudication.json` and `TRUTH-CORRECTIONS.md` in this book.
3. **Report both scores.** The requirements reviewer's precision is 0.82 against the original labels and 1.00 against the adjudicated ones, and the book shows both.
4. **Ask whether you'd make the change without the tool.** If a colleague showed you the same finding, would you agree? If not, don't change the answer.
5. **Prefer stricter.** One correction in this book made grading stricter (the FMEA keywords), which is the kind that's easy to defend.

## When Everything Passes and It's Still Wrong

The log analyzer passed every grading run on both nights and still had a bug: it treated "fully open" as "back where it started". No case in the data could show it. Two things find bugs like this. One is **reading the code**, as you'd review any test tool. The other is **adding cases from the review**: a short-reversal log, built for the purpose, now fails the old analyzer and passes the fixed one. Graders measure what you thought of; reviews find what you didn't.

## Human Review as Part of the Evaluation

Some outputs can't be fully graded by code: FMEA coverage, paraphrased answers, procedure quality. For those, this book used a two-stage method: a strict automatic grader, then a recorded engineer review of everything the grader rejected. The review decisions live in `engineer-review.json` next to the outputs, so anyone can check them. It's slower than a fully automatic grade, and far more honest than loosening the grader until it agrees with the tool.

## Regrade on Every Change

An evaluation is not a one-off certificate. Rerun the grader when:

- the prompt, schema or checks change (every change in this book was followed by a grading run);
- the model changes, including a new version of the same model family;
- the SDK or another dependency changes;
- the kind of input changes, such as a new product or document template;
- and on a schedule, such as monthly, even when nothing changed.

All the real runs behind this book, about seventy across ten projects including six Claude Code sessions, cost about seven and a half US dollars in total. Evaluation is cheap. Not evaluating is what's expensive.

## Key Takeaways

- An evaluation has cases, answers written first, a grader and several runs; any of them can be wrong.
- Pick measures that match the risk: recall for reviewers, S1 misses for triage, coverage for FMEAs, verified quotes for knowledge.
- Run at least three times; keep safety decisions with people when even one run in six gets them wrong.
- Compare models on your own tasks. Here, Sonnet was the best default; the cheapest model failed tasks needing coverage, and the most capable model tested didn't earn its price.
- Read the output behind every surprising score; test your checks; record corrections to answers separately and report both scores.
- Graders test what you thought of. Code review and new cases find the rest.
