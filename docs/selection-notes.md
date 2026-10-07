# Structured selection notes

Contract: `ADB-SELECTION-NOTE-1`
Approved implementation scope: 2026-10-06
Activation: next normal generation after this change is merged to main.
Editorial contracts remain `ADB-DAILY-PROD-2.0` / `ADB-V2-SELECT-1.0`; all weights, thresholds and control limits are unchanged.

## Storage and ownership

Use the existing **Briefing History → Notes** cell on each actual published-item row. No new table, column, task or rejected-item history row is introduced. The generation task constructs and validates notes before its first queue/history write, then verifies exact readback. The dispatcher retains ownership of delivery and can append its existing delivery prose after the JSON object. Do not rewrite prior published notes or manufacture historical evidence.

Each cell starts with `ADB-SELECTION-NOTE-1 ` followed by one compact JSON object. Keep the complete cell below 45,000 characters, leaving room for transport suffixes. Parse using a JSON decoder from the prefix, not a greedy brace regex; `scripts/validate_selection_notes.py` supplies `encode_note` and `decode_note`. Missing/legacy notes are **unknown evidence**, not valid structured records. The validator fails them when used for a new proposed edition.

One actual published-item row per profile/run carries a `context` object. Prefer the Featured Top Story; when absent use the first other actual item. Other item notes omit `context`. Context records the original full eligible ranked slates, including unselected candidates, inside this existing cell. Rejected candidates appear only in the context's `rejected` array. They must never become independent Briefing History rows or count as published coverage. A run with no actual items cannot create a synthetic carrier; report the evidence limitation and stop before queueing.

Retain notes with their parent Briefing History records under the existing data-retention policy. Context and preference evidence remain private. Never put a real run bundle, raw profile identifiers, subscriber details, delivery IDs, tokens or email bodies in GitHub. Repository examples are synthetic. Shared research can be duplicated across profile carriers so each edition remains reconstructible.

## Required records

See [the synthetic complete input](selection-notes-example.json) for field shapes. `scripts/test_selection_notes.py` contains synthetic repeat, displacement and UTR examples as executable fixtures.

| Record | Required evidence |
|---|---|
| Each note | `schema`, `production_spec`, `selection_spec`, `run_id`, ISO `cutoff` with America/Chicago offset, `candidate`; exactly one note per profile adds `context` |
| Candidate | `key`, stable semantic `topic`, `lane` (`top`, `utr`, `mfy`, `utility`), concise `fact`, `procedural_status`, `placement_reason`, separate `event_timing`, `sources`, four eligibility `gates`, `history`; ranked lanes also require `scores`, `total`, and a fact-based `score_reasons` entry per component |
| Source | Public `url`, `access: "read"`, offset-bearing `accessed_at`, source `locator`, `published_at` (or null plus `timestamp_note` explaining uncertainty). Access and known publication time cannot exceed cutoff |
| History | `key_checked`, `topic_checked`, specific `search_reason`, `material_update`, `prior` records containing exact `key`, `date`, and previously published `facts`. A changed URL/key does not reset topic history |
| Repeat change | `before` matching a prior published fact; precise `after`; `incremental_value`; `basis`; `calendar_only: false`; verified `source_url`, `locator`, and `verified_at`. Material Update TRUE requires this evidence and actual prior coverage |
| MFY fit | Actual `interest_id`, `saved_preference`, calibrated `match`, specific `source_feature`, `reader_payoff`, active `catalog_scope`, and `off_topic_relabel: false` |
| Context | Saved `volume`, `shared_weights`, `mfy_weights`, `history_window_start`, `top` and `mfy` slates, `rejected` array (explicitly empty when none), and `utr_search` |
| Original slate | `complete_eligible_pool: true`, full eligible candidate objects in descending score order in `ranked`, `slots`, `capacity_reason`, `control_status` (`none` or `applied`), `decisions` array |
| Decision | `control`, original `displaced` key, `replacement` key (null for Freshness Veto), specific `reason`; MFY swaps also store calculated `score_drop` and `reader_value_drop` |
| Rejected candidate | `key`, `topic`, `lane`, `failed_gate` (`source`, `fit`, `repeat`, `section`, `score`, `freshness`), and specific `reason`. No delivery status and no independent history row |

The first `slots` candidates form the original baseline. Fix capacity using saved Fewer/Standard/More and actual useful supply **before** controls; never shrink/relabel the baseline to conceal displacement. Preserve tie order and explain material tie decisions in `capacity_reason`. Preserve candidate scores/evidence exactly between the original slate and selected note. Unselected eligible candidates remain in the slate. All actual selected keys must equal the original baseline after the recorded decisions. Freshness Veto removes a scored material repeat; it does not itself promote a replacement. Record any subsequent promotion as its own authorized comparison against the untouched original baseline, or leave the slot empty.

## MFY scoring enforcement

The validator binds each MFY match to the separately supplied current Preferences snapshot, not merely the preference claimed in its note. It rejects Off/missing preferences, fractional or out-of-range components, incorrect sums, a total below 60, reader value below 15, or substance below 5.

