# Subscriber Data Security Audit — 2026-09-23

**Scope:** Read-only review of the current Google Drive/Sheets production data plane and documented verification architecture  
**Result:** No broad Drive access found on production subscriber data. Several hardening/retention checks remain manual or open.

## Verified in this audit

### Production folder hierarchy

The ADB parent folder and the dedicated Production folder both report:

- owner-only Drive permissions;
- no anyone permission;
- no domain-wide permission;
- shared = false.

The production folder therefore does not currently expose subscriber data through broad Drive sharing.

### Subscriber database

 Austin Daily Briefing — Subscriber Preferences reports:

- owner-only Drive permission;
- shared = false;
- no broad Drive permission returned by Google;
- parent = dedicated Production folder.

### Production intake workbook

Austin Daily Briefing — Google Forms Production Intake reports:

- owner-only Drive permission;
- shared = false;
- no broad Drive permission returned by Google;
- parent = dedicated Production folder.

### Production backups

The production folder currently contains at least two historical spreadsheet backups. Google reports them as not shared.

These backups reduce recovery risk but increase the number of files containing historical subscriber information. They need an explicit retention/review rule.

### Google Forms

Signup, Customize, Manage, and Verification forms report the owner as the only Drive permission returned by Google.

The form files report shared = true, which is expected for forms made available to respondents and should not be interpreted as editor access. No additional Drive editor/reader permission was returned in this audit.

### Verification schema

The Verification Queue schema stores:

- verification ID;
- timestamps;
- email;
- request identity;
- Token Hash SHA-256;
- status/audit fields.

There is no raw-token column in the current verification schema.

The canonical production subscriber-operations prompt also requires fresh cryptographically random tokens, hash-only storage, expiry, scope binding, and replay protection.

### Preference data

The current customization schema contains 23 topic preferences plus three briefing-style preferences.

Several topic names can concern sensitive subject areas. These are reader interests, not verified attributes, and must not be used to infer personal characteristics.

## Open / manual checks

The current connector cannot verify these controls and they remain required before closing the security-audit workstream:

1. **Google account MFA** — confirm multi-factor authentication is enabled on every account with production access.
2. **Account recovery** — confirm recovery email/phone and recent-device access are current.
3. **Apps Script access** — verify project editors and deployment access are limited to required operator accounts.
4. **Apps Script web-app execution settings** — review before the native form endpoint is deployed.
5. **Runtime properties** — confirm Resend/API/config properties remain restricted to the production Apps Script project and are not copied into sheets/source.
6. **Cloudflare and Resend account MFA/access** — verify operator access and MFA directly in those services.
7. **Backup retention** — define how long historical production backups are kept and when they are safely destroyed or replaced.
8. **Raw intake retention** — define a redaction/retention approach that does not break append-only row identity and idempotency.

## Risk assessment

### Low / currently controlled

- broad public access to subscriber database;
- broad public access to intake workbook;
- production-folder link sharing;
- raw-token field in Verification Queue.

### Moderate / requires governance

- historical backups containing subscriber information;
- indefinite raw intake retention;
- preference categories that overlap with sensitive subject matter;
- security of the operator account(s);
- Apps Script deployment permissions;
- abuse/flooding risk once native public endpoints are introduced.

## Recommended action order

1. Confirm MFA and recovery settings manually.
2. Verify Apps Script project/deployment access.
3. Adopt the repository security baseline in docs/subscriber-data-security.md.
4. Set a quarterly access-review cadence.
5. Define backup and intake-retention rules without disrupting idempotency.
6. Apply the baseline to the native customization endpoint before production deployment.

## Conclusion

The current Google Sheets storage model is suitable for the present ADB architecture provided these access controls remain restricted and the open governance items are closed.

This audit does not recommend a database migration. The immediate security work is access governance, retention, verification, and safe endpoint design.
