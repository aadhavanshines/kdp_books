"""Multi-source BFS: rot spreads from every rotten orange at once."""

from grids import minutes_to_rot

crate = ["RFF.", "FF.F", ".FFF", "...R"]
print(minutes_to_rot(crate), "minutes")
print(minutes_to_rot(["RF", ".F", "F."]), "(the last one is cut off)")
