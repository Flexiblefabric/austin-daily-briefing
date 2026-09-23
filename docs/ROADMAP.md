# Austin Daily Briefing Roadmap

**Status:** Active project backlog  
**Last reconciled:** 2026-09-23  
**Scope:** Cross-project work that is pending, blocked, deferred, or recently completed  
**Technical state authority:** [`PROJECT_STATE.json`](../PROJECT_STATE.json)

This file is the durable project-level backlog for Austin Daily Briefing. Component specifications and runbooks define how work is performed; this roadmap records whether that work is still pending and what it depends on.

Use these states:

- **Ready** — can be worked now without another product decision.
- **Active** — work is underway.
- **Blocked** — waiting on a known dependency.
- **Review** — implementation is complete enough to require human review or an explicit promotion decision.
- **Deferred** — deliberately outside the current work sequence.
- **Complete** — finished; retained here only when recent completion helps explain current state.

## Current priorities

| ID | Workstream | Task | State | Dependency / next step |
| --- | --- | --- | --- | --- |
| OPS-1 | Completion monitoring | Close out the first 24-hour signup-to-Welcome observation in repository evidence | Complete | Durable retrospective result recorded; original ephemeral scheduler transcript not claimed |
| OPS-2 | Completion monitoring | Mark the one-time completion-observation prompt/task lifecycle complete or retired | Complete | Prompt retired; completed task ID recorded in technical registry |
| OPS-3 | Completion monitoring | Define reusable read-only signup-to-Welcome reconciler state: high-water mark, overlap window, retention, recovery | Complete | Initial implementation uses safer stateless full-scan; future incremental-state rules documented; reusable manual prompt added |
| OPS-4 | Completion monitoring | Exercise the documented DEV completion test vectors | Complete | 15/15 documented vectors passed in the controlled synthetic DEV harness; mutation guard passed; result recorded in `end-to-end-completion-dev-test-result.md` |
| OPS-5 | Completion monitoring | Stage the first completion incident class after clean DEV validation | Complete | `Unhealthy — intake incomplete` promoted into `ADB-WATCHDOG-PROD-2.1` after 15/15 DEV vectors, 10/10 alert-policy checks, controlled inbox confirmation, and pre-promotion production baseline review |
| OPS-6 | Task reconciliation | Reconcile registered active ChatGPT tasks against live scheduler metadata | Complete | 2026-09-22 baseline matches all three registered active ADB tasks |
| OPS-7 | Task reconciliation | Define scheduler latency/unavailable-metadata handling and reusable reconciliation report | Complete | Runbook defines health/Unknown behavior, existing component tolerances, and next-run metadata limits |
| OPS-8 | Task reconciliation | Verify installed Apps Script welcome/daily dispatcher triggers and define trigger-health evidence | Blocked | Requires Apps Script runtime/trigger visibility; queue history alone is insufficient |
| OPS-9 | Task reconciliation | Test missing/disabled/mismatched task and trigger scenarios without disrupting production | Blocked | OPS-7 and a safe controlled test method |
| OPS-10 | Monitoring rollout | Integrate approved completion/task reconciliation into existing 09:30 watchdog | Blocked | Completion intake-incomplete class is now integrated; task/trigger reconciliation portion remains blocked by OPS-8 and safe controlled mismatch testing |
| OPS-11 | Monitoring rollout | Observe first two promoted production cycles and one failure/recovery path | Blocked | OPS-10 |
| V2-1 | V2 selection engine | Resume shadow runs through the planned 2026-09-26 decision point | Blocked | Compute availability; next testing resumes when credits return |
| V2-2 | V2 selection engine | Add counterfactual V2 shadow-history continuity to evaluation | Complete | Added in `ADB-V2-SHADOW-0.3`; remaining runs use V2's own prior shared selections for repeat control |
| V2-3 | V2 selection engine | Tighten proposal/adoption and source-verification language | Complete | `0.3` requires explicit procedural status; scoring model unchanged |
| V2-4 | V2 selection engine | Align legacy event-section terminology with current Austin Ahead naming | Complete | Canonical shadow prompt now uses Austin Ahead |
| V2-5 | V2 selection engine | Reconcile registry V2 specification ID with canonical shadow specification | Complete | Registry now tracks `ADB-V2-SHADOW-0.3` |
| V2-6 | V2 selection engine | Complete shadow evidence log without double-counting recurring discoveries | Blocked | V2-1 |
| V2-7 | V2 selection engine | Conduct formal promotion-readiness review | Blocked | Complete observation window through 2026-09-26 |
| V2-8 | V2 selection engine | Build controlled production-promotion plan if review supports promotion | Blocked | V2-7 and explicit promotion approval |
| WEB-1 | Website | Correct Open Graph/Twitter image references to the active `social-preview.png` asset | Complete | Home, How ADB Works, and What's New now point to the current PNG card |
| WEB-2 | Website | Close out website-redesign implementation documentation after successful PR #23 deployment | Complete | Implementation record now reflects production promotion and successful Pages deployment |
| WEB-3 | Website | Promote website design specification status from draft to approved/implemented | Complete | Canonical design spec status reconciled |
| WEB-4 | Website | Record a concise post-fix live-site verification | Review | After WEB-1 deployment |
| FORM-1 | Native subscriber forms | Define native-form architecture, security model, and migration rules while preserving the Google Sheets + Apps Script control plane | Active | Design work can proceed now; no production writes yet |
| FORM-2 | Native customization | Design the first-party customization page and map every field to the existing customization intake schema | Active | Draft design in `docs/native-customization-design.md`; security/UX review next |
| FORM-3 | Native customization | Build a non-production Apps Script intake endpoint that accepts validated website submissions and writes to the existing customization intake path | Blocked | FORM-2 and security review |
| FORM-4 | Native customization | Add subscriber verification for preference changes using single-use, scoped confirmation links and hashed tokens | Blocked | FORM-1 security model |
| FORM-5 | Native customization | Run DEV parity/idempotency/security tests against the existing processor before any production cutover | Blocked | FORM-3 and FORM-4 |
| FORM-6 | Native customization | Promote the native customization page while retaining the Google Form as an operator/fallback path | Blocked | FORM-5 and explicit promotion approval |
| FORM-7 | Native signup | Design and implement first-party signup while preserving the existing consent, subscriber creation, and Welcome queue workflow | Deferred | Complete native customization rollout first |
| FORM-8 | Native feedback | Design and implement first-party feedback/corrections intake with current retention and privacy rules | Deferred | After signup or when operational capacity allows |
| FORM-9 | Native management | Design authenticated pause/resume/reset/unsubscribe flows using signed or single-use verification rather than email-only identity | Deferred | Security model proven in customization/signup |
| FORM-10 | Native forms | Decide whether and when public Google Forms can be retired; retain background/fallback forms until native flows have sustained production evidence | Deferred | Successful rollout of preceding native forms |
| SEC-1 | Subscriber data security | Document data classification, access-control baseline, retention, incident-response, and periodic access review for subscriber email/preference data | Ready | Can be completed without infrastructure migration |
| SEC-2 | Subscriber data security | Audit production Drive/Sheet sharing, folder inheritance, editor rights, account MFA, Apps Script access, and external collaborators | Ready | Manual Google account/Drive review |
| SEC-3 | Subscriber data security | Minimize stored subscriber data and identify preference fields that could reveal sensitive characteristics; avoid collecting unnecessary sensitive data | Ready | SEC-1 |
| SEC-4 | Subscriber data security | Define breach-response and notification decision path, including vendor incidents and Texas-law review | Ready | SEC-1 |
| FRI-1 | Friday edition | Define the purpose and anatomy of the improved Friday weekly recap | Ready | Keep separate from V2 promotion |
| FRI-2 | Austin Weekend Explorer | Define Weekend Explorer as the richer Friday utility layer and its relationship to Austin Ahead | Ready | Product-design work |
| FRI-3 | Austin Weekend Explorer | Define discovery sources, selection rules, section anatomy, and length limits | Blocked | FRI-2 |
| FRI-4 | Austin Weekend Explorer | Decide restrained imagery rules for Friday Explorer | Deferred | After Explorer editorial structure is approved |
| HOW-1 | How ADB Works | Replace V2-in-development language with the promoted selection model | Blocked | V2 promotion |
| COMMS-1 | Product communication | Maintain reader-facing What’s New entries for meaningful releases | Active | Operating practice; no standing daily quota |
| COMMS-2 | Product communication | Consolidate newsletter notice / website update / Welcome change / dedicated-email decision rules | Complete | `docs/reader-change-communications.md` added |
| DOC-1 | Documentation | Maintain this roadmap as the canonical cross-project backlog | Active | Reconcile after material project changes |
| DOC-2 | Repository hygiene | Review stale merged/development branches and document deletion/retention policy | Deferred | Low operational value; do not delete branches automatically |

