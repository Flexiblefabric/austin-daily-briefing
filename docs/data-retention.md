# Subscriber Data Retention Rules

**Status:** Approved operational baseline  
**Effective:** 2026-09-23  
**Scope:** Subscriber, intake, verification, delivery, backup, and feedback data used by Austin Daily Briefing  
**Principle:** Keep identifiable data only as long as it has a defined operational, security, audit, or subscriber-service purpose.

These rules are designed for the current Google Sheets + Apps Script architecture. They do not require a database migration.

## 1. Retention schedule

| Data class | Normal retention | End-of-period action | Notes |
| --- | --- | --- | --- |
| Active subscriber record and current preferences | While subscription is active | Retain | Required to deliver and personalize ADB |
| Paused subscriber record and preferences | While paused | Retain | Required to preserve requested pause state and settings |
| Unsubscribed subscriber/profile/preferences | Up to 12 months after unsubscribe | Delete or minimize to the smallest suppression/audit record the current processor can safely support | Gives a reasonable reactivation/troubleshooting window without indefinite preference retention |
| Signup / management / customization action records | 12 months after final processing | Delete or de-identify where safe | Retained for idempotency, troubleshooting, and audit |
| Google/native intake source rows | Target: 12 months after final processing | Archive, redact, or delete only after a tested processor-safe method exists | Current response-key reconciliation depends on historical source identity; see temporary exception below |
| Intake ledger | 12 months after final processing, or longer only where needed to protect idempotency across retained source rows | Delete/de-identify with corresponding source record | Do not break response-key reconciliation |
| Verification Queue — Applied / Expired / Cancelled | 90 days after terminal status | Delete the verification record | Raw tokens are never retained; hash alone does not justify indefinite retention |
| Verification Queue — Pending | Until applied, cancelled, or expired under the configured TTL | Transition to terminal status | Current token TTL remains the authorization limit |
| Outbound message delivery records | 90 days after terminal delivery state | Delete or de-identify recipient-specific delivery data | Enough for routine delivery troubleshooting and provider reconciliation |
| Briefing History linked to a profile | 180 days | Delete older profile-linked rows unless a specific current feature requires them | Production repeat control normally needs a much shorter window; 180 days supports QA/troubleshooting |
| Production backup spreadsheets containing subscriber data | Maximum 30 days; no more than 2 routine rolling backups | Permanently delete superseded backup | Longer retention requires a documented incident/recovery reason and review date |
| Feedback / corrections raw submission + submitter email | Until reviewed, and no later than 15 days | Delete raw submission and submitter email | Existing public privacy commitment |
| Published correction/clarification | Indefinite as public editorial record | Retain without submitter identity/private details | Not a raw subscriber record |
| Direct support/privacy correspondence | 90 days after issue is resolved | Delete unless needed for a live dispute, legal requirement, or security incident | Avoid retaining unrelated sensitive free text |
| Security-incident evidence | Until incident is closed plus 12 months | Delete or de-identify unless legal/security need remains | Access restricted to the operator |

## 2. Active, paused, and unsubscribed subscribers

Active and paused records may be retained because the service still needs the email address, delivery state, and preferences.

When a subscriber unsubscribes:

1. stop briefing delivery immediately according to the existing workflow;
2. retain the existing record for no more than 12 months for safe troubleshooting/reactivation;
3. after 12 months, remove preference/profile data and retain only the minimum information needed to honor the unsubscribe and prevent unwanted delivery, if the current processor requires such a suppression record;
4. do not use an unsubscribed record for personalization or unrelated analysis.

A verified deletion request may shorten this period. The project may still retain the minimum record reasonably necessary to document and honor an unsubscribe, protect the service, or satisfy a legal obligation.

## 3. Temporary intake-retention exception

The current production processor uses source-row identity, displayed values, and the Intake Ledger together for reconciliation and idempotency.

Because editing or deleting historical Google Form response rows can create identity mismatches, **raw production intake rows must not be routinely altered yet**.

Temporary rule:

- treat 12 months as the target maximum;
- do not delete/redact a source row until a controlled test proves historical reconciliation still behaves safely;
- review this exception quarterly;
- design the native intake path so future submissions do not require indefinite raw-source retention;
- once a processor-safe archival/redaction method is validated, apply the 12-month target prospectively and to eligible historical rows.

This is a documented technical exception, not permission for indefinite retention without review.

## 4. Backup rules

Routine production backups that contain subscriber information are recovery artifacts, not archives.

Baseline:

- keep no more than **2** routine rolling subscriber-data backups;
- delete a routine backup once it is older than **30 days** and a newer validated recovery copy exists;
- do not move old subscriber backups into indefinite archive folders;
- label any exceptional backup with a purpose and review/delete date;
- after an incident, migration, or major release, an exceptional backup may be held longer only while it has an active recovery/audit purpose.

Deletion of existing backups should occur only after confirming the current production files are healthy and at least one current recovery copy remains.

## 5. Verification and token data

- Raw verification tokens are never stored.
- Token-bearing URLs are never stored in Sheets, GitHub, logs, task output, or documentation.
- Pending verification records expire under the configured token TTL.
- Applied, Expired, and Cancelled verification records are retained for **90 days**, then removed.
- The token hash is not retained beyond the verification record's retention period.

## 6. Delivery and briefing-history data

Recipient-specific delivery logs are operational troubleshooting records and should not become a permanent subscriber activity archive.

- Keep recipient-linked Outbound Messages / delivery state for **90 days** after final delivery status.
- Keep profile-linked Briefing History for **180 days** unless a production feature has a documented longer dependency.
- Where practical, aggregate non-identifying delivery/quality statistics may be retained longer.

Before automating deletion, confirm no watchdog, idempotency rule, provider reconciliation, or release-notice rule depends on older rows.

## 7. Deletion-request handling

A verified subscriber deletion request should remove personal data that is no longer necessary to:

- honor an unsubscribe or prevent unwanted delivery;
- complete an already-requested action;
- protect against duplicate/replayed operations;
- investigate an active security incident;
- satisfy a legal obligation.

Deletion must not silently reactivate delivery or erase the fact that delivery should remain stopped.

Until a dedicated deletion routine exists, deletion requests require manual, documented review across both the subscriber database and intake workbook.

## 8. Review and enforcement

Retention is reviewed quarterly with the security access review.

The quarterly check should record:

- oldest routine backup;
- count of routine backups;
- oldest terminal verification record;
- oldest recipient-linked delivery record;
- oldest profile-linked briefing-history record;
- whether the intake-retention exception is still necessary;
- any legal, incident, or recovery holds;
- any deletion requests completed during the period.

No automated purge should be introduced directly in production. Each data class should receive DEV testing and an explicit promotion step before automated deletion is enabled.
