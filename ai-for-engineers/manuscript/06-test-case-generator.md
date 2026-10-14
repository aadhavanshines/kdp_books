# Chapter 6: Project 2: Test Case Generator with Traceability

Writing test cases is where a validation team spends much of its time, and most of it is careful, repetitive work: read the requirement, choose the conditions and boundary values, write the steps, copy the limit into the pass criteria, record the trace. A generator can draft that in a minute. The danger is just as clear: a test case with a slightly wrong limit looks exactly like a correct one, and it can pass a product that should fail. In this chapter you'll build a generator for the WLC-200 specification, version 1.3, and three checks that make its drafts safe to review: every requirement is covered, every trace is real, and every limit comes from the requirement it traces to.

## What a Good Draft Looks Like

Here is one test case from a real run, for the requirement "While closing in the pinch zone, the controller shall detect a pinch when the pinch force exceeds 80 N":

```
@include projects/p02-test-gen/output/tests-sonnet-run1.json#L273-L289
```

The procedure tests either side of the threshold (79 N and 81 N) and at the edges of the pinch zone (5 mm and 199 mm inside, 3 mm and 201 mm outside), which is standard boundary-value design. The pass criterion copies the limit from the requirement. The trace names one requirement. An engineer can review that in under a minute.

## The Generator

The system prompt asks for coverage, honest traces, conditions and boundary values in the procedure, and limits copied exactly from the requirements:

```
@include projects/p02-test-gen/generate.py::SYSTEM
```

The schema is the result of a lesson you'll see later in this chapter. Each pass criterion is a separate check with a **measure** and a **limit**, so code can read the limits on their own:

```
@include projects/p02-test-gen/generate.py::SCHEMA
```

## Three Checks

The checks work on numbers with units. A small function finds them, and turns a tolerance such as "50 ms ± 5 ms" into the ends of the range as well:

```
@include projects/p02-test-gen/generate.py::NUMBER,values
```

The `(?<![\w.])` at the start and `(?!\w)` at the end make sure a number is a whole word. Without them, the trouble code "B1A01" was read as "1 A", and the check reported that four test cases forgot to test a 1-ampere limit. It took a minute to find, and it's a good example of why the checks need their own tests (Chapter 16).

The values in the specification's definitions section, such as the end positions at 0 mm and 480 mm and the pinch zone from 4 mm to 200 mm, are allowed in every test:

```
@include projects/p02-test-gen/generate.py::definitions
```

Then the three checks:

```
@include projects/p02-test-gen/generate.py::check
```

1. **Coverage.** Every requirement has at least one test case, and every trace points to a requirement that exists.
2. **No invented limits.** Every value in a limit must appear in a requirement the test traces to, or in the definitions. A test that traces to WLC-014 may say 80 N; it may not say 85 N.
3. **No forgotten values.** Every value in a requirement must appear somewhere in a test that traces to it, as a condition, a measure or a limit. A test for WLC-025 ("above 130 °C, limit motor current to 15 A") that never mentions 130 °C has missed the point of the requirement.

The check also lists every `[TBD]` limit, which are questions for the requirement's owner.

## Running It

```
python generate.py ../wlc200/spec/WLC-200-SRS-v1.3.md claude-sonnet-5-5 sonnet-run1
```

```
Terminal output:
30 test cases for 34 requirements; 3833 in / 6885 out tokens, 49 s
uncovered: 0
unknown_traces: 0
ungrounded: 0
limits_not_tested: 0
tbd: 1
    TC-023
```

Thirty test cases cover all 34 requirements; several cover two or three related requirements, such as the overcurrent trouble code, motor stop and fault state that version 1.3 split into three. No limit was invented and no value was forgotten. The one `[TBD]` is a real gap in the specification:

```
@include projects/p02-test-gen/output/tests-sonnet-run1.json#L451-L466
```

WLC-024 asks for a thermal model but sets no accuracy, so no test can pass or fail it. The generator chose a design review and asked for the missing limit, which is what a careful engineer would do. The Requirements Reviewer in Chapter 5 had flagged the same requirement as borderline.

