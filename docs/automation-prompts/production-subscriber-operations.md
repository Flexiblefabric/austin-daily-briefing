# Production Subscriber Operations — Canonical Automation Prompt

**Specification ID:** `ADB-SUBOPS-PROD-1.1`  
**Lifecycle:** Active production  
**Schedule:** Every 6 hours  
**Scheduler task ID:** `6aa1acbcf17c8191a9a89cc95b433629`  
**Canonical path:** `docs/automation-prompts/production-subscriber-operations.md`

This file is the durable source for the production subscriber-operations task. The scheduler copy is disposable. If a scheduler copy is lost, recreate it from this file and record the new task ID in `PROJECT_STATE.json`. Do not store subscriber addresses, administrator addresses, credentials, raw verification tokens, or private routing destinations in this public repository.

## Execution prompt

Operate the Austin Daily Briefing production subscriber system safely and idempotently.

AUTHORITATIVE FILES
- Production subscriber database: Google Sheet ID 1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0
- Production intake workbook: Google Sheet ID 1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho
- Use only the production forms, tabs, links, configuration, and data in those workbooks.
- Native signup production contract: `docs/native-signup-production-processing.md`; require Specification ID `ADB-NATIVE-SIGNUP-PROD-0.1` when Native Signup Mode is CONTROLLED or LIVE.

SAFETY GATE
Before making any write or sending any message, read the intake workbook's Integration Config and confirm:
- Environment = PRODUCTION
- Processor Mode is one of:
  - GOOGLE ONLY
  - GOOGLE + NATIVE CONTROLLED
  - GOOGLE + NATIVE
- Production Writes authorizes routine processor writes
- Delivery Mode is enabled
If Processor Mode = GOOGLE + NATIVE CONTROLLED, also require a nonblank Native Customize Controlled Email value and process native customization requests only for that normalized address.
Read Integration Config → Native Signup Mode. If absent or blank, treat it as DISABLED. It must be DISABLED, CONTROLLED, or LIVE.
- If Native Signup Mode = CONTROLLED, require a valid nonblank Native Signup Controlled Email.
- If Native Signup Mode is CONTROLLED or LIVE, require Processor Mode to be native-capable: GOOGLE + NATIVE CONTROLLED or GOOGLE + NATIVE.
- Native Signup Mode never changes the shared Processor Mode and must not restrict the already-live native customization path.
If any check fails, make no writes and send no email. Report the exact mismatch.

Processor Mode behavior:
- GOOGLE ONLY: preserve the existing Google Forms-only behavior and do not read or mutate Native Customize Requests / Native Verification Queue.
- GOOGLE + NATIVE CONTROLLED: preserve all Google behavior and additionally process only eligible confirmed native customization requests for the configured controlled email.
- GOOGLE + NATIVE: preserve all Google behavior and additionally process all eligible confirmed native customization requests.

Native Signup Mode behavior:
- DISABLED: do not read or mutate Native Signup Requests / Native Signup Diagnostics.
- CONTROLLED: process only eligible Staged native signup requests for Integration Config → Native Signup Controlled Email; skip all other native signup rows as outside the controlled gate.
- LIVE: process all eligible Staged native signup requests.
- Native Signup Diagnostics is operational evidence only and never authorizes subscriber mutation.

CORE PROCESSING
Process unprocessed form responses. The linked Google response tabs do not expose a native Forms response ID. Derive a stable source-row fingerprint using the established production processor formula below, then reconcile it with the ledger by source identity before processing. The ledger's recorded Response Key is authoritative for previously processed rows, including historical rows whose current displayed values no longer reproduce their recorded key. Never fabricate a native Forms ID or treat a row number or timestamp alone as a key.

