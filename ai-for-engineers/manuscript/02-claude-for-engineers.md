# Chapter 2: Claude for Engineers: Chat, Projects, Claude Code and the API

There are several ways to use Claude, and engineers need most of them. A quick question about a requirement belongs in a chat. A reusable assistant with your team's procedures belongs in a Project. Writing a log analyzer belongs in Claude Code. A tool that runs every night belongs in a program that calls the API. This chapter explains each one, sets up the workshop for the rest of the book, and runs a first check that everything works.

## Four Ways to Use Claude

| Way | What it is | Engineering uses | In this book |
| --- | --- | --- | --- |
| **Chat** (claude.ai, desktop and mobile apps) | A conversation in a browser or app; you paste text or attach files | Asking about one requirement, drafting an email to a supplier, explaining a log excerpt | Part I examples |
| **Projects** (in claude.ai) | A workspace with its own instructions and reference files, shared by every chat in it | A team assistant that knows your test procedures and style guide | Chapter 12 compares it with a built tool |
| **Claude Code** | An agent that works in your terminal or editor: reads files, writes code, runs commands | Writing and fixing analysis scripts, refactoring test tools, answering questions about a code base | Chapter 8, Chapter 14 |
| **The API and Agent SDK** | Your own programs call Claude and get structured answers back | Tools with checks, graders and schedules: every project in this book | Projects 1 to 10 |

The first three are ready-made products. The fourth is for building your own tools, and it's where the rigour comes from: a program can give Claude exactly the right input, demand an answer in a fixed structure, check that answer with code, and run the same way every night.

> **Note:** Which of these you may use at work, and with which data, is a company decision before it is a technical one. Chapter 3 covers it. Read it before you paste anything from work into any AI service.

## Chat: Quick Questions, Done Carefully

A chat is the fastest way to get help with one item. Paste a requirement and ask what's wrong with it; paste a log excerpt and ask what happened at 6.4 seconds. Three habits make chat answers much more useful for engineering:

1. **Give the context a colleague would need.** "Review this requirement" gets a generic answer. "Review this requirement from a window-lift controller specification for testability on a HIL bench; we test at 9, 13.5 and 16 V" gets a useful one.
2. **Ask for the evidence.** "Quote the words that make it untestable" lets you check the answer in seconds.
3. **Never copy a number you haven't checked.** If a chat answer contains a calculated value, calculate it yourself or with a script.

Chapter 4 turns these habits into a prompting method.

## Projects: A Shared Assistant With Your Team's Knowledge

In claude.ai, a **Project** holds instructions and files that every conversation inside it can use. A validation team might create a project with the test procedure template, the bench guide and the house style for defect reports, and an instruction such as "Answer only from the attached documents and quote them." Everyone on the team then gets the same assistant.

Projects are quick to set up and need no code. Their limits are the other side of that: you can't run a grader on them automatically, you can't check every quote with code, and you can't schedule them. Chapter 12 builds the same kind of knowledge assistant as a program, checks every quote, and compares the two approaches.

## Claude Code: An Agent for Engineering Code

**Claude Code** is an agent that works inside a folder on your computer. You describe a task in plain language; it reads the files, writes or changes code, runs it, reads the results and keeps going until the task is done. You can use it interactively in a terminal or editor, or run it once from a script with `claude -p "the task"` (called headless mode).

For engineers, Claude Code is the fastest way to get the *code* that does the measuring and calculating. In Chapter 8, it writes a 360-line pandas log analyzer from the bench guide and the test procedures, runs it, and checks its own figures against the raw data. You then prove the analyzer with a grader. That combination, AI writes the code and code does the measuring, is one of the most effective in this book.

Claude Code asks permission before it changes files or runs commands, and you can limit what it may do. Chapter 8 shows how those limits behave in practice, including two runs where the limits were wrong.

## The API and the Agent SDK: Your Own Tools

The projects in this book are Python programs that call Claude through the **Claude Agent SDK**, Anthropic's library for building programs on the same engine that powers Claude Code. Most projects use it in its simplest form: send one prompt, get back an answer in a fixed structure, with no tools at all. Projects 9 and 10 use more of it: tools, an MCP server and a pipeline.

Every project uses one small helper, `ask()`, so that the projects themselves stay short:

```
@include projects/common/claude_call.py::ask_async
```

The helper does four things worth knowing about:

