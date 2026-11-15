"""Generate the 60 cases and write cases.json.

Every grid case is built so that (1) it has exactly one answer, and (2) a person can solve
it with a short list of named rules, one clue at a time, never guessing. The solver below
uses only those rules, and the sentences it writes as it goes are the printed solution.
"""
import itertools
import json
import random
from collections import Counter
from pathlib import Path

from logic import POSITIVE, a_holds, a_text, clue_text, holds, statement_text
from settings import FEMALE, FIRST, LAST, MALE, MOTIVES, load, role_gender

HERE = Path(__file__).resolve().parent
HAIR = ["black", "brown", "blond", "red", "gray"]
DIRECT = {"s_is_r", "s_not_r", "s_is_w", "s_not_w", "w_in_r", "w_not_r"}
NEGATE = {"s_is_r": "s_not_r", "s_not_r": "s_is_r", "s_is_w": "s_not_w", "s_not_w": "s_is_w",
          "w_in_r": "w_not_r", "w_not_r": "w_in_r"}


# ------------------------------------------------- exact search (for uniqueness only)
class Space:
    def __init__(self, n):
        perms = list(itertools.permutations(range(n)))
        self.assign = [(lp, wp) for lp in perms for wp in perms]
        self.ALL = (1 << len(self.assign)) - 1

    def mask(self, c):
        m = 0
        for i, (lp, wp) in enumerate(self.assign):
            if holds(c, lp, wp):
                m |= 1 << i
        return m

    def one_liar(self, masks):
        out = 0
        for k in range(len(masks)):
            m = self.ALL & ~masks[k]
            for j, mj in enumerate(masks):
                if j != k:
                    m &= mj
            out |= m
        return out


SPACES = {}


def space(n):
    if n not in SPACES:
        SPACES[n] = Space(n)
    return SPACES[n]


# ------------------------------------------------- the human-style solver
def pair_of(c):
    """The grid square a plain fact talks about, and whether the fact says yes or no."""
    t = c["t"]
    if t in ("s_is_r", "s_not_r"):
        return ("SR", c["s"], c["r"]), t == "s_is_r"
    if t in ("s_is_w", "s_not_w"):
        return ("SW", c["s"], c["w"]), t == "s_is_w"
    return ("WR", c["w"], c["r"]), t == "w_in_r"


