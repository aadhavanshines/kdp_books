# Chapter 10: Project 6: Defect Triage

Defect reports arrive from everywhere: the HIL bench, vehicle testers, code reviews, customer clinics. They're written in a hurry, by people with different vocabularies, and the same problem is often reported two or three times in different words. Somebody has to read each one, decide which component it belongs to, suggest a severity, and spot the duplicates before two engineers fix the same bug. This chapter builds a triage assistant for that work, measures it with confusion matrices, and draws a clear line around the one decision it must not make.

## The Reports

The WLC-200 has thirty defect reports, written the way real reports are: some precise, some vague, some written by people outside engineering. Here are three of them:

```
@include projects/wlc200/defects/defects.json#L3-L8
```

```
@include projects/wlc200/defects/defects.json#L27-L32
```

```
@include projects/wlc200/defects/defects.json#L83-L88
```

The first is a precise bench report with measured values. The second comes from a vehicle tester and describes a symptom. The third, two weeks later, describes the same symptom as the second in different words. Before the project was built, an engineer labelled every report with its component, its severity and, where it applied, the earlier report it duplicates. Seven reports are duplicates.

## The Triage Prompt

The prompt defines eight components by what would have to change to fix the defect, four severity levels with concrete examples, and what counts as a duplicate:

```
@include projects/p06-defect-triage/triage.py::SYSTEM
```

Two definitions do most of the work. "Choose the one whose design must change to fix the defect" stops the model from classifying by symptom: a window that stops early on a cold morning is an anti-pinch problem, not a motor problem. "Similar symptoms with different causes or conditions are not duplicates" stops it from merging every late-stop report into one.

## Sending Only What Triage Needs

The first version sent each report whole, including the reporter's name. Nothing in the task needs it, so the final version sends only the fields triage uses:

```
    # Send only what triage needs: no reporter names
    needed = [{k: d[k] for k in ("id", "date", "found_in", "title", "description")}
              for d in defects]
    prompt = "Triage these defect reports:\n\n" + json.dumps(needed, indent=1, ensure_ascii=False)
    result = ask(prompt, SYSTEM, SCHEMA, model=model, max_budget_usd=2.00)
```

This is the habit from Chapter 3 in practice: a name is personal data, and leaving it out costs nothing. Both versions were run five times. Removing the names made no measurable difference to accuracy, and saved about 500 input tokens per run.

## Checking the Answer

Code checks that every report was triaged exactly once and that every duplicate points to an earlier report that exists. A duplicate pointing forward in time, or at a report that doesn't exist, is a sign of confusion:

```
@include projects/p06-defect-triage/triage.py::check
```

## Measuring With Confusion Matrices

A single accuracy number hides where a tool goes wrong. A **confusion matrix** shows it: one row for each class the engineer chose, one column for each class the tool chose, and a count in each cell. Everything on the diagonal is agreement. The grader prints one for severity and one for component:

```
python grade.py output/triage-sonnet-run1.json
```

```
@include projects/p06-defect-triage/output/grade-sonnet-run1.txt#L1-L5
```

All five S1 reports were rated S1. Every disagreement is one level, and every one of them is above the diagonal: the tool rated more severely than the engineer, never less. For a triage assistant, that's the safer direction to be wrong in. The component matrix had one disagreement:

```
@include projects/p06-defect-triage/output/grade-sonnet-run1.txt#L7-L15
```

That one was DR-1014: "Motor command stays on 180 ms after switch release at 16 V." The engineer put it under switch input; the tool put it under motor drive, reasoning that the overrun depends on supply voltage. Both are defensible, and the right answer depends on the root cause, which nobody knows yet. Disagreements like this are why triage is a suggestion.

## Duplicates

Every run, with every model, in both versions, found all seven duplicate pairs and reported no false ones. "Window does not move after ignition off" and "Retained power too short"; "Express up stops halfway in cold" and "Auto-up reverses in cold weather without obstacle"; "Hall sensor loss: motor keeps running" and "No DTC when Hall connector unplugged". Matching meaning across different wording is exactly what language models do well, and it's the most time-saving part of this tool.

## Ten Runs

With reporters' names (first version):

