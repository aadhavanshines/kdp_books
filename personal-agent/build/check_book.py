"""Check the manuscript against the code before building.

- Every @include resolves (file, line range or named definition).
- Every non-blank line of Sparrow's code (sparrow/, its templates and
  the web chat page) is printed somewhere in the book.
- No code line is too wide for the page: 76 characters for listings
  from files, 67 for blocks typed into the manuscript. Transcripts of
  real output may be wider; they are listed, not failed.
- Every image exists.

Usage: python3 build/check_book.py
"""

from __future__ import annotations

import ast
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "build"))

from mdparse import INCLUDE_RE  # noqa: E402

SOURCE_WIDTH, TYPED_WIDTH = 76, 67
problems: list[str] = []
wide_output: list[str] = []
printed: dict[Path, set[int]] = defaultdict(set)


def named_lines(path: Path, names: list[str]) -> set[int]:
    tree = ast.parse(path.read_text())

    def find(body, parts):
        for node in body:
            name = getattr(node, "name", None)
            if isinstance(node, (ast.Assign, ast.AnnAssign)):
                targets = (
                    node.targets
                    if isinstance(node, ast.Assign)
                    else [node.target]
                )
                name = next(
                    (t.id for t in targets if isinstance(t, ast.Name)),
                    None,
                )
            if name == parts[0]:
                if len(parts) == 1:
                    return node
                return find(getattr(node, "body", []), parts[1:])
        return None

    lines = set()
    for name in names:
        node = find(tree.body, name.split("."))
        if node is None:
            raise ValueError(f"{name} not found in {path}")
        decorators = getattr(node, "decorator_list", [])
        start = min([node.lineno] + [d.lineno for d in decorators])
        lines |= set(range(start, node.end_lineno + 1))
    return lines


def include(spec: str, where: str) -> list[str]:
    m = INCLUDE_RE.match(spec)
    path = ROOT / m.group(1)
    if not path.exists():
        problems.append(f"{where}: no such file {m.group(1)}")
        return []
    text = path.read_text().rstrip("\n").split("\n")
    if m.group(2):
        first, last = int(m.group(2)), int(m.group(3))
        if not 1 <= first <= last <= len(text):
            problems.append(f"{where}: bad range in {spec}")
            return []
        lines = set(range(first, last + 1))
    elif m.group(4):
        try:
            lines = named_lines(path, m.group(4).split(","))
        except ValueError as error:
            problems.append(f"{where}: {error}")
            return []
    else:
        lines = set(range(1, len(text) + 1))
    printed[path.resolve()] |= lines
    return [text[n - 1] for n in sorted(lines)]


def main() -> int:
    images = ROOT / "manuscript"
    for md in sorted((ROOT / "manuscript").glob("*.md")):
        text = md.read_text()
        for m in re.finditer(r"!\[[^\]]*\]\(([^)]+)\)", text):
            if not (images / m.group(1)).exists():
                problems.append(f"{md.name}: missing image {m.group(1)}")
        for m in re.finditer(r"^@book (\S+) \|", text, re.M):
            if not (images / m.group(1)).exists():
                problems.append(f"{md.name}: missing image {m.group(1)}")
        for block in re.findall(r"^```[^\n]*\n(.*?)^```", text, re.M | re.S):
            lines = block.rstrip("\n").split("\n")
            specs = [line.strip() for line in lines]
            if specs and all(INCLUDE_RE.match(s) for s in specs):
                for spec in specs:
                    shown = include(spec, md.name)
                    target = spec.split()[1].split("#")[0].split("::")[0]
                    output = target.startswith(("transcripts/", "evals/"))
                    output = output and not target.endswith(".py")
                    for line in shown:
                        if len(line) > SOURCE_WIDTH:
                            message = f"{md.name}: {target}: {len(line)}"
                            if output:
                                wide_output.append(message)
                            else:
                                problems.append(f"too wide: {message}")
                continue
            for line in lines:
                if line.startswith("@include"):
                    problems.append(f"{md.name}: mixed block: {line}")
                elif len(line) > TYPED_WIDTH:
                    problems.append(
                        f"{md.name}: typed line too wide "
                        f"({len(line)}): {line[:50]}"
                    )
    code = [
        p
        for p in sorted((ROOT / "sparrow").rglob("*"))
        if p.is_file()
        and "__pycache__" not in p.parts
        and p.suffix in (".py", ".md", ".html")
    ]
    missing_total = 0
    for path in code:
        text = path.read_text().split("\n")
        seen = printed.get(path.resolve(), set())
        missing = [
            n
            for n, line in enumerate(text, 1)
            if line.strip() and n not in seen
        ]
        if missing:
            missing_total += len(missing)
            ranges, start = [], missing[0]
            for a, b in zip(missing, missing[1:] + [None]):
                if b != a + 1:
                    ranges.append(f"{start}-{a}" if start != a else f"{a}")
                    start = b
            problems.append(
                f"not printed: {path.relative_to(ROOT)} lines "
                + ", ".join(ranges)
            )
    total = sum(
        sum(1 for line in p.read_text().split("\n") if line.strip())
        for p in code
    )
    print(f"Sparrow code files: {len(code)}, non-blank lines: {total}, "
          f"printed: {total - missing_total}")
    if wide_output:
        print(f"wide lines in recorded output (wrapped when printed): "
              f"{len(wide_output)}")
    for problem in problems:
        print("PROBLEM", problem)
    print("OK" if not problems else f"{len(problems)} problem(s)")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
