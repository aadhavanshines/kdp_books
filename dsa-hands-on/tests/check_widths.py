"""Every printed listing and output must fit the page: at most 76 characters
per line (ruff enforces this for .py files; this checks the rest).

Usage: python tests/check_widths.py
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WIDTH = 76
bad = []
for path in sorted((ROOT / "code").rglob("*")):
    if path.suffix in (".out", ".txt", ".sql") or path.name.endswith(".py"):
        for n, line in enumerate(
            path.read_text(encoding="utf-8").splitlines(), 1
        ):
            if len(line.rstrip()) > WIDTH:
                bad.append(
                    f"{path.relative_to(ROOT)}:{n}: {len(line.rstrip())} characters"
                )
print("\n".join(bad) or f"all lines fit in {WIDTH} characters")
sys.exit(1 if bad else 0)