RESPONSE KEY AND RECONCILIATION
- For a new response, read the exact production tab's header and populated row. Determine the response width from the last nonempty header cell, then take every displayed cell string from the first column through that header-defined width. Include blank answers at the end of a response; exclude only grid columns beyond the response headers. For Signup these are Timestamp, Email Address, and the consent answer.
- Compute SHA-256 over the UTF-8 text formed by joining [form type, exact source tab title, 1-based source row number, ...displayed response cell strings] with U+001F. Encode the 32-byte digest as URL-safe Base64 without padding (43 characters). This is the existing ownershipResponseKey_ / sha256Url_ formula in the production Processor Builder; for Signup row 2 it reproduces zCvBJTr_J_cwkEgBQxq0FUI_8vBNJirdVZouKAA_3vY and row 9 reproduces VJ8QoPlnO96-PxzDcLIjsZzrKDbAn5Whepmj-UIhULI.
- Before any write, search the entire Google Intake Ledger for both that key and the tuple (Form Type, Source Tab, Source Row). For an existing ledger row, compare its timestamp and normalized email with the current source row and use the recorded key across Signup Actions, Profiles, and Outbound Messages. Skip completed work even if recomputation differs. If identities conflict, multiple ledger rows match, or a key collides with another response, stop that response and report the mismatch.
- For an unledgered row, ensure its timestamp, normalized email, and form answers are valid; confirm no matching subscriber, Signup Action, or welcome queue row exists before creating records. Re-read the source row and ledger immediately before the first write. If the row has moved or any fingerprint input changed, stop and reconcile rather than issuing a second key. Once written, preserve the ledger mapping; do not recompute IDs for an already processed row.
- The derived fingerprint is an idempotency key for this append-only linked response sheet, not a native immutable Forms response ID. If row order or displayed values change, reconcile with the existing ledger and audit history before processing anything ambiguous.

The sole retry exception is a previously ledgered request explicitly marked DEFERRED — CONFIRMATION BLOCKED because the email-link token rule prevented sending. Re-read its response, subscriber, ledger, and verification records; reissue only when the former verification record is Cancelled and no live Pending, Confirmed, or Applied record exists for that response key. Update the existing ledger row after successful reissue; never append a second ledger row or apply the requested change before confirmation.

1. SIGNUP
- Validate the email and required fields.
- Create or reactivate exactly one subscriber record and its default profile/preferences according to the production schema.
- Queue exactly one WELCOME_V1 row in Outbound Messages with a deterministic Message ID.
- Do not send the welcome message.
- Mark the signup response processed only after all authorized database writes and the queue row succeed.

### NATIVE SIGNUP PROCESSING

This section applies only when Native Signup Mode is CONTROLLED or LIVE. Read and require the current main copy of `docs/native-signup-production-processing.md` with Specification ID `ADB-NATIVE-SIGNUP-PROD-0.1`.

Authoritative production-native tab:
- Native Signup Requests
- Native Signup Diagnostics is operational evidence only; do not use it as authorization.

The native signup Apps Script endpoint may validate and stage requests, but it must never create/reactivate subscribers, mutate Profiles/Preferences, create Signup Actions, create Welcome rows, or send Welcome mail. This automation remains the sole owner of production subscriber mutation and Welcome queue creation.

Eligibility for a native request:
- Status = Staged.
- Source = NATIVE_SIGNUP_PROD.
- Request ID matches NSPROD-<UUID>.
- Response Key is a 43-character URL-safe SHA-256 identifier.
- Email is normalized and valid.
- Consent = Yes.
- Request ID occurs exactly once.
- No existing Signup Action uses NATIVE:SIGNUP:<Response Key>.
- No existing Outbound Messages row uses WELCOME-NATIVE:<Response Key>.
- In CONTROLLED mode, normalized email exactly equals Native Signup Controlled Email.

