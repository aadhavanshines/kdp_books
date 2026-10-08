# Appendix E: Glossary

**Agent.** A program in which a language model decides, step by step, which tools to use to reach a goal, sees the results, and decides what to do next.

**Agent loop.** The cycle at the heart of every agent: Claude replies or asks for a tool, the tool runs, the result goes back to Claude, and the cycle repeats until the task is done.

**Agent SDK.** The Claude Agent SDK: a library for Python and TypeScript that provides the agent loop, built-in tools, permissions, hooks, sessions and MCP support.

**API key.** A secret string that identifies your account to the Claude API. Anyone who has it can spend your money.

**Audit log.** A record of every tool call an agent made and its result, usually written by a hook.

**Autonomy level.** How much an agent may do without a person: inform, suggest, act with approval, or act within limits.

**Built-in tools.** Tools that come with the Agent SDK, such as `Read`, `Write`, `Edit`, `Glob`, `Grep`, `Bash` and `Agent`.

**`can_use_tool`.** A callback function that decides whether a tool call may run, for example by asking a person.

**Compaction.** Replacing the older part of a long conversation with a summary, so the agent can continue within its context window.

**Context window.** The maximum amount of text a model can consider at once, measured in tokens.

**Deny list.** The `disallowed_tools` option: tools that can never run, whatever else is configured.

**Eval.** A fixed set of inputs, plus a way to judge the outputs, that you run repeatedly to measure an agent.

**Fallback model.** A model the SDK uses if the main model is unavailable.

**Grader.** Code that checks an agent's output against known right answers or recomputed facts.

**Grounding.** Basing an answer on specific sources, so it can be checked against them.

**Hook.** Your own function that the SDK calls at a particular moment, such as before or after each tool call.

**Kill switch.** A control a person can flip to stop an agent's risky actions immediately, without changing code.

**Labels.** The right answers for test inputs, written by a person before the agent runs.

**Least privilege.** Giving an agent only the tools and permissions its job needs.

**MCP (Model Context Protocol).** An open standard for connecting AI applications to tools and data. An **MCP server** provides tools; an **MCP client**, such as an Agent SDK agent or Claude Code, uses them.

**Must-pass check.** An eval check that guards against harm; one failure fails the whole run.

**Permission mode.** How the SDK treats tool calls not covered by rules, such as `default` or `dontAsk`.

**Prompt injection.** Text in content an agent reads that tries to give the agent instructions.

**Prompt version.** A label for each version of an agent's instructions, recorded with every run.

**Rate limit.** The maximum number of requests and tokens an account can use in a period of time.

**Run log.** A file with one line per run of an agent: when, which version, the result, time taken and cost.

**Runbook.** A short guide to what to do when common problems happen, including how to switch the agent off.

**Sandbox.** An operating-system restriction on what an agent's commands can read, write and connect to.

**Schema.** A description of the exact shape of data, used here for structured output.

**Session.** One run of an agent, recorded as a transcript with an ID, which can be resumed or forked.

**Structured output.** A final answer returned as data matching a schema, rather than as free text.

**Subagent.** An agent that another agent hands a task to; it works in its own fresh conversation and returns only its result.

**System prompt.** The instructions that set an agent's role, rules and behaviour for a whole session.

**Token.** The unit models read and write text in; roughly three quarters of an English word. Prices are per million tokens.

**Tool.** A function an agent can ask to run, with a name, a description and defined inputs.

**Turn.** One step of the agent loop: one reply from Claude, with any tool calls it makes.
