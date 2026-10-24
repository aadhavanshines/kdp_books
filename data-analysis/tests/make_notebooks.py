"""Build one Jupyter notebook per chapter, code/chNN/chNN.ipynb, from the
tested listings, in the order the book prints them, and run it so the saved
notebook shows every output and chart.

Each code cell is exactly one listing file (the cell's metadata names it),
so tests/check_notebooks.py can confirm the notebooks match the .py files.
Exercise solutions, modules that are not run by themselves (.skip) and
listings run another way (.cmd, such as pytest) are left out.

A .py file that starts with "# %%" is notebook cells written as a plain
file (VS Code and Jupytext read this format too); it becomes a notebook of
its own with the same name, such as code/ch02/first_notebook.ipynb.

Usage: .venvs/py3.15/bin/python tests/make_notebooks.py
"""
import os
import re
import shutil
import tempfile
from pathlib import Path

import nbformat
from nbclient import NotebookClient

from check_notebooks import from_cells

ROOT = Path(__file__).resolve().parent.parent
CODE = ROOT / "code"
BOOK = "*Data Analysis with Python, Hands-On* by Aadhavan Muthurengan"
INCLUDE = re.compile(r"@include code/(ch\d\d)/(\w+\.py)$")


def chapters():
    """{chNN: (title, [(listing, section heading), ...])} in book order."""
    found = {}
    for md in sorted((ROOT / "manuscript").glob("[0-2][0-9]-*.md")):
        title = heading = None
        for line in md.read_text().splitlines():
            if m := re.match(r"# Chapter \d+: (.+)", line):
                title = m.group(1)
            elif line.startswith("## "):
                heading = line[3:].strip()
            elif m := INCLUDE.match(line.strip()):
                ch, name = m.groups()
                stem = (CODE / ch / name).with_suffix("")
                if (name.startswith("solution")
                        or stem.with_suffix(".skip").exists()
                        or stem.with_suffix(".cmd").exists()):
                    continue
                entry = found.setdefault(ch, (title, []))
                if name not in [n for n, _ in entry[1]]:
                    entry[1].append((name, heading))
    return found


def build(ch, title, listings):
    number = int(ch[2:])
    cells = [nbformat.v4.new_markdown_cell(
        f"# Chapter {number}: {title}\n\n"
        f"The programs from Chapter {number} of {BOOK}, in the book's "
        "order. Each code cell is one program; the same program is in this "
        "folder as a `.py` file, and its expected output is in the `.out` "
        "file with the same name.\n\n"
        "Run the cells from top to bottom (**Run > Run All Cells**). The "
        "programs read the datasets from `../data/`, so keep this notebook "
        "in its chapter folder.")]
    last = None
    for name, heading in listings:
        if heading and heading != last:
            cells.append(nbformat.v4.new_markdown_cell(f"## {heading}"))
            last = heading
        cells.append(nbformat.v4.new_markdown_cell(f"`{name}`"))
        cell = nbformat.v4.new_code_cell(
            (CODE / ch / name).read_text().rstrip("\n"))
        cell.metadata["listing"] = name
        cells.append(cell)
    nb = nbformat.v4.new_notebook(cells=cells)
    nb.metadata = {
        "kernelspec": {"name": "python3", "display_name": "Python 3",
                       "language": "python"},
        "language_info": {"name": "python"},
    }
    return nb


def run(nb, ch):
    """Execute in a temporary copy of the chapter folder, as the checks do,
    so files the programs write never land in the repository."""
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp) / ch
        shutil.copytree(CODE / ch, work,
                        ignore=shutil.ignore_patterns("__pycache__"))
        shutil.copytree(CODE / "data", Path(tmp) / "data")
        NotebookClient(nb, timeout=300, kernel_name="python3",
                       resources={"metadata": {"path": str(work)}}).execute()
    for cell in nb.cells:
        cell.pop("id", None)
        cell.metadata.pop("execution", None)  # run times change every build
    nb.metadata["language_info"] = {"name": "python"}
    return nb


def main():
    os.environ.pop("MPLBACKEND", None)  # charts appear inline
    os.environ.update(PYTHONHASHSEED="0", LANG="C.UTF-8")
    for ch, (title, listings) in chapters().items():
        nb = run(build(ch, title, listings), ch)
        nb.nbformat_minor = 4  # no cell ids: stable files, clean diffs
        nbformat.write(nb, CODE / ch / f"{ch}.ipynb")
        print(f"{ch}/{ch}.ipynb: {len(listings)} programs")
    for path in sorted(CODE.glob("ch[0-9][0-9]/*.py")):
        if path.read_text().startswith("# %%"):
            nb = run(from_cells(path), path.parent.name)
            nb.nbformat_minor = 4
            nbformat.write(nb, path.with_suffix(".ipynb"))
            print(f"{path.parent.name}/{path.stem}.ipynb: from # %% cells")


if __name__ == "__main__":
    main()
