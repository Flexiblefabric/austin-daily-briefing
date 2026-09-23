# Subscriber Security Access Audit — 2026-09-23

**Workstream:** SEC-2 — Subscriber data security  
**Baseline:** [subscriber-data-security-baseline.md](subscriber-data-security-baseline.md)  
**Retention policy:** [data-retention.md](data-retention.md)  
**Scope:** Production Drive/Sheets/Forms, access inheritance, Apps Script, GitHub, Resend, Cloudflare, and operator account controls  
**Audit mode:** Read-only where connector evidence is available; owner confirmation where provider ACL/MFA metadata is not exposed

## Summary

The production storage layer is not broadly shared, the two routine production backups are within the approved retention/count baseline, and the public website does not expose production Sheet/edit URLs or internal subscriber identifiers in the scanned site source.

The remaining SEC-2 closeout item is an authoritative collaborator/editor inventory for systems whose ACL membership is not exposed through the available connectors: the four published production Google Forms, GitHub repository collaborators, Resend users, and Cloudflare members. Published Form responder access is expected and is not itself an editor-access failure.

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

**Result: Manual verification required for editor ACL**

Drive metadata reports these published Forms as shared, with `source_visibility_status=access_not_verified`. Public responder access is intentional and expected. The available Drive connector does not expose enough permission metadata to distinguish responder publication from editor/collaborator access.

Required closeout check:

- confirm the Form **editor** list contains only authorized operators;
- confirm there is no domain-wide or “anyone” edit permission;
- confirm public links are responder URLs only, never edit URLs.

This is not currently classified as a failure; it is an evidence gap.

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

**Result: Manual verification required**

The current GitHub connector can verify the authenticated operator's repository permissions but cannot enumerate the repository's direct collaborator list through the available interface.

Required closeout check:

- review repository Settings → Collaborators / access;
- confirm every person or app with write/admin access is expected;
- remove any stale collaborator.

## 5. Resend

### MFA

**Result: Pass — owner confirmed**

The operator previously confirmed MFA is enabled for Resend.

### User/member access

**Result: Manual verification required**

The current connected tools do not expose the Resend account/team member list.

Required closeout check:

- confirm there are no unexpected team members or API keys;
- confirm the active production API credential remains stored only in the approved runtime secret store.

No credential values should be copied into this audit.

## 6. Cloudflare

### Authentication

**Result: Pass — owner confirmed**

The operator previously confirmed passkey protection is configured for Cloudflare.

### Account/member access

**Result: Manual verification required**

The current tools do not expose Cloudflare account-member ACLs.

Required closeout check:

- confirm there are no unexpected account members with DNS or Email Routing access;
- confirm private forwarding destinations remain outside GitHub/public documentation.

## 7. External-collaborator conclusion

Live evidence shows no broad sharing on the production Drive folders, subscriber database, intake database, or backups.

The unresolved collaborator evidence is limited to provider surfaces that the current connectors cannot enumerate authoritatively:

1. editors on the four published Google Forms;
2. GitHub direct collaborators/apps with write/admin access;
3. Resend team members;
4. Cloudflare account members.

SEC-2 should remain **Review** until the operator confirms those four inventories.

## 8. Findings

### No immediate security failures found

No evidence from this audit indicates:

- a publicly shared production subscriber Sheet;
- a publicly shared production intake Sheet;
- excessive production backup count;
- expired routine backup retention;
- public site exposure of production Sheet/edit URLs or internal subscriber identifiers.

### Evidence gaps

- Published Google Forms editor ACL cannot be distinguished from responder publication through current Drive metadata.
- GitHub direct collaborator enumeration is unavailable through the current connector.
- Resend and Cloudflare membership lists are not exposed through current tools.

These are manual verification items, not presumed failures.

## 9. SEC-2 closeout criteria

SEC-2 can be marked Complete when the operator confirms:

- no unauthorized editors on the four production Forms;
- no unexpected GitHub write/admin collaborators or apps;
- no unexpected Resend users/API credentials;
- no unexpected Cloudflare members with production access.

If any unexpected access is found, remove/revoke it first and record the corrective action without placing personal identities or secret values in this document.
