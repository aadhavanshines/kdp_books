"""Check the chapter notebooks, code/chNN/chNN.ipynb.

1. Each notebook matches the listings: every code cell is exactly the .py
   file its metadata names, and every listing that belongs in a notebook
   appears once (see included() for what is left out).
2. Each notebook runs from top to bottom without an error, and every cell
   prints exactly the listing's .out file. Benchmarks (.runonly) run in
   quick mode, BENCH_QUICK=1, and only have to run without an error,
   because their times differ on every run. A cell may also show the value
   of its last line, as notebooks do, and a chart if its program saves one.

Runs with the Python running this script, or, if you made one virtual
environment per version in .venvs/py3.12 ... .venvs/py3.15, with each.

Usage: python tests/check_notebooks.py
"""

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CODE = ROOT / "code"

# Copies of another chapter's module, so each folder runs on its own;
# they are printed (and in the notebook) in their own chapter
COPIES = {"ch17/bst.py", "ch23/union_find.py"}


def included(folder):
    """The listings in a chapter folder that belong in its notebook: all
    except exercise solutions, pytest runs (.cmd), the copies of bench.py
    and the shared modules."""
    return sorted(
        p.name
        for p in folder.glob("*.py")
        if not p.name.startswith("solution")
        and p.name != "bench.py"
        and f"{folder.name}/{p.name}" not in COPIES
        and not p.with_suffix(".skip").exists()
        and not p.with_suffix(".cmd").exists()
    )


def check_sync():
    import nbformat

    problems = []
    for folder in sorted(CODE.glob("ch[0-9][0-9]")):
        path = folder / f"{folder.name}.ipynb"
        wanted = included(folder)
        if not path.exists():
            if wanted:
                problems.append(f"{folder.name}: no notebook")
            continue
        nb = nbformat.read(path, as_version=4)
        names = []
        for cell in nb.cells:
            if cell.cell_type != "code":
                continue
            name = cell.metadata.get("listing")
            names.append(name)
            source = (folder / name).read_text(encoding="utf-8")
            if name is None or cell.source != source.rstrip("\n"):
                problems.append(
                    f"{folder.name}: cell for {name} differs from the .py file"
                )
        if sorted(names) != wanted:
            problems.append(
                f"{folder.name}: notebook has {sorted(names)}, "
                f"folder has {wanted}"
            )
    return problems


def run_notebook(nb, folder):
    """Execute in a temporary copy of the chapter folder, so files the
    programs write never land in the repository."""
    from nbclient import NotebookClient

    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp) / folder.name
        shutil.copytree(
            folder, work, ignore=shutil.ignore_patterns("__pycache__")
        )
        NotebookClient(
            nb,
            timeout=1800,
            kernel_name="python3",
            resources={"metadata": {"path": str(work)}},
        ).execute()
    return nb


def check_runs():
    import nbformat

    os.environ.pop("MPLBACKEND", None)  # charts appear inline
    os.environ.update(PYTHONHASHSEED="0", LANG="C.UTF-8", BENCH_QUICK="1")
    problems = []
    for path in sorted(CODE.glob("ch[0-9][0-9]/ch[0-9][0-9].ipynb")):
        folder = path.parent
        nb = nbformat.read(path, as_version=4)
        for cell in nb.cells:
            if cell.cell_type == "code":
                cell.outputs = []
        try:
            run_notebook(nb, folder)
        except Exception as error:  # a cell raised an error
            problems.append(f"{folder.name}: {str(error).strip()[-300:]}")
            continue
        for cell in nb.cells:
            if cell.cell_type != "code":
                continue
            name = cell.metadata["listing"]
            listing = folder / name
            if listing.with_suffix(".runonly").exists():
                continue  # a benchmark: it ran, and that is all we check
            text = "".join(
                o.get("text", "")
                for o in cell.outputs
                if o.output_type == "stream"
            )
            expected = listing.with_suffix(".out").read_text(encoding="utf-8")
            if text != expected:
                problems.append(f"{folder.name}/{name}: output differs")
            # A bare expression on the last line shows its value too
            kinds = {o.output_type for o in cell.outputs}
            kinds -= {"stream", "execute_result"}
            shows_chart = "savefig(" in listing.read_text(encoding="utf-8")
            if kinds - ({"display_data"} if shows_chart else set()):
                problems.append(f"{folder.name}/{name}: unexpected {kinds}")
    return problems


def main():
    venvs = {
        v: ROOT / ".venvs" / f"py{v}" / "bin" / "python"
        for v in ("3.15", "3.14", "3.13", "3.12")
    }
    venvs = {v: p for v, p in venvs.items() if p.exists()}
    if "--here" not in sys.argv and venvs:
        ok = True
        for python in venvs.values():
            ok &= subprocess.run([python, __file__, "--here"]).returncode == 0
        sys.exit(0 if ok else 1)
    version = f"{sys.version_info[0]}.{sys.version_info[1]}"
    problems = check_sync() + check_runs()
    count = len(list(CODE.glob("ch[0-9][0-9]/*.ipynb")))
    for p in problems:
        print("FAIL", p)
    print(f"Python {version}: {count} notebooks, {len(problems)} problems")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
