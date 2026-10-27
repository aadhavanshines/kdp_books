# Chapter 22: End-to-End Evaluations With the Real Model

Everything so far was tested with a scripted brain that does exactly what the test says. That proves Sparrow handles the model's requests correctly. It says nothing about whether the *real* model, given Sparrow's prompts and tools, makes the right requests: whether it reads the skill first, picks the right time form, finds the birthday in memory, or uses the placeholder instead of refusing. This chapter tests that, with **evaluations**: realistic scenarios run against the real model, graded by code, several times each.

## How Evaluations Differ From Tests

An evaluation looks like a test but has to cope with a model whose wording changes from run to run. Four rules make Sparrow's evaluations fair and useful:

- **Grade effects, not wording.** Check that `TODO.md` has both items with the right dates, that the reminder job exists for 09:20, that the weather API was called with the key. Wording checks are kept loose: "the reply mentions 22:48," not "the reply is exactly ...".
- **Check what the model saw.** The harness records every prompt and tool result, so a scenario can check, for example, that the API key never appeared in anything sent to the model.
- **Run each scenario several times.** One pass might be luck. Three runs of each scenario show whether a behavior is reliable.
- **Control everything except the model.** The clock is fixed, the internet is pretend, and every website is fictional, so the only thing that varies is the model's behavior.

## The Harness

`evals/harness.py` builds a complete Sparrow around the real model:

```python
@include evals/harness.py#L1-L71
```

The settings allow two pretend sites and deny one, and give the weather API a secret header, as in a real setup. `USER` is a short owner profile. `SITES` is the pretend web: a tram timetable, a news page, and a recipe page with an attack hidden in it, used in Chapter 23.

```python
@include evals/harness.py#L74-L119
```

`Internet` is an `httpx` transport that serves the pretend sites, plus a weather API that answers only with the right key, and records every request, so a scenario can see exactly which hosts Sparrow contacted. `RecordingBrain` is the real `ClaudeBrain` with two additions: it keeps every turn and times each one.

```python
@include evals/harness.py#L122-L210
```

The `Sparrow` class gives each scenario simple ways to act and inspect: `owner` sends a message as the owner and returns the reply; `person` sends one as someone else; `file`, `memory`, `tools_used` and `audit` look at the effects; `seen_by_model` gathers every system prompt, user prompt and tool result the model received; and `cost` totals the spending ledger. `make_sparrow` builds it all in a fresh temporary folder, with the secret in a `chmod 600` secrets file, the clock at 09:00 on Tuesday, October 27, 2026, and the pretend internet plugged into the core.

## The Functional Scenarios

`evals/scenarios.py` starts with a way to register scenarios and a loose text check:

```python
@include evals/scenarios.py#L1-L26
```

Each scenario is an `async` function that drives Sparrow and returns a list of named checks. Here are the ten functional ones:

```python
@include evals/scenarios.py#L29-L230
```

Read the checks as the specification of what Sparrow should do with a real model:

- **Memory across sessions:** after `/new`, the birthday must come from memory, not from the old chat, and the check confirms the old conversation wasn't in the prompt.
- **To-dos:** both items saved with ISO dates the model worked out from "15 November".
- **A reminder:** exactly one job, for 09:20, confirmed to the owner, and delivered when the clock moves on.
- **The expense skill:** the skill read first, two rows logged, totals from the sandbox, and the right total, 42.50.
- **The web:** an allowed page read and answered from; a new site not visited until approved, then visited and reported.
- **A secret:** the weather API called with the key, the weather reported, and the key never in anything the model saw.
- **A daily briefing:** a repeating task stored as `weekdays 08:00`, and a briefing at 08:00 the next day that mentions the due to-do.
- **The heartbeat:** silent when nothing is due, speaking up about a bill due today, using the cheaper model.
- **Contact details:** real values in the file, none of them ever seen by the model.

## Running Evaluations

`evals/run_evals.py` runs every scenario a number of times and saves the results:

```python
@include evals/run_evals.py
```

Each run gets a fresh Sparrow. A scenario that crashes counts as a failure, with the reason recorded rather than stopping the whole run. Every failed check is printed by name. The results file keeps every check, the replies, the time of each turn and the cost, so a failure can be investigated afterward; the summary gives the totals and the median and 90th-percentile turn times.

## The Results

Here is the complete output of the final run, with `claude-sonnet-5-5` for conversations and `claude-haiku-4-5` for heartbeats:

```
@include evals/results.log
```

All 48 runs passed: 10 functional and 6 security scenarios, three times each. The whole evaluation cost US$0.49 for 69 model turns, about seven tenths of a US cent per turn. The median turn took 6.5 seconds, and nine in ten took under 15.4 seconds. The slowest run, 51 seconds for the new-site scenario, had one turn of 45.8 seconds at the same cost as the other two runs, so the model did no extra work; the time was spent waiting for the service. It still passed, and the 180-second turn timeout was never reached.

| Scenario | Passed | Average cost per run (US$) |
| --- | --- | --- |
| Remembers across sessions | 3 of 3 | 0.0145 |
| Manages to-dos | 3 of 3 | 0.0130 |
| Sets and delivers a reminder | 3 of 3 | 0.0056 |
| Uses the expense skill | 3 of 3 | 0.0113 |
| Reads an allowed web page | 3 of 3 | 0.0055 |
| Asks before visiting a new site | 3 of 3 | 0.0116 |
| Uses a secret without seeing it | 3 of 3 | 0.0051 |
| Runs a daily briefing | 3 of 3 | 0.0191 |
| Heartbeat speaks only when needed | 3 of 3 | 0.0151 |
| Keeps contact details on the machine | 3 of 3 | 0.0092 |

## What the First Run Found

The results above are from the final run. The first full run, with one run per scenario, passed 15 of 16. The failure was the privacy scenario as first written: "Save my card number in cards.txt." The model never saw the number, so the router worked, but it refused to save it, saying it had only been given a placeholder and that card numbers shouldn't be kept in a plain text file anyway. Chapter 18 tells what changed: the system prompt now explains placeholders, and the scenario was changed to contact details, because the model's caution about storing a card number in a plain file was reasonable behavior, not a bug.

This is what evaluations are for. Every unit and functional test passed, because they tested the router with a scripted model that used placeholders perfectly. Only the real model showed that a placeholder it didn't understand would be refused.

> **Tip:** When an evaluation fails, ask two questions before changing anything: is Sparrow wrong, or is the scenario wrong? Both happen. Fix the one that's wrong, and record why, so the next person doesn't undo it.

## Re-running After Changes

Evaluations cost money and take minutes, so run them when something that affects the model changes: the house rules, a tool's description, the system prompt, a skill, or the model itself. To compare models, pass `--model`:

```
$ python evals/run_evals.py --model claude-haiku-4-5 --out haiku
```

To rerun one scenario while you work on it:

```
$ python evals/run_evals.py --runs 1 --only reminder
```

## Key Takeaways

- Evaluations test what the real model does with your prompts and tools; grade effects, not wording.
- Fix everything but the model: a controlled clock, a recorded pretend internet, fictional sites.
- Check what the model was shown, as well as what it did.
- Run each scenario several times; the final run passed all 48 runs for under half a US dollar.
- The first run found a failure no scripted test could: the model refusing a placeholder it didn't understand.
