# Chapter 15: Project 10: The Nightly Validation Assistant

Every morning, a validation team asks the same questions about the night before: what failed, is it new, is a defect already open for it, and what should we do today? This capstone project answers them before anyone arrives. It reuses the analyzer from Chapter 8 and the report writer from Chapter 9, adds one new step (matching failures to open defects and drafting new ones), checks everything, and leaves a summary, a Word report and a page of defect drafts for the engineer on duty. It files nothing and approves nothing.

## The Pipeline

![The nightly pipeline: the analyzer measures the logs; code stores the results; Claude matches failures to open defects or drafts new ones; the report writer produces the Word report; code checks everything; a summary waits for the engineer, who decides in the morning.](images/diagram-nightly.png)

Two of the six steps use Claude, and both are drafting steps whose output code checks. The measuring, the storing and the checking are plain code. Here is the whole program's main function:

```
@include projects/p10-nightly/nightly.py::main
```

Each step is a function you have already met or can read in a minute.

**Step 1: analyse.** The analyzer from Chapter 8 runs as a separate program, exactly as a person would run it. If it fails, the pipeline stops; a night without analysis must never produce a report.

**Step 2: store.** The night's results go into a working copy of the test database, so the report can show the history including tonight. Running the same night twice replaces its results instead of adding them again.

**Step 3: match failures to defects.** This is the new step.

**Step 4: write the report**, with the report writer from Chapter 9, unchanged except that it reads the working database.

**Step 5: check**, and **step 6: summarise**.

## Matching Failures to Defects

For each failure, Claude decides whether an open defect already covers it. If one does, it says what to add to that defect; if not, it drafts a new defect report. It gets the night's failures, with their run conditions, measured values and anomalies, and every open defect with its description:

```
@include projects/p10-nightly/nightly.py::SYSTEM
```

As in the report writer, the `test` field is an enum of tonight's failing tests, so Claude can't skip a failure or invent one. Code then checks the decisions: every failure has exactly one decision, every defect it names is really open, every new draft states the measured value that failed, and every related defect it cites exists:

```
@include projects/p10-nightly/nightly.py::check_triage
```

## Night 1: 6 October

```
python nightly.py ../wlc200/hil/2026-10-06
```

```
@include projects/p10-nightly/nightly-log.txt#L1-L5
```

Two of the three failures were matched to their open defects, and one was new. Here is the draft for the new one:

```
@include projects/p10-nightly/output/2026-10-06/defect-drafts.md#L7-L12
```

It has a specific title, the measured value and the limit, the exact time of the gap, and the right relationship to DR-1016: "a similar symptom ... but seen during TC-DG-03 diagnostic requests, so it is related and not the same." That distinction is exactly what the engineer's answer file asks for. Marking it as a duplicate of DR-1016 would have hidden a new failure under an old report.

For the two known failures, the assistant said what to add to the existing defects, including that the thermal failure was "worse than the single movement in the report": the window had opened fully above 140 °C.

## Night 2: 7 October

The next night ran new software, rc4. The CAN and thermal faults were fixed; the cold anti-pinch fault was still there; and there was a new failure, a late stop at 16 V.

The first run on this night got both decisions right, and its draft for the new failure was honest about a gap: "Supply voltage and temperature for this run are not given in the facts and must be added from the run log." It was right. The analyzer records each run's conditions, but the pipeline didn't pass them to Claude. That was a one-line fix in `triage_failures`, adding `conditions` to the facts for each failure. The second run's draft:

```
@include projects/p10-nightly/output/2026-10-07/defect-drafts.md#L3-L8
```

With the conditions, the draft does what a good test engineer would. It puts 16 V and 23 °C in the title, links DR-1014 (another problem seen at 16 V) instead of DR-1004, and draws the important conclusion: the late stop "now appears at high voltage and room temperature too, not only in the cold." That changes how the anti-pinch team will look at DR-1001. The note it drafted for DR-1001 says the same.

## Grading

The engineer's answer file says, for each night, which failures belong to which open defect and which need a new draft:

```
@include projects/wlc200/labels/nightly-truth.json
```

| Night | Run | Decisions right | Check problems | Cost | Note |
| --- | --- | --- | --- | --- | --- |
| 6 October | 1 | 3 of 3 | 0 | $0.096 | Related defect told apart from a duplicate |
| 7 October | 1 | 2 of 2 | 0 | $0.084 | Draft lacked voltage and temperature |
| 7 October | 2, with run conditions | 2 of 2 | 0 | $0.050 | Draft names 16 V and 23 °C and links DR-1014 |

The cost covers both Claude steps, defect matching and the report. The analyzer, as always, costs nothing. At five to ten cents a night, a year of nightly reports and defect drafts costs roughly what one hour of an engineer's time does.

## Running It Every Night

The pipeline is an ordinary program, so any scheduler can run it after the bench finishes. On a Linux build server, a cron line such as this runs it at 6:15 every morning:

```
15 6 * * *  cd /opt/wlc200/projects/p10-nightly && python nightly.py /data/hil/$(date -d yesterday +\%F) >> nightly.log 2>&1
```

Windows Task Scheduler and CI systems such as GitHub Actions or Jenkins work just as well. Whatever runs it, four things matter more than the scheduler:

1. **The key is a secret.** Keep `ANTHROPIC_API_KEY` in the scheduler's secret store, never in the script.
2. **Failures must be loud.** If the analyzer fails, the bench produced no logs, or a check reports problems, the summary must say so in its first line, and someone must be told. A quiet failure looks exactly like a quiet night.
3. **Limits stay on.** `max_budget_usd` is set on every Claude call; a monthly limit in the Console catches the rest.
4. **Nothing leaves the drafts folder by itself.** The pipeline never writes to the defect tracker. An engineer copies a draft into the tracker after reading it, or decides it isn't a defect.

> **Note:** The two nights in this chapter were run by hand. The scheduling advice is standard practice, not something this book ran for weeks. Before relying on a scheduled pipeline, run it by hand for a couple of weeks next to the old way of working, and compare.

## What the Engineer Sees in the Morning

The output folder for each night holds:

| File | Made by | Contents |
| --- | --- | --- |
| `summary.json` | Code | Failed tests, the decision for each, check problems, cost |
| `report-<night>-nightly.docx` | Code and Claude | The Word report from Chapter 9, with tonight in the history |
| `defect-drafts.md` | Claude, checked by code | Notes for existing defects and drafts for new ones |
| `results.json` | Code | The analyzer's full results |
| `report-nightly.json` | Code | The fact sheet and Claude's text, for the record |

Reading the summary and the drafts takes a few minutes. Deciding what to do about a new failure at 16 V still takes an engineer, and that's the point.

## Key Takeaways

- The nightly assistant combines proven parts: code measures and stores, Claude matches failures to defects and drafts, code checks, an engineer decides.
- An enum of tonight's failures, plus checks on defect IDs and measured values, keeps the drafting step honest.
- On two nights, every decision was right. Claude told a related defect from a duplicate, and, once given the run conditions, drew the conclusion an engineer needed: the late stop isn't only a cold problem.
- When a draft says a fact is missing, believe it, and add the fact to the pipeline.
- Schedule it like any production job: secrets in a secret store, loud failures, spending limits, and nothing filed without a person.