class Solver:
    """Solves a grid with a fixed list of simple rules and writes down each step."""

    def __init__(self, n, clues, statements, S, R, W):
        self.n, self.clues, self.statements = n, clues, statements
        self.S, self.R, self.W = S, R, W
        self.possible = {(k, a, b) for k in ("SR", "SW", "WR") for a in range(n) for b in range(n)}
        self.sure = set()
        self.started = set()
        self.steps = []
        self.suspects = set(range(n)) if statements else set()     # who could still be the liar
        self.liar = None
        self.used_honest = set()
        self.broken = False

    # ---- words
    def yes(self, p):
        k, a, b = p
        return {"SR": f"{self.S[a]} was in the {self.R[b]}", "SW": f"{self.S[a]} carried the {self.W[b]}",
                "WR": f"the {self.W[a]} was in the {self.R[b]}"}[k]

    def no(self, p):
        k, a, b = p
        return {"SR": f"{self.S[a]} was not in the {self.R[b]}", "SW": f"{self.S[a]} did not carry the {self.W[b]}",
                "WR": f"the {self.W[a]} was not in the {self.R[b]}"}[k]

    def fact(self, c):
        p, positive = pair_of(c)
        return self.yes(p) if positive else self.no(p)

    @staticmethod
    def cap(t):
        return t[0].upper() + t[1:]

    # ---- marking the grid
    def cross(self, p):
        if p in self.possible:
            self.possible.discard(p)
            return True
        return False

    def circle(self, p):
        """Mark a pair as certain: cross out the rest of its row and column."""
        k, a, b = p
        changed = p not in self.sure
        self.sure.add(p)
        for x in range(self.n):
            if x != b:
                changed |= self.cross((k, a, x))
            if x != a:
                changed |= self.cross((k, x, b))
        return changed

    def apply(self, c):
        p, positive = pair_of(c)
        return self.circle(p) if positive else self.cross(p)

    def truth(self, c):
        """True, False, or None if the grid does not yet say."""
        p, positive = pair_of(c)
        if p in self.sure:
            return positive
        if p not in self.possible:
            return not positive
        return None

    def settle(self):
        """Grid logic, repeated until nothing changes. Returns the pairs it made certain."""
        n, new = self.n, []
        P = self.possible
        while True:
            changed = False
            for k in ("SR", "SW", "WR"):
                for a in range(n):
                    row = [b for b in range(n) if (k, a, b) in P]
                    col = [b for b in range(n) if (k, b, a) in P]
                    if not row or not col:
                        self.broken = True
                        return new
                    for p in ([(k, a, row[0])] if len(row) == 1 else []) + ([(k, col[0], a)] if len(col) == 1 else []):
                        if p not in self.sure:
                            self.circle(p)
                            new.append(p)
                            changed = True
            # link the three blocks: suspect s, room r, object w
            for s in range(n):
                for r in range(n):
                    for w in range(n):
                        sr, sw, wr = ("SR", s, r), ("SW", s, w), ("WR", w, r)
                        if sr in self.sure and (sw in P) != (wr in P):
                            changed |= self.cross(sw) | self.cross(wr)
                        if sw in self.sure and (sr in P) != (wr in P):
                            changed |= self.cross(sr) | self.cross(wr)
                        if wr in self.sure and (sr in P) != (sw in P):
                            changed |= self.cross(sr) | self.cross(sw)
            for s in range(n):
                for r in range(n):
                    if ("SR", s, r) in P and not any(("SW", s, w) in P and ("WR", w, r) in P for w in range(n)):
                        changed |= self.cross(("SR", s, r))
                for w in range(n):
                    if ("SW", s, w) in P and not any(("SR", s, r) in P and ("WR", w, r) in P for r in range(n)):
                        changed |= self.cross(("SW", s, w))
            for w in range(n):
                for r in range(n):
                    if ("WR", w, r) in P and not any(("SW", s, w) in P and ("SR", s, r) in P for s in range(n)):
                        changed |= self.cross(("WR", w, r))
            if not changed:
                return new

    def say(self, text):
        new = self.settle()
        if new:
            text += " Now fill in each square that is the only one left in its row or column, one after another: " + "; ".join(self.yes(p) for p in new) + "."
        self.steps.append(text)

    # ---- one rule per kind of clue
    def use(self, i, c):
        """Try clue i. Returns a sentence if it taught us something new, else None."""
        t, n, num = c["t"], self.n, i + 1
        S, R, W = self.S, self.R, self.W
        first = i not in self.started
        self.started.add(i)
        again = "" if first else " again"
        if t in ("or_s_r", "or_s_w"):
            k = "SR" if t == "or_s_r" else "SW"
            b = c["r"] if k == "SR" else c["w"]
            thing = f"in the {R[b]}" if k == "SR" else f"carrying the {W[b]}"
            a1, a2 = c["s"], c["s2"]
            if first and any([self.cross((k, x, b)) for x in range(n) if x not in (a1, a2)]):
                return f"Clue {num}: only {S[a1]} or {S[a2]} can have been {thing}, so cross out everyone else there."
            for x, y in ((a1, a2), (a2, a1)):
                if (k, x, b) not in self.possible and (k, y, b) not in self.sure:
                    self.circle((k, y, b))
                    return f"Clue {num}{again}: {S[x]} is already ruled out, so it was {S[y]} who was {thing}."
        elif t in ("s_or_r", "s_or_w"):
            k = "SR" if t == "s_or_r" else "SW"
            names = R if k == "SR" else W
            b1, b2 = (c["r"], c["r2"]) if k == "SR" else (c["w"], c["w2"])
            a = c["s"]
            if first and any([self.cross((k, a, x)) for x in range(n) if x not in (b1, b2)]):
                return (f"Clue {num}: {S[a]} has only two choices, the {names[b1]} or the {names[b2]}, "
                        f"so cross out the others for {S[a]}.")
            for x, y in ((b1, b2), (b2, b1)):
                if (k, a, x) not in self.possible and (k, a, y) not in self.sure:
                    self.circle((k, a, y))
                    return (f"Clue {num}{again}: the {names[x]} is already ruled out for {S[a]}, so "
                            + self.yes((k, a, y)) + ".")
        elif t == "nor":
            if first and any([self.cross(("SW", c["s"], c["w"])), self.cross(("WR", c["w"], c["r"]))]):
                return f"Clue {num}: {self.no(('SW', c['s'], c['w']))}, and {self.no(('WR', c['w'], c['r']))}."
        elif t == "split":
            s, r, w1, w2 = c["s"], c["r"], c["w"], c["w2"]
            if first:
                got = [self.cross(("SR", s, r))]
                got += [self.cross(("SW", s, x)) for x in range(n) if x not in (w1, w2)]
                got += [self.cross(("WR", x, r)) for x in range(n) if x not in (w1, w2)]
                if any(got):
                    return (f"Clue {num}: {S[s]} was not in the {R[r]}. {S[s]} carried the {W[w1]} or the {W[w2]}, "
                            f"and so did whoever was in the {R[r]}; cross out the other objects for both.")
            for a, b in ((w1, w2), (w2, w1)):          # can we tell that s had b, and a was in r?
                why = None
                if ("SW", s, a) not in self.possible:
                    why = f"{S[s]} cannot have carried the {W[a]}"
                elif ("WR", b, r) not in self.possible:
                    why = f"the {W[b]} cannot have been in the {R[r]}"
                elif ("SW", s, b) in self.sure:
                    why = f"{S[s]} carried the {W[b]}"
                elif ("WR", a, r) in self.sure:
                    why = f"the {W[a]} was in the {R[r]}"
                if why and not (("SW", s, b) in self.sure and ("WR", a, r) in self.sure):
                    self.circle(("SW", s, b))
                    self.circle(("WR", a, r))
                    return (f"Clue {num}{again}: {why}, so {S[s]} carried the {W[b]} "
                            f"and the {W[a]} was in the {R[r]}.")
        return None

    # ---- the one-liar rules
    def honest(self, ks):
        """Mark these speakers' statements as facts; return the new facts as words."""
        out = []
        for k in ks:
            if k not in self.used_honest:
                self.used_honest.add(k)
                if self.apply(self.statements[k]):
                    out.append(self.fact(self.statements[k]))
        return out

    def use_statements(self):
        S, st = self.S, self.statements
        if self.liar is not None:
            return None
        for k in sorted(self.suspects):
            if self.truth(st[k]) is False:
                neg = dict(st[k], t=NEGATE[st[k]["t"]])
                self.liar, self.suspects = k, {k}
                facts = self.honest([x for x in range(self.n) if x != k])
                text = (f"{S[k]}'s statement is false, because the grid already shows that {self.fact(neg)}. "
                        f"So {S[k]} is the liar and every other statement is true")
                return text + (": " + "; ".join(facts) + "." if facts else ".")
        if len(self.suspects) == 1:
            k = next(iter(self.suspects))
            self.liar = k
            neg = dict(st[k], t=NEGATE[st[k]["t"]])
            self.apply(neg)
            return (f"Everyone else has been cleared, so {S[k]} is the liar. "
                    f"{S[k]}'s statement is false, which means {self.fact(neg)}.")
        for k in sorted(self.suspects):
            if self.truth(st[k]) is True:
                self.suspects.discard(k)
                self.used_honest.add(k)
                return (f"The grid already shows that {self.fact(st[k])}, so {S[k]}'s statement is true "
                        f"and {S[k]} is not the liar.")
        if len(self.suspects) > 2:
            for i, j in itertools.combinations(sorted(self.suspects), 2):
                if self.clash(st[i], st[j]):
                    self.suspects = {i, j}
                    facts = self.honest([x for x in range(self.n) if x not in (i, j)])
                    text = (f"{S[i]} and {S[j]} cannot both be telling the truth ({self.clash(st[i], st[j])}), "
                            f"so one of them is the liar. Everyone else is honest")
                    return text + (": " + "; ".join(facts) + "." if facts else ".")
        return None

    def clash(self, a, b):
        """A short, specific reason why two plain facts cannot both hold, or None."""
        (pa, ya), (pb, yb) = pair_of(a), pair_of(b)
        S, R, W = self.S, self.R, self.W
        if pa == pb and ya != yb:
            return "one says yes and the other says no"
        if not (ya and yb and pa[0] == pb[0] and pa != pb):
            return None
        k = pa[0]
        if pa[1] == pb[1]:                 # one person (or object) given two different things
            return {"SR": f"they put {S[pa[1]]} in two different rooms",
                    "SW": f"they give {S[pa[1]]} two different objects",
                    "WR": f"they put the {W[pa[1]]} in two different rooms"}[k]
        if pa[2] == pb[2]:                 # two people (or objects) given the same thing
            return {"SR": f"they put two people in the {R[pa[2]]}",
                    "SW": f"they give the {W[pa[2]]} to two different people",
                    "WR": f"they put two objects in the {R[pa[2]]}"}[k]
        return None

    def run(self):
        direct = [i for i, c in enumerate(self.clues) if c["t"] in DIRECT]
        if direct:
            for i in direct:
                self.apply(self.clues[i])
            nums = [str(i + 1) for i in direct]
            lst = nums[0] if len(nums) == 1 else ", ".join(nums[:-1]) + " and " + nums[-1]
            self.say(f"Mark the plain facts from clue{'s' if len(nums) > 1 else ''} {lst} on the grid.")
        rest = [i for i in range(len(self.clues)) if i not in direct]
        while not self.broken:
            for i in rest:
                text = self.use(i, self.clues[i])
                if text:
                    self.say(text)
                    break
            else:
                text = self.use_statements() if self.statements else None
                if not text:
                    break
                self.say(text)
        done = len(self.sure) == 3 * self.n and not self.broken
        return done and (not self.statements or self.liar is not None)


