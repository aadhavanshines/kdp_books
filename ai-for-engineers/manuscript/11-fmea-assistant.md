# Part IV: Safety and Knowledge

# Chapter 11: Project 7: FMEA Assistant

A design FMEA (failure mode and effects analysis) asks, for every function of a product: how can it fail, what happens then, why would it fail, how do we prevent and detect that, and how much risk is left? It's one of the most valuable analyses in engineering, and one of the most tiring to prepare. Teams spend hours in workshops filling in rows that an experienced moderator could have drafted beforehand. An AI draft can save much of that time, if it's systematic, honest about its evidence, and clearly a draft. This chapter builds one, and shows a first version that wasn't systematic at all.

> **Note:** This chapter uses a simplified FMEA format with a risk priority number (RPN = severity × occurrence × detection) and the fictional company's own rating scales. Real projects use the method and scales their customers and quality system require, such as the AIAG and VDA FMEA handbook in automotive. The principles here apply to any of them; the handbook's own tables are not reproduced.

## The Inputs

The FMEA team has prepared a structure document: the system elements, the seven functions to analyse, the existing controls carried over from the predecessor product, and the field and test history:

```
@include projects/wlc200/fmea/structure.md#L19-L39
```

The company's rating scales are in their own short document. Here is the severity scale:

```
@include projects/wlc200/fmea/rating-scales.md#L5-L18
```

The draft can also use the five lessons learned and the thirty defect reports. An open defect is strong evidence: it means the cause has already happened.

## Who Does What

| Step | Done by | Why |
| --- | --- | --- |
| List failure modes, effects and causes | Claude | Language and engineering knowledge |
| Name the existing controls | Claude, from the structure document | Must match real controls |
| Propose severity, occurrence and detection, with reasons | Claude | A starting point for the team's discussion |
| Compute every RPN | Code | Arithmetic |
| Decide which rows need action | Code, using the company rule | A rule, not a judgement |
| Check the draft | Code | Coverage, evidence, consistency |
| Decide the final ratings and actions | The FMEA team | Responsibility |

The company rule is simple, and it's in code:

```
@include projects/p07-fmea/fmea.py::priorities
```

## The First Draft: A Defect List

The first prompt asked Claude to act as an experienced FMEA moderator and, "for each function in the structure, list the failure modes that matter", using the rating scales, lessons and defects as evidence. Sonnet 5.5 produced 18 rows in 75 seconds for 15 cents. They were good rows, with careful reasons for every rating. Almost every one of them described an open defect: the late pinch stop when cold, the short reversal when hot, the false reversals on rough roads, the opening above 140 °C, the missing CAN frame.

The engineer had written down, before the project started, the 16 failure modes a complete draft should contain (`fmea-expected.json`). The grader matches each one to the draft's rows by function and key phrases:

```
@include projects/p07-fmea/grade.py::matches,grade
```

The first draft covered 12 of 16. The four it missed were all failure modes that had never occurred:

```
Terminal output:
  F1 MISSING: Window does not move when the switch is held
  F3 MISSING: Express mode starts on a held press, or not on a short press
  F5 MISSING: Pinch not detected
  F16 MISSING: Motor not stopped at undervoltage
```

"Pinch not detected" is the most severe failure the product can have. It wasn't in the draft because nothing in the evidence pointed to it: every pinch test had detected the pinch, just sometimes late. The draft followed the evidence, and an FMEA must go beyond the evidence. That's what makes it an FMEA rather than a defect review.

## The Fix: Give It the Method

FMEA moderators don't rely on memory either. They walk through each function with guide words. The second prompt says so:

```
@include projects/p07-fmea/fmea.py::SYSTEM
```

The changed paragraph is the second one: work through the functions one at a time, consider no function, partial, intermittent, unintended, too early and too late, include failure modes that have never been seen, and treat the evidence as evidence for the ratings, not as the list of failure modes. Code also makes the function an enum, built from the structure document, so every row belongs to a real function.

## Results

| Run | Rows | Need action | Covered (grader) | Covered (engineer) | Output tokens | Cost | Time |
| --- | --- | --- | --- | --- | --- | --- | --- |
| First prompt, Sonnet 5.5 | 18 | 16 | 12 / 16 | 12 / 16 | 10,875 | $0.15 | 75 s |
| Method prompt, Sonnet 5.5, run 1 | 32 | 31 | 14 / 16 | 14 / 16 | 15,214 | $0.19 | 106 s |
| Method prompt, Sonnet 5.5, run 2 | 36 | 35 | 14 / 16 | 16 / 16 | 16,774 | $0.20 | 118 s |
| Method prompt, Sonnet 5.5, run 3 | 32 | 31 | 16 / 16 | 16 / 16 | 16,047 | $0.20 | 112 s |
| Method prompt, Opus 5.5 | 24 | 24 | 10 / 16 | 13 / 16 | 15,893 | $0.39 | 158 s |
<<RUN:fmea-haiku>>

