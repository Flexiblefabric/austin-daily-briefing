# Native Signup — Gate D Compatibility Matrix

**FORM-7:** Gate D controlled production  
**Status:** STAGING — activation blocked  
**Date:** 2026-10-04

This matrix applies the project-wide production-change compatibility checklist to native signup. A PASS requires evidence from the executable consumer. FAIL or UNKNOWN blocks controlled-production activation.

| Changed / consumed state | Consumer | Runtime copy | Accepted state / behavior | Result | Evidence / remediation |
| --- | --- | --- | --- | --- | --- |
| Shared Intake Mode / Processor Mode | Welcome Resend dispatcher | Production Apps Script | Accepts `GOOGLE ONLY`, `GOOGLE + NATIVE CONTROLLED`, `GOOGLE + NATIVE` | PASS | Repository compatibility and 2026-10-05 production runtime validator both passed; no delivery invoked. |
| Shared Intake Mode / Processor Mode | Daily Resend dispatcher | Production Apps Script | Same three accepted values | PASS | Shared production transport validator passed on 2026-10-05; no mode change and no delivery invoked. |
| Native signup request intake | Native signup production endpoint | Separate production Apps Script web app | CONTROLLED/LIVE feature gate, exact production IDs, DEV refusal, minimal staging only | PASS (repository) / UNKNOWN (runtime) | `apps-script/NativeSignupProd.gs` plus `tests/native-signup-prod.test.js`; runtime readback uses `getNativeSignupProdRuntimeStatusV1` and fail-closed preflight uses `validateNativeSignupProdPreflightV1`. Dedicated production deployment does not yet exist. |
| Native signup subscriber mutation | Production Subscriber Operations | ChatGPT scheduled task using canonical prompt | Canonical and scheduler copy both require `ADB-SUBOPS-PROD-1.1`; task enabled | PASS | Live scheduler metadata verified after merge; Native Signup Mode remains DISABLED. |
| Native signup feature gate | Production Integration Config | Production intake workbook | `Native Signup Mode = DISABLED`; controlled email blank; shared Processor Mode still `GOOGLE + NATIVE` | PASS — inert install | D2 read-back verified exact values. Activation still blocked until controlled email and runtime gates are deliberately armed. |
| Native signup request storage | Production intake workbook | Google Sheets | Native Signup Requests / Diagnostics installed with exact approved headers and no data rows | PASS — inert install | D2 read-back verified both tables are empty except headers. |
| Signup-to-Welcome monitoring | 09:30 production watchdog | ChatGPT scheduled task | Canonical and scheduler copy require `ADB-WATCHDOG-PROD-2.4`; scheduler enabled/current-day run verified October 5 | PASS — prompt parity and enabled operational state | October 5 follow-up resolves the October 4 disabled-state blocker; other native controlled-production evidence remains separately gated. |
| Manual completion reconciler | Development/manual canonical prompt | Repository prompt | `ADB-COMPLETION-RECON-0.2` supports Google + feature-gated native journeys | PASS (repository) | Native Signup Mode DISABLED preserves prior Google-only scan behavior. |
| Welcome message content | Welcome renderer | Repository source / production Apps Script runtime | Repository copy is state-neutral for new + returning subscribers | PASS | CI and 2026-10-05 production runtime validator both confirm return-safe Welcome copy; no delivery invoked. |
| Website signup browser | GitHub Pages | `site/signup.html`, `signup.js`, `signup-config.js` | DEV endpoint only; noindex/unlinked | PASS for non-public staging | Keep DEV config during Gate D. Controlled production testing must use an isolated test invocation or non-public config; public CTA remains Google Form until Gate E. |
| Welcome queue ownership | Subscriber Operations + Welcome dispatcher | Prompt + Apps Script | Processor may queue; dispatcher alone sends | PASS by contract / UNKNOWN until prompt integration | Gate C proved ownership in DEV. Production prompt integration and runtime parity still required. |
| Daily briefing delivery independence | Daily generator + dispatcher | Scheduler + Apps Script | Native signup must not change generation or queue ownership | PASS by design / UNKNOWN runtime parity | Shared mode remains unchanged; production compatibility check still requires exact runtime source parity. |

## Activation blockers

Controlled Gate D production activation is prohibited until all of the following are PASS:

1. production endpoint repository QA;
2. empty production native-signup sheets installed with exact headers;
3. Integration Config native-signup rows installed as DISABLED;
4. separate production Apps Script project deployed with endpoint disabled;
5. canonical Subscriber Operations integration merged and scheduler copy synchronized;
6. watchdog and completion reconciler understand native signup journeys;
7. Welcome/Daily Apps Script runtime parity established against current `main`;
8. one controlled address is selected and explicitly allowlisted;
9. a pre-activation read-only compatibility rerun reports no FAIL/UNKNOWN for executable consumers.

