# Corrections to the answer files

Each correction was made after a tool's output disagreed with an answer file and an engineer checked the raw data. The original value and the reason are kept here.

| Date | File | Item | Was | Now | Why |
| --- | --- | --- | --- | --- | --- |
| 2026-10-13 | hil-truth.json | R10 maximum current above 130 °C | 15.0 A (the limiter's set value) | Measured from the log (15.16 A); R10 also fails this criterion | The truth used the design value, not the logged samples. The analyzer written in Project 4 measured the log and was right. |
| 2026-10-13 | review-adjudication.json | WLC-016, WLC-017, WLC-029 | ok | Also accepted: conflict (016/017), compound (029) | Every model flagged them; on a second look the engineer agreed. The original labels are unchanged and both scores are reported. |
| 2026-10-13 | knowledge-qa.json | q08 key words | "stale", "before the thermal task" | "stale", "before" | The first answer was correct but paraphrased ("before that task had run"); the grader was checking wording, not facts. |
| 2026-10-13 | fmea-expected.json | keywords | Loose single words such as "late" and "current", any function | Precise phrases, limited to the expected functions | The loose matcher counted unrelated rows as coverage (14 of 16 instead of 12). This made grading stricter, not easier. |
