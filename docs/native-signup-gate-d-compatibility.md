# Native Signup — Gate D Compatibility Matrix

**FORM-7:** Gate D controlled production  
**Status:** STAGING — activation blocked  
**Date:** 2026-10-04

This matrix applies the project-wide production-change compatibility checklist to native signup. A PASS requires evidence from the executable consumer. FAIL or UNKNOWN blocks controlled-production activation.

| Changed / consumed state | Consumer | Runtime copy | Accepted state / behavior | Result | Evidence / remediation |
| --- | --- | --- | --- | --- | --- |
| Shared Intake Mode / Processor Mode | Welcome Resend dispatcher | Production Apps Script | Accepts `GOOGLE ONLY`, `GOOGLE + NATIVE CONTROLLED`, `GOOGLE + NATIVE` | PASS (repository) / UNKNOWN (runtime parity) | `apps-script/ResendTransport.gs` accepts all three values. Before Gate D activation, manually installed runtime must be synchronized from approved main and rechecked. |
| Shared Intake Mode / Processor Mode | Daily Resend dispatcher | Production Apps Script | Same three accepted values | PASS (repository) / UNKNOWN (runtime parity) | Same validator as Welcome. No new shared mode will be introduced by FORM-7. Runtime parity still required. |
| Native signup request intake | Native signup production endpoint | Separate production Apps Script web app | CONTROLLED/LIVE feature gate, exact production IDs, DEV refusal, minimal staging only | PASS (repository) / UNKNOWN (runtime) | `apps-script/NativeSignupProd.gs` plus `tests/native-signup-prod.test.js`. Dedicated production deployment does not yet exist. |
| Native signup subscriber mutation | Production Subscriber Operations | ChatGPT scheduled task using canonical prompt | Current canonical prompt has no Native Signup Requests section | FAIL | Integrate `docs/native-signup-production-processing.md` into canonical Subscriber Operations prompt, preserve Google/native-customization behavior, merge, then synchronize scheduler copy. |
| Native signup feature gate | Production Integration Config | Production intake workbook | `Native Signup Mode` / `Native Signup Controlled Email` absent | FAIL | Add rows initially as DISABLED / blank after repository staging passes. Shared Processor Mode remains unchanged. |
| Native signup request storage | Production intake workbook | Google Sheets | Native Signup Requests / Diagnostics absent | FAIL | Create exact schema after staging checks pass. Empty schema only; no subscriber mutation. |
| Signup-to-Welcome monitoring | 09:30 production watchdog | ChatGPT scheduled task | Current Signup Completion scan reads Google Signup Responses + Google Intake Ledger only | FAIL | Extend completion scan to include eligible Native Signup Requests and native deterministic Signup Action/Welcome IDs when Native Signup Mode is CONTROLLED/LIVE. No alert broadening without explicit decision. |
| Manual completion reconciler | Development/manual canonical prompt | Repository prompt | Current reconciler scans Google signup responses only | FAIL | Extend reusable read-only reconciliation contract to native journeys before Gate D evidence review. |
| Welcome message content | Welcome renderer | Repository source / production Apps Script runtime | Repository copy is state-neutral for new + returning subscribers | PASS (repository) / UNKNOWN (runtime parity) | CI test passes. Production Apps Script must be synchronized before controlled Welcome delivery. |
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
