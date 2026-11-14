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
    """English for a clue. S, R, W are lists of first names, rooms and objects."""
    t = c["t"]
    s = S[c["s"]] if "s" in c else None
    s2 = S[c["s2"]] if "s2" in c else None
    r = R[c["r"]] if "r" in c else None
    r2 = R[c["r2"]] if "r2" in c else None
    w = W[c["w"]] if "w" in c else None
    w2 = W[c["w2"]] if "w2" in c else None
    return {
        "s_is_r": f"{s} was in the {r}.",
        "s_not_r": f"{s} was not in the {r}.",
        "s_is_w": f"{s} was carrying the {w}.",
        "s_not_w": f"{s} was not carrying the {w}.",
        "w_in_r": f"Whoever carried the {w} was in the {r}.",
        "w_not_r": f"The {w} was not in the {r}.",
        "or_s_r": f"Either {s} or {s2} was in the {r}.",
        "or_s_w": f"Either {s} or {s2} was carrying the {w}.",
        "s_or_r": f"{s} was in either the {r} or the {r2}.",
        "s_or_w": f"{s} was carrying either the {w} or the {w2}.",
        "split": f"Of {s} and the person in the {r}, one carried the {w} and the other carried the {w2}.",
        "nor": f"The person carrying the {w} was not {s}, and was not in the {r}.",
    }[t]


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
    room = lambda i: rooms[i]
    return {
        "hand": lambda: f"The angle of the blow shows that the killer is {v}-handed.",
        "taller": lambda: f"A witness saw a figure hurry away. It was someone taller than {name}.",
        "shorter": lambda: f"The killer slipped through a gap that only someone shorter than {name} could use.",
        "not_room": lambda: f"The {room(v)} was locked from the outside all evening. Nobody in there could have done it.",
        "room_in": lambda: f"Fresh footprints lead to the scene from only two places: the {room(v)} and the {room(v2)}.",
        "hair_not": lambda: f"A hair was found on the victim's sleeve. It was not {v}.",
        "hair_in": lambda: f"A witness glimpsed the killer's hair. It was either {v} or {v2}.",
        "hand_or_room": lambda: f"Either the killer is {v}-handed, or the killer came from the {room(v2)} (or both).",
        "hair_or_room": lambda: f"Either the killer has {v} hair, or the killer came from the {room(v2)} (or both).",
        "middle": lambda: "The killer is neither the tallest nor the shortest of the suspects.",
    }[t]()


def feet(inches):
    return f"{inches // 12} ft {inches % 12} in"
