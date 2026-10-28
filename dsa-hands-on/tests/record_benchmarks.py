"""Record the book's benchmarks: run each benchmark listing (one with a
.runonly file) once with the main Python, saving its output as the .out file
the book prints and its chart in manuscript/images/, so the printed table
and the chart come from the same run.

Usage:
  python tests/record_benchmarks.py              every benchmark
  python tests/record_benchmarks.py --only ch06  one chapter
"""

import argparse
import shutil
import subprocess
import tempfile
from pathlib import Path

from run_listings import CODE, MAIN, PYTHONS, ROOT, env_for

IMAGES = ROOT / "manuscript" / "images"
STYLE = ROOT / "build" / "book.mplstyle"


def record(listing):
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp) / listing.parent.name
        shutil.copytree(
            listing.parent,
            work,
            ignore=shutil.ignore_patterns("__pycache__", "*.pyc", "*.png"),
        )
        env = {
            **env_for(),
            "MPLBACKEND": "Agg",
            "BOOK_MPLSTYLE": str(STYLE),
        }
        # The book's print-friendly chart style; readers' charts use
        # matplotlib's defaults and show the same data
        code = (
            "import matplotlib.pyplot as p, os, runpy, sys;"
            "p.style.use(os.environ['BOOK_MPLSTYLE']);"
            f"sys.argv=['{listing.name}'];"
            f"runpy.run_path('{listing.name}', run_name='__main__')"
        )
        p = subprocess.run(
            [PYTHONS[MAIN], "-c", code],
            cwd=work,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=1800,
        )
        if p.returncode:
            raise SystemExit(f"{listing}: failed\n{p.stdout}")
        listing.with_suffix(".out").write_text(p.stdout)
        IMAGES.mkdir(parents=True, exist_ok=True)
        charts = sorted(work.glob("*.png"))
        for png in charts:
            shutil.copy(png, IMAGES / png.name)
        return charts


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only")
    a = ap.parse_args()
    for runonly in sorted(CODE.glob("ch*/*.runonly")):
        listing = runonly.with_suffix(".py")
        if a.only and a.only not in str(listing):
            continue
        charts = record(listing)
        names = ", ".join(c.name for c in charts) or "no chart"
        print(f"recorded {listing.relative_to(ROOT)} ({names})", flush=True)
    version = subprocess.run(
        [
            PYTHONS[MAIN],
            "-c",
            "import platform; print(platform.python_version())",
        ],
        capture_output=True,
        text=True,
    ).stdout.strip()
    print(f"Recorded with Python {version}", flush=True)


if __name__ == "__main__":
    main()
