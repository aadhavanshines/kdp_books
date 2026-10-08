# Chapter 20: Deploy: Running ShopMate Every Morning

ShopMate works on your laptop, and the evals prove it. But Amudha's brief has to be ready at 6:00 every morning, whether or not your laptop is open. This chapter moves ShopMate somewhere it can run on its own: into a container, onto a schedule, with its API key kept secret, its memory stored somewhere that lasts, and its evals running before every change.

## Choosing Where It Runs

A scheduled agent needs four things: something to start it on time, a computer to run it, a safe place for the API key, and somewhere to keep its files between runs. There are several reasonable ways to get them:

| Option | Starts it | Good for | Watch out for |
| --- | --- | --- | --- |
| Your own computer, with `cron` or Task Scheduler | The operating system | Trying it out | Doesn't run when the computer is off or asleep |
| A small cloud server (a VM) with `cron` | The operating system | Full control, steady cost | You maintain the server: updates, disk, security |
| GitHub Actions, on a schedule | GitHub | Small daily jobs; evals on every change | Schedules can start late; each run is a fresh machine |
| A cloud scheduler running a container (such as a cloud "jobs" service) | The cloud provider | Production at any scale | More setup; another bill to watch |
| Claude Managed Agents | Anthropic | Letting Anthropic host the loop and the sandbox | A different API from the Agent SDK (Chapter 24) |

ShopMate runs once a day for under a minute, so any of these would work. This chapter uses two that you can set up for free or close to it: a **Docker container**, which runs the same way on any computer or cloud, and **GitHub Actions**, which provides the schedule, the secret storage and the eval runs.

## Packaging It: Docker

A container packages ShopMate with exactly the Python version and libraries it was tested with. The same image runs on your laptop, a server or a cloud service, and behaves the same everywhere.

```
@include projects/09-shopmate/Dockerfile
```

Line by line, the important decisions:

- **A small, pinned base image** (`python:3.12-slim`).
- **Pinned libraries.** `requirements.txt` lists exact versions, so a new release of the SDK can't change ShopMate's behaviour without you noticing:

```
@include projects/09-shopmate/requirements.txt
```

- **A normal user, not root.** If the agent, or anything it runs, ever misbehaves, an ordinary user can do far less damage than root can. This is the container equivalent of the sandbox in Chapter 9.
- **No secrets in the image.** The API key arrives as an environment variable when the container *runs*. Anyone who gets a copy of the image gets no key. A `.dockerignore` file also keeps local files such as `.env`, `out/` and the eval results out of the image.
- **One image, two jobs.** By default the container serves the dashboard (Chapter 21); the scheduler runs `python run_daily.py` in the same image.

Build it and start the dashboard:

```
docker build -t shopmate .
docker run -d --name shopmate-ops -p 8000:8000 shopmate
```

```
@include projects/09-shopmate/evals/runs/docker-dashboard.txt
```

The dashboard is running as the `shopmate` user, and the health check correctly says "not OK": no brief has been made yet.

### The Bug That Only Appeared in the Container

The first version of the Dockerfile didn't have the `chown` line. Everything worked on the laptop. In the container, the first run of the daily job crashed immediately:

```
PermissionError: [Errno 13] Permission denied: '/app/out'
```

`WORKDIR /app` had created the folder as root, and `COPY --chown` changed the owner of the copied *files* but not of `/app` itself. So the `shopmate` user couldn't create the `out` folder. Worse, the crash happened before the run log or the alert file could be written, so nothing would have told Amudha. One `chown` line fixed it.

This is exactly why you test the container, not just the code. Running as a normal user is the right decision, and it's also the kind of change that breaks things that worked before.

## Failing Loudly

The next test was deliberate: run the daily job with **no API key**, to make sure a failure is reported properly. The first attempt reported this:

```
Attempt 1 failed: Claude Code returned an error result: success
Attempt 2 failed: Claude Code returned an error result: success
```

The job did the right things: it tried twice, logged both attempts, wrote the alert file and exited with an error code. But "error result: success" tells the person reading it nothing. As Chapter 4 explained, when the API itself fails, the SDK returns a result whose `subtype` is `success` and whose `is_error` is true, and then raises an exception that quotes the subtype. The real reason was in the result's own text all along. So `run_once_with` now reports `result.result` when there is one (you saw that `except` block in Chapter 18). The same test now gives:

```
@include projects/09-shopmate/evals/runs/docker-no-key.txt
```

And with a key that's wrong:

```
@include projects/09-shopmate/evals/runs/docker-bad-key.txt
```

Each message tells a person exactly what to fix. **Test your failure paths on purpose**, before a real failure tests them for you.

> **Note:** On a company network, you may see a different error: a "self-signed certificate" message, because a proxy is inspecting the traffic. The message itself tells you the fix: point `NODE_EXTRA_CA_CERTS` at your company's certificate bundle. Appendix C has more.

