# November 6 production readiness: capacity and quota recovery

Status: read-only audit and release acceptance plan. No production source was
installed, scripts executed, tasks/triggers/properties changed, data written,
messages sent, schemas provisioned or publisher activated by this audit.

## Direct answer

Google limits can stop an Apps Script execution and delay or prevent that day's
render/queue/delivery pipeline from completing. No quota-free guarantee is
possible. The current audience is small and the new DEV path has useful measured
headroom, but the production input volume, shared execution and recovery behavior
are not yet certified. Successful DEV commits and retries prove ledger-backed
reconciliation, not that every quota exception automatically resumes work.

Rendering itself is in-memory JavaScript. However, trusted input reads and
publication depend on Sheets, and rendering/validation run within Apps Script's
execution limit. Resend is the subscriber email provider, but Apps Script still
reads the queue, calls Resend through URL Fetch and records delivery state.
Gmail/MailApp recipient quotas are not the subscriber transport's sending quota.

## Grounded sources and scope

Repository main inspected at 57f028105dd9450b95c519ee33ef8d3382c98b77; development branch inspected
at fde1a718f3dbd74145b7bff21e8be76cf63224d6. Production dispatcher findings refer to the repository
copy of ResendTransport.gs. Installed production-project source, actual current
triggers, owner account tier, Cloud project quotas/usage and complete owner-wide
Apps Script workload were not freshly inspected or inferred from these files.

Official documents checked November 6, 2026:
- https://developers.google.com/apps-script/guides/services/quotas
- https://developers.google.com/workspace/sheets/api/limits
- https://resend.com/docs/dashboard/emails/idempotency-keys

## Current read-only production snapshot

Exact production database and intake IDs were resolved through connector
metadata. Reads used bounded metadata-derived tabs/ranges; private profile/contact
data was used only for aggregate checks and is not committed here.

| Check | Observed result |
| --- | --- |
| Subscribers / Profiles | 15 / 15 populated records |
| Eligible Active + Admin OK, matching active profile | 12 |
| Preferences | 345 populated rows; 248 matching mirrors, 97 blank mirrors, 0 conflicts |
| Active DAILY_BRIEFING_V1 production template | Exactly 1, using Active=TRUE |
| Briefing History | 8418 populated records; 8271 Sent; 147 with blank delivery status |
| Sent history dated November 6 | 193 rows |
| Sent prior history dated October 23–November 5 | 2099 rows; structured-note completeness not revalidated in this audit |
| Production Publisher Ledger tab | Absent in current metadata |

History dates and delivery status were read across the complete metadata-confirmed
8,419-row grid. The 147 blank-status rows were not interpreted as Sent, repaired
or deleted. This is an inventory, not a complete new history normalization audit.

Operations Status independently reports:
- Morning Briefing Healthy: attempt/success November 6 08:10 CT, 12 records.
- Daily Resend Delivery Healthy: attempt/success November 6 09:31 CT, 12 records.
- Subscriber Operations Healthy: attempt/success November 6 09:03 CT, zero work.

These are existing producer/watchdog records, not a new provider/inbox verification
or evidence that the new publisher is live. This task is readiness preparation,
not a response to an observed current-day outage.

## Relevant Google limits

| Limit | Published default | Implication |
| --- | --- | --- |
| Sheets API reads | 60/minute/user/project, 300/minute/project | Excess requests can receive HTTP 429; batch reads matter |
| Sheets API writes | 60/minute/user/project, 300/minute/project | One batch counts as one API request, not one request per cell/subrequest |
| Apps Script execution | 6 minutes per execution, both account tiers | One slow or repeatedly retried run can terminate |
| Trigger runtime/day | 90 minutes consumer; 6 hours Workspace | Include actual triggered work under the executing account; account tier unverified |
| URL Fetch/day | 20,000 consumer; 100,000 Workspace | Subscriber dispatch consumes this Google quota even with Resend |
| Sheets payload | Google recommends <=2 MB; no universal hard 2 MB limit | ADB's 1,800,000-byte application guard provides a conservative wire-size boundary |
| Sheets request processing | 180-second timeout | Ambiguous write results require independent reconciliation, not blind reappend |

Per-minute quotas refill each minute. Apps Script daily quotas generally reset
24 hours after the first request; waiting a minute does not clear a daily limit.
Some quotas depend on both user and project and may be customized or shared with
other workload. Built-in SpreadsheetApp calls must be measured separately; their
method-call count is not assumed to equal Advanced Sheets API HTTP request count.

## Evidence already established, and its limits

- Native one-profile reviewed publication completed in about 9 seconds; exact
  replay in about 5 seconds, from operator execution logs.
- Independent readback stayed exactly 1 queue / 6 history / 1 ledger / 2 monitor
  events, Healthy, with unchanged payloads/timestamps on replay.
- Mock-instrumented reviewed writer: 31 Sheets read requests on first publication
  and 23 on replay. These are local request counts, not production telemetry.
  Same-minute first+replay is 54 of the default 60/user/project reads, leaving only
  six for other Advanced Sheets reads. Do not treat that as unlimited capacity.
- Earlier synthetic 12- and 24-profile sizing stayed below ADB's batch-byte guard.
  Those fixtures contain six history items/profile, not today's full editorial
  slate. Today's 193 Sent history rows show why full real-input sizing matters.
- The October 28 real-edition shadow/renderer comparison is historical and must
  be refreshed before promotion.

API request count need not rise once per reader if batched. Payload size, history
normalization, rendering/validation CPU, memory and provider/per-row dispatch work
do grow. Do not extrapolate the 9-second single-profile run linearly or present a
local Node timing as Apps Script/network performance evidence.

