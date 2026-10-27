# Chapter 16: The Sandbox

`run_command` is Sparrow's most powerful tool. It lets Sparrow run a skill's script, total a spreadsheet, convert a file or do a calculation, in any language installed on your computer. It's also the most dangerous: a shell command can delete files, read your SSH keys, or download and run anything. This chapter puts every command in a **sandbox**, an isolated environment where it can do its job and nothing else, and tells the story of the leak the tests found in the first version.

## What a Command Can See

![What a sandboxed command can see.](images/sandbox-view.png)

Inside the sandbox, a command sees the system's programs, read-only, so `python3` and the usual tools work. It sees your files folder as `/work`, which it can read and write; that's where it starts, and it's the only lasting thing it can change. Skill scripts are at `/skills`, read-only, so a command can't rewrite a skill. There's an empty `/tmp` that disappears afterward. And that's all: no network, no home folder, no environment variables beyond three harmless ones, no view of other processes, and limits on time, memory and file size.

## Linux Namespaces and bubblewrap

The sandbox is built from **Linux namespaces**, the same kernel feature that containers such as Docker use. A namespace gives a process its own private view of one kind of resource: its own list of mounted file systems, its own network (with nothing in it), its own process IDs, its own user IDs. The process isn't fenced in by rules that it could talk its way around; the things outside simply don't exist in its view.

**bubblewrap** (`bwrap`) is a small program that sets up namespaces for one command. You tell it what to mount where, which namespaces to create and what to run, and it does exactly that. It was written for Flatpak, which uses it to isolate desktop applications, so it's well reviewed and works for normal users without root on most Linux systems.

> **Interesting Fact:** NemoClaw's OpenShell runtime and Anthropic's own sandboxing for Claude Code both rely on kernel-level isolation rather than on asking the model to behave. Claude Code's sandbox on Linux uses bubblewrap, the same tool as Sparrow. When the people who build agents for a living converge on the same approach, it's a good sign.

## Building the Command

`sparrow/sandbox.py` starts with the bubblewrap arguments:

```python
@include sparrow/sandbox.py#L1-L59
```

Read the arguments as a description of the sandbox's world:

- `--ro-bind /usr /usr` mounts the system's programs and libraries read-only. On modern Linux, `/bin`, `/lib` and the rest are links into `/usr`, so the loop recreates those links rather than binding more folders.
- `--proc /proc` and `--dev /dev` give the command a fresh process list and a minimal set of devices, not the real ones.
- `--tmpfs /tmp` gives it an empty scratch folder in memory.
- `--bind <files> /work` mounts your files folder read-write, and `--ro-bind <skills> /skills` mounts the skills read-only. `--chdir /work` starts the command there.
- `--unshare-all` creates every kind of namespace. Most importantly, the new network namespace has only a loopback interface, so there is **no network at all**: no internet, no local network, no cloud metadata service.
- `--die-with-parent` kills the sandbox if Sparrow dies, so no command outlives it. `--new-session` detaches it from Sparrow's terminal, which stops a known trick for typing into the parent's terminal.
- `--cap-drop ALL` removes every special privilege the process might otherwise have inside its namespaces.
- `--clearenv` empties the environment, then `--setenv` adds back just `PATH`, `HOME` and `LANG`.
- Finally `/bin/sh -c <command>` runs the command through a shell, so pipes and `&&` work.

Notice what isn't mounted: `/home`, `/root`, `/etc`, `/var`. Your SSH keys, your browser profile, `~/.sparrow/state/secrets.env`, system password files: none of them exist inside.

## Limits

```python
@include sparrow/sandbox.py#L62-L73
```

Namespaces control what a command can *see*; **resource limits** control how much it can *use*. `limits` returns a function that runs in the child process just before bubblewrap starts, setting three limits that bubblewrap and the command inherit: address space (512 MB by default), so a runaway allocation fails with a `MemoryError` instead of exhausting your computer; CPU time, so a busy loop is stopped; and file size, 50 MB, so a command can't fill your disk.

