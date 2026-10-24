"""Check the chapter notebooks, code/chNN/chNN.ipynb.

1. Each notebook matches the listings: every code cell is exactly the .py
   file its metadata names, and every listing that the notebooks include
   (all except solutions, .skip and .cmd files) appears once.
2. Each notebook runs from top to bottom without an error, and every
   cell prints exactly the listing's .out file. A cell may also show a
   chart, but only if its program saves one.
3. A notebook made from a "# %%" file (such as ch02/first_notebook)
   matches its cells, runs without an error, and shows the same text
   results as the saved notebook.

Runs with the Python running this script, or, if you made one virtual
environment per version in .venvs/py3.12 ... .venvs/py3.15, with each.

Usage: python tests/check_notebooks.py
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CODE = ROOT / "code"


def from_cells(path):
    """A notebook from a .py file split into cells by "# %%" lines; a
    "# %% [markdown]" cell's lines are text with the leading "# " removed."""
    import nbformat
    cells = []
    for chunk in re.split(r"^# %%", path.read_text(), flags=re.M)[1:]:
        kind, _, body = chunk.partition("\n")
        body = body.strip("\n")
        if kind.strip() == "[markdown]":
            text = "\n".join(line[2:] for line in body.split("\n"))
            cells.append(nbformat.v4.new_markdown_cell(text))
        else:
            cells.append(nbformat.v4.new_code_cell(body))
    nb = nbformat.v4.new_notebook(cells=cells)
    nb.metadata = {
        "kernelspec": {"name": "python3", "display_name": "Python 3",
                       "language": "python"},
        "language_info": {"name": "python"},
    }
    return nb


def included(folder):
    """The listings in a chapter folder that belong in its notebook."""
    return sorted(
        p.name for p in folder.glob("*.py")
        if not p.name.startswith("solution")
        and not p.with_suffix(".skip").exists()
        and not p.with_suffix(".cmd").exists())


def check_sync():
    problems = []
    for folder in sorted(CODE.glob("ch[0-9][0-9]")):
        import nbformat
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
            source = (folder / name).read_text().rstrip("\n")
            if name is None or cell.source != source:
                problems.append(f"{folder.name}: cell for {name} differs "
                                "from the .py file")
        if sorted(names) != wanted:
            problems.append(f"{folder.name}: notebook has {sorted(names)}, "
                            f"folder has {wanted}")
    return problems


def check_runs():
    import nbformat
    from nbclient import NotebookClient
    os.environ.pop("MPLBACKEND", None)  # charts appear inline
    os.environ.update(PYTHONHASHSEED="0", LANG="C.UTF-8")
    problems = []
    for path in sorted(CODE.glob("ch[0-9][0-9]/ch[0-9][0-9].ipynb")):
        ch = path.parent.name
        nb = nbformat.read(path, as_version=4)
        for cell in nb.cells:
            cell.outputs = [] if cell.cell_type == "code" else None
            if cell.outputs is None:
                del cell["outputs"]
        with tempfile.TemporaryDirectory() as tmp:
            work = Path(tmp) / ch
            shutil.copytree(path.parent, work,
                            ignore=shutil.ignore_patterns("__pycache__"))
            shutil.copytree(CODE / "data", Path(tmp) / "data")
            try:
                NotebookClient(nb, timeout=300, kernel_name="python3",
                               resources={"metadata": {"path": str(work)}}
                               ).execute()
            except Exception as error:  # a cell raised an error
                problems.append(f"{ch}: {str(error).strip()[-300:]}")
                continue
        for cell in nb.cells:
            if cell.cell_type != "code":
                continue
            name = cell.metadata["listing"]
            text = "".join(o.get("text", "") for o in cell.outputs
                           if o.output_type == "stream")
            expected = (path.parent / name).with_suffix(".out").read_text()
            if text != expected:
                problems.append(f"{ch}/{name}: output differs from .out")
            kinds = {o.output_type for o in cell.outputs} - {"stream"}
            saves = "savefig(" in (path.parent / name).read_text()
            if kinds - ({"display_data"} if saves else set()):
                problems.append(f"{ch}/{name}: unexpected {sorted(kinds)}")
            if saves and "display_data" not in kinds:
                problems.append(f"{ch}/{name}: chart not shown")
    return problems


def text_outputs(cell):
    """What a cell shows as text: printed output and the value of its last
    line (a table's plain-text form, a number, a list)."""
    parts = []
    for out in cell.get("outputs", []):
        if out.output_type == "stream":
            parts.append(out.text)
        elif "data" in out and "text/plain" in out.data:
            if out.output_type == "execute_result":
                parts.append(out.data["text/plain"])
    return parts


def check_cell_files():
    import nbformat
    from nbclient import NotebookClient
    problems = []
    for path in sorted(CODE.glob("ch[0-9][0-9]/*.py")):
        if not path.read_text().startswith("# %%"):
            continue
        name = f"{path.parent.name}/{path.stem}.ipynb"
        saved_path = path.with_suffix(".ipynb")
        if not saved_path.exists():
            problems.append(f"{name}: missing")
            continue
        saved = nbformat.read(saved_path, as_version=4)
        fresh = from_cells(path)
        if [(c.cell_type, c.source) for c in saved.cells] != [
                (c.cell_type, c.source) for c in fresh.cells]:
            problems.append(f"{name}: cells differ from {path.name}")
            continue
        with tempfile.TemporaryDirectory() as tmp:
            work = Path(tmp) / path.parent.name
            shutil.copytree(path.parent, work,
                            ignore=shutil.ignore_patterns("__pycache__"))
            shutil.copytree(CODE / "data", Path(tmp) / "data")
            try:
                NotebookClient(fresh, timeout=300, kernel_name="python3",
                               resources={"metadata": {"path": str(work)}}
                               ).execute()
            except Exception as error:
                problems.append(f"{name}: {str(error).strip()[-300:]}")
                continue
        for old, new in zip(saved.cells, fresh.cells):
            if text_outputs(old) != text_outputs(new):
                problems.append(f"{name}: results differ from the saved "
                                "notebook")
    return problems


def main():
    venvs = {v: ROOT / ".venvs" / f"py{v}" / "bin" / "python"
             for v in ("3.15", "3.14", "3.13", "3.12")}
    venvs = {v: p for v, p in venvs.items() if p.exists()}
    if "--here" not in sys.argv and venvs:
        ok = True
        for version, python in venvs.items():
            result = subprocess.run([python, __file__, "--here"])
            ok &= result.returncode == 0
        sys.exit(0 if ok else 1)
    version = f"{sys.version_info[0]}.{sys.version_info[1]}"
    problems = check_sync() + check_runs() + check_cell_files()
    count = len(list(CODE.glob("ch[0-9][0-9]/*.ipynb")))
    for p in problems:
        print("FAIL", p)
    print(f"Python {version}: {count} notebooks, "
          f"{len(problems)} problems")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
