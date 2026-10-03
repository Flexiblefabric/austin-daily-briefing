# V2 focused validation and promotion record
Date: 2026-10-03, America/Chicago
Status: Release preparation complete; production activation not performed.

## Scope and outcome

The daily shadow observation program remains closed at 16 recorded runs. This is a bounded follow-up to the MFY calibration, using approved values from PR #57: 60 overall, 15/25 reader value, 5/10 substance, 5-point ordinary variety, 10-point Discovery Promotion, and at most a 3-point reader-value drop. No new labels or full sample briefing are required. Values are final; the tests do not re-optimize them.

Three additional accessible text resources were reviewed. Their content supplies one strong comedy example and two positive examples at 65. Scores are editorial judgments, not measured reader preferences. The cases were deliberately selected to exercise coverage gaps; they are not a random sample or statistical proof.

## Source-backed examples

Assume first inclusion in the relevant profile's published history solely for these controlled fixtures. Do not publish these items on that assumption without the actual history check. I/V/N/T/S/D are the six MFY components.

| Case | Profile interest | Components | Total | Result |
|---|---|---|---:|---|
| Elliott Kalan interview on joke construction | Comedy High | 23/20/14/3/9/6 | 75 | Eligible |
| James Acaster interview on developing his performance and material | Comedy Normal | 18/18/13/3/8/5 | 65 | Eligible |
| NASA guide to choosing a stargazing location | Science/astronomy Normal | 18/19/12/3/8/5 | 65 | Eligible |

