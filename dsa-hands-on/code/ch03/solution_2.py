"""Exercise 3.2: classify two functions from their timings, then
predict their time at n = 64,000 (three more doublings)."""

sizes = [1_000, 2_000, 4_000, 8_000]
timings = {"first": [0.5, 2.1, 8.3, 33], "second": [1.0, 2.2, 4.6, 9.8]}

for name, ms in timings.items():
    ratios = [b / a for a, b in zip(ms, ms[1:])]
    average = sum(ratios) / len(ratios)
    kind = "O(n^2)" if average > 3 else "O(n) or O(n log n)"
    predicted = ms[-1] * average**3  # 8,000 -> 64,000 is 3 doublings
    shown = ", ".join(f"x{r:.1f}" for r in ratios)
    print(f"{name}: ratios {shown}, so {kind};")
    print(f"   at 64,000 about {predicted / 1000:.1f} seconds")
