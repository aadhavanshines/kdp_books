# LL-2024-09: Lost Status Frames During Diagnostic Sessions (WLC-100)

Product: WLC-100
Date closed: 18 December 2024
Owner: Communication software team

## What happened

The body controller logged missing status frames from the window controller, but only in the service workshop. Gaps of about 100 to 150 ms.

## Root cause

During a diagnostic session, long diagnostic responses filled the CAN transmit queue. A status frame due at that moment was dropped instead of being delayed.

## What we changed

1. The transmit queue was enlarged, and status frames got their own transmit buffer.
2. A HIL test that records the status frame timing while diagnostic requests are sent.

## Lesson for new programs

Test periodic frames under the worst bus load, including diagnostic sessions, not only on a quiet bus. When the cycle time gets shorter (for example from 100 ms to 50 ms), repeat the worst-case queue calculation.
