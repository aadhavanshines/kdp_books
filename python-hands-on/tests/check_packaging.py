"""Install the Chapter 17 package into a fresh virtual environment on every
Python version, run its command and its tests, and compare the transcripts.

The transcript from the main version is saved as code/ch17/install_transcript.out,
which the book prints.
Usage: python tests/check_packaging.py
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACKAGE = ROOT / "code" / "ch17" / "pocket-library"
VERSIONS = ["3.15", "3.14", "3.13", "3.12"]


def base_python(version):
    """The interpreter the venvs were made from (not a venv itself)."""
    venv_python = ROOT / ".venvs" / f"py{version}" / "bin" / "python"
    out = subprocess.run([venv_python, "-c", "import sys; print(sys._base_executable)"],
                         capture_output=True, text=True, check=True)
    return out.stdout.strip()


def transcript(version):
    lines = []
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        project = tmp / "pocket-library"
        shutil.copytree(PACKAGE, project)
        env = {k: v for k, v in os.environ.items() if not k.startswith("PYTHON")}
        env.update(NO_COLOR="1", PYTHONDONTWRITEBYTECODE="1", COLUMNS="76")
        venv = tmp / ".venv"
        bin_dir = venv / "bin"
        env["PATH"] = f"{bin_dir}{os.pathsep}{env['PATH']}"
        steps = [
            ("python -m venv .venv", [base_python(version), "-m", "venv", str(venv)]),
            ('pip install -q -e ".[test]"', [str(bin_dir / "pip"), "install", "-q", "-e", ".[test]"]),
            ("pocket --version", ["pocket", "--version"]),
            ('pocket add "Dune" "Frank Herbert" 1965', ["pocket", "add", "Dune", "Frank Herbert", "1965"]),
            ('pocket add "Emma" "Jane Austen" 1815', ["pocket", "add", "Emma", "Jane Austen", "1815"]),
            ('pocket read "dune"', ["pocket", "read", "dune"]),
            ("pocket list", ["pocket", "list"]),
            ('pocket read "Ulysses"', ["pocket", "read", "Ulysses"]),
            ("python -m pytest -q", [str(bin_dir / "python"), "-m", "pytest", "-q", "-p", "no:cacheprovider"]),
        ]
        for shown, cmd in steps:
            p = subprocess.run(cmd, cwd=project, env=env, stdout=subprocess.PIPE,
                               stderr=subprocess.STDOUT, text=True, timeout=600)
            out = re.sub(r" in \d+\.\d+s", " in 0.01s", p.stdout)
            out = "\n".join(ln for ln in out.splitlines() if "pip" not in ln.lower() or "notice" not in ln.lower())
            lines.append(f"$ {shown}")
            if out.strip():
                lines.append(out.rstrip())
            if p.returncode != 0 and not shown.startswith('pocket read "Ulysses"'):
                lines.append(f"[exit code {p.returncode}]")
    return "\n".join(lines) + "\n"


def wheel_check(version):
    """Build a wheel (Chapter 17 mentions python -m build), install it in a
    fresh environment, and run the command it provides."""
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        shutil.copytree(PACKAGE, tmp / "pkg")
        venv = tmp / ".venv"
        subprocess.run([base_python(version), "-m", "venv", str(venv)], check=True)
        py = str(venv / "bin" / "python")
        subprocess.run([py, "-m", "pip", "install", "-q", "build"], check=True)
        subprocess.run([py, "-m", "build", "-q", "--wheel", "--outdir", str(tmp / "dist"),
                        str(tmp / "pkg")], check=True, capture_output=True)
        wheel = next((tmp / "dist").glob("*.whl"))
        subprocess.run([py, "-m", "pip", "install", "-q", str(wheel)], check=True)
        out = subprocess.run([str(venv / "bin" / "pocket"), "--version"], cwd=tmp,
                             capture_output=True, text=True, check=True).stdout.strip()
        return wheel.name, out


def main():
    name, version_line = wheel_check(VERSIONS[0])
    print(f"Wheel: {name} installs and runs: {version_line}")
    results = {v: transcript(v) for v in VERSIONS}
    out_file = ROOT / "code" / "ch17" / "install_transcript.out"
    out_file.write_text(results[VERSIONS[0]])
    ok = True
    for v, text in results.items():
        same = text == results[VERSIONS[0]]
        ok &= same and "[exit code" not in text
        print(f"Python {v}: {'same transcript' if same else 'DIFFERENT'}"
              f"{'' if '[exit code' not in text else ', with errors'}")
    print(results[VERSIONS[0]])
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
