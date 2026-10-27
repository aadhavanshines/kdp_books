# Chapter 21: Functional Tests

Unit tests show that each part works. Functional tests show that the parts work *together*: a message comes in through a channel, passes through pairing, commands, the budget and privacy checks, reaches the brain, calls real tools that change real files, and a reply goes out. This chapter walks through Sparrow's functional tests: 15 for the gateway and 20 for time-driven work and the three channels. Each uses the scripted brain, so each runs in milliseconds and gives the same result every time.

## The Shape of a Functional Test

Every functional test follows the same pattern: script what the "model" will do, send a message, then check the **effects**: what was sent, what's on disk, what the brain was shown. Here's the first test in `tests/test_gateway.py`, with the file's header:

```python
@include tests/test_gateway.py#L1-L22
```

It checks three things at once: the reply went to the right chat, the prompt contained the message in the expected form, and the turn used the configured model with the owner's tools. The `pytestmark` line makes every `async` test in the file run under the anyio plugin.

## Tools, History and Memory

Tools called by the scripted brain run for real:

```python
@include tests/test_gateway.py::test_tools_run_and_results_flow_back,test_history_is_kept_across_channels
```

The first test checks that a fact really lands in `MEMORY.md` and that the search result flows back into the reply. The second checks the shared owner session from Chapter 9: a message on Telegram and a follow-up in the web chat are one conversation, so the second turn's prompt includes the first exchange.

```python
@include tests/test_gateway.py::test_new_saves_memory_then_clears
```

`/new` gives the brain its flush turn (the scripted brain saves the Porto trip, as the real model would be asked to), then archives the session. The test checks all three effects: the flush prompt, the empty history, and the fact in memory.

## Who May Talk

```python
@include tests/test_gateway.py::test_stranger_gets_a_code_and_never_reaches_the_model,test_paired_guest_gets_a_limited_sparrow,test_guests_cannot_use_owner_commands
```

These three tests are the functional half of Chapter 14. A stranger's two messages produce one reply to them, one notification to the owner, and **no turns at all**: `brain.turns == []` is the strongest possible check that the model never saw them. Once paired, the guest's turn is offered exactly one tool and a prompt without memory. And none of the owner's commands work for a guest.

## Approvals

```python
@include tests/test_gateway.py::test_web_fetch_approval_flow,test_deny_and_skill_approval
```

The approval tests follow the whole flow from Chapter 15. Fetching a new site produces a notice ending with the exact commands; approving it runs the follow-up turn with the system note, and the site is allowed from then on; approving the same code again does nothing. For skills, the key check is the line before the approval: `"plant-care" not in core.skills.load()`. Proposing a skill must not install it.

## Budget, Privacy and Failure

```python
@include tests/test_gateway.py::test_daily_budget_stops_model_calls,test_privacy_redacts_what_the_model_sees,test_privacy_block_mode
```

The privacy test is worth reading closely, because it checks all four directions of the router at once: the model's prompt has `<CARD_1>` and not the number; the tool received the real number (it's in `MEMORY.md`); and the reply the owner sees has the real number back. The scripted brain plays a model that uses the placeholder correctly, which isolates the router from the question of whether the real model *will*; Chapter 22 answers that.

```python
@include tests/test_gateway.py::test_model_failure_gives_a_friendly_answer,test_a_broken_channel_does_not_crash_the_gateway
```

These check the "never leave the owner hanging" rule from Chapter 2. A model failure gives a short apology, and the reason is in the audit log. A channel that raises an error while sending doesn't propagate out of `handle`; the gateway logs it and carries on.

## Reminders, Tasks and Restarts

`tests/test_schedule_and_channels.py` tests everything driven by time. With the controlled clock, waiting is free:

```python
@include tests/test_schedule_and_channels.py#L1-L54
```

The reminder test checks the edges: nothing at 29 minutes, the reminder at 30, and nothing more on the next tick. The heartbeat is pushed far away so it can't interfere.

```python
@include tests/test_schedule_and_channels.py::test_task_job_runs_sparrow_and_repeats,test_jobs_survive_a_restart_and_say_they_are_late
```

A task runs a full turn with the scheduled message and reschedules itself for the next day. The restart test builds one `Core`, schedules a reminder, throws the core away, moves the clock two hours on, and builds a second `Core` from the same folder, which is what a restart is. The reminder is delivered, and says it's late.

The delivery-failure test reproduces the bug a review found (Chapter 12). A task adds a to-do, Telegram is down so every send raises an error, and the clock ticks three times. The task must run once, not three times: one model turn, one to-do, and a `job_error` in the audit log.

## The Heartbeat

```python
@include tests/test_schedule_and_channels.py#L130-L196
```

Six behaviors from Chapter 12, one test each: the first beat waits one interval after start-up; `HEARTBEAT_OK` sends nothing and uses the cheaper model with the checklist; a due bill produces one message; beats are spaced by the interval and skipped at night; and a beat goes to whichever channel the owner last used. `beat_due` sets the stored time of the last beat, so a test can start just as a beat is due.

## The Channels

The terminal and web chat tests drive each channel the way a person would:

```python
@include tests/test_schedule_and_channels.py#L199-L286
```

FastAPI's `TestClient` runs the web chat in memory and can open real WebSocket connections to it. The tests check that the page needs the right token, that a socket with a wrong token is closed with code 1008, that a message round-trips with the "typing" notice first, that a socket opened by another site is refused while one from Sparrow's own page is accepted, that plain text or a JSON list sent down the socket is ignored and the next real message is still answered, and that a short token is rejected when the channel is created.

The Telegram tests use the fake Bot API from Chapter 11:

```python
@include tests/test_schedule_and_channels.py#L289-L371
```

A round trip through `getUpdates` and `sendMessage`; the offset moving so a message is never fetched twice; group messages and photos ignored; a stranger on Telegram getting a code while the owner is notified, with no model call; a 10,000-character reply split into three messages under the limit; `chunks` preferring line breaks; and a wrong token raising an HTTP error that `run` would log.

> **Note:** None of these tests touch the real Telegram, a real browser or the real model, yet each exercises the real channel code end to end. That's the payoff of designing channels with replaceable clients and base URLs: the code under test is exactly the code that runs, only its far end is pretend.

## Key Takeaways

- Functional tests drive the whole gateway with a scripted brain and check effects: messages sent, files written, prompts shown.
- `brain.turns == []` proves the model was never called, the strongest check for strangers, budgets and blocked privacy.
- A controlled clock and a second `Core` on the same folder test time and restarts without waiting.
- Test each approval and pairing flow to the end, including codes that are reused or wrong.
- Replaceable clients and URLs let the real channel code be tested against in-memory fakes.
