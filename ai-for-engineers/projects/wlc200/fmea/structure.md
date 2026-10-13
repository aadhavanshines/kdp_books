# WLC-200 Design FMEA: Structure and Functions

Document: ADS-WLC200-DFMEA-IN, version 0.3, 5 October 2026 (fictional)
Scope: the WLC-200 controller and its software, as specified in ADS-WLC200-SRS v1.3. The motor, the window regulator and the door are outside the scope; their interfaces are inside it.

## System elements

| Element | Description |
| --- | --- |
| Supply monitor | Measures the 12 V supply; decides full function, manual-only or motor stop (WLC-001 to WLC-003) |
| Switch input | Reads the door switch; tells short presses from held presses (WLC-006, WLC-008, WLC-009) |
| Motor driver | H-bridge, current measurement, end-stop detection (WLC-010, WLC-011) |
| Position counter | Counts Hall pulses; keeps the normalization state (WLC-013, WLC-020 to WLC-022) |
| Anti-pinch algorithm | Estimates pinch force from motor speed and current; stops and reverses (WLC-014 to WLC-017, WLC-019, WLC-039) |
| Thermal model | Estimates motor temperature; limits current, blocks opening (WLC-024 to WLC-027) |
| CAN interface | Sends WLC_Status; receives WLC_CloseAll and diagnostic requests (WLC-012, WLC-028, WLC-031) |
| Diagnostics | Detects Hall loss and overcurrent; stores DTCs (WLC-029, WLC-030, WLC-037, WLC-038) |

## Functions to analyse

1. Move the window as the driver commands, in manual and express mode.
2. Stop the window at the end positions.
3. Detect a pinch in the pinch zone and reverse the window.
4. Keep track of window position.
5. Protect the motor from overheating.
6. Report status and faults to the body controller.
7. Behave safely at low and high supply voltage.

## Existing controls (from the WLC-100 predecessor)

| Control | Type | Covers |
| --- | --- | --- |
| Anti-pinch HIL tests at 9, 13.5 and 16 V, -30, 23 and 85 °C (TP-AP-01) | Detection | Pinch detection, stop time, reversal |
| Rough-road vibration HIL profile | Detection | False pinch detection |
| Speed-ripple filter with 30 ms debounce (from LL-2021-07) | Prevention | False pinch detection |
| Hall signal plausibility check, 200 ms timeout | Detection (in the product) | Position loss |
| Thermal model reviewed against thermocouple data (TP-TH-01) | Detection | Thermal model error |
| CAN transmit queue sized for the worst-case bus load (from LL-2024-09) | Prevention | Lost WLC_Status frames |
| Code review and static analysis | Detection | Software faults in general |

## Field and test history to consider

- WLC-100 field returns: Hall connector corrosion (LL-2023-05), false reversals on rough roads (LL-2021-07).
- WLC-200 open defects as of 6 October 2026: see defects.json (late pinch stop when cold, opening above 140 °C, missing CAN frame, Hall loss without DTC at 9 V).
