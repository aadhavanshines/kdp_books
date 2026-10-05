# Chapter 13: Prompting AI Coding Assistants

AI has transformed software development. Tools such as GitHub Copilot, Cursor, Claude Code, OpenAI Codex, Gemini's coding tools, Windsurf, and others can complete code as you type, answer questions about a codebase, write tests, fix bugs, and increasingly carry out multi-step development tasks on their own. This chapter covers how to prompt them effectively, whether you're a professional developer or a beginner building your first project.

## Three Modes of AI Coding Help

**1. Inline completion.** As you type, the tool suggests the next lines. Your "prompt" is the surrounding code, comments, file names, and open files.

**2. Chat.** You ask questions or request changes in a chat panel, usually with access to your files.

**3. Agents.** You describe a task, and the agent plans, edits multiple files, runs commands and tests, and iterates until it's done, often with your approval at key steps.

Each mode needs a slightly different approach.

## Prompting Inline Completion

For inline tools, the code itself is the prompt. To get better suggestions:

- **Write a descriptive comment first.** A comment like `// Validate an email address; return true if valid, false otherwise. Reject addresses without a domain.` produces a much better suggestion than starting to type immediately.
- **Use clear names.** A function named `calculateMonthlyMortgagePayment(principal, annualRate, years)` tells the tool almost everything it needs.
- **Keep related files open.** Many tools use open files as context.
- **Show a pattern.** Write the first test case or the first handler yourself; the tool will follow the pattern for the rest.

## Prompting Coding Chat and Agents

For chat and agents, the six-part blueprint applies, with emphasis on the following.

### 1. State the Goal and the Definition of Done

```
Add a "forgot password" flow to the web app.

Done means:
- A user can request a reset link from the login page.
- The link is emailed and expires after 1 hour.
- Using the link lets them set a new password.
- Existing tests pass and new tests cover the flow.
```

Clear acceptance criteria let the agent verify its own work and tell you when it's finished.

### 2. Provide Context About the Codebase

Point to relevant files, patterns, and conventions:

```
Follow the pattern used in src/auth/signup.ts for validation and
error handling. Use our existing EmailService in
src/services/email.ts rather than adding a new library.
```

Many agentic tools support a project instructions file that's read automatically, such as `CLAUDE.md` for Claude Code, `AGENTS.md` for several tools, or rule files in other editors. Use it to record:

- How to build, run, test, and lint the project.
- Architecture overview and key directories.
- Coding conventions and patterns to follow.
- Things to avoid, such as "never edit generated files in /dist".

This saves you from repeating the same context in every prompt.

### 3. Share the Full Error

When debugging, include the complete error message, stack trace, what you expected, and what you tried:

```
Running `npm test` fails with the error below. It started after I
upgraded the date library. Expected: all tests pass.
I already checked that the timezone is set to UTC in the test
config.

<paste full error output>
```

### 4. Ask for a Plan First on Big Tasks

For large changes, ask for a plan before code:

```
I want to migrate our user data storage from local JSON files to
PostgreSQL. Before writing any code, explore the codebase and
propose a step-by-step plan, including files to change, risks,
and how we'll verify nothing breaks. Wait for my approval.
```

Reviewing a plan takes two minutes and can save hours of untangling a wrong approach.

### 5. Ask for Verification

Agents are most reliable when they can check their own work:

- "Run the test suite after the changes and fix any failures."
- "Write a failing test that reproduces the bug before fixing it."
- "Start the dev server and confirm the page loads without console errors."

### 6. Keep Tasks Scoped

"Refactor the whole app" invites chaos. "Extract the payment logic from `checkout.ts` into a separate module, without changing behavior" is reviewable and testable.

## Prompting Patterns for Common Coding Tasks

**Explaining code:**

```
Explain what this function does, step by step, for a developer
new to this codebase. Point out any edge cases or potential bugs.

<paste the function, or select it in your editor>
```

**Writing tests:**

```
Write unit tests for the `calculateDiscount` function. Cover
normal cases, boundary values (0, negative numbers, very large
values), and invalid inputs. Use the same test framework and style
as tests/pricing.test.ts.
```

**Code review:**

```
Review this diff as a senior engineer. Focus on correctness bugs,
security issues, and performance problems, in that order. For
each issue, explain the problem and suggest a fix. Ignore pure
style preferences.

<paste the diff>
```

```
Example output:
1. Correctness: `applyDiscount` runs before the cart total is
   loaded, so the discount is applied to 0. Move the call after
   `await loadCart()`.
2. Security: the order ID from the URL is used in a SQL string.
   Use a parameterized query to prevent SQL injection.
3. Performance: `getUser` is called inside the loop (one database
   query per item). Fetch the user once before the loop.
```

**Refactoring:**

```
Refactor this module to remove duplication between the three
export functions. Behavior must not change. Show me the
refactored code and explain each change.

<paste the module, or name the file>
```

**Learning a new technology:**

```
I know Python well but I'm new to Rust. Explain ownership and
borrowing by comparing them to how Python handles memory. Then
give me 3 small exercises with solutions.
```

## For Non-Programmers: Building with AI

Many people now build tools, websites, and automations with AI despite little coding experience, sometimes called "vibe coding." To succeed:

- **Describe the app from the user's point of view:** who uses it, what they do, and what they see.
- **Build in small steps.** Get a basic version working, then add one feature at a time.
- **Test after every change**, and describe problems precisely: what you did, what you expected, what happened, and any error messages.
- **Ask the AI to explain what it built**, so you understand your own project.
- **Use version control** such as Git so you can roll back when something breaks.

> **Warning:** AI-generated code can contain security vulnerabilities, such as exposed passwords or API keys, missing input validation, or insecure data handling. Before deploying anything that handles real users' data or money, have it reviewed by someone experienced, and ask the AI explicitly to audit the code for security issues.

## Common Pitfalls

- **Accepting code you don't understand.** Ask for explanations, and review diffs before accepting them.
- **Invented functions or packages.** Models sometimes reference library functions or packages that don't exist. Running the code and tests catches this quickly. Be careful with unfamiliar package names, since attackers sometimes publish malicious packages with names that AI models commonly invent.
- **Outdated APIs.** A model's training data may predate the library version you use. Tell it your versions, or paste relevant current documentation into the prompt.
- **Context gaps.** If the agent keeps making wrong assumptions, add the missing information to your project instructions file.

## Key Takeaways

- Inline completion is prompted by the surrounding code: write good comments and names.
- For chat and agents, define the goal and "done," give codebase context, and share full errors.
- Plan first for large tasks, keep scope tight, and ask agents to verify with tests.
- Store persistent project context in instruction files such as `CLAUDE.md` or `AGENTS.md`.
- Review AI-generated code for correctness and security before relying on it.
