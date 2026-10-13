# LL-2024-01: Thermal Limit Checked Only at Startup (Seat Motor Controller SMC-3)

Product: SMC-3 seat motor controller (a different product, same software platform as WLC-200)
Date closed: 22 February 2024
Owner: Platform software team

## What happened

In endurance testing, a seat motor started a movement at a model temperature 3 °C above its block limit. The next movement was blocked correctly.

## Root cause

The thermal model updated its estimate in a 100 ms task. The block decision read the estimate at the start of a movement, before the task had run with the newest current samples. One movement could start on a stale value.

## What we changed

1. The block decision reads the estimate after the thermal task has run in the same cycle.
2. A test that requests a movement immediately after the estimate crosses the limit.

## Lesson for new programs

Any limit check that uses an estimate must make sure the estimate is current. The platform thermal module is shared by WLC-200; check that the fix is present.
