# Native Management — Design and Rollout Baseline

**Status:** FORM-9 Active — Gate A design approved for DEV implementation  
**Started:** 2026-10-06  
**Target public path:** `/manage.html`  
**Production boundary:** DEV only. Public Manage links remain on the current Google Form until controlled production validation and an explicit cutover decision.

## Goal

Replace the public Google Manage form with a first-party ADB management experience for pause, resume, unsubscribe, and reset-to-Normal requests without weakening ownership verification or changing Production Subscriber Operations ownership.

The native flow must never treat possession of an email address as authorization. Every recognized subscriber request remains pending until a single-use confirmation token delivered to the subscribed inbox is validly confirmed.

## Current Google management contract

The current production Google Manage form collects:

- Subscriber Email Address;
- Delivery Status: Active, Paused, or Unsubscribed;
- Reset all topic preferences to Normal?: No or Yes.

The production processor treats pause, resume, unsubscribe, and reset as protected operations. It uses a 24-hour single-use verification token, stores only the SHA-256 token hash, applies the request only after confirmation, preserves subscriber history, and records the outcome in Management Actions.

FORM-9 preserves those semantics while improving the reader interaction.

## Reader flow

The first native management page uses two independent controls.

### Delivery

- Keep current
- Pause delivery
- Resume delivery
- Unsubscribe

`Resume delivery` maps to the production `Active` state.

### Topic reset

- Leave topic preferences unchanged
- Reset every active topic to Normal

At least one requested change is required. A reader may combine a delivery action with a topic reset, preserving the current Google-form ability to request both in one confirmed operation.

The browser does not show the subscriber's current delivery status or preferences. This avoids turning the management page into an email-address lookup service.

## Status semantics

After valid confirmation, the processor resolves the subscriber's current state immediately before mutation.

| Requested action | Active | Paused | Admin Hold | Unsubscribed |
| --- | --- | --- | --- | --- |
| Keep current | preserve | preserve | preserve | preserve |
| Pause | Paused | no-op | preserve hold | preserve Unsubscribed |
| Resume | no-op | Active | preserve hold | preserve Unsubscribed; re-subscription requires fresh signup consent |
| Unsubscribe | Unsubscribed | Unsubscribed | Unsubscribed | no-op |

A confirmed topic reset may apply regardless of Active, Paused, Admin Hold, or Unsubscribed delivery state because it does not enable delivery. Reset changes only active topic preferences to Normal/1; it does not alter briefing-style settings.

An unsubscribe request is allowed to replace Admin Hold because it is an explicit withdrawal of delivery consent. Pause or resume must never clear an Admin Hold. Resume must never reactivate an Unsubscribed subscriber; fresh affirmative signup consent owns re-subscription.

## Browser and endpoint privacy

The page and endpoint must not reveal whether an email address is subscribed.

For a syntactically valid request, the browser receives the same generic accepted response whether the address is known, unknown, Admin Hold, or Unsubscribed.

Recommended response:

> **Check your inbox.**
>
> If that address is connected to Austin Daily Briefing, we’ll send a confirmation link for the requested change. Nothing changes until the request is confirmed.

Unknown addresses should not create subscriber records or confirmation messages. Privacy-safe diagnostics may record only a one-way email hash prefix and non-sensitive request metadata.

## DEV data model

Use FORM-9-specific DEV sheets so management verification remains isolated from the already-live native customization path.

### Native Manage Requests

- Request ID
- Created At
- Email
- Delivery Action
- Reset Topics
- Payload SHA-256
- Source
- Client Nonce
- Status
- Verification ID
- Confirmed At
- Applied At
- Result
- Notes

Allowed delivery values stored in a request are `keep_current`, `pause`, `resume`, and `unsubscribe`.

`Reset Topics` is stored as `TRUE` or `FALSE`.

The payload hash binds the verified operation to the normalized canonical payload:

`{"delivery_action":"...","reset_topics":true|false}`

### Native Manage Verification Queue

- Verification ID
- Created At
- Expires At
- Email
- Request ID
- Token Hash SHA-256
- Status
- Confirmed At
- Applied At
- Notes

Raw tokens and token-bearing URLs must never be stored.

### Native Manage Diagnostics

- Created At
- Event
- Reason
- Email Hash Prefix
- Client Nonce Present
- Build ID

## Request lifecycle

1. Browser submits email, requested delivery action, reset choice, nonce, and honeypot.
2. DEV endpoint performs strict server-side validation.
3. Unknown/non-unique subscriber identity returns generic success without a management request.
4. A unique DEV subscriber creates one Pending Confirmation request and one Pending verification record.
5. A fresh cryptographically random 32-byte token is delivered only to the subscribed address.
6. Opening the confirmation link does not consume the token.
7. A valid confirmation POST hashes the supplied token and atomically changes the matching verification and request to Confirmed.
8. The DEV processor re-resolves subscriber identity and current status, validates request/verification linkage and payload hash, applies the exact operation once, appends one deterministic Management Actions record, then marks request and verification Applied.
9. Replays after Applied are no-ops.

