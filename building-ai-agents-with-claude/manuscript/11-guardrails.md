# Chapter 11: Hooks, Permissions and Guardrails

By now you've met several ways to keep an agent inside its rules: a careful system prompt, a short list of tools, checks inside the tools, a sandbox, limits on turns and money. This chapter puts them together into a single picture, adds the two most powerful controls the SDK offers, **hooks** and **permission callbacks**, and shows when to use which.

## Layers, Not Walls

No single control makes an agent safe. Each one catches problems the others miss, so you stack them, like the locks, alarm and insurance on a shop:

![The layers of protection around an agent, from the outside in: the system prompt, the tools the agent is given, permission rules, hooks, checks inside the tool code, the sandbox, limits on turns and money, human approval for big actions, and an audit log of everything.](images/diagram-guardrail-layers.png)

| Layer | What it does | Example in this book |
| --- | --- | --- |
| System prompt | Asks the agent to follow the rules | "Never put PINs in a reply" |
| Tool choice | Removes abilities the agent doesn't need | Support desk has no file or shell tools |
| Permission rules | Decide which tool calls run without asking | `Bash(python3 *)` only |
| Hooks | Your code runs before or after each tool call | Refund kill switch; audit log |
| Tool code checks | The tool refuses bad inputs | Refund never exceeds what was paid |
| Sandbox | The operating system limits what commands can touch | Analyst can't write outside its folder |
| Limits | Stop runaway loops and bills | `max_turns`, `max_budget_usd` |
| Human approval | A person decides big actions | Refunds over Rs. 2,000 |
| Audit log | Records what actually happened | `audit.jsonl` |

The outer layers are cheap and catch most problems. The inner layers are the ones you rely on when the outer ones fail.

## How the SDK Decides Whether a Tool May Run

Every time Claude asks for a tool, the SDK goes through the same checks, in this order:

1. **Hooks** run first. A `PreToolUse` hook can block the call outright.
2. **Deny rules** come next. Anything in `disallowed_tools` is refused, in every mode.
3. **Ask rules** from settings files send the call to your permission callback.
4. **The permission mode** may approve it. For example, `acceptEdits` approves file edits.
5. **Allow rules**, from `allowed_tools`, approve matching calls.
6. **Your `can_use_tool` callback** decides anything still undecided. In `dontAsk` mode this step is skipped and the call is refused.

Two consequences are worth remembering. A deny rule beats everything, so use it for things that must never happen. And anything not covered by a rule ends up at step 6, so an agent with no callback and `dontAsk` mode simply can't use tools you didn't allow.

### The Options That Control Tools

| Option | Effect |
| --- | --- |
| `tools=["Read", "Glob"]` | Only these built-in tools exist for this agent |
| `tools=[]` | No built-in tools at all |
| `allowed_tools=["Read", "mcp__desk__find_order"]` | These run without asking |
| `allowed_tools=["Bash(python3 *)"]` | Only shell commands that start with `python3` run without asking |
| `allowed_tools=["mcp__shop__*"]` | Every tool on the `shop` server runs without asking |
| `disallowed_tools=["mcp__stock__record_usage"]` | This tool is removed and can never run |
| `permission_mode="dontAsk"` | Anything not allowed is refused |

And the permission modes:

| Mode | Behaviour | Use it for |
| --- | --- | --- |
| `default` | Undecided calls go to your `can_use_tool` callback | Agents with a person available to approve |
| `dontAsk` | Undecided calls are refused | Unattended agents (most of this book) |
| `acceptEdits` | File edits are approved automatically | Coding agents you're watching |
| `plan` | The agent plans but doesn't change anything | Reviewing what an agent *would* do |
| `bypassPermissions` | Everything is approved except a few critical deletions | Throwaway sandboxes only |

> **Warning:** `bypassPermissions` turns off almost every check. Only use it inside a disposable container with nothing valuable in it, and never for an agent that reads content from the outside world.

## Hooks: Your Code at Every Step

A **hook** is a Python function that the SDK calls at a particular moment in the agent's life. The events available in Python include:

| Event | When it runs | Typical use |
| --- | --- | --- |
| `PreToolUse` | Before a tool runs | Block or change a call |
| `PostToolUse` | After a tool runs | Audit log, alerts |
| `PostToolUseFailure` | After a tool fails | Count and report errors |
| `UserPromptSubmit` | When a prompt arrives | Add context, screen input |
| `Stop` | When the agent finishes | Save state, final checks |
| `SubagentStart` and `SubagentStop` | When a subagent starts or finishes | Timelines (Chapter 14) |
| `PreCompact` | Before old conversation is summarised | Save the full transcript |
| `PermissionRequest` and `Notification` | When a permission is needed, or the agent reports status | Custom approval, alerts |

You register hooks in the options with a `HookMatcher`. The `matcher` picks which tools a hook applies to; leave it out to run the hook for every tool.

### A Kill Switch for Refunds

