/** Read-only synthetic sizing and renderer parity. No commit/send API calls.
 * Add alongside installed publisher source 27c484e; no source-pin change needed.
 * This is synthetic parity, not a production editorial shadow comparison.
 */
function adbPublisherSyntheticQaInput_(originalPackage, originalState, count) {
  adbPublisherRequire_(Number.isInteger(count) && count > 0 && count <= 48,
    'synthetic QA count must be 1 through 48');
  const clone = value => JSON.parse(JSON.stringify(value));
  const pkg = clone(originalPackage), state = clone(originalState);
  adbPublisherRequire_(pkg.editions.length === 1 &&
    originalState.subscribers.length === 1 && originalState.profiles.length === 1,
    'synthetic QA requires the one-profile DEV fixture');
  const baseId = pkg.editions[0].profile_id;
  adbPublisherRequire_(baseId === 'SYNTHETIC' &&
    String(originalState.subscribers[0].Email).endsWith('@example.invalid'),
    'synthetic QA cannot use a real subscriber');
  const baseEdition = clone(pkg.editions[0]);
  const baseRows = pkg.selection_bundle.rows.filter(r => r.profile_id === baseId);
  const baseProfile = clone(pkg.selection_bundle.profiles[baseId]);
  adbPublisherRequire_(baseRows.length === 6 &&
    pkg.selection_bundle.published_history.length === 0,
    'unexpected synthetic fixture/history');
  pkg.expected_profile_count = count;
  pkg.editions = [];
  pkg.selection_bundle.profiles = {};
  pkg.selection_bundle.rows = [];
  state.subscribers = [];
  state.profiles = [];
  state.personalization = {};
  // Only in-memory copies are cleared, so the existing committed QA stays intact.
  state.queue = [];
  state.history = [];
  state.ledger = [];
  state.publishedHistory = [];
  delete state.tables;
  for (let i = 1; i <= count; i++) {
    const id = 'SYNTHETIC-BATCH-' + String(i).padStart(3, '0');
    const email = 'publisher-batch-' + i + '@example.invalid';
    const edition = clone(baseEdition);
    edition.profile_id = id;
    pkg.editions.push(edition);
    pkg.selection_bundle.profiles[id] = clone(baseProfile);
    baseRows.forEach(row => {
      const copy = clone(row);
      copy.profile_id = id;
      pkg.selection_bundle.rows.push(copy);
    });
    state.subscribers.push({'Profile ID':id, Email:email,
      Status:'Active', 'Admin Status':'OK'});
    state.profiles.push({'Profile ID':id, Status:'Active',
      'Primary Preference Email':email});
    state.personalization[id] = clone(baseProfile);
  }
  return {pkg:pkg, state:state};
}

function adbPublisherMeasureSyntheticQa_(pkg, state, clock) {
  const started = Date.now();
  const plan = adbPlanEditorialPublication(pkg, state, clock, adbPublisherDigest_);
  adbPublisherRequire_(plan.result === 'READY', 'synthetic planning failed');
  const plannedMs = Date.now() - started;
  // Same typed appendCells wire shape as the installed DEV adapter; IDs are
  // placeholders because this request is measured, never submitted.
  function append(sheetId, headers, rows) {
    return {appendCells:{sheetId:sheetId,
      rows:rows.map(row => ({values:headers.map(header => ({
        userEnteredValue:typeof row[header] === 'number' ?
          {numberValue:row[header]} : {stringValue:row[header]}
      }))})), fields:'userEnteredValue'}};
  }
  const request = {requests:[
    append(1357689219, ADB_PUBLISHER.QUEUE, plan.queue),
    append(174765499, ADB_PUBLISHER.HISTORY, plan.history),
    append(217333596, ADB_PUBLISHER.LEDGER, [plan.ledger])
  ]};
  const bytes = Utilities.newBlob(JSON.stringify(request)).getBytes().length;
  let equivalent = 0;
  pkg.editions.forEach(edition => {
    const reference = adbRenderDailyNewsletter(edition.editorial);
    const queued = plan.queue.filter(q => q['Profile ID'] === edition.profile_id);
    adbPublisherRequire_(queued.length === 1 && queued[0].HTML === reference.html &&
      queued[0]['Plain Text'] === reference.text, 'synthetic renderer parity failed');
    equivalent++;
  });
  adbPublisherRequire_(plan.queue.length === pkg.expected_profile_count &&
    plan.history.length === 6 * pkg.expected_profile_count,
    'synthetic output row count mismatch');
  return {profiles:plan.queue.length, historyRows:plan.history.length,
    ledgerRows:1, requestBytes:bytes, byteLimit:ADB_PUBLISHER.MAX_BYTES,
    withinByteLimit:bytes < ADB_PUBLISHER.MAX_BYTES,
    limitUsedPercent:Math.round(bytes / ADB_PUBLISHER.MAX_BYTES * 1000) / 10,
    planRenderValidateMs:plannedMs, totalMeasureMs:Date.now() - started,
    syntheticRendererParity:equivalent + '/' + pkg.expected_profile_count};
}

