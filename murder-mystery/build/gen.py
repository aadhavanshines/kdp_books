"""Generate the 60 cases and write cases.json.

Every grid case is built so that (1) it has exactly one answer, and (2) it can be solved
one clue at a time: at each step some single clue, together with what is already marked
on the grid, rules something out. The steps found are saved as the printed explanation.
"""
import itertools
import json
import random
from pathlib import Path

from logic import DIRECT, POSITIVE, a_holds, a_text, clue_text, feet, holds, statement_text
from settings import FIRST, LAST, MOTIVES, load

HERE = Path(__file__).resolve().parent
HAIR = ["black", "brown", "blond", "red", "gray"]


# ---------------------------------------------------------------- grid engine
class Grid:
    def __init__(self, n):
        self.n = n
        perms = list(itertools.permutations(range(n)))
        self.assign = [(lp, wp) for lp in perms for wp in perms]
        self.ALL = (1 << len(self.assign)) - 1
        # pair masks: ("SR", s, r), ("SW", s, w), ("WR", w, r)
        self.pm = {}
        for kind in ("SR", "SW", "WR"):
            for a in range(n):
                for b in range(n):
                    self.pm[(kind, a, b)] = 0
        for i, (lp, wp) in enumerate(self.assign):
            bit = 1 << i
            for s in range(n):
                self.pm[("SR", s, lp[s])] |= bit
                self.pm[("SW", s, wp[s])] |= bit
                self.pm[("WR", wp[s], lp[s])] |= bit

    def mask(self, c):
        m = 0
        for i, (lp, wp) in enumerate(self.assign):
            if holds(c, lp, wp):
                m |= 1 << i
        return m

    def one_liar(self, masks):
        """Answers in which exactly one of the statements is false."""
        out = 0
        for k in range(len(masks)):
            m = self.ALL & ~masks[k]
            for j, mj in enumerate(masks):
                if j != k:
                    m &= mj
            out |= m
        return out

    def propagate(self, constraints):
        """constraints: list of (label, mask, is_direct). Returns (solved, steps).
        A step is (label, [pairs ruled out], [pairs now certain])."""
        possible = set(self.pm)
        known = set()
        steps = []

        def cands():
            m = self.ALL
            for p in self.pm:
                if p not in possible:
                    m &= ~self.pm[p]
            return m

        def confirmed():
            new = []
            for kind in ("SR", "SW", "WR"):
                for a in range(self.n):
                    opts = [b for b in range(self.n) if (kind, a, b) in possible]
                    if len(opts) == 1 and (kind, a, opts[0]) not in known:
                        known.add((kind, a, opts[0]))
                        new.append((kind, a, opts[0]))
            return new

        def apply(label, sub):
            gone = sorted(p for p in possible if not (self.pm[p] & sub))
            if not gone:
                return False
            possible.difference_update(gone)
            steps.append((label, gone, confirmed()))
            return True

        cur = cands()
        direct = [c for c in constraints if c[2]]
        if direct:
            sub = cur
            for _, m, _ in direct:
                sub &= m
            if apply("direct", sub):
                cur = cands()
        while True:
            if apply("grid", cur):
                cur = cands()
                continue
            for label, m, _ in constraints:
                if apply(label, cur & m):
                    cur = cands()
                    break
            else:
                break
        return bin(cur).count("1") == 1, steps


GRIDS = {}


def grid(n):
    if n not in GRIDS:
        GRIDS[n] = Grid(n)
    return GRIDS[n]


