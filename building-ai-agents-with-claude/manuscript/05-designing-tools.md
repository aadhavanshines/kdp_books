# Chapter 5: Designing Tools Claude Can Use Well

An agent can only be as good as its tools. A brilliant model with confusing tools makes mistakes, wastes turns and runs up costs. An ordinary task with clear, safe tools goes smoothly. This chapter collects the tool design lessons from every project in the book, including one experiment where changing nothing but the names of some ingredients made an agent faster, cheaper and error-free.

## Claude Only Knows What You Tell It

When Claude decides which tool to call, it sees exactly three things about each tool: its **name**, its **description** and its **input schema**. It doesn't see your code. It can't guess that `qty` means kilograms, that `find_order` needs a phone number, or that `issue_refund` will refuse amounts over two thousand rupees, unless you say so.

So write tool descriptions the way you'd brief a new colleague on their first day: what the tool does, when to use it, what it needs, and what it gives back.

| Weak | Strong |
| --- | --- |
| `get_data`: "Gets data." | `sales_report`: "Orders and revenue for yesterday, compared with the same weekday a week earlier, and yesterday's top products." |
| `refund`: "Refund." | `issue_refund`: "Refund money for a verified order, as the policy allows." |
| `lookup(id)` | `find_order(order_id, phone_last4)`: "Look up an order. Needs the order id and the last 4 digits of the customer's phone number." |

## The Five Rules of Good Tools

### 1. Name Things the Way People Talk

Names are the first thing Claude reads, and it will use them in its reasoning. `list_stock`, `read_email` and `escalate` say what they do. `get_data_v2` and `proc` don't. Use a verb and a noun, and use the same words your users use. The bakery talks about "orders" and "refunds", so the tools do too.

The same applies to the data inside your tools, and that's where the experiment comes in.

### 2. Make the Data Easy to Refer To

The Kitchen Manager in Chapter 13 plans ingredient orders through a tool called `draft_purchase_order`, which takes a supplier and a list of ingredients. In the first version of the stock file, ingredients were named with their units in brackets: `"maida (kg)"`, `"butter (kg)"`, `"fresh cream (L)"`.

Claude read the stock list, then naturally asked for "maida", "butter" and "cocoa powder". Every call failed. Worse, the first version of the tool gave a misleading error:

```
Terminal output:
→ draft_purchase_order {"supplier": "Sundar Traders", "items":
[{"ingredient": "maida", "qty": 22}]}
  ← Error executing tool draft_purchase_order: maida isn't supplied
by Sundar Traders.
```

Maida *is* supplied by Sundar Traders. The real problem was the name, but the error blamed the supplier. Claude worked it out anyway, retried with the exact names from the stock list, and succeeded. Its final summary even mentioned the trouble: "The drafting tool rejected plain ingredient names such as 'maida'."

Here are three versions of the same agent, each run for real on the same task:

| Version | Failed tool calls | Turns | Cost |
| --- | --- | --- | --- |
| 1. Names with units, misleading error | 3 | 10 | $0.062 |
| 2. Names with units, clear error listing the valid names | 3 | 10 | $0.040 |
| 3. Plain names ("maida", "butter"), units in a separate field | 0 | 7 | $0.031 to $0.036 (5 runs) |

Version 2 still failed three times, because Claude sent all three orders in one turn, before it could see any error. But it then fixed all three in a single step, where version 1 had to work it out. Version 3 never failed at all.

The lesson has two halves. **Clear names prevent errors. Clear error messages make recovery fast.** You want both.

### 3. Return What's Needed, Not Everything

Every tool result becomes part of the conversation, and Claude reads the whole conversation on every turn. A tool that returns a 2,000-row table costs money on every turn after it, and buries the three rows that matter.

- Return a summary, not raw data: `sales_report` returns yesterday's total, the comparison and the top three products, not every order.
- Make long results scannable: one item per line, with units.
- Let Claude ask for more detail with a second tool (`list_inbox` gives subjects; `read_email` gives one full email).

### 4. Fail Helpfully

When something goes wrong inside a tool, tell Claude what happened and what would work instead. There are two ways to report an error.

Return a result with `isError` set to `True`. Claude sees it as a failed tool call and can try again:

```
@include projects/02-inbox-triage/agent.py::read_email
```

Or raise an exception, as the MCP server in Chapter 13 does. The SDK turns it into an error result, using the exception's message.

Either way, the message is for Claude, so make it specific: "No email with id 031." beats "Error." And "Unknown ingredient 'maida'. Known: maida (kg), sugar (kg), ..." beats "Not found."

