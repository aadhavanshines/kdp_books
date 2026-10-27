# Appendix D: Troubleshooting

Start with `python -m sparrow doctor`: most first-run problems show up there as a `FIX` line. This appendix lists those lines and the other problems readers are most likely to meet.

## Doctor Says FIX

**`set ANTHROPIC_API_KEY (see Chapter 3)`.** Neither an API key nor a Claude Code login was found. Run `export ANTHROPIC_API_KEY="sk-ant-..."` in the same terminal, or, for the service, put it in `~/.sparrow/state/model.env` (Chapter 25).

**`the sandbox failed: ... No permissions to create new namespace`.** Your system doesn't let normal users create user namespaces. On Debian, check `sysctl kernel.unprivileged_userns_clone`; it should be `1`. On Ubuntu 23.10 and newer, AppArmor restricts unprivileged namespaces: make sure the `bubblewrap` package from Ubuntu is installed (it comes with a profile that allows it), rather than a copy from elsewhere. Inside Docker, see Chapter 25. Until it's fixed, Sparrow works but refuses commands.

**`the sandbox failed: ... bwrap: not found` or "bubblewrap is not installed".** Install it: `sudo apt install bubblewrap` (Chapter 3).

**`...: SKILL.md must start with ---` or `bad or missing name` or `missing description`.** A skill file in `workspace/skills/` is broken. The message names the file. The header must start on the first line with `---`, have a `name` of lowercase letters, digits and hyphens, and a `description`.

**`put SPARROW_WEB_TOKEN=... in state/secrets.env`.** The web chat's token is missing. Run `init` again (it doesn't overwrite anything), or add a line yourself with a random value of at least 16 characters, such as the output of `python -c "import secrets; print(secrets.token_urlsafe(24))"`.

**`put SPARROW_TELEGRAM_TOKEN=... in state/secrets.env`** or **`add your Telegram ID to owners in sparrow.yaml`.** Follow Chapter 11.

## Sparrow Won't Start

**`Unknown setting in .../sparrow.yaml: ...`.** A setting is misspelled or in the wrong place. Compare it with Appendix A; section settings must be indented under their section.

**`.../secrets.env is readable by others; run: chmod 600 ...`.** Run the command it shows.

**`The web chat token must be 16+ characters`.** Use a longer token.

**`Address already in use`.** Another program, or another copy of Sparrow, is using port 8765. Stop it, or change `webchat.port`.

**`ModuleNotFoundError`.** The virtual environment isn't active, or packages aren't installed: `source .venv/bin/activate`, then `pip install -r requirements.txt`.

## Sparrow Doesn't Answer

**On Telegram only.** Look for `channel_error` in today's audit log. `401 Unauthorized` means the bot token is wrong or was revoked. Check that you messaged the right bot, and that your ID is in `owners`; if it isn't, you're a stranger and got a pairing code instead of an answer.

**Anywhere.** Check `/status` or `python -m sparrow status` for the spending limit. Then look in the audit log for `turn` events with an `error`: `error_max_turns` means a task needed more than twelve round trips; `TimeoutError` means a turn took longer than three minutes; an authentication error means the API key is wrong or out of credit.

**"Sorry, something went wrong on my side".** The model call failed. The reason is in the `turn` event's `error` field in the audit log.

## Sparrow Does the Wrong Thing

**It doesn't remember something.** Check `MEMORY.md`: is the fact there? If not, tell Sparrow again and say "remember this." If it is, ask in different words; memory search matches words, so "my sister" may not find "Priya" unless the line mentions "sister".

**A reminder came at the wrong time.** Check `timezone` in `sparrow.yaml`. Then check the job with "list my schedule": the time shown is the one stored.

**A reminder came late, with "(late: ...)".** Sparrow, or the computer, wasn't running at the time. Run Sparrow as a service on an always-on machine (Chapter 25).

**It keeps asking to visit a site.** Approve it once, and it's remembered in `state/approved-hosts.txt`; or add it to `egress.allow`.

**It uses a skill wrongly, or not at all.** Make the skill's description say when to use it, and its steps more specific (Chapter 8).

**Replies contain `*` or `#` symbols.** The model sometimes ignores the plain-text house rule. Repeating it in `SOUL.md` helps.

## Tests Fail

**Sandbox tests are skipped.** bubblewrap isn't installed; they run once it is.

**Sandbox tests fail with "No permissions to create new namespace".** See the doctor entry above.

**`test_init_doctor_status_and_pairing` fails.** It runs `doctor`, which checks the sandbox; if the sandbox doesn't work on your machine, this test fails too.

**A test fails after you typed in the code.** The failure message shows what was expected and what came back. Compare the module it tests with the book's listing line by line; most problems are one changed word or a missing line.
