# Native editorial publisher capacity probe

Use this manual Apps Script probe to measure Sheets read time for the production
history and audience inputs. It runs in a fresh standalone inspection project
under the operator's Google account. The project requests read-only Sheets
access and permission to call the Sheets API over HTTP.

1. Create a standalone project at [script.google.com](https://script.google.com/).
   Name it **ADB Native Capacity Probe**.
2. Replace its default Code.gs with
   [Code.gs](../../apps-script/capacity-probe/Code.gs). In **Project Settings**,
   turn on **Show "appsscript.json" manifest file in editor**, then replace
   appsscript.json with the [companion manifest](../../apps-script/capacity-probe/appsscript.json).
   The manifest lists the Sheets advanced service to enable the API in the
   default Apps Script Cloud project. For a standard Cloud project, enable the
   Google Sheets API in Cloud Console as well.
3. Save both files. Select **runAdbNativeCapacityProbeV1** and click **Run**.
   Use the Google account that can read the production database and review the
   requested access. Run once outside the scheduled morning delivery window.
4. Copy the single JSON line from the execution log. It contains only aggregate
   counts, timings and status. A BLOCKED result includes a reason code.

The probe reads metadata, subscriber/profile/preference/template input ranges,
the queue header, and the complete history grid in 600-row chunks. It repeats
that sequence and compares digests. PASS means both passes completed inside the
budget and matched. The grid can include unused rows, so chunk counts may differ
from the earlier capture. Two matching passes do not provide transactional
snapshot isolation.

The probe allows at most 50 Sheets read attempts across both passes, including
retries. It retries HTTP 429, specified rate-limit 403 responses and selected
server errors with bounded exponential backoff. A 120-second cutoff prevents
starting further reads and flags overruns after a call returns. The cutoff
cannot cancel an in-flight request. Each pass reports elapsed time, while
sheetsReadMs totals time spent in fetch calls across both passes.

This measures the operator's quota scope in the standalone project. Production
project contention, complete publisher runtime, write timing and send recovery
remain separate acceptance checks. The queue header read does not include live
message payloads. No deployment or trigger is needed.

See the [November 6 capacity results](../editorial-publisher-production-capacity-2026-11-06.md)
for archived-content payload sizing and the remaining rollout gates.
