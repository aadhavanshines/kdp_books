"""Check that the code printed in the manuscript is the tested code.

1. Every @include points to a file (and lines or definitions) that exists.
2. Every listing in code/ (.py, .out and session .txt) is printed somewhere,
   so nothing tested is left out and nothing printed is untested.
3. Code typed directly in the manuscript (not @include) must be one of:
   - a ">>>" session, which is run with doctest on every Python version;
   - terminal commands, every line starting with "$ ";
   - lines that appear word for word in a tested file in code/;
   - a folder tree, whose entries must all exist in code/.
4. Tables with "Example" and "Result" columns: each example is evaluated
   and compared with its result.

Usage: python tests/check_manuscript.py
"""

import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "build"))
from mdparse import INCLUDE_RE, expand_include  # noqa: E402

MANUSCRIPT = ROOT / "manuscript"
CODE = ROOT / "code"
PYTHONS = [
    ROOT / ".venvs" / f"py{v}" / "bin" / "python"
    for v in ("3.15", "3.14", "3.13", "3.12")
]
# Files that are run or used by other listings but not printed themselves
NOT_PRINTED_OK = {
    "code/ch17/bst.py",  # a copy of ch16/bst.py (tests/sync_common.py)
    "code/ch23/union_find.py",  # a copy of ch19/union_find.py
}
# Every chapter's bench.py is a copy of code/common/bench.py, which
# Chapter 3 prints (from code/ch03/bench.py)
NOT_PRINTED_OK |= {
    str(p.relative_to(ROOT))
    for p in CODE.glob("ch*/bench.py")
    if p.parent.name != "ch03"
}


def code_blocks(text):
    """Yield (line number, code) for each fenced block."""
    lines = text.split("\n")
    i = 0
    while i < len(lines):
        if lines[i].strip().startswith("```"):
            start = i + 1
            i += 1
            while not lines[i].strip().startswith("```"):
                i += 1
            yield start, "\n".join(lines[start:i])
        i += 1


def check_tree(block, where):
    """A folder tree drawn with 4-space indents must match a folder in code/."""
    lines = [ln for ln in block.split("\n") if ln.strip()]
    root = lines[0].strip().rstrip("/")
    # The reader's book folder, data-analysis/, is this repository's code/
    matches = (
        [CODE]
        if root == "data-analysis"
        else [p for p in CODE.glob(f"*/{root}") if p.is_dir()]
    )
    if not matches:
        return [f"{where}: no folder {root} in code/"]
    stack, problems = [matches[0]], []
    for ln in lines[1:]:
        if ln.strip() == "...":
            continue
        depth = (len(ln) - len(ln.lstrip())) // 4
        del stack[depth:]
        path = stack[-1] / ln.strip().rstrip("/")
        if not path.exists():
            problems.append(f"{where}: tree entry missing: {path}")
        stack.append(path)
    return problems


def main():
    problems = []
    included = set()
    tested_lines = set()
    for f in CODE.rglob("*"):
        if f.is_file() and f.suffix in {
            ".py",
            ".out",
            ".txt",
            ".toml",
            ".md",
            ".csv",
            ".json",
            ".ini",
            ".cmd",
        }:
            for line in f.read_text(encoding="utf-8").split("\n"):
                if line.strip():
                    tested_lines.add(line.strip())

    sessions, tables = 0, 0
    for md in sorted(MANUSCRIPT.glob("*.md")):
        text = md.read_text(encoding="utf-8")
        for lineno, code in code_blocks(text):
            where = f"{md.name}:{lineno}"
            parts = [p.strip() for p in code.strip().split("\n")]
            if all(INCLUDE_RE.match(p) for p in parts):
                for p in parts:
                    included.add(INCLUDE_RE.match(p).group(1))
                    try:
                        expand_include(p, ROOT)
                    except (
                        Exception
                    ) as error:  # missing file, range or name
                        problems.append(f"{where}: {p}: {error}")
                continue
            if parts[0].startswith(">>>"):
                sessions += 1
                with tempfile.NamedTemporaryFile(
                    "w", suffix=".txt", delete=False
                ) as tmp:
                    tmp.write(code + "\n")
                for python in PYTHONS:
                    r = subprocess.run(
                        [
                            python,
                            "-m",
                            "doctest",
                            "-o",
                            "ELLIPSIS",
                            "-o",
                            "NORMALIZE_WHITESPACE",
                            tmp.name,
                        ],
                        capture_output=True,
                        text=True,
                    )
                    if r.returncode:
                        problems.append(
                            f"{where}: session fails on "
                            f"{python.parent.parent.name}:\n"
                            f"{r.stdout}{r.stderr}"
                        )
                continue
            if parts[0].endswith("/") and " " not in parts[0]:
                # A folder tree: every entry must exist in code/
                problems += check_tree(code, where)
                continue
            for p in parts:
                if p and not p.startswith("$ ") and p not in tested_lines:
                    problems.append(f"{where}: not from a tested file: {p}")

        # Tables with Example and Result columns
        for table in re.findall(r"((?:^\|.*\|\n)+)", text, re.M):
            rows = [
                [c.strip() for c in r.strip().strip("|").split("|")]
                for r in table.strip().split("\n")
            ]
            head = rows[0]
            if "Example" in head and "Result" in head:
                tables += 1
                e, r = head.index("Example"), head.index("Result")
                for row in rows[2:]:
                    example, result = row[e].strip("`"), row[r].strip("`")
                    if eval(example) != eval(result):
                        problems.append(
                            f"{md.name}: {example} is not {result}"
                        )

    listings = {
        str(p.relative_to(ROOT))
        for p in CODE.rglob("*")
        if p.suffix in {".py", ".out"}
        and p.parent.name.startswith("ch")
        or p.suffix == ".txt"
        and p.parent.parent == CODE
    }
    # Modules that print nothing when run have empty .out files
    empty = {
        f
        for f in listings
        if f.endswith(".out")
        and not (ROOT / f).read_text(encoding="utf-8").strip()
    }
    for missing in sorted(listings - included - NOT_PRINTED_OK - empty):
        problems.append(f"not printed in the book: {missing}")

    for p in problems:
        print("PROBLEM", p)
    print(
        f"{len(included)} files included, {sessions} typed sessions run on "
        f"{len(PYTHONS)} versions, {tables} example tables checked; "
        f"{len(problems)} problems"
    )
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
