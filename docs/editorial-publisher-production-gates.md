# Production publisher adapter and release gates

Status: read-only preflight executed in Apps Script; production gates remain blocked.
Production publication is not implemented or enabled by this source. No live
generator, dispatcher, trigger, property, production ledger or status row has
been changed. DEV 0.2 and its passed tests remain intact.

## Current production compatibility audit

The October 28 connector read confirmed the production queue/history schemas,
one active DAILY_BRIEFING_V1 template, a Healthy Morning Briefing row, Release B
controlled-test PASS and SILENT success policy. The active template uses
`Active=TRUE` and `Environment=PRODUCTION`, not the DEV fixture's Status field.

Preferences has two columns named Profile ID. The first is canonical; 248 rows
have the same ID repeated in the later column and the remaining mirrors are
blank. No conflicting mirrors were observed. A naive object mapping would
overwrite canonical IDs with those blanks. The new normalization helper takes
the first occurrence, permits only this known mirror, and blocks conflicts,
duplicate profile/interest pairs and unrecognized preferences.

The older archive contains 3,155 Sent records without structured selection
envelopes. The independently read October 14–27 archive contains 2,320 structured
Sent records. Existing DEV parsing of every historical Sent note cannot simply
be reused for production.

`adbProdPublisherNormalizeHistoryV1` provides a non-destructive alternative:
read the entire archive; normalize genuine structured prior facts; exclude the
current edition from prior history; block malformed or unstructured data inside
the complete 14-day window; and retain an unresolved-extended-history flag for
older legacy records. Unknown or future dates block completeness. It does not
infer facts from headlines or silently rewrite a delivered row.

Ordinary current-news lookup can therefore remain complete without rewriting
the older archive. An evergreen/resource candidate whose selection requires
history beyond the default window must still fail closed while that extended
history is unresolved. Before a candidate enters the original eligible ranked
pool, either establish its full applicable history with auditable evidence or
record the history gate rejection and rerank according to the existing editorial
rules. Do not call the history complete merely because an optional item was
removed after selection. This is a scoped-history implementation of the existing
repeat policy, not approval to weaken evergreen checks.

## Read-only Apps Script preflight

Add `apps-script/EditorialPublisherProdPreflight.gs` to the EXISTING Apps Script
project that contains `ResendTransport.gs` and owns its hourly daily dispatcher
trigger. Run `checkEditorialPublisherProductionReadinessV1`. This standalone file
does not require installing DEV writer files into production and makes no
configuration changes. It uses the existing built-in Sheets, Properties and
Script services; no new Advanced service is needed for this inspection.

The preflight reads the exact production/intake databases, table schemas,
template flags, subscriber/profile uniqueness, Preferences mirrors, historical
evidence, optional ledger, release/monitoring configuration and current project
trigger metadata. It never invokes the dispatcher. Reports contain counts and
gate explanations, not subscriber identities, email bodies, tokens or secrets.

The expected overall result is BLOCKED because this build intentionally has no
production commit path and cannot verify permission separation from script
properties alone. Some checks may be UNKNOWN until their evidence is supplied.
This is readiness of the NEW publisher, not a claim that current briefing
delivery is unhealthy.

Do not change production properties or create triggers for this preflight. The
default new-publisher mode is DISABLED. An existing LIVE value is flagged because
this preflight build does not supply a production writer.

### October 28 runtime evidence

The user supplied an Apps Script execution log at 1:27:51 PM Central for build
`ADB-PUBLISHER-PROD-PREFLIGHT-0.1`. It completed with result BLOCKED,
productionPublishingEnabled=false, writes=false and emails=false. Metrics:
12 eligible profiles, 345 preference rows, 6,849 Sent history rows, 3,155 legacy
Sent rows, zero malformed structured Sent rows, recentHistoryComplete=true and
extendedHistoryKnown=false. These are runtime counts; earlier connector reads
were snapshots and are not substituted for them.

Blocked: publisher_ledger, dispatcher_colocation, layout_guard, private_staging,
publisher_monitoring_integration and production_commit_adapter. Unknown:
published_history_extended, generator_capability_separation and
immutable_ready_permissions. This does not activate publication or diagnose
current delivery as unhealthy.

