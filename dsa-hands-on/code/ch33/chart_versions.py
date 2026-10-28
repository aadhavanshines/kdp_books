"""Compare the Python versions: each test's time relative to Python
3.12 (below 1.00 is faster), from the results in versions.json."""

import json
from statistics import geometric_mean

import matplotlib.pyplot as plt

with open("versions.json") as f:
    results = json.load(f)
versions = list(results)
base = results[versions[0]]

print(f"{'':>20}" + "".join(f"{v:>8}" for v in versions))
ratios = {v: [] for v in versions}
for test in base:
    row = f"{test:>20}"
    for v in versions:
        ratio = results[v][test] / base[test]
        ratios[v].append(ratio)
        row += f"{ratio:>8.2f}"
    print(row)
overall = {v: geometric_mean(ratios[v]) for v in versions}
print(f"{'overall':>20}" + "".join(f"{overall[v]:>8.2f}" for v in versions))

fig, ax = plt.subplots()
ax.bar(versions, [overall[v] for v in versions])
ax.axhline(1, color="gray", linewidth=0.8)
ax.set_ylabel("time relative to Python 3.12")
ax.set_title("The book's benchmark suite on four Python versions")
fig.tight_layout()
fig.savefig("ch33_versions.png")
