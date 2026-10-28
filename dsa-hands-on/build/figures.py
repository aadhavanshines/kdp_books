"""Make the book's chart figures by running the tested chart listings.

Every listing in code/ that calls savefig() is run with the main Python in
a temporary copy of its chapter folder (as tests/run_listings.py does), using
the print-friendly style in build/book.mplstyle, and the PNG files it saves
are copied to manuscript/images/. So every chart in the book is drawn by the
code printed next to it.
"""
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CODE = ROOT / "code"
PYTHON = ROOT / ".venvs" / "py3.15" / "bin" / "python"
STYLE = Path(__file__).resolve().parent / "book.mplstyle"


def build_figures(out_dir):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    made = []
    for listing in sorted(CODE.glob("ch*/*.py")):
        if ("savefig(" not in listing.read_text()
                or listing.name.startswith("solution")
                or listing.with_suffix(".runonly").exists()):
            continue  # benchmark charts: tests/record_benchmarks.py
        with tempfile.TemporaryDirectory() as tmp:
            work = Path(tmp) / listing.parent.name
            shutil.copytree(listing.parent, work)
            before = set(work.glob("*.png"))
            env = {**os.environ, "MPLBACKEND": "Agg",
                   "BOOK_MPLSTYLE": str(STYLE), "PYTHONHASHSEED": "0"}
            subprocess.run([PYTHON, "-c",
                            "import matplotlib.pyplot as p, os, runpy, sys;"
                            "p.style.use(os.environ['BOOK_MPLSTYLE']);"
                            f"sys.argv=['{listing.name}'];"
                            f"runpy.run_path('{listing.name}', run_name='__main__')"],
                           cwd=work, env=env, check=True, capture_output=True)
            for png in sorted(set(work.glob("*.png")) - before):
                shutil.copy(png, out_dir / png.name)
                made.append(png.name)
    return made


if __name__ == "__main__":
    print(build_figures(ROOT / "manuscript" / "images"))
