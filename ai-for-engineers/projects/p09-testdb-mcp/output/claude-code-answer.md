Three tests failed on the night of 2026-10-06.

| Test | Measured | Limit | Open defect |
|---|---|---|---|
| TC-AP-04 | stop latency 14 ms | ≤ 10 ms | **DR-1001**: Pinch reversal late at -30 °C (S1, anti_pinch, opened 2026-09-02) |
| TC-TH-03 | opening started at 143.9 °C | no opening above 140 °C | **DR-1012**: Opening possible above 140 °C (S3, thermal, opened 2026-09-12) |
| TC-CAN-01 | max period 112 ms | 45 to 55 ms | None linked |

- **TC-CAN-01:** No open defect is linked to this test, so this failure may not have been reported yet. I only searched open defects, so a closed or duplicate report could exist.
- **DR-1004:** "Express up stops halfway in cold" (S2, anti_pinch) has no test linked. It might relate to TC-AP-04, but nothing in the database says so.
- **DR-1018:** The Hall-loss defect (S1, linked to TC-DG-01) is still open, but TC-DG-01 passed that night (203 ms, limit 200 to 250). Likewise DR-1014 (linked to TC-MV-01) is open while TC-MV-01 passed at 62 ms. Those two defects may be fixed and awaiting closure, or the tests may not catch them.
