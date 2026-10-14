# Part III: Test Data and Results

# Chapter 8: Project 4: HIL Test Log Analyzer

A hardware-in-the-loop bench produces data faster than people can read it. Bench HIL-2 runs twelve WLC-200 tests every night, and each run writes thousands of samples: voltage, switch, motor command, current, position, pinch force, temperature, CAN frames and trouble codes. Someone has to turn those logs into PASS or FAIL, find the exact number that failed, and notice the things that passed but look wrong. This chapter does that without asking Claude to read a single log. Instead, Claude Code writes the analysis program, and you prove the program with an engineer's hand measurements.

## Why Not Just Ask Claude to Read the Logs?

You could paste a log into a chat and ask for the stop time. Don't, for four reasons:

1. **Measurement is arithmetic.** The stop time is the difference between two sample times found by exact rules. Code does that perfectly; a language model only does it usually.
2. **Size.** One night is twelve files and over 70,000 rows. Sending them every night costs money and time, and most of each file is irrelevant.
3. **Repeatability.** A program gives the same answer for the same log every time, which a test record needs.
4. **Confidentiality.** A program runs on your own computer. After it's written, no log leaves the building (Chapter 3).

So the AI's job here is to write the code, quickly and from the documents an engineer would use. The code's job is to measure.

## The Inputs

Each night's folder has a manifest and one CSV file per run. The bench guide defines the columns:

```
@include projects/wlc200/knowledge/GL-HIL-2-bench-guide.md#L9-L11
```

Here are a few rows from run R04, the cold anti-pinch test, around the moment the pinch force crosses 80 N:

```
@include projects/wlc200/hil/2026-10-06/R04.csv#L1-L1
@include projects/wlc200/hil/2026-10-06/R04.csv#L2895-L2899
@include projects/wlc200/hil/2026-10-06/R04.csv#L2908-L2911
```

The force passes 80 N at 2,895 ms, and the motor command stays 1 (close) until 2,909 ms, when it changes to 0: 14 ms later. The limit is 10 ms. That's the failure an engineer must find, measured exactly as the anti-pinch test procedure defines it:

```
@include projects/wlc200/knowledge/TP-AP-01-anti-pinch-test.md#L24-L28
```

The pass limits for each test are in a small JSON file, `limits-v1.3.json`, taken from the specification.

## A Clean Workspace

Claude Code works on the files in its folder. The analyzer's folder gets the inputs an engineer would use (one night's logs, the limits, the bench guide and the two test procedures) and nothing else. The engineer's answers in `wlc200/labels` stay outside, so the tool can't see them. A small script copies the inputs in:

```
@include projects/p04-hil-analyzer/prepare.py
```

The task is written in a file, `PROMPT.md`, so it can be versioned and reused:

```
@include projects/p04-hil-analyzer/PROMPT.md
```

Three things in it matter. "Follow those definitions exactly" points to the procedures rather than leaving the method open. "Write down the method you chose in a comment" covers the five tests without a written procedure, so a reviewer can check the choice. "Never hard-code expected results" and "check its output against the raw data" ask for honest, verified work. The last paragraph was added after two failed attempts, described next.

## Running Claude Code Without a Person

The analyzer was written with Claude Code in headless mode, one command, with a fixed list of allowed tools and `dontAsk` mode, which refuses anything not on the list instead of asking:

```
claude -p "$(cat PROMPT.md)" --model claude-sonnet-5-5 \
  --permission-mode dontAsk \
  --allowedTools "Read,Write,Edit,Glob,Grep,Bash(python3:*),Bash(ls:*),Bash(head:*),Bash(wc:*)" \
  --output-format json > session.json
```

### Two Failed Attempts

The first two attempts, without the last paragraph of the prompt, produced no analyzer. In both, Claude's first command was a shell loop to look at the files:

```
cat docs/*; cat PROMPT.md | head -5; for f in data/2026-10-06/R*.csv; do echo == $f; wc -l $f; head -4 $f; done
```

`cat` and the loop weren't on the allowed list, so the command was refused. Claude then stopped and explained, instead of writing the analyzer without testing it:

```
@include projects/p04-hil-analyzer/session-2-denied-result.md#L1-L7
```

That is the behaviour you want from a tool working on test evaluation: no untested analyzer. The fix was one sentence in the prompt telling Claude which commands it could use. The two failed attempts cost 18 cents together.

### The Third Attempt

With that sentence added, the session took 20 turns, two and a half minutes and 43 cents. Claude read the documents and the logs, wrote a 359-line pandas program, ran it, and checked its figures against the raw rows. Its summary began:

```
@include projects/p04-hil-analyzer/session-3-result.md#L1-L3
```

Here is the program's evaluation of the anti-pinch tests, following the procedure line by line:

```
@include projects/p04-hil-analyzer/analyze_hil-session3.py::test_anti_pinch
```

And here is its output for the night, run by anyone, at no cost, as often as needed:

```
python analyze_hil.py data/2026-10-06
```

```
@include projects/p04-hil-analyzer/output-2026-10-06.txt#L1-L20
```

Below the table, the analyzer lists anomalies on runs that passed: the 151 mm reversal in R05, only 1 mm above its limit; the 203 ms Hall-loss stop in R12, where the Hall counter's 4 ms resolution means the true value could be 199 ms, below the 200 ms minimum; and an 18.1 A stall current at the end stop in R07, which has no limit. It also noticed that in the cold and hot runs the controller's temperature estimate started 8 °C above the chamber setting. That one is an artifact of how this book's fictional logs were generated, but on a real bench it's exactly the kind of thing you want flagged: either the soak was too short or the estimate is offset.

