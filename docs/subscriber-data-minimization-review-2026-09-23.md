# Subscriber Data Minimization Review — 2026-09-23

**Workstream:** SEC-3 — Subscriber data security  
**Baseline:** subscriber-data-security-baseline.md  
**Retention authority:** data-retention.md  
**Scope:** Subscriber database, production intake workbook, preference schema, verification path, delivery/history storage, and native-form implications  
**Mode:** Read-only schema review; no production data or automation changed

## Summary

ADB's current subscriber model is generally narrow: it does not collect names, addresses, phone numbers, demographic profiles, payment information, account passwords, or similar high-risk data.

The main SEC-3 finding is a verification-path exception that must be fixed before the security workstream can be treated as fully clean:

> The production Google verification response sheet has a Verification Token field and contains completed verification submissions. That means the raw token is written into Google Forms response storage before the subscriber processor consumes it.

This conflicts with the approved security and retention rule that raw verification tokens must never be stored. The tokens were not read during this review.

A second group of findings are lower-risk minimization opportunities: reducing duplicate subscriber identifiers, distinguishing system defaults from explicit preference choices, limiting free-text notes, removing obsolete DEV copies from the production intake workbook after dependency testing, and avoiding unnecessary retention of full outbound message bodies.

## 1. Current stored data inventory

### Subscriber database

The production subscriber database currently contains:

**Subscribers**
- Email
- Status
- Created / Updated
- Notes
- Profile ID
- Preference Source Email

**Profiles**
- Profile ID
- Status
- Primary Preference Email
- Latest Submission ID
- Customize URL
- Last Preference Update
- Notes
- More for You Volume
- Summary Style
- Why It Matters Length

**Preferences**
- Profile ID
- Interest ID
- Preference
- Score
- Updated
- Source Submission ID

**Signup / Management audit records**
- submission/request identity
- timestamps
- email
- profile ID
- result/state transitions
- notes

**Outbound Messages**
- message ID
- created/sent state
- profile ID
- email
- template/subject
- customize URL
- provider/delivery metadata
- plain-text body
- HTML body
- run ID
- notes

**Briefing History**
- run/date/profile
- section/category
- normalized story key
- headline/source
- material-update state
- notes
- delivery status
- provider message ID

### Production intake workbook

The production intake workbook stores:

- signup Form responses;
- management Form responses;
- customization Form responses;
- verification Form responses;
- intake ledger;
- verification queue;
- operational monitoring/configuration;
- hidden historical DEV-copy tabs and build/QA support tabs.

## 2. Preference sensitivity review

ADB should continue to treat **all preference data as Class 3** for access-control purposes, even though a preference is not proof of identity, health status, belief, orientation, or other characteristic.

### Highest inference sensitivity

The current catalog includes fields with an elevated risk of unwanted inference:

- **LGBTQ+ Community**
- **Health & Wellness**

These fields are still legitimate editorial preferences and do not need to be removed merely because they concern potentially sensitive subjects. They should remain optional personalization inputs and must never be treated as evidence that a subscriber is LGBTQ+, has a health condition, or belongs to any related class.

### Contextually sensitive interests

The following can reveal civic or intellectual interests but do not by themselves establish a sensitive characteristic:

- Local Government & Policy
- Public Safety & Courts
- Housing, Homelessness & Urban Life
- Philosophy & Big Ideas

These should receive the same Class 3 handling as all other preferences rather than creating a complicated per-topic privacy taxonomy.

### Important default-value distinction

Every profile currently receives a full preference matrix with Normal values by default.

A system-created Normal value is **not an explicit subscriber choice**. It must not be interpreted as evidence that the subscriber expressed interest in the associated topic.

The current Source Submission ID can distinguish system-created defaults from later subscriber-originated updates, but future reporting and native-form logic should preserve this distinction explicitly.

## 3. Action required — raw verification token storage

### Finding

The production intake workbook contains a live sheet named Google Verification Responses with columns:

- Timestamp
- Verification Token

A read restricted to the Timestamp column confirms seven verification submissions exist. No token values were read.

Because Google Forms stores submitted answers in the response sheet, the current verification flow stores the raw token at least until the response row is removed.

This conflicts with:

- SEC-1: raw verification tokens must never be stored;
- data-retention.md: raw tokens and token-bearing URLs are never retained;
- the native customization security design: raw tokens may appear only in the delivered confirmation link and must not be persisted.

### Risk

The risk is reduced by restricted Sheet access and single-use/expiry controls, but the current design still creates an avoidable copy of a credential.

There can also be a processing interval between Form submission and the next subscriber-operations run, meaning a submitted token can exist in response storage before its corresponding verification request is marked consumed.

### Required remediation

Do not delete or alter current production verification responses until the existing processor dependency is understood and a tested replacement exists.

The preferred remediation path is:

1. replace the public Google verification Form as the token-consuming endpoint with a narrow Apps Script/native verification endpoint;
2. receive the raw token transiently in the request;
3. hash it immediately server-side;
4. match the hash against the pending Verification Queue record;
5. validate expiry, scope, status, and requested action;
6. persist only the resulting verification state / non-secret confirmation identity;
7. never write the raw token or token-bearing URL to Sheets, logs, task output, GitHub, or monitoring;
8. test replay, expiry, wrong-scope, malformed-token, and duplicate-submit behavior in DEV;
9. promote through the normal release path;
10. only after safe cutover, remove or redact historical raw-token response rows according to the approved retention and audit rules.

