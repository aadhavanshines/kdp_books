# Chapter 4: Inside the Agent Loop

Pantry Chef worked, but most of what happened was hidden. This chapter opens the loop up. You'll see every message the SDK produces, learn what each one means, watch a run hit its limit on purpose, and learn to read the result message that ends every run. These are the skills you'll use every time an agent does something surprising, which is often.

## Every Message, One Line Each

`query()` doesn't just return an answer. It returns a **stream of messages**, one for each event in the agent's life. To see them all, here's a small script, `messages.py`, that prints one line per message. It reuses Pantry Chef's options, so it's the same agent:

```
@include projects/01-pantry-chef/messages.py::describe
```

Asking "What do I need to buy to make kesari for 4 people?" produced this real stream:

```
@include projects/01-pantry-chef/evals/messages-run.txt
```

Twenty-four messages for one question. Here's what each kind means.

**`SystemMessage`** is information from the SDK itself. The first one, `init`, arrives before Claude does anything and lists the session's settings: the model, the tools available, and the status of each MCP server. You'll use it in Chapter 13 to make sure a server really connected before the agent starts. Later system messages, such as `thinking_tokens`, report progress.

**`RateLimitEvent`** tells you about your account's rate limits. You can usually ignore it; Chapter 21 shows when it matters.

**`AssistantMessage`** is Claude speaking. It contains **content blocks**:

- `TextBlock`: words for you to read.
- `ToolUseBlock`: a request to run a tool, with the tool's name and inputs.
- `ThinkingBlock`: Claude's reasoning, when the model shares it. (The empty `AssistantMessage` in the stream above was one of these; this book's helper doesn't print them.)

**`UserMessage`** carries the tool results back to Claude. It's called a "user" message because, from Claude's point of view, the results come from the other side of the conversation: your program. Each `ToolResultBlock` holds a tool's output and an `is_error` flag.

**`ResultMessage`** always comes last. It's the run's report card, and it's important enough to get its own section below.

## What Counts as a Turn

The kesari run took **9 turns**. A turn is one reply from Claude: one `AssistantMessage` (or a few, if the reply has several parts) followed by the results of any tools it asked for. Claude checked the pantry (turn 1), wrote a sentence and added the first item (turn 2), added six more items one per turn, and wrote the final answer.

Claude doesn't have to work one tool at a time. It can ask for several tools in a single turn, and the SDK runs them together. The inbox agent in Chapter 6 reads emails this way, which is much faster. You can encourage it by marking tools that only read data, as Chapter 5 shows.

## The Helper That Prints It All

From now on, every project uses `watch.py` to print the stream in a friendlier way. Here it is in full:

```
@include projects/01-pantry-chef/watch.py
```

There's nothing clever in it, and that's the point: it's a plain `if` for each message type. `short()` squashes tool results onto one line and cuts them at 300 characters, so a big result doesn't flood your screen. The final `ResultMessage` prints the turns, the time and the cost. When you build your own agents, start with a helper like this. **You can't fix what you can't see.**

## Limits in Action

What happens when an agent hits its limit? Run the same kesari question with `max_turns` set to 2:

```
python messages.py 2
```

```
@include projects/01-pantry-chef/evals/messages-max-turns-2.txt
```

Three things to notice:

1. **The run stopped with `error_max_turns`.** Instead of `success`, the result's `subtype` says why it ended. There was no final answer.
2. **The SDK raised an error after the result.** A single `query()` call raises an exception when the run ends in an error, so wrap it in `try` and `except` if you want to handle it, as `messages.py` does.
3. **The actions had already happened.** In this run Claude asked for all seven `add_to_shopping_list` calls in a single turn, and all seven ran before the limit stopped the loop. The shopping list file has seven new lines, but you never got the answer that explains them.

That last point matters more than it looks. **Limits stop the loop; they don't undo anything.** An agent that has already sent an email, moved money or deleted a file can't be pulled back by hitting a limit. That's why risky tools need their own checks inside the tool code, not just a limit on the loop. Chapter 10 builds exactly that.

> **Tip:** Set `max_turns` to about twice the number of turns a normal run needs. Too low, and good runs fail. Too high, and a confused agent can wander for a long time before stopping. Measure a few normal runs first; the result message tells you how many turns they took.

## Reading the Result Message

Every run ends with a `ResultMessage`. These are the fields you'll use most:

| Field | What it tells you |
| --- | --- |
| `subtype` | How it ended: `success`, `error_max_turns`, `error_max_budget_usd`, or another error |
| `is_error` | `True` if anything went wrong, including an API error that still has the `success` subtype |
| `result` | Claude's final answer as text, or an error message |
| `structured_output` | The answer as data, when you ask for structured output (Chapter 6) |
| `num_turns` | How many turns the run took |
| `duration_ms` | How long it took, in milliseconds |
| `total_cost_usd` | The SDK's estimate of the cost |
| `usage` and `model_usage` | Token counts, overall and for each model used |
| `session_id` | An ID you can use to resume the conversation later (Chapter 15) |
| `permission_denials` | Tool calls that were refused |

Two traps catch almost everyone at first.

**`subtype` can say `success` when the run failed.** If the API itself returns an error, for example because your key is wrong or you've hit a usage limit, the result has `subtype` set to `success` and `is_error` set to `True`, and `result` holds the error text, such as "Not logged in". Always check `is_error`, not just `subtype`. Chapter 20 has a real example where a production job reported "error result: success" until this was fixed.

**A successful run isn't the same as a correct one.** `success` means the loop finished normally. It says nothing about whether the answer is right. Chapter 9 has an agent that "succeeded" with completely empty answers. Checking correctness is your job, and from Chapter 6 onwards every agent gets a grader that does it.

## Instructions: The System Prompt

The `system_prompt` option is the agent's standing instructions. Claude reads it at the start of every turn, before anything else. A good one covers four things:

1. **Who the agent is and who it works for**: "You are the inbox assistant for Amudha's Home Bakes, a home bakery in Chennai."
2. **What done looks like**: "Triage every email, then write a short report."
3. **Rules that must never be broken**: "Never put passwords, PINs or bank details in a reply."
4. **What to do when unsure**: "If the documents don't contain something, say so instead of guessing."

Keep it in plain sentences. You don't need special formatting or shouting in capital letters; Claude follows clear, calm instructions well. When something goes wrong, the fix is often one precise sentence added to the system prompt, as you'll see in Chapters 9 and 10.

If you don't set a system prompt, the SDK uses a minimal one. You can also ask for Claude Code's full system prompt (`{"type": "preset", "preset": "claude_code"}`), which is useful when your agent works on code, as Claude Code does. The agents in this book write their own, because they do business work, not coding.

> **Note:** The system prompt is a strong instruction, not a lock. A clever message can sometimes talk an agent out of its instructions. That's why rules that really matter, such as "never refund more than the customer paid", belong in tool code as well. Chapter 10 shows both working together.

## Key Takeaways

- `query()` streams messages: `SystemMessage`, `AssistantMessage` (text, tool calls, thinking), `UserMessage` (tool results) and, last, `ResultMessage`.
- A turn is one reply from Claude plus the results of the tools it asked for. One turn can include several tool calls.
- Print everything while you're building. You can't fix what you can't see.
- Limits stop the loop, not the actions already taken. Risky tools need their own checks.
- Check `is_error` as well as `subtype`, and never take `success` to mean "correct".
- Write the system prompt in plain sentences: role, goal, firm rules, and what to do when unsure.