## Confirmation security

Gate B uses a dedicated DEV management Apps Script project plus a first-party `manage-confirm.html` page. The confirmation email carries the raw token only in the URL fragment, so the token is not sent to the static site host. The first-party page transfers the token only in the explicit confirmation POST body to the DEV Apps Script endpoint. Opening the email link does not consume the token.

This design intentionally avoids coupling FORM-9 to the already-live customization confirmation relay. A signed relay may still be added later if production browser constraints require it, but it is not an ownership requirement when the single-use token remains the authorization factor and the POST path stays isolated.

Requirements:

- 32 random token bytes;
- 24-hour TTL;
- SHA-256 hash only at rest;
- exact request/email binding;
- token consumed only by explicit confirmation POST, never link-open GET;
- expired, cancelled, already-used, or ambiguous tokens fail closed;
- confirmation replay cannot apply a second management action.

## Processor ownership

The public endpoint may stage and confirm requests only. It never mutates Subscribers, Profiles, Preferences, Management Actions, Outbound Messages, or delivery history.

The management processor is the sole owner of applying a confirmed native management request during DEV. Before production promotion, the canonical Production Subscriber Operations automation must become the sole production owner, matching existing Google Manage behavior.

When applying an eligible request, update both Subscribers.Status and Profiles.Status consistently when delivery status changes.

For a reset:

- resolve the active Interest Catalog;
- require exactly one preference row for each existing Profile ID + active Interest ID, or follow the established production append rule only where explicitly allowed;
- set Preference=Normal and Score=1;
- update preference timestamp;
- set Source Submission ID to `NATIVE:MANAGE:<Request ID>`;
- preserve More for You Volume, Summary Style, Why It Matters Length, and unrelated profile fields.

Append exactly one Management Actions record using deterministic Submission ID `NATIVE:MANAGE:<Request ID>`.

## Abuse controls

Initial DEV controls:

- honeypot;
- strict field allowlist;
- request-size limit;
- normalized email validation;
- per-address cooldown;
- bounded per-address window;
- bounded global request window;
- duplicate-equivalent request suppression;
- no subscriber enumeration;
- no raw token logging;
- DEV allowlist when email delivery is enabled.

## Accessibility and presentation

Use the approved ADB site shell and management-oriented fieldsets.

Required:

- semantic form/fieldset/legend;
- visible email label;
- keyboard-operable delivery choices;
- explicit reset checkbox;
- visible focus states;
- no color-only selection state;
- inline and status errors;
- mobile layout without horizontal scrolling;
- destructive unsubscribe option visually distinguishable without relying on color alone.

The DEV page remains `noindex, nofollow` and is not linked from the production Manage navigation.

## Development gates

### Gate A — design and schema

- freeze status/reset semantics;
- define isolated DEV request, verification, and diagnostic schemas;
- define unknown-address/no-enumeration behavior;
- define Admin Hold and Unsubscribed behavior;
- define exactly-once Management Actions ownership.

### Gate B — DEV intake and confirmation

- build `manage.html`, `manage.js`, and DEV config;
- build isolated `NativeManagementDev.gs`;
- validate request parsing, strict field/value allowlists, malformed email, no-change submission, honeypot, rate limits, unknown address, token hashing, expiry, replay and request binding;
- create only DEV sheets/data.

### Gate C — DEV processor parity

Exercise at minimum:

- Active → Paused;
- Paused → Active;
- Active → Unsubscribed;
- already-Unsubscribed unsubscribe no-op;
- Admin Hold + pause preserves hold;
- Admin Hold + resume preserves hold;
- Admin Hold + unsubscribe becomes Unsubscribed;
- Unsubscribed + resume remains Unsubscribed;
- reset-only;
- pause + reset;
- resume + reset;
- unsubscribe + reset;
- exactly one Management Actions row;
- processor replay no-op;
- partial/ambiguous state fail-closed;
- no direct email delivery or subscriber creation.

### Gate D — DEV end-to-end browser confirmation

- deploy the isolated DEV Apps Script endpoint;
- connect `manage.html` and `manage-confirm.html` to that endpoint;
- run a controlled inbox test through request → email → first-party confirmation → processor → readback;
- verify the token is never written to Sheets, logs, repository files, or query-string URLs;
- verify customization confirmation remains unchanged.

### Gate E — controlled production

Stage production management sheets/endpoint disabled first, complete compatibility checks, restrict to one controlled address, confirm each protected action class without affecting unrelated subscribers.

### Gate F — public cutover

After explicit approval, point public Manage links to `manage.html`; retain Google Manage as fallback.

### Gate G — observation and closeout

Observe normal management activity, confirmation, processor application, idempotency and unrelated delivery health. Retire the Google fallback only through FORM-10.

## Production non-goals during DEV

FORM-9 DEV work must not:

- change the current public Manage link;
- alter the production Google Manage form;
- change production subscriber status or preferences;
- change production confirmation relay behavior;
- modify FORM-7 Gate F observation state;
- retire any Google form.
