#!/bin/sh
# Run every problem check on Python 3.12 to 3.15 (venvs shared with the Python book).
set -e
cd "$(dirname "$0")/.."
for v in 3.12 3.13 3.14 3.15; do
  "$(cd ../python-hands-on/.venvs/py$v && pwd)/bin/python" tests/run_problems.py "$@"
done
