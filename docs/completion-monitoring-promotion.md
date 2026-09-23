# Completion monitoring promotion — intake-incomplete alert

**Date:** 2026-09-23  
**Production watchdog:** `ADB-WATCHDOG-PROD-2.1`  
**Completion monitoring version:** `ADB-COMPLETION-PROD-0.1`  
**Promoted incident class:** `Unhealthy — intake incomplete`

## Operational outcome

The existing 09:30 America/Chicago production watchdog now includes a privacy-safe signup-to-Welcome completion scan and may alert on one completion-specific incident class: a valid signup older than eight hours without a reconciled Signup ledger result or an eligible queue/disposition.

This closes the gap between component-level processor freshness and journey-level completion. The subscriber processor and Resend dispatchers remain the only owners of subscriber processing and delivery.

## Scope and ownership

Source of truth:
- `ADB-COMPLETION-0.1`
- `ADB-COMPLETION-RECON-0.1`
- `docs/automation-prompts/production-health-watchdog.md`
- `PROJECT_STATE.json`
- production Release Config and fixed Operations Status rows.

The watchdog may read the production Signup response, ledger, audit, subscriber/profile, and Welcome queue evidence required for reconciliation. It may update only monitor-owned Operations Status/History records and send the administrator-only failure alert allowed by the staged policy.

It must never repair, resend, replay, or mutate subscriber-facing records or messages.

## Safety gates

Before the promoted completion check may write monitor state or alert, the existing production gates must pass, plus:
- Completion Monitoring Version = `ADB-COMPLETION-PROD-0.1`
- Completion Intake Threshold = `8 HOURS`
- Completion Alert Class = `UNHEALTHY — INTAKE INCOMPLETE ONLY`
- Completion Alert Component = `Signup Completion`

The fixed `Signup Completion` Operations Status row must exist exactly once.

## Validation completed before promotion

- 15/15 documented completion vectors passed in the controlled DEV classifier.
- The fixture mutation guard passed.
- 10/10 alert-policy checks passed.
- Same-day alert replay was deduplicated.
- Recovery remained silent.
- All other completion Unhealthy/Unknown classifications remained report-only.
- One synthetic administrator-only `[CONTROLLED TEST]` alert was accepted by Gmail and observed in the inbox.
- The current production full-scan baseline contains no intake-incomplete journeys before promotion.

## Alert behavior

The incident key is `Signup Completion|YYYY-MM-DD` in America/Chicago.

At most one failure alert is sent for this component per Central calendar day. The alert includes only the component/stage, classification, compact oldest unresolved age, aggregate affected count, and Operations Status link.

Subscriber addresses, raw Response Keys, Profile IDs, Message IDs, provider IDs, tokens, and message bodies are prohibited from alert text.

Other completion findings remain report-only in this release.

## Failure signal and rollback

Failure signals include:
- false-positive intake-incomplete alerting;
- duplicated same-day alerts;
- privacy leakage into alert text;
- monitor writes outside Operations Status/History;
- any subscriber-facing queue/message mutation;
- divergence between canonical watchdog prompt and scheduler copy.

Rollback:
1. restore the watchdog scheduler prompt to `ADB-WATCHDOG-PROD-2.0`;
2. set completion controls in Release Config back to non-live/disabled state;
3. leave the `Signup Completion` status/history evidence intact for audit;
4. do not modify subscriber, queue, or delivery records.

## Subscriber-facing impact

None. This is an administrator-only monitoring change.