# ------------------------------------------------- building a grid case
def true_clues(rng, n, lp, wp):
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
    weight = {"s_is_r": 0.2, "s_is_w": 0.2, "w_in_r": 0.3, "s_not_r": 1.2, "s_not_w": 1.2, "w_not_r": 1.3,
              "or_s_r": 1.5, "or_s_w": 1.5, "s_or_r": 1.1, "s_or_w": 1.1, "split": 1.4, "nor": 0.8}
    seen, uniq = set(), []
    for c in pool:
        key = json.dumps(c, sort_keys=True)
        if key not in seen:
            seen.add(key)
            uniq.append(c)
    uniq.sort(key=lambda c: rng.random() ** (1 / weight[c["t"]]), reverse=True)
    return uniq


def make_grid_case(rng, n, liar, lo, hi, S, R, W):
    sp = space(n)
    while True:
        lp = tuple(rng.sample(range(n), n))
        wp = tuple(rng.sample(range(n), n))
        killer = rng.randrange(n)
        statements, base = None, sp.ALL
        if liar:
            statements = []
            for who in range(n):
                others = [x for x in range(n) if x != who]
                while True:
                    kind = rng.choice(["self_r", "self_r", "self_not_r", "self_w", "self_not_w", "other_r", "other_w", "wr"])
                    o = rng.choice(others)
                    c = {"self_r": {"t": "s_is_r", "s": who, "r": rng.randrange(n)},
                         "self_not_r": {"t": "s_not_r", "s": who, "r": rng.randrange(n)},
                         "self_w": {"t": "s_is_w", "s": who, "w": rng.randrange(n)},
                         "self_not_w": {"t": "s_not_w", "s": who, "w": rng.randrange(n)},
                         "other_r": {"t": "s_is_r", "s": o, "r": rng.randrange(n)},
                         "other_w": {"t": "s_is_w", "s": o, "w": rng.randrange(n)},
                         "wr": {"t": rng.choice(["w_in_r", "w_not_r"]), "w": rng.randrange(n), "r": rng.randrange(n)}}[kind]
                    if holds(c, lp, wp) == (who != killer):
                        statements.append(c)
                        break
            base = sp.one_liar([sp.mask(c) for c in statements])

        def solvable(cl):
            return Solver(n, cl, statements, S, R, W).run()

        chosen, cur, ok = [], base, False
        for c in true_clues(rng, n, lp, wp):
            if c["t"] in POSITIVE and any(x["t"] in POSITIVE for x in chosen):
                continue
            m = sp.mask(c)
            unique = bin(cur).count("1") == 1
            if not unique and cur & m == cur:
                continue
            chosen.append(c)
            cur &= m
            if bin(cur).count("1") == 1 and solvable(chosen):
                ok = True
                break
            if len(chosen) >= hi + 8:
                break
        if not ok:
            continue
        order = list(range(len(chosen)))
        rng.shuffle(order)
        keep = list(range(len(chosen)))
        for i in order:
            trial = [j for j in keep if j != i]
            if solvable([chosen[j] for j in trial]):
                keep = trial
        clues = [chosen[i] for i in keep]
        if not lo <= len(clues) <= hi:
            continue
        if liar:
            # the statements must matter: the clues alone must not settle the grid...
            if Solver(n, clues, None, S, R, W).run():
                continue
            # ...and must not expose the liar: with the clues alone, the killer's statement could still be true
            m = sp.mask(statements[killer])
            for c in clues:
                m &= sp.mask(c)
            if not m:
                continue
        if look_alike([clue_text(dict(c, p=0), S, R, W) for c in clues]):
            continue
        rng.shuffle(clues)
        solver = Solver(n, clues, statements, S, R, W)
        assert solver.run()
        if liar:
            assert solver.liar == killer
        assert all(("SR", s, lp[s]) in solver.sure and ("SW", s, wp[s]) in solver.sure for s in range(n))
        return dict(lp=lp, wp=wp, killer=killer, clues=clues, statements=statements, steps=solver.steps)


