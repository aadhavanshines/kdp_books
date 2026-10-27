# Appendix B: Tool and Command Reference

## Tools

These are the fifteen tools the model can ask for (Chapter 6). Every call goes through `call_tool`, which checks the role, restores private values, catches errors, scrubs secrets and private data from the result, and writes the audit log.

| Tool | Arguments | What it does | Guests |
| --- | --- | --- | --- |
| `memory_search` | `query` | Best five matching lines from memory and daily notes | No |
| `remember` | `fact` | Adds one line to `MEMORY.md` and today's note | No |
| `list_files` | none | Lists the files folder | No |
| `read_file` | `path` | Reads a file in the files folder (untrusted, up to 50,000 characters) | No |
| `write_file` | `path`, `content` | Creates or replaces a file in the files folder | No |
| `todo_add` | `text`, `due` (optional, YYYY-MM-DD) | Adds a to-do | No |
| `todo_list` | none | Open to-dos with their numbers | No |
| `todo_done` | `number` | Marks a to-do done | No |
| `schedule` | `kind` (remind or task), `message`, `when` | Schedules a reminder or task (time forms in Chapter 12) | No |
| `list_schedule` | none | Active jobs, soonest first | No |
| `cancel_schedule` | `job_id` | Switches a job off | No |
| `web_fetch` | `url` | Fetches a page by the egress policy; new sites need approval | No |
| `run_command` | `command` | Runs a shell command in the sandbox | No |
| `read_skill` | `name` | A skill's instructions | Yes |
| `write_skill` | `name`, `description`, `instructions` | Proposes a skill; installed only on approval | No |

## Chat Commands

Commands are handled in code and never reach the model.

| Command | Who | What it does |
| --- | --- | --- |
| `/help` | Owner, guests | Lists the commands |
| `/new` | Owner, guests | Starts a fresh conversation; for the owner, Sparrow first saves anything worth keeping |
| `/status` | Owner | Model, spending today, jobs, approvals waiting, guests |
| `/approve CODE` | Owner | Approves a request and lets Sparrow continue |
| `/deny CODE` | Owner | Denies a request |
| `/pair approve CODE` | Owner | Lets a stranger in as a guest |
| `/pair list` | Owner | Lists guests and pending strangers |
| `/pair remove ID` | Owner | Removes a guest or pending stranger, such as `telegram:555` |

## Command Line

Run from the project folder with the virtual environment active. Add `--home PATH` to use a home folder other than `~/.sparrow`.

| Command | What it does |
| --- | --- |
| `python -m sparrow init` | Creates the home folder, starter settings, web chat token and workspace; never overwrites |
| `python -m sparrow doctor` | Checks model login, sandbox, skills and tokens; exit code 1 if anything needs fixing |
| `python -m sparrow chat` | Chats in the terminal, as the owner, with the scheduler running |
| `python -m sparrow run` | Runs the gateway with the web chat and Telegram, as enabled |
| `python -m sparrow status` | Prints the same report as `/status` |
| `python -m sparrow pairing list` | Lists guests and strangers with their codes |
| `python -m sparrow pairing approve CODE` | Pairs a stranger as a guest |
| `python -m sparrow pairing remove ID` | Removes a person |

## Tests and Evaluations

| Command | What it runs | Cost |
| --- | --- | --- |
| `pytest` | 150 unit, functional, security and robustness tests | Free |
| `python evals/run_evals.py` | 16 scenarios with the real model, three runs each | About US$0.50 |
| `python evals/run_evals.py --runs 1 --only NAME` | Matching scenarios once | A few cents |
| `python evals/system_test.py` | The real process from outside, with a crash and restart | A few cents |
| `python evals/benchmark.py` | Sparrow's own speed and memory, no model | Free |