## Native subscriber forms roadmap

The long-term goal is to replace jarring public Google Form handoffs with first-party ADB forms while keeping the existing Google Sheets + Apps Script subscriber system as the operational backend unless a later need justifies migration.

### Stage 0 — Security and architecture foundation

Before the first native form accepts production data:

- classify the data ADB stores: email address, subscription state, preferences, verification state, delivery metadata, and limited operational history;
- identify any preference choices that could reveal or strongly imply sensitive characteristics and treat them more conservatively;
- document least-privilege access to production Sheets, Drive folders, Apps Script, Resend, and related operator accounts;
- require MFA on accounts with production data or code access;
- verify production Sheets and parent folders are Restricted, not link-accessible;
- review inherited folder permissions and remove unnecessary editors/collaborators;
- ensure raw verification tokens are never stored; retain the existing hashed-token model;
- define retention/deletion rules for intake rows, confirmations, inactive subscribers, and operational logs;
- define a lightweight incident-response path for unauthorized access, accidental sharing, credential compromise, and vendor breach notifications;
- document a recurring access review, initially quarterly.

The target is **reasonable, proportionate security without replacing the current control plane**.

### Stage 1 — Native customization

This is the first reader-facing migration because it is bounded and does not create a new subscriber identity.

#### Product/design

