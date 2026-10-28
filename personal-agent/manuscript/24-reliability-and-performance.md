# Chapter 24: Reliability and Performance Testing

A personal agent runs for months. In that time the model's service will be busy, the network will drop, your computer will restart, and two messages will arrive at once. This chapter tests how Sparrow behaves when things go wrong and under load: retries, concurrency, a crash in the middle of a job, and how much time and memory Sparrow itself adds to each message.

## Retries

The brain's retry rule from Chapter 4 is easy to state and easy to get wrong, so `tests/test_robustness.py` tests all three cases:

```python
@include tests/test_robustness.py#L1-L77
```

`monkeypatch` replaces `ClaudeBrain.once`, the method that calls the model, with a stand-in that fails on purpose, and `no_waiting` replaces `asyncio.sleep` so the back-off doesn't slow the tests. A call that fails twice then succeeds is retried and succeeds. A call that fails *after a tool ran* isn't retried at all, so nothing is done twice. And a service that's down for good produces an error after the allowed retries, which the gateway turns into an apology.

## Concurrency

```python
@include tests/test_robustness.py#L80-L126
```

The concurrency test sends thirteen messages at once: one each from ten paired guests and three from the owner. `SlowBrain` takes 0.2 seconds per answer and records the order it saw messages. Two properties must hold together:

- **Different conversations run side by side.** Thirteen answers one after another would take 2.6 seconds. With the guests in parallel and the owner's three in sequence, it takes about 0.6. The test allows up to 1.2 seconds, so it doesn't fail on a slow machine.
- **Each conversation stays in order.** The owner's messages reach the brain as 0, 1, 2, never shuffled, because of the per-session lock.

The second test in this group checks that the private-values note from Chapter 18 is in the system prompt when redaction is on, and absent when it's off.

The third tests `supervise` from Chapter 10, with three small stand-in jobs: one that waits forever, one that crashes with "address already in use", and one that simply ends. A crash must come out as the same error; a job that ends when it shouldn't must raise "stopped unexpectedly"; and the terminal chat, the one job allowed to end, must end the wait quietly.

## The Command Line

```python
@include tests/test_robustness.py#L151-L170
```

`init`, `doctor`, `status` and `pairing` are tested as a user would run them, through `main`. The test checks that the secrets file is created with `chmod 600`, that the workspace exists, that `doctor` reports "All good." (with a placeholder API key set, so the test doesn't depend on your environment), and that the other commands print what they should.

## The System Test

Every test so far runs Sparrow's code inside pytest. The **system test** runs Sparrow the way you do: as a separate process started with `python -m sparrow run`, with its own settings file, talking to a Telegram server and a web browser. It knows nothing about Sparrow's internals; it only sends messages and looks at what comes out. And halfway through, it kills Sparrow without warning.

```python
@include evals/system_test.py
```

The test starts the fake Telegram server from Chapter 11 as a real HTTP server on port 18081, and points Sparrow's Telegram channel at it. Then:

1. A stranger writes; they must get a pairing code, and the owner must be told.
2. The owner sends `/status`, which must answer without the model.
3. The owner asks the real model for a reminder in two minutes, and must get an answer.
4. Sparrow is killed with `SIGKILL`, which gives it no chance to clean up, as in a power cut. After five seconds it's started again. The reminder must still arrive, exactly once.
5. The web chat must answer through a real WebSocket, and refuse a wrong token with HTTP 403.
6. The audit log must exist, with turns in it, and must not contain either token.

Here is its output from the final run:

```
@include evals/system-test.txt
```

The crash in step 4 is the important one. The reminder was stored in SQLite and committed the moment it was scheduled (Chapter 9), so killing the process lost nothing; the restarted scheduler found it due and sent it. "Exactly once" matters too: a scheduler that marked jobs done only in memory could send it twice after a restart.

> **Tip:** Kill your agent with `SIGKILL` in a test, not just a polite stop. A clean shutdown runs code that a power cut, an out-of-memory kill or a crashed laptop never will. If your agent survives `kill -9`, it survives those.

## How Fast Is Sparrow Itself?

Most of a turn's time is the model's: a median of 7.5 seconds in the evaluations. But Sparrow does work on every message too: checking the role, building the prompt, searching memory, redacting, writing the transcript and audit log. If that grew to a second, it would be noticeable. `evals/benchmark.py` measures Sparrow's own time with an instant scripted brain, so the model's time is zero:

```python
@include evals/benchmark.py
```

It measures six things: the time to handle an owner's message from start to finish (with a memory search), the number of messages per second with 200 guests writing at once, the time to index and search a large memory (10,000 facts and a year of daily notes), the time to start the sandbox, the privacy router's speed on a long message, and the size of the system prompt with a large memory. The results:

```
@include evals/benchmark.json
```

In plain words:

- **Sparrow adds about 7 milliseconds to a message.** Next to a model turn of several seconds, that's invisible.
- **It handled 248 messages a second** with 200 guests writing at once, far beyond what one person's assistant will ever see.
- **Memory stays fast as it grows.** Indexing ten thousand facts and a year of notes took about two seconds once; after that, searches took 17 milliseconds at the median and 40 at the 95th percentile.
- **The sandbox costs about 18 milliseconds** per command, the price of creating fresh namespaces.
- **The privacy router takes under 3 milliseconds** on a 9,480-character message.
- **The prompt stays bounded.** With 500 facts in memory, the system prompt is 7,664 characters, because only the newest 6,000 characters of memory go in.
- **Sparrow used 93 MB of memory** during all of this, small enough for a Raspberry Pi or the smallest cloud server.

## Key Takeaways

- Test retries for all three cases: recover, never repeat work after a tool ran, and give up cleanly.
- Test concurrency for both properties at once: different conversations in parallel, each conversation in order.
- A system test runs the real process from outside and kills it with `SIGKILL`; Sparrow lost nothing and sent the pending reminder exactly once.
- Benchmark your own overhead with the model's time removed: Sparrow adds about 7 ms per message.
- Memory search, the sandbox and the privacy router each cost milliseconds; the model dominates every turn.
