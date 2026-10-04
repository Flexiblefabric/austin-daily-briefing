# Native Signup — Design and Rollout Baseline

**Status:** FORM-7 Active — Phase 1 design baseline  
**Started:** 2026-10-04  
**Production boundary:** No native signup production writes or public cutover are authorized by this document.

## Goal

Replace the public Google signup handoff with a first-party ADB signup experience while preserving the existing production consent, subscriber/profile creation, preference initialization, Welcome queue ownership, idempotency, and monitoring model.

The first implementation should be parity-first. It should improve the reader experience without changing the meaning of signup or moving ownership away from Production Subscriber Operations and the Resend Welcome dispatcher.

## Current production contract

- Email Address is required.
- Affirmative consent is required: “Yes, sign me up.”
- New subscribers receive a subscriber record and profile.
- Every active interest starts at Normal / score 1.
- The processor records a Signup Action and durable intake identity.
- Exactly one WELCOME_V1 row is queued.
- Production Subscriber Operations does not send the Welcome message.
- The Resend Welcome dispatcher remains the sole owner of Welcome delivery.
- An existing email must never create a duplicate subscriber/profile.

## Reader experience

Create a first-party /signup.html page using the current ADB website design system.

Initial fields are Email Address and a required affirmative consent checkbox. Supporting copy should explain that new subscribers start with every active topic at Normal and can personalize after joining.

The browser must not reveal whether an address already exists. Success/no-op responses remain generic enough to prevent subscriber enumeration.

## Architecture

Use the proven native-customization pattern, but keep signup as a distinct intake type and lifecycle.

### Browser

- static first-party signup.html;
- client-side basic validation for usability only;
- honeypot field;
- request-correlation nonce;
- loading, validation-error, generic-success and recoverable-error states;
- no subscriber lookup and no saved subscriber data returned to the browser.

### Intake endpoint

Use a dedicated DEV Apps Script handler first. It may normalize and validate the email, require affirmative consent, reject unexpected or oversized input, enforce abuse controls, stage one native signup request in DEV, and return only a generic result.

It must not write directly to production Subscribers, Profiles, Preferences, Signup Actions or Outbound Messages; send a Welcome message; expose subscriber state; or reuse customization verification records without an explicit later design decision.

### Processor ownership

Production Subscriber Operations remains the sole subscriber-creation owner after eventual promotion. For an eligible native signup it must, exactly once: establish stable source identity; validate email and consent; prevent duplicate subscribers; create the subscriber/profile; initialize active interests to Normal / 1; record the Signup Action and intake identity; queue exactly one deterministic WELCOME_V1 row; and mark the native request complete only after authorized writes and queue creation succeed.

The Welcome dispatcher remains the sole owner of transport, provider ID, retry, Sent status and delivery monitoring.

## Consent and confirmation boundary

Phase 1 preserves current production signup semantics: affirmative form consent is required, but a new double-opt-in email-confirmation requirement is not silently introduced.

Before production promotion, the project should explicitly decide whether native signup remains parity-equivalent to the Google path or adopts verified/double-opt-in signup. If verification is added, it must not reuse the legacy raw-token Google Verification Form pattern; raw verification tokens may appear only transiently in delivered links and must never be stored.

## Native signup data model

DEV should use a dedicated native signup request table rather than synthetic rows in Google Signup Responses. Minimum fields: Request ID, Created At, normalized Email, Consent, Source, Client Nonce/correlation value, Status, Processed At, Result and Notes.

Do not store unnecessary browser metadata, full IP addresses, raw secrets or token-bearing URLs. A later processor implementation must define a stable native response key with the same idempotency strength as the current Google response-key ledger; it must not depend on mutable row position alone.

## Abuse and privacy controls

At minimum: honeypot no-op, strict field/value allowlists, normalized email validation, per-address cooldown, bounded global submission rate, generic browser responses, duplicate/replay protection, no subscriber enumeration, no browser access to subscriber data, and no raw-token persistence if later verification is adopted.

## Development sequence

### Gate A — design and schema

- approve reader flow and production-boundary model;
- define DEV native signup request schema;
- define stable request/idempotency identity;
- define generic browser responses and abuse limits.

### Gate B — DEV intake

- build non-production signup.html and DEV Apps Script intake;
- keep it outside primary public navigation;
- verify validation, honeypot, rate limiting, malformed input and duplicate browser submissions.

### Gate C — DEV processor parity

Test valid new signup, existing subscriber, invalid email, missing/negative consent, replay, rapid equivalent submissions, partial-write recovery, exactly one Welcome queue row, Normal preference initialization and no direct Welcome send.

### Gate D — controlled production

Only after DEV and the production-change compatibility checklist pass: stage controlled production intake, restrict mutation to a controlled test identity, verify subscriber/profile/preferences/signup-action/ledger/queue outcomes, verify dispatcher ownership, and verify replay creates no duplicate subscriber or Welcome.

### Gate E — public cutover

After explicit approval, point public Join/Get Briefing links to signup.html, retain the Google signup form as operator/fallback, and preserve rollback.

### Gate F — observation

Observe normal production cycles for duplicate creation, queue ownership, Welcome delivery, processor health, abuse controls and unrelated subscriber regressions.

### Gate G — closeout

After a clean observation, mark FORM-7 Complete, leave Google-form retirement to FORM-10, reconcile registry/roadmap/changelog/snapshot, and record final production verification.

## Immediate next implementation step

Build Gate A/B DEV artifacts only: site/signup.html in non-public DEV posture, a dedicated native-signup DEV Apps Script endpoint, DEV request table/schema, and idempotency/abuse-control tests.

No production routing or subscriber writes are authorized yet.
