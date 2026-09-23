# Subscriber Data Security Baseline

**Status:** Draft for owner review  
**Workstream:** SEC-1 — Subscriber data security  
**Applies to:** Austin Daily Briefing production and development subscriber systems  
**Control plane:** Google Forms + Google Sheets + Google Apps Script  
**Related public policy:** `site/privacy.html`  
**Related design:** `docs/native-customization-design.md`

## 1. Purpose

Austin Daily Briefing stores only the subscriber information needed to create, personalize, deliver, and manage the briefing. This baseline defines how that information should be classified, who should be able to access it, how long it should be retained, how suspected security incidents should be handled, and how access should be reviewed.

The goal is proportionate security for a small experimental publishing project without replacing the existing Google Sheets + Apps Script control plane.

This document is an internal operating standard. It does not replace the public Privacy Policy and does not itself determine legal breach-notification obligations.

## 2. Core principles

ADB should follow these rules across production, development, automation, and future native forms:

1. **Collect less.** Do not collect information that is not needed to deliver or manage the briefing.
2. **Restrict access.** Subscriber data is private operational data, not general project documentation.
3. **Separate public code from private data.** No subscriber addresses, tokens, message bodies, private routing addresses, or credentials belong in GitHub.
4. **Minimize identifiers in automation output.** Monitoring and task reports should use counts, states, and privacy-safe component names whenever subscriber identity is unnecessary.
5. **Verify before changing.** Email address possession alone is not sufficient authorization for preference or management changes.
6. **Store no raw verification tokens.** Only token hashes and narrowly required verification metadata may be retained.
7. **Retain only as long as useful.** Operational data should have explicit retention targets and deletion/reduction rules.
8. **Fail closed.** Identity, authorization, schema, or ownership ambiguity should stop the affected operation rather than trigger a guess or repair.
9. **Keep delivery ownership narrow.** Monitoring may observe and alert but must not resend or repair subscriber-facing messages.
10. **Review access periodically.** Production access should be re-checked on a recurring schedule and after material personnel/account changes.

## 3. Data classification

### Class 0 — Public

Information intended for unrestricted public access.

Examples:
- website pages and assets;
- published corrections;
- public documentation that contains no private configuration or subscriber data;
- newsletter content after publication;
- public source links.

Handling:
- may be stored in GitHub;
- may be linked publicly;
- no special retention requirement beyond normal project governance.

### Class 1 — Internal operational

Operational information that is not inherently personal but can reveal system behavior.

Examples:
- automation task IDs and schedules;
- component status and health checks;
- aggregate processing counts;
- non-secret configuration names;
- run IDs and internal specification IDs;
- sanitized incident summaries.

Handling:
- may be stored in internal project documentation when it contains no subscriber identity or private routing information;
- do not combine with private data unless operationally necessary;
- monitoring output should prefer this class.

### Class 2 — Confidential subscriber data

Information tied directly or indirectly to a subscriber.

Examples:
- email address;
- subscription state;
- signup, customization, and management requests;
- profile and preference data;
- reading-style and content-volume choices;
- delivery timestamps and provider message identifiers;
- subscriber-specific briefing history;
- confirmation-request metadata;
- inbound replies, feedback, and correction submissions.

Handling:
- production storage only in the authorized Google/Resend/Gmail operational systems;
- never commit to GitHub;
- never paste into public issues, changelogs, PR descriptions, or routine task reports;
- use only the minimum fields needed for the operation being performed;
- development fixtures should use synthetic/test identities whenever possible.

### Class 3 — Sensitive-preference-adjacent data

Preference selections are not proof of identity, health status, beliefs, or other personal characteristics. Some preference categories can nevertheless support sensitive inferences.

Examples include selections related to:
- LGBTQ+ Community;
- Health & Wellness;
- other present or future topics that may overlap with protected, medical, political, religious, sexual, or similarly sensitive traits.

Policy:
- treat **all preference data** as Class 3 for access-control purposes rather than attempting to distinguish “ordinary” from “sensitive” interests;
- never infer a subscriber's identity, condition, orientation, beliefs, or protected status from a topic preference;
- do not expose preference values in monitoring alerts or general project documentation;
- preference minimization is addressed further under SEC-3.

