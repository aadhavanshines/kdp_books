# Part V: Running It

# Chapter 25: Deploying

A personal agent is only useful if it's always running. This chapter makes Sparrow start when your computer starts and restart if it crashes, first as a **systemd** service on Linux, which is the simplest and safest choice, then as a **launch agent** on a Mac, then in a **Docker** container, with an honest look at what the sandbox needs there. It ends with where to run Sparrow: a home computer, a small server, or a Raspberry Pi.

## Where to Run It

Sparrow needs very little: about 100 MB of memory, almost no CPU between messages, and an outgoing internet connection. It needs no incoming connections at all, because Telegram is polled and the web chat listens only on the machine itself. So any always-on Linux machine or Mac will do:

- **A home server, mini PC or Raspberry Pi** (64-bit Raspberry Pi OS is Debian-based, so the Chapter 3 steps work as written). Your data stays in your home.
- **A Mac that stays on**, such as a Mac mini. Turn off automatic sleep in System Settings so reminders arrive on time.
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

## A Launch Agent on macOS

macOS starts and supervises programs with **launchd**. A **launch agent** is launchd's version of a systemd user service: it runs as you, when you log in. `deploy/local.sparrow.plist` describes Sparrow to launchd:

```
@include deploy/local.sparrow.plist
```

A launch agent is a **property list**, Apple's XML format for settings. `ProgramArguments` runs Sparrow with the virtual environment's Python, from the project folder. launchd doesn't read environment files, so the API key goes in `EnvironmentVariables`, which is why the installed file must be readable only by you (`chmod 600`). `KeepAlive` with `SuccessfulExit` set to false restarts Sparrow when it exits with an error, as `supervise` makes it do when any part fails (Chapter 10), but not when you stop it on purpose; `ThrottleInterval` waits ten seconds between restarts. Output and errors go to a log file in Sparrow's state folder.

Replace `YOU` with your user name (run `whoami` to see it) and `sk-ant-...` with your key, then install it with the commands in the comment at the top of the file. Check on it with:

```
$ launchctl print gui/$(id -u)/local.sparrow
$ tail -f ~/.sparrow/state/sparrow.log
```

To stop it for good, run `launchctl bootout` with the same two arguments as `bootstrap`. The test workflow checks the file with `plutil -lint`, macOS's own checker for property lists, on every change.

## Docker

If you'd rather run Sparrow in a container, `deploy/Dockerfile` builds an image:

```
@include deploy/Dockerfile
```

It starts from the slim official Python image, installs bubblewrap, creates a normal user, `sparrow`, installs the pinned packages, and copies in the code. Sparrow runs as that user, never as root, and its home folder is a volume, so your workspace and state live outside the container and survive rebuilds. The image also sets `SPARROW_WEB_HOST` to `0.0.0.0`, so the web chat listens on all of the container's network addresses. That sounds less safe than the usual `127.0.0.1`, but inside a container `127.0.0.1` means the container itself, which Docker can't forward to; the first version of the image made exactly that mistake, and the web chat couldn't be reached. Who can reach it is decided by the next file.

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

With Docker's defaults, every test that needs the sandbox failed, and `doctor` said so: "No permissions to create new namespace." Sparrow then refuses all commands, which is safe, and everything else works. With `seccomp=unconfined` and `systempaths=unconfined`, all 150 tests passed.

The same container also confirmed the web chat setting described above: started with the image's `SPARROW_WEB_HOST=0.0.0.0`, the chat page answered through Docker's forwarded port; started listening on `127.0.0.1` inside the container, as the first version did, the connection failed.

Those two options loosen the *container's* own isolation from your computer: the container may use system calls Docker would normally block, and see parts of `/proc` it would normally hide. Inside, Sparrow's sandbox is fully working, so commands from the model are still isolated; the difference is that the container as a whole is less locked down. There are three reasonable choices:

1. **Run Sparrow directly with systemd** (recommended on Linux). No container, and the sandbox works with no special options.
2. **Use Docker with the two options**, accepting a less isolated container, on a machine where Sparrow is the main thing running.
3. **Use Docker with the defaults**, accepting that Sparrow can't run commands. Skills that need scripts, such as the expense totals, won't work, and Sparrow will say so.

On a Mac you don't need Docker at all: Sparrow runs directly, with the Mac's own sandbox, as a launch agent. If you prefer Docker there, Docker Desktop runs containers in a Linux virtual machine, and the same three choices apply inside it.

> **Warning:** Never make Sparrow's sandbox optional to "make it work." `run_sandboxed` refuses commands when the sandbox can't run, on purpose. If you change that to run commands without the sandbox, every prompt injection that reaches `run_command` runs with your full permissions.

## Backups

Everything Sparrow knows is in `~/.sparrow`. Back it up like any important folder, but remember what's in it: `state/secrets.env` and `state/model.env` hold your tokens and keys, and the workspace and audit log hold your private information. Keep backups encrypted. To move Sparrow to a new machine, install it as in Chapter 3, copy `~/.sparrow` across, and run `doctor`.

## Key Takeaways

- Sparrow needs no incoming connections, so any always-on Linux machine or Mac can run it.
- Keep the model's API key in a `chmod 600` file read by the service manager.
- A systemd user service with `Restart=on-failure` and lingering keeps Sparrow running across crashes and reboots; on a Mac, a launch agent with `KeepAlive` does the same.
- In Docker, run as a normal user with the state on a volume and the web chat on 127.0.0.1 only.
- Docker's defaults block the sandbox; loosening them is a trade-off, and running directly with systemd avoids it.