def look_alike(texts):
    """True if two clues in one case open with the same six words."""
    heads = [" ".join(t.split()[:6]) for t in texts]
    return len(set(heads)) != len(heads)


# ------------------------------------------------- level A (cross-off cases)
def make_cross_off(rng, hard):
    n = 6
    while True:
        heights = rng.sample(range(61, 76), n)
        sus = [dict(room=rng.randrange(5), hand=rng.choice(["left", "right", "right"]), height=heights[i],
                    hair=rng.choice(HAIR), first="?") for i in range(n)]
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
                other = "left" if x["hand"] == "right" else "right"
                pool.append({"t": "hand_or_room", "v": x["hand"] if r != x["room"] else other, "v2": r})
                h = rng.choice(HAIR)
                if h == x["hair"] or r == x["room"]:
                    pool.append({"t": "hair_or_room", "v": h, "v2": r})
            hs = sorted(s["height"] for s in sus)
            if hs[0] < x["height"] < hs[-1]:
                pool.append({"t": "middle"})
        rng.shuffle(pool)
        left, clues, kinds = set(range(n)), [], set()
        for c in pool:
            base = c["t"].split("_")[0]
            if base in kinds and c["t"] not in ("taller", "shorter"):
                continue
            out = {i for i in left if not a_holds(c, sus[i], sus)}
            if not out or len(out) > (2 if hard else 3):
                continue
            clues.append(c)
            kinds.add(base)
            left -= out
            if len(left) == 1:
                break
        if left != {k}:
            continue
        for c in clues[:]:                      # every clue must be needed
            rest = [d for d in clues if d is not c]
            if [i for i in range(n) if all(a_holds(d, sus[i], sus) for d in rest)] == [k]:
                clues = rest
        if story_clash(clues):
            continue
        if not (4 if hard else 3) <= len(clues) <= (6 if hard else 5):
            continue
        if hard and not any(c["t"] in ("hand_or_room", "hair_or_room", "middle") for c in clues):
            continue
        rng.shuffle(clues)
        return sus, k, clues


