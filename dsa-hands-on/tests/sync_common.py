"""Every chapter folder that has benchmarks gets its own copy of
code/common/bench.py, and a chapter that reuses an earlier chapter's
module gets a copy of it (SHARED), so readers can run any chapter's files
on their own.

Usage:
  python tests/sync_common.py          copy bench.py where it is imported
  python tests/sync_common.py --check  only report copies that differ
"""

import sys
from pathlib import Path

CODE = Path(__file__).resolve().parent.parent / "code"
source = (CODE / "common" / "bench.py").read_text()
check = "--check" in sys.argv
bad = []
for chapter in sorted(CODE.glob("ch*")):
    uses = any(
        "import bench" in p.read_text() or "from bench" in p.read_text()
        for p in chapter.glob("*.py")
        if p.name != "bench.py"
    )
    copy = chapter / "bench.py"
    if uses and (not copy.exists() or copy.read_text() != source):
        if check:
            bad.append(str(copy))
        else:
            copy.write_text(source)
    if not uses and copy.exists():
        bad.append(f"{copy} (not used)")
# Later chapters that reuse an earlier chapter's module: copy -> original
SHARED = {
    "ch17/bst.py": "ch16/bst.py",
    "ch23/union_find.py": "ch19/union_find.py",
}
for copy, original in SHARED.items():
    text = (CODE / original).read_text()
    if (CODE / copy).exists() and (CODE / copy).read_text() == text:
        continue
    if check:
        bad.append(f"code/{copy} differs from code/{original}")
    else:
        (CODE / copy).write_text(text)
print("\n".join(bad) or "shared copies are up to date")
sys.exit(1 if bad else 0)
