# V2 production promotion — October 3, 2026

Status: PROMOTED and scheduler-aligned; first production-cycle observation pending.
Owner/operator: ADB operator, executed by Codex with explicit user instruction “Let's promote.”
Authorization: 2026-10-03 17:53 America/Chicago.
Effective edition: **2026-10-04**, normal **08:00 America/Chicago** generation; weekends permitted.

## Scope and source authority

Promote ADB-DAILY-PROD-2.0 with ADB-V2-SELECT-1.0 after 16 comparable shadow runs and focused MFY validation. Preparation PR #59 was merged at 91bd2f00031f60a500e04b38a92a038026f7a07e; final decisions from PR #57 are incorporated. Shared weights remain 20-20-15-15-10-10-10; MFY weights 25-25-20-10-10-10. MFY minimums: total 60, reader value 15/25, substance 5/10; ordinary variety 5 points, Discovery Promotion 10 points/max one, reader-value displacement max 3.

The active prompt is docs/automation-prompts/austin-daily-briefing.md; selection rules are docs/v2-selection-spec.md. The historical candidate, shadow prompt, and comparison log are retained as evidence, not runtime dependencies. Source retrieval uses current GitHub main via the connector. Pin a read to the resolved main commit when a mutable-ref response is stale, and verify its blob against that commit.

Preserve production gates, native-compatible intake, current native Customize link and Google fallback, recipient rules, 08:00 schedule, DAILY_BRIEFING_V1 template, deterministic message IDs, existing queue/history ownership and monitoring. Resend Apps Script remains sole delivery owner. No early briefing, queue mutation or subscriber test send is part of cutover. Friday recap remains unchanged.

## Reader communication

Level 3 under docs/reader-change-communications.md: update How ADB Works, permanent What's New entry, homepage update preview, and one concise notice in the October 4 normal briefing. No separate email, new labels, required reader action or Welcome release-history insert.

Release key: `v2-selection-2026-10-04`. The canonical daily prompt contains the exact approved copy, exact date gate, expiry and profile-history deduplication. Preserve the quiet existing newsletter component. The website says when the first edition starts rather than claiming an October 3 V2 briefing was delivered.

## Cutover checks

- [x] User approved promotion, website updates, next-briefing notice and associated documentation.
- [x] Read current main and scheduler; preserve existing native customization and transport behavior.
- [x] Preserve exact rollback prompt revision and scheduler wrapper below.
- [x] Carry forward 19 passing editorial reference checks; these are not deployed-engine or delivery tests.
- [x] Align canonical prompt, selection lifecycle, editorial-system authority, registry, roadmap and archival pointers.
- [x] Validate generated docs and immutable snapshot; 19 reference boundary checks pass.
- [x] Check exact-head CI before merge and rendered live website after Pages deployment.
- [x] Merge tested release and align daily scheduler wrapper; read back both IDs, fingerprints, effective date and unchanged schedule.
- [x] Verify successful GitHub Pages deployment.
- [ ] Observe the October 4 real generation, selection and downstream delivery; record result below.

## First normal-cycle observation — pending

One-time task `ADB V2 First-Cycle Check` is scheduled for 2026-10-04 10:00 America/Chicago (task ID `6ac18b2fdd1081918355cf79689ff2b8`). It temporarily uses the reserve scheduler slot and returns its privacy-safe observation in the originating chat. It is read-only across Sheets, repository, scheduler and delivery; it does not update this record automatically. Reconcile its result here afterward. Successful Google Drive metadata reads confirmed access to both registered production workbooks before scheduling. This check reports late or incomplete generation/delivery as Pending or Unknown; it cannot repair, replay, send or silently mark success.

Do not generate or resend an edition from this checklist. Review:
1. Morning Briefing attempt, selected stories and compact audit: sources available at cutoff, procedural status, shared scoring, MFY minimums, actual published-history repeat control, independent Under the Radar evidence or empty result, variety limits and Off exclusions.
2. October 4 notice appears once per eligible profile, with the release key in existing history. HTML/plain text match; no extra edition or repeated announcement.
3. Exactly one expected daily queue row per eligible profile/run, exact DAILY_BRIEFING_V1, matching history; inspect terminal queue/history and provider evidence for downstream completion, not only generator success.
4. Production watchdog and native-customization operation remain unaffected. Report unknown evidence as unknown. No raw subscriber identities or payloads in repository records.
5. Record pass/fail, exceptions and rollback decision here; V2-10 remains open until observed. No observation success is claimed at promotion.

