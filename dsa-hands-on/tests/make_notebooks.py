"""Build one Jupyter notebook per chapter, code/chNN/chNN.ipynb, from the
tested listings, in the order the book first prints them, and run it so the
saved notebook shows every output.

Each code cell is exactly one listing file (the cell's metadata names it),
so tests/check_notebooks.py can confirm the notebooks match the .py files.
A module the book prints in parts appears once, whole, where its first part
is printed. Benchmarks run at full length, so the saved notebook shows real
timings from the computer that built it.

Usage: .venvs/py3.15/bin/python tests/make_notebooks.py [--only ch05]
"""

import argparse
import os
import re
from pathlib import Path

import nbformat

from check_notebooks import included, run_notebook

ROOT = Path(__file__).resolve().parent.parent
CODE = ROOT / "code"
BOOK = (
    "*Data Structures and Algorithms in Python, Hands-On* "
    "by Aadhavan Muthurengan"
)
INCLUDE = re.compile(r"@include code/(ch\d\d)/(\w+\.py)(?:#L.*|::.*)?$")


def chapters():
    """{chNN: (title, [(listing, section heading), ...])} in book order."""
    found = {}
    for md in sorted((ROOT / "manuscript").glob("[0-3][0-9]-*.md")):
        title = heading = None
        for line in md.read_text(encoding="utf-8").splitlines():
            if m := re.match(r"# Chapter \d+: (.+)", line):
                title = m.group(1)
            elif line.startswith("## "):
                heading = line[3:].strip()
            elif m := INCLUDE.match(line.strip()):
                ch, name = m.groups()
                if name not in included(CODE / ch):
                    continue
                entry = found.setdefault(ch, (title, []))
                if name not in [n for n, _ in entry[1]]:
                    entry[1].append((name, heading))
    return found


def build(ch, title, listings):
    number = int(ch[2:])
    cells = [
        nbformat.v4.new_markdown_cell(
            f"# Chapter {number}: {title}\n\n"
            f"The programs from Chapter {number} of {BOOK}, in the book's "
            "order. Each code cell is one program; the same program is in "
            "this folder as a `.py` file, and its expected output is in the "
            "`.out` file with the same name. Benchmark timings differ on "
            "every computer and every run.\n\n"
            "Run the cells from top to bottom (**Run > Run All Cells**). "
            "The programs import each other's files, so keep this notebook "
            "in its chapter folder."
        )
    ]
    last = None
    for name, heading in listings:
        if heading and heading != last:
            cells.append(nbformat.v4.new_markdown_cell(f"## {heading}"))
            last = heading
        cells.append(nbformat.v4.new_markdown_cell(f"`{name}`"))
        source = (CODE / ch / name).read_text(encoding="utf-8")
        cell = nbformat.v4.new_code_cell(source.rstrip("\n"))
        cell.metadata["listing"] = name
        cells.append(cell)
    nb = nbformat.v4.new_notebook(cells=cells)
    nb.metadata = {
        "kernelspec": {
            "name": "python3",
            "display_name": "Python 3",
            "language": "python",
        },
        "language_info": {"name": "python"},
    }
    return nb


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--only")
    args = parser.parse_args()
    os.environ.pop("MPLBACKEND", None)  # charts appear inline
    os.environ.pop("BENCH_QUICK", None)  # real timings
    os.environ.update(PYTHONHASHSEED="0", LANG="C.UTF-8")
    for ch, (title, listings) in chapters().items():
        if args.only and ch != args.only:
            continue
        nb = run_notebook(build(ch, title, listings), CODE / ch)
        for cell in nb.cells:
            cell.pop("id", None)
            cell.metadata.pop("execution", None)  # times change every build
        nb.metadata["language_info"] = {"name": "python"}
        nb.nbformat_minor = 4  # no cell ids: stable files, clean diffs
        with open(CODE / ch / f"{ch}.ipynb", "w", encoding="utf-8") as f:
            nbformat.write(nb, f)
        print(f"{ch}/{ch}.ipynb: {len(listings)} programs", flush=True)


if __name__ == "__main__":
    main()
