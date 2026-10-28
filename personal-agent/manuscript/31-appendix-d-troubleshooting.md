# Appendix D: Troubleshooting

Start with `python -m sparrow doctor`: most first-run problems show up there as a `FIX` line. This appendix lists those lines and the other problems readers are most likely to meet.

## Doctor Says FIX

**`set ANTHROPIC_API_KEY (see Chapter 3)`.** Neither an API key nor a Claude Code login was found. Run `export ANTHROPIC_API_KEY="sk-ant-..."` in the same terminal, or put it in `~/.sparrow/state/model.env` with `chmod 600` (Chapter 25), where `run`, `chat` and `doctor` find it.

**`the sandbox failed: ... No permissions to create new namespace`.** Your system doesn't let normal users create user namespaces. On Debian, check `sysctl kernel.unprivileged_userns_clone`; it should be `1`. On Ubuntu 23.10 and newer, AppArmor restricts unprivileged namespaces: make sure the `bubblewrap` package from Ubuntu is installed (it comes with a profile that allows it), rather than a copy from elsewhere. Inside Docker, see Chapter 25. Until it's fixed, Sparrow works but refuses commands.

**`the sandbox failed: ...` with "sandbox is not available".** On Linux, bubblewrap isn't installed: `sudo apt install bubblewrap` (Chapter 3). On a Mac, `sandbox-exec` should always be in `/usr/bin`; if it's missing, your macOS installation is unusual, and Sparrow refuses commands until it's back.

**On a Mac, `the sandbox failed` with "Operation not permitted" or "sandbox-exec: ...".** Some security tools for Macs block other programs from starting sandboxes. Check that `sandbox-exec -p "(version 1)(allow default)" /usr/bin/true` runs in Terminal; if it doesn't, the restriction is outside Sparrow.

**`...: SKILL.md must start with ---` or `bad or missing name` or `missing description`.** A skill file in `workspace/skills/` is broken. The message names the file. The header must start on the first line with `---`, have a `name` of lowercase letters, digits and hyphens, and a `description`.

**`put SPARROW_WEB_TOKEN=... in state/secrets.env`.** The web chat's token is missing. Run `init` again (it doesn't overwrite anything), or add a line yourself with a random value of at least 16 characters, such as the output of `python -c "import secrets; print(secrets.token_urlsafe(24))"`.

**`put SPARROW_TELEGRAM_TOKEN=... in state/secrets.env`** or **`add your Telegram ID to owners in sparrow.yaml`.** Follow Chapter 11.

## Sparrow Won't Start

**`Unknown setting in .../sparrow.yaml: ...`.** A setting is misspelled or in the wrong place. Compare it with Appendix A; section settings must be indented under their section.

**`.../secrets.env is readable by others; run: chmod 600 ...`.** Run the command it shows.

**`Set SPARROW_WEB_TOKEN in state/secrets.env`** or **`The web chat token must be 16+ characters`.** Add a token, or use a longer one; `doctor` says which.

**Sparrow stops with a traceback and "stopped unexpectedly" or another error.** One of its parts, such as the web chat or Telegram, failed, and Sparrow exited so that systemd or launchd restarts it. The last lines of the traceback say which part and why.

**`Address already in use`.** Another program, or another copy of Sparrow, is using port 8765. Stop it, or change `webchat.port`.

**`ModuleNotFoundError`.** The virtual environment isn't active, or packages aren't installed: `source .venv/bin/activate`, then `pip install -r requirements.txt`.

## On a Mac

**A command works in Terminal but not through Sparrow.** Commands run in the Mac sandbox can't read anything in your home folder except Sparrow's files folder and skills, and can't use the network. Put the files the command needs in `~/.sparrow/workspace/files`.

**A skill script can't find Python packages.** The sandbox's `PATH` starts with the Python installation Sparrow runs on, but not its virtual environment. Skill scripts should use only Python's standard library, as `totals.py` does.

**A command ends with code 137 and "stopped: used more than 512 MB".** The Mac's watchdog stopped it for using too much memory (Chapter 16). Raise `sandbox.memory_mb` if the command really needs more.

**A command can't find a file in `/tmp` or the temporary folder.** The sandbox can't read the computer's temporary folders, only its own scratch folder. Put the file in `~/.sparrow/workspace/files`.

**`ps` shows a leftover process after a command.** The watchdog ends every process that carries the command's marker. A process started with an empty environment (`env -i`) loses the marker and can survive; end it in Activity Monitor, and if a skill does this, fix the skill (Chapter 16).

**The launch agent doesn't start.** Run `launchctl print gui/$(id -u)/local.sparrow` and read the last exit status, and check `~/.sparrow/state/sparrow.log`. The usual causes are a `YOU` left in a path, or a missing or readable-by-others `model.env`, which the log names.

## Sparrow Doesn't Answer

**On Telegram only.** Look for `channel_error` in today's audit log. `401 Unauthorized` means the bot token is wrong or was revoked. Check that you messaged the right bot, and that your ID is in `owners`; if it isn't, you're a stranger and got a pairing code instead of an answer.

**Anywhere.** Check `/status` or `python -m sparrow status` for the spending limit. Then look in the audit log for `turn` events with an `error`: `error_max_turns` means a task needed more than twelve round trips; `TimeoutError` means a turn took longer than three minutes; an authentication error means the API key is wrong or out of credit.

**"Sorry, something went wrong on my side".** The model call failed. The reason is in the `turn` event's `error` field in the audit log.

## Sparrow Does the Wrong Thing

**It doesn't remember something.** Check `MEMORY.md`: is the fact there? If not, tell Sparrow again and say "remember this." If it is, ask in different words; memory search matches words, so "my sister" may not find "Priya" unless the line mentions "sister".

**A reminder came at the wrong time.** Check `timezone` in `sparrow.yaml`. Then check the job with "list my schedule": the time shown is the one stored.

**A reminder came late, with "(late: ...)".** Sparrow, or the computer, wasn't running at the time. Run Sparrow as a service on an always-on machine (Chapter 25).

**It keeps asking to visit a site.** Approve it once, and it's remembered in `state/approved-hosts.txt`; or add it to `egress.allow`.

**A new skill is refused as "limited to 3000 characters".** Skills must be short enough to read in full before you approve them. Ask Sparrow to shorten it, or put long reference text in a file the skill reads.

**It uses a skill wrongly, or not at all.** Make the skill's description say when to use it, and its steps more specific (Chapter 8).

**Replies contain `*` or `#` symbols.** The model sometimes ignores the plain-text house rule. Repeating it in `SOUL.md` helps.

## Tests Fail

**Sandbox tests are skipped.** On Linux, bubblewrap isn't installed; they run once it is. On a Mac, four Linux-only checks are always skipped, and on Linux one Mac-only check; that's expected (Chapter 20).

**Sandbox tests fail with "No permissions to create new namespace".** See the doctor entry above. The same applies to `test_init_doctor_status_and_pairing`, which runs `doctor` and is skipped only when there's no sandbox at all.

**A test fails with "unclosed database" or `ResourceWarning`.** Something opened a file or database and didn't close it. If you changed the code, look for a `Core` you created and didn't `close`.

**A test fails after you typed in the code.** The failure message shows what was expected and what came back. Compare the module it tests with the book's listing line by line; most problems are one changed word or a missing line.
