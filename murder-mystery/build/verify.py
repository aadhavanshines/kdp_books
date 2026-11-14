"""Independent check of cases.json: every case must have exactly one answer, and it must
be the printed one. Uses plain brute force over every possible answer (no bitmasks)."""
import itertools
import json
import sys
from pathlib import Path

from logic import a_holds, holds

cases = json.loads((Path(__file__).resolve().parent / "cases.json").read_text())
bad = 0
for c in cases:
    if c["level"] == "A":
        fits = [i for i, s in enumerate(c["suspects"]) if all(a_holds(cl, s, c["suspects"]) for cl in c["clues"])]
        ok = fits == [c["killer"]]
        # no clue may be useless: each must clear someone the others leave in
        for skip in range(len(c["clues"])):
            rest = [cl for j, cl in enumerate(c["clues"]) if j != skip]
            if len([s for s in c["suspects"] if all(a_holds(cl, s, c["suspects"]) for cl in rest)]) == 1:
                ok = False
    else:
        n = len(c["suspects"])
        answers = []
        for lp in itertools.permutations(range(n)):
            for wp in itertools.permutations(range(n)):
                if not all(holds(cl, lp, wp) for cl in c["clues"]):
                    continue
                if c["statements"]:
                    false = [i for i, st in enumerate(c["statements"]) if not holds(st, lp, wp)]
                    if len(false) != 1:
                        continue
                    killer = false[0]
                elif c["fact"]["kind"] == "room":
                    killer = lp.index(c["lp"][c["killer"]])
                else:
                    killer = wp.index(c["wp"][c["killer"]])
                answers.append((list(lp), list(wp), killer))
        ok = answers == [(c["lp"], c["wp"], c["killer"])]
    if not ok:
        bad += 1
        print("FAIL case", c["num"], c["title"])
names = [s["name"] for c in cases for s in c["suspects"]]
print(f"{len(cases)} cases checked, {bad} failed; levels:",
      {l: sum(1 for c in cases if c["level"] == l) for l in "ABCD"})
sys.exit(1 if bad else 0)
