# Defect drafts and updates (for an engineer to review)

## TC-AP-03: NEW DRAFT, TC-AP-03 anti-pinch stop latency 12 ms (limit 10 ms) with peak pinch force 103.2 N on SW 2.4.0-rc4

Suggested component: anti_pinch; suggested severity: S1
Related: DR-1001, DR-1004, LL-2022-02-cold-pinch-latency

Night 2026-10-07, software 2.4.0-rc4, run R03, test TC-AP-03. Criterion stop_latency_ms measured 12 ms against a maximum of 10 ms (FAIL). reversal_mm measured 163.0 mm against a minimum of 150 mm (pass). Anomaly: peak pinch force 103.2 N is above 100 N, which is reportable per TP-AP-01. Supply voltage and temperature for this run are not given in the facts and must be added from the run log. No open defect exists for TC-AP-03. The same kind of late stop was seen in TC-AP-04 on the same night (R04, 13 ms), which is covered by DR-1001.

## TC-AP-04: already covered by DR-1001

Add run R04 on 2.4.0-rc4 (night 2026-10-07): stop latency 13 ms vs 10 ms limit, reversal 158.0 mm (pass), and note the anomaly that the temperature estimate at start was -22 °C while the chamber was set to -30 °C (soak incomplete or estimate offset), with voltage to be confirmed from the run log.
