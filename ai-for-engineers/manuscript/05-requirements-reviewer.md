# Part II: The Requirements-to-Test Chain

# Chapter 5: Project 1: Requirements Reviewer

Every test engineer has met a requirement like "The window shall close quickly." You can't test it, so someone has to go back to the author, and by then the design is under way. Requirements reviews catch these problems early, but they're slow, and a reviewer reading requirement 280 of 300 is not as sharp as at requirement 3. In this chapter you'll build a reviewer that checks every requirement against a defined set of problems, quotes the words that cause each problem, and proposes a rewrite. Then you'll do what makes it trustworthy: grade it against an engineer's answers, over several runs and three models.

## The Specification

The WLC-200 System Requirements Specification, version 1.2, has 36 requirements in seven sections. Here is the anti-pinch section:

```
@include projects/wlc200/spec/WLC-200-SRS-v1.2.md#L41-L48
```

Before the projects were built, an engineer reviewed all 36 requirements and wrote down the problems. Nine are real problems, planted on purpose so the reviewer has something to find:

| Requirement | Problem | Why |
| --- | --- | --- |
| WLC-007 and WLC-023 | Conflict | Movement after ignition off: 45 s in one, 60 s in the other |
| WLC-012 | Ambiguous | "close quickly" isn't measurable |
| WLC-018 | Untestable | "robust against all disturbances" |
| WLC-025 | Missing value | "the limit" and "a safe value" aren't given |
| WLC-030 | Compound | Three "shall"s: store a code, stop the motor, set a fault state |
| WLC-032 | Duplicate | Repeats WLC-004 word for word |
| WLC-033 | Ambiguous | "user friendly" |
| WLC-034 | Process | About the development process, not the product |

Two requirements are borderline, and the engineer accepted either answer for them. WLC-011 ("The motor shall be stopped when the window reaches the end position") has no stopping time; it's acceptable as written, but a reviewer may ask for one. WLC-024 ("estimate motor temperature with a thermal model") can be checked by design review but has no performance criterion. The labels record this with an `also` field:

```
@include projects/wlc200/labels/review-labels.json#L34-L40
```

> **Note:** These answers are called **labels**, and they are the most important file in the project. Without them you can see what the reviewer says, but you can't tell how good it is. Write labels before you build the tool, so the tool's output can't influence them.

## The Reviewer

The reviewer is about a hundred lines. It reads the specification, extracts the requirements with a regular expression, asks Claude for a review, checks the answer, and saves it.

The system prompt is the one you met in Chapter 4: a role, eight defined issue types, rules, calibration, evidence and a data boundary. The schema forces one finding per requirement, with an issue from a fixed list:

```
@include projects/p01-req-review/review.py::SCHEMA
```

Code extracts the requirements, so it knows exactly which IDs exist:

```
@include projects/p01-req-review/review.py::requirements
```

## Checking the Answer With Code

Before anyone reads the review, code checks five things: every requirement was reviewed exactly once, no finding names a requirement that doesn't exist, every conflict or duplicate names its partner, every quote is really in the requirement, and no rewrite contains a number that appears nowhere in the specification:

```
@include projects/p01-req-review/review.py::check
```

