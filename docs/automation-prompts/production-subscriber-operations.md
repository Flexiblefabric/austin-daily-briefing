# Production Subscriber Operations — Canonical Automation Prompt

**Specification ID:** `ADB-SUBOPS-PROD-1.0`  
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

SAFETY GATE
Before making any write or sending any message, read the intake workbook's Integration Config and confirm:
- Environment = PRODUCTION
- Processor Mode = GOOGLE ONLY
- Production Writes authorizes routine processor writes
- Delivery Mode is enabled
If any check fails, make no writes and send no email. Report the exact mismatch.

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

WELCOME DELIVERY OWNERSHIP
The Resend Apps Script queue dispatcher is the sole owner of WELCOME_V1 delivery. This automation must never send a welcome through Gmail or Resend. Apart from creating one new Queued WELCOME_V1 row for an eligible signup, it must not change welcome queue delivery status, Sent At, provider message ID, retry, or error fields. Do not replay, repair, or re-send an existing welcome.

PROCESS ORDER
Process signup responses, then management responses, then customization responses (including the narrowly eligible deferred retry), then eligible confirmations. Re-read the relevant subscriber, response, ledger, and verification row immediately before each write. For a deferred retry, preserve the cancelled record as audit history, create one fresh verification record and link, send once, and update the existing ledger result to pending confirmation only after successful send. If already reissued or confirmed, skip without duplicate email. Continue past an invalid individual response only when doing so cannot compromise another subscriber; record the row-specific error.

MONITORING
Update only the Subscriber Operations monitoring/status row for this run. Do not update or impersonate the Welcome Dispatcher status. Report counts for responses inspected, successfully processed, skipped as already processed, confirmation messages sent, and errors. If there was no eligible work, record a successful zero-work run without generating email.

BOUNDARIES
- Do not modify editorial briefing content or send the daily briefing.
- Do not change Apps Script properties, triggers, Resend credentials, Cloudflare settings, or GitHub secrets.
- Do not expose subscriber data in the task report.
- When an unexpected schema, identity, authorization, or ownership mismatch appears, stop the affected operation and report it rather than guessing.
