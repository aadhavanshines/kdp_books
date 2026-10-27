# Chapter 3: Setting Up

In this chapter you'll install what Sparrow needs, create the project folder, and get an API key for Claude. It takes about twenty minutes. At the end you'll see what Sparrow's first run looks like, so you know where you're heading.

## What You Need

- **Linux, macOS, or WSL2 on Windows.** On Linux, Sparrow's sandbox uses bubblewrap; on a Mac it uses the sandbox built into macOS, so there's nothing extra to install.
- **Python 3.12 or newer.** The code uses a few features from 3.12. It was tested on Python 3.12, 3.13, 3.14 and 3.15.
- **bubblewrap, on Linux only**: the small sandboxing program behind Sparrow's `run_command` tool. It's the same tool Flatpak uses to isolate desktop apps.
- **A Claude API key** from Anthropic, with a little credit. Sparrow's tests run without one; the real agent needs one.

Check your Python version:

```
$ python3 --version
Python 3.13.5
```

On a Mac, if `python3` is missing or older than 3.12, install a current Python from python.org or with Homebrew (`brew install python@3.13`).

On Linux, install bubblewrap with your system's package manager (on a Mac, skip this: macOS's `sandbox-exec` is already there). On Debian, Ubuntu and WSL2's default Ubuntu:

```
$ sudo apt install bubblewrap
```

On Fedora, use `sudo dnf install bubblewrap`; on Arch, `sudo pacman -S bubblewrap`. Then check it:

```
$ bwrap --version
bubblewrap 0.9.0
```

> **Note:** Some Linux systems switch off "unprivileged user namespaces," which bubblewrap needs when run by a normal user. If `bwrap --version` works but Sparrow's `doctor` command later says the sandbox failed with "No permissions to create new namespace," see Appendix D. Ubuntu 24.04 and newer ship an AppArmor profile that allows bubblewrap; on other systems an administrator may need to allow it.

## Getting the Code

Every file of Sparrow, with its tests, its evaluations and their recorded results, is in a free repository on GitHub:

**github.com/aadhavanshines/build-your-own-ai-personal-agent**

Open that address in a web browser, click the green **Code** button and choose **Download ZIP**, then unzip it wherever you keep your projects. If you use Git, you can clone it instead: type `git clone`, a space, and the address above with `https://` in front, all on one line.

Either way you get a folder called `build-your-own-ai-personal-agent` with the `sparrow` package, the `tests`, `evals` and `deploy` folders, and the `requirements.txt` file from this chapter. Its README repeats the setup steps and says which chapter each folder belongs to. The repository also runs Sparrow's tests automatically on Linux and macOS, with Python 3.12 to 3.15, every time it changes, and shows the results on its **Actions** tab.

You'll learn the most by typing the code as you read and using the repository to check your copy when a test fails. If you'd rather start from the finished Sparrow, use the downloaded folder in place of the one you're about to create, and skip the `mkdir` and `touch` steps below.

## The Project Folder

Create a folder for the project and a **virtual environment** inside it, a private set of Python packages for Sparrow:

```
$ mkdir sparrow && cd sparrow
$ python3 -m venv .venv
$ source .venv/bin/activate
```

The prompt now starts with `(.venv)`. Run `source .venv/bin/activate` again whenever you open a new terminal for this project.

Create `requirements.txt` with the exact versions the book was tested with:

```
@include requirements.txt
```

What each one is for:

- **claude-agent-sdk** runs Claude as an agent: it sends the prompt, offers the tools, runs the tool loop and reports the cost. It includes the engine it needs, so there's nothing else to install.
- **fastapi** and **uvicorn** serve the web chat; **websockets** lets the browser and Sparrow talk both ways.
- **httpx** makes web requests, for Telegram and for the `web_fetch` tool.
- **pyyaml** reads the settings file and the headers of skill files.
- **pytest** and **anyio** run the tests.

Install them:

```
$ pip install -r requirements.txt
```

Now make the package folders. Sparrow's code lives in `sparrow/`, with the channels in `sparrow/channels/` and the starter workspace files in `sparrow/templates/`:

```
$ mkdir -p sparrow/channels sparrow/templates/skills tests
$ touch sparrow/channels/__init__.py
```

