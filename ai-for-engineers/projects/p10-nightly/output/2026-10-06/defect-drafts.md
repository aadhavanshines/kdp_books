# Defect drafts and updates (for an engineer to review)

## TC-AP-04: already covered by DR-1001

Add run R04 on 2.4.0-rc3 (2026-10-06): stop latency 14 ms against the 10 ms limit, which is worse than the 13 ms in the report. Reversal distance was 158 mm (limit min 150 mm, OK). The temperature estimate at start was -22 °C with the chamber set to -30 °C, so the soak may not have been complete or the estimate may be offset. Also link LL-2022-02-cold-pinch-latency.

## TC-CAN-01: NEW DRAFT, WLC_Status period reaches 112 ms in TC-CAN-01 (limit 45–55 ms), frame probably skipped

Suggested component: can_comm; suggested severity: S3
Related: DR-1016, LL-2024-09-can-frame-loss

Run R09, test TC-CAN-01, software 2.4.0-rc3, night 2026-10-06. Measured: maximum frame period 112 ms between t=6383 ms and t=6495 ms, against the limit of 45–55 ms (period_max_ms failed). Minimum period was 49 ms, within limits. The log suggests a frame was probably skipped. The facts do not state the voltage or temperature for this run. No open defect covers TC-CAN-01. DR-1016 is a similar symptom (missing WLC_Status frame, 200 ms instead of 100 ms) but was seen during TC-DG-03 diagnostic requests, so it is related and not the same.

## TC-TH-03: already covered by DR-1012

Add run R10 on 2.4.0-rc3 (2026-10-06): opening started at 143.9 °C (t=57050 ms) and the controller completed full opening travel above 140 °C with no inhibit, which is worse than the single movement in the report. Also add that current exceeded the 15 A limit (peak 15.16 A, 13 samples, first at 134.0 °C, t=39110 ms) while the estimate was above 130 °C, with end-stop stalls. Closing above 140 °C was possible (2 movements, OK). The log starts at about 112 °C and was never cooled, so 'opening possible below 120 °C' is not covered. Link LL-2024-01-thermal-check.
