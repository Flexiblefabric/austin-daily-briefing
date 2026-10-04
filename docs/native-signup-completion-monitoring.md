# Native Signup — Completion Monitoring Extension

**Specification ID:** `ADB-NATIVE-SIGNUP-MONITOR-0.1`  

**Status:** FORM-7 Gate D staging contract  
**Purpose:** Extend existing signup-to-Welcome monitoring without weakening or replacing Google signup monitoring.

## Principle

Native signup creates the same subscriber-to-Welcome outcome as Google signup but has a different authoritative intake identity. Monitoring must reconcile both paths without merging their identities or assuming one source when the other was used.

The existing Google completion model remains unchanged.

## Activation gate

If `Native Signup Mode` is absent, blank, or `DISABLED`, watchdog and manual completion reconciliation must ignore Native Signup Requests entirely.

If `Native Signup Mode` is `CONTROLLED` or `LIVE`, monitoring additionally reads populated `Native Signup Requests`.

In CONTROLLED mode, monitoring may inspect all native request rows for operational health, but only the configured controlled email is eligible for subscriber mutation. Non-controlled rows should remain no-op/diagnostic cases rather than be classified as incomplete subscriber journeys.

## Native authoritative identity

For each native request:

- Request ID is the intake identity;
- Response Key is the deterministic downstream ownership key;
- expected Signup Action ID is `NATIVE:SIGNUP:<Response Key>`;
- expected Welcome Message ID is `WELCOME-NATIVE:<Response Key>`.

Never derive native ownership from a Google ledger row.

## Native terminal results

Treat these as expected terminal request outcomes:

- `new_subscriber` — requires one subscriber/profile, expected preferences, one Signup Action, and one eligible Welcome;
- `resubscribed` — requires one existing/re-activated subscriber/profile, preserved preference cardinality, one Signup Action, and one eligible Welcome;
- `existing_active_noop` — Closed; no Welcome entitlement from this request;
- `paused_requires_manage` — Closed; no Welcome entitlement from this request;
- `admin_hold_noop` — Closed; administrative hold preserved and no Welcome entitlement;
- controlled/non-authorized endpoint no-op — no staged request exists and therefore no completion journey exists;
- `Error` / `Processing` — operational review path; never authorize repair or resend from monitoring.

## Native pending/incomplete classification

For a valid Staged native request inside the existing processor timing allowance:

- classify Pending while within the allowed processing window;
- after the existing completion intake threshold, a Staged request with no terminal processor result is the native equivalent of `Unhealthy — intake incomplete`.

A request stuck in Processing is not automatically repairable. Report it separately as an operational/partial-state defect. Do not alert as if it were merely an unprocessed Staged request unless the approved completion specification explicitly maps it to that class.

## Welcome reconciliation

For `new_subscriber` and `resubscribed`:

- reconcile exactly one deterministic Welcome row;
- preserve the existing queue-age, Failed, Sent-without-provider, duplicate, and provider-ID rules;
- never send/retry/repair from the watchdog or reconciler.

For Active/Paused/Admin Hold no-op results, the absence of a Welcome is correct.

## Privacy

Existing completion privacy rules apply to native journeys:

- output aggregate counts only;
- do not display addresses;
- do not display raw Request IDs, Response Keys, Profile IDs, Message IDs, provider IDs, body text, or tokens.

## Required prompt integration

Before Gate D activation:

- update `docs/end-to-end-completion-spec.md` with native-journey identity and classifications;
- update `docs/automation-prompts/end-to-end-completion-reconcile.md`;
- update `docs/automation-prompts/production-health-watchdog.md`;
- preserve the currently promoted alert class unless separately approved;
- add native completion test vectors for new signup, re-subscribe, Active no-op, Paused no-op, Admin Hold no-op, Staged timeout, Processing partial state, duplicate Welcome, and replay.

Until those changes pass controlled tests, Gate D compatibility remains FAIL for monitoring.
