# Controlled newsletter layout inbox QA — October 2026

**Scope:** one manually approved synthetic QA email through the **existing production Resend transport** to the dedicated test mailbox configured in `ADB_RESEND_TEST_RECIPIENT`. This is **not** subscriber delivery and does **not** create, edit or replay any Outbound Messages, Briefing History, or subscriber records. Do not add an Apps Script trigger or schedule this helper.

**Prerequisites:**
- Both `DailyNewsletterContract.gs` and `ResendTransport.gs` from the approved PR #115 revision are already installed, and the read-only preflight `validateAdbDailyNewsletterContractDeploymentV1()` passed.
- `ADB_DAILY_LAYOUT_GUARD_MODE` remains **STAGED**. Do not merge PR #115 or change to ENFORCE during this QA.
- A single valid test-only recipient is set in existing script property `ADB_RESEND_TEST_RECIPIENT`. Operator visually verifies the address is their authorized QA mailbox; **never publish it in GitHub or this test log**.
- The fixture used by the helper is a **synthetic** newsletter rendered by `scripts/daily_newsletter_renderer.js`, already passed `ADB-DAILY-HTML-1.0`, and pinned to immutable GitHub commit `1c650e09fcfbc1148bdfa4d7fb4447f13e39718e`. It includes no actual subscriber email, stories or confidential information.

## Step A — Install and preview without sending

1. In existing `ADB PROD Scripts`, add a script `DailyNewsletterDeliveryQa.gs` and copy the full PR #115 version of `apps-script/DailyNewsletterDeliveryQa.gs` from the same verified commit displayed in GitHub.
2. Save. Run **`previewAdbDailyLayoutQaV1`**, not the dispatch function.
3. Read back the log; require `qaFixture=SYNTHETIC`, `contract=ADB-DAILY-HTML-1.0`, `validation=PASS`, nonzero source/destination counts, `recipientConfigured=true`, `providerSends=0`, `queueWrites=0`, `scriptPropertyChanges=0`.
4. If preview fails, do not try to send or change the production layout guard; diagnose the specific missing file/property or mismatch.

## Step B — One-time controlled send (only with user approval)

1. Confirm **which** configured `ADB_RESEND_TEST_RECIPIENT` test mailbox is authorized and accessible in a normal email client. The QA helper refuses lists or ambiguous values.
2. Operator adds Script Property `ADB_DAILY_LAYOUT_QA_SEND_APPROVAL` with the exact value `SEND_ONCE`. Do this only immediately before the test.
3. Manually run **`sendAdbDailyLayoutQaV1` exactly once**. The helper loads and validates the pinned HTML and text, consumes the authorization property before contacting Resend, and sends to the one test recipient only. Subject starts `[QA — SYNTHETIC]`. It does not open, write, or change Google Sheets and does not invoke the production dispatcher.
4. Require the log's provider acceptance (HTTP 2xx and provider ID). Acceptance is **not** inbox delivery: operator must inspect the received message.
5. If an error occurs, the approval property is consumed before provider handoff; confirm whether the provider accepted a send before re-arming. Do not repeatedly run the function.

## Step C — Visual acceptance and teardown

Evaluate Gmail/Yahoo/Tuta/Outlook depending on available controlled mailboxes; do not claim untested clients passed. Minimum evidence for the actual received copy:
- Brand masthead loads or useful alt text appears; footer mark loads; rendering works with images blocked.
- At desktop and phone widths, exactly one max-620px Paper reading column; masthead/date then Pulse, Weather, Featured, other Top Stories, optional Under the Radar, More for You, Austin Ahead, footer.
- Featured and standard headlines use editorial serif; all article summaries and Why It Matters left aligned; canonical warm fields and red rules.
- Every publisher source link is visible, opens the intended destination, and is underlined in Link Red; HTML/plain text parity validated.
- Footer Customize uses native `/customize.html`; Manage uses current approved **Google** production form, because FORM-9 native management remains DEV-only.
- Scroll, dark mode, narrow viewport, long links, and image-blocked behavior have no clipping or severe hierarchy defects.

After recording the result, delete/disable `DailyNewsletterDeliveryQa.gs` from the **installed** production Apps Script project (the repository test helper may remain as an archived QA reference), and remove the `ADB_DAILY_LAYOUT_QA_SEND_APPROVAL` property if present. Do not delete `DailyNewsletterContract.gs` or the updated `ResendTransport.gs`. Leave `STAGED` until separate generator/main cutover approval.

**Scope limitation:** this synthetic Resend test verifies transport and visible email-client formatting; it is not an editorial-source QA, personalized-subscriber eligibility test, or full production queue/history cycle. Those still require controlled integration after approval.
