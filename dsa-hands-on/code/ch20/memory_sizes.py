"""How many entries each representation stores for a sparse graph:
V vertices, each joined to about 4 others."""

print(
    f"{'vertices':>9} {'edges':>8} {'adjacency list':>15} "
    f"{'matrix cells':>16}"
)
for v in [100, 1_000, 10_000, 100_000]:
    e = 2 * v  # about 4 neighbors each: every edge has two ends
    print(f"{v:>9,} {e:>8,} {2 * e:>15,} {v * v:>16,}")