- **`tools=[]`**: Claude gets no tools. It can't read files, run commands or browse the web; it can only read the prompt and write an answer. For drafting and reviewing, that is all it needs, and it's the safest setting.
- **`setting_sources=[]`**: the program ignores any local Claude Code settings and `CLAUDE.md` files, so it behaves the same on every computer.
- **`output_format`**: the answer must match a **JSON schema**, a description of the fields and their types. If a project asks for findings with an `id`, an `issue` and a `quote`, that's what it gets back, ready for code to check.
- **The cost from token counts.** The SDK reports its own cost estimate, but during this book's runs that estimate was wrong for models newer than the SDK version (it reported 47 cents for a Haiku 5.5 run that cost about one cent). The helper therefore calculates the cost from the token counts and a price table. Chapter 16 explains why that matters for evaluation.

## Which Claude Model?

| Model | ID | Price per million tokens, input / output | Used in this book for |
| --- | --- | --- | --- |
| Claude Haiku 5.5 | `claude-haiku-5-5` | $0.10 / $0.50 (prompts up to 100,000 tokens) | Comparison runs: cheap and fast |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | $2 / $10 | The default for every project |
| Claude Opus 5.5 | `claude-opus-5-5` | $4 / $20 | Comparison runs: deeper reasoning |

These are the October 2026 list prices for the Claude API. Anthropic also offers Claude Fable 5.1, a larger model at $10 / $50, which none of the projects needed. Prices change, so check the official pricing page (Appendix E) before you rely on them.

A **token** is a piece of text, roughly three-quarters of an English word. Reviewing the 36-requirement WLC-200 specification takes about 3,800 input tokens and 4,500 output tokens: about five US cents with Sonnet 5.5.

> **Tip:** Start every new tool with Sonnet. Chapter 16 shows how to decide, with measurements, whether a cheaper or a stronger model is better for a particular tool. In this book's comparisons, the answer differed from project to project.

## Setting Up Your Workshop

You need Python, the SDK, a key and a spending limit. It takes about twenty minutes.

**1. Python.** Open a terminal and run `python3 --version` (on Windows, `py --version`). You need 3.10 or newer; if you don't have it, install it from python.org. On Windows, tick **Add python.exe to PATH** in the installer.

**2. A project folder and a virtual environment.** Unpack the book's project files, open a terminal in the `projects` folder, and create a private set of Python packages for it.

On macOS or Linux:

```
python3 -m venv .venv
source .venv/bin/activate
```

On Windows:

```
py -m venv .venv
.venv\Scripts\Activate.ps1
```

Your prompt now starts with `(.venv)`. Activate the environment again each time you open a new terminal.

**3. The packages.** Install everything the projects use:

```
pip install claude-agent-sdk pandas matplotlib python-docx openpyxl mcp pytest
```

The book was tested with Claude Agent SDK 0.2.164, pandas 3.0, matplotlib 3.11, python-docx 1.2, openpyxl 3.1 and mcp 1.28. Newer versions should work; if one doesn't, install the tested version, for example `pip install claude-agent-sdk==0.2.164`.

**4. A key.** The projects call Claude through the API. Sign in to the Claude Console at platform.claude.com, add a few dollars of credit, create an API key and copy it. Then set it in your terminal:

```
export ANTHROPIC_API_KEY=your-key-here
```

On Windows PowerShell, use `$env:ANTHROPIC_API_KEY = "your-key-here"`. If your company reaches Claude through Amazon Bedrock, Google Cloud Vertex AI or Microsoft Foundry, set `CLAUDE_CODE_USE_BEDROCK=1`, `CLAUDE_CODE_USE_VERTEX=1` or `CLAUDE_CODE_USE_FOUNDRY=1` and that provider's credentials instead.

> **Warning:** Treat the key like a password. Never put it in code, a chat, a shared file or a repository. If it leaks, delete it in the Console and make a new one.

**5. A spending limit.** In the Console's billing settings, set a monthly spend limit, such as ten dollars. Every project also sets `max_budget_usd` for each call, so one faulty run can't spend much.

## Say Hello

The first program asks Claude one engineering question and checks that the whole chain works: Python, the SDK, the key, the helper and the structured answer.

```
@include projects/00-hello/hello.py
```

Run it from the `00-hello` folder:

```
python hello.py
```

<<RUN:hello>>

The answer comes back as a Python dictionary with exactly the two fields the schema asked for, so a program can use it directly: `result["answer"]["testable"]` is `False`. Every project in the book works this way.

If it doesn't work, Appendix C lists the common problems; the most frequent are an inactive virtual environment and a key that isn't set in the current terminal.

## Key Takeaways

- Use **chat** for single items, **Projects** for a shared team assistant, **Claude Code** for writing engineering code, and the **API with the Agent SDK** for tools that must be checked, graded and scheduled.
- The projects use one helper, `ask()`: no tools, no local settings, a JSON schema for the answer, and a cost worked out from token counts.
- Sonnet 5.5 is the default; Haiku 5.5 and Opus 5.5 are compared with measurements later.
- Set a spending limit in the Console and in code before you start.
