"""Run the program printed on the front cover and check that its output is
the output the cover shows, on every Python version.

Usage: python tests/check_cover_code.py
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "build"))
from covers import COVER_CODE, COVER_OUTPUT  # noqa: E402

ok = True
for version in ("3.15", "3.14", "3.13", "3.12"):
    python = ROOT / ".venvs" / f"py{version}" / "bin" / "python"
    out = subprocess.run([python, "-c", "\n".join(COVER_CODE)],
                         capture_output=True, text=True).stdout.splitlines()
    same = out == COVER_OUTPUT
    ok &= same
    print(f"Python {version}: {'cover output matches' if same else f'DIFFERENT: {out}'}")
sys.exit(0 if ok else 1)
