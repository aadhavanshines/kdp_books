# Appendix D: Glossary

**Adjudication.** A recorded second look at cases where a tool and the labels disagree, deciding which is right. Kept separate from the original labels (Chapter 5).

**Agent.** An AI model that uses tools in a loop to reach a goal, deciding its own next step. Projects 9 and 10 use agent features; most projects use single calls.

**Anti-pinch.** A power-window function that detects a trapped object while closing and stops and reverses the window.

**API (application programming interface).** The way programs call Claude, as opposed to chatting with it.

**ASIL (Automotive Safety Integrity Level).** In ISO 26262, a classification of how much risk reduction a safety requirement needs.

**Automotive SPICE.** A process assessment model for automotive software and system development.

**Boundary value.** A test point just inside or just outside a limit, such as 79 N and 81 N around an 80 N threshold.

**CAN (Controller Area Network).** A vehicle bus over which control units exchange messages, such as the WLC-200's WLC_Status.

**Claude Code.** Anthropic's agent for software work, used in a terminal or editor; it reads and writes files and runs commands.

**Claude Agent SDK.** Anthropic's library for building programs on the same engine as Claude Code. Every project in this book uses it.

**Compound requirement.** A requirement that contains several requirements that should be tested separately.

**Confusion matrix.** A table counting, for each true class, how often a tool chose each class (Chapter 10).

**Defect triage.** Sorting defect reports by component, severity and duplicates.

**DTC (diagnostic trouble code).** A code stored by a control unit when it detects a fault, such as B1A01 for a lost Hall sensor signal.

**Enum.** In a JSON schema, a list of the only values a field may take.

**Express mode.** A short switch press that moves the window to its end position without holding the switch.

**Fact sheet.** The facts a report may state, computed by code and given to Claude, so the text needs no arithmetic (Chapter 9).

**FMEA (failure mode and effects analysis).** A structured analysis of how a product's functions can fail, the effects and causes, and the remaining risk.

**Grader.** A program that scores a tool's output against labels or truth data.

**Hall sensor.** A magnetic sensor on the motor that produces pulses as it turns; the WLC-200 counts them to know the window position.

**HIL (hardware-in-the-loop).** Testing a real control unit connected to a simulated or partly real environment, such as bench HIL-2.

**Labels.** An engineer's answers for a set of test cases, written before the tool, used by the grader. Also called truth data.

**MCP (Model Context Protocol).** An open standard for connecting AI applications to tools and data, used in Chapter 14.

**Normalized.** In the WLC-200, the state in which the controller knows the absolute window position.

**Occurrence (O), Detection (D), Severity (S).** The three FMEA ratings: how likely the cause is, how likely testing is to find it, and how bad the effect is.

**Pinch zone.** The window positions in which anti-pinch must work, 4 mm to 200 mm on the WLC-200.

**Precision.** Of the items a tool flagged, the fraction that were really problems.

**Prompt injection.** Text in a document that tries to make the model follow it as an instruction.

**Recall.** Of the real problems, the fraction the tool found.

**RPN (risk priority number).** Severity × occurrence × detection; a rough ranking of FMEA rows, computed by code in this book.

**Schema (JSON schema).** A description of the fields and types an answer must have; the SDK makes Claude's answer match it.

**System prompt.** The instructions that set Claude's role and rules for a task.

**Token.** A unit of text for pricing and limits, roughly three-quarters of an English word.

**Tool qualification.** Showing that a development tool can be trusted for its use in a safety-related project, in proportion to its possible impact.

**Traceability.** Links between requirements, tests and results, showing that each requirement is verified.

**Truth data.** See labels.

**V-model.** A development model in which each design level on one side is verified by a test level on the other.

**WLC-200.** The fictional window-lift controller used throughout this book.