## Concrete gaps found

1. **DEV row cap is not a production reader.** The native DEV host refuses tables
   over 2,000 rows. Production history has 8,418, and even the last 14 days contain
   2,099 prior Sent rows. Repointing that host or merely increasing a constant is
   not a validated production implementation. Build the explicit production
   template/Preferences/history adapter with complete scoped history evidence.
2. **No bounded quota backoff/deadline policy in the new native writer.** It has
   safe explicit replay and budget regression checks, but not an automatic
   rate-limit retry scheduler or execution-time checkpoint/resume mechanism.
   A successful replay test does not add those features.
3. **Dispatcher transient-error disposition needs work.** Repository main's daily
   dispatcher selects only Queued rows (line 676). A send exception enters a catch
   that attempts to mark queue and matching history Failed (lines 733–740).
   Later hourly passes do not select Failed. Thus a transient URL Fetch/quota or
   provider failure can require explicit recovery; hourly cadence alone is not
   proof of automatic recovery. A quota error during the catch's own writes can
   leave a partial local disposition, so inspect state rather than assume Failed.
4. **Provider acceptance/local-write gap.** After Resend returns an ID, queue
   Status, provider ID and history are separate SpreadsheetApp writes
   (lines 743–757). A Google exception can interrupt this sequence after a send
   was accepted. Stable message idempotency keys help; Resend documents 24-hour
   retention, not indefinite protection. Do not clear provider evidence or blindly
   resend outside that reconciliation window.
5. **Runtime growth/concurrency not measured in production.** The dispatcher scans
   historical rows and uses repeated per-cell updates. The repository path has no
   explicit elapsed-time cutoff/work limit before six minutes. Measure it with
   publisher colocation, existing operations and growing history.
6. **Watchdog detects; it does not repair.** The current spec distinguishes
   generation and delivery, checks delivery at 09:30, and prohibits subscriber
   sends/retries/repairs. A failed monitoring read/write cannot be declared Healthy
   based on an old success. Detection is valuable but does not deliver a missed
   edition or make exhausted Google services available.

## Failure-stage outcome and required recovery

| Failure point | Likely consequence | Required behavior before production release |
| --- | --- | --- |
| Input read / rendering / validation before target commit | No complete new edition queued; distribution cannot start for that edition | Bounded transient retry within deadline, otherwise retain attempt and schedule/authorize continuation |
| Atomic queue/history/ledger write returns an uncertain result | May have committed despite missing response | Fresh exact ledger + payload reconciliation; never append another edition blindly |
| Monitor update after verified target commit | Edition may already be queued and deliverable | Reconcile telemetry from ledger; preserve original success/incident semantics and never regenerate |
| Dispatch before provider acceptance | Recipients may remain unsent | Distinguish temporary quota/service errors from invalid content/identity; controlled retryable disposition with backoff |
| Dispatch accepted, local recording interrupted | Partial bookkeeping or mixed recipient completion | Reconcile stable message/provider identity and retained request bytes; no blanket resend |
| Daily owner quota or six-minute termination | May defer remaining work or miss the delivery window | Durable continuation/failure visibility; bounded scheduling and explicit operator escalation |

These are release requirements, not newly enabled repair permissions. A ledger
prevents duplicate publication; it cannot by itself prove provider delivery.

## Capacity and resilience gate: OPEN

Before a supervised live pilot, prepare and demonstrate:

1. Fresh real-input, read-only shadow planning for all 12 current eligible
   profiles and double-audience synthetic load. Include complete applicable
   history, actual editorial size, wire bytes and renderer/selection parity.
   No live queue writes or archive rewriting in a shadow.
2. A 60-second request budget covering publisher first run, review requests,
   monitoring and approved retries sharing that project; leave explicit
   headroom rather than relying on 54/60 as the normal operating target.
3. Measured Apps Script phase runtimes at current and double-audience load with
   production-sized history; a proposed soft deadline of 240 seconds reserves
   two minutes for readback/cleanup under Google's six-minute ceiling. This is
   a proposed application policy, not an existing Google limit or implemented
   deadline.
4. Bounded exponential backoff with jitter for classified transient failures.
   Do not sleep through an entire daily quota or repeatedly retry an uncertain
   append without first reconciling. Persist continuation only through the
   agreed operational owner and approved scheduling path.
5. Simulated 429, URL Fetch daily quota, six-minute/deadline, target-response loss,
   success-monitor-response loss, partial provider acknowledgement and lock
   contention. Verify no duplicates, no false Healthy, bounded work and safe
   resumption. Use mocked providers/non-live files; no live recipient sends.
6. Explicit dispatcher recovery design for Failed vs retryable/uncertain results,
   including Resend's idempotency horizon. Review installed production code parity
   before proposing a tested change; do not overwrite the live dispatcher from
   repository assumptions.
7. Account tier/Cloud project/actual trigger inventory and quota-usage evidence
   through the Apps Script dashboard or Cloud console when available. Owner-wide
   daily allowance and live headroom were not visible through this connector.

## Production-readiness work order

First prepare bounded retry/deadline/continuation and send-result reconciliation
in isolated tests. Then finish the disabled production adapter and scoped-history
reader, run the full-input shadow/capacity comparison and integrate the existing
failure-only operational monitoring owner. Retain explicit zero-audience success,
abandoned-attempt reconciliation and durable replay/incident retention requirements.

Existing ledger/staging/adapter/monitoring and history/capability/READY permission
gates remain unresolved. The successful supervised DEV path does not silently
waive them. Prepare exact provisioning, source/package pins, target IDs, cutover
edition, old-generator ownership and rollback before any request to activate.

No new production script installation is needed from Anthony for this audit.
