# TP-TH-01: Thermal Protection Test Procedure (HIL)

Version 2.0, 3 October 2026
Applies to: TC-TH-01 to TC-TH-04

## Set-up

1. Fit a thermocouple to the motor housing (for TC-TH-01 only).
2. Preheat by running open-close cycles until the estimated temperature is about 110 °C. The nightly log starts there to save bench time.

## Procedure

1. Run full open-close cycles at 13.5 V with a 0.5 s pause between movements.
2. Keep cycling after the estimate passes 130 °C and 140 °C.
3. Above 140 °C, request opening twice, then request closing once.
4. For TC-TH-04, stop cycling and request opening every 30 s while the estimate falls.

## Evaluation

- Above 130 °C: motor current never above 15 A, including the stall at the end stop.
- Above 140 °C: no opening movement starts. Closing is still possible.
- Below 120 °C: opening is possible again.

Log sampling is 10 ms for thermal tests. Timing limits of a few milliseconds can't be evaluated from these logs.
