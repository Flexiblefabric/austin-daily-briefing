# OPS-5 stage 1 — completion incident staging

**Date:** 2026-09-23  
**Parent contract:** `ADB-COMPLETION-0.1`  
**Reusable reconciler:** `ADB-COMPLETION-RECON-0.1`  
**Lifecycle:** Development / controlled staging  
**Production alerting changed:** No

## Selected first incident class

The first completion-specific incident class to stage is:

> **Unhealthy — intake incomplete**

This is the cleanest first promotion candidate because it covers a gap that is distinct from the current component freshness checks: a valid signup can exist for more than the eight-hour intake window without a reconciled ledger result or an eligible queue/disposition even when the subscriber processor itself has otherwise run recently.

The staged component name is **Signup Completion** so its alert key does not collide with the existing Subscriber Operations freshness incident key.

## Alert contract for stage 1

An alert is eligible only when all of the following are true:

- the full-scan completion reconciler classifies at least one valid signup as `Unhealthy — intake incomplete`;
- the oldest unresolved valid signup is beyond the eight-hour intake threshold;
- the required evidence was readable enough to make that classification;
- the `Signup Completion` component has not already emitted an alert for the same America/Chicago calendar date.

The incident key is:

`Signup Completion|YYYY-MM-DD`

During OPS-5 stage 1, every other completion classification remains report-only. In particular, delivery-overdue, explicit-failure/integrity, and Unknown cases are **not** newly alert-enabled by this change even though they remain visible in reconciliation output.

Recovery is silent. A later scan that finds the stranded journey Complete or authoritatively Closed may record recovery only after production promotion; it sends no success/recovery email.

## Controlled test message

Controlled alert transport uses the existing validated administrator-only Gmail path and must use the configured `[CONTROLLED TEST]` subject prefix. The test message contains only:

- component and stage;
- classification;
- compact oldest unresolved age;
- aggregate affected-journey count;
- link to Operations Status;
- instruction to review rather than repair from monitoring.

It must not contain subscriber addresses, raw Response Keys, Profile IDs, Message IDs, provider IDs, message bodies, tokens, or administrator routing details.

## Safety boundary

This stage does **not** modify the production watchdog prompt or scheduler copy. It does not write production Operations Status/History, send an alert, invoke a dispatcher, create/repair subscribers or profiles, or change queues. Existing subscriber operations and Resend dispatchers remain the sole owners of processing and delivery.

The stage-1 policy is exercised by `scripts/test_completion_alert_policy.py`.

## Controlled acceptance checks

The harness must prove:

1. healthy Pending intake does not alert;
2. first staged intake-incomplete incident alerts;
3. same-day replay is deduplicated;
4. a still-unresolved incident may alert once on the next Central calendar day;
5. recovery is silent;
6. other completion incident classes remain report-only during stage 1;
7. Unknown remains report-only during stage 1;
8. controlled subject prefix is present;
9. controlled alert body passes the privacy guard;
10. alert text explicitly preserves the no-repair/no-resend monitoring boundary.

After those checks pass, the next gate is a controlled administrator-alert transport test using synthetic evidence only. Promotion into the live 09:30 watchdog remains a separate production change requiring the short release checklist, canonical-prompt/registry review, changelog entry, and immutable snapshot if promoted.
