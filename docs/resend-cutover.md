# Resend transport cutover

ADB will retain Google Sheets and the existing Google-only Apps Script processor as its control plane. Resend replaces Gmail only at the final delivery boundary.

## Public identity

- From: `Austin Daily Briefing <briefing@austindailybriefing.com>`
- Reply-To: `briefing@austindailybriefing.com`
- Forwarded reply destination: private monitored inbox configured only in Cloudflare

## Controlled installation

1. In the production intake workbook, open **Extensions → Apps Script**.
2. Add a script file named `ResendTransport.gs` and copy in `apps-script/ResendTransport.gs`.
3. Open **Project Settings → Script properties**.
4. Add `RESEND_API_KEY` with the restricted Resend production key.
5. Add `ADB_RESEND_TEST_RECIPIENT` with an inbox controlled by the administrator.
6. Run `testAdbResendTransportV1` manually and authorize `UrlFetchApp` when prompted.
7. Confirm the provider ID appears in the execution log and the message arrives.

Do not disable or edit the current Gmail calls during this test.

## Welcome queue staging

After the basic transport test passes, replace the installed `ResendTransport.gs`
with the current repository version. Add these Script properties:

- `ADB_RESEND_WELCOME_MODE` = `CONTROLLED`
- `ADB_RESEND_WELCOME_ALLOWLIST` = the exact controlled recipient address

Do not create a time trigger yet. The function
`dispatchQueuedWelcomeMessagesViaResendV1` reads only queued `WELCOME_V1` rows,
rechecks the subscriber and profile immediately before sending, uses Message ID
as Resend's idempotency key, and records the Resend provider ID in the existing
delivery column. In controlled mode it skips every address outside the allowlist.

Before its first run, create or identify one explicitly authorized queued welcome
record for the allowlisted Active subscriber and snapshot that row. After the run,
confirm one send, one provider ID, no duplicate row, and zero delivery to all
other subscribers. Rerun once and confirm zero additional sends.

## Welcome promotion

After queue delivery and the zero-send replay test both pass, run
`promoteAdbResendWelcomeV1`. It verifies the exact controlled QA record, changes
the Script Property to `LIVE`, removes any duplicate dispatcher triggers, and
creates one hourly trigger for `dispatchQueuedWelcomeMessagesViaResendV1`.

The rollback is `pauseAdbResendWelcomeV1`. It deletes the welcome trigger and
returns the transport to `CONTROLLED`. It does not change subscriber records or
erase queue history.

Keep the existing six-hour subscriber processor separate. Before resuming it,
remove its Gmail welcome-dispatch instructions so it only processes intake and
queues `WELCOME_V1`; Apps Script owns welcome delivery after promotion.

## Queue cutover contract

After the controlled test passes, each live sender calls `adbSendEmailViaResend_` with:

- recipient resolved from one unique Active subscriber/profile;
- required plain-text and HTML bodies;
- an idempotency key derived from the existing queue Message ID or briefing version;
- tags identifying message type and environment.

The returned Resend `id` replaces the Gmail message ID in delivery history. Mark a queue item Sent only after Resend returns a 2xx response and an ID. Preserve the current eligibility checks, hashed verification tokens, replay protection, rate limits, and failure-alert behavior.

## Recommended migration order

1. Welcome messages
2. Ownership confirmations
3. Morning briefings
4. Administrator failure alerts

Each path receives a controlled test and rollback check before the next path moves.
