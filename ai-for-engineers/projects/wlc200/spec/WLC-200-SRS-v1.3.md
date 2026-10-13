# WLC-200 Smart Window-Lift Controller: System Requirements Specification

Document: ADS-WLC200-SRS, version 1.3, 2 October 2026
Owner: Systems Engineering, Ardent Drive Systems (fictional)
Status: Released for design review
Changes from 1.2: customer change request CR-0412 (pinch force and reversal), CAN cycle time, review findings

## 1. Scope

The WLC-200 controls one electric window in a passenger-car door. It drives a 12 V DC motor through an H-bridge, reads the door switch, measures window position with a Hall sensor on the motor, detects pinching while closing, and communicates with the body controller over CAN.

## 2. Definitions

- **Fully closed:** window position 0 mm (top seal).
- **Fully open:** window position 480 mm.
- **Pinch zone:** window positions from 4 mm to 200 mm while closing.
- **Manual mode:** the window moves only while the switch is held.
- **Express mode:** a short press moves the window to the end position without holding the switch.
- **Normalized:** the controller knows the absolute window position.

## 3. Requirements

### 3.1 Power supply

- **WLC-001** The controller shall operate with full function at supply voltages from 9.0 V to 16.0 V.
- **WLC-002** Between 6.0 V and 9.0 V, the controller shall operate in manual mode only and shall disable express mode.
- **WLC-003** Below 6.0 V, the controller shall stop the motor within 50 ms.
- **WLC-004** In sleep mode, the controller shall draw less than 100 µA from the 12 V supply.
- **WLC-005** The controller shall withstand reverse battery polarity of -14 V for 60 s without damage.

### 3.2 Window movement

- **WLC-006** In manual mode, the window shall move while the switch is held and stop within 100 ms of switch release.
- **WLC-007** After ignition off, the controller shall allow window movement for 60 s or until a front door is opened, whichever comes first.
- **WLC-008** A switch press shorter than 300 ms shall start express mode in the pressed direction.
- **WLC-009** In express mode, a second press of the switch in either direction shall stop the window within 100 ms.
- **WLC-010** The window shall move from fully open to fully closed in 3.0 s to 4.5 s at 13.5 V and 23 °C.
- **WLC-011** The motor shall be stopped when the window reaches the end position.
- **WLC-012** When the body controller sends the CAN request WLC_CloseAll, the controller shall close the window in express mode, with anti-pinch protection active.
- **WLC-013** Express close shall be available only when the controller is normalized.

### 3.3 Anti-pinch protection

- **WLC-014** While closing in the pinch zone, the controller shall detect a pinch when the pinch force exceeds 80 N.
- **WLC-015** On a detected pinch, the controller shall stop the motor within 10 ms and reverse the window by at least 150 mm or to fully open, whichever is less.
- **WLC-016** Anti-pinch protection shall be active in manual mode and in express mode.
- **WLC-017** Anti-pinch protection shall be disabled when the controller is not normalized.
- **WLC-039** After a pinch reversal, express close shall be inhibited for 2 s.
- **WLC-019** After three pinch detections within 30 s, the controller shall allow closing only in manual mode for the next 60 s.

### 3.4 Position and normalization

- **WLC-020** The controller shall determine window position from Hall sensor pulses with a resolution of 0.5 mm or better.
- **WLC-021** After a supply interruption longer than 500 ms, the controller shall set itself to not normalized.
- **WLC-022** The controller shall normalize when the window is held fully closed against the seal for 1 s in manual mode.

### 3.5 Thermal protection

- **WLC-024** The controller shall estimate motor temperature with a thermal model.
- **WLC-025** When the estimated motor temperature exceeds 130 °C, the controller shall limit motor current to 15 A.
- **WLC-026** When the estimated motor temperature exceeds 140 °C, the controller shall block opening and allow closing only.
- **WLC-027** Thermal blocking shall end when the estimated motor temperature falls below 120 °C.

### 3.6 Communication and diagnostics

- **WLC-028** The controller shall send the CAN message WLC_Status every 50 ms ± 5 ms with window position, movement state, normalization state and fault state.
- **WLC-029** The controller shall store diagnostic trouble code B1A01 when the Hall sensor signal is missing for more than 200 ms while the motor is driven, and shall stop the motor.
- **WLC-030** The controller shall store diagnostic trouble code B1A02 when motor current exceeds 25 A for more than 50 ms.
- **WLC-037** When diagnostic trouble code B1A02 is stored, the controller shall stop the motor.
- **WLC-038** When diagnostic trouble code B1A02 is stored, the controller shall set the fault state in WLC_Status.
- **WLC-031** The controller shall respond to a diagnostic request within 50 ms.

### 3.7 General

- **WLC-035** The controller shall operate at ambient temperatures from -40 °C to 85 °C.
- **WLC-036** The controller shall wake from sleep mode within 100 ms of a switch press.
