# Authoring exact repeat provenance for the DEV publisher

Applies to ADB-EDITORIAL-HANDOFF-1 with ADB-SELECTION-JS-1.1 and
ADB-PUBLISHER-DEV-0.2. This is the future DEV handoff construction procedure;
the live production generator and its scheduler prompt are unchanged.

## Topic identity and repeat scope

Use the existing stable topic identifier when a development concerns the same
underlying topic. A new normalized update key does not justify inventing a new
descriptive topic phrase. If the history lacks a reliable topic mapping, stop
for editorial/history normalization rather than claiming the lookup passed.

The existing selection policy remains separate by lane:

- Shared Top Story and Under the Radar repeat checks use prior shared Top/UTR
  records across profiles.
- More for You checks use prior MFY records for that exact profile.
- Utility repeat lookup remains profile-specific under the established validator
  behavior; a useful reminder must not claim material news change.

An MFY story seen by one reader is not automatically a prior shared-news item
for every reader. Cross-lane research may inform editorial judgment, but it is
not a qualifying prior shared-repeat reference under this contract.

## Construct references from the independent snapshot

After reading the complete applicable published-history snapshot, use the
reviewed function in SelectionEvidenceContract.gs:

```javascript
candidate.history.prior = adbBuildSelectionPriorReferencesV1(
  candidate, publishedHistory, profileId, historyWindowStart
);
```

The function chooses only applicable delivered history with the matching key or
stable topic, within the history window (or established evergreen history).
It returns exact `{key,date,facts}` references. Facts are copied unchanged from
the archived normalized records, not paraphrased or manually reconstructed.
Identical shared copies collapse; conflicting facts for the same key/date block
construction. The function never changes the caller's history snapshot.

For a ranked-news repeat, the exact prior fact is also the source of
`history.change.before`. The writer does not invent `after`, verify a source
passage, assign a score, approve a material update or choose an item for the
editor. Those remain explicit, source-backed editorial decisions. For a new
shared story without an applicable shared prior, use an empty scoped prior
array and do not claim a shared material update solely from MFY coverage.

Do this construction before scoring and final slate selection. Preserve the
same candidate evidence in the original ranked slate and selected-item note.
After any correction, rebuild and rerank as the selection rules require; never
patch only one occurrence of a candidate or change an archived delivered row.

The validator now distinguishes absent prior key/date, paraphrased facts,
out-of-scope lane/profile references and failure to bind to the stable topic/key
or history window. These errors describe a rejected handoff; they do not trigger
automatic repair or silent clearing of its claimed prior.

## History format

DEV 0.2 preserves the established Austin Ahead history headline:
`ACTION · WHEN · TITLE`. The action is normalized to GO/WATCH/PLAN and timing and
title are trimmed. Missing action, timing or title blocks the row. The newsletter
HTML/plain-text renderer is unchanged. All 36 Austin Ahead archive headlines in
the October 28 retrospective now match this history-format function exactly.

## Validation and installation state

78 Node checks passed, including exact prior construction, rejection of the
October 28 failure patterns, stable-topic binding, MFY profile isolation,
conflicting archive facts, full fresh-handoff planning, Austin Ahead parity and
the manual QA entry point. The established 54 applicable JSON-only Python vectors
still agree with the JS gate. The original real-edition handoff remains rejected;
it was not rewritten into a passing package.

DEV 0.2 source is prepared in the review branch. The operator must replace the
DEV project's EditorialPublisher and SelectionEvidenceContract files together,
set ADB_PUBLISHER_SOURCE_REVISION to that reviewed code commit, and run
`runPublisherDevHandoffQaV1`. Expected: six PASS checks and a final PASS report
with build ADB-PUBLISHER-DEV-0.2, writes=false, emails=false. This check is pure
and does not depend on today's date or touch a workbook.

Keep the old sealed package and its successful commit as historical evidence.
Changing the installed source pin deliberately makes that earlier package stale
for new publication. Old commit/rejection/batch wrappers tied to source 27c484e
are historical test procedures, not the DEV 0.2 test entry point. A coordinated
fresh package is required for another data-bearing commit test.

Production remains on the existing generator/dispatcher. Permission separation,
legacy-history normalization, monitoring integration and a fresh valid real-input
shadow comparison remain ahead of any production promotion.
