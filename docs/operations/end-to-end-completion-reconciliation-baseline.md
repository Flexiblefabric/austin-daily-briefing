# Completion reconciliation baseline — 2026-09-22

**Contract:** `ADB-COMPLETION-0.1`  
**Reusable prompt:** `ADB-COMPLETION-RECON-0.1`  
**Mode:** Manual read-only full scan  
**Result:** PASS — no unhealthy or unknown signup-to-Welcome journeys

This baseline validates the reusable stateless full-scan approach against the current production records without writing, repairing, sending, or alerting.

## Results

- Populated production Signup responses reviewed: **12**
- Complete journeys: **12**
- Pending journeys: **0**
- Closed documented dispositions: **0**
- Unhealthy journeys: **0**
- Unknown journeys: **0**
- Duplicate Signup ledger mappings: **0**
- Duplicate deterministic Welcome rows: **0**
- Duplicate Signup Actions rows: **0**
- Subscriber/profile cardinality defects: **0**
- Audit-only defects: **1**

Three early completed journeys use the legacy Gmail delivery evidence that predates the Resend production cutover. The contract explicitly permits recognition of legacy Gmail evidence during historical auditing. All newer production Welcome completions use Resend provider evidence.

The single audit-only defect is the already documented source-row-9 / ledger-row-23 missing Signup Actions record. Its subscriber/profile and deterministic Welcome evidence remain consistent and delivery-complete. No resend or repair is authorized by this finding.

## Interpretation

The reusable full-scan model produces a clean current baseline and correctly preserves the historical audit-only exception without misclassifying it as a delivery failure.

This does **not** complete the controlled DEV test-vector gate. Synthetic/DEV cases for overdue intake, partial writes, duplicate IDs, Failed/overdue Welcome rows, missing provider evidence, unreadable evidence, and replay behavior still require controlled validation before unattended alerting is promoted.