def true_clues(rng, n, lp, wp):
    """A shuffled pool of clues that are true of the answer (lp, wp)."""
    pool = []
    S = range(n)
    for s in S:
        for r in S:
            pool.append({"t": "s_not_r", "s": s, "r": r} if lp[s] != r else {"t": "s_is_r", "s": s, "r": r})
        for w in S:
            pool.append({"t": "s_not_w", "s": s, "w": w} if wp[s] != w else {"t": "s_is_w", "s": s, "w": w})
    for w in S:
        for r in S:
            k = wp.index(w)
            pool.append({"t": "w_not_r", "w": w, "r": r} if lp[k] != r else {"t": "w_in_r", "w": w, "r": r})
    for s in S:
        for s2 in S:
            if s2 != s:
                pool.append({"t": "or_s_r", "s": min(s, s2), "s2": max(s, s2), "r": lp[s]})
                pool.append({"t": "or_s_w", "s": min(s, s2), "s2": max(s, s2), "w": wp[s]})
        for x in S:
            if x != lp[s]:
                a, b = rng.sample([lp[s], x], 2)
                pool.append({"t": "s_or_r", "s": s, "r": a, "r2": b})
            if x != wp[s]:
                a, b = rng.sample([wp[s], x], 2)
                pool.append({"t": "s_or_w", "s": s, "w": a, "w2": b})
        for k in S:
            if k != s:
                a, b = rng.sample([wp[s], wp[k]], 2)
                pool.append({"t": "split", "s": s, "r": lp[k], "w": a, "w2": b})
                for r in S:
                    if r != lp[k]:
                        pool.append({"t": "nor", "s": s, "w": wp[k], "r": r})
    # favor the more interesting kinds; plain positives are rare
    weight = {"s_is_r": 0.15, "s_is_w": 0.15, "w_in_r": 0.25, "s_not_r": 1, "s_not_w": 1, "w_not_r": 1.2,
              "or_s_r": 1.4, "or_s_w": 1.4, "s_or_r": 1.3, "s_or_w": 1.3, "split": 1.6, "nor": 1.2}
    seen, uniq = set(), []
    for c in pool:
        key = json.dumps(c, sort_keys=True)
        if key not in seen:
            seen.add(key)
            uniq.append(c)
    uniq.sort(key=lambda c: rng.random() ** (1 / weight[c["t"]]), reverse=True)
    return uniq


def make_grid_case(rng, n, liar, lo, hi):
    g = grid(n)
    while True:
        lp = tuple(rng.sample(range(n), n))
        wp = tuple(rng.sample(range(n), n))
        killer = rng.randrange(n)
        extra = []
        statements = None
        if liar:
            statements = []
            for sp in range(n):
                others = [x for x in range(n) if x != sp]
                kinds = ["self_r", "self_not_r", "self_w", "self_not_w", "other_r", "other_w", "wr"]
                while True:
                    k = rng.choice(kinds)
                    o = rng.choice(others)
                    c = {"self_r": {"t": "s_is_r", "s": sp, "r": rng.randrange(n)},
                         "self_not_r": {"t": "s_not_r", "s": sp, "r": rng.randrange(n)},
                         "self_w": {"t": "s_is_w", "s": sp, "w": rng.randrange(n)},
                         "self_not_w": {"t": "s_not_w", "s": sp, "w": rng.randrange(n)},
                         "other_r": {"t": "s_is_r", "s": o, "r": rng.randrange(n)},
                         "other_w": {"t": "s_is_w", "s": o, "w": rng.randrange(n)},
                         "wr": {"t": rng.choice(["w_in_r", "w_not_r"]), "w": rng.randrange(n), "r": rng.randrange(n)}}[k]
                    if holds(c, lp, wp) == (sp != killer):
                        statements.append(c)
                        break
            extra = [("liar", g.one_liar([g.mask(c) for c in statements]), False)]
        pool = true_clues(rng, n, lp, wp)
        chosen, cur = [], g.ALL
        for _, m, _ in extra:
            cur &= m
        solved = False
        for c in pool:
            if c["t"] in POSITIVE and any(x["t"] in POSITIVE for x, _ in chosen):
                continue
            m = g.mask(c)
            unique = bin(cur).count("1") == 1
            if not unique and cur & m == cur:
                continue
            chosen.append((c, m))
            cur &= m
            if bin(cur).count("1") == 1:
                cons = extra + [(i, mk, ck["t"] in DIRECT) for i, (ck, mk) in enumerate(chosen)]
                solved, _ = g.propagate(cons)
                if solved:
                    break
            if len(chosen) >= hi + 6:
                break
        if not solved:
            continue
        order = list(range(len(chosen)))
        rng.shuffle(order)
        keep = set(order)
        for i in order:
            trial = keep - {i}
            cons = extra + [(j, chosen[j][1], chosen[j][0]["t"] in DIRECT) for j in sorted(trial)]
            if g.propagate(cons)[0]:
                keep = trial
        clues = [chosen[i] for i in sorted(keep)]
        if not lo <= len(clues) <= hi:
            continue
        # interesting clues first is dull; shuffle, then number
        rng.shuffle(clues)
        cons = extra + [(i, m, c["t"] in DIRECT) for i, (c, m) in enumerate(clues)]
        ok, steps = g.propagate(cons)
        assert ok
        return dict(lp=lp, wp=wp, killer=killer, clues=[c for c, _ in clues], statements=statements, steps=steps)


