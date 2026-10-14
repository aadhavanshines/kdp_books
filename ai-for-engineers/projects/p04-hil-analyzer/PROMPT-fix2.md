A code review of analyze_hil.py found a problem in the TC-AP anti-pinch
evaluation. The reversal passes if the window "ended fully open", and the
code takes fully open to mean the position at the start of the log. The
specification defines fully open as 480 mm (see docs/WLC-200-definitions.md,
which you didn't have before).

edge/short-reversal/ holds a test log for this case: the window starts at
150 mm and reverses only 60 mm. It must FAIL, and the analyzer passes it:
  python3 analyze_hil.py edge/short-reversal --limits edge/limits-v1.3.json --out edge/result.json

Fix the evaluation so "fully open" uses the definition, check the edge case
now fails, and rerun data/2026-10-06 to check that no other result changed.
Change nothing else.

You can run python3 commands (including python3 -c) and ls, head and wc,
one command at a time. Other shell commands are blocked.
