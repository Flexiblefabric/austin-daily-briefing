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
Process only unprocessed form responses. Use each response's immutable response key as the idempotency key and never process the same response twice.

1. SIGNUP
- Validate the email and required fields.
- Create or reactivate exactly one subscriber record and its default profile/preferences according to the production schema.
- Queue exactly one WELCOME_V1 row in Outbound Messages with a deterministic Message ID.
- Do not send the welcome message.
- Mark the signup response processed only after all authorized database writes and the queue row succeed.

2. MANAGEMENT
- Treat pause, resume, unsubscribe, and ownership-sensitive changes as protected operations.
- Apply the existing confirmation/verification rules and production links.
- Confirmation emails, when required, may use the currently validated Gmail path and must contain only the generic confirmation link and non-sensitive context.
- Never include subscriber tokens, internal IDs, private profile data, or private forwarding addresses in email.
- Apply the requested state change only after the required confirmation has been validated.
- Preserve subscriber history and idempotency.

3. CUSTOMIZATION
- Apply validated preference/profile changes to the matching subscriber.
- Preserve existing values when the submitted field is intentionally blank and the production rules say blank means no change.
- Do not silently create a second subscriber for an existing email.

WELCOME DELIVERY OWNERSHIP
The Resend Apps Script queue dispatcher is the sole owner of WELCOME_V1 delivery. This automation must never send a welcome through Gmail or Resend. Apart from creating one new Queued WELCOME_V1 row for an eligible signup, it must not change welcome queue delivery status, Sent At, provider message ID, retry, or error fields. Do not replay, repair, or re-send an existing welcome.

PROCESS ORDER
Process signup responses, then management responses, then customization responses, then eligible confirmations. Re-read the relevant subscriber and response row immediately before each write. Continue past an invalid individual response only when doing so cannot compromise another subscriber; record the row-specific error.

MONITORING
Update only the Subscriber Operations monitoring/status row for this run. Do not update or impersonate the Welcome Dispatcher status. Report counts for responses inspected, successfully processed, skipped as already processed, confirmation messages sent, and errors. If there was no eligible work, record a successful zero-work run without generating email.

BOUNDARIES
- Do not modify editorial briefing content or send the daily briefing.
- Do not change Apps Script properties, triggers, Resend credentials, Cloudflare settings, or GitHub secrets.
- Do not expose subscriber data in the task report.
- When an unexpected schema, identity, authorization, or ownership mismatch appears, stop the affected operation and report it rather than guessing.
