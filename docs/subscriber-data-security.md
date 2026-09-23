# Subscriber Data Security Baseline

**Status:** Active baseline  
**Scope:** Austin Daily Briefing subscriber email addresses, subscription state, preferences, verification records, delivery metadata, and related operational history  
**Architecture assumption:** Google Sheets + Apps Script remains the production control plane unless a later review justifies migration.

## 1. Security objective

Austin Daily Briefing should use safeguards proportionate to the sensitivity, volume, and operational importance of the subscriber data it holds.

The current goal is not to replace Google Sheets with a new database. It is to operate the existing Google control plane deliberately:

- restrict access;
- minimize data collection;
- verify ownership before applying subscriber changes;
- limit token exposure;
- reduce accidental sharing risk;
- maintain recoverable operational history;
- define retention and incident handling.

## 2. Data classification

### Operational personal data

Treat the following as personal data requiring restricted access:

- subscriber email address;
- delivery status;
- signup/customization/management timestamps;
- subscriber/profile identifiers linked to an email;
- delivery/provider identifiers linked to a subscriber;
- verification and audit metadata.

### Preference data

Topic and briefing-style selections are personal preference data.

Selections must not be interpreted as proof of a subscriber's identity, health status, sexual orientation, political affiliation, or other personal characteristic.

Some preference categories can overlap with sensitive subjects. Access to preference data should therefore be limited to the same production operators and systems that need subscriber email data.

### Secrets and authentication material

The following are higher-risk operational secrets and must not be stored in subscriber sheets, GitHub, task output, public logs, or browser-visible configuration:

- API keys;
- private routing destinations;
- raw verification tokens;
- token-bearing confirmation URLs;
- service credentials.

Existing verification design stores only SHA-256 token hashes after sending a raw token in the confirmation link.

## 3. Access-control baseline

Production data stores and their parent folders should remain restricted to specifically authorized operator accounts.

Required baseline:

- no anyone Drive permission;
- no domain-wide Drive permission;
- no public or link-based editor/reader access to subscriber databases or response sheets;
- least-privilege editor access;
- production and development data remain separated;
- owner/operator accounts use multi-factor authentication;
- account recovery methods remain current;
- sharing permissions are reviewed at least quarterly and after any collaborator change;
- Apps Script deployments and projects are accessible only to required operators.

Google Forms may be publicly accessible for response submission while the form file itself remains owner-restricted for editing.

## 4. Verification baseline

Preference and management changes must not be authorized by knowing an email address alone.

Required:

- unknown addresses receive generic responses;
- confirmation requests are scoped to an exact address and exact requested change;
- raw token is sent only in the confirmation link;
- only token hash is retained;
- token expires;
- replay is rejected;
- confirmation is consumed only after a valid confirmation action;
- confirmed requests apply once;
- unconfirmed requests do not change subscriber state.

## 5. Data-minimization baseline

Collect only what is needed for:

- subscription delivery;
- selected briefing preferences;
- requested account actions;
- ownership verification;
- idempotency/replay protection;
- reasonable troubleshooting and audit history.

Avoid free-text fields in subscriber settings unless there is a defined operational need.

Do not enrich subscriber profiles with inferred demographic, behavioral, health, political, or other sensitive characteristics.

## 6. Retention baseline

Retention must preserve idempotency and audit safety while avoiding unnecessary indefinite copies of personal data.

Current retention work should distinguish:

- active subscriber records;
- append-only source/intake rows;
- completed verification records;
- outbound delivery logs;
- old production backup spreadsheets;
- feedback/correction submissions.

Until a safe redaction/retention mechanism is tested, do not delete or reorder append-only source rows used by response-key reconciliation.

Backups containing subscriber information require an explicit purpose and review date rather than indefinite accumulation.

## 7. Logging and documentation

Do not place subscriber addresses or raw tokens in:

- GitHub issues, PRs, source files, or documentation;
- automation task reports;
- public error messages;
- browser console logs;
- analytics payloads.

Operational reports should use counts, internal non-sensitive identifiers where necessary, and privacy-safe summaries.

## 8. Incident-response baseline

Treat the following as security incidents requiring review:

- accidental public/link sharing of production data;
- unexpected editor/collaborator access;
- compromised Google/operator credentials;
- exposed API keys or raw verification tokens;
- unauthorized subscriber preference/account changes;
- significant automated abuse or confirmation-email flooding;
- vendor notice indicating relevant subscriber data may have been exposed.

Initial response:

1. contain access or credential exposure;
2. preserve relevant evidence;
3. determine affected systems/data/time window;
4. rotate exposed credentials/tokens where applicable;
5. assess subscriber impact and legal/notification obligations;
6. document corrective actions;
7. update controls to prevent recurrence.

## 9. Review cadence

Perform a lightweight quarterly security review covering:

- Drive folder/file permissions;
- operator accounts and MFA;
- Apps Script project/deployment access;
- runtime secret access;
- backup inventory;
- data-retention exceptions;
- recent incidents or unusual abuse patterns;
- whether project scale now warrants stronger infrastructure.

A migration away from Google Sheets should be considered if project scale, operator count, data sensitivity, audit requirements, or access-control complexity materially outgrow this baseline.