| Run | Components | Severity | S1 missed | Duplicates | Cost | Time |
| --- | --- | --- | --- | --- | --- | --- |
| Sonnet 5.5, run 1 | 29 / 30 | 25 / 30 | none | 7 / 7 | $0.069 | 30 s |
| Sonnet 5.5, run 2 | 29 / 30 | 23 / 30 | DR-1018 and DR-1027 | 7 / 7 | $0.069 | 30 s |
| Sonnet 5.5, run 3 | 29 / 30 | 26 / 30 | none | 7 / 7 | $0.068 | 28 s |
| Haiku 5.5 | 29 / 30 | 23 / 30 | DR-1020 | 7 / 7 | $0.012 | 54 s |
| Opus 5.5 | 30 / 30 | 25 / 30 | none | 7 / 7 | $0.140 | 42 s |

Without names (final version):

| Run | Components | Severity | S1 missed | Duplicates | Cost | Time |
| --- | --- | --- | --- | --- | --- | --- |
| Sonnet 5.5, run 1 | 29 / 30 | 25 / 30 | none | 7 / 7 | $0.065 | 33 s |
| Sonnet 5.5, run 2 | 29 / 30 | 25 / 30 | none | 7 / 7 | $0.063 | 33 s |
| Sonnet 5.5, run 3 | 30 / 30 | 26 / 30 | none | 7 / 7 | $0.068 | 35 s |
| Haiku 5.5 | 29 / 30 | 24 / 30 | DR-1020 | 7 / 7 | $0.010 | 50 s |
| Opus 5.5 | 30 / 30 | 26 / 30 | none | 7 / 7 | $0.128 | 52 s |

Components and duplicates were excellent everywhere. Severity agreed with the engineer in 23 to 26 of 30 reports, never more than one level apart.

The column that matters most is **S1 missed**. In one Sonnet run, the two reports of a lost Hall sensor signal, where the motor keeps running into the seal with no fault stored, were rated S2 instead of S1. In both Haiku runs, DR-1020, "Express close works when not normalized", was rated S2; in that state anti-pinch can be inactive, which is why the engineer rated it S1. The same model, with the same prompt, rated the Hall-loss reports S1 in five of six runs. You can't tell from a single run which one you got.

> **Warning:** Never let an AI tool lower a severity, close a report, or decide that a safety-relevant defect isn't one. The triage assistant's severity is a suggestion. In a real deployment, route every report that mentions a safety function (anti-pinch, the Hall sensor, normalization) to an engineer, whatever severity the tool suggests. That routing rule belongs in code, not in the prompt.

## Where the Tool Helps Most

In practice, a validation lead triaging thirty reports would get from this tool:

- **Duplicates found**, with the earlier report named: seven reports that need no separate investigation.
- **A component for each report**, right 29 or 30 times out of 30, to route it to the right team.
- **A severity suggestion with a reason**, to start the discussion, and to flag reports such as DR-1010 ("Switch feels slow", from a customer clinic), which nine of ten runs called too vague to judge, asking for a measurement.

The lead still makes every severity decision, and especially every S1 decision. What changes is the time it takes: reading thirty reports and comparing each with all the others becomes reviewing thirty suggestions with reasons.

## Using It on Real Work

- **Use your defect tool's fields.** Map the components to your organisation's real component list and the severities to your process.
- **Send the minimum.** Titles and descriptions are enough; leave out names, email addresses and attachments unless the task needs them.
- **For a large backlog, compare in batches.** Thirty reports fit in one prompt. For thousands, find candidate duplicates by searching for similar titles first, and ask Claude to compare only the candidates.
- **Measure severity separately**, and look at the S1 row of the confusion matrix before anything else.

## Key Takeaways

- Defining components by "what must change to fix it" and duplicates by "same problem, same conditions" made triage accurate: 29 or 30 components right and all seven duplicates found, in every run.
- Confusion matrices show where a tool errs. Here, severity disagreements were all one level, and almost all in the safe direction.
- Three of ten runs rated a safety-relevant report one level too low. Severity, and every S1 decision, stays with an engineer; route safety-relevant reports to a person in code.
- Removing reporters' names cost nothing in accuracy. Send the minimum.
