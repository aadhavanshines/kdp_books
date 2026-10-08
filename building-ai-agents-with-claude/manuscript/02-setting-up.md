# Chapter 2: Setting Up Your Agent Workshop

Before you build your first agent, you need four things: Python, the Claude Agent SDK, an API key, and a spending limit. This chapter sets up all four and finishes with a five-line test that proves everything works. It takes about twenty minutes.

## What You Need

- **A computer** running Windows, macOS or Linux. Any machine from the last few years is fine; the heavy thinking happens on Anthropic's servers, not yours.
- **Python 3.10 or newer.** The examples in this book were tested with Python 3.11 and 3.12.
- **A terminal**: Terminal on macOS, PowerShell on Windows, or any terminal on Linux.
- **A code editor.** Visual Studio Code is free and works everywhere. Any editor you like is fine.
- **An Anthropic account** with an API key and a few dollars of credit.

You don't need to install Claude Code separately. The Agent SDK brings its own copy, because it runs the same engine under the hood.

## Step 1: Install Python

Open a terminal and check whether you already have Python:

```
python3 --version
```

On Windows, type `py --version` instead. If you see `Python 3.10` or higher, you're ready. If not, download the installer from python.org. On Windows, tick **Add python.exe to PATH** on the first screen of the installer; it saves a lot of confusion later.

> **Note:** On macOS and Linux the command is usually `python3`; on Windows it's usually `py` or `python`. Once you've created the virtual environment in Step 2, plain `python` works everywhere, and that's what the rest of this book uses.

## Step 2: Make a Project Folder and a Virtual Environment

Every project in this book lives in its own folder inside one workshop folder. Create the workshop and move into it:

```
mkdir agents
cd agents
```

Next, create a **virtual environment**: a private set of Python packages for your agent projects, so they don't clash with anything else on your computer.

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

Your prompt now starts with `(.venv)`. That means it worked. You need to activate the environment again each time you open a new terminal: run the `source` or `Activate.ps1` line from inside the `agents` folder.

> **Tip:** If PowerShell refuses to run `Activate.ps1` with an "execution policy" error, run `Set-ExecutionPolicy -Scope Process RemoteSigned` and try again. That change only lasts until you close the window.

## Step 3: Install the Claude Agent SDK

With the environment active, install the SDK and `rich`, a small library that makes terminal output easier to read:

```
pip install claude-agent-sdk rich
```

Check what you got:

```
python -c "import claude_agent_sdk; print(claude_agent_sdk.__version__)"
```

This book was tested with version **0.2.164**. A newer version is fine; Chapter 22 explains how to upgrade safely, and why you should pin the version in serious projects. Later projects need a few more packages (`openpyxl`, `pandas`, `matplotlib`, `fastapi`, `uvicorn` and `mcp`). Each chapter tells you when to install them.

## Step 4: Get an API Key

Agents talk to Claude through the **Claude API**, and the API needs a key: a long secret string that identifies your account and pays for what you use.

1. Go to the **Claude Console** at platform.claude.com and sign up or log in.
2. Add credit under the billing settings. New accounts get a small amount of free credit to try the API; five or ten US dollars is plenty for this whole book.
3. Open **API keys** and create a new key. Give it a name such as `agents-book`.
4. Copy the key now. The Console only shows it once.

Now give the key to your agents by setting the `ANTHROPIC_API_KEY` environment variable. On macOS or Linux:

```
export ANTHROPIC_API_KEY=your-key-here
```

On Windows (PowerShell):

```
$env:ANTHROPIC_API_KEY = "your-key-here"
```

That setting lasts until you close the terminal. To make it permanent, add the `export` line to your shell's startup file (such as `~/.zshrc` or `~/.bashrc`), or on Windows set it under **Edit the system environment variables**.

> **Warning:** Treat your API key like a password. Never paste it into your code, a chat message, or a file you share or upload to GitHub. Anyone who has it can spend your money. If you think it has leaked, delete it in the Console and create a new one; that takes ten seconds.

The SDK reads the key from the environment. It does not read `.env` files on its own; if you prefer keeping keys in a `.env` file, load it yourself with the `python-dotenv` package before starting the agent, and add `.env` to your `.gitignore`.

### Other Ways to Connect

If your company already uses a cloud provider, the SDK can reach Claude through it instead of an Anthropic API key. Set `CLAUDE_CODE_USE_BEDROCK=1` for Amazon Bedrock, `CLAUDE_CODE_USE_VERTEX=1` for Google Cloud, or `CLAUDE_CODE_USE_FOUNDRY=1` for Microsoft Foundry, and configure that provider's own credentials. Everything else in this book works the same.

> **Note:** You may have a Claude subscription for chatting on claude.ai. That's a different product from the API. Anthropic's rules don't allow agents you build for other people to sign in with a claude.ai account; agents use API keys or one of the cloud providers. Keep your subscription for your own chatting and coding, and use an API key for your agents.

