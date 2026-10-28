"""The sandbox: run a shell command where it can't hurt anything.

On Linux, bubblewrap (bwrap) starts the command in fresh namespaces: no
network, no view of your home folder, the system read-only, only the
files folder writable (as /work) and the skills read-only (as /skills).
On macOS, the built-in sandbox (sandbox-exec, with a Seatbelt profile)
applies the same rules in place: no network, nothing from your home
folder or the temporary folders except the files folder (writable),
the skills (read-only) and a fresh temporary folder for this command.
Resource limits stop runaway CPU time and file sizes. On Linux, memory
is limited too, and everything the command started ends with it. macOS
has no such limits, so a watchdog does both jobs there (see Watchdog).
"""

from __future__ import annotations

import os
import re
import secrets
import resource
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

from .config import SandboxSettings


def backend() -> str | None:
    """'bwrap' on Linux, 'seatbelt' on macOS, or None if unavailable."""
    if sys.platform == "darwin":
        return "seatbelt" if shutil.which("sandbox-exec") else None
    return "bwrap" if shutil.which("bwrap") else None


def bwrap_command(command: str, files: Path, skills: Path) -> list[str]:
    args = ["bwrap", "--ro-bind", "/usr", "/usr"]
    for name in ("bin", "lib", "lib64", "sbin"):
        if Path(f"/usr/{name}").exists():
            args += ["--symlink", f"usr/{name}", f"/{name}"]
    args += [
        "--proc",
        "/proc",
        "--dev",
        "/dev",
        "--size",
        str(64 * 1024 * 1024),  # /tmp holds at most 64 MB
        "--tmpfs",
        "/tmp",
        "--bind",
        str(files),
        "/work",
        "--ro-bind",
        str(skills),
        "/skills",
        "--chdir",
        "/work",
        "--unshare-all",  # no network, own processes and users
        "--die-with-parent",
        "--new-session",
        "--cap-drop",
        "ALL",
        "--clearenv",  # no API keys or tokens inside
        "--setenv",
        "PATH",
        "/usr/local/bin:/usr/bin:/bin",
        "--setenv",
        "HOME",
        "/work",
        "--setenv",
        "LANG",
        "C.UTF-8",
        "/bin/sh",
        "-c",
        command,
    ]
    return args


# Seatbelt rules: later rules win over earlier ones
SEATBELT = """
(version 1)
(deny default)
(allow process-exec process-fork sysctl-read)
(allow signal (target same-sandbox))
(allow file-read*)
(deny file-read* (subpath "/Users") (subpath "/Volumes")
                 (subpath "/private/var/folders") (subpath "/private/tmp")
                 (subpath (param "HOME")))
(allow file-read-metadata)
(allow file-read* (subpath (param "FILES")) (subpath (param "SKILLS"))
                  (subpath (param "TMP")) (subpath (param "PYTHON")))
(allow file-write* (subpath (param "FILES")) (subpath (param "TMP"))
                   (literal "/dev/null"))
"""


def seatbelt_command(
    command: str, files: Path, skills: Path, tmp: Path
) -> list[str]:
    """macOS can't show folders under new names, so /work and /skills
    in a command are rewritten to the real folders."""
    for name, real in (("/work", files), ("/skills", skills)):
        command = re.sub(
            rf"(?<![\w./-]){name}(?=/|\s|$)", str(real), command
        )
    params = {
        "HOME": Path.home().resolve(),
        "FILES": files,
        "SKILLS": skills,
        "TMP": tmp,
        "PYTHON": Path(sys.base_prefix).resolve(),
    }
    args = ["sandbox-exec", "-p", SEATBELT]
    for key, value in params.items():
        args += ["-D", f"{key}={value}"]
    return args + ["/bin/sh", "-c", command]


def limits(settings: SandboxSettings):
    """Runs in the child just before the sandbox starts."""

    def apply():
        mb = settings.memory_mb * 1024 * 1024
        cpu = settings.timeout_seconds
        size = 50 * 1024 * 1024
        for kind, value in (
            (resource.RLIMIT_AS, mb),  # not enforced by macOS
            (resource.RLIMIT_CPU, cpu),
            (resource.RLIMIT_FSIZE, size),
        ):
            try:
                resource.setrlimit(kind, (value, value))
            except (ValueError, OSError):
                pass

    return apply