Resolve current subscriber state immediately before mutation:
- No matching subscriber: create exactly one Active subscriber/profile, initialize all 23 active interests to Normal/1, use standard initial reading settings, append one Signup Action with Submission ID NATIVE:SIGNUP:<Response Key>, and append one Queued WELCOME_V1 with Message ID WELCOME-NATIVE:<Response Key>.
- Active: terminal no-op; preserve all records; mark request Processed / existing_active_noop; no Signup Action and no Welcome.
- Paused: terminal no-op; preserve Paused status and all records; mark request Processed / paused_requires_manage; no Signup Action and no Welcome.
- Admin Hold: terminal no-op; preserve Admin Hold and all records; mark request Processed / admin_hold_noop; no Signup Action and no Welcome. A signup request must never clear or bypass an administrative hold.
- Unsubscribed: explicit re-subscription from fresh affirmative consent; reactivate the existing subscriber, preserve the existing Profile ID, all preference rows and reading settings, append one Signup Action with Subscriber Result Reactivated, and append exactly one Queued WELCOME_V1.
- Any other or ambiguous state: make no mutation and report the exact mismatch.

Crash/idempotency boundary:
- For new signup or re-subscribe, re-read the request, subscriber identity, profile, preferences, deterministic Signup Action ID and deterministic Welcome ID immediately before the first write.
- If a deterministic Signup Action or Welcome already exists while the request is still Staged, stop that request as partial/ambiguous state; do not auto-repair.
- Set request Status = Processing before the first subscriber-database mutation.
- Perform authorized writes; flush; only then set request Status = Processed with the documented result.
- A later run that finds Processing is fail-closed and requires operator reconciliation.
- Active/Paused/Admin Hold no-op cases may move directly from Staged to Processed because they make no subscriber mutation.
- Production Preferences contains duplicate Profile ID headers; when reading rows, preserve the first occurrence of a duplicate header and never allow a later duplicate column to overwrite the canonical first value.

Welcome ownership remains unchanged: queue only. Do not send, retry, or alter provider/delivery fields.

2. MANAGEMENT
- Treat pause, resume, unsubscribe, and ownership-sensitive changes as protected operations.
- Apply the existing confirmation/verification rules and production links.
- Confirmation emails, when required, may use the currently validated Gmail path and must contain only the generic HTTPS confirmation link and non-sensitive context. The single-use token is permitted only inside that link's prefilled token parameter; this is the narrow exception to the email token prohibition. Do not print it separately or include internal IDs, private profile data, or private forwarding addresses in email.
- Generate a fresh 32-byte cryptographically random token for each new or retried request; store only its SHA-256 hash in Verification Queue. Use the configured 24-hour expiry and scope the token to the exact request and subscribed address. Never store a raw token or token-bearing URL in the intake ledger, Verification Queue, Outbound Messages, logs, notes, GitHub, or task output. Do not consume a token merely when a link is opened; consume it only on a valid confirmation form submission. On send failure, cancel the new verification record and leave the request deferred.
- Apply the requested state change only after the required confirmation has been validated.
- Preserve subscriber history and idempotency.

3. CUSTOMIZATION
- Stage validated preference/profile changes for confirmation from the matching subscriber; apply only after a valid single-use confirmation submission.
- Preserve existing values when the submitted field is intentionally blank and the production rules say blank means no change.
- Do not silently create a second subscriber for an existing email.

### NATIVE CUSTOMIZATION PROCESSING

This section applies only when Processor Mode is GOOGLE + NATIVE CONTROLLED or GOOGLE + NATIVE.

Authoritative production-native tabs in the production intake workbook:
- Native Customize Requests
- Native Verification Queue
- Native Customize Diagnostics is operational evidence only; do not use it as an authorization source.

The Apps Script native endpoint may stage and confirm requests, but it must never write Profiles or Preferences directly. This automation remains the sole owner of applying confirmed native customization changes to the production subscriber database.

A native request is eligible to apply only when all of these are true:
- Request Source = NATIVE_CUSTOMIZE_PROD.
- Request Status = Confirmed.
- Request Applied At is blank.
- Linked Verification ID exists exactly once in Native Verification Queue.
- Linked verification Status = Confirmed.
- Linked verification Applied At is blank.
- Request ID, Verification ID, normalized email, and request/verification linkage agree exactly.
- The normalized email resolves to exactly one current production subscriber and the request Profile ID equals that subscriber's current Profile ID.
- Subscriber status is Active or Paused; do not apply customization to Admin Hold or Unsubscribed subscribers.
- Payload JSON parses to an object containing only the supported 23 interest IDs and/or the three supported style fields.
- Payload SHA-256 equals SHA-256 of the stable canonical JSON payload recorded by the endpoint.
- Every interest value is off, normal, or high; every style value is one of the documented production Processor Mapping options; keep_current must not be stored in Payload JSON.
- In GOOGLE + NATIVE CONTROLLED mode, the normalized email exactly matches Integration Config → Native Customize Controlled Email.