## Running It

```python
@include sparrow/sandbox.py#L76-L110
```

`run_sandboxed` first checks that the sandbox is on and that `bwrap` exists. If either isn't the case, it **refuses** with exit code 126 and a clear message. There is no fallback that runs the command unsandboxed. A missing sandbox should make Sparrow less capable, never less safe.

The command runs in its own process group (`start_new_session=True`), so on a timeout the whole group can be killed with `SIGKILL`, including anything the command started in the background, and the result is exit code 124, the same code the standard `timeout` command uses. Output is captured with errors mixed in, decoded leniently, and cut to 4,000 characters with a note of how much was dropped, so a command that prints a million lines can't flood the model's context or your bill.

## The Leak the Tests Found

Look at the `env=` argument in `Popen`. It wasn't in the first version of this file, and the reason it's there is the best lesson in this book about testing security.

The first version cleared the environment with `--clearenv`, and the test for it passed: run `env` in the sandbox, check that `ANTHROPIC_API_KEY` isn't in the output. It wasn't.

But `--clearenv` clears the environment of the *command*. bubblewrap itself was started by Sparrow with Sparrow's full environment, including the API key, and inside the new process namespace, bubblewrap is **process 1**. On Linux, a process can read another process's environment from `/proc/<pid>/environ` if it runs as the same user, and inside the sandbox the command and bubblewrap are the same user. So:

```
cat /proc/1/environ
```

run inside the sandbox printed the API key.

This came out of a deliberate exercise: listing every way a process can learn a secret (its environment, files, other processes, the network) and writing a test for each. The second test ran `cat /proc/*/environ` and checked the output for the key, and it *passed*, even though the key was there. The output was more than 2,000 characters, the test's output limit, and the key came after the cut. The test was checking a truncated string.

The fix to the test was to make the sandbox do the searching and print only a number:

```
cat /proc/*/environ | tr '\0' '\n' | grep -c should-not-leak
```

A count of `0` means no process in the sandbox holds the secret; anything else is a leak. With that test, the leak showed up as a failure. Then the fix: start bubblewrap itself with an explicit minimal environment, `PATH` and `LANG` only, so there is nothing secret anywhere inside. The test turned green, and to be sure the test really guards the fix, the fix was removed again and the test failed again.

> **Common Mistake:** A security test that passes proves nothing until you've seen it fail. Every test for a protection should be checked at least once against a version without the protection. Here, the first test of `/proc` was wrong in a way that would have hidden the bug forever.

Two more lessons hide in this story. First, the environment is a poor place for secrets: everything you start inherits it unless you say otherwise. Sparrow's own secrets live in the vault (Chapter 17), and the model's API key is in the environment only because the Agent SDK reads it from there. Second, isolation tools do exactly what you ask, not what you mean. `--clearenv` did its job perfectly; the gap was in what nobody had asked it to do.

## Without Root

Everything above works as a normal user. To be sure Sparrow doesn't rely on root, the sandbox was run as an unprivileged user, ID 30033, with these results (exit code first):

```
@include evals/unprivileged-sandbox.txt
```

Writing to `/work` works; `/etc/passwd` and `/home` don't exist; `/usr` is read-only; the network is unreachable; and `sleep 30` is stopped at the time limit with code 124.

Some systems switch off unprivileged user namespaces, and some container setups block them. In those places bubblewrap fails, `doctor` reports it, and `run_command` refuses. Chapter 25 shows what that looks like inside Docker and the options that allow it.

## Key Takeaways

- Run every command the model asks for in a sandbox: read-only system, one writable folder, no network, no home folder, an empty environment, and limits.
- Linux namespaces make outside resources invisible rather than forbidden; bubblewrap sets them up for one command.
- If the sandbox isn't available, refuse commands; never fall back to running them unsandboxed.
- Secrets can leak through paths you didn't think of, such as `/proc/1/environ`; list every way a secret could be read, and test each.
- See every security test fail at least once without its protection.