### Class 4 — Secrets and security credentials

Information that could directly authorize access or impersonate the system or a subscriber.

Examples:
- API keys;
- passwords, passkeys, recovery codes, session secrets;
- raw verification tokens;
- token-bearing confirmation URLs before use;
- private routing destinations when intentionally kept outside documentation;
- any future endpoint secret or signing key.

Handling:
- never store in GitHub, Sheets notes, task output, logs, or documentation;
- store only in the appropriate provider/runtime secret store;
- raw subscriber verification tokens may exist transiently only long enough to create the confirmation link delivered to the intended address;
- compromise requires immediate containment and credential rotation.

## 4. Authorized systems

The current approved production data path is:

- Google Forms — subscriber intake and confirmation;
- Google Sheets — operational subscriber/intake records;
- Google Apps Script — controlled workflow processing;
- Resend — subscriber-facing email delivery;
- Gmail — administrator alerts and currently authorized confirmation-email paths;
- Cloudflare — domain and reply routing;
- OpenAI/ChatGPT — project operation and automation where required, using the minimum subscriber information needed;
- GitHub — source code and privacy-safe internal technical documentation only.

Adding another provider that receives Class 2–4 data requires a security/privacy review before production use.

## 5. Access-control baseline

Production subscriber data should use the following minimum controls:

### Google Drive, Sheets, Forms, and Apps Script

- Production folders, Forms, and Sheets must be **Restricted**, not generally link-accessible.
- Editor access should be limited to operators who actually need to change production data or code.
- Viewer access should be granted only when needed for a specific operational purpose.
- Apps Script edit rights should be no broader than the production Sheet/Form edit rights required to operate the system.
- Production and DEV resources must remain distinct.
- Public website links may point to responder Forms, but must never expose edit URLs or production Sheet URLs.
- Account MFA must be enabled for accounts with edit access.
- Account-recovery methods should be current and controlled by the operator.

### GitHub

- Repository content must contain no Class 2–4 data.
- Secrets belong in runtime/provider secret stores, not repository files.
- PR descriptions, issues, Actions logs, snapshots, and release notes must remain privacy-safe.
- Public test fixtures must use synthetic identities.
- Any accidental commit of subscriber data or secrets is a security incident even if removed later, because Git history may preserve it.

### Resend

- Access should be restricted to operators who manage delivery.
- MFA should be enabled where supported.
- API credentials must remain outside the repository.
- Delivery logs and provider IDs should be accessed only for operational troubleshooting.
- Resend must not become an alternate subscriber database.

### Cloudflare

- Account access should use strong MFA/passkey protection.
- DNS and Email Routing access should be limited to operators who manage the domain.
- Private forwarding destinations should not be committed to GitHub or surfaced in public documentation.

### Gmail / administrator mailbox

- The account must use MFA.
- Administrative alerts and subscriber confirmation messages should contain only the minimum information needed.
- Raw tokens may appear only inside the intended single-use confirmation link; they must not be printed separately.
- Subscriber message contents should not be copied into project documentation unless necessary for a specific investigation, and then should be redacted before durable storage.

### Automation and AI

- Automated reports should prefer aggregate counts and component status over subscriber identity.
- Subscriber email addresses and preferences should be supplied to an AI workflow only when required for the specific subscriber-facing task.
- Task outputs must not expose subscriber addresses, raw response keys, profile/message/provider IDs, tokens, or private routing details unless an authorized operator explicitly needs that exact evidence for troubleshooting.
- Monitoring and reconciliation remain observational and must not expand into unauthorized repair behavior.

## 6. Retention schedule

The table below is the proposed operational baseline. Where current automation does not yet enforce a target automatically, the target remains a documented cleanup requirement rather than a claim of existing automated deletion.