def explain_grid(case, S, R, W):
    """Readable solution steps from the recorded propagation."""
    def gone(p):
        kind, a, b = p
        return {"SR": f"{S[a]} was not in the {R[b]}", "SW": f"{S[a]} did not carry the {W[b]}",
                "WR": f"the {W[a]} was not in the {R[b]}"}[kind]

    def sure(p):
        kind, a, b = p
        return {"SR": f"{S[a]} was in the {R[b]}", "SW": f"{S[a]} carried the {W[b]}",
                "WR": f"the {W[a]} was in the {R[b]}"}[kind]

    def join(xs):
        return "; ".join(xs)

    def few(pairs):
        xs = [gone(p) for p in pairs]
        return join(xs[:3]) + (", and more" if len(xs) > 3 else "")

    out = []
    direct_nums = [str(i + 1) for i, c in enumerate(case["clues"]) if c["t"] in DIRECT]
    for label, gone_pairs, sure_pairs in case["steps"]:
        found = join(sure(p) for p in sure_pairs)
        if label == "direct":
            nums = ", ".join(direct_nums[:-1]) + (" and " if len(direct_nums) > 1 else "") + direct_nums[-1]
            out.append(f"Mark the plain facts from clue{'s' if len(direct_nums) > 1 else ''} {nums} on the grid."
                       + (f" That gives: {found}." if found else ""))
        elif label == "grid":
            out.append(f"One square is left in a row or column: {found}." if found
                       else f"Matching rows and columns shows: {few(gone_pairs)}.")
        elif label == "liar":
            out.append("Only one statement can be false. " + (f"That means: {found}." if found
                                                              else f"So: {few(gone_pairs)}."))
        else:
            out.append(f"Clue {label + 1}: {found}." if found else f"Clue {label + 1} shows: {few(gone_pairs)}.")
    return out


# ---------------------------------------------------------------- level A
def make_cross_off(rng, rooms, hard):
    n = 6
    while True:
        heights = rng.sample(range(61, 76), n)
        sus = [dict(room=rng.randrange(5), hand=rng.choice(["left", "right", "right"]), height=heights[i],
                    hair=rng.choice(HAIR)) for i in range(n)]
        for s in sus:
            s["first"] = "?"
        k = rng.randrange(n)
        x = sus[k]
        pool = [{"t": "hand", "v": x["hand"]}]
        for i in range(n):
            if i != k:
                pool.append({"t": "taller" if x["height"] > sus[i]["height"] else "shorter", "s": i})
        for r in range(5):
            if r != x["room"]:
                pool.append({"t": "not_room", "v": r})
                a, b = rng.sample([x["room"], r], 2)
                pool.append({"t": "room_in", "v": a, "v2": b})
        for h in HAIR:
            if h != x["hair"]:
                pool.append({"t": "hair_not", "v": h})
                a, b = rng.sample([x["hair"], h], 2)
                pool.append({"t": "hair_in", "v": a, "v2": b})
        if hard:
            for r in range(5):
                pool.append({"t": "hand_or_room", "v": x["hand"], "v2": r} if r != x["room"] else
                            {"t": "hand_or_room", "v": "left" if x["hand"] == "right" else "right", "v2": r})
                h = rng.choice(HAIR)
                if h == x["hair"] or r == x["room"]:
                    pool.append({"t": "hair_or_room", "v": h, "v2": r})
            hs = sorted(s["height"] for s in sus)
            if hs[0] < x["height"] < hs[-1]:
                pool.append({"t": "middle"})
        rng.shuffle(pool)
        left = set(range(n))
        clues, kinds = [], set()
        cap = 2 if hard else 3
        for c in pool:
            base = c["t"].split("_")[0]
            if base in kinds and c["t"] not in ("taller", "shorter"):
                continue
            out = {i for i in left if not a_holds(c, sus[i], sus)}
            if not out or len(out) > cap:
                continue
            clues.append(c)
            kinds.add(base)
            left -= out
            if len(left) == 1:
                break
        if left != {k}:
            continue
        # every clue must be needed: drop any the others make unnecessary
        for c in clues[:]:
            rest = [d for d in clues if d is not c]
            if [i for i in range(n) if all(a_holds(d, sus[i], sus) for d in rest)] == [k]:
                clues = rest
        want = (4, 6) if hard else (3, 5)
        if not want[0] <= len(clues) <= want[1]:
            continue
        if hard and not any(c["t"] in ("hand_or_room", "hair_or_room", "middle") for c in clues):
            continue
        rng.shuffle(clues)
        return sus, k, clues