## Exact pre-promotion rollback pair

Repository revision: `91bd2f00031f60a500e04b38a92a038026f7a07e`.
Canonical path: `docs/automation-prompts/austin-daily-briefing.md`.
Prompt ID: `ADB-DAILY-PROD-1.3`.
Blob: `a4f7c252f8c158172e680e42bc95ea10d9aed5c7`.
Task: `6a91bd2144d081918d9d54d5c14d1175`; enabled; timezone America/Chicago.
Schedule:

```text
BEGIN:VEVENT
DTSTART;TZID=America/Chicago:20260915T080000
RRULE:FREQ=DAILY
END:VEVENT
```

Saved pre-promotion wrapper:

```text
CANONICAL SPECIFICATION
Before execution, fetch the current main branch copy of https://github.com/Flexiblefabric/austin-daily-briefing/blob/main/docs/automation-prompts/austin-daily-briefing.md through the connected GitHub contents API and require Specification ID ADB-DAILY-PROD-1.3. The current GitHub main copy is authoritative; a cached or inaccessible raw.githubusercontent.com response is not a substitute. Also fetch the current main copies of docs/editorial-system.md, docs/newsletter-component-spec.md, docs/source-link-standard.md, and docs/design-system.md through that API before generating any edition. Stop the attempt and report the exact missing source only if the current main file or a required standard is inaccessible or mismatched.

Execute the canonical file's full Execution prompt section exactly as written. Before writing, require exactly one Active PRODUCTION Message Templates row with Template ID DAILY_BRIEFING_V1, put that exact literal into every proposed daily queue row, and verify exact queue/history readback before reporting success. Treat editorial release/version keys as separate data. Preserve the daily 08:00 America/Chicago schedule, all production gates, recipient and personalization rules, source/link/component standards, history ownership, and queue-only Resend delivery. Never send a daily briefing directly or repair/replay an existing queue row.
```

For confirmed regression, restore the pre-promotion selection behavior and align the wrapper, preserving intervening native-intake, Customize-link and transport fixes. Restore the exact pair only when no later unrelated changes would be lost; otherwise reconcile those changes first. Record a new changelog, registry state and immutable snapshot. Do not delete, replay or resend queue/history rows or reuse IDs. Canonical/selection/gate mismatch aborts generation; it never justifies bypassing safety checks.

## Activation evidence

- Release PR: #61, merged at `220fa38e1eac9da867923327eb179cfa35e42f03` on 2026-10-03.
- Tested PR head: `821ac9ef2e8f56df76e76debc8e4953a460ac062`; documentation validation and site preview both succeeded before merge.
- Scheduler activation: **2026-10-03 18:07:49 America/Chicago** (`2026-10-03T23:07:49.361669Z`); enabled state and exact original 08:00 recurrence read back unchanged.
- Current-main readback verified canonical daily prompt blob `6cb47fb2c67348f8b95e9fd0a3da4b95e5eecdd8`, selection blob `12a2dcacdae62a644caf65995b8f9c96e5c23cf8` and registry blob `de42f2854ca850e9a613a18294cba56d106db413` against the merged release. IDs, both fingerprints and October 4 effective date match the saved scheduler wrapper.
- Production safety, delivery mode, profile rules, email formatting, source-link presentation, queue/history and monitoring sections compared unchanged. No production briefing or subscriber data was written during cutover.
- Registry 2026-10-03.3, regenerated internal documents and immutable snapshot passed audit with no warnings. Nineteen editorial reference checks passed; no full sample edition or transport test was run.
- GitHub Pages deployment `37160754202` and main documentation workflow `37160754174` succeeded. Live What's New, its link to How ADB Works, the updated selection/MFY/repeat explanations and homepage preview were opened and verified. Desktop screenshots showed readable layout with the existing visual design. Mobile browser rendering was not independently re-tested for these copy-only changes; site asset CI passed.
- Website announcement identifies October 4 as the first edition. Canonical What's New copy is limited to October 4 and profile-deduplicated; it has not been sent early.
- First production delivery and editorial outcome remain pending the October 4 observation. No rollback indicated by cutover checks.
