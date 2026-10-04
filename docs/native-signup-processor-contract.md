# Native Signup — Processor Contract

**Status:** FORM-7 Gate A contract; production implementation not yet authorized  
**Effective for development:** 2026-10-04

## Principle

The public signup form never distinguishes first-time signup from re-subscription. It collects the same two substantive inputs in both cases: email address and affirmative consent. Subscriber history is resolved only inside the processor and is never returned to the browser.

## State resolution

For each valid, idempotently staged native signup request, normalize the email and resolve it against the subscriber database immediately before mutation.

### No matching subscriber

Treat as a new signup:

- create one Active subscriber;
- create one profile;
- initialize every active interest to Normal / 1;
- record one Signup Action;
- queue exactly one deterministic WELCOME_V1 message;
- mark the native request processed only after all authorized writes and queue creation succeed.

### One matching Active subscriber

Treat as an idempotent no-op:

- do not create a subscriber, profile or preferences;
- do not change status;
- do not queue another Welcome;
- record the native request as terminal/no-op without revealing this state to the browser.

### One matching Paused subscriber

Treat as an idempotent no-op:

- preserve Paused status;
- preserve the existing profile and preferences;
- do not queue another Welcome;
- require the existing Manage flow for resume behavior;
- record the native request as terminal/no-op without revealing this state to the browser.

### One matching Unsubscribed subscriber

Treat as an explicit re-subscription based on fresh affirmative consent:

- reactivate the existing subscriber by setting Status to Active;
- preserve the existing Profile ID;
- preserve all existing preferences and reading settings;
- do not create a second subscriber, profile or preference set;
- record one Signup Action identifying the result as re-subscribed/reactivated;
- queue exactly one deterministic WELCOME_V1 message for the re-subscription request;
- mark the native request processed only after the status change, Signup Action and queue row succeed.

### Ambiguous or damaged identity

If more than one subscriber matches the normalized email, the profile linkage is missing/ambiguous, or required database structure is inconsistent:

- stop that request;
- make no partial repair;
- create no Welcome row;
- record a privacy-safe error for operator review.

## Idempotency

Native signup uses three layers:

1. **Request ID** — immutable server-generated identity for the staged request.
2. **Client Nonce** — browser-generated retry correlation value. The same nonce/email pair must reuse or no-op the existing request.
3. **Response Key** — deterministic server-generated SHA-256 identity derived from immutable request identity, normalized email and affirmative consent.

The processor must use the Response Key as the durable source identity for Signup Actions and deterministic queue ownership. Replaying an already processed request is a no-op.

A later equivalent request with a new Request ID is evaluated against current subscriber state. This naturally prevents a second Welcome after a successful new signup or re-subscription because the address is then Active.

## Welcome ownership

Production Subscriber Operations may create one Queued WELCOME_V1 row. It must never send the message or change delivery status/provider fields after queue creation. The Resend Welcome dispatcher remains the sole delivery owner.

Before controlled production Gate D, WELCOME_V1 copy must be made accurate for both new and returning subscribers. The current wording says subscribers begin with all interests at Normal, which is false for a returning subscriber whose saved preferences are intentionally preserved. This is a copy/template compatibility requirement, not permission to deploy a production template change during Gate A/B.

## Privacy

The browser receives the same generic accepted response for a valid request regardless of whether the backend later classifies the address as new, Active, Paused or Unsubscribed. No subscriber state, Profile ID, preferences, prior dates or account history are returned.

## Production boundary

This contract does not alter the current production subscriber processor. Production prompt/runtime changes occur only after Gate C DEV parity tests pass and the production-change compatibility checklist is satisfied.
