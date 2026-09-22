# End-to-end completion observation result

**Specification:** `ADB-COMPLETION-OBS-0.1` / `ADB-COMPLETION-0.1`  
**Observation window:** 2026-09-19 11:22:10 through 2026-09-20 11:22:10 America/Chicago  
**One-time scheduler run:** completed 2026-09-20  
**Status:** Complete; retrospective evidence preserved  
**Production writes, repairs, sends, or alerts by the observation:** None

This document closes the first one-time read-only signup-to-Welcome observation. The original scheduler output was not stored in GitHub, so this closeout does not pretend to reproduce an unavailable transcript. It reconstructs the durable evidence that remains in the authoritative production workbooks and scheduler metadata.

## Result

During the observation window, one new valid signup response arrived at source row 13 at 2026-09-20 09:47:56 America/Chicago.

At the observation cutoff, that signup was approximately 1 hour 34 minutes old and had not yet reached its ledger/queue stage. Under `ADB-COMPLETION-0.1`, that state is:

> **Pending — intake window**

It was not unhealthy because the adopted intake window permits up to 8 hours before a reconciled queue/disposition is required.

The journey subsequently completed:

- Signup → reconciled ledger / Welcome queue: **5h 16m 04s**
- Queue → Resend provider acceptance: **23m 39s**
- Signup → provider acceptance: **5h 39m 43s**
- Deterministic Welcome rows: **1**
- Matching Signup Actions rows: **1**
- Final Welcome status: **Sent**
- Resend provider evidence: **present**

The completed journey remained inside the contract's effective maximum healthy signup-to-provider window of 10 hours.

## Baseline audit defect

The known pre-observation audit-integrity defect remains unchanged:

- source row 9 / ledger row 23 has no matching Signup Actions row;
- its deterministic Welcome row exists;
- delivery is `Sent`;
- Resend provider evidence is present.

This remains an **audit-integrity defect, not a delivery failure**. It must not trigger a resend.

## Historical evidence limitation

The one-time observation prompt also requested a count of Subscriber Operations runs covering the interval. The current production workbooks do not retain enough per-run Subscriber Operations history to reconstruct that historical count after the fact, and the scheduler interface currently exposes only recent task metadata rather than the original observation report.

Therefore:

- the one-time observation is recorded as completed;
- the signup journey itself has durable evidence and completed within contract;
- the known audit defect is unchanged;
- no claim is made that the original run-count line from the scheduler output has been recovered.

This limitation is one reason the reusable reconciler should persist its own sanitized observation state rather than relying on ephemeral scheduler output.

## Closeout decision

The first observation supplied no durable evidence of an overdue or failed signup-to-Welcome journey. It did expose a durability gap in monitoring evidence: observation results and high-water state need a repository/runtime record that survives the scheduler conversation.

Next work is therefore Phase 2 engineering rather than repeating this one-time task:

1. define reusable high-water and overlap behavior;
2. run the controlled DEV test vectors;
3. stage read-only recurring reconciliation;
4. add alerts only after clean validation.

The one-time observation prompt is retired and should not be recreated as a recurring task.
