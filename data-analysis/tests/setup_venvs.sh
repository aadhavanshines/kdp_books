#!/bin/sh
# Create one virtual environment per Python version for the listing checks.
# Needs uv (https://docs.astral.sh/uv/). Run from the book's folder.
set -e
for v in 3.12 3.13 3.14 3.15; do
    uv python install "$v"
    uv venv --python "$v" ".venvs/py$v"
    uv pip install --python ".venvs/py$v/bin/python" -r requirements.txt
done
