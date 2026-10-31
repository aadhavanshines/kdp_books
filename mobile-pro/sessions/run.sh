#!/bin/sh
# Run one recorded Claude Code session in the book's code folder.
# Usage: sessions/run.sh NAME PROMPT_FILE [model]
# Saves NAME.prompt.md (the prompt), NAME.json (the full result with cost).
set -e
here=$(cd "$(dirname "$0")" && pwd)
name=$1; prompt_file=$2; model=${3:-claude-opus-5-5}
cp "$prompt_file" "$here/$name.prompt.md"
cd "$here/../code"
claude -p --permission-mode auto --output-format json --model "$model" \
  "$(cat "$here/$name.prompt.md")" > "$here/$name.json" 2> "$here/$name.err"
python3 - "$here/$name.json" <<'PY'
import json, sys
d = json.load(open(sys.argv[1]))
print("turns:", d.get("num_turns"), "cost: $%.2f" % d.get("total_cost_usd", 0),
      "minutes: %.1f" % (d.get("duration_ms", 0) / 60000), "error:", d.get("is_error"))
print(d.get("result", "")[-3000:])
PY