The last check deserves a word. The prompt says "never invent numbers", but a prompt is a request. The check makes it a rule: a rewrite may reuse a value from elsewhere in the specification (WLC-018's rewrite borrowed 100 N from WLC-014, which is reasonable), but a value that appears nowhere is reported.

> **Note:** An earlier version of this check only allowed values from the requirement itself and its named partner. It flagged that borrowed 100 N, and the 0 mm and 480 mm end positions from the definitions section. Those were good rewrites, so the check was too strict. Checkers need testing too; Chapter 16 comes back to this.

## The First Run

```
python review.py ../wlc200/spec/WLC-200-SRS-v1.2.md
```

```
Terminal output:
36 requirements in WLC-200-SRS-v1.2.md
11 flagged, 0 check problems, 3810 in / 4332 out tokens, 42.8 s
```

Eleven requirements were flagged, and every quote, partner and rewrite passed the checks. The run cost about five US cents. Here is one finding, as saved in the output file:

```
@include projects/p01-req-review/output/sonnet-run1.json#L55-L62
```

The reviewer found the conflict, quoted the words, named the partner, and noticed something the labels didn't mention: WLC-023 lacks the door-open condition. Its rewrite doesn't pick 45 or 60 seconds, because that is a decision for the requirement's owner, not the reviewer.

## Grading

The grader compares each finding with the labels:

```
@include projects/p01-req-review/grade.py::accepted,grade
```

It counts four outcomes. A **true positive** is a real problem the reviewer flagged. A **false positive** is a requirement flagged that the engineer said is fine. A **miss** is a real problem not flagged. A **true negative** is a fine requirement left alone. From those come two numbers:

- **Recall**: of the real problems, how many were found? Here, 9 of 9 = 1.0.
- **Precision**: of the requirements flagged, how many really had a problem? Here, 9 of 11 = 0.82.

```
python grade.py output/sonnet-run1.json
```

```
Terminal output:
  WLC-017: flagged as conflict ('shall be disabled when the controller is not normalized'), engineer said ok
  WLC-029: flagged as compound ('shall store diagnostic trouble code B1A01 when the Hall sensor signal is missing for more than 200 ms while the motor is driven, and shall stop the motor'), engineer said ok
{"true_positives": 9, "false_positives": 2, "missed": 0, "true_negatives": 25, "precision": 0.82, "recall": 1.0, "right_type": 9, "labelled_issues": 9}
```

All nine problems were found, each with the right issue type and the right partner. Two "false positives" remain. They deserve a closer look.

## When the Labels Are Wrong

Here is the reviewer's finding on WLC-017:

```
@include projects/p01-req-review/output/sonnet-run1.json#L139-L146
```

WLC-016 says anti-pinch protection is active in manual mode and express mode. WLC-017 switches it off when the controller isn't normalized, and nothing stops manual closing in that state. That isn't a wording problem; it's a safety question that a design review must answer. The engineer who wrote the labels had labelled both requirements `ok`.

WLC-029 stores a trouble code *and* stops the motor: two requirements in one, by exactly the rule that made WLC-030 compound. The labels were inconsistent.

Every model, in every run, flagged both. On a second look, the engineer agreed and recorded the decision in a separate **adjudication** file, keeping the original labels unchanged:

```
@include projects/wlc200/labels/review-adjudication.json
```

The grader reports both scores, so nobody can say the labels were quietly changed to make the tool look good:

```
python grade.py output/sonnet-run1.json --adjudicated
```

```
Terminal output:
{"true_positives": 9, "false_positives": 0, "missed": 0, "true_negatives": 27, "precision": 1.0, "recall": 1.0, "right_type": 9, "labelled_issues": 9}
```

> **Warning:** Adjudication is useful and dangerous. Only change an answer when you would defend the change to a colleague without mentioning the tool, record why, and keep the original. Changing labels until the tool passes is not evaluation.

## Five Runs, Three Models

One good run proves little. The reviewer was run three times with Sonnet 5.5, once with Haiku 5.5 and once with Opus 5.5:

| Run | Flagged | Recall | Precision | Precision (adjudicated) | Output tokens | Cost | Time |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Sonnet 5.5, run 1 | 11 | 1.0 | 0.82 | 1.00 | 4,332 | $0.051 | 43 s |
| Sonnet 5.5, run 2 | 13 | 1.0 | 0.69 | 0.90 | 4,699 | $0.055 | 31 s |
| Sonnet 5.5, run 3 | 12 | 1.0 | 0.75 | 1.00 | 4,842 | $0.056 | 33 s |
| Haiku 5.5 | 15 | 1.0 | 0.60 | 0.69 | 21,714 | $0.011 | 86 s |
| Opus 5.5 | 12 | 1.0 | 0.82 | 1.00 | 4,252 | $0.100 | 36 s |

Every run found all nine problems, with the right type. The differences are in the false positives. Sonnet's second run also called WLC-011's "end position" ambiguous, which the engineer didn't accept, since the definitions section defines the end positions. Haiku 5.5 added four more, for example calling WLC-002 ("Between 6.0 V and 9.0 V") a conflict, without a convincing reason. It also wrote five times as many output tokens and took twice as long, yet still cost a fifth of Sonnet's price. Opus matched Sonnet's best run at twice the cost; its one extra flag was WLC-004 as the duplicate of WLC-032, which is the same pair seen from the other side, and the grader accepts either side.

For this tool, Sonnet 5.5 is the right default. Haiku 5.5 would suit a first pass over thousands of requirements, where an engineer filters the findings anyway and cost matters more.

## Using It on Real Work

- **Write labels for a sample first.** Twenty to forty requirements from your own specifications, reviewed by an experienced engineer, are enough to see whether the tool helps.
- **Adapt the issue types** to your company's requirement rules. If your rules say every timing requirement needs a tolerance, add that as an issue type with an example.
- **Keep the person in charge.** The reviewer produces findings and rewrites for the requirement's owner. It doesn't change the specification.
- **Mind the size.** A 36-requirement specification fits easily in one prompt. For thousands, review section by section and give each prompt the definitions and any requirements the section refers to.

## Key Takeaways

- Labels, written before the tool, turn "it looks useful" into recall and precision.
- Code checks every finding: one per requirement, real IDs, real partners, verbatim quotes, no invented values.
- In five runs with three models, the reviewer found all nine planted problems; the models differed in false positives and cost.
- The tool found two problems the engineer had missed. Record such decisions in an adjudication file, keep the original labels, and report both scores.
