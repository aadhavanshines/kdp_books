# Part II: Building Sparrow

# Chapter 4: The Brain: One Turn With the Agent SDK

Every message Sparrow answers comes down to one **turn**: a system prompt, a user prompt and a set of tools go in, and a reply comes out, with any number of tool calls in between. This chapter builds the brain that runs a turn with Claude, and a scripted stand-in that lets you test everything else without the model.

## How an Agent Turn Works

When you give a model tools, a turn is a loop:

1. Your program sends the model the system prompt, the conversation and a description of each tool: its name, what it does, and a **schema** for its arguments.
2. The model answers either with text, which ends the turn, or with a request to call one or more tools, with arguments that fit their schemas.
3. Your program runs the requested tools and sends the results back.
4. The model reads the results and goes back to step 2: call more tools, or answer.

You could write this loop yourself with Anthropic's client library. Sparrow uses the **Claude Agent SDK** instead, which runs the loop for you, keeps track of cost, and handles details such as timeouts on the model's side. You give it the prompt, the tools and some options; it gives you a stream of messages, ending with a **result message** that has the final answer and the total cost.

## A First Agent in 50 Lines

Before building Sparrow's brain, here is the SDK on its own: one question, one tool. Save it as `examples/hello_sdk.py` anywhere you like:

```python
@include examples/hello_sdk.py
```

Three parts of the SDK are at work:

- **`@tool(name, description, schema)`** turns an `async` function into a tool. The function gets the arguments as a dictionary and returns the result as a list of **content blocks**, here one block of text. The schema is standard JSON Schema: an object with typed properties and a list of required ones.
- **`create_sdk_mcp_server`** bundles tools into an **MCP server** that runs inside your own program. MCP, the Model Context Protocol, is the standard way the SDK talks to tools. Because the server is in-process, your tools are ordinary Python functions with full access to your program's state. The SDK names each tool `mcp__<server>__<tool>`, so this one is `mcp__demo__add`.
- **`query(prompt, options)`** runs the turn and yields messages as it goes. The last one is a `ResultMessage` with the answer in `result` and the cost in `total_cost_usd`.

The options matter as much as the tools. `allowed_tools` lists the tools that may run without asking. `tools=[]` switches off the SDK's built-in tools, such as its own shell and file editor, which Sparrow must never get, because they would bypass every check you're about to write. `setting_sources=[]` stops the SDK from reading settings files from the current folder or your home folder, so Sparrow behaves the same wherever it runs. `max_turns` caps the number of model round trips in one turn.

Here's what it printed with the real model:

```
@include transcripts/hello_sdk.txt
```

