"""Write each problem's examples as an interactive session the book prints.

For every code/chNN/<name>.py with EXAMPLES, write code/chNN/<name>.examples.txt:

    >>> budget_pair([12, 7, 30, 18], 25)
    [1, 3]

The results are computed by running the main solution (SOLUTIONS[0]), and
must equal the expected values in EXAMPLES (or satisfy CHECK), so the
printed examples always match the tested code. Modules with a demo()
function also get <name>.demo.txt holding what demo() prints.

Usage: python tests/make_examples.py [--check]   (--check: fail if stale)
"""

import contextlib
import copy
import io
import pprint
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from run_problems import CODE, load  # noqa: E402

WIDTH = 76


class _SortedSet(set):
    """A set that prints its items in sorted order, so printed examples
    don't depend on string hashing, which changes from run to run."""

    def __repr__(self):
        items = sorted(self, key=repr)
        return (
            "{" + ", ".join(repr(x) for x in items) + "}"
            if items
            else "set()"
        )


def stable(x):
    if isinstance(x, (set, frozenset)):
        return _SortedSet(stable(i) for i in x)
    if isinstance(x, dict):
        return {k: stable(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return type(x)(stable(i) for i in x)
    return x


def show_call(name, args):
    args = [stable(a) for a in args]
    one = f">>> {name}({', '.join(repr(a) for a in args)})"
    if len(one) <= WIDTH:
        return one
    lines = [f">>> {name}("]
    for a in args:
        text = pprint.pformat(a, width=WIDTH - 8, sort_dicts=False)
        parts = text.split("\n")
        parts[-1] += ","
        lines += ["...     " + p for p in parts]
    lines.append("... )")
    return "\n".join(lines)


def session(mod):
    fn = mod.SOLUTIONS[0]
    check = getattr(mod, "CHECK", None)
    out = []
    for args, expected in mod.EXAMPLES:
        got = fn(*copy.deepcopy(args))
        ok = check(args, got) if check else got == expected
        if not ok:
            raise SystemExit(f"{mod.__name__}: {args!r} gave {got!r}")
        out.append(show_call(fn.__name__, args))
        out.append(
            pprint.pformat(stable(got), width=WIDTH, sort_dicts=False)
        )
    return "\n".join(out) + "\n"


def main():
    check_only = "--check" in sys.argv
    stale = 0
    for path in sorted(CODE.glob("ch*/*.py")):
        mod = load(path)
        targets = []
        if getattr(mod, "EXAMPLES", None) and mod.SOLUTIONS:
            targets.append(
                (path.with_suffix(".examples.txt"), session(mod))
            )
        if hasattr(mod, "demo"):
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                mod.demo()
            targets.append((path.with_suffix(".demo.txt"), buf.getvalue()))
        for target, text in targets:
            if not target.exists() or target.read_text() != text:
                stale += 1
                if not check_only:
                    target.write_text(text)
    print(f"{'stale' if check_only else 'updated'}: {stale} file(s)")
    sys.exit(1 if check_only and stale else 0)


if __name__ == "__main__":
    main()