## Step 5: Set a Spending Limit

Agents run in loops, and a loop with a bug can keep spending. Put two safety nets in place before you start:

**A limit in the Console.** In the Claude Console, open your organization settings and find the **spend limits** section (at the time of writing it was on the Billing page). Set a monthly limit you're comfortable with, such as ten dollars. If you reach it, API requests stop working until the next month or until you raise it. You can also set limits for individual workspaces.

**A limit in your code.** Every agent in this book sets `max_budget_usd`, a ceiling for one run, and `max_turns`, a ceiling on how many times it can go around the loop. You'll see them in every listing:

```
max_turns=10,
max_budget_usd=0.50,
```

The two work together: the code limit stops a single runaway run early; the Console limit protects you from everything else, including mistakes in the code limit.

## Step 6: Say Hello

Time to check that everything works. Create a folder called `00-hello` inside `agents`, and in it a file called `hello.py`:

```
@include projects/00-hello/hello.py
```

Run it:

```
python hello.py
```

If everything is set up, you'll see something like this:

```
Terminal output:
Hello! / வணக்கம் (Vanakkam)!
Cost: $0.0035
```

That is a complete, if very small, agent run: Python started the SDK, the SDK connected to Claude with your key, Claude answered, and the SDK reported the cost: a third of a US cent.

Here's what each part does. `ClaudeAgentOptions` holds the settings: which model to use, which tools the agent may use (`tools=[]` means none at all), and how many turns it may take. `query()` sends the request and gives back a stream of **messages** as the agent works. This agent only looks at the last one, the `ResultMessage`, which holds the final answer and the cost. In Chapter 4 you'll print every message, and watch the agent think and act step by step.

### If It Doesn't Work

| What you see | What to do |
| --- | --- |
| `ModuleNotFoundError: No module named 'claude_agent_sdk'` | The virtual environment isn't active, or the install went into a different Python. Activate `.venv` and run `pip install claude-agent-sdk` again. |
| `Not logged in · Please run /login` or an authentication error | The API key isn't set in this terminal. Set `ANTHROPIC_API_KEY` again, then rerun. |
| `credit balance is too low` | Add credit in the Console. |
| An error saying the model isn't supported, or that a newer version is required | Your SDK is older than the model. Run `pip install --upgrade claude-agent-sdk`. |
| A certificate or proxy error | You're probably on a company network. Ask your IT team for the proxy settings, and see Appendix C. |

## How Agents Are Billed

The Claude API charges by the **token**, a small piece of text: roughly three quarters of an English word. You pay for the tokens Claude reads (your instructions, the conversation so far, and every tool result) and, at a higher rate, for the tokens it writes. In October 2026, the list prices per million tokens were:

| Model | Reading (input) | Writing (output) |
| --- | --- | --- |
| Claude Haiku 5.5 | $0.10 | $0.50 |
| Claude Sonnet 5.5 | $2 | $10 |
| Claude Opus 5.5 | $4 | $20 |
| Claude Fable 5.1 | $10 | $50 |

Two things make agents cost more than a single question. First, every turn of the loop sends the whole conversation again, so a 20-turn run reads its instructions 20 times. **Prompt caching** softens this: text Claude has seen recently costs a fraction of the normal price, and the SDK uses caching automatically. Second, tool results count as input, so a tool that returns a whole database table costs more than one that returns the three rows that matter. Chapter 5 shows how to design tools that are cheap as well as useful.

> **Note:** The cost the SDK reports is an estimate it calculates on your computer from a built-in price table. It's good for development and budgeting. For your real bill, use the Usage page in the Claude Console. Chapter 22 shows a case where the estimate was badly wrong, and what to do about it.

## How the Projects Are Laid Out

Each project lives in its own folder, named after its chapter:

```
agents/
  .venv/
  00-hello/
  01-pantry-chef/
  02-inbox-triage/
  ...
  09-shopmate/
```

Inside each project folder you'll find:

- `agent.py`, the agent itself, which you run with `python agent.py`.
- `watch.py`, a small helper that prints what the agent is doing (Chapter 4 explains it). It's the same in every project.
- The project's data: emails, receipts, documents or a database.
- `grade.py` or an `evals` folder, the code that checks the agent's work.

Each agent runs from its own folder. If you see "file not found" errors, first check that your terminal is in the right folder.

## Key Takeaways

- You need Python 3.10 or newer, the `claude-agent-sdk` package, an API key in `ANTHROPIC_API_KEY`, and a spending limit.
- Use a virtual environment so each set of projects has its own packages.
- Never put your API key in code or share it. If it leaks, replace it.
- Set limits twice: a monthly limit in the Console, and `max_turns` plus `max_budget_usd` in every agent.
- You pay per token, for reading and for writing. Long conversations and big tool results cost more.
- The SDK's cost figures are estimates. The Console's Usage page is the real bill.