Two round trips ("turns" in the SDK's counting): one where the model asked for `add`, and one where it read the result and answered. Notice the `**` around the answer. Claude likes Markdown, and in a terminal or a chat app those asterisks appear as they are. Sparrow's house rules (Chapter 5) ask for plain text for exactly this reason.

## Turn and Reply

Now Sparrow's brain, in `sparrow/brain.py`. It starts with its imports and two small data classes:

```python
@include sparrow/brain.py#L1-L42
```

A `Turn` is everything the brain needs: the system prompt, the user prompt, the tools this speaker may use, a `Context` (which you'll write in Chapter 6: who is asking and from where, plus a record of the tool calls made), the model's name, and two limits. `max_turns` is 12 round trips, enough for a task that reads a skill, a file and memory, then writes something; `timeout` is 180 seconds for the whole turn.

A `Reply` is what comes back: the text, the cost, an error if something went wrong, and the list of tool calls, which the tests and the audit log use to see what Sparrow actually did.

## What a Turn Costs

The SDK reports a turn's total cost in its final message. But a turn that times out or fails never gets a final message, and the model calls it made before that were still paid for. A first version of Sparrow recorded such a turn as costing nothing, so a model that kept timing out could spend far past the daily budget (Chapter 19) without the budget ever noticing. A code review found it. Now the brain estimates the cost itself, from the token counts the SDK sends with each of the model's messages:

```python
@include sparrow/brain.py#L45-L78
```

Prices are in US dollars per million tokens, for input and output; they're those of the two models Sparrow uses in October 2026, so check Anthropic's pricing page if you change models. A model that's not in the table is priced at the highest rate. Reading from the prompt cache costs a tenth of the input price, and writing to it twice the input price, the rate for the one-hour cache the SDK uses.

`add_usage` records each message's counts under its model call, because one call can arrive as several messages, one for each block it wrote. Measuring against the SDK's own totals showed two catches. First, the output count in a streamed message can be a partial one from early in the stream: in one turn the messages reported 37 output tokens in all, where the SDK's final total was 122. So `add_usage` also adds up the characters the call wrote, and `estimate_cost` counts at least one output token per three characters. Second, some output never appears in the stream at all, such as the model's thinking, so the total gets a margin of a quarter more. On four real turns, the estimates came out between 17% and 67% above the SDK's figures: too high, never too low, which is the safe direction for a budget.

## Wrapping Sparrow's Tools

Sparrow's tools are described by a small `Tool` class (Chapter 6) with a name, a description, a schema and a handler. `as_sdk_tool` turns one into an SDK tool:

```python
@include sparrow/brain.py#L81-L89
```

The important line is the call to `call_tool`. The SDK never calls a tool's handler directly; every call goes through `call_tool`, which checks permissions, handles private data, scrubs secrets and writes the audit log. This is the choke point described in Chapter 2. Because `ctx` is captured in the closure, each turn's tools know who they're working for.

## ClaudeBrain

The real brain builds the options for each turn:

```python
@include sparrow/brain.py#L92-L110
```

Each turn gets a fresh in-process MCP server with exactly the tools this speaker may use: all fifteen for the owner, only `read_skill` for a guest. `allowed_tools` lists the same tools by their SDK names. `cwd` points at an empty temporary folder, so even if something in the SDK looked at the working directory, it would find nothing of yours.

Running the turn is a loop over `query`:

```python
@include sparrow/brain.py#L112-L138
```

`asyncio.timeout` (new in Python 3.11) cancels the whole turn if it runs past the limit, so a stuck request can't hold a conversation forever. The loop keeps two kinds of message. Each `AssistantMessage` carries the token counts of the model call that produced it, which go into `usage`, keyed by the message's ID because one call can arrive as several messages. The `ResultMessage` at the end has the answer and the SDK's exact cost. `usage` is passed in by the caller rather than created here, so the counts survive when the timeout interrupts the loop with an exception. The result's `subtype` is `"success"` when the model finished normally; anything else, such as `"error_max_turns"` when it ran out of round trips, is reported as an error, and the gateway will tell the owner something went wrong rather than sending half an answer.

## Retrying Safely

Networks fail and services get busy, so the brain retries:

```python
@include sparrow/brain.py#L140-L160
```

It retries up to twice, waiting 2 and then 4 seconds, for the errors a retry can fix: SDK errors, timeouts and network errors. Every failed attempt's estimated cost is added to `spent`, which goes into the final reply whether it succeeds or not. But it **never retries once a tool has run**. Suppose Sparrow added a to-do, then the connection dropped before the model answered. A retry would run the whole turn again and add the to-do twice. Repeating a reminder or a file write is worse. So if `ctx.calls` isn't empty, the brain gives up and reports the error, and the owner can check and ask again. Chapter 24 tests all three cases, a retry that succeeds, no retry after a tool, and giving up, and also that a timed-out turn is priced.

> **Tip:** This is a general rule for agents: retries are safe only for work that hasn't changed anything yet, or for actions that are **idempotent** (doing them twice has the same effect as once). If you add a tool that pays a bill or sends an email, make sure no retry can ever run it twice.

## The Scripted Brain

The second brain doesn't call a model at all. It plays back a script:

```python
@include sparrow/brain.py#L163-L189
```

A script is a list of steps. `("tool", "remember", {"fact": "..."})` calls a tool, through the same `call_tool` as the real brain, so permissions, privacy and the audit log all work exactly as in real use. `("say", "Done.")` adds a line to the reply; `("say", function)` builds the line from the tool results so far. `("fail", "connection lost")` raises the error a broken connection would. The scripted brain also keeps every `Turn` it received, so a test can check exactly what the model would have been shown: the system prompt, the conversation, the tools offered.

You'll use it in nearly every test in Part IV. A test like "the owner says hello, and Sparrow answers" becomes:

```python
gateway, brain, telegram = make_gateway(
    [[("say", "Hello, Asha!")]]
)
await gateway.handle(owner_says("Hi"))
assert telegram.sent == [("100", "Hello, Asha!")]
```

That runs in milliseconds, costs nothing, and gives the same result every time, which is what lets 161 tests run in about twenty-five seconds.

## Key Takeaways

- A turn is a loop: the model asks for tools, your code runs them, the model reads the results, until it answers.
- The Agent SDK runs the loop; Sparrow gives it an in-process MCP server with only its own tools and switches off the built-in ones.
- Every tool call goes through `call_tool`, never straight to a handler.
- Retry only when nothing has happened yet; never repeat a turn after a tool ran.
- A scripted brain with the same interface makes the rest of Sparrow testable without the model.
