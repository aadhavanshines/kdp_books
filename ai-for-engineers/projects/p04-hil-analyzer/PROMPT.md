Write analyze_hil.py: a pandas script that evaluates one night of HIL bench logs.

Inputs:
- data/2026-10-06/manifest.json lists the runs; each run is a CSV log.
- data/limits-v1.3.json has the pass limits per test case.
- docs/ has the bench guide (log columns, sampling, known bench issues) and
  the test procedures TP-AP-01 and TP-TH-01, which define how each value is
  measured. Follow those definitions exactly.

For each run, measure what its test case needs, compare with the limits, and
give PASS or FAIL with the failed criteria. Tests without a written procedure
(TC-MV-05, TC-MV-01, TC-CAN-01, TC-PW-03, TC-DG-01): measure what the limit
names in the most direct way, and write down the method you chose in a
comment. Also report anomalies a test engineer would want to know about even
when a run passes, such as a value within 2% of its limit.

Usage: python analyze_hil.py data/2026-10-06  -> writes results.json and
prints a table. Never hard-code expected results. Run the script and check
its output against the raw data before you finish.

You can run python3 commands (including python3 -c) and ls, head and wc, one command at a time. Other shell commands are blocked.