| Data | Target retention | End-of-life action |
| --- | --- | --- |
| Active subscriber email, status, profile and current preferences | While actively subscribed | Retain while needed to deliver/manage service |
| Minimal unsubscribe/suppression record | While needed to honor the unsubscribe, unless deletion is required/approved | Reduce to the minimum fields needed to prevent accidental delivery |
| Raw signup/customize/manage intake rows | 90 days after terminal processing | Delete or reduce after reconciliation window closes |
| Pending verification record | Up to configured 24-hour validity, plus operational processing time | Mark Expired/Cancelled if unused |
| Applied/Expired/Cancelled verification metadata | 30 days after terminal state | Delete token hash and unnecessary request details; retain only minimal audit evidence if still needed |
| Raw verification token | Never stored | Transient only in confirmation link generation/delivery |
| Invalid/failed request metadata | 30 days | Delete unless needed for an active incident investigation |
| Abuse/security-event metadata | 90 days after resolution | Delete or further minimize unless legal/security need requires longer |
| Welcome/daily Outbound Message full HTML/plain-text payload | 30 days after terminal delivery state | Remove body content where practical; retain minimal delivery evidence |
| Outbound delivery metadata without message body | 90 days | Delete or aggregate unless needed for an unresolved incident |
| Subscriber-specific Briefing History | 90 days | Delete or de-identify; only 14 days is required for routine repeat control |
| Operations History / watchdog incidents | 30 days | Delete under existing operations retention rule |
| Feedback/correction Form submission and submitter email | After review and no later than 15 days | Delete complete Form response |
| Published correction entry | Indefinite public record unless later correction/removal is required | Keep privacy-safe; never publish submitter identity |
| Direct inbound email/reply | As long as needed to respond/investigate; review during quarterly cleanup | Delete when no longer operationally useful |
| DEV synthetic fixtures | Until test/release closes, normally no more than 30 days | Delete or anonymize after test evidence is recorded |
| Public source code/docs | Project lifecycle | Standard repository retention; no Class 2–4 data permitted |

### Retention exceptions

Retention may be extended when:
- an active security incident is under investigation;
- a legal preservation obligation applies;
- a payment, contractual, or vendor dispute requires evidence;
- deleting the record would prevent ADB from honoring an unsubscribe or privacy request.

Any exception should be limited to the smallest required data and documented with a review date.

## 7. Data minimization rules

- Do not collect names, addresses, phone numbers, birth dates, demographic data, or account passwords for ordinary subscription operation.
- Do not request confidential, medical, financial, government-ID, or similar high-risk content through ADB forms.
- Keep preference choices limited to editorial personalization needs.
- Do not replicate subscriber data into a second long-term database when the existing control plane can handle the workflow.
- Native forms should write into the existing intake/verification path rather than create a parallel subscriber store.
- Do not store full message payloads longer than needed for delivery/troubleshooting.
- Prefer counts and hashes over raw identifiers where operationally sufficient.
- Never create a permanent behavioral profile from link-clicking or inferred interests without a separate explicit product/privacy decision.

## 8. Security incident response

A security incident includes suspected or confirmed unauthorized access, disclosure, alteration, loss, or misuse of Class 2–4 data or credentials.

Examples:
- a production Sheet becomes publicly accessible;
- a subscriber list is shared with the wrong person;
- a private email address appears in GitHub or a public task output;
- a verification token is logged or stored improperly;
- an API key or account credential is exposed;
- an email is sent to the wrong subscriber with another subscriber's private information;
- a vendor reports unauthorized access affecting ADB data.

### Immediate response

1. **Contain**
   - remove public/shared access;
   - pause the affected workflow if continued operation could expose more data;
   - revoke sessions, keys, tokens, or collaborator access as appropriate;
   - do not destroy evidence needed to understand what occurred.

2. **Identify**
   - determine the system, time window, data classes, and approximate number of affected records;
   - distinguish confirmed disclosure from mere possibility;
   - identify whether credentials or raw verification tokens were involved.

3. **Secure**
   - rotate compromised credentials;
   - invalidate exposed tokens;
   - restore least-privilege access;
   - verify production/DEV boundaries and delivery ownership before resuming affected automation.

