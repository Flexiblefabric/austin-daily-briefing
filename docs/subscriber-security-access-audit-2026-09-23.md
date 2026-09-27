# Subscriber Security Access Audit — 2026-09-23

**Workstream:** SEC-2 — Subscriber data security  
**Baseline:** [subscriber-data-security-baseline.md](subscriber-data-security-baseline.md)  
**Retention policy:** [data-retention.md](data-retention.md)  
**Scope:** Production Drive/Sheets/Forms, access inheritance, Apps Script, GitHub, Resend, Cloudflare, and operator account controls  
**Audit mode:** Read-only where connector evidence is available; owner confirmation where provider ACL/MFA metadata is not exposed

## Summary

The production storage layer is not broadly shared, the two routine production backups are within the approved retention/count baseline, and the public website does not expose production Sheet/edit URLs or internal subscriber identifiers in the scanned site source.

The live checks and owner-confirmed inventories now satisfy the SEC-2 baseline. The operator confirmed on 2026-09-23 that there are no unexpected editors or members on the four production Google Forms, the GitHub repository, Resend, or Cloudflare. Published Form responder access remains intentional and is not an editor-access failure.

## Evidence standard

Use these result labels:

- **Pass — live verified:** provider/connector metadata directly supports the control.
- **Pass — owner confirmed:** the operator explicitly confirmed the control, but the connected API cannot independently expose it.
- **Manual verification required:** connector evidence is insufficient to determine the control.
- **Action required:** evidence shows the baseline is not met.

No subscriber identities, private routing addresses, credentials, tokens, or message bodies are recorded in this audit.

## 1. Google Drive and production storage

### Folder inheritance

**Result: Pass — live verified**

The parent `Austin Daily Briefing` Drive folder contains separate `Production` and `Development` folders. Google Drive metadata reports both folders as not shared. This supports the required production/DEV separation and indicates no broad inherited sharing at this level.

### Production subscriber database

**Result: Pass — live verified**

`Austin Daily Briefing — Subscriber Preferences` is reported by Drive as:

- `shared=false`
- source visibility: `not_shared`
- located in the Production folder.

This is consistent with the SEC-1 requirement that production subscriber Sheets remain Restricted rather than link-accessible.

### Production intake database

**Result: Pass — live verified**

`Austin Daily Briefing — Google Forms Production Intake` is reported by Drive as:

- `shared=false`
- source visibility: `not_shared`
- located in the Production folder.

This is consistent with the SEC-1 requirement that production intake Sheets remain Restricted.

### Production backups

**Result: Pass — live verified**

Two production backup spreadsheets are currently present in the Production folder. Both are reported `shared=false` / `not_shared` and were created on 2026-09-09.

The approved retention policy allows no more than two routine rolling subscriber-data backups and a maximum normal age of 30 days. The current backup count and age therefore comply as of this audit.

The next quarterly/retention review must delete or replace backups when they exceed the approved window, subject to the requirement to preserve a current validated recovery copy.

## 2. Production Google Forms

Forms reviewed:

- Join Austin Daily Briefing
- Customize Austin Daily Briefing
- Manage Austin Daily Briefing
- Confirm Austin Daily Briefing Change

**Result: Pass — owner confirmed**

Drive metadata reports these published Forms as shared, with `source_visibility_status=access_not_verified`. Public responder access is intentional and expected. The available Drive connector does not expose enough permission metadata to distinguish responder publication from editor/collaborator access.

Owner confirmation: the production Forms have no unexpected editors or members. Public responder links are intentional. No unauthorized edit membership was reported.

## 3. Google account and Apps Script

### Google MFA and recovery

**Result: Pass — owner confirmed**

The operator previously confirmed MFA and recovery controls are configured on the Google account used for the production control plane.

### Apps Script edit access

**Result: Pass — owner confirmed**

The operator previously confirmed that only the operator can edit the Apps Script projects used by ADB.

The current connector does not provide authoritative Apps Script project-member or installed-trigger ACL visibility, so this item remains owner-confirmed rather than API-verified.

## 4. GitHub

### Repository visibility and operator access

**Result: Pass with intentional-public-repository boundary**

The repository `Flexiblefabric/austin-daily-briefing` is public. The connected operator account has administrative permission.

A public repository is acceptable under SEC-1 only because GitHub is restricted to source code and privacy-safe documentation. Class 2–4 data must never be committed.

### Public website exposure scan

**Result: Pass — live verified**

A scan of 14 text-based files under `site/` found no:

- production Google Sheets URLs;
- Google Drive/Form edit URLs;
- internal production profile identifiers;
- raw production Response Keys;
- token-bearing verification parameters;
- Resend credential names.

Public Google Form **responder** links and the public ADB contact address are expected and permitted.

### Repository collaborator inventory

**Result: Pass — owner confirmed**

The current GitHub connector can verify the authenticated operator's repository permissions but cannot enumerate the repository's direct collaborator list through the available interface.

Owner confirmation: there are no unexpected GitHub collaborators or members with repository access.

## 5. Resend

### MFA

**Result: Pass — owner confirmed**

The operator previously confirmed MFA is enabled for Resend.

### User/member access

**Result: Manual verification required**

The current connected tools do not expose the Resend account/team member list.

Owner confirmation: there are no unexpected Resend editors or members. No credential values are recorded in this audit.

## 6. Cloudflare

### Authentication

**Result: Pass — owner confirmed**

The operator previously confirmed passkey protection is configured for Cloudflare.

### Account/member access

**Result: Manual verification required**

The current tools do not expose Cloudflare account-member ACLs.

Owner confirmation: there are no unexpected Cloudflare editors or members with production access.

## 7. External-collaborator conclusion

Live evidence shows no broad sharing on the production Drive folders, subscriber database, intake database, or backups.

The provider surfaces that could not be enumerated through connectors were manually reviewed by the operator. The operator confirmed there are no unexpected editors or members on the four production Google Forms, GitHub, Resend, or Cloudflare.

**SEC-2 result: PASS / Complete.**

## 8. Findings

### No immediate security failures found

No evidence from this audit indicates:

- a publicly shared production subscriber Sheet;
- a publicly shared production intake Sheet;
- excessive production backup count;
- expired routine backup retention;
- public site exposure of production Sheet/edit URLs or internal subscriber identifiers.

### Connector limitations

The available connectors still cannot independently enumerate published Form editor ACLs, GitHub direct collaborators, Resend membership, or Cloudflare membership. Those controls are therefore recorded as **Pass — owner confirmed** rather than live-verified.

## 9. SEC-2 closeout

Completed 2026-09-23. The operator confirmed:

- no unauthorized editors on the four production Forms;
- no unexpected GitHub write/admin collaborators or apps;
- no unexpected Resend users or members;
- no unexpected Cloudflare members with production access.

No corrective access removals were required.