The grader's keyword matching is only a first pass. For every row it marked missing, the engineer read the draft to see whether another row covered it, and recorded each decision in `engineer-review.json`. For example, Sonnet's second run described F12 as "Opening is allowed once above the 140 °C block limit", which the key phrases didn't match. The "Covered (engineer)" column is the real score.

With the method, Sonnet's drafts covered 14, 16 and 16 of the 16 expected failure modes, and every run included "Pinch not detected at all", rated severity 10. Opus wrote fewer, more detailed rows and still missed three, including "Motor not stopped at undervoltage". More capable is not always more complete; a method and a checklist matter more than the model.

Here is that row from Sonnet's first run with the method, as the team would see it:

```
@include projects/p07-fmea/output/dfmea-sonnet-run1.json#L775-L793
```

The reason for each rating is written out, so the team can argue with it. The recommended action is specific: a tolerance study, added to an existing procedure.

## Do the Ratings Agree?

Across the runs, severity was remarkably stable. Compare five of the expected failure modes across the four method-prompt runs that included them:

| Failure mode | Severity | Occurrence | Detection | RPN |
| --- | --- | --- | --- | --- |
| F5 Pinch not detected | 10 in all runs | 4 | 4 to 6 | 160 to 240 |
| F6 Pinch stop too late | 10 in all runs | 5 to 9 | 3 to 4 | 200 to 270 |
| F8 False reversal | 7 in all runs | 8 to 9 | 4 to 6 | 224 to 336 |
| F13 Status frames missing | 5 in all runs | 4 to 8 | 3 to 7 | 120 to 240 |
| F16 No stop at undervoltage | 9 in all runs | 3 | 4 to 5 | 108 to 135 |

Severity describes the effect, which follows from the function, so it's consistent. Occurrence and detection are judgements about evidence, and they move by several points from run to run, which can double an RPN. That's not a flaw to hide; it's what real FMEA teams experience too. It means the ratings in a draft are a starting point for discussion, never a result. Sort the draft by severity first, and treat the RPN as a rough guide.

## When Everything Needs Action

In every draft with the method, more than 95% of rows needed action under the company rule (RPN 100 or more, or severity 9 or 10). Partly that is right: the WLC-200 has many open defects, and an open defect means a high occurrence rating. But when nearly every row is a priority, the rule no longer prioritises. That is a question for the quality team, not for the tool: perhaps the threshold, perhaps the occurrence scale's guidance for open defects. A useful side effect of an AI draft is that it shows how a rule behaves on a full analysis before the workshop.

## Checks

Code checks four things in every draft: every function was analysed; every piece of evidence cited (a lesson or a defect) exists; every row that needs action proposes one; and the same failure mode never has two different severities. It also checks that every control named exists in the structure document:

```
@include projects/p07-fmea/fmea.py::check
```

All method-prompt drafts passed. One earlier version of the check reported "function not analysed" for a function that had seven rows, because Claude had shortened its name. The enum now prevents that, and the checker also accepts the function's number.

## The Workshop Spreadsheet

The tool writes an Excel file for the workshop, sorted with the rows needing action first, the RPN computed, the reasons and evidence in their own columns, and an empty **Team decision** column. Nothing in the file is approved. The team goes through it row by row, changes ratings, deletes rows that don't apply, adds rows the draft missed, and fills in the decisions. The draft is never the FMEA; the team's version is.

## Using It on Real Work

- **Use your method and your scales.** Replace the guide words and rating scales with the ones your process requires.
- **Write the expected list first.** A list of failure modes an experienced engineer expects, written before the tool runs, is the only way to see what a draft misses.
- **Bring the draft, not the conclusions, to the workshop.** Show the reasons; let the team rate.
- **Keep the draft and the final version.** The difference shows what the tool is good at, and where it needs a better method.

## Key Takeaways

- Without a method, the draft followed the evidence and missed the failure modes that had never happened, including the most severe one.
- With FMEA guide words in the prompt, Sonnet's drafts covered 14 to 16 of 16 expected failure modes, and always included "pinch not detected".
- Code computes every RPN and applies the action rule; code checks coverage, evidence and consistency; the team decides.
- Severity was consistent across runs; occurrence and detection were not. Treat draft ratings as a starting point, and sort by severity first.
