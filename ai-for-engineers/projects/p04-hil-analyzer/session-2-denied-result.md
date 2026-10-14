I haven't written `analyze_hil.py` yet, because I can't run anything in this session. Bash was denied ("don't ask" mode), and you asked me to run the script and check its output against the raw data before finishing.

**What I've done:**
- I read the manifest, the limits, the bench guide, TP-AP-01 and TP-TH-01.
- I looked at the first rows of R01, R07 and R10.
- I haven't looked at the event regions of any log. Without a shell I can't search the CSVs, and reading every log by hand isn't practical.

**What I noted from the docs so far:**
- **Force sensor:** it reads up to ±0.5 N with no load, so values below 1 N shouldn't count as contact. The 80 N threshold comes from the limits file, not a hard-coded number.
- **Stop latency (anti-pinch):** it runs from the first sample above 80 N to the first later sample where `motor_cmd` is no longer close (+1). I'd use the log's own time column, which matters for any first-run offset.
- **Reversal (anti-pinch):** it is the final position minus the lowest position before `motor_cmd` first becomes -1. A reversal to fully open also counts as a pass.
- **Peak force (anti-pinch):** I'd report it as an anomaly above 100 N.
- **TC-AP-06:** the test position is 20 mm instead of 100 mm.
- **Thermal run (R10):**
  - Its 10 ms sampling means timing can't be evaluated.
  - The thermal log starts at about 110 °C, so I can't check that "opening is possible again below 120 °C".
  - Checks I can do: current at or below 15 A while the temperature is above 130 °C, and no opening movement starting above 140 °C.

**How to proceed:** Please either allow Bash (at least `python` and read-only commands such as `head`, `grep` and `wc`), or tell me you'd rather I write the script blind. If I write it blind, I'll mark it clearly as untested and I can't check its results against the raw data.
