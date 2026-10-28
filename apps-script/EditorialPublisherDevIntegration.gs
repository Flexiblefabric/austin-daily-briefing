/** ADB-PUBLISHER-DEV-INTEGRATION-0.1. Opt-in DEV wrapper, no automatic polling.
 * Uses the unchanged DEV publisher's atomic target write and readback.
 * Requires EditorialPublisher.gs, EditorialPublisherDevWorkflow.gs and the
 * 0.3 EditorialPublisherDevMonitor.gs. No transport or trigger/property writes.
 */
function adbDevIntegrationLock_(action) {
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try {return action();} finally {lock.releaseLock();}
}

function adbDevIntegrationContext_(packageId) {
  const R=adbDevWorkflowRequire_,book=adbDevMonitorOpen_();
  R(typeof packageId==='string' && /^[A-Za-z0-9_-]{1,100}$/.test(packageId),'invalid package ID');
  const manifests=adbPublisherTable_(book,'Packages').rows.filter(r=>r['Package ID']===packageId);
  R(manifests.length===1 && manifests[0].State==='READY','unique READY package required');
  const chunks=adbPublisherTable_(book,'Package Chunks').rows.filter(r=>r['Package ID']===packageId)
    .map(r=>({'Package ID':r['Package ID'],Sequence:Number(r.Sequence),JSON:r.JSON}));
  const manifest=Object.assign({},manifests[0],{'Chunk Count':Number(manifests[0]['Chunk Count'])});
  const pkg=adbDevReadReadyV1({manifest:manifest,chunks:chunks},adbPublisherDigest_);
  R(pkg.schema===ADB_PUBLISHER.SCHEMA && pkg.edition_date===Utilities.formatDate(new Date(),'America/Chicago','yyyy-MM-dd'),
    'current Chicago edition required');
  R(Number.isInteger(pkg.expected_profile_count) && pkg.expected_profile_count>0,'zero-audience monitoring not implemented');
  return {packageId:packageId,pkg:pkg,editionDate:pkg.edition_date,runId:pkg.edition_date+'-publisher-v1',
    digest:manifest['Package SHA-256']};
}

/** A retry reuses the persisted timestamp, not a new payload under the same ID. */
function adbDevIntegrationEmit_(io,context,eventId,type,stage,ledger) {
  return adbDevIntegrationLock_(function(){
    const state=adbDevMonitorSnapshotV1(io.read(),adbPublisherDigest_);
    const event={id:eventId,type:type,at:new Date().toISOString(),editionDate:context.editionDate,
      runId:context.runId,digest:context.digest,stage:stage};
    if(ledger) event.ledger=ledger;
    if(Object.prototype.hasOwnProperty.call(state.events,eventId)) {
      const previous=JSON.parse(state.events[eventId]);event.at=previous.at;
      adbDevWorkflowRequire_(adbPublisherCanonical_(event)===state.events[eventId],
        'attempt ID reused with different package/outcome');
    }
    return adbDevPersistMonitorEventV1(io,event,adbPublisherDigest_);
  });
}

/** Re-run the complete independent planner against persisted target state.
 * Only after ALREADY_COMMITTED may monitoring receive a typed verified ledger.
 */
