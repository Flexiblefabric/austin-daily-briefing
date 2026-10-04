# Native Signup — Production Processing Contract

**Status:** FORM-7 Gate D staging  
**Production mutation:** Not authorized by this document alone

This contract defines the production Subscriber Operations behavior that will be integrated into the canonical six-hour processor only after Gate D preflight passes.

## Gating

Native signup is controlled independently from native customization so the live customization path does not need to be downgraded during signup testing.

Production `Integration Config` will add:

- `Native Signup Mode` — `DISABLED`, `CONTROLLED`, or `LIVE`;
- `Native Signup Controlled Email` — required only in `CONTROLLED`.

The existing shared `Processor Mode` remains authoritative for whether the production processor is native-capable:

- `GOOGLE + NATIVE CONTROLLED`
- `GOOGLE + NATIVE`

FORM-7 introduces **no new shared Processor Mode or Intake Mode value**. This preserves compatibility with the Welcome and Daily Resend dispatchers.

If `Native Signup Mode` is absent, blank, or `DISABLED`, Subscriber Operations must not read or mutate `Native Signup Requests`.

## Authoritative production-native tabs

In production intake:

- `Native Signup Requests`
- `Native Signup Diagnostics` — operational evidence only; never authorization

A request is eligible only when:

- Status = `Staged`;
- Source = `NATIVE_SIGNUP_PROD`;
- Request ID matches `NSPROD-<UUID>`;
- Response Key is a 43-character URL-safe SHA-256 identifier;
- Email is normalized and valid;
- Consent = `Yes`;
- there is exactly one request row for the Request ID;
- no existing native Signup Action or Welcome row uses that Response Key.

In `CONTROLLED`, the normalized request email must exactly equal `Native Signup Controlled Email`. Any other native signup row is skipped and reported as outside the controlled gate.

## Processing order

Preserve the existing Google-first ownership model.

Per production run:

1. process Google Signup responses;
2. process eligible Native Signup requests;
3. process Manage responses;
4. process Google Customize responses;
5. process eligible Google confirmations;
6. process eligible confirmed Native Customize requests.

Google Signup runs first so an address submitted through both paths in the same cycle becomes Active through the established Google path; the subsequent native request then resolves as an Active no-op rather than creating duplicate identity.

## Subscriber-state resolution

Immediately before any write, normalize the email and re-read Subscribers, Profiles, Preferences, Signup Actions, Outbound Messages, and the native request.

### No matching subscriber

Create a new subscriber using the same production semantics as Google Signup:

- allocate exactly one next sequential production Profile ID;
- create one Active subscriber;
- create one Active profile;
- initialize all 23 active interests to Normal / score 1;
- set standard initial reading settings;
- record one Signup Action with Submission ID `NATIVE:SIGNUP:<Response Key>`;
- queue one `WELCOME_V1` row with Message ID `WELCOME-NATIVE:<Response Key>`;
- do not send the Welcome;
- mark the request Processed only after all authorized writes and queue creation succeed.

### Existing Active subscriber

Terminal no-op:

- preserve subscriber/profile/preferences;
- create no Signup Action;
- create no Welcome;
- mark request `Processed / existing_active_noop`.

### Existing Paused subscriber

Terminal no-op:

- preserve Paused status;
- preserve profile/preferences;
- create no Signup Action;
- create no Welcome;
- mark request `Processed / paused_requires_manage`.

Resume remains an explicit Manage action.

### Existing Admin Hold subscriber

Terminal no-op:

- preserve Admin Hold status;
- preserve profile/preferences;
- create no Signup Action;
- create no Welcome;
- mark request `Processed / admin_hold_noop`.

A signup request must never clear or bypass an administrative hold. Only an explicit operator action may change Admin Hold.

### Existing Unsubscribed subscriber

Fresh affirmative signup consent is explicit re-subscription:

- reuse the existing subscriber and Profile ID;
- change subscriber Status to Active;
- preserve every existing preference row and reading-style setting;
- do not create a second subscriber/profile/preferences set;
- record one Signup Action with Submission ID `NATIVE:SIGNUP:<Response Key>` and Subscriber Result `Reactivated`;
- queue exactly one `WELCOME_V1` row with Message ID `WELCOME-NATIVE:<Response Key>`;
- do not send the Welcome;
- mark the request `Processed / resubscribed` only after status/action/queue writes succeed.

## Crash boundary and partial state

For new signup or re-subscribe:

1. Re-read all identities and deterministic artifact IDs.
2. If a matching Signup Action or Welcome row already exists while the request is still Staged, stop and report partial/ambiguous state. Do not auto-repair.
3. Set request Status = `Processing` before the first subscriber-database mutation.
4. Perform the authorized writes.
5. Flush.
6. Mark request Processed.

A request found in `Processing` on a later run is fail-closed and requires operator reconciliation. Subscriber Operations must not guess which writes completed.

Active/Paused no-op cases may move directly from Staged to Processed because they make no subscriber mutation.

## Duplicate-header compatibility

Production `Preferences` contains duplicate `Profile ID` headers. Any row-to-object parser used by native signup must preserve the **first** occurrence of a duplicate header. A later duplicate column must never overwrite the canonical first value.

This rule is required for re-subscribe preference preservation and was proven in Gate C against legacy DEV rows.

## Welcome ownership

Subscriber Operations may append one Queued `WELCOME_V1` row. It must never send the message or modify delivery/provider fields afterward.

The Resend Welcome dispatcher remains sole owner of:

- eligibility recheck immediately before delivery;
- Resend handoff;
- provider message ID;
- Sent/Failed status;
- retry behavior.

The repository Welcome renderer uses state-neutral settings language so the same `WELCOME_V1` is accurate for new and returning subscribers.

## Monitoring and reporting

Subscriber Operations must add native-signup counts to its run result without impersonating the Welcome Dispatcher:

- native signup inspected;
- new subscribers;
- re-subscribed;
- Active no-op;
- Paused no-op;
- Admin Hold no-op;
- skipped outside controlled gate;
- native signup errors.

A zero-work pass remains successful.

## Gate D controlled-production pass criteria

Before public cutover:

- production endpoint installed separately from the native-customization web app;
- `Native Signup Mode = CONTROLLED`;
- endpoint Script Property mode = `CONTROLLED`;
- controlled email matches the endpoint allowlist;
- production sheets exist with exact headers;
- canonical Subscriber Operations prompt is updated and scheduler copy synchronized;
- manually installed production runtime source is proven current;
- compatibility matrix for Subscriber Operations, Welcome dispatcher, Daily dispatcher, watchdog/completion monitoring is PASS;
- one controlled production identity completes the expected state transition;
- exactly one Welcome is queued and delivered by the dispatcher;
- provider ID is recorded by dispatcher only;
- replay creates no duplicate subscriber/action/Welcome;
- no non-allowlisted address is processed.

Gate D passing does not make `signup.html` public. Public routing remains a separate Gate E approval.