def story_clash(clues):
    """True if two pieces of evidence would contradict each other as a story: one says
    nobody could have come from a room, another says the killer may have come from it."""
    shut = {c["v"] for c in clues if c["t"] == "not_room"}
    named = set()
    for c in clues:
        if c["t"] == "room_in":
            named |= {c["v"], c["v2"]}
        if c["t"] in ("hand_or_room", "hair_or_room"):
            named.add(c["v2"])
    return bool(shut & named)


# ------------------------------------------------- assemble
USED = set()


def people(rng, roles, victim):
    firsts, out = set(victim.replace(",", " ").split()), []
    for role in roles:
        g = role_gender(role)
        pool = sorted(FEMALE if g == "F" else MALE if g == "M" else set(FIRST))
        while True:
            f, l = rng.choice(pool), rng.choice(LAST)
            if f in firsts or l in victim or any(l == p["last"] for p in out) or (f, l) in USED:
                continue
            USED.add((f, l))
            firsts.add(f)
            out.append(dict(first=f, last=l, name=f"{f} {l}", role=role))
            break
    return out


def build():
    rng = random.Random(1887)
    wording = Counter()
    cases = []
    for num, st in enumerate(load(), 1):
        level = "A" if num <= 18 else "B" if num <= 36 else "C" if num <= 50 else "D"
        if level != "A":
            rng = random.Random(f"lighthouse-case-{num}")
        case = dict(num=num, level=level, title=st["title"], victim=st["victim"], scene=st["scene"],
                    motive=rng.choice(MOTIVES))
        if level == "A":
            roles = st["roles"][:]
            rng.shuffle(roles)
            ppl = people(rng, roles, st["victim"])
            sus, k, clues = make_cross_off(rng, hard=num > 8)
            for p, s in zip(ppl, sus):
                s.update(p)
            for c in clues:
                c["p"] = wording[c["t"]]
                wording[c["t"]] += 1
            texts = [a_text(c, sus, st["rooms"]) for c in clues]
            steps, left = [], list(range(6))
            for i, c in enumerate(clues, 1):
                out = [j for j in left if not a_holds(c, sus[j], sus)]
                left = [j for j in left if j not in out]
                fs = [sus[j]["first"] for j in out]
                names = fs[0] if len(fs) == 1 else ", ".join(fs[:-1]) + " and " + fs[-1]
                steps.append(f"Clue {i} clears {names}." if out else f"Clue {i} clears nobody new.")
            steps.append(f"Only {sus[k]['first']} is left.")
            case.update(suspects=sus, rooms=st["rooms"], clues=clues, clue_text=texts, killer=k, steps=steps)
        else:
            n = 4 if level == "B" else 5
            lo, hi = {"B": (5, 8), "C": (7, 11), "D": (5, 9)}[level]
            idx = rng.sample(range(6), n)
            ppl = people(rng, [st["roles"][i] for i in idx], st["victim"])
            R = rng.sample(st["rooms"], n)
            W = rng.sample(st["weapons"], n)
            S = [p["first"] for p in ppl]
            g = make_grid_case(rng, n, level == "D", lo, hi, S, R, W)
            for c in g["clues"]:
                c["p"] = wording[c["t"]]
                wording[c["t"]] += 1
            for _ in range(20):
                if not look_alike([clue_text(c, S, R, W) for c in g["clues"]]):
                    break
                for c in g["clues"]:
                    c["p"] += 1
            k = g["killer"]
            fact = None
            if level != "D":
                fact = (dict(kind="room", text=f"The victim was killed in the {R[g['lp'][k]]}.") if num % 2 else
                        dict(kind="weapon", text=f"The murder weapon was the {W[g['wp'][k]]}."))
            case.update(suspects=ppl, rooms=R, weapons=W, clues=g["clues"],
                        clue_text=[clue_text(c, S, R, W) for c in g["clues"]],
                        statements=g["statements"],
                        statement_text=[statement_text(c, i, S, R, W) for i, c in enumerate(g["statements"])]
                        if g["statements"] else None,
                        fact=fact, killer=k, lp=list(g["lp"]), wp=list(g["wp"]), steps=g["steps"])
        cases.append(case)
        print(num, level, st["title"], "clues:", len(case["clues"]), "steps:", len(case["steps"]), flush=True)
    (HERE / "cases.json").write_text(json.dumps(cases, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    build()
