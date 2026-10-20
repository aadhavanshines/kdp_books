"""Check every problem solution in code/.

Each problem module may define:
  SOLUTIONS     functions that all solve the problem (the first is the main one)
  EXAMPLES      list of (args_tuple, expected) pairs
  CHECK         optional f(args, result) -> bool, for problems with several valid answers
  NORMALIZE     optional f(result) -> value compared between solutions in random tests
  random_case   optional f(rng) -> args_tuple; all SOLUTIONS must agree on it
  test()        optional extra checks (design problems, classes, streams)

Usage: python tests/run_problems.py [-k substring] [--cases N] [--seed S]
"""

import argparse
import copy
import importlib.util
import random
import sys
import traceback
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CODE = ROOT / "code"
sys.path.insert(0, str(CODE))


def load(path):
    name = "_".join(path.relative_to(CODE).with_suffix("").parts)
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def call(fn, args):
    return fn(*copy.deepcopy(args))


def check_module(mod, cases, seed=1234):
    problems = []
    sols = getattr(mod, "SOLUTIONS", [])
    check = getattr(mod, "CHECK", None)
    norm = getattr(mod, "NORMALIZE", lambda r: r)
    for fn in sols:
        for args, expected in getattr(mod, "EXAMPLES", []):
            got = call(fn, args)
            ok = check(args, got) if check else got == expected
            if not ok:
                problems.append(
                    f"{fn.__name__}{args!r}: expected {expected!r}, got {got!r}"
                )
    gen = getattr(mod, "random_case", None)
    if gen and sols:
        rng = random.Random(seed)
        for _ in range(cases):
            args = gen(rng)
            results = [call(fn, args) for fn in sols]
            if check:
                for fn, r in zip(sols, results):
                    if not check(args, r):
                        problems.append(
                            f"random {fn.__name__}{args!r}: invalid {r!r}"
                        )
                        break
            ref = norm(results[0])
            for fn, r in zip(sols[1:], results[1:]):
                if not check and norm(r) != ref:
                    problems.append(
                        f"random {fn.__name__}{args!r}: {r!r} != {results[0]!r}"
                    )
                    break
            if problems:
                break
    if hasattr(mod, "test"):
        mod.test()
    return problems


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("-k", default="")
    ap.add_argument("--cases", type=int, default=300)
    ap.add_argument("--seed", type=int, default=1234)
    a = ap.parse_args()
    files = sorted(p for p in CODE.glob("ch*/*.py") if a.k in str(p))
    failed = 0
    count = 0
    for path in files:
        count += 1
        try:
            problems = check_module(load(path), a.cases, a.seed)
        except Exception:
            problems = [traceback.format_exc()]
        if problems:
            failed += 1
            print(f"FAIL {path.relative_to(ROOT)}")
            for p in problems[:5]:
                print("   ", p)
    v = sys.version.split()[0]
    print(f"Python {v}: {count} problem files, {failed} failed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