# ---------------------------------------------------------------- assemble
USED = set()


def people(rng, roles, n, victim):
    firsts, out = set(victim.split()), []
    while len(out) < n:
        f, l = rng.choice(FIRST), rng.choice(LAST)
        if f in firsts or l in victim or any(l == p["last"] for p in out) or (f, l) in USED:
            continue
        USED.add((f, l))
        firsts.add(f)
        out.append(dict(first=f, last=l, name=f"{f} {l}", role=roles[len(out)]))
    return out


def build():
    rng = random.Random(1887)
    cases = []
    for num, st in enumerate(load(), 1):
        level = "A" if num <= 18 else "B" if num <= 36 else "C" if num <= 50 else "D"
        case = dict(num=num, level=level, title=st["title"], victim=st["victim"], scene=st["scene"],
                    motive=rng.choice(MOTIVES))
        if level == "A":
            roles = st["roles"][:]
            rng.shuffle(roles)
            ppl = people(rng, roles, 6, st["victim"])
            sus, k, clues = make_cross_off(rng, st["rooms"], hard=num > 8)
            for p, s in zip(ppl, sus):
                s.update(p)
            steps, left = [], list(range(6))
            for i, c in enumerate(clues, 1):
                out = [j for j in left if not a_holds(c, sus[j], sus)]
                left = [j for j in left if j not in out]
                if out:
                    fs = [sus[j]["first"] for j in out]
                    names = fs[0] if len(fs) == 1 else ", ".join(fs[:-1]) + " and " + fs[-1]
                    steps.append(f"Clue {i} clears {names}.")
            case.update(suspects=sus, rooms=st["rooms"], clues=clues,
                        clue_text=[a_text(c, sus, st["rooms"]) for c in clues],
                        killer=k, steps=steps)
        else:
            n = 4 if level == "B" else 5
            lo, hi = {"B": (5, 8), "C": (7, 11), "D": (6, 11)}[level]
            idx = rng.sample(range(6), n)
            ppl = people(rng, [st["roles"][i] for i in idx], n, st["victim"])
            R = rng.sample(st["rooms"], n)
            W = rng.sample(st["weapons"], n)
            gcase = make_grid_case(rng, n, level == "D", lo, hi)
            S = [p["first"] for p in ppl]
            k = gcase["killer"]
            fact = None
            if level != "D":
                if num % 2:
                    fact = dict(kind="room", text=f"The victim was killed in the {R[gcase['lp'][k]]}.")
                else:
                    fact = dict(kind="weapon", text=f"The murder weapon was the {W[gcase['wp'][k]]}.")
            case.update(suspects=ppl, rooms=R, weapons=W, clues=gcase["clues"],
                        clue_text=[clue_text(c, S, R, W) for c in gcase["clues"]],
                        statements=gcase["statements"],
                        statement_text=[statement_text(c, i, S, R, W) for i, c in enumerate(gcase["statements"])]
                        if gcase["statements"] else None,
                        fact=fact, killer=k, lp=list(gcase["lp"]), wp=list(gcase["wp"]),
                        steps=explain_grid(gcase, S, R, W))
        cases.append(case)
        print(num, level, st["title"], "clues:", len(case["clues"]), flush=True)
    (HERE / "cases.json").write_text(json.dumps(cases, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    build()