The empty `__init__.py` makes `channels` a package. The main package's `sparrow/__init__.py` has a docstring and a version number:

```python
@include sparrow/__init__.py
```

Two small settings files help with testing and style. `pytest.ini` tells pytest where the code and the tests are, and makes a file or database left open count as a failure (Chapter 20 explains why):

```
@include pytest.ini
```

And if you use the **ruff** linter, `ruff.toml` keeps lines short enough to print, as in this book:

```
@include ruff.toml
```

By the end of the book the folder looks like this:

```
sparrow/                 the project
  requirements.txt
  pytest.ini
  sparrow/               the package
    __init__.py  __main__.py  brain.py  config.py  ...
    channels/            terminal.py  webchat.py  webchat.html
                         telegram.py
    templates/           SOUL.md  USER.md  AGENTS.md  ...
      skills/            daily-briefing/  expense-log/
                         packing-list/
  tests/                 the automated tests
  evals/                 the real-model evaluations
  deploy/                running as a service
```

## Getting an API Key

Sparrow's brain is Claude, which you reach through Anthropic's API. Sign in at **platform.claude.com**, add a little credit under Billing (US$5 is plenty for everything in this book), then open **API Keys** and create a key. It starts with `sk-ant-`. Copy it once; the console won't show it again.

Never put the key in your code or in a file you might share. Sparrow reads it from an environment variable called `ANTHROPIC_API_KEY`. For now, set it in your terminal:

```
$ export ANTHROPIC_API_KEY="sk-ant-..."
```

Chapter 25 moves it into a file only you can read, for when Sparrow runs as a service.

> **Tip:** If you already use Claude Code and are logged in on this computer, the Agent SDK can use that login while you experiment, and Sparrow's `doctor` command accepts it. For an agent that runs all the time, use an API key: it's billed separately, so you can see and limit exactly what Sparrow spends.

## What It Costs

You pay for the text the model reads and writes, measured in **tokens** (roughly three-quarters of a word each). Sparrow uses two models by default:

| Model | Used for | Price per million tokens in / out |
| --- | --- | --- |
| `claude-sonnet-5-5` | Conversations and tasks | US$2 / US$10 |
| `claude-haiku-4-5` | The heartbeat check | US$1 / US$5 |

In the end-to-end evaluations in Chapter 22, a typical conversation turn cost between half a US cent and two US cents, because each turn sends the system prompt and recent conversation again. A heartbeat every 30 minutes during waking hours adds roughly 28 small checks a day. For normal personal use that's well under a dollar a day, and Sparrow enforces a daily limit you choose (US$2 by default) so a runaway loop can't surprise you. Prices change, so check the current ones on Anthropic's pricing page.

## A First Look

Once you've written the code in Parts II and III, starting Sparrow takes three commands. Here is what they print, recorded from the finished Sparrow. The first creates Sparrow's home folder, `~/.sparrow`, with a starter configuration and workspace:

```
$ python -m sparrow init
```

```
@include transcripts/init.txt
```

The second checks that everything is in place: the model login, the sandbox, the skills, and the web chat's secret token:

```
$ python -m sparrow doctor
```

```
@include transcripts/doctor.txt
```

The third starts a chat in the terminal. This is a real session with the real model; the owner's lines aren't echoed because they were typed into the terminal:

```
$ python -m sparrow chat
```

```
@include transcripts/chat.txt
```

The owner asked Sparrow to log two expenses, then a third, and asked for the month's totals; the last message was `/status`. Behind those two short answers, Sparrow read its expense-logging skill, created `expenses.csv` in the owner's files folder, and ran the skill's totals script in the sandbox. Here is the file it wrote:

```
@include transcripts/expenses.txt
```

By Chapter 10 you'll understand every step of that exchange, and by Chapter 22 you'll have tests that check it happens the same way every time.

## Key Takeaways

- Sparrow needs Linux (or WSL2) or macOS, Python 3.12+, a Claude API key, and on Linux, bubblewrap.
- Pin package versions in `requirements.txt` so your Sparrow behaves like the book's.
- Keep the API key in an environment variable, never in code.
- A typical turn costs one or two US cents; a daily limit caps the worst case.
