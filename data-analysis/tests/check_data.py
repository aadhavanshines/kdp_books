"""Regenerate every dataset with code/data/make_data.py on every Python
version, and check that the files are identical to the ones in code/data.

Usage: python tests/check_data.py
"""
import filecmp
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "code" / "data"
ok = True
for version in ("3.15", "3.14", "3.13", "3.12"):
    python = ROOT / ".venvs" / f"py{version}" / "bin" / "python"
    with tempfile.TemporaryDirectory() as tmp:
        out = subprocess.run([python, DATA / "make_data.py"], cwd=tmp,
                             capture_output=True, text=True)
        made = sorted(p.name for p in Path(tmp).glob("*.csv"))
        kept = sorted(p.name for p in DATA.glob("*.csv"))
        same = made == kept and all(
            filecmp.cmp(Path(tmp) / n, DATA / n, shallow=False) for n in kept)
        same &= out.stdout == (DATA / "make_data.out").read_text()
    ok &= same
    print(f"Python {version}: {'identical' if same else 'DIFFERENT'} ({len(made)} files)")
sys.exit(0 if ok else 1)
