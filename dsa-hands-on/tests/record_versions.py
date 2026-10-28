"""Run code/ch33/suite.py with every Python version and save the results
to code/ch33/versions.json, which chart_versions.py turns into the table
and chart printed in Chapter 33. The versions take turns, in PASSES
passes, and each test keeps its fastest time for each version, so a
burst of background activity can't favor one version.

Usage: python tests/record_versions.py
"""

import json
import shutil
import subprocess
import tempfile
from pathlib import Path

from run_listings import CODE, PYTHONS, env_for

PASSES = 3


def run_suite(version):
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp) / "ch33"
        shutil.copytree(CODE / "ch33", work)
        p = subprocess.run(
            [PYTHONS[version], "suite.py", "--json"],
            cwd=work,
            capture_output=True,
            text=True,
            env=env_for(),
            check=True,
        )
    return json.loads(p.stdout)


results = {}
for attempt in range(PASSES):
    for version in sorted(PYTHONS):
        times = run_suite(version)
        best = results.setdefault(version, times)
        for test, seconds in times.items():
            best[test] = min(best[test], seconds)
        print(f"pass {attempt + 1}, Python {version}: done", flush=True)
path = CODE / "ch33" / "versions.json"
path.write_text(json.dumps(results, indent=2) + "\n")