## Five Runs, Three Models

| Run | Test cases | Invented limits | Forgotten values | TBD | Output tokens | Cost | Time |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Sonnet 5.5, run 1 | 30 | 0 | 0 | 1 | 6,885 | $0.087 | 49 s |
| Sonnet 5.5, run 2 | 30 | 0 | 0 | 1 | 6,352 | $0.081 | 44 s |
| Sonnet 5.5, run 3 | 30 | 0 | 0 | 1 | 6,443 | $0.082 | 44 s |
| Haiku 5.5 | 33 | 0 | 1 | 15 | 61,205 | $0.034 | 258 s |
| Opus 5.5 | 30 | 0 | 0 | 3 | 15,224 | $0.338 | 137 s |

All five runs covered every requirement and invented no limits. Sonnet was remarkably consistent. Haiku 5.5 wrote nine times as many output tokens, took over four minutes and marked fifteen limits as TBD, many of them for requirements that do give a limit; its draft would cost a reviewer more time than it saves. Opus raised two extra TBD questions that were reasonable (how soon must the motor stop at the end position, and after a Hall sensor fault?), at four times Sonnet's cost.

## The Lesson in the Schema

The first version of the generator asked for pass criteria as one free-text field, and the "no invented limits" check read all of it. The first run produced 11 warnings. Seven were the checker's fault: it didn't yet know about the definitions section or tolerances, so it flagged the 0 mm and 480 mm end positions and the 45 ms and 55 ms ends of "50 ms ± 5 ms". After those fixes, four warnings remained, and they were interesting:

```
Terminal output:
ungrounded: 4
    TC-001: 12 V not in WLC-001
    TC-003: 6.1 V not in WLC-003
    TC-021: 0.9 s not in WLC-022
    TC-028: 23 °C not in WLC-035
```

None of these is an invented limit. 6.1 V is a test point just above the 6.0 V threshold; 0.9 s is just below the 1 s normalization time. They are good test design written in the wrong place. Then the second and third runs came back with 49 and 32 warnings, because those drafts put more of their boundary values into the pass criteria ("no detection at 79 N, detection at 81 N").

The checker could have been made cleverer, trying to tell a test point from a limit by reading the sentence. Instead, the schema was changed so that limits have their own field and the prompt says boundary values belong in the procedure. With that one change, every run in the table above had zero warnings. When the output's structure matches the check, the check becomes simple and reliable.

## What the Checks Don't Catch

The checks prove coverage, traces and limits. They don't prove that a procedure is good. One Sonnet draft for the stop-time test contained this step:

```
"Trigger a pinch at 300 mm... not in zone; instead trigger at 190 mm and 10 mm, and 160 mm (reversal to fully open limit case) using the position model; also a case where less than 150 mm of travel remains to fully open."
```

The model corrected itself in the middle of the step, and left the correction in the text. Every check passed. An engineer reading it would fix it in seconds, and a technician following it on the bench would be confused. That's why the drafts go to an engineer, not straight into the test management system.

## Using It on Real Work

- **Feed it your template.** Replace the procedure and pass criteria fields with the fields of your test management tool, and add your naming rules to the prompt.
- **Keep your test techniques in the prompt.** If your process asks for equivalence classes, boundary values or fault injection for certain requirement types, say so.
- **Import drafts, not tests.** Load the CSV into your tool as drafts with a status such as "AI draft, not reviewed", and keep the review as a recorded step.
- **Review the TBDs first.** They are questions for the requirement owners, and answering them improves the specification as well as the tests.

## Key Takeaways

- Three checks make generated test cases safe to review: coverage and real traces, no invented limits, no forgotten values.
- Separate limits from test points in the schema; it made the check simple and removed every false alarm.
- Sonnet 5.5 produced consistent drafts in about 45 seconds for eight cents; Haiku 5.5 hedged on too many limits for this task.
- Checks prove structure and numbers, not good procedures. An engineer reviews every draft.