function adbDevIntegrationVerify_(context) {
  return adbDevIntegrationLock_(function(){
    adbDevMonitorOpen_();
    // Read target values from the write API, avoiding SpreadsheetApp's cached
    // pre-commit data when verification follows a Sheets API batch.
    const names=['Environment','Subscribers','Profiles','Preferences','Message Templates','Outbound Messages','Briefing History','Publisher Ledger'];
    const metadata=Sheets.Spreadsheets.get(ADB_DEV_MONITOR.DATABASE,{fields:'sheets(properties(sheetId,title))'});
    const values=Sheets.Spreadsheets.Values.batchGet(ADB_DEV_MONITOR.DATABASE,{
      ranges:names.map(n=>"'"+n+"'!A:M"),valueRenderOption:'FORMATTED_VALUE'}).valueRanges;
    adbDevWorkflowRequire_(values && values.length===names.length,'missing verification ranges');
    const facade={getSheetByName:function(name){
      const index=names.indexOf(name),sheet=metadata.sheets.find(s=>s.properties.title===name);
      if(index<0 || !sheet)return null;
      return {getSheetId:()=>sheet.properties.sheetId,getDataRange:()=>({getDisplayValues:()=>values[index].values||[]})};
    }};
    const state=adbPublisherState_(facade);
    const verified=adbPlanEditorialPublication(context.pkg,state,{
      iso:new Date().toISOString(),editionDate:Utilities.formatDate(new Date(),'America/Chicago','yyyy-MM-dd')
    },adbPublisherDigest_);
    adbDevWorkflowRequire_(verified.result==='ALREADY_COMMITTED' && verified.digest===context.digest,
      'publication readback not committed');
    const rows=state.ledger.filter(r=>r['Edition Key']==='daily:'+context.editionDate);
    adbDevWorkflowRequire_(rows.length===1,'verified ledger not unique');
    const ledger=Object.assign({},rows[0],{'Profile Count':Number(rows[0]['Profile Count']),
      'History Count':Number(rows[0]['History Count'])});
    adbDevWorkflowRequire_(ledger['Profile Count']===context.pkg.expected_profile_count &&
      ledger['History Count']===state.history.filter(r=>r['Run ID']===context.runId).length,
      'verified ledger count mismatch');
    return ledger;
  });
}

/** Coordinator test boundary. Concrete DEV dependencies are wired below.
 * Failure recording never requeues, repairs, rolls back or sends a message.
 */
function adbRunDevMonitoredPublicationV1(deps,context,attemptId) {
  adbDevWorkflowRequire_(typeof attemptId==='string' && /^[A-Za-z0-9_-]{1,75}$/.test(attemptId),'invalid attempt ID');
  deps.emit(context,attemptId+'-start','ATTEMPT','validation');
  let stage='commit';
  try {
    const publication=deps.publish(context.packageId);
    adbDevWorkflowRequire_(['COMMITTED','ALREADY_COMMITTED'].includes(publication.result) &&
      publication.runId===context.runId,'unexpected publication result');
    stage='readback';const ledger=deps.verify(context);
    stage='monitoring';const monitor=deps.emit(context,attemptId+'-success','COMMIT_VERIFIED','readback',ledger);
    return {publication:publication.result,monitoring:monitor.result,runId:context.runId,
      profiles:ledger['Profile Count'],historyRows:ledger['History Count'],emails:false};
  } catch(error) {
    // A monitor failure itself may prevent recording failure. Preserve the
    // original exception; the target ledger remains the completion authority.
    // In the monitoring stage an exception may be a lost response AFTER the
    // success event committed. Appending FAILURE would overwrite that success.
    // Leave that ambiguous outcome to exact-event reconciliation on retry.
    if(stage!=='monitoring') {
      try {deps.emit(context,attemptId+'-failure','FAILURE',stage);} catch(monitorError) {}
    }
    throw error;
  }
}

/** Explicit opt-in only. Does NOT replace publishReadyEditorialPackageDevV1.
 * Current-day positive-audience packages only; no historical replay bypass.
 */
function publishReadyEditorialPackageDevMonitoredV1(packageId,attemptId) {
  adbDevWorkflowRequire_(typeof attemptId==='string' && /^[A-Za-z0-9_-]{1,75}$/.test(attemptId),'invalid attempt ID');
  const context=adbDevIntegrationLock_(function(){
    const value=adbDevIntegrationContext_(packageId);
    adbDevMonitorProvision_(adbDevMonitorOpen_(),'publisher');return value;
  });
  const io=adbDevMonitorIo_('publisher');
  return adbRunDevMonitoredPublicationV1({
    emit:(c,id,type,stage,ledger)=>adbDevIntegrationEmit_(io,c,id,type,stage,ledger),
    publish:publishReadyEditorialPackageDevV1,verify:adbDevIntegrationVerify_
  },context,attemptId);
}
