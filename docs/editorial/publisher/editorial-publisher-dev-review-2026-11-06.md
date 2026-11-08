# November 6 supervised DEV review and seal evidence

Status: native setup, browser load and operator sealing succeeded November 6,
2026. Independent read-only connector readback passed. Publication has not been
started. This checkpoint does not clear production release or permission gates.

## Installed source and fixture

- Review bundle: commit 8ac040eb8756b50178243f9d3005edfee0900f93.
- Host build: ADB-DEV-REVIEW-HOST-0.1.
- Package: REVIEW-2026-11-06.
- Editorial core pin: a1fe5514f362719c0e379ccb2276d7df3492737a.
- Edition: November 6 in America/Chicago; cutoff 2026-11-06T08:00:00-06:00.
- Prior-history window starts October 23. Synthetic recent/extended history is
  complete; this is not an attestation about real production history.

The original October 30 seed expired on November 6. Its guard stopped before the
bootstrap marker, property changes or file creation. Only Code.gs was refreshed;
the October 30 committed E2E fixture/workbook were not repointed or cleared.

## Actual runtime evidence supplied by the operator

At 10:10:57 AM Central, setup reported READY_FOR_REVIEW, createdFiles=3,
productionWrites=false, emails=false, alertsSent=0, sealed=false, published=false,
realPermissionsVerified=false.

The operator deployed the review app and loaded the package. The supplied browser
screenshot showed audience=1, validation passed at load time, the correct edition,
cutoff/window and complete synthetic history. The exact deployment URL and
execution/access settings were not independently inspected; do not infer an ACL
attestation from successful owner access.

After reviewing, the operator chose Approve and seal. The supplied screenshot
reported “Reviewed version sealed successfully” and “Publication has not been
started”, with digest:

`c067eab49660725828880a2c5069e5ecae0124f9ccdcb9225d546fd0cc5b5b18`

Persisted review timestamp: 2026-11-06T16:27:38.026Z
(10:27:38 AM Central). The private receipt includes an operator identity; it is
not reproduced in this public repository.

## Independent connector readback

New files, discovered by exact title and checked against spreadsheet metadata:

| Role | Spreadsheet ID |
| --- | --- |
| DATABASE | 1ognA5DqMxwYN9C11UDEHhPvb79OQ09FSjhdPde1fn7s |
| DRAFT_INBOX | 1Fuf0vja1GVZYl7WavDyBay_sPmjOoGeXA286H9wfD4k |
| SEALED_STAGING | 1QvW2aVF7BCdTr-mnlfHTG6Z_NpiSiCSPK7AcjFBvrYQ |

All relevant populated columns across the metadata-confirmed 100-row grids were
read, including possible duplicate/orphan positions. No connector writes occurred.

| Check | Result |
| --- | --- |
| Sealed Packages | Exactly one READY manifest with chunk count 1 |
| Sealed Package Chunks | Exactly one chunk, correct identity and sequence 1 |
| DEV Package Reviews | Exactly one receipt bound to package/digest/edition/source revision |
| Independent canonical SHA-256 | Matches manifest, receipt and screenshot digest above |
| Separate draft | Exactly one DRAFT, blank digest; decoded content equals sealed payload |
| Outbound Messages | Zero data rows |
| Briefing History | Zero data rows |
| Publisher Ledger | Zero data rows |

File search reported shared=false for all three. This is metadata evidence only;
no alternate-principal denial test, OAuth/tool-scope restriction or immutable
READY capability boundary has been independently verified.

## Visual limitation found

The operator reported a mostly correct newsletter preview with the masthead
missing. The renderer includes the external branded image URL. The review iframe
uses img-src data: and therefore blocks that external image, showing alt text
instead. This is a known review-preview limitation, not removal of the masthead
from generated newsletter HTML. Footer branding may be affected by the same rule.

The operator proceeded with the synthetic sealing test with this limitation
disclosed. This is not a complete visual PASS for production approval. Address
approved brand-image display in the preview and verify desktop/mobile rendering
before relying on the screen for live visual review. Do not silently change the
sealed editorial package or claim email-client image loading was tested.

## Completed and outstanding

Completed: native fresh-file setup, current fixture validation, owner browser
load, explicit operator seal, atomic saved receipt/copy, independent digest
readback and separation from publication.

Outstanding: native exact seal replay has automated coverage but has not been
manually demonstrated in the deployed app; stale-review/tamper and other-identity
checks also remain automated evidence rather than native demonstrations.
A separate two-file publication/monitoring binding and its rehearsal are still
needed. Production adapter/ledger/staging, monitoring lifecycle/retention/history
and access gates remain in force. No new production activation is implied.

The next implementation should preserve this sealed package as evidence, fix the
review's approved branding display, then prepare the separate DEV publication
binding against the fixed DEV database with fresh-state validation and existing
atomic queue/history/ledger plus monitor readback behavior.
