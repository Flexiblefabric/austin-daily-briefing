# Native Signup — Gate C Result

**FORM-7 Gate:** C — DEV processor parity  
**Result:** PASS  
**Date:** 2026-10-04  
**Environment:** Development only

## Summary

Gate C verified subscriber-state resolution, re-subscription, idempotency, preference preservation, Welcome queue ownership, and fail-closed behavior against both mocked parity fixtures and the live DEV control plane.

## Live DEV evidence

### New subscriber

The controlled native signup created exactly one Active subscriber and one profile, initialized all 23 active interests to Normal, and queued exactly one `WELCOME_V1` row. A second processor run created no duplicate subscriber, profile, preference, Signup Action, or Welcome row.

### Existing Active

The controlled request completed as `existing_active_noop`. No subscriber/profile/preferences or Welcome artifacts were duplicated.

### Existing Paused

The controlled request completed as `paused_requires_manage`. The subscriber remained Paused, existing profile/preferences were preserved, and no Welcome was queued.

### Re-subscribe

The first controlled re-subscribe attempt failed closed before mutation. Investigation identified a legacy schema issue: the DEV Preferences sheet contains duplicate `Profile ID` headers, while historical rows populate the canonical first column and may leave the later duplicate blank. The generic row parser allowed the later blank duplicate to overwrite the canonical value.

PR #76 corrected the parser so the first occurrence of a duplicate header wins and added a regression fixture matching the live historical row shape.

The fresh re-subscribe retest then passed:

- request status became `Processed / resubscribed`;
- the existing subscriber changed from Unsubscribed to Active;
- existing Profile ID `PDEV004` was preserved;
- all 23 existing preference rows were preserved without rewriting their values or source metadata;
- one re-subscribe Signup Action was created;
- exactly one new deterministic `WELCOME_V1` row was queued;
- the Welcome row remained Queued; no delivery was invoked in Gate C;
- the immediate second processor run processed zero rows and created no duplicate artifacts.

## Repository parity

The executable Gate C suite covers:

- new signup;
- Active no-op;
- Paused no-op;
- Unsubscribed re-subscribe;
- preference preservation;
- deterministic queue ownership;
- replay/idempotency;
- ambiguous identity;
- partial-state fail-closed behavior;
- invalid consent;
- production-ID refusal;
- legacy duplicate-header preference rows.

## Production boundary

No production subscriber, profile, preference, queue, delivery, or intake record was modified during Gate C.

## Decision

Gate C passes.

Before Gate D controlled production, `WELCOME_V1` copy must be accurate for both new and returning subscribers. The repository source now uses state-neutral settings language and CI verifies that it no longer claims every subscriber begins at Normal.
