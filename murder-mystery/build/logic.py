"""Shared puzzle logic: what each kind of clue means, and how it reads in English.

A grid case has n suspects. At the time of the murder each suspect was in a different
room and carried a different object, so a full answer is two permutations:
    lp[i] = room of suspect i,   wp[i] = object carried by suspect i.
A clue is a dict {"t": type, ...args}. ``holds`` says whether an answer satisfies it.
"""


def holds(c, lp, wp):
    t = c["t"]
    if t == "s_is_r":
        return lp[c["s"]] == c["r"]
    if t == "s_not_r":
        return lp[c["s"]] != c["r"]
    if t == "s_is_w":
        return wp[c["s"]] == c["w"]
    if t == "s_not_w":
        return wp[c["s"]] != c["w"]
    if t == "w_in_r":
        return lp[wp.index(c["w"])] == c["r"]
    if t == "w_not_r":
        return lp[wp.index(c["w"])] != c["r"]
    if t == "or_s_r":
        return lp[c["s"]] == c["r"] or lp[c["s2"]] == c["r"]
    if t == "or_s_w":
        return wp[c["s"]] == c["w"] or wp[c["s2"]] == c["w"]
    if t == "s_or_r":
        return lp[c["s"]] in (c["r"], c["r2"])
    if t == "s_or_w":
        return wp[c["s"]] in (c["w"], c["w2"])
    if t == "split":
        k = lp.index(c["r"])
        return k != c["s"] and {wp[c["s"]], wp[k]} == {c["w"], c["w2"]}
    if t == "nor":
        k = wp.index(c["w"])
        return k != c["s"] and lp[k] != c["r"]
    raise ValueError(t)


DIRECT = {"s_is_r", "s_not_r", "s_is_w", "s_not_w", "w_in_r", "w_not_r"}
POSITIVE = {"s_is_r", "s_is_w", "w_in_r"}


def clue_text(c, S, R, W):
    """English for a clue. S, R, W are lists of first names, rooms and objects.
    c["p"] picks one of several wordings that all mean exactly the same thing."""
    t = c["t"]
    s = S[c["s"]] if "s" in c else None
    s2 = S[c["s2"]] if "s2" in c else None
    r = R[c["r"]] if "r" in c else None
    r2 = R[c["r2"]] if "r2" in c else None
    w = W[c["w"]] if "w" in c else None
    w2 = W[c["w2"]] if "w2" in c else None
    forms = {
        "s_is_r": [f"{s} was in the {r}.", f"Two witnesses place {s} in the {r}."],
        "s_not_r": [f"{s} was not in the {r}.", f"{s} never set foot in the {r}.",
                    f"Wherever {s} was, it was not the {r}."],
        "s_is_w": [f"{s} was carrying the {w}.", f"{s} was seen holding the {w}."],
        "s_not_w": [f"{s} was not carrying the {w}.", f"{s} never handled the {w}.",
                    f"Whatever {s} carried, it was not the {w}."],
        "w_in_r": [f"Whoever carried the {w} was in the {r}.", f"The {w} was in the {r} at the time."],
        "w_not_r": [f"The {w} was not in the {r}.", f"The {w} never entered the {r}.",
                    f"Whoever carried the {w} stayed out of the {r}."],
        "or_s_r": [f"Either {s} or {s2} was in the {r}.", f"The person in the {r} was {s} or {s2}.",
                   f"Only {s} or {s2} could have been in the {r}."],
        "or_s_w": [f"Either {s} or {s2} was carrying the {w}.", f"The {w} was carried by {s} or by {s2}.",
                   f"Only {s} or {s2} could have had the {w}."],
        "s_or_r": [f"{s} was in either the {r} or the {r2}.",
                   f"{s} was in the {r} or the {r2}; the witness cannot say which.",
                   f"There are only two rooms {s} could have been in: the {r} and the {r2}."],
        "s_or_w": [f"{s} was carrying either the {w} or the {w2}.",
                   f"{s} had the {w} or the {w2}; nobody is sure which.",
                   f"There are only two things {s} could have carried: the {w} and the {w2}."],
        "split": [f"Of {s} and the person in the {r}, one carried the {w} and the other carried the {w2}.",
                  f"{s} was not in the {r}. Between them, {s} and the person who was there carried the {w} and the {w2}.",
                  f"The {w} and the {w2} were carried by two people: {s}, and whoever was in the {r} (someone else)."],
        "nor": [f"The person carrying the {w} was not {s}, and was not in the {r}.",
                f"{s} did not carry the {w}, and the {w} was not in the {r}.",
                f"The {w} was not with {s} and was not in the {r}."],
    }[t]
    return forms[c.get("p", 0) % len(forms)]