Here's a hook that every agent handling money should have: a way for the owner to stop it instantly, without touching the code. While a file called `REFUNDS_PAUSED` exists in the project folder, every refund is blocked before it runs:

```
@include projects/06-support-desk/kill_switch.py::refunds_paused
```

The hook returns a **permission decision** of `deny` with a reason. The reason goes back to Claude as the tool's result, so the agent can explain the situation to the customer, and the instruction "Escalate to Amudha instead" tells it what to do next.

It's registered for one tool only, using the tool's full name as the matcher:

```
@include projects/06-support-desk/kill_switch.py::main
```

Pause refunds and run it:

```
touch REFUNDS_PAUSED
python kill_switch.py
```

```
@include projects/06-support-desk/evals/runs/kill-switch.txt
```

The agent verified the order, tried to refund it, was blocked by the hook, and did exactly what the hook's message suggested: it escalated the case to Amudha and told the customer what would happen next. Delete the file, and refunds work again. In a real business, the "file" might be a setting in a database or an admin page, but the idea is the same: **a switch a person can flip, checked in code before every risky action.**

### The Audit Log Hook

You've already seen the support desk's `PostToolUse` hook in Chapter 10. It writes every tool call and its result to a file. Hooks are the right place for logging because they see every call, including ones the agent doesn't mention in its replies.

> **Note:** If you register several hooks for the same event, the SDK runs them at the same time, not one after another. Write each hook so it works on its own.

## Asking a Person: `can_use_tool`

Some decisions should be made by a person every time: a large refund, an email to a customer, a payment. The SDK supports this with the **`can_use_tool` callback**: a function that runs whenever a tool call needs permission, and returns allow or deny.

For this to work, the tool must *not* be in `allowed_tools`, otherwise it's approved before the callback is asked. This demo leaves `issue_refund` out, so every refund comes to Amudha:

```
@include projects/06-support-desk/approve.py::ask_owner
```

`asyncio.to_thread(input, ...)` waits for the owner to type without freezing the rest of the program. In a real application the question would go to a phone notification or an admin page instead of the terminal, and the agent would wait for the answer.

When you run it, the SDK prints a `CanUseToolShadowedWarning`: the callback won't be asked about `find_order` and `escalate`, because they're in `allowed_tools`. Here that's exactly what we want, so the run below hides the warning with `python -W ignore`. In your own agents, read the warning: it often means a tool you meant to guard is being approved without asking.

Here's a real run where the owner typed `n`:

```
@include projects/06-support-desk/evals/runs/approve-no.txt
```

The deny message did its job: the agent didn't argue or try another route. It offered the replacement cake, exactly as the message suggested.

> **Tip:** Write deny messages for Claude, not for a log file. "The owner declined this refund. Offer a replacement cake instead" gives the agent a way forward. "Permission denied" leaves it guessing.

## Keep the Agent's World Small

Guardrails are about what the agent *does*. Just as important is what the agent *knows* and *can see*.

**`cwd`** sets the agent's working folder. Built-in file tools can read inside it without permission, and nowhere else without permission. Point it at the smallest folder that contains what the agent needs, as the receipt scanner does with its project folder and the research analyst does with `docs`.

**`setting_sources=[]`** stops the agent from loading settings, `CLAUDE.md` files and other configuration from the computer it runs on. Without it, the agent may load your personal Claude Code settings, which can include permission rules, instructions and tools you didn't intend it to have. ShopMate, the production agent in Part V, sets it.

**What the model is told about its environment.** Chapter 10 described how an agent revealed the email address of the account it was running under. The engine passes some background to the model, such as the date and, in some setups, account details. Run production agents with an API key, limit what they may share in the system prompt, and test for leaks with a question like "What do you know about me?"

**Secrets stay out.** Never put API keys, passwords or customer data in a system prompt or a tool description. Tools should fetch only the data the current task needs.

## Choosing the Right Layer

When you want an agent to follow a rule, ask: what happens if it doesn't?

| If breaking the rule would... | Put it in |
| --- | --- |
| Make the answer a bit worse | The system prompt |
| Waste time or money | The system prompt, plus limits |
| Reveal private data | The tool code (return only what's allowed), plus a test |
| Lose money or do something irreversible | The tool code, plus human approval above a threshold, plus a kill switch |
| Damage the computer or other systems | No tool for it at all; if unavoidable, the sandbox |

And whatever the rule, log it, and test it with an attack.

## Key Takeaways

- Stack several layers of protection; each catches what the others miss.
- The SDK checks hooks, then deny rules, then ask rules, then the permission mode, then allow rules, then your callback.
- Use `PreToolUse` hooks to block or change calls, for example as a kill switch, and `PostToolUse` hooks to record them.
- Use `can_use_tool` for decisions a person must make, and write deny messages that tell the agent what to do instead.
- Keep the agent's world small: a narrow `cwd`, `setting_sources=[]`, no secrets in prompts.
- Match the protection to the harm: prompts for quality, code for money and privacy, no tool at all for anything dangerous.
