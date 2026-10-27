"""The sandbox: run a shell command where it can't hurt anything.

Bubblewrap (bwrap) starts the command in fresh Linux namespaces: no
network, no view of your home folder, the system read-only, only the
files folder writable (as /work) and the skills read-only (as /skills).
Resource limits stop runaway memory, CPU time and file sizes."""

from __future__ import annotations

import os
import resource
import shutil
import signal
import subprocess
from pathlib import Path

from .config import SandboxSettings


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


def limits(settings: SandboxSettings):
    """Runs in the child just before bwrap starts."""

    def apply():
        mb = settings.memory_mb * 1024 * 1024
        resource.setrlimit(resource.RLIMIT_AS, (mb, mb))
        cpu = settings.timeout_seconds
        resource.setrlimit(resource.RLIMIT_CPU, (cpu, cpu))
        size = 50 * 1024 * 1024
        resource.setrlimit(resource.RLIMIT_FSIZE, (size, size))

    return apply


def run_sandboxed(
    command: str, files: Path, skills: Path, settings: SandboxSettings
) -> tuple[int, str]:
    """Return (exit code, combined output). Exit code 124 is a timeout."""
    bwrap = shutil.which("bwrap")
    if not settings.enabled or bwrap is None:
        return 126, (
            "The sandbox is not available (bubblewrap is not "
            "installed or the sandbox is turned off), so "
            "commands are refused."
        )
    args = bwrap_command(command, files.resolve(), skills.resolve())
    process = subprocess.Popen(
        [bwrap, *args[1:]],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        stdin=subprocess.DEVNULL,
        preexec_fn=limits(settings),
        start_new_session=True,
        # bwrap itself becomes process 1 inside the sandbox, and anything
        # there can read /proc/1/environ: so bwrap gets no secrets either
        env={"PATH": "/usr/bin:/bin", "LANG": "C.UTF-8"},
    )
    try:
        output, _ = process.communicate(timeout=settings.timeout_seconds)
        code = process.returncode
    except subprocess.TimeoutExpired:
        os.killpg(process.pid, signal.SIGKILL)
        output, _ = process.communicate()
        code = 124
    text = output.decode("utf-8", errors="replace")
    limit = settings.max_output_chars
    if len(text) > limit:
        text = text[:limit] + f"\n[... {len(text) - limit} more chars]"
    return code, text