class Watchdog:
    """macOS only. Every process the command starts inherits the
    marker SPARROW_RUN=<token> in its environment, even one that leaves
    the process group with setsid or nohup. The watchdog finds them with
    ps, adds up their memory, and kills them all when the memory limit
    is passed or the command ends. A process that clears its own
    environment (env -i) loses the marker and escapes the watchdog: a
    known limit of doing this without the kernel's help."""

    def __init__(self, token: str, memory_mb: int):
        self.marker = f"SPARROW_RUN={token}"
        self.memory_kb = memory_mb * 1024
        self.over = False
        self.done = threading.Event()

    def processes(self) -> dict[int, int]:
        """{pid: memory in KB} for every process with the marker."""
        ps = "ps -E -ww -o pid=,rss=,command= -U".split()
        out = subprocess.run(
            ps + [str(os.getuid())],
            capture_output=True,
            text=True,
            errors="replace",
        ).stdout
        found = {}
        for line in out.splitlines():
            parts = line.split(None, 2)
            if len(parts) == 3 and self.marker in parts[2]:
                found[int(parts[0])] = int(parts[1])
        return found

    def kill_all(self) -> None:
        for _ in range(5):  # again, in case one forked while dying
            found = self.processes()
            if not found:
                return
            for pid in found:
                try:
                    os.kill(pid, signal.SIGKILL)
                except OSError:
                    pass
            time.sleep(0.1)

    def watch(self) -> None:
        while not self.done.wait(0.2):
            if sum(self.processes().values()) > self.memory_kb:
                self.over = True
                self.kill_all()


def read_limited(stream, keep: int, into: list) -> None:
    """Read a stream to its end, keeping only the first `keep` bytes, so
    a command that prints forever can't fill Sparrow's memory."""
    kept, total = bytearray(), 0
    while chunk := stream.read(65536):
        total += len(chunk)
        if len(kept) < keep:
            kept += chunk[: keep - len(kept)]
    into += [bytes(kept), total]


def run_sandboxed(
    command: str, files: Path, skills: Path, settings: SandboxSettings
) -> tuple[int, str]:
    """Return (exit code, combined output). Exit code 124 is a timeout."""
    kind = backend()
    if not settings.enabled or kind is None:
        return 126, (
            "The sandbox is not available (bubblewrap on Linux or "
            "sandbox-exec on macOS is missing, or the sandbox is turned "
            "off), so commands are refused."
        )
    files, skills = files.resolve(), skills.resolve()
    watchdog = None
    with tempfile.TemporaryDirectory(prefix="sparrow-tmp-") as tmp:
        tmp = Path(tmp).resolve()
        if kind == "bwrap":
            args = bwrap_command(command, files, skills)
            args[0] = shutil.which("bwrap")
            # bwrap itself becomes process 1 inside the sandbox, and
            # anything there can read /proc/1/environ: so bwrap gets no
            # secrets either
            env = {"PATH": "/usr/bin:/bin", "LANG": "C.UTF-8"}
        else:
            args = seatbelt_command(command, files, skills, tmp)
            python = Path(sys.base_prefix) / "bin"
            env = {
                "PATH": f"{python}:/opt/homebrew/bin:/usr/local/bin:"
                "/usr/bin:/bin",
                "HOME": str(files),
                "TMPDIR": str(tmp),
                "LANG": "C.UTF-8",
                "SPARROW_RUN": secrets.token_hex(8),
            }
            watchdog = Watchdog(env["SPARROW_RUN"], settings.memory_mb)
        process = subprocess.Popen(
            args,
            cwd=files,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            stdin=subprocess.DEVNULL,
            preexec_fn=limits(settings),
            start_new_session=True,
            env=env,
        )
        limit = settings.max_output_chars
        result: list = []
        reader = threading.Thread(
            target=read_limited,
            args=(process.stdout, limit * 4, result),
            daemon=True,
        )
        reader.start()
        if watchdog:
            threading.Thread(target=watchdog.watch, daemon=True).start()
        try:
            code = process.wait(timeout=settings.timeout_seconds)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait()
            code = 124
        if watchdog:
            # End anything left running in the background, too
            watchdog.done.set()
            watchdog.kill_all()
            if watchdog.over:
                code = 137
        # A process that escaped the group could keep the pipe open
        reader.join(timeout=5)
        if not reader.is_alive():
            process.stdout.close()
    kept, total = result or [b"", 0]
    text = kept.decode("utf-8", errors="replace")
    if len(text) > limit or total > len(kept):
        text = text[:limit] + f"\n[... output cut: {total:,} bytes in all]"
    if watchdog and watchdog.over:
        text += f"\n[stopped: used more than {settings.memory_mb} MB]"
    return code, text
