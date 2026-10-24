from pathlib import Path

for path in sorted(Path("../data").glob("*.csv")):
    with path.open() as f:
        header = f.readline().strip()
        rows = sum(1 for _ in f)
    print(f"{path.name:<18} {rows:>6,} rows  {header[:44]}")
