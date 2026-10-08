# Appendix A: The Agent Builder's Checklist

This checklist collects the book's advice in one place, in the order you'll need it. Use it when you start an agent, before you deploy it, and whenever you change it. The chapter numbers show where each point is explained.

## Before You Build (Chapters 1 and 17)

- The task needs judgement, several steps, or several sources. If fixed rules would do, write a script instead.
- Mistakes can be caught before they cause harm, or the agent's power is limited so they can't.
- A one-page plan exists: problem, goal, users, sources, what the agent may do, out of scope, risks, success criteria, cost estimate.
- The autonomy level is chosen: inform, suggest, act with approval, or act within limits. Start low.
- Every testable risk has a matching eval check.

## Tools (Chapters 5, 13 and 18)

- Each tool does one clear job, with a name and description that say when to use it.
- Inputs are simple and checked in code; errors say exactly what was wrong and what's allowed.
- Results are short text: summaries first, details on request ("list, then read").
- Tools gather facts and do arithmetic; the agent does the judging.
- Read-only tools are marked with `readOnlyHint`.
- Shared capabilities live in an MCP server; each agent gets only the tools it needs.

## Instructions and Output (Chapters 3, 6, 7 and 18)

- The system prompt gives the role, today's date, definitions of terms, and what to do in unusual cases.
- It says that content the agent reads is data, not instructions.
- It says what the agent must not promise or reveal.
- Results that code will use come back as structured output, with a schema.
- Rules that can live in the schema (allowed values, maximum lengths, required fields) do.
- Numbers, totals and dates are checked or recomputed by code.

## Safety (Chapters 9, 10, 11 and 23)

- Only the tools the job needs; `tools=[]` or a short list of built-in tools.
- Dangerous tools are in `disallowed_tools`; unattended agents use `permission_mode="dontAsk"`.
- Limits on money, access and actions are enforced in the tool code.
- Large or irreversible actions need human approval, through `can_use_tool` or a pending status.
- A kill switch exists for any agent that acts, and a person knows how to use it.
- Commands run in a sandbox; the sandbox is checked to be active.
- `cwd` is the smallest folder that works; `setting_sources=[]` for production agents.
- `max_turns` and `max_budget_usd` are set.
- No secrets or unnecessary personal data in prompts, tool descriptions or logs.
- Every tool call is logged by a hook.
- Attacks are tested: injected instructions, impersonation, requests for other people's data.

## Evals (Chapters 6, 16 and 19)

- Test data you control, with right answers written before running the agent.
- Scores for quality, and must-pass checks for safety, kept separate.
- Checks use code wherever possible: recompute, inspect effects, verify quotes, search for forbidden strings.
- Every eval runs several times; repeated identical failures are investigated.
- A failing check is read before anything is changed: sometimes the checker is wrong.
- Errors and zero-cost runs count as failures.
- The eval runs automatically on every proposed change.

## Deployment (Chapter 20)

- Versions pinned; the evals pass with exactly those versions.
- Settings come from environment variables; the API key comes from a secret store.
- One API key per agent, with a spending limit in the Console.
- The container runs as a normal user, with no secrets in the image.
- Failure paths tested on purpose: no key, wrong key, missing server.
- Memory is stored somewhere that survives a fresh machine.
- There's a rollback plan.

## Operation (Chapter 21)

- Every run is logged: time, status, error, model, prompt version, turns, time taken, cost.
- Failures raise an alert someone will see; a health check measures what matters.
- A runbook says what to do for each common failure, and how to switch the agent off.
- Cost is reviewed weekly and compared with the Console monthly.
- A sample of outputs is read regularly, and the users are asked for feedback.
- Every real problem becomes a new eval case before it's fixed.
- Old logs and transcripts are deleted on a schedule.

## Maintenance (Chapter 22)

- Upgrades are deliberate: read the release notes, change one version, run the evals, compare, deploy, watch.
- New models are compared on your own evals, for quality, cost and time.
- Cost is calculated from tokens when the SDK doesn't know a model's price.
- The prompt version changes with every prompt change, and is in the run log.
- Model deprecation notices are watched; the model name is a setting, not hard-coded.
- The agent is reviewed for retirement when its job changes or disappears.
