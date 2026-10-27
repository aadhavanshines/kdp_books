"""The sandbox: run a shell command where it can't hurt anything.

On Linux, bubblewrap (bwrap) starts the command in fresh namespaces: no
network, no view of your home folder, the system read-only, only the
files folder writable (as /work) and the skills read-only (as /skills).
On macOS, the built-in sandbox (sandbox-exec, with a Seatbelt profile)
applies the same rules in place: no network, nothing from your home
folder except the files folder (writable) and the skills (read-only).
Resource limits stop runaway CPU time, file sizes and, on Linux, memory.
"""

from __future__ import annotations

import os
import re
import resource
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
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
            }
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
        try:
            code = process.wait(timeout=settings.timeout_seconds)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait()
            code = 124
        # A process that escaped the group could keep the pipe open
        reader.join(timeout=5)
        if not reader.is_alive():
            process.stdout.close()
    kept, total = result or [b"", 0]
    text = kept.decode("utf-8", errors="replace")
    if len(text) > limit or total > len(kept):
        text = text[:limit] + f"\n[... output cut: {total:,} bytes in all]"
    return code, text
