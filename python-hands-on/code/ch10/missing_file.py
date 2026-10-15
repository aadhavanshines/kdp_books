from pathlib import Path

path = Path("does_not_exist.txt")
try:
    text = path.read_text(encoding="utf-8")
except FileNotFoundError:
    print(f"No file called {path.name}; starting with an empty list.")
    text = ""
print("Lines:", len(text.splitlines()))

Path("does_not_exist.txt").read_text(encoding="utf-8")   # without try: a crash
