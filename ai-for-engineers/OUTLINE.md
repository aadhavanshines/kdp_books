# AI for Engineers: Outline

**Title:** AI for Engineers
**Subtitle:** Automate Product Development and Validation with Claude: Requirements, Test Cases, FMEA, Test Logs and Reports, from Your First Prompt to Production Tools
**Audience:** engineers and engineering managers in product development, validation, quality and test (automotive first, but the methods apply to any regulated hardware or embedded product). Basic Python helps; Part I needs none.
**Promise:** use AI on real engineering work without losing traceability, rigour or confidentiality, and prove every result with checks a reviewer would accept.

## The running example (all fictional)

**Ardent Drive Systems**, a tier-1 supplier, is developing **WLC-200**, a smart window-lift controller for a passenger car: motor control, auto up/down, anti-pinch (reverse within a set force), thermal protection, CAN messages and diagnostic trouble codes. The book creates its whole engineering record: a requirements specification (two versions), test cases, HIL bench logs, an FMEA, defect reports, lessons learned and a test database. No real company's data, document or standard text is used.

## Part I: Foundations (no code needed)

1. Why AI Belongs in Engineering, and Where It Doesn't
2. Claude for Engineers: Chat, Projects, Claude Code and the API
3. Confidentiality, IP and Company Rules: What You May Send to an AI
4. Prompting for Engineering Work: Precision, Context and Verification

## Part II: The Requirements-to-Test Chain

5. Project 1: Requirements Reviewer (ambiguity, testability, conflicts; graded against an engineer's labels)
6. Project 2: Test Case Generator with Traceability (coverage checked by code)
7. Project 3: Spec Change Impact Analyzer (version 1.2 to 1.3: which requirements changed, which tests must rerun)

## Part III: Test Data and Results

8. Project 4: HIL Test Log Analyzer (pass/fail and anomalies, every number recomputed with pandas)
9. Project 5: Test Report Writer (Word report with charts, figures checked against the data)
10. Project 6: Defect Triage (duplicates, severity, component, with a confusion matrix)

## Part IV: Safety and Knowledge

11. Project 7: FMEA Assistant (draft failure modes; ratings and action priority computed by code; engineer approval)
12. Project 8: Engineering Knowledge Assistant (lessons learned and test procedures, every answer quoted and verified)
13. Working With Standards Responsibly (ISO 26262, ASPICE and others: what AI can and can't do)

## Part V: Tools for the Team

14. Project 9: A Test Database MCP Server (used from Claude Code and from agents)
15. Project 10: The Nightly Validation Assistant (capstone: logs in, report and defect drafts out, run every night)
16. Evaluating Engineering AI: Accuracy You Can Defend in a Review
17. Rolling It Out: Pilots, Metrics, Training and Governance

## Appendices

A. Prompt library for engineers
B. Checklists: before using AI on a work product; before deploying a tool
C. Troubleshooting
D. Glossary (engineering and AI terms)
E. Resources
F. The WLC-200 sample data and generator scripts

## Method (same as the earlier books)

Every project is run for real; every output in the book is from those runs; every result is checked by code against answers an engineer worked out; failures are reported, not hidden.