| Match | Interest relevance range | Additional condition |
|---|---|---|
| `direct_high` | 21–25 | Saved High; direct substantive source connection |
| `direct_normal` | 16–20 | Saved Normal; direct substantive source connection |
| `strong_adjacency` | 16–20 | Enabled interest with unusually strong explicit connection |
| `narrow_adjacency` | 11–15 | Enabled interest with defensible narrower connection |

An item's non-personalized source facts can be reused; its interest score must be calibrated separately for each profile. Normal cannot inherit another profile's High score. Do not relabel a match to evade the band or automatically clamp scores: reevaluate the score, rerank, reconsider controls, and validate the resulting edition again.

Ordinary `variety` allows a total-score drop ≤5 and reader-value drop ≤3. `discovery` allows ≤10 and ≤3, with at most one per profile/run. Replacements must come from the retained original eligible pool; the displaced candidate must be an untouched original baseline candidate. Duplicate replacements, chained swaps and altered score vectors fail. Shared `selection_balance` is separate and does not inherit MFY's limits. Semantic fit, worthwhile variety and discovery payoff still require source-backed editorial review.

## Exact repeat changes

“Material update after prior coverage” is not evidence. For a No Wrong Door-style repeat, record the exact facts already conveyed, the exact new commitment/data/action in the new document, where it appears, and what additional understanding it provides. A new filing date, today's hearing, a new headline or a newly located copy of the same proposal is insufficient.

Valid `basis` values are `vote`, `ruling`, `funding`, `lawsuit`, `construction_phase`, `cancellation`, `opening_closure`, `new_data`, `hearing_outcome`, `changed_deadline`, `new_document_facts`, `new_capability`, or `other_substantive`. Classification alone proves nothing: inspect the cited passage and compare it with the prior facts. Score only incremental value. If that comparison cannot be established, exclude the repeat from ranked news. A useful Austin Ahead reminder uses `material_update: false` and a specific `repeat_utility` reason.

For evergreen resources set `evergreen: true`; establish extended resource history and record `resource_history_known: true`. Unknown resource history cannot be treated as first exposure. Source publication time may honestly remain unknown; cutoff and access/verification times may not.

## Under the Radar discovery record

Always retain `utr_search`, even if no item qualifies. Record `independent: true`, `checks` with actual `query_or_path`, `finding`, and a read `source` record; `outcome` is `selected` or `none_qualified` with a specific `reason`. Record the actual research path, not a retrospective generic claim of independent discovery.

Every selected UTR candidate adds `discovery`: the `overlooked_fact`, concrete `prominence_evidence` (sources/coverage checked, where the consequential detail is buried or omitted), `placement_reason`, zero-based `search_check` linking to its discovery path, `narrow_scope_only: false`, and `rejected_headline_only: false`. Limited geographic scope and a failed headline ranking alone are insufficient. A broadly consequential discovery can belong in Top Stories; do not duplicate it in UTR. Absence of indexed results alone is not proof of underreporting. Review the evidence before selection.

## Pre-queue execution and later analysis

Fetch this contract and `scripts/validate_selection_notes.py` at the same verified main revision as the daily prompt. Build a transient private JSON bundle with:

- `run_id`, `cutoff`, `history_window_start`, `history_complete: true` only after successful retrieval;
- `profiles` keyed by private profile ID, each with actual `volume` and `preferences` keyed by active interest ID;
- `published_history`: applicable retrieved records with `profile_id`, `date`, `key`, stable `topic`, `lane`, concise actual published `facts`, and `delivered` resolved against queue/history evidence; include at least 14 days plus known evergreen history;
- `rows`: **every** proposed Briefing History row, with `profile_id`, exact existing `section`, `key`, `material_update` as a boolean, `source_url`, and the exact serialized `notes` to be written. Friday recap uses `This Week in Austin` for this validator's section mapping.

Run `python scripts/validate_selection_notes.py /private/transient/proposed-selection.json`. A nonzero exit or unavailable validator blocks queue/history writes. Fix the proposed records, remove a failing optional item where appropriate, rebuild the slate and notes, and rerun. Never fall back to a prose PASS. Bind this bundle to the exact rendered/queued selection and recheck it if selection or scores change. After writes, compare all returned Notes cells against the validated strings before reporting generation success; transport suffixes may be ignored only after a valid complete JSON object. Existing operational/template/rendering checks also remain mandatory.

This is a generation-task preflight, not an Apps Script dispatcher hook. It does not read or write Sheets, send mail, or evaluate provider completion. It verifies evidence structure, arithmetic, anchors, snapshot consistency and displacement mechanics; it cannot prove a source is truthful, a topic search is complete, a claimed new fact is genuinely new, or prominence judgments are sound. Those remain source-review responsibilities.

For short-term analysis, parse Notes, group by run/profile, use the single context carrier, and compare selected items with the retained original slates. Keep audit absence distinct from an explicit `none` decision. Do not retroactively label October 4–6 as passing this format. Observe the first normal post-merge edition before closing V2-10.