## Keeping the API Key Secret

The API key is the most valuable thing ShopMate has. Anyone with it can spend your money. The rules:

- **Never in the code, the image or the repository.** Not even in a "private" repository; private repositories get shared, cloned and forked.
- **Use the platform's secret store.** In GitHub, that's *Settings, Secrets and variables, Actions*. Cloud providers have their own secret managers. Docker gets it with `-e ANTHROPIC_API_KEY` from the environment of whoever starts it.
- **One key per agent.** Create a separate key for ShopMate in the Claude Console, so you can see its costs separately and switch it off without affecting anything else.
- **Set a spending limit** in the Console, as you did in Chapter 2, sized to what the agent should cost plus a margin.
- **Rotate it.** If a key might have leaked, delete it in the Console and create a new one. That's why it lives in one secret store and not in five config files.

> **Warning:** Agents built for other people must use an API key. A personal claude.ai login isn't meant for running products or services.

## Running It on a Schedule: GitHub Actions

The workflow file `deploy/morning-brief.yml` does two jobs. Copy it to `.github/workflows/` in a **private** repository holding ShopMate's code:

```
@include projects/09-shopmate/deploy/morning-brief.yml
```

**The schedule.** GitHub's `cron` times are in UTC. `30 0 * * *` is 00:30 UTC, which is 6:00 in India. Scheduled runs can start some minutes late when GitHub is busy, so if 6:00 matters, schedule a little earlier. The `workflow_dispatch` line adds a "Run workflow" button, so you can make a brief on demand.

**Evals on every pull request.** The `evals` job runs both demo days whenever someone proposes a change. If a new prompt, model or SDK version breaks a check, the pull request shows a red cross before the change reaches Amudha. Each eval run costs about 15 US cents. Making evals automatic is how you keep using them.

**The secret.** `${{ secrets.ANTHROPIC_API_KEY }}` passes the key to the step that needs it, and to no other step. GitHub hides its value in logs.

**Timeouts.** `timeout-minutes` stops a stuck job. Together with `max_turns` and `max_budget_usd` in the options, there are now three limits on a runaway run: turns, money and time.

**Keeping the output.** The last step uploads the `out` folder, including the brief and the run log, as a downloadable artifact, even when the run failed (`if: always()`).

> **Note:** The workflow was checked with `actionlint`, a tool that finds mistakes in GitHub Actions files, and each of its steps was run locally. Run it once by hand with the "Run workflow" button before relying on the schedule.

## Where Does the Memory Live?

Chapter 15 said ShopMate's memory is a small notes file that "survives anything". In a deployment, that needs care. Each GitHub Actions run starts on a fresh machine, so a file written in one run is gone by the next. The notes have to be stored somewhere that lasts.

This workflow stores them in the simplest place available: the repository itself. After a successful run, it commits `data/notes.json` back. Each morning's notes become a commit, so you get a full history of what ShopMate remembered and when, and you can correct a mistake by editing the file.

That works for one small agent writing one small file once a day. As things grow, move memory to a proper store: a cloud storage bucket, or a table in a database. The rule from Chapter 15 doesn't change: code decides what's saved, and the agent reads it through a tool.

> **Warning:** If memory or briefs contain customer details, the repository holding them must be private, and only people who need it should have access. Chapter 23 covers data protection.

## The Pre-Launch Checklist

Before the first scheduled run, go through this list. Every item comes from something earlier in this book:

| Check | Why |
| --- | --- |
| Evals pass, several times, with the exact model and SDK version you'll deploy | Chapters 16 and 19 |
| Versions pinned in `requirements.txt` | A new release can't change behaviour silently |
| Separate API key, stored as a secret, with a spending limit | Cost control, and a key you can switch off |
| `max_turns`, `max_budget_usd` and a job timeout set | Three limits on a runaway run |
| No unneeded tools; deny list for dangerous ones; `setting_sources=[]` | Chapter 11 |
| Runs as a normal user, with no secrets in the image | Less damage if something goes wrong |
| A run with no key and with a wrong key fails loudly, with a clear reason | Failure paths tested on purpose |
| Memory stored somewhere that survives a fresh machine | Chapter 15 |
| Someone will see an alert, and knows what to do with it | Chapter 21 |
| A rollback plan: the previous version can be restored quickly | Chapter 22 |

## Key Takeaways

- Pick the simplest place that runs reliably on time: a container plus a scheduler covers most small agents.
- Pin versions, run as a normal user, keep secrets out of the image, and test the container itself.
- Test failure paths on purpose, and make every failure message say what to fix.
- Keep the API key in a secret store, use one key per agent, and set a spending limit.
- Run the evals automatically on every proposed change.
- Each scheduled run may start on a fresh machine, so store memory somewhere that lasts.
- Work through a pre-launch checklist before the first real run.
