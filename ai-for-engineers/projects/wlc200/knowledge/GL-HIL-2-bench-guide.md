# GL-HIL-2: Bench HIL-2 User Guide

Version 5, 1 September 2026

## What the bench does

HIL-2 runs the WLC-200 controller with a real window regulator rig, a programmable supply, a pinch rod and a CAN interface. A nightly job runs the regression list against the latest software build and writes one CSV log per run.

## Log columns

time_ms, supply_v, switch, motor_cmd, current_a, position_mm, pinch_force_n, temp_est_c, can_tx, dtc. The switch is 1 for up (close), -1 for down (open), 0 for released. The motor command uses the same signs. can_tx is 1 in the sample where a WLC_Status frame was sent. dtc holds a trouble code in the sample where it was stored.

## Sampling

1 ms for all tests except the thermal tests, which use 10 ms. Position comes from the controller's Hall counter, in steps of 0.5 mm.

## Calibration

- Pinch rod force sensor: calibrated 15 August 2026, next due 15 February 2027. Accuracy ±1 N.
- Supply: calibrated 2 June 2026, next due 2 December 2026.
- Thermal chamber: calibrated 20 July 2026, next due 20 January 2027.

## Known bench issues

- The force sensor reads up to ±0.5 N with no load. Don't treat values below 1 N as contact.
- After a bench restart, the first run of the night can start 50 ms late. This doesn't affect the results.