Run `inspectEditorialPublisherProjectReadinessV1` in the same project next. This
read-only diagnostic reports whether the dispatcher function exists, its source
contains the ScriptLock reference, the executing user owns exactly one matching
trigger, and the preflight's effective layout guard is ENFORCE. It opens no
workbooks and never invokes delivery. A missing visible trigger does not prove
the trigger is absent for another owner: Apps Script only exposes this user's
project triggers. A source reference is an inspection heuristic, not proof of
runtime lock coverage. Do not add triggers, change properties or copy dispatcher
code to clear these checks before the project and owner are established.

The diagnostic and preflight have 25 local regression tests. The diagnostic's
Apps Script execution remains pending.

## Permission and staging gate

Use a separate private production-staging workbook with Environment identified
as PUBLISHER_STAGING, external delivery FALSE, production publishing DISABLED,
and exact Packages / Package Chunks schemas. No staging workbook or production
ledger was created during this audit. The production database, intake database
and all existing DEV workbooks are forbidden staging targets.

The drafting principal must have write capability only for DRAFT inputs. The
publisher principal can read sealed READY packages and write operational targets.
READY payloads and their digest, plus queue/history/ledger, must be protected from
the drafting principal. File ownership, inherited roles and connector OAuth
scope must all be considered: a prompt saying 'staging only' does not restrict a
same-owner connector that still has production edit authority. An alternative
restricted MCP/API boundary is acceptable only if it actually enforces the same
capability separation. Record the exact principals/roles and an attempted denied
production write in a controlled non-live permissions test before claiming PASS.
Do not place private principal addresses or credentials in the public repository.

For now these two checks remain UNKNOWN and block promotion. No attestation
boolean or mode property substitutes for access evidence. No automatic sharing,
service account creation or broader authorization was performed.

## Write adapter and concurrency gate

The eventual production adapter must use the production template's Active field,
the explicit Preferences normalizer and the scoped-history adapter. Keep the
pure planner's production target adaptation explicit; never point the DEV
publisher entry point at production or spoof a production workbook as DEV.

The writer must live in the SAME Apps Script project as the existing Resend
dispatcher, so its ScriptLock actually coordinates both. The preflight inspects
the dispatcher function, its ScriptLock reference, exactly one existing daily
dispatcher trigger and absence of publisher triggers. A separate standalone
project's ScriptLock is not sufficient. Human/connector writes still need the
permission boundary described above.

After those gates, a production ledger with the reviewed schema belongs in the
same target workbook as queue and history. Queue, history and ledger must commit
in one measured Sheets batch and be read back before success. Production schema
provisioning, permission changes, fresh package sealing, actual production write
code and the controlled commit window remain unperformed. The current preflight
cannot publish under any mode value.

## Monitoring ownership and rollout gate

Keep one canonical Morning Briefing row. During cutover, the generator must stop
claiming generation success at queue/history completion because it will only
produce the handoff. The publisher owns the final generation success transition
after atomic commit and readback. The separate Resend delivery path continues to
own provider acceptance and delivery monitoring.

Before enabling a writer, prepare and test the following idempotent transitions:

1. Record attempt/start without advancing Last Success; identify package/run and
   stage in operational detail while retaining the earliest unresolved incident.
2. Reject malformed/unsealed input, schema/identity/selection errors and stale
   snapshots before queue/history writes. Record exact failure stage and the
   existing Morning Briefing CT-day incident key.
3. After ledger-backed commit/readback, record success once. An interrupted
   response reconciles from the ledger and does not append a second edition.
4. Treat telemetry failure after commit as a monitoring-stage failure with the
   committed ledger identified; recovery must never replay queue/history.
5. Reuse the established failure-only alert owner, per-component/day suppression,
   silent recovery and retention policy. Do not introduce subscriber alerts or
   a second independent recovery/incident owner.

The production database and intake monitoring workbook are separate. Their
writes cannot be one atomic Sheets transaction, so monitor writes must be
idempotent follow-up operations that reconcile against the target ledger. A
monitoring failure is not permission to requeue or resend an edition.

This monitoring integration is designed but not implemented or invoked. Existing
status rows, alert transport and watchdog schedules were not touched.

Only after readiness, permissions, monitoring, corrected real-input shadow and
controlled fresh-package commit evidence pass should the generator prompt and
runtime task be cut over together. Preserve the existing daily dispatcher and
its independent ENFORCE guard. Prepare the concrete package, exact target IDs,
rollback and no-duplicate evidence before requesting production activation.
Rollback must disable new publication without replaying a committed edition;
valid existing queue rows remain under dispatcher ownership.