function runPublisherDevBatchQaV1() {
  const started = Date.now();
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty(ADB_PUBLISHER.DEV_ID_PROPERTY);
  adbPublisherRequire_(id === '1I9UAR6kabPt0P_lvDiJX_oskPeCVcVI64_vTbwEOF2I',
    'incorrect synthetic QA workbook');
  adbPublisherRequire_(props.getProperty(ADB_PUBLISHER.REVISION_PROPERTY) ===
    '27c484eca26c2da77f594c31373ae479ae7c93f1', 'installed source pin mismatch');
  const book = SpreadsheetApp.openById(id), state = adbPublisherState_(book);
  const packageId = 'PUB-QA-2026-10-28-01';
  const manifests = adbPublisherTable_(book, 'Packages').rows
    .filter(r => r['Package ID'] === packageId);
  adbPublisherRequire_(manifests.length === 1 && manifests[0].State === 'READY',
    'READY synthetic package missing or ambiguous');
  const chunks = adbPublisherTable_(book, 'Package Chunks').rows
    .filter(r => r['Package ID'] === packageId)
    .sort((a,b) => Number(a.Sequence) - Number(b.Sequence));
  adbPublisherRequire_(chunks.length === Number(manifests[0]['Chunk Count']) &&
    chunks.every((r,i) => Number(r.Sequence) === i + 1), 'synthetic chunks invalid');
  const pkg = JSON.parse(chunks.map(r => r.JSON).join(''));
  adbPublisherRequire_(adbPublisherDigest_(adbPublisherCanonical_(pkg)) ===
    manifests[0]['Package SHA-256'], 'synthetic fixture digest mismatch');
  const now = new Date();
  const clock = {iso:now.toISOString(),
    editionDate:Utilities.formatDate(now, 'America/Chicago', 'yyyy-MM-dd')};
  adbPublisherRequire_(pkg.edition_date === clock.editionDate,
    'synthetic package expired; refresh fixture before testing');
  const results = [1,12,24].map(count => {
    const input = adbPublisherSyntheticQaInput_(pkg, state, count);
    const report = adbPublisherMeasureSyntheticQa_(input.pkg, input.state, clock);
    Logger.log(JSON.stringify(report));
    return report;
  });
  adbPublisherRequire_(results[1].withinByteLimit, '12-profile byte limit exceeded');
  const report = {result:'PASS', syntheticOnly:true, writes:false, emails:false,
    twelveProfileBatchFits:true, doubleAudienceBatchFits:results[2].withinByteLimit,
    elapsedMs:Date.now() - started,
    scope:'DEV reads plus in-memory planning, rendering, validation and wire-size measurement; no commit/network-send timing'};
  Logger.log(JSON.stringify(report));
  return report;
}