## No-mode-change decision

FORM-7 does **not** introduce a new `Intake Mode` or `Processor Mode`. Production remains on its existing native-capable shared mode. Native signup is independently gated by `Native Signup Mode`, which prevents a controlled signup rollout from restricting the already-live native customization path.


## D2 evidence

The inert production schema/config installation completed on 2026-10-04 after a fresh private backup of the production intake workbook.

Verified unchanged shared state:

- production Intake Mode = `GOOGLE + NATIVE`;
- production Processor Mode = `GOOGLE + NATIVE`.

Verified new disabled state:

- Native Signup Mode = `DISABLED`;
- Native Signup Controlled Email = blank;
- Native Signup Requests = headers only;
- Native Signup Diagnostics = headers only.

No native signup runtime is deployed and no processor/monitoring prompt consumes the new tables yet. Those remain blocking FAIL/UNKNOWN items above.


## D4 repository compatibility evidence

Repository contracts now agree on the same feature gate and ownership model:

- Subscriber Operations: `ADB-SUBOPS-PROD-1.1`;
- completion contract: `ADB-COMPLETION-0.2`;
- manual reconciler: `ADB-COMPLETION-RECON-0.2`;
- production watchdog: `ADB-WATCHDOG-PROD-2.4`;
- native production processing: `ADB-NATIVE-SIGNUP-PROD-0.1`;
- native monitoring extension: `ADB-NATIVE-SIGNUP-MONITOR-0.1`.

The cross-contract CI gate requires:

- Native Signup Mode DISABLED means no Native Signup Requests processing/reconciliation;
- deterministic native Signup Action and Welcome identities agree across processor and monitoring;
- Admin Hold is a terminal no-op and cannot be cleared by signup;
- the production watchdog does not broaden the promoted alert class;
- no new shared Intake Mode or Processor Mode is introduced;
- Resend transport still accepts the existing `GOOGLE + NATIVE` mode.

Scheduler-copy parity remains UNKNOWN until the active Subscriber Operations and watchdog tasks are synchronized after merge.


## D4 scheduler synchronization

Post-merge live scheduler metadata was verified on 2026-10-04:

- Production Subscriber Operations task `6aa1acbcf17c8191a9a89cc95b433629` is enabled and now requires `ADB-SUBOPS-PROD-1.1`.
- At the October 4 synchronization check, ADB Production Watchdog task `6aa8401e16a88191ae14ba1b4d6cba6e` required `ADB-WATCHDOG-PROD-2.4` and was disabled; October 5 live readback confirms the same task enabled on the unchanged 09:30 America/Chicago schedule.

No schedule was changed. No task was enabled or disabled as part of FORM-7 synchronization.

Therefore D4 prompt parity is complete and the later October 5 watchdog readback resolves the operational-state blocker. D3/runtime parity and controlled-test requirements remain.

## D5 read-only preflight — 2026-10-04

Current executable-consumer result:

- production schema/config: **PASS — inert**;
- Subscriber Operations canonical + scheduler prompt parity: **PASS**;
- native-signup endpoint repository source: **PASS**;
- native-signup endpoint runtime preflight: **PASS — installed disabled/inert**;
- native-signup deployment URL record: **PASS — exact `/exec` URL stored privately in production Integration Config**;
- Resend repository compatibility + return-safe Welcome copy: **PASS**;
- Resend production runtime parity: **PASS — non-sending validator passed October 5**;
- watchdog prompt parity: **PASS**;
- watchdog operational state: **PASS — enabled/current-day monitoring verified October 5**;
- public website isolation: **PASS — Google signup remains public; native signup remains DEV/noindex/unlinked**;
- Admin Hold safety fixture: **PASS — available**;
- controlled mutating identity: **PASS — operator-owned deliverable QA identity selected and stored privately; not yet armed**.

The production Integration Config remains `Native Signup Mode = DISABLED` with blank controlled email, and both native-signup production sheets remain header-only.

Runtime parity must use the repository status probes documented in `docs/native-signup-gate-d-runtime-preflight.md`. No dispatcher invocation is required merely to prove source/config parity.

### D6 readiness update — 2026-10-05

The separate production endpoint deployment and operator-owned mutating QA identity are now recorded privately. The retained Admin Hold safety target is prepared in Integration Config while Native Signup Mode remains DISABLED. No endpoint allowlist or enable gate is active yet, so controlled production mutation remains blocked until the runtime properties are deliberately armed.
