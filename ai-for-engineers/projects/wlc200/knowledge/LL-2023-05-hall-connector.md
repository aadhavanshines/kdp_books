# LL-2023-05: Hall Sensor Connector Corrosion (WLC-100)

Product: WLC-100
Date closed: 30 November 2023
Owner: Hardware team

## What happened

Field returns from coastal markets: windows that drove into the seal and kept pushing until the thermal protection stopped them. 12 returns in one year. All had corroded Hall sensor connector pins.

## Root cause

When the Hall signal was lost, the software kept the motor running until a 1 s timeout. The connector had no sealing.

## What we changed

1. Hall signal timeout reduced from 1 s to 200 ms, with DTC B1A01 and motor stop (this became WLC-029 in WLC-200).
2. Sealed connector from the next model year.
3. A HIL test that disconnects the Hall signal while the motor runs, at 9 V and at 13.5 V. The 9 V case matters: at low speed the pulses are slow, and a timer that restarts on noise can hide the loss.

## Lesson for new programs

Every sensor needs a plausibility check with a timeout, and a test that removes the sensor while the actuator runs, at the lowest supply voltage.
