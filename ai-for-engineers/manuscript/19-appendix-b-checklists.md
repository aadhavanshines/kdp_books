# Appendix B: Checklists

## Before Using AI on a Work Product

**Data**

- The AI service is approved for this data class, under a company account and commercial terms.
- No customer, supplier or export restriction applies, or it has been cleared in writing.
- Personal data is removed unless the task needs it.
- Only what the task needs is sent; measurements are summarised locally.

**Task**

- The task is mostly reading, writing, comparing or summarising, not calculation.
- Every calculation is done by code.
- The output can be checked, by code or by a reviewer with a checklist.

**Prompt**

- Role, task, definitions, rules, calibration, evidence and data boundary are in the prompt.
- Every fact the conclusion depends on is in the prompt explicitly.
- The output has a fixed structure, with enums for fixed choices and separate fields for what code must check.
- The prompt allows "not found" and "TBD".

**Review**

- A named engineer reviews the output and records the review.
- AI-assisted content is marked as your policy requires.
- Inputs, prompt version, model, output and check results are kept with the work product.

## Before Deploying a Tool to a Team

**Validation**

- Labels or truth data were written before the tool, by an engineer, for a representative sample.
- A grader scores the tool against them, and its scores are recorded.
- The tool was run several times (at least three) to see the variation.
- The checks themselves have tests, including deliberately wrong inputs.
- Any change to labels after seeing results is recorded separately, with reasons, and both scores are reported.
- The tool's code has been reviewed, and review findings became test cases.

**Safety and quality**

- The tool's possible impact and the chance of catching its errors have been assessed under your tool qualification procedure.
- High-impact steps are plain code or are checked by code.
- The tool cannot change records, file defects or approve anything by itself.
- Agents that run commands work inside a sandbox or container, not only behind permission rules.

**Operation**

- The tool has an owner and a register entry.
- The model ID is pinned in the code.
- Prompt, schema, checks and grader are in version control.
- Spending limits are set in code and in the provider's console.
- Failures are visible: errors stop the tool and are reported, not hidden.
- There is a manual fallback if the tool or the service is unavailable.

**Change**

- Every change to prompt, schema, checks or model is followed by a grading run and a recorded decision.
- The grader runs on a schedule, such as monthly, even without changes.

## Reviewing an AI Draft

- Does every ID, quote and number match its source? (Check what the code didn't.)
- Is the reasoning right, or could a missing fact have led to this conclusion?
- Is anything important missing? Use your method or checklist, not the draft, to decide.
- Are the ratings or classifications defensible on their stated reasons?
- Is the text usable as written, with no leftover corrections or hedges?
- Record what you changed.