### 5. Put the Rules in the Tool

Whatever a tool does, it should check its own inputs, even if the system prompt already tells Claude the rules. The support desk's refund tool in Chapter 10 refuses to refund an order that hasn't been verified, refuses to pay back more than the customer paid, and holds big refunds for the owner, all in plain Python:

```
@include projects/06-support-desk/desk.py::Desk.tools.issue_refund
```

This is the most important tool rule in the book. **The system prompt asks; the tool enforces.** A prompt can be argued with. A Python `if` can't.

## Telling Claude Which Tools Are Safe to Run Together

Some tools only read: they look things up and change nothing. You can mark them with a **read-only hint**, which tells the SDK they're safe to run at the same time:

```
@include projects/02-inbox-triage/agent.py::READ_ONLY
```

```
@tool(
    "list_inbox",
    "List every email in the inbox: id, sender, date and subject.",
    {},
    annotations=READ_ONLY,
)
```

With this hint, Claude can read several emails in one turn instead of one per turn. Only use it for tools that truly change nothing. Writing files, sending messages and issuing refunds are never read-only.

## Describing Inputs Precisely

The simplest input schema is a dictionary of names and Python types:

```
{"order_id": str, "phone_last4": str}
```

The SDK turns it into a standard JSON Schema for you. Every key is required. When you need more, such as a description for each field, a fixed list of allowed values, or optional fields, you have two options.

Add a description with `Annotated`:

```
from typing import Annotated

{"amount": Annotated[int, "Refund amount in whole rupees"]}
```

Or write the JSON Schema yourself, which lets you use `enum` for fixed choices and leave optional fields out of `required`:

```
{
    "type": "object",
    "properties": {
        "urgency": {"enum": ["urgent", "normal"]},
        "note": {"type": "string"},
    },
    "required": ["urgency"],
}
```

The support desk's `escalate` tool shows a third approach that's worth knowing: accept a simple string, then clean it up in the code. If Claude sends an urgency of "URGENT" or "high", the tool turns it into one of the two values it understands. Being liberal in what you accept, and strict in what you do with it, makes tools robust.

## Built-In Tools

Besides your own tools, the SDK comes with the tools Claude Code uses. The ones in this book are:

| Tool | What it does | Used in |
| --- | --- | --- |
| `Read` | Read a text file, an image or a PDF | Receipt Scanner, Research Analyst |
| `Glob` | Find files by name pattern | Research Analyst |
| `Grep` | Search inside files | Research Analyst, Launch Team |
| `Write` and `Edit` | Create and change files | Data Analyst, Launch Team |
| `Bash` | Run shell commands | Data Analyst, Launch Team |
| `Agent` | Hand a task to a subagent | Launch Team |
| `ListMcpResourcesTool` and `ReadMcpResourceTool` | Read documents an MCP server offers | Kitchen Manager |

There are more, including `WebSearch` and `WebFetch` for the internet. You choose which built-in tools an agent has with the `tools` option:

- `tools=[]` gives no built-in tools at all (Pantry Chef, Inbox Triage).
- `tools=["Read", "Glob"]` gives just those two (Receipt Scanner).

Then `allowed_tools` says which tools may run without asking, and it can narrow a tool down further. `"Bash(python3 *)"` allows only commands that start with `python3`. Chapter 11 covers the whole permission system.

> **Warning:** If you don't set `tools`, the agent gets a broad default set, including `Bash`, which can run any command your user account can. For anything except a quick experiment, set `tools` explicitly.

## Test Tools Without Claude

A tool is just a Python function, so you can test it without running the agent, and without paying for anything. The book's tests call the support desk's refund tool directly to check that its rules hold:

```
@include tests/test_guardrails.py::test_refund_capped_at_order_amount
```

These tests run in under a second, cost nothing, and give the same answer every time. Write them for every tool that changes something. If the rules in your tools are solid, a confused or tricked agent can only do limited harm.

## Key Takeaways

- Claude sees only a tool's name, description and input schema. Write them like a briefing for a new colleague.
- Name tools and data the way people talk. In this book's experiment, plain ingredient names took failed calls from three to zero and cut the cost by about half.
- Return summaries, not dumps. Every result is re-read on every later turn.
- Make errors specific and suggest what would work.
- Enforce rules inside the tool. The prompt asks; the code enforces.
- Mark read-only tools so Claude can run them together, choose built-in tools explicitly, and test your tools without the model.
