# Reader destination policy

**Specification ID:** ADB-READER-DESTINATIONS-1.0  
**Status:** Active  
**Runtime enforcement:** `apps-script/ResendTransport.gs`  
**CI enforcement:** `tests/reader-destination-policy.test.js`

This policy defines which reader-facing destination is authoritative for each subscriber or trust function and what role, if any, a Google Form may still play during migration.

| Role | State | Reader-facing primary | Google Form status |
| --- | --- | --- | --- |
| Website | NATIVE_PRIMARY | https://austindailybriefing.com/ | None |
| Signup | NATIVE_PRIMARY | https://austindailybriefing.com/signup.html | Temporary public fallback during remaining observation; intended to become operator-only |
| Customize | NATIVE_PRIMARY | https://austindailybriefing.com/customize.html | Operator-only; prohibited in normal reader-facing email and public navigation |
| Manage | LEGACY_PRIMARY | Current Google management form | Public primary until native management is promoted; https://austindailybriefing.com/manage.html remains a non-public candidate during development |
| Feedback / Corrections intake | LEGACY_PRIMARY | Current Google Feedback & Corrections form | Public primary until the native intake is promoted |
| Corrections log | NATIVE_PRIMARY | https://austindailybriefing.com/corrections.html | None |
| Privacy | NATIVE_PRIMARY | https://austindailybriefing.com/privacy.html | None |
| Terms | NATIVE_PRIMARY | https://austindailybriefing.com/terms.html | None |

## Enforcement model

The runtime policy object `ADB_READER_DESTINATIONS` is the delivery-time authority. The dispatcher validates the actual plain-text and HTML payload immediately before provider handoff. Required primary destinations must appear in both bodies, the queued `Customize URL` value must equal the native Customize destination, operator-only fallbacks are rejected, and any Google Form not explicitly authorized for that message context is rejected.

Daily briefing delivery requires Website, Customize, Manage, Feedback / Corrections, Corrections Log, Privacy, and Terms. Welcome delivery requires Customize, Manage, Feedback / Corrections, Privacy, and Terms. The historical sender-change message requires Website, Customize, and Manage.

CI separately scans public HTML and controlled email fixtures. It derives allowed Google Form exposure from the lifecycle states in `ADB_READER_DESTINATIONS`. This is deliberate: when Manage or Feedback / Corrections is promoted to `NATIVE_PRIMARY`, stale Google Form links should fail CI until they are removed from reader-facing surfaces.

## Migration rule

Google Forms are migration fallbacks, not long-term public destinations. The intended end state is that all Google Forms are operator-only and absent from normal reader-facing website navigation and email.

A native promotion must be atomic:

1. Promote the native endpoint only after its production gate is accepted.
2. Change the role's policy state and primary destination in `ADB_READER_DESTINATIONS`.
3. Change the former Google Form to `OPERATOR_ONLY`.
4. Replace reader-facing links in website, email fixtures, generation specifications, and templates in the same change.
5. Require CI to pass with no stale public destination.
6. Copy the current `ResendTransport.gs` to the production Apps Script project and run `getAdbResendRuntimeStatusV1()` plus `validateReaderDestinationPolicyV1()` for readback.

Do not create an outage exception that exposes an operator-only Google Form to readers. If a native reader path is unavailable after promotion, fail closed or use an explicitly approved reader-safe contingency rather than silently reverting public links.
