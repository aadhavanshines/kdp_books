"""Hash values: what dicts and sets use to find things."""

print(hash(42), hash(42) == hash(42.0))  # equal values, equal hashes
print(hash(-1), hash(-2))  # -1 is special in CPython: it becomes -2
print(hash((1, 2)) == hash((1, 2)))  # tuples hash by their contents

try:
    hash([1, 2])
except TypeError as error:
    print("TypeError:", error)  # a list can change, so it can't be a key

point = {(0, 0): "origin", (1, 2): "P"}
print(point[(1, 2)])
