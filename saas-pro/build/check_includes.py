"""Stop the build if code moved under a printed excerpt.

Every `@include path#La-Lb` prints lines a to b of a file. When the file
changes, the same numbers can silently print the wrong code. This script
records the first and last line of every excerpt in tests/includes.lock and
fails if either has changed. After checking each reported excerpt (and fixing
its line numbers), refresh the lock with:  python3 build/check_includes.py --update
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCK = ROOT / "tests" / "includes.lock"
INCLUDE = re.compile(r"^@include (\S+?)#L(\d+)-L?(\d+)$", re.M)


def current():
    found = {}
    for md in sorted((ROOT / "manuscript").glob("*.md")):
        for m in INCLUDE.finditer(md.read_text(encoding="utf-8")):
            path, a, b = m.group(1), int(m.group(2)), int(m.group(3))
            lines = (ROOT / path).read_text(encoding="utf-8").split("\n")
            key = f"{md.name}: {path}#L{a}-L{b}"
            found[key] = {"first": lines[a - 1].strip(), "last": lines[b - 1].strip()}
    return found


def main():
    now = current()
    if "--update" in sys.argv:
        LOCK.write_text(json.dumps(now, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"recorded {len(now)} excerpts in {LOCK.relative_to(ROOT)}")
        return 0
    locked = json.loads(LOCK.read_text(encoding="utf-8")) if LOCK.exists() else {}
    problems = [k for k in now if k in locked and now[k] != locked[k]]
    problems += [f"{k} (new, not checked yet)" for k in now if k not in locked]
    for p in problems:
        print("excerpt changed:", p)
    if problems:
        print("Check each excerpt above, fix its line numbers, then run: python3 build/check_includes.py --update")
        return 1
    print(f"{len(now)} excerpts unchanged")
    return 0


if __name__ == "__main__":
    sys.exit(main())
