"""How many items does resizing copy in total? Three growth rules."""


def copies_for(n, grow):
    """Total items copied while appending n items, starting at 1 slot."""
    capacity, copies = 1, 0
    for size in range(n):
        if size == capacity:  # full: copy everything to new storage
            copies += size
            capacity = grow(capacity)
    return copies


rules = {
    "double": lambda c: 2 * c,
    "times 1.5": lambda c: max(c + 1, int(c * 1.5)),
    "add 100": lambda c: c + 100,
}
print(f"{'n':>9}" + "".join(f"{name:>16}" for name in rules))
for n in [1_000, 10_000, 100_000, 1_000_000]:
    row = "".join(f"{copies_for(n, g) / n:>16,.1f}" for g in rules.values())
    print(f"{n:>9,}{row}")
print("(copies per appended item)")
