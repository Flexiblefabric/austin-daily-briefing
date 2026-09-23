# Subscriber Data Security Audit — 2026-09-23

**Scope:** Read-only review of the current Google Drive/Sheets production data plane and documented verification architecture  
**Result:** No broad Drive access found on production subscriber data. Core operator account protections were manually confirmed. Retention rules are now documented; native-endpoint deployment settings remain a future implementation gate.

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

## Manual controls confirmed by the operator

The following controls were confirmed manually on 2026-09-23:

1. **Google account MFA** is enabled.
2. **Google account recovery settings** are current.
3. **Apps Script edit access** is limited to the sole operator.
4. **Resend MFA** is enabled.
5. **Cloudflare account protection** uses a passkey.

## Remaining implementation checks

These are not unresolved current-storage failures; they are gates for the native customization deployment:

1. **Apps Script web-app execution/deployment settings** — review the final DEV and production deployment configuration before exposing the native form endpoint.
2. **Runtime properties** — confirm endpoint/runtime properties remain restricted to Apps Script and are not copied into Sheets, source, or browser code.
3. **Retention enforcement** — the schedule is now defined in `docs/data-retention.md`; automated deletion/redaction must be DEV-tested before promotion.
4. **Raw intake archival** — the 12-month target is subject to a temporary processor-safety exception until historical reconciliation is proven safe after redaction/deletion.

## Risk assessment

### Low / currently controlled

- broad public access to subscriber database;
- broad public access to intake workbook;
- production-folder link sharing;
- raw-token field in Verification Queue.

### Moderate / requires governance

- historical backups containing subscriber information until the new 30-day / 2-copy rule is enforced;
- raw intake retention while the temporary processor-safety exception remains;
- preference categories that overlap with sensitive subject matter;
- Apps Script web-app deployment permissions once a public native endpoint exists;
- abuse/flooding risk once native public endpoints are introduced.

## Recommended action order

1. Enforce the new backup-retention rule after confirming a current healthy recovery copy.
2. Keep the raw-intake retention exception under quarterly review until a safe archival/redaction method is tested.
3. Review the DEV Apps Script web-app execution/deployment settings before endpoint testing.
4. Apply the documented security baseline and abuse controls to the native customization endpoint.
5. Keep quarterly access and retention review as an operating practice.

## Conclusion

The current Google Sheets storage model is suitable for the present ADB architecture provided these access controls remain restricted and the open governance items are closed.

This audit does not recommend a database migration. The immediate security work is access governance, retention, verification, and safe endpoint design.