## Proving the Analyzer

The engineer measured every run by hand before the analyzer existed, using the same procedures, and wrote the results to `hil-truth.json`. The grader compares the analyzer's verdicts and measured values with them:

```
@include projects/p04-hil-analyzer/grade.py::SAME,grade
```

The first grading run:

```
Terminal output:
  R08: open release 58 ms not reported (got 62)
{"verdicts_right": 12, "runs": 12, "values_right": 27, "values_compared": 28}
```

Every verdict was right, and 27 of 28 measured values matched. The miss was R08, the manual-mode test. That run releases the switch twice, once after closing and once after opening; the analyzer measured only the first release. Both happened to pass, so the verdict was right for the wrong reason, and a future fault on the second release would have been missed.

A short follow-up session with Claude Code fixed it, from a prompt that described the finding the way a reviewer would:

```
@include projects/p04-hil-analyzer/PROMPT-fix.md#L1-L7
```

Five turns and 13 cents later, the analyzer measured both releases and the grade was 28 of 28.

## The Analyzer Was Right and the Truth Was Wrong

Before any grading, the analyzer's own summary disagreed with the engineer's truth file on one value, and the analyzer was right. In the thermal test R10, the procedure says the motor current must never exceed 15 A above 130 °C. The engineer's truth file said the maximum was 15.0 A, the set value of the current limiter. The analyzer measured the log and reported 15.16 A, because the logged current includes measurement noise. By the procedure's own words, with no tolerance, that is a failure.

The truth file was corrected, and the correction recorded in `TRUTH-CORRECTIONS.md`. The engineering question it raises is a good one: should a 15 A limit, measured with a sensor accurate to a fraction of an ampere, have a stated tolerance? That goes to the procedure's owner. Without the analyzer, nobody would have asked.

## A Night It Had Never Seen

The real test of an analyzer is new data. The next night, 7 October, ran software 2.4.0-rc4, with the CAN and thermal faults fixed and a new fault at 16 V. The analyzer ran unchanged:

```
@include projects/p04-hil-analyzer/output-2026-10-07.txt#L1-L20
```

Graded against the engineer's measurements for that night: 12 of 12 verdicts and 28 of 28 values. It also reported, as an anomaly, that the peak pinch force in R03 was 103.2 N, above the 100 N that the procedure asks to be reported. No Claude call was needed: once written and proved, the analyzer costs nothing to run.

## The Bug the Grader Couldn't Find

Every grading run passed, and the analyzer still had a bug. Reading the code, a reviewer noticed this line in the anti-pinch evaluation:

```
fully_open = final >= df.position_mm.iloc[0]
```

The specification says the reversal must be "at least 150 mm or to fully open", and fully open is 480 mm. The analyzer took fully open to mean "back where the log started". The specification's definitions weren't in its workspace, so it guessed. On both nights, every test started at 300 mm and reversed more than 150 mm, so the guess never mattered, and the grader couldn't see it.

A grader only tests the cases you have. To test this one, a small script made a log that wasn't in any night: the window starts at 150 mm and reverses only 60 mm. It must fail. The analyzer passed it:

```
Terminal output:
E01  TC-AP-01  PASS   stop_latency_ms=6ms; reversal_mm=60mm
```

The definitions were added to the workspace, and a third Claude Code session was asked to fix the evaluation:

<<RUN:fix2>>

Two lessons are worth keeping. First, **give the tool the definitions**: it guessed only because the specification's definitions were missing. Second, **review AI-written code as you would any other code**, and turn every finding into a test case, so the bug can't come back.

## Permission Rules Are Not a Sandbox

The `--allowedTools` list allowed `python3`, `ls`, `head` and `wc`. During the R08 fix session, one command started with `python3`, ran a script, and then went on, in the same command line, to run `grep` and `git diff --stat`. It was allowed, because the command started with an allowed prefix. Nothing harmful happened: it was checking its own change. But it shows that allowing `python3` is close to allowing everything, since Python can run any command.

For anything beyond a throwaway folder, run Claude Code inside a real boundary: a container or virtual machine with only the project folder mounted, or Claude Code's sandbox mode, which uses the operating system to limit file and network access. Use permission rules for convenience, and a sandbox for safety.

## Using It on Real Work

- **Write the truth first.** Measure a few runs by hand, from the procedure, before the analyzer exists.
- **Give Claude Code the procedures, the definitions and real logs**, in a clean folder without the answers.
- **Grade it, then review the code**, and make each review finding a test log.
- **Keep the analyzer in version control** like any test tool, and rerun the grader on every change.

## Key Takeaways

- Don't ask a model to measure logs. Have Claude Code write the measuring code, and run the code.
- A clean workspace, a prompt that points to the procedures, and a list of allowed commands produced a working 359-line analyzer for 43 cents; two attempts without the command list stopped rather than write untested code.
- Graded against hand measurements, the analyzer scored 12/12 verdicts and 28/28 values on both nights after one fix; it also found an error in the truth file.
- A grader only tests the cases you have. Code review found a bug no grading run could see; a new test log now covers it.
- Allowing `python3` is nearly allowing everything; use a sandbox or container for real isolation.
