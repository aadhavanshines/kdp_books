# LL-2021-07: False Pinch Reversals on Rough Roads (WLC-100)

Product: WLC-100 window-lift controller (predecessor of WLC-200)
Date closed: 14 March 2022
Owner: Anti-pinch software team

## What happened

Field reports from two vehicle programs: the window reversed by itself while closing on cobblestone roads. 37 warranty claims in the first six months. No injuries, but customers could not close the window on rough roads.

## Root cause

Body vibration made the motor speed oscillate. The anti-pinch algorithm read the speed drops as a rising pinch force. Our HIL tests used a smooth road profile only, so the problem was never seen before production.

## What we changed

1. A speed-ripple filter on the motor speed signal, with a 30 ms debounce before a pinch is confirmed.
2. A rough-road vibration profile added to the HIL bench (profile file RR-04, cobblestone at 30 km/h).
3. The debounce starts when the estimated force begins to rise, well below the threshold, so the stop still came within 10 ms of the force crossing the threshold. This margin must be checked again whenever the threshold or the debounce changes.

## Lesson for new programs

Test anti-pinch with vibration from the start. Any change to the force threshold, the debounce or the motor needs a new check of both false reversals and stop time.
