# Defect drafts and updates (for an engineer to review)

## TC-AP-03: NEW DRAFT, Anti-pinch stop latency 12 ms (limit 10 ms) at 16.0 V, 23 °C in TC-AP-03, peak pinch force 103.2 N

Suggested component: anti_pinch; suggested severity: S1
Related: DR-1001, DR-1014, LL-2022-02-cold-pinch-latency

Run R03, test TC-AP-03, software 2.4.0-rc4, night 2026-10-07. Conditions: supply 16.0 V, ambient 23 °C. Measured stop_latency_ms = 12 ms; limit is max 10 ms (FAIL). reversal_mm = 163.0 mm; limit min 150 mm (OK). Anomaly: peak pinch force 103.2 N is above 100 N (reportable per TP-AP-01). No open defect covers TC-AP-03. The same symptom (late stop) is reported in DR-1001 at 9.0 V and -30 °C, so it now appears at high voltage and room temperature too, not only in the cold.

## TC-AP-04: already covered by DR-1001

Add run R04 (2.4.0-rc4, 2026-10-07): TC-AP-04 at 9.0 V and -30 °C again gave 13 ms stop latency (limit 10 ms), reversal 158.0 mm OK, and note the start temperature estimate was -22 °C vs chamber -30 °C (soak incomplete or estimate offset), plus the new R03 failure at 16 V/23 °C showing the latency is not cold-only.
