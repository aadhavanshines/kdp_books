I changed the "fully open" check in `analyze_hil.py` to use the 480 mm definition. The edge case now fails, and the 2026-10-06 results are the same as before.

- **Fix:** I added a constant `FULLY_OPEN_MM = 480` and `test_anti_pinch` now compares the final position to it, where it used to compare to the starting position. I updated the comment above that check to match.
- **Edge case:** `edge/short-reversal` now gives FAIL: reversal 60 mm against a minimum of 150 mm. It wrote `edge/result.json`.
- **data/2026-10-06:** I ran it before and after the change and the output JSON files are identical. The result is still 9 PASS and 3 FAIL, with the same failures as before (R04, R09, R10). The before and after copies are in the scratchpad, not in the project.
