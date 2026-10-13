# Ardent Drive Systems: FMEA Rating Scales (company guideline, fictional)

These are the company's own simplified scales for this book's examples. A real project uses the scales its customer and its quality system require.

## Severity (S): how bad is the effect?

| S | Effect |
| --- | --- |
| 10 | A person could be injured, with no warning |
| 9 | A person could be injured, with a warning, or a legal requirement is broken |
| 8 | A main function is lost (the window can't close) |
| 7 | A main function is degraded (slow, or works only manually) |
| 6 | A comfort function is lost (express mode) |
| 5 | A comfort function is degraded |
| 4 | Noticed by most customers: noise, feel |
| 3 | Noticed by some customers |
| 2 | Noticed only by an attentive customer |
| 1 | No effect |

## Occurrence (O): how likely is the cause, with the prevention in place?

| O | Likelihood |
| --- | --- |
| 10 | Almost certain: no prevention, new design |
| 8 to 9 | High: prevention is weak or untested |
| 6 to 7 | Moderate: similar designs had this problem |
| 4 to 5 | Low: proven prevention with some open questions |
| 2 to 3 | Very low: proven prevention, no field history of the cause |
| 1 | Prevented by design: the cause can't occur |

## Detection (D): how likely is it that testing finds the cause or the failure mode before release?

| D | Detection |
| --- | --- |
| 10 | No test planned |
| 8 to 9 | Tests unlikely to find it (wrong conditions, too few samples) |
| 6 to 7 | Tests could find it, but don't target it |
| 4 to 5 | A test targets it, at some of the conditions |
| 2 to 3 | A test targets it at all relevant conditions |
| 1 | Found automatically, every time (for example, by the build) |

## Risk priority number

RPN = S × O × D, from 1 to 1000. The company guideline asks for an action when RPN is 100 or more, or when S is 9 or 10 whatever the RPN. The RPN ranks risks; it doesn't decide alone. The team reviews every row.