- [Maximum Fun: Elliott Kalan transcript](https://maximumfun.org/transcripts/bullseye-with-jesse-thorn/transcript-bullseye-with-jesse-thorn-write-and-daily-show-alum-elliott-kalan-on-the-secret-to-writing-great-jokes/): read the primary interview text, including the discussion of joke structure, voice and audience. This offers comedy appreciation and creative understanding without assuming the reader wants a professional writing career. Strong substance and specific payoff support 75; no breaking-news urgency is claimed.
- [Maximum Fun: James Acaster transcript](https://maximumfun.org/transcripts/bullseye-with-jesse-thorn/transcript-comedian-james-acaster/): read the discussion of performance, writing and contrasting audiences. Normal interest and modest discovery/timeliness produce 65 despite substantive material. The same content with a direct High match would score 70; Off excludes it rather than subtracting points.
- [NASA: How to Find Good Places to Stargaze](https://science.nasa.gov/solar-system/how-to-find-good-places-to-stargaze/): read the guide's location-selection discussion. The useful but familiar subject gets moderate new-information/discovery scores and low urgency. Its 65 supports an evergreen inclusion without making it compulsory.

All three page contents were accessible on October 3. The selected deliverable is text; audio/video playback is not required for its stated value. These are fresh calibration cases, not historical omissions or a new daily slate.

## Access-hold disposition

The original traffic simulation's operation, Seinfeld video playback, BookSpring destination and inaccessible streaming article remain unverified. Exclude those particular candidate experiences from a publishable selection unless subsequently verified. Do not treat them as passed tests. Accessible text interviews replace the need to depend on the blocked comedy video. The NASA text resource supplies a usable evergreen positive case.

An optional candidate's failed access is handled by exclusion; it does not require postponing the selection system until that website can be repaired. The resource-access gate remains mandatory in each actual run.

## Rule validation

The attached validate_v2_rules.py executes 19 reference checks:
- Both weight totals and all three new example totals.
- Exact 60 eligibility and 59 rejection.
- Reader-value and substance minimum failures.
- Source, Off, unchanged-repeat and section gate failures.
- Variety at five points versus six.
- Discovery at ten points versus eleven.
- Reader-value drop of three versus four.
- No below-floor rescue.

Result: all 19 passed. These validate a small executable representation of the documented rules; they are not tests of a deployed scoring engine, scheduler, or subscriber delivery.

Additional specification review:
- Discovery remains at most one per profile/run; zero is permitted.
- Displacement is measured from the original eligible ranking, preventing chained swaps from exceeding limits.
- Repeat/no-material-change rejection precedes scoring; Freshness Veto follows a scored material update.
- Event timing does not set Material Update.
- Under the Radar requires independent discovery evidence and can be empty.
- Shared balance cannot suppress distinct investigations merely for broad category overlap.
- Production repeat history excludes counterfactual shadow selections.
- Existing section presentation and Friday recap remain intact.

## Concrete release package

| File | Purpose |
|---|---|
| docs/v2-selection-spec.md | Consolidated staged selection contract, ADB-V2-SELECT-1.0 |
| docs/release-candidates/austin-daily-briefing-v2.md | Complete staged production prompt, ADB-DAILY-PROD-2.0 |
| docs/v2-focused-validation-2026-10-03.md | This evidence, integration and rollback record |
| scripts/validate_v2_rules.py | Reproducible editorial boundary checks |

Baseline daily prompt inspected: ADB-DAILY-PROD-1.3, blob a4f7c252f8c158172e680e42bc95ea10d9aed5c7. The staged copy changes only version/lifecycle metadata, the selection dependency, news/repeat instructions and the additional selection pre-queue check. Safety gates, eligibility, message IDs, DAILY_BRIEFING_V1, rendering, dispatcher ownership, queue/history reconciliation and monitoring are preserved byte-for-byte. During October 3 merge reconciliation, the staged introduction and Customize destination were updated to match the already-live native customization route, with the Google Form retained explicitly as fallback.

Merge reconciliation confirmed PROJECT_STATE.json marks native customization live and site/index.html links to customize.html. The staged prompt now uses https://austindailybriefing.com/customize.html and retains the existing Google Form fallback. The active 1.3 prompt still contains the earlier wording; this preparation merge does not change that active file. Do not overwrite other workstreams' later changes. Re-read current main immediately before activation and apply only the V2 editorial changes to the then-current production prompt. If it differs from this baseline, reconcile and recheck unchanged operational sections before promotion.

The old shadow prompt stays archived as the historical scoring contract. Add an explicit pointer from the editorial system's V2 relationship section to the promoted selection spec at cutover. Its past MFY/shared-score rules must not remain an active runtime dependency. PR #57 is merged; the approved decision record is incorporated in main. Its final 10-point Discovery Promotion allowance governs this staged package.

## Promotion checklist

- [x] Final numerical values recorded; no more calibration changes requested.
- [x] Focused substantive-comedy and positive-borderline examples reviewed.
- [x] Unverified optional experiences explicitly excluded.
- [x] Nineteen reference boundary checks passed.
- [x] Consolidated specification and complete staged production integration prepared.
- [x] No full sample briefing generated, as requested.
- [x] Incorporate PR #57 final decision record and reconcile intervening native-customization changes at preparation merge. Re-read main again at activation.
- [ ] Obtain approval to activate the exact reconciled production package.
- [ ] Record promotion time, operator, final source revisions and effective edition date.
- [ ] Effective edition date = America/Chicago promotion date + one calendar day; weekends allowed.
- [ ] Replace the canonical daily prompt with the reconciled V2 candidate, mark its lifecycle active, and align scheduler expected ID/dependencies. Keep daily 08:00 America/Chicago.
- [ ] Mark the selection spec active and update editorial-system relationship, roadmap and relevant technical registry lifecycle/dependency records.
- [ ] Add the material-promotion changelog entry and immutable registry snapshot; run documentation synchronization/validation and applicable CI.
- [ ] Read back canonical files and scheduler copy; require matching IDs, fingerprints and effective edition date.
- [ ] Do not run generation early, regenerate the promotion-day briefing, or send a separate test to subscribers.
- [ ] At the next normal cycle, verify actual selected items, queue/history reconciliation and downstream delivery. Record observed result and any rollback decision.

This package's merge alone does not activate production. The staged prompt is not an execution instruction for this preparation task. No messages, queue rows, subscriber records or scheduler configuration were changed.

## Rollback

Before activation, preserve the then-current canonical prompt and scheduler settings as the exact rollback pair, recording their revisions without private data. The inspected 1.3 blob above is the preparation baseline; use the actual pre-promotion pair if another workstream has changed it.

If canonical retrieval, scoring-contract validation or operational gates fail, abort generation before new queue writes. Do not bypass safeguards to deliver an edition. For a selection regression confirmed after promotion, restore the recorded pre-promotion prompt and scheduler pair for the next normal run, preserving all unrelated intake/transport changes. Record rollback in the release history and registry as required.

Do not delete or replay existing queue/history rows, reuse message IDs, or automatically send a replacement edition. A partial queue failure uses the existing operations incident workflow. Any resend or correction requires its own appropriate authorization and duplicate checks.

## Readiness

The bounded editorial validation is complete. The package is ready for integration review and promotion preparation; activation is not yet done. Post-promotion delivery validation remains a required observation, not a result claimed by this document.

## Preparation merge reconciliation — 2026-10-03

User authorized merging and reconciling the preparation package. PR #57 was already merged. PR #59's original head passed documentation-registry and site-preview checks. The active production prompt still matches the inspected 1.3 baseline. Native customization reconciliation is limited to the staged prompt's introduction and Customize destination/fallback; no runtime task or active prompt changed. V2-7 and V2-9 are complete; V2-8 has a prepared promotion plan awaiting explicit activation. This is not a promotion date or a claim that tomorrow's edition is running V2.