- create `/customize.html` using the current website design system;
- preserve all current customization options and explanatory copy unless explicitly revised;
- make the subscriber email field and verification requirement clear;
- provide inline validation, accessible error messaging, loading state, and ADB-branded success/pending-confirmation states;
- design mobile behavior and keyboard navigation;
- add concise privacy/security copy without exposing implementation details.

#### Intake/backend

- map every website field to the existing customization response schema;
- create a narrow Apps Script web endpoint or equivalent Apps Script handler that accepts only the expected fields;
- validate and normalize inputs server-side;
- reject unexpected fields, malformed addresses, oversized values, and invalid option values;
- write accepted submissions into the existing intake/ledger path so the current subscriber processor remains authoritative;
- preserve source identity/idempotency semantics or define an explicit native-source equivalent;
- avoid placing subscriber data, raw tokens, or private endpoint secrets in GitHub or browser-visible configuration.

#### Verification/security

- do not treat possession of an email address as sufficient authorization to change stored preferences;
- create a fresh single-use verification request scoped to the submitted email and exact preference change;
- store only a hash of the verification token;
- use a short expiry consistent with current subscriber-management rules unless deliberately revised;
- consume the token only after a valid confirmation action;
- provide generic responses that do not reveal whether an address is subscribed;
- rate-limit or otherwise constrain repeated requests enough to reduce abuse and confirmation-email flooding.

#### Testing and promotion

- test field parity against the Google customization form;
- test blank/no-change behavior;
- test duplicate/replay handling;
- test unknown email behavior without account enumeration;
- test expired, reused, altered, and wrong-scope confirmation links;
- confirm the existing processor applies exactly one change;
- confirm no direct email send bypasses current delivery ownership;
- run controlled DEV submissions before production;
- retain the Google Form as a fallback/operator path during the first production observation window;
- update Privacy, How ADB Works, Operations, Architecture, and subscriber-operation documentation only where behavior materially changes.

### Stage 2 — Native signup

After customization is stable:

- build first-party signup on the homepage or a dedicated subscribe page;
- preserve explicit subscription consent;
- validate email input and anti-abuse controls;
- submit into the existing signup intake path;
- preserve idempotent subscriber creation/reactivation;
- preserve the current single Welcome queue ownership model;
- keep the existing confirmation/verification behavior where required;
- provide an ADB-branded post-submit state;
- test duplicate signup, reactivation, malformed input, and Welcome queue replay protection;
- retain the Google signup form as fallback until the native path has sustained production evidence.

### Stage 3 — Native feedback and corrections

- build an ADB-branded feedback/corrections page;
- preserve the current distinction between feedback, possible corrections, and other messages;
- keep email collection only where operationally necessary;
- preserve the current deletion/retention rule for complete submissions and submitter email;
- add spam/abuse constraints;
- keep confirmed corrections publication separate from raw submissions;
- preserve the public Corrections log workflow.

### Stage 4 — Native subscription management

This stage requires the strongest identity controls.

- create first-party pause, resume, reset, and unsubscribe flows;
- prefer signed links from subscriber emails or single-use verification over email-only authorization;
- bind each verification request to the exact requested action and address;
- avoid revealing subscription existence before verification;
- preserve idempotency and audit history;
- support safe expired-link recovery;
- test replay, wrong-address, wrong-action, and duplicate-submit cases;
- keep the existing management form available as a controlled fallback until the native flow is proven.

### Stage 5 — Google Form retirement review

Only after native flows have stable production evidence:

- compare failure rates, abuse rates, completion rates, and operator workload;
- decide whether each Google Form remains useful as an operator fallback;
- remove public links to Google Forms before deleting any underlying form;
- preserve response history needed for audit/reconciliation;
- update privacy disclosures and architecture docs;
- retire forms individually rather than through a single all-at-once cutover.

## Recently completed

- Newsletter identity and Welcome redesign promoted and closed out.
- Optional newsletter **What’s New** component promoted.
- Public website redesign merged in PR #23 and GitHub Pages deployment succeeded.
- Public **How ADB Works** and **What’s New** pages launched.
- Repository README replaced with current project-level orientation.
- Canonical Editorial System, Design System, Newsletter Component Specification, and Source-Link Standard established.
- Documentation registry, generated status/architecture/operations docs, changelog, and immutable snapshots established.
- V2 shadow evidence log formalized through the 2026-09-19 run.\n- Completion-monitoring DEV vector gate passed 15/15 with a no-mutation synthetic harness.

## Deliberately deferred ideas

These are not active requirements and should not be treated as overdue work:

- public article or issue archive;
- CMS migration;
- subscriber login/account portal;
- analytics implementation;
- general website photography or illustration;
- self-hosted/remote web fonts;
- standalone Austin Weekend Explorer product;
- original-reporting newsroom functionality.

## Maintenance rule

When a whiteboard decision creates, changes, blocks, or completes a cross-project task, update this file in the same development cycle when practical. Do not duplicate detailed implementation steps here when a component runbook already owns them; link to that runbook and keep this file focused on project status.
