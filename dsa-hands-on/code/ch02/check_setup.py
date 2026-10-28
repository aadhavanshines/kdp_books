"""Check that this computer is ready for the book's code."""

import sys

if sys.version_info < (3, 12):
    sys.exit("This book needs Python 3.12 or newer.")
print("Python 3.12 or newer: OK")

for package in ("pytest", "matplotlib"):
    try:
        __import__(package)
    except ImportError:
        sys.exit(f"Missing {package}: run  pip install -r requirements.txt")
    print(f"{package}: OK")
print("Everything is ready.")
