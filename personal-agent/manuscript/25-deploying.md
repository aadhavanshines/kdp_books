# Part V: Running It

# Chapter 25: Deploying

A personal agent is only useful if it's always running. This chapter makes Sparrow start when your computer starts and restart if it crashes, first as a **systemd** service on Linux, which is the simplest and safest choice, then in a **Docker** container, with an honest look at what the sandbox needs there. It ends with where to run Sparrow: a home computer, a small server, or a Raspberry Pi.

## Where to Run It

Sparrow needs very little: about 100 MB of memory, almost no CPU between messages, and an outgoing internet connection. It needs no incoming connections at all, because Telegram is polled and the web chat listens only on the machine itself. So any always-on Linux machine will do:

- **A home server, mini PC or Raspberry Pi** (64-bit Raspberry Pi OS is Debian-based, so the Chapter 3 steps work as written). Your data stays in your home.
- **A small cloud server.** Always on and reliable, but your workspace then lives on someone else's hardware; use disk encryption if the provider offers it.
- **Your laptop.** Fine for trying Sparrow, but it sleeps when you close the lid, and reminders arrive late (with Sparrow's "late" note) when it wakes.

## The Model Key, Out of Your Shell

So far the API key has been in your terminal's environment. A service doesn't read your terminal, so put the key in a file only you can read:

```
$ printf 'ANTHROPIC_API_KEY=%s\n' "sk-ant-..." \
    > ~/.sparrow/state/model.env
$ chmod 600 ~/.sparrow/state/model.env
```

It lives beside `secrets.env`, but separately, because it's read by the service manager to set Sparrow's environment, not by Sparrow's vault.

## A systemd Service

Most Linux systems use **systemd** to start and supervise services. A **user service** runs as you, with your permissions and no more, and needs no root access to install. `deploy/sparrow.service`:

```
@include deploy/sparrow.service
```

It assumes the project folder is `~/sparrow` with its virtual environment in `.venv`, as set up in Chapter 3; `%h` is your home folder. Change the two paths if yours differ. Line by line:

- `After=network-online.target` waits until the network is up before starting.
- `ExecStart` runs Sparrow with the virtual environment's Python, so no `activate` is needed.
- `EnvironmentFile` loads the API key from the file you just made.
- `Restart=on-failure` with `RestartSec=10` restarts Sparrow ten seconds after a crash. Combined with the system test in Chapter 24, you know a restart loses nothing.
- `NoNewPrivileges=yes` stops Sparrow, and anything it starts, from ever gaining more privileges, for example through a program with the setuid bit. bubblewrap works without them on systems with unprivileged user namespaces.

Install and start it, following the comments at the top of the file:

```
$ mkdir -p ~/.config/systemd/user
$ cp deploy/sparrow.service ~/.config/systemd/user/
$ systemctl --user enable --now sparrow
$ loginctl enable-linger $USER
```

`enable --now` starts Sparrow and sets it to start at every login. `enable-linger` keeps your user services running when you're logged out and starts them at boot, which is what an always-on agent needs. Check on it with:

```
$ systemctl --user status sparrow
$ journalctl --user -u sparrow -f
```

The unit file was checked with `systemd-analyze verify`, which reported no problems.

> **Tip:** Run `python -m sparrow doctor` before you enable the service. A service that fails at start-up restarts every ten seconds and fills the journal; `doctor` tells you why in one screen.

## Docker

If you'd rather run Sparrow in a container, or you're on a Mac and need Linux for the sandbox, `deploy/Dockerfile` builds an image:

```
@include deploy/Dockerfile
```

It starts from the slim official Python image, installs bubblewrap, creates a normal user, `sparrow`, installs the pinned packages, and copies in the code. Sparrow runs as that user, never as root, and its home folder is a volume, so your workspace and state live outside the container and survive rebuilds.

Build it from the project folder:

```
$ docker build -f deploy/Dockerfile -t sparrow .
```

And run it with `deploy/docker-run.sh`:

```
@include deploy/docker-run.sh
```

`--restart unless-stopped` gives the same automatic restarts as systemd. The volume maps your `~/.sparrow` into the container, the key comes from the same `model.env` file, and the web chat is published on `127.0.0.1` only, so it's no more reachable than when Sparrow runs directly.

## The Sandbox Inside Docker

The two `--security-opt` lines need explaining, because they're a real trade-off. Sparrow's sandbox creates Linux namespaces with bubblewrap. Docker's default security settings, a **seccomp** filter that blocks some system calls and masked `/proc` paths, stop a process inside a container from creating new user namespaces. Here's what happened when the test suite ran inside the container, as the `sparrow` user with no network:

```
@include evals/docker-test.txt
```

With Docker's defaults, every test that needs the sandbox failed, and `doctor` said so: "No permissions to create new namespace." Sparrow then refuses all commands, which is safe, and everything else works. (That run had 135 tests; the web chat's Origin test was added afterward.) With `seccomp=unconfined` and `systempaths=unconfined`, all the tests passed.

Those two options loosen the *container's* own isolation from your computer: the container may use system calls Docker would normally block, and see parts of `/proc` it would normally hide. Inside, Sparrow's sandbox is fully working, so commands from the model are still isolated; the difference is that the container as a whole is less locked down. There are three reasonable choices:

1. **Run Sparrow directly with systemd** (recommended on Linux). No container, and the sandbox works with no special options.
2. **Use Docker with the two options**, accepting a less isolated container, on a machine where Sparrow is the main thing running.
3. **Use Docker with the defaults**, accepting that Sparrow can't run commands. Skills that need scripts, such as the expense totals, won't work, and Sparrow will say so.

On a Mac, Docker Desktop runs containers in a Linux virtual machine, so option 2 gives you a working sandbox inside that machine.

> **Warning:** Never make Sparrow's sandbox optional to "make it work." `run_sandboxed` refuses commands when bubblewrap can't run, on purpose. If you change that to run commands without the sandbox, every prompt injection that reaches `run_command` runs with your full permissions.

## Backups

Everything Sparrow knows is in `~/.sparrow`. Back it up like any important folder, but remember what's in it: `state/secrets.env` and `state/model.env` hold your tokens and keys, and the workspace and audit log hold your private information. Keep backups encrypted. To move Sparrow to a new machine, install it as in Chapter 3, copy `~/.sparrow` across, and run `doctor`.

## Key Takeaways

- Sparrow needs no incoming connections, so any always-on Linux machine can run it.
- Keep the model's API key in a `chmod 600` file read by the service manager.
- A systemd user service with `Restart=on-failure` and lingering keeps Sparrow running across crashes and reboots.
- In Docker, run as a normal user with the state on a volume and the web chat on 127.0.0.1 only.
- Docker's defaults block the sandbox; loosening them is a trade-off, and running directly with systemd avoids it.
