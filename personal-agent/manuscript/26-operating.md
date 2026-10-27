# Chapter 26: Operating and Maintaining

Sparrow is running. This chapter is about living with it: the daily habits that keep it useful, how to look into anything surprising, how to keep its files tidy, how to update it safely, and what to do if you think something has gone wrong.

## Everyday Habits

**Teach it about you.** Spend ten minutes on `USER.md` in the first week. Each time Sparrow gets something wrong because it didn't know a fact (your partner's name, your working hours, that "the office" means the hospital), add a line. The improvement is immediate, because the file is in every prompt.

**Read its memory now and then.** Open `MEMORY.md` once a month. Delete facts that are no longer true, merge duplicates, and fix anything Sparrow misunderstood. A wrong memory is repeated confidently forever; a minute of editing fixes it.

**Tune the heartbeat.** If the heartbeat is too chatty, make `HEARTBEAT.md` stricter ("only if due today"). If it's never useful, add checks you'd value, or set `every_minutes` higher to save money.

**Use `/new` between topics.** A long conversation makes every turn more expensive and can confuse the model with old context. Starting fresh costs nothing: memory is kept, and Sparrow saves anything important first.

**Approve deliberately.** If an approval request surprises you, deny it and ask Sparrow why it wanted it.

## Checking What Sparrow Did

The audit log answers almost every "why did it do that?" question. Each day's file is `~/.sparrow/state/audit/YYYY-MM-DD.jsonl`, one JSON object per line. A few commands cover most needs. To see every tool call today:

```
$ cd ~/.sparrow/state/audit
$ grep '"event": "tool"' 2026-10-27.jsonl
```

To see every web address Sparrow checked and the policy's verdict:

```
$ grep '"event": "egress"' 2026-10-27.jsonl
```

To find errors of any kind:

```
$ grep -E '"event": "[a-z_]*error"' 2026-10-27.jsonl
```

And to total the day's model costs from the turn events, if you have the `jq` tool installed:

```
$ jq -s 'map(select(.event == "turn") | .cost_usd) | add' \
    2026-10-27.jsonl
```

`python -m sparrow status` gives the same day's total, plus jobs, approvals and guests, without reading any files.

## Keeping Files Tidy

Sparrow's files grow slowly, but they do grow:

- **Audit logs** add one file a day. They're useful for a few weeks and then mostly not. Delete or archive old ones, for example everything older than 90 days:

```
$ find ~/.sparrow/state/audit -name '*.jsonl' -mtime +90 -delete
```

- **Archived sessions** in `state/sessions/archive/` accumulate with every `/new`. They're your conversation history; keep or delete them as you like.
- **Daily notes** in `workspace/memory/` are searchable memory. Keep them; they're small.
- **`MEMORY.md`** only reaches the prompt in its newest 6,000 characters. When it grows well past that, move older facts that still matter higher up, or into `USER.md` if they're about who you are, and delete the rest.

## Updating

Three things change over time, and each needs a different kind of care.

**Sparrow's code.** If you change Sparrow, run `pytest` before restarting the service. The tests run in about fifteen seconds and catch most mistakes. If the change touches the prompts, tool descriptions, skills or house rules, also run the evaluations, because those changes affect what the model does, which only the real model can tell you.

**Packages.** `requirements.txt` pins exact versions on purpose. To update, change one package at a time, run `pip install -r requirements.txt`, run the tests, and keep the new version only if everything passes. Update the Agent SDK with particular care, and read its changelog first, because it sits between Sparrow and the model.

**The model.** Model names change and older models are retired; Anthropic publishes retirement dates in advance. To switch, change `model` (or `heartbeat_model`) in `sparrow.yaml` and run the evaluations with `--model` first. A newer model is usually better, but "usually" is why you run them. The evaluations in Chapter 22 are your acceptance test for a model change.

> **Tip:** Keep a copy of the last good `evals/results.json` before every update. If something feels different afterward, comparing the two files run by run shows exactly which behaviors changed.

## When Something Goes Wrong

**Sparrow doesn't answer.** Check the service (`systemctl --user status sparrow` on Linux, `launchctl print gui/$(id -u)/local.sparrow` on a Mac), then the journal or `~/.sparrow/state/sparrow.log` for start-up errors, then `doctor`. If it answers in the web chat but not on Telegram, look for `channel_error` events in the audit log; a changed bot token is the usual cause.

**It says it's reached the spending limit.** Check `status` and the turn events to see what used the budget. A scheduled task repeating too often, a chatty heartbeat, or a guest are the usual reasons. The limit resets at midnight in your time zone.

**You suspect a key or token leaked.** Revoke it at its source first: create a new API key in the Anthropic Console and delete the old one; send `/revoke` to @BotFather for the Telegram token. Put the new values in `model.env` and `secrets.env`, restart Sparrow, and then look through the audit log for when and how it might have leaked.

**You think Sparrow was tricked.** Stop the service. Look at the audit log for the turn in question: which page or file it read, which tools it called, which hosts it contacted. Check `approved-hosts.txt` and `workspace/skills/` for anything you don't remember approving, and remove it. Then add a scenario to `evals/scenarios.py` that reproduces the attack, so you'll know if it ever works again.

**A guest is misbehaving.** `/pair remove telegram:<id>`. They're back to being a stranger, with one pairing code and no model access.

## Key Takeaways

- Improve Sparrow by editing its plain files: `USER.md`, `MEMORY.md`, `HEARTBEAT.md` and skills.
- The audit log answers "what did it do?"; a few `grep` commands cover most questions.
- Rotate old audit logs; keep memory pruned so the prompt carries what matters.
- Run the tests after code changes, and the evaluations after prompt, skill or model changes.
- If a secret may have leaked, revoke it at the source first, then investigate.
