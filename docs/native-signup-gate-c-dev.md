# Native Signup — Gate C DEV Processor QA

**Scope:** FORM-7 Gate C  
**Environment:** Development only  
**Production impact:** None authorized

## Purpose

Validate the repository-controlled native-signup processor against the live DEV control-plane schemas after the mocked parity suite passes.

Processor source:

`apps-script/NativeSignupDevProcessor.gs`

The processor is intentionally separate from the public intake endpoint. The intake stages requests; the processor owns subscriber/profile/preference mutations and Welcome queue creation.

## Repository gate

Before live DEV execution:

- `tests/native-signup-processor-dev.test.js` must pass;
- Apps Script syntax validation must pass;
- documentation registry must pass;
- production IDs must remain refused by the DEV source.

PR #73 satisfied the repository parity gate on 2026-10-04.

## Live DEV execution

Use the existing FORM-7 DEV Apps Script project.

1. Add a new Apps Script file containing the current `apps-script/NativeSignupDevProcessor.gs` from repository `main`.
2. Save the project.
3. Do **not** redeploy the public web app solely for Gate C; the existing versioned Gate B endpoint can remain unchanged.
4. Select `processNativeSignupDevV1` in the Apps Script editor.
5. Run it manually once.
6. Authorize spreadsheet access only if Google prompts.
7. Do not enable a trigger or recurring schedule.

The function must run against only:

- DEV subscriber database `1rl5GTOvuBSHyFK1r9CqI_6Z5gAwtgsTQnQQf9VCMeyM`;
- DEV intake workbook `1TiSgmFxij8p3wKnt_skTFXQvAOEuR2wI5c6V8Jq_Yyw`.

It fails closed if either configured DEV ID is replaced by a production ID.

## Required live cases

The controlled DEV fixture set should cover:

1. **New subscriber** — creates one subscriber/profile, 23 Normal preferences, one Signup Action, and one Queued `WELCOME_V1`.
2. **Existing Active** — request becomes a terminal no-op; no duplicate subscriber/profile/preferences/Welcome.
3. **Existing Paused** — request becomes a terminal no-op; status remains Paused; resume remains a Manage action.
4. **Existing Unsubscribed** — existing subscriber becomes Active, existing Profile ID and all preferences remain unchanged, one re-subscribe Signup Action is recorded, and exactly one Welcome is queued.
5. **Replay** — rerunning the processor creates no duplicate records.
6. **Partial/ambiguous state** — fails closed with no automatic repair.

## Live verification

After the manual run, inspect:

- `Native Signup Requests`;
- `Subscribers`;
- `Profiles`;
- `Preferences`;
- `Signup Actions`;
- `Outbound Messages`.

Verify the Welcome rows remain `Queued`. Do not invoke the dispatcher as part of Gate C.

## Pass criteria

Gate C passes only when repository parity and live DEV readback agree on the state transitions above, no duplicate identity is created, saved preferences survive re-subscription unchanged, exactly one Welcome is queued for new/re-subscribed identities, and production remains untouched.

## Fixture readiness — 2026-10-04

The controlled DEV fixture set is prepared and verified. It contains exactly one intentional case each for new signup, existing Active, existing Paused and existing Unsubscribed/re-subscribe behavior. The Paused fixture includes one coherent profile and all 23 active-interest preference rows. Earlier Gate B smoke requests are marked terminal intake-only and will not be processed as subscribers.

For live replay verification, run `processNativeSignupDevV1` **twice**. The first run should process the four Gate C requests. The second run should perform no additional subscriber/profile/preference/action/Welcome mutations.
