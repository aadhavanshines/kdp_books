A reviewer checked results.json against a hand measurement. One finding:
run R08 (TC-MV-01) has two switch releases, first after closing and then
after opening, but analyze_hil.py measures only the first. Change the
TC-MV-01 analysis so it finds every release in the log, reports each one
(for example {"close": 62, "open": 58}, named by the direction the window
was moving) and judges the run on all of them. Rerun the script and check
the new numbers against the raw data. Don't change the other analyses.

You can run python3 commands (including python3 -c) and ls, head and wc,
one command at a time. Other shell commands are blocked.
