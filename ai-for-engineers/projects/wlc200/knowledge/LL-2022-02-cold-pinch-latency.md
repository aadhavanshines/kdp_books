# LL-2022-02: Slow Pinch Stop at Low Temperature (WLC-100)

Product: WLC-100
Date closed: 9 September 2022
Owner: Validation team

## What happened

During winter testing, the stop time after a pinch was 12 to 15 ms at -30 °C and 9 V. The limit was 10 ms. At 23 °C it was 5 to 7 ms.

## Root cause

Cold grease in the window regulator slowed the window. At lower speed, the force rose more slowly, and the algorithm, which sampled the motor speed every 4 ms, needed two extra samples to confirm the pinch. Low supply voltage slowed the motor further.

## What we changed

1. Speed sampling every 2 ms below 0 °C.
2. Anti-pinch HIL tests became mandatory at the corner case of -30 °C and 9 V. Before this, the cold test ran at 13.5 V only.
3. The thermal chamber on bench HIL-2 was calibrated to hold -30 °C within ±1 °C.

## Lesson for new programs

The worst case for pinch stop time is cold and low voltage together. Test that corner on every software release, not only at the end of the program.
