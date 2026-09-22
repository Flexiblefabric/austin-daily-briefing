# End-to-end completion reconciliation — canonical prompt

**Specification ID:** `ADB-COMPLETION-RECON-0.1`  
**Lifecycle:** Development / manual read-only  
**Canonical contract:** `docs/end-to-end-completion-spec.md`  
**Production writes, repairs, sends, or alerts:** Prohibited

This prompt defines the reusable read-only signup-to-Welcome reconciliation pass. It replaces the one-time observation prompt for future manual and controlled validation. It does not consume a scheduler slot while in Development.

## Execution prompt

Read:

- `docs/end-to-end-completion-spec.md` and require `ADB-COMPLETION-0.1`;
- `docs/end-to-end-completion-test-vectors.md`.

Use only the production subscriber database and production intake workbook registered in `PROJECT_STATE.json`. Verify workbook title and visible production tab names before reading records.

Operate read-only. Never:

- create or repair a subscriber/profile;
- write a ledger or audit row;
- create, send, retry, replay, or modify a Welcome message;
- invoke a dispatcher;
- update Operations Status or Operations History;
- send an administrator alert;
- change a task, trigger, Script Property, or delivery setting.

## Scan model

Use the contract's initial **stateless full-scan** model.

Read the populated rows required from:

- `Google Signup Responses`;
- `Google Intake Ledger`;
- `Signup Actions`;
- `Subscribers`;
- `Profiles`;
- `Outbound Messages`.

Do not read archived/DEV response copies or email bodies/HTML/plain-text payloads.

For each nonblank production Signup response:

1. locate its authoritative ledger disposition using the existing source tuple and recorded Response Key;
2. reconcile at most one Signup Actions record;
3. reconcile subscriber/profile cardinality when the disposition requires one;
4. derive only for lookup the deterministic current Welcome Message ID defined by the production rules;
5. reconcile exactly one eligible Welcome queue row when Welcome entitlement exists;
6. classify using `ADB-COMPLETION-0.1`.

The monitor may inspect identifiers to perform joins but must never display them.

## Classification

Use only the contract's defined outcomes:

- Complete;
- Pending — intake window;
- Pending — delivery window;
- Closed — documented disposition;
- Unhealthy — explicit processing or integrity failure;
- Unhealthy — intake incomplete;
- Unhealthy — delivery overdue;
- Unknown — evidence unavailable.

A missing Signup Actions row with otherwise complete, consistent downstream evidence is an audit-integrity defect and does not authorize a resend.

## Report

Return a compact privacy-safe report with:

- America/Chicago run time;
- specification IDs;
- total nonblank Signup responses reviewed;
- counts by classification;
- count of audit-only defects;
- oldest Pending age, if any;
- sanitized source/ledger/action/queue row numbers only for non-complete or audit-only cases;
- duplicate/cardinality counts;
- current Welcome rows that are Queued, Failed, Sent-without-provider, or duplicated;
- comparison with the prior documented baseline when available;
- conclusion:
  - `PASS — no unhealthy or unknown journeys`;
  - `REVIEW — audit-only defects or healthy pending journeys require observation`;
  - `FAIL — one or more unhealthy or unknown journeys`.

Never include subscriber names, addresses, raw response keys, Profile IDs, Message IDs, provider IDs, message bodies, tokens, or private routing information.

## Promotion boundary

This manual reconciliation may be run repeatedly without changing production.

Turning it into an unattended monitor, writing monitor-owned status/history, or enabling alerts is a separate production monitoring promotion requiring the release checklist, controlled DEV vectors, and explicit promotion approval.
