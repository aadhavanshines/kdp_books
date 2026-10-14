`analyze_hil.py` now finds every switch release in the TC-MV-01 log, measures each one, and judges the run on all of them. R08 reports close = 62 ms and open = 58 ms, so it still passes.

The new numbers match the raw R08 log:
- **Close:** the switch goes from 1 to 0 at t=1800 ms. The motor command goes to 0 at t=1862 ms, which is 62 ms later.
- **Open:** the switch goes from -1 to 0 at t=3662 ms. The motor command goes to 0 at t=3720 ms, which is 58 ms later.

Both are under the 100 ms limit.

- **Direction names:** each release is named by the switch value just before it (1 is "close", -1 is "open"). A repeated direction gets a time suffix, such as `close_3000ms`, so none is overwritten.
- **Criteria:** there is now one criterion per release, `stop_after_release_close_ms` and `stop_after_release_open_ms`. The run fails if any of them exceeds the limit or never sees the motor stop.
- **Values:** `t_release_ms`, `t_motor_cmd_zero_ms` and `stop_after_release_ms` in `results.json` are now dicts keyed by direction. Anything reading those fields as single numbers will need updating.

I reran the script. R08 is the only TC-MV-01 run, and the other eleven runs give the same results as before. I didn't compare them field by field, only by status and measured values. The overall count is unchanged: 9 PASS, 3 FAIL (R04, R09, R10). `git diff --stat` shows changes only under `projects/wlc200`, which this edit didn't touch. I haven't checked how `analyze_hil.py` itself shows up in git.