def statement_text(c, speaker, S, R, W):
    """A suspect's statement, in the first person when it is about the speaker."""
    t = c["t"]
    me = c.get("s") == speaker
    s = S[c["s"]] if "s" in c else None
    r = R[c["r"]] if "r" in c else None
    w = W[c["w"]] if "w" in c else None
    if t == "s_is_r":
        return f"I was in the {r}." if me else f"{s} was in the {r}."
    if t == "s_not_r":
        return f"I was nowhere near the {r}." if me else f"{s} was not in the {r}."
    if t == "s_is_w":
        return f"I was carrying the {w}." if me else f"{s} was carrying the {w}."
    if t == "s_not_w":
        return f"I never touched the {w}." if me else f"{s} was not carrying the {w}."
    if t == "w_in_r":
        return f"Whoever carried the {w} was in the {r}."
    if t == "w_not_r":
        return f"The {w} was not in the {r}."
    raise ValueError(t)


# ---- Level A (cross-off cases): each clue is a fact about the killer ----------------
def a_holds(c, x, suspects):
    """Does suspect x fit clue c? ``suspects`` is the full list (for comparisons)."""
    t = c["t"]
    if t == "hand":
        return x["hand"] == c["v"]
    if t == "taller":
        return x["height"] > suspects[c["s"]]["height"]
    if t == "shorter":
        return x["height"] < suspects[c["s"]]["height"]
    if t == "not_room":
        return x["room"] != c["v"]
    if t == "room_in":
        return x["room"] in (c["v"], c["v2"])
    if t == "hair_not":
        return x["hair"] != c["v"]
    if t == "hair_in":
        return x["hair"] in (c["v"], c["v2"])
    if t == "hand_or_room":
        return x["hand"] == c["v"] or x["room"] == c["v2"]
    if t == "hair_or_room":
        return x["hair"] == c["v"] or x["room"] == c["v2"]
    if t == "middle":
        hs = sorted(s["height"] for s in suspects)
        return hs[0] < x["height"] < hs[-1]
    raise ValueError(t)


def a_text(c, suspects, rooms):
    t = c["t"]
    v, v2 = c.get("v"), c.get("v2")
    name = suspects[c["s"]]["first"] if "s" in c else None
    rm = lambda i: rooms[i] if isinstance(i, int) else i
    forms = {
        "hand": [f"The angle of the blow shows that the killer is {v}-handed.",
                 f"The knot in the cord was tied by a {v}-handed person. The killer is {v}-handed.",
                 f"Smudged prints on the door show that the killer is {v}-handed."],
        "taller": [f"A witness saw a figure hurry away. It was someone taller than {name}.",
                   f"The killer took something from a shelf that {name} cannot reach. The killer is taller than {name}.",
                   f"Seen through the window, the killer stood clearly taller than {name}."],
        "shorter": [f"The killer slipped through a gap that only someone shorter than {name} could use.",
                    f"A coat left at the scene would be far too short for {name}. The killer is shorter than {name}.",
                    f"One witness is sure of a single thing: the killer was shorter than {name}."],
        "not_room": [f"The {rm(v)} was locked from the outside all evening. Nobody in there could have done it.",
                     f"Everyone in the {rm(v)} was in plain view the whole time. The killer was not in there.",
                     f"The only door of the {rm(v)} had wet paint on it, and the paint is unmarked. The killer did not come from there."],
        "room_in": [f"Fresh footprints lead to the scene from only two places: the {rm(v)} and the {rm(v2)}.",
                    f"A trail of dust shows that the killer came from either the {rm(v)} or the {rm(v2)}.",
                    f"The killer came from the {rm(v)} or the {rm(v2)}. No other way to the scene was open."],
        "hair_not": [f"A hair was found on the victim's sleeve, left by the killer. It was not {v}.",
                     f"A witness saw the killer from behind and is certain the hair was not {v}.",
                     f"Hairs caught in the window latch rule out anyone with {v} hair."],
        "hair_in": [f"A witness glimpsed the killer's hair. It was either {v} or {v2}.",
                    f"In the poor light the killer's hair looked {v} or {v2}, and nothing else."],
        "hand_or_room": [f"Either the killer is {v}-handed, or the killer came from the {rm(v2)} (or both).",
                         f"If the killer is not {v}-handed, then the killer came from the {rm(v2)}."],
        "hair_or_room": [f"Either the killer has {v} hair, or the killer came from the {rm(v2)} (or both).",
                         f"If the killer does not have {v} hair, then the killer came from the {rm(v2)}."],
        "middle": ["The killer is neither the tallest nor the shortest of the suspects.",
                   "At least one suspect is taller than the killer, and at least one is shorter."],
    }[t]
    return forms[c.get("p", 0) % len(forms)]


def feet(inches):
    return f"{inches // 12} ft {inches % 12} in"