If any identity, linkage, payload, or schema check is ambiguous or fails, do not partially apply that request. Leave it un-applied and report the specific mismatch.

Apply native payloads using the same production semantics as Google Customize:
- Interests map Off→Preference Off/Score 0; Normal→Normal/1; High→High/2.
- Update the unique matching Preferences row for Profile ID + Interest ID. If no row exists, append one using the production Preferences schema. If more than one exists, stop the request.
- Set Preferences Updated to the current operational timestamp when that field exists.
- Set Preferences Source Submission ID to NATIVE_CUSTOMIZE:<Request ID>.
- more_for_you_volume maps to Profiles → More for You Volume.
- summary_style maps to Profiles → Summary Style.
- why_it_matters_length maps to Profiles → Why It Matters Length.
- Set Profiles Latest Submission ID to NATIVE_CUSTOMIZE:<Request ID>.
- Set Profiles Last Preference Update to the current operational timestamp.

Exactly-once rule:
- Immediately before the first production preference/profile write, re-read the request row, verification row, subscriber row, target profile, and all affected preference rows.
- Proceed only if request and verification are still Confirmed with blank Applied At and all identity/linkage checks still match.
- Apply all requested profile/preference changes.
- Only after those writes succeed, set the native request Status = Applied, Applied At = now, Result = Applied to production profile.
- Set the linked verification Status = Applied and Applied At = now.
- If the request or verification is already Applied on re-read, no-op it and count it as already processed.
- Never send another confirmation email from this processing phase.
- Never use Native Customize Diagnostics as proof of confirmation or authorization.

Controlled-production safeguard:
- In GOOGLE + NATIVE CONTROLLED mode, native processing is restricted to the configured control email even if other native rows somehow exist.
- A native request for any other address must be skipped and reported as outside the controlled-production gate.

WELCOME DELIVERY OWNERSHIP
The Resend Apps Script queue dispatcher is the sole owner of WELCOME_V1 delivery. This automation must never send a welcome through Gmail or Resend. Apart from creating one new Queued WELCOME_V1 row for an eligible signup, it must not change welcome queue delivery status, Sent At, provider message ID, retry, or error fields. Do not replay, repair, or re-send an existing welcome.

PROCESS ORDER
Process Google Signup responses first, then eligible Native Signup requests when Native Signup Mode authorizes them, then management responses, then Google customization responses (including the narrowly eligible deferred retry), then eligible Google confirmations, then eligible confirmed native customization requests when Processor Mode authorizes native customization. Re-read the relevant subscriber, response, ledger, and verification row immediately before each write. For a deferred retry, preserve the cancelled record as audit history, create one fresh verification record and link, send once, and update the existing ledger result to pending confirmation only after successful send. If already reissued or confirmed, skip without duplicate email. Continue past an invalid individual response only when doing so cannot compromise another subscriber; record the row-specific error.

MONITORING
Update only the Subscriber Operations monitoring/status row for this run. Do not update or impersonate the Welcome Dispatcher status. Preserve the existing aggregate Google/native-customization counts and additionally report native signup inspected, new subscribers, re-subscribed, Active no-op, Paused no-op, Admin Hold no-op, skipped outside controlled gate, and native signup errors. If there was no eligible work, record a successful zero-work run without generating email.

BOUNDARIES
- Do not modify editorial briefing content or send the daily briefing.
- Do not change Apps Script properties, triggers, Resend credentials, Cloudflare settings, or GitHub secrets.
- Do not expose subscriber data in the task report.
- When an unexpected schema, identity, authorization, or ownership mismatch appears, stop the affected operation and report it rather than guessing.
