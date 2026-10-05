# Chapter 17: Agents and Tool Use

An **AI agent** is a system in which a model doesn't just answer once but works toward a goal over multiple steps: deciding what to do, using tools such as web search, code execution, databases, or APIs, observing the results, and continuing until the task is complete. Agents power coding assistants, research tools, customer service systems, and workflow automation. This chapter explains how to prompt and design them.

## From Chat to Agents

A chat assistant follows a simple loop: user asks, model answers. An agent follows a longer loop:

1. **Receive a goal.**
2. **Think:** decide what to do next.
3. **Act:** call a tool.
4. **Observe:** read the tool's result.
5. **Repeat** steps 2-4 until the goal is met.
6. **Report** the outcome.

This **think-act-observe** loop is sometimes called **ReAct** (Reasoning and Acting), after an influential research approach. Modern models are trained specifically to work in this loop, deciding when and how to call tools.

## Tool Use (Function Calling)

**Tool use**, also called **function calling**, lets a model request that your application run a function. You describe each tool with a name, a description, and a schema for its inputs. When the model decides a tool is needed, it outputs a structured request, your code executes it, and you return the result to the model.

A tool definition looks something like this, expressed in JSON:

```
{
  "name": "get_weather",
  "description": "Get the current weather for a city. Use this
    when the user asks about current conditions. Does not
    provide forecasts beyond today.",
  "input_schema": {
    "type": "object",
    "properties": {
      "city": {
        "type": "string",
        "description": "City name, e.g. 'Paris'"
      },
      "units": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"]
      }
    },
    "required": ["city"]
  }
}
```

## Writing Great Tool Descriptions

Tool descriptions are prompts. The model decides which tool to use, when, and with what inputs based almost entirely on them. Good descriptions:

- **Explain what the tool does and when to use it**, and when not to.
- **Describe each parameter**, with formats and examples.
- **State limitations**, such as "returns at most 20 results" or "data is updated daily."
- **Describe the output**, so the model knows what to expect.
- **Distinguish similar tools clearly.** If you have `search_orders` and `get_order`, explain exactly when to use each.

Poor tool descriptions are one of the most common causes of agent failures. When an agent misuses a tool, improve the description first.

> **Tip:** Design tools to be easy for a model to use correctly. Fewer, well-designed tools with clear purposes outperform dozens of overlapping ones. Return helpful error messages, such as "Date must be in YYYY-MM-DD format," so the agent can correct itself.

## The Model Context Protocol (MCP)

The **Model Context Protocol (MCP)** is an open standard, introduced by Anthropic and now widely adopted across the industry, for connecting AI applications to tools and data sources. Instead of building custom integrations for each tool and each AI app, developers create MCP servers that any MCP-compatible application can use. As a prompt engineer, the same principles apply: the tool names and descriptions an MCP server exposes are effectively prompts, and their quality determines how well agents use them.

## Prompting Agents

An agent's system prompt needs everything a regular system prompt does, plus guidance about autonomous work.

### Define the Goal and Success Criteria

Agents need to know when they're done. Vague goals lead to agents that stop too early or never stop.

```
Your task is to find and fix the cause of the failing checkout
tests. You're done when all tests in tests/checkout pass and you
have not modified any test files. Summarize the root cause and
your fix when finished.
```

### Specify Autonomy and Permissions

Be explicit about what the agent may do on its own and what requires confirmation:

```
You may read any file and run tests freely.
Ask for confirmation before: deleting files, installing new
dependencies, modifying database schemas, or sending any email
or message to a customer.
```

### Guide Planning and Persistence

```
For complex tasks, start by making a short plan. Work through it
step by step, updating the plan as you learn more. If an approach
fails twice, step back and consider a different approach instead
of repeating the same action.
```

### Encourage Verification

```
After making changes, verify them: run relevant tests, check the
output, and confirm the result matches the goal. Don't report
success until you have evidence.
```

### Ask for Honest Reporting

Agents can be tempted to report success optimistically. Counter this explicitly:

```
In your final report, state clearly what you completed, what you
verified and how, and anything you couldn't finish or are unsure
about. Never claim something works unless you tested it.
```

## Multi-Agent Systems

Complex workflows sometimes use multiple agents working together:

- **Orchestrator and workers:** A lead agent breaks a task into subtasks and delegates each to specialized sub-agents, then combines the results. This works well for research across many sources or parallel investigation.
- **Pipelines:** Agents hand work along a sequence, such as researcher to writer to editor.
- **Generator and critic:** One agent produces work while another reviews it against criteria.

When one agent delegates to another, the delegation message is a prompt, and it needs full context. Sub-agents don't know what the orchestrator knows. A common failure is vague delegation such as "research the competitors," which leads to duplicated or misdirected work. Good delegation specifies the objective, the scope, the expected output format, and what other agents are covering.

Multi-agent systems are powerful but add cost and complexity. Start with a single agent and add more only when the task clearly benefits.

## Long-Running Agents

For tasks that take many steps or span multiple sessions, the context window becomes a constraint. Techniques include:

- **External memory:** The agent keeps notes, progress logs, or task lists in files that it reads and updates.
- **Context summarization:** Older steps are summarized to free up space.
- **Checkpoints:** Work is committed or saved regularly so progress isn't lost.
- **Structured state:** Progress tracked in a structured file, such as a JSON list of tests passing and failing, rather than only in conversation.

## Agent Safety

Agents act in the world, so mistakes have consequences. Build in safeguards:

- **Least privilege:** Give agents only the permissions they need.
- **Human approval** for irreversible or high-impact actions, such as payments, deletions, and external communications.
- **Sandboxing:** Run code and browsing in isolated environments.
- **Logging:** Record every action for review.
- **Injection awareness:** Content the agent reads, such as web pages, emails, and documents, may contain malicious instructions. Chapter 19 covers this in depth.

## Key Takeaways

- Agents loop through thinking, acting with tools, and observing results until a goal is met.
- Tool descriptions are prompts; write them clearly, with usage guidance and limitations.
- MCP standardizes how AI applications connect to tools and data.
- Agent prompts must define success, permissions, planning, verification, and honest reporting.
- Use multi-agent designs only when needed, delegate with full context, and build in safety controls.
