"""The fictional WLC-200 defect reports and an engineer's labels.

Writes defects/defects.json (what the triage tool reads) and
labels/defect-labels.json (what it is graded against).
Severity: S1 a person could be hurt; S2 a function is lost;
S3 a function is degraded or has a workaround; S4 cosmetic or documentation.
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent

# id, date, reporter, found_in, title, description, component, severity, duplicate_of
D = [
 ("DR-1001", "2026-09-02", "Priya Raman", "HIL-2", "Pinch reversal late at -30 °C",
  "TC-AP-04 at 9.0 V and -30 °C: motor stopped 13 ms after the pinch force passed 100 N. Limit is 10 ms. Passed at 23 °C.",
  "anti_pinch", "S1", None),
 ("DR-1002", "2026-09-03", "Tomas Lindqvist", "Vehicle test", "Window does not move after ignition off",
  "Car parked, ignition off, pressed the switch after about 50 s: nothing happens. Spec says 60 s?",
  "power", "S3", None),
 ("DR-1003", "2026-09-04", "Mei Chen", "HIL-2", "WLC_Status period jitter",
  "WLC_Status measured at 97 to 104 ms. Within 100 ms ± 10 ms. Logging for information only.",
  "can_comm", "S4", None),
 ("DR-1004", "2026-09-05", "Daniel Okafor", "Vehicle test", "Express up stops halfway in cold",
  "Morning test, about -20 °C. Express close stopped at around 150 mm and reversed. Nothing in the window. Second try worked.",
  "anti_pinch", "S2", None),
 ("DR-1005", "2026-09-05", "Priya Raman", "Code review", "Typo in DTC table comment",
  "The comment above the DTC table says B1A10 instead of B1A01. Code is correct.",
  "diagnostics", "S4", None),
 ("DR-1006", "2026-09-08", "Lena Hofmann", "HIL-2", "Late stop on pinch when cold",
  "Anti-pinch run at -30 °C, low supply: stop came after 14 ms. Same setup at 85 °C fine.",
  "anti_pinch", "S1", "DR-1001"),
 ("DR-1007", "2026-09-08", "Arjun Mehta", "Bench", "Sleep current 140 µA",
  "Sleep current measured 140 µA after 60 s. Limit 100 µA. CAN transceiver seems to stay in standby, not sleep.",
  "power", "S3", None),
 ("DR-1008", "2026-09-09", "Tomas Lindqvist", "Vehicle test", "False reversal on rough road",
  "Driving over cobblestones while closing the window: window reversed by itself. Happened twice in 10 tries.",
  "anti_pinch", "S2", None),
 ("DR-1009", "2026-09-10", "Mei Chen", "HIL-2", "B1A02 not stored on overcurrent",
  "Injected 27 A for 100 ms. Motor stopped, but no B1A02 in memory and the fault state stays 0.",
  "diagnostics", "S2", None),
 ("DR-1010", "2026-09-10", "Sofia Rossi", "Customer clinic", "Switch feels slow",
  "Two clinic drivers said the window reacts late when they press the switch. No measurement.",
  "switch_input", "S4", None),
 ("DR-1011", "2026-09-11", "Daniel Okafor", "Vehicle test", "Auto-up reverses in cold weather without obstacle",
  "Cold morning again (-18 °C). Window went up, stopped and went down. No hand or object in the way.",
  "anti_pinch", "S2", "DR-1004"),
 ("DR-1012", "2026-09-12", "Lena Hofmann", "HIL-2", "Opening possible above 140 °C",
  "Thermal test TC-TH-03: after the model passed 140 °C, one open request still moved the window. The next one was refused.",
  "thermal", "S3", None),
 ("DR-1013", "2026-09-12", "Arjun Mehta", "HIL-2", "Position drift after 200 cycles",
  "After 200 open-close cycles the reported position at the top seal is 3.5 mm instead of 0 mm.",
  "position", "S3", None),
 ("DR-1014", "2026-09-15", "Priya Raman", "HIL-2", "Window keeps moving 180 ms after switch release",
  "Manual close at 16 V: motor command stays on for 180 ms after release. Limit 100 ms. At 13.5 V it is 60 ms.",
  "switch_input", "S3", None),
 ("DR-1015", "2026-09-15", "Tomas Lindqvist", "Vehicle test", "Retained power too short",
  "After switching off the engine the window only works for about 45 seconds, should be 60.",
  "power", "S3", "DR-1002"),
 ("DR-1016", "2026-09-16", "Mei Chen", "HIL-2", "Missing WLC_Status frame during diagnostic requests",
  "While running TC-DG-03 (100 diagnostic requests), one WLC_Status frame was missing: 200 ms between two frames instead of 100 ms.",
  "can_comm", "S3", None),
 ("DR-1017", "2026-09-16", "Sofia Rossi", "Document review", "User manual shows wrong switch symbol",
  "Draft owner's manual page 14 shows the switch symbol upside down.",
  "switch_input", "S4", None),
 ("DR-1018", "2026-09-17", "Arjun Mehta", "HIL-2", "Hall sensor loss: motor keeps running",
  "Disconnected the Hall signal while closing at 9 V. Motor ran for 1.2 s until the end stop. No DTC.",
  "diagnostics", "S1", None),
 ("DR-1019", "2026-09-18", "Lena Hofmann", "HIL-2", "Thermal block lets one opening through",
  "Same as seen last week? Estimated temperature 143 °C and the window still opened once.",
  "thermal", "S3", "DR-1012"),
 ("DR-1020", "2026-09-18", "Daniel Okafor", "Vehicle test", "Express close works when not normalized",
  "After disconnecting the battery, a short press up closed the window fully. Express close should not be available until normalized.",
  "position", "S1", None),
 ("DR-1021", "2026-09-19", "Priya Raman", "Code review", "Unused variable in thermal model",
  "Variable t_prev in thermal_model.c is never read. Compiler warning.",
  "thermal", "S4", None),
 ("DR-1022", "2026-09-22", "Mei Chen", "HIL-2", "Diagnostic response 62 ms",
  "3 of 100 diagnostic requests answered after 55 to 62 ms. Limit 50 ms. Happens while the motor starts.",
  "diagnostics", "S3", None),
 ("DR-1023", "2026-09-22", "Tomas Lindqvist", "Vehicle test", "Window reversed over cobbles",
  "Cobblestone road, closing: unexpected reversal, nothing trapped.",
  "anti_pinch", "S2", "DR-1008"),
 ("DR-1024", "2026-09-23", "Arjun Mehta", "Bench", "Reverse polarity: controller dead",
  "Applied -14 V for 60 s. Afterwards the controller does not wake up. Protection diode D3 is open.",
  "power", "S2", None),
 ("DR-1025", "2026-09-24", "Lena Hofmann", "HIL-2", "Undervoltage stop 21 ms",
  "Supply drop to 5.5 V: motor stopped after 21 ms. Within the 50 ms limit. For information.",
  "power", "S4", None),
 ("DR-1026", "2026-09-25", "Sofia Rossi", "Customer clinic", "Window closes too hard on the seal",
  "Clinic drivers hear a loud knock when the window reaches the top. No damage seen.",
  "motor_drive", "S4", None),
 ("DR-1027", "2026-09-28", "Daniel Okafor", "Vehicle test", "No DTC when Hall connector unplugged",
  "Pulled the Hall sensor connector during auto-up. Window ran into the seal and kept pushing. Nothing stored in fault memory.",
  "diagnostics", "S1", "DR-1018"),
 ("DR-1028", "2026-09-29", "Priya Raman", "HIL-2", "Inrush current 14 A at 16 V",
  "Start current 14 A for 40 ms at 16 V. No limit in the spec, so not a failure. Proposing a requirement.",
  "motor_drive", "S4", None),
 ("DR-1029", "2026-09-30", "Mei Chen", "HIL-2", "Fault state not set for overcurrent",
  "TC-DG-02: after overcurrent the motor stops but WLC_Status fault state stays 0 and fault memory is empty.",
  "diagnostics", "S2", "DR-1009"),
 ("DR-1030", "2026-10-03", "Arjun Mehta", "HIL-2", "Pinch reversal only 146 mm at 85 °C",
  "TC-AP-05 at 85 °C: reversal 146 mm. v1.3 limit is 150 mm. Passed at 23 °C with 162 mm.",
  "anti_pinch", "S2", None),
]

defects = [dict(id=i, date=d, reporter=r, found_in=f, title=t, description=x)
           for i, d, r, f, t, x, *_ in D]
labels = {i: {"component": c, "severity": s, "duplicate_of": dup}
          for i, *_, c, s, dup in D}
(HERE / "defects").mkdir(exist_ok=True)
(HERE / "defects" / "defects.json").write_text(json.dumps(defects, indent=1, ensure_ascii=False) + "\n")
(HERE / "labels" / "defect-labels.json").write_text(json.dumps(labels, indent=1) + "\n")
print(len(defects), "defects,", sum(1 for v in labels.values() if v["duplicate_of"]), "duplicates")
