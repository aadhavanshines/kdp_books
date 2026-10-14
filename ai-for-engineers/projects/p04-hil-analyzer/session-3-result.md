`analyze_hil.py` is written and I ran it on `data/2026-10-06`. It writes `results.json` and prints a table. 9 runs pass and 3 fail (R04, R09, R10).

I checked the figures against the raw CSVs by hand: the anti-pinch latencies and reversals, the R07 close time, the R09 CAN gap, the R10 end-stop currents and opening starts, the R11 brown-out timing and the R12 Hall-loss timing.

| Run | Test | Result | Key numbers |
|---|---|---|---|
| R01 | TC-AP-01 | PASS | latency 6 ms, reversal 162 mm |
| R02 | TC-AP-02 | PASS | 7 ms, 160 mm |
| R03 | TC-AP-03 | PASS | 4 ms, 163 mm |
| R04 | TC-AP-04 | **FAIL** | stop latency 14 ms (limit 10 ms), reversal 158 mm |
| R05 | TC-AP-05 | PASS | 6 ms, 151 mm |
| R06 | TC-AP-06 | PASS | 5 ms, 161 mm |
| R07 | TC-MV-05 | PASS | close time 3.82 s |
| R08 | TC-MV-01 | PASS | stop 62 ms after release |
| R09 | TC-CAN-01 | **FAIL** | a 112 ms gap between frames at t=6383 and t=6495 ms (limit 45–55 ms); a frame was probably skipped |
| R10 | TC-TH-03 | **FAIL** | current reached 15.16 A above 130 °C (limit 15 A); an opening movement started at 143.9 °C, above the 140 °C limit |
| R11 | TC-PW-03 | PASS | stop 21 ms after the supply fell below 6 V |
| R12 | TC-DG-01 | PASS | DTC B1A01, stop 203 ms after Hall loss |

Anomalies it reports, including on passing runs:
- **R05:** reversal is 151 mm, 1 mm above the 150 mm limit.
- **R12:** the 203 ms stop is 3 ms above the 200 ms minimum. The Hall counter updates every 4 ms, so the true latency is somewhere between 199 and 203 ms. I scored it PASS using the last Hall count change as the Hall-loss time, but a test engineer should look at this one.
- **R10:** several end-stop stalls sit at about 15.0 A, right on the limit. The log only starts at about 112 °C, so "opening possible below 120 °C" is not covered by this run.
- **R04 and R05:** the temperature estimate at the start (−22 °C and 93 °C) is well off the chamber setting (−30 °C and 85 °C). Either the soak was incomplete or the estimate is offset.
- **R07:** the end-stop stall reaches 18.1 A for 42 ms. This test has no current limit, so I only noted it.

For the five tests without a written procedure, the method is in a comment above each function in the script:
- **TC-MV-05:** time from the first "close" command to the position reaching 0 mm.
- **TC-MV-01:** time from the switch release to the first motor command of 0.
- **TC-CAN-01:** differences between consecutive `can_tx` samples, checking both the shortest and the longest.
- **TC-PW-03:** time from the first supply sample below 6.0 V to the first motor command of 0.
- **TC-DG-01:** time from the last Hall count change to the first motor command of 0, plus a check that the DTC code is B1A01.

The script finds the limits file at `data/limits-v1.3.json`, next to the night folder. It reads all limits from that file and hard-codes no expected results.
