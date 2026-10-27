# Appendix E: Glossary

**Agent.** A program in which a language model decides which tools to call, in a loop, to complete a task.

**Agent SDK (Claude Agent SDK).** Anthropic's library that runs an agent loop with Claude: it sends prompts, offers tools, runs tool calls and reports the result and cost.

**Allowlist.** A list of things that are permitted; everything else is refused. Sparrow's egress policy uses one for websites.

**Approval.** A request for the owner's permission before a risky action, answered with `/approve CODE` or `/deny CODE`.

**Audit log.** A record of every message, tool call, decision and cost, one JSON line per event.

**bubblewrap (bwrap).** A small Linux program that runs a command in new namespaces; Sparrow's sandbox.

**Channel.** The connection between Sparrow and a place where you chat: terminal, web chat or Telegram.

**Context window.** The amount of text a model can read at once; prompts, history and tool results all count.

**Credential injection.** Adding a secret to an outgoing request outside the model, so the model never sees it.

**Egress.** Traffic leaving your machine. An egress policy decides where it may go.

**Embedding.** A list of numbers that represents the meaning of a piece of text, used for searching by meaning.

**Evaluation (eval).** A realistic scenario run against the real model and graded by code, usually several times.

**FTS5.** SQLite's full-text search extension, which finds rows by the words they contain.

**Gateway.** The long-running process at the center of a personal agent, through which every message passes.

**Guest.** In Sparrow, a person the owner has paired: they can chat, with one tool and nothing private.

**Heartbeat.** A regular check-in in which the agent reads a checklist and speaks only if something needs attention.

**`HEARTBEAT_OK`.** The reply that means "nothing to report"; the gateway sends nothing.

**Idempotent.** Having the same effect whether done once or several times. Only idempotent actions are safe to retry.

**JSON Lines (JSONL).** A file format with one JSON object per line, used for transcripts and logs.

**Lethal trifecta.** An agent with access to private data, exposure to untrusted content, and a way to communicate externally; together they allow data theft through prompt injection.

**Long polling.** Asking a server for new messages and letting it hold the request open until one arrives or a timeout passes.

**Luhn check.** The checksum that every valid payment card number passes; used to avoid mistaking other numbers for cards.

**MCP (Model Context Protocol).** A standard way for models to use tools. Sparrow's tools run in an in-process MCP server.

**Namespace (Linux).** A kernel feature giving a process its own private view of a resource, such as files, network or processes.

**Owner.** The person a personal agent works for, with access to every tool.

**Pairing.** Letting a stranger in as a guest, by the owner approving the code they were given.

**Personal agent.** An always-on agent that works for one person, chats where they do, remembers them, and acts on a schedule.

**Placeholder.** A stand-in such as `<EMAIL_1>` that replaces a private value in text sent to the model.

**Privacy router.** The part of Sparrow that replaces private values with placeholders before text leaves, and restores them locally.

**Progressive disclosure.** Putting only a short description of each skill in the prompt and loading the full instructions when needed.

**Prompt injection.** Text in data the model reads (a web page, a file) that the model treats as instructions.

**Red-teaming.** Testing by deliberately attacking a system the way an adversary would.

**Route.** Where a reply should go, written as `channel:chat`, such as `telegram:100`.

**Sandbox.** An isolated environment where a command can do its job and nothing else.

**Scripted brain.** A stand-in for the model that plays back fixed tool calls and replies, used in tests.

**seccomp.** A Linux feature that limits which system calls a process may make; Docker uses it by default.

**Session.** One conversation's transcript. The owner has one, `main`, across all channels; each guest has their own.

**Skill.** A folder with a `SKILL.md` file of instructions, and sometimes scripts, that teaches an agent a task.

**SSRF (server-side request forgery).** Tricking a server into making requests to addresses the attacker can't reach directly, such as internal services.

**System prompt.** The instructions sent with every turn, built by Sparrow from the workspace files.

**Token (model).** The unit models read and write text in, roughly three-quarters of a word; usage is billed per token.

**Token (secret).** A secret string that grants access, such as a bot token or the web chat token.

**Tool.** A function the model may ask to have called, described by a name, a description and a schema for its arguments.

**Trust boundary.** A line where data passes between parties that trust each other differently; a place to check.

**Turn.** One run of the agent loop: a prompt in, tool calls, a reply out.

**Untrusted content.** Text from outside the owner, such as web pages, files and command output, which Sparrow wraps in `<untrusted>` tags.

**Vault.** Sparrow's store of secrets, which adds them to requests for the right hosts and scrubs them from everything else.

**Workspace.** The folder of plain Markdown files that make Sparrow who it is: personality, owner, rules, memory, to-dos, skills and files.
