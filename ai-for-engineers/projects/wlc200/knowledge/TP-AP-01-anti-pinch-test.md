# TP-AP-01: Anti-Pinch Test Procedure (HIL)

Version 3.1, 3 October 2026 (updated for SRS v1.3)
Applies to: TC-AP-01 to TC-AP-06, TC-AP-10

## Equipment

- Bench HIL-2 with the window regulator rig and the pinch rod (spring rate 10 N/mm, force sensor sampled every 1 ms).
- Thermal chamber, for -30 °C and 85 °C.
- Programmable supply, 9.0 V to 16.0 V.

## Set-up

1. Normalize the controller: hold the switch up against the seal for at least 1.2 s.
2. Soak the controller and the rig at the test temperature for at least 30 minutes.
3. Place the pinch rod at the test position: 100 mm for TC-AP-01 to TC-AP-05; 20 mm for TC-AP-06.

## Procedure

1. Open the window to 300 mm.
2. Close in the mode the test case asks for (express: 200 ms press; manual: hold the switch).
3. Record the log until the window has stopped after the reversal, plus 300 ms.

## Evaluation

- **Stop latency:** from the first sample where the pinch force is above 80 N to the first later sample where the motor command is no longer 'close'. Limit: 10 ms.
- **Reversal:** the final position minus the lowest position before the motor command first becomes 'open'. Limit: at least 150 mm, or to fully open.
- **Peak force:** the highest pinch force sample. Record it; there is no limit in SRS v1.3, but report it if it is above 100 N.

Repeat each test three times on release candidates; one run is enough for nightly regression.