This remediation should be coordinated with FORM-4 because that work already owns single-use native verification architecture.

## 4. Duplicate identifier review

The same subscriber email can appear in multiple operational locations:

- Subscribers.Email
- Subscribers.Preference Source Email
- Profiles.Primary Preference Email
- action/audit rows
- Intake Ledger.Email
- Verification Queue.Email
- Outbound Messages.Email

Some duplication is currently necessary for delivery, reconciliation, audit, and authorization. SEC-3 should not remove fields merely because they are duplicated.

### Candidates for later dependency review

**Preference Source Email**

This appears potentially redundant with Profiles.Primary Preference Email in the current profile model. Before removal, verify no processor, migration, shared-profile, or fallback logic depends on it.

**Profile Customize URL**

The customization URL is currently a service-level responder URL rather than subscriber-secret state. It may be derivable from Integration/Release configuration instead of stored per profile. Removal would reduce repeated operational metadata but is low priority.

**Provider Message ID in Briefing History**

Provider identifiers already exist in delivery records. Confirm whether history-level duplication is needed for reconciliation before considering removal.

No production schema change should occur until dependency checks and DEV tests prove these fields are safe to remove.

## 5. Default preference matrix minimization

Current signup creates one stored row for every active interest, normally Normal / 1.

This is operationally simple but creates a full subscriber-linked preference matrix even when the subscriber has never explicitly changed a topic.

A future sparse model could treat:

- no stored override = Normal;
- stored row = explicit deviation or explicit saved choice.

Benefits:
- fewer subscriber-linked preference rows;
- less risk of treating defaults as expressed interests;
- easier minimization when new sensitive-adjacent topics are introduced.

Costs:
- requires processor/generator changes;
- affects reset semantics;
- affects reporting and audit assumptions;
- creates migration complexity.

**Decision for SEC-3:** do not change the production preference model now. Record sparse preferences as a future optimization only if its privacy benefit justifies the complexity. In the current model, source provenance must continue to distinguish defaults from subscriber-originated choices.

## 6. Free-text notes minimization

Several operational tables include Notes.

Free-text fields create a risk that operators or automations copy unnecessary subscriber detail into durable storage.

Baseline rule:

- Notes must contain only compact operational facts;
- do not place medical, financial, identity, demographic, relationship, or other sensitive narrative information in Notes;
- do not copy subscriber email content into Notes;
- do not store raw tokens, token-bearing URLs, credentials, private routing destinations, or full request payloads;
- prefer standardized result/status codes over prose when possible.

Future automation prompts should keep this boundary explicit.

## 7. Outbound message-body minimization

Outbound Messages stores both full plain-text and HTML bodies along with recipient and delivery metadata.

The body is required while a message is queued and can be useful for short-term delivery troubleshooting. It is not necessary as a permanent subscriber-linked archive after terminal delivery.

The approved retention policy already requires recipient-linked outbound records to be deleted or de-identified after 90 days. A later retention-enforcement implementation should evaluate whether message bodies can be removed earlier than the rest of the delivery record after the troubleshooting window closes.

Do not change that timing in SEC-3; data-retention.md remains authoritative until deliberately revised.

## 8. Cross-environment minimization

The production intake workbook still contains hidden tabs named:

- _ARCHIVE DEV Manage Copy
- _ARCHIVE DEV Customize Copy
- _ARCHIVE DEV Signup Copy

These are legacy DEV copies inside a production workbook. They are not needed for ordinary live intake and weaken the conceptual production/DEV separation even though they are hidden.

Before removal:

1. verify no formulas, Apps Script logic, QA script, cutover tool, or documentation depends on these tabs;
2. preserve any genuinely required migration evidence in privacy-safe repository documentation rather than live subscriber storage;
3. remove the tabs only through a controlled change after the dependency check.

This is a cleanup candidate, not an immediate production action.

## 9. Fields that remain justified

The following are still proportionate to the current service:

- subscriber email — delivery and verified account management;
- status — active/paused/unsubscribed control;
- profile ID — internal relational identity;
- current editorial preferences — personalization;
- style controls — requested output behavior;
- timestamps — idempotency, retention, troubleshooting;
- source/request identifiers — replay protection and reconciliation;
- hashed verification token + scoped request metadata — authorization;
- delivery/provider metadata — short-term reconciliation and troubleshooting;
- briefing-history story keys — repeat control and QA.

The service should continue not collecting ordinary subscriber names, addresses, phone numbers, dates of birth, demographic profiles, passwords, payment data, or unrelated sensitive free text.

## 10. Native-form requirements derived from SEC-3

FORM-1 through FORM-4 should carry forward these rules:

- do not introduce a new long-term subscriber database;
- do not expose saved preference values before verification;
- do not store raw verification tokens;
- use generic account-existence responses;
- write only fields needed for the requested action;
- treat all preference values as Class 3;
- never infer identity/condition/orientation from a preference;
- distinguish system defaults from subscriber-originated choices;
- avoid duplicating email or profile identifiers in new tables unless required by reconciliation or security;
- do not persist browser/client metadata unless there is a defined anti-abuse need and retention rule.

## 11. SEC-3 status

### Complete assessment

The preference-sensitivity and minimization review is complete.

### Open remediation

SEC-3 cannot be fully closed while the production verification Form persists raw verification tokens in response storage.

The remediation should be handled as a controlled DEV-first verification architecture change, coordinated with FORM-4.

Other minimization opportunities are lower priority and should not trigger risky schema changes solely to reduce column count.