4. **Assess**
   - determine what data was exposed and to whom;
   - determine whether the data could enable account abuse, unwanted inference, or unauthorized subscriber changes;
   - check relevant vendor incident information and contractual/security notices.

5. **Record**
   - create a privacy-safe internal incident record containing dates, affected systems, classification, containment actions, and resolution;
   - do not copy raw subscriber data into the incident record unless strictly necessary.

6. **Notify / escalate**
   - notify affected providers when their support/security process is needed;
   - evaluate subscriber and regulatory notification requirements under SEC-4 rather than improvising legal conclusions;
   - communicate with subscribers when notification is required or materially useful.

7. **Recover and review**
   - restore service only after the affected control is verified;
   - document root cause and corrective action;
   - update this baseline, automation rules, or access configuration when needed.

### Severity guide

- **Critical:** exposed credential/raw token, public subscriber database, or confirmed bulk disclosure. Contain immediately.
- **High:** confirmed unauthorized access to Class 2/3 data, subscriber-to-subscriber data leakage, or unauthorized profile change. Same-day containment and review.
- **Moderate:** isolated operational exposure with limited data and no evidence of unauthorized use. Contain promptly and document.
- **Low:** control weakness with no observed data exposure. Correct through normal security maintenance.

## 9. Privacy requests and deletion

Subscribers may request access, correction, or deletion through the public contact channel.

Before acting on a request:
- verify control of the subscribed email address or use an equivalent secure verification method;
- do not reveal whether an address is subscribed to an unverified requester;
- identify which records are active subscriber data versus minimal suppression/audit evidence.

A deletion request should remove subscriber information that is no longer reasonably necessary while preserving only records that must remain to honor the request, protect the service, or comply with law.

Deletion procedures and exact operator steps should be documented before native self-service account management is promoted.

## 10. Quarterly access and retention review

Conduct a review at least once every three months and after any major operator/account change.

Record only privacy-safe results.

Checklist:

### Access
- review production Drive folder sharing and inherited access;
- review production Forms/Sheets editors and viewers;
- review Apps Script project access;
- review GitHub collaborators and repository permissions;
- review Resend users/access;
- review Cloudflare users/access;
- confirm MFA/passkey protection remains enabled on production-capable accounts;
- confirm recovery methods remain current;
- remove stale or unnecessary collaborators immediately.

### Exposure
- confirm production Sheets/Forms edit resources are Restricted;
- confirm no public GitHub content contains subscriber data, raw tokens, private routing destinations, or credentials;
- review recent automation/task output for accidental identifiers;
- confirm public website code exposes no Sheet IDs, secret endpoint keys, edit URLs, or internal IDs that do not need to be public.

### Retention
- review terminal verification records older than 30 days;
- review raw intake rows older than 90 days;
- review full outbound payloads older than 30 days;
- review delivery/history records older than 90 days;
- verify Operations History 30-day cleanup;
- verify feedback/correction responses were deleted within 15 days;
- review stale DEV fixtures.

### Record
For each review record:
- review date;
- systems reviewed;
- result: Pass / Action required;
- concise corrective actions;
- target completion date for any finding.

Do not store lists of subscriber identities in the review record.

## 11. Change-control rules

A security review is required before:
- adding a new service provider that receives subscriber data;
- collecting a new category of personal information;
- adding analytics or behavioral tracking;
- exposing saved preferences through a website/account interface;
- changing verification/token architecture;
- changing retention periods materially;
- adding additional production editors/operators;
- moving subscriber data away from the current Google control plane.

A public Privacy Policy update is required when a material operational change affects what subscriber information is collected, how it is used, with whom it is shared, or how long it is retained.

## 12. SEC-1 acceptance criteria

SEC-1 is complete when the owner approves:

- this classification model;
- the minimum access-control baseline;
- the exact retention targets in Section 6;
- the incident-response sequence;
- quarterly access/retention review cadence.

Implementation/enforcement gaps discovered from this baseline become SEC-2, SEC-3, SEC-4, or dedicated follow-up tasks rather than being silently treated as already fixed.
