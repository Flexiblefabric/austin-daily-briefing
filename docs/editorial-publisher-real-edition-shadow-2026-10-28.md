# Real-edition retrospective publisher comparison — October 28, 2026

Overall result: **BLOCKED at selection evidence. Rendering equivalence passed.**
This is a read-only retrospective comparison, not a live production publisher
run or a production promotion.

## Scope and method

The comparison read the October 28 production archive: 12 DAILY_BRIEFING_V1
messages and 145 linked history records. All 12 queue records were marked Sent;
all 145 history records were Sent with nonblank provider IDs. These are provider
acceptance records, not independent inbox-delivery evidence.

The original structured editorial JSON was not retained separately. Structured
editorial fields were therefore recovered deterministically from the archived
HTML component tree: preheader, Pulse, Weather, story text, source attribution,
More for You, Austin Ahead and footer URLs. Each recovered object was rerendered
with the approved renderer used by the reviewed publisher source. Both resulting
HTML and plain text matched the saved originals byte-for-byte for every profile.
The saved originals also passed ADB-DAILY-HTML-1.0 validation.

Selection envelopes were parsed from the archived history, retaining their
editorial JSON while separating the dispatcher transport suffix. The comparison
independently read all 2,320 prior history rows from October 14 through October
27; all were structured Sent records that could be normalized to exact archived
facts. Current saved profile/preferences/subscriber tables were read only in
memory. They are not a reconstructed historical eligibility snapshot.

For the pure DEV planner assessment, the target environment/template and empty
pre-commit queue/history/ledger were represented only in memory. The package and
envelope run identifiers were mapped to the publisher's derived October 28 run.
No production configuration or historical run identifiers were changed. This
simulation does not validate a production adapter, production gates, or the
original package seal. The SHA dependency was deliberately an unsealed shadow
marker; no READY package was staged from real subscriber information.

## Results

| Check | Observed result |
| --- | --- |
| Archived payloads | 12 |
| Exact HTML reproduction | 12/12 PASS |
| Exact plain-text reproduction | 12/12 PASS |
| Archived layout/payload validation | 12/12 PASS |
| Rendered item/history inventory | 145/145 bound |
| Item breakdown | 12 featured, 48 remaining Top Stories, 12 Under the Radar, 37 More for You, 36 Austin Ahead |
| Required dispatcher note suffix | Present in all 145 archived records, before transport acceptance prose |
| Largest HTML / plain text | 21,551 / 6,477 characters |
| Largest archived history Notes | 26,218 characters |
| Actual 14-day prior history | 2,320 structured Sent records independently read |
| Full original-selection gate | BLOCKED: Selection: prior fact unbound |
| Pure publisher plan | BLOCKED at the same selection gate; no proposed commit accepted |
| Production writes / queues / sends | 0 / 0 / 0 |

## Blocking repeat provenance

The shared Wheatsville closure/update story includes a prior-history reference
to the October 17 Wheatsville item. The stored prior fact is a full sentence
covering the announced closure, 45-year history and stated operating pressures.
The new evidence uses a shorter paraphrase as its claimed exact prior fact.

Two additional binding problems accompany that wording mismatch:

- All 13 matching October 17 records were in the More for You lane. The current
  item is shared Top Story coverage. The existing validator binds shared repeats
  against prior shared Top/UTR coverage; this MFY reference is outside that scope.
- The original prior topic identifier is `wheatsville-guadalupe-closure`.
  The current topic is a different descriptive phrase, and the update uses a new
  normalized key. Consequently the current key/topic lookup does not bind the
  claimed earlier record.

This evidence appears in the shared story delivered to all 12 profiles. The
original whole-batch gate correctly refuses publication. A diagnostic-only
in-memory substitution of the exact prior fact, including its before/change
evidence, still failed the binding gate because the lane/topic mismatch remained.
That diagnostic copy was neither staged nor committed and is not a passing
version of the edition.

The gate stops at its first failure. This report does not assert that this is
the only possible blocker; later checks must be rerun on a newly valid handoff.

## History representation difference

All 36 archived Austin Ahead history headlines include the action and timing
prefix, for example `WATCH · [when] · [title]`. The current writer derives the
history headline from the item title alone. The rendered HTML/plain text retain
the labels/times and reproduce exactly, but the history display would change.
Bindings were established using the full archived decorated title and source
destination, without editing the archive. Preserve or deliberately document that
history representation before promotion.

## Next corrective work

Future handoff construction must obtain prior facts directly from the actual
normalized history records, retain stable topic identifiers, and apply the
approved repeat scope separately for shared news and personalized MFY.
Cross-lane context must not be presented as a prior shared-repeat binding unless
the selection contract is deliberately revised and tested. Do not rewrite a
delivered edition to make the new gate pass.

Align the Austin Ahead history-headline representation, then rerun all semantic
selection gates and a same-input shadow comparison on a fresh valid package.
Production adapter/permissions/monitoring and controlled activation remain
separate gates. No production task, sender, dispatcher or historical record was
modified by this comparison.
