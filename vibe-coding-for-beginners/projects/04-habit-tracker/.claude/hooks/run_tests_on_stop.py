# Runs when Claude says it is finished. We run the tests; if any fail,
# we refuse to let Claude stop so it can fix them.
import json
import os
import subprocess
import sys

data = json.load(sys.stdin)

# LOOP PROTECTION: Claude Code sets "stop_hook_active" to true when Claude is
# already continuing because of this hook. If we blocked again, Claude could
# be stuck forever, so on that second visit we always let it stop.
if data.get("stop_hook_active"):
    sys.exit(0)

# Use the project's own virtual environment's Python if there is one
# (Windows keeps it in Scripts/python.exe, macOS and Linux in bin/python).
project = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
python = sys.executable
for sub in ("Scripts/python.exe", "bin/python"):
    candidate = os.path.join(project, ".venv", sub)
    if os.path.exists(candidate):
        python = candidate

# Run the tests and capture everything they print.
result = subprocess.run([python, "-m", "pytest", "-q"], cwd=project,
                        capture_output=True, text=True)

# pytest exits with 0 when all tests pass. Anything else means a problem,
# so we send Claude back to work and show it the last part of the output.
if result.returncode != 0:
    print(json.dumps({
        "decision": "block",
        "reason": "Tests failed. Fix these before finishing:\n\n" + result.stdout[-5000:],
    }))
# If we print nothing, Claude is allowed to stop.
