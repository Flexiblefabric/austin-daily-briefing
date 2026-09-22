# End-to-end completion observation — canonical prompt

**Specification ID:** `ADB-COMPLETION-OBS-0.1`  
**Lifecycle:** Retired — one-time read-only observation completed 2026-09-20  
**Observation start:** `2026-09-19T16:22:10Z` (`2026-09-19 11:22:10 America/Chicago`)  
**Duration:** 24 hours  
**Canonical contract:** `docs/end-to-end-completion-spec.md`  
**Production writes, repairs, sends, or alerts:** Prohibited

This prompt is the durable execution copy for the first 24-hour production observation. The one-time scheduler run completed and this prompt is now preserved for audit only. Do not recreate it without a new explicit observation plan. Durable closeout evidence is recorded in [`../end-to-end-completion-observation-result.md`](../end-to-end-completion-observation-result.md).

## Execution prompt

Read the canonical contract at:
https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/main/docs/end-to-end-completion-spec.md

Require Specification ID `ADB-COMPLETION-0.1`. If unavailable or different, report `Unknown — canonical contract unavailable or mismatched` and stop without writing.

Perform one read-only Austin Daily Briefing signup-to-welcome reconciliation for the 24-hour interval beginning `2026-09-19T16:22:10Z`, using America/Chicago for operational time.

Use only:

- Production subscriber database: `1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0`
- Production intake workbook: `1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho`

Read workbook metadata first and verify exact production identity and visible tab names. Read only the bounded ranges needed from `Google Signup Responses`, `Google Intake Ledger`, `Operations Status`, `Signup Actions`, `Subscribers`, `Profiles`, and `Outbound Messages`. Never read DEV, archived response copies, email bodies, HTML, plain-text payloads, confirmation tokens, administrator addresses, or unrelated profile preferences.

For every production signup response created during the observation window, and every signup that was unresolved at the start or overlaps the preceding 24 hours:

1. Reconcile the exact source tuple with the existing Signup ledger row. The recorded Response Key controls once ledgered.
2. Reconcile any Signup Actions audit row, subscriber/profile cardinality, and the deterministic current welcome Message ID.
3. Apply the contract's states and timing:
   - less than or equal to 8 hours before a reconciled queue/disposition: Pending — intake window;
   - more than 8 hours: Unhealthy — intake incomplete;
   - queued for no more than 2 hours: Pending — delivery window;
   - queued for more than 2 hours: Unhealthy — delivery overdue;
   - Sent with one Resend provider ID and consistent records: Complete.
4. Classify explicit processing error, contradictory/missing downstream identity, Failed welcome, Sent without provider evidence, duplicate key/message, or ambiguous cardinality as Unhealthy immediately.
5. Classify unreadable required evidence as Unknown. Do not infer healthy zero-work from missing evidence.
6. Treat a missing Signup Actions row with otherwise consistent completed downstream evidence as an audit-integrity defect, not a delivery failure. The known source-row-9 / ledger-row-23 defect predates this observation; report it as unchanged baseline unless its evidence changes. Never resend or repair it.

Produce one compact daily report containing:

- observation interval and specification ID;
- counts for new signup responses, Complete, Pending by stage, Closed by documented disposition, Unhealthy by class, Unknown, and audit-only defects;
- minimum/median/maximum signup-to-queue, queue-to-provider, and total completion time for journeys completed in the interval;
- sanitized source/ledger/action/queue row numbers for any non-complete result;
- whether the known baseline audit defect remained unchanged;
- Subscriber Operations run count and whether expected six-hour coverage was present;
- a conclusion: `PASS — suitable to proceed to alert staging`, `REVIEW — non-delivery audit defects only`, or `FAIL — completion/identity evidence unhealthy or unknown`.

Do not display subscriber addresses, names, raw Response Keys, Profile IDs, Message IDs, provider IDs, bodies, tokens, or private routing information. Do not write to either workbook, update Operations Status or History, send email, invoke a dispatcher, repair a row, change a task, or trigger another automation. This observation produces the requested daily report only.
