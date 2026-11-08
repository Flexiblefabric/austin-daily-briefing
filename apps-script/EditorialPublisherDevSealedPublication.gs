/** ADB-DEV-SEALED-PUBLICATION-0.1. Add-on to the standalone review host.
 * Explicit manual DEV publication only. No UI control, sends or scheduling.
 * Uses pure monitor/coordinator helpers in the generated publication add-on.
 */
const ADB_DEV_SEALED_PUBLICATION = Object.freeze({
  DATABASE:'1ognA5DqMxwYN9C11UDEHhPvb79OQ09FSjhdPde1fn7s',
  DRAFT:'1Fuf0vja1GVZYl7WavDyBay_sPmjOoGeXA286H9wfD4k',
  SEALED:'1QvW2aVF7BCdTr-mnlfHTG6Z_NpiSiCSPK7AcjFBvrYQ',
  EDITION:'2026-11-06',PACKAGE:'REVIEW-2026-11-06',
  STATE:'DEV Publisher State',EVENTS:'DEV Publisher Events'
});

function adbDevSealedPublicationPhase_(policy,io) {
  // One phase-scoped trusted API snapshot. Every phase starts from fresh data;
  // readReady still reads the sealed input twice to detect staging changes.
  const input=io.readTrusted(policy.databaseId);
  const phaseIo=Object.assign({},io,{readTrusted:function(id){adbDevHandoffRequire_(id===policy.databaseId,'wrong phase target');return input;},withLock:fn=>fn()});
  const ready=adbCreateDevReviewedHandoffV1(policy,phaseIo,adbPublisherDigest_).readReady(ADB_DEV_SEALED_PUBLICATION.PACKAGE);
  const plan=adbPlanEditorialPublication(ready.package,input.state,input.clock,adbPublisherDigest_);
  adbDevHandoffRequire_(ready.digest===plan.digest && ['READY','ALREADY_COMMITTED'].includes(plan.result),'invalid reviewed publication phase');
  return {input:input,ready:ready,plan:plan};
}

/** Provision in the fixed synthetic database, preserving any existing journal. */
function adbDevSealedMonitorProvision_(policy) {
  const R=adbDevHandoffRequire_,C=ADB_DEV_SEALED_PUBLICATION;
  const metadata=Sheets.Spreadsheets.get(policy.databaseId,{fields:'sheets(properties(sheetId,title))'});
  const sheets=metadata.sheets.map(s=>s.properties),state=sheets.filter(s=>s.title===C.STATE),events=sheets.filter(s=>s.title===C.EVENTS);
  R(state.length<=1 && events.length<=1 && Boolean(state.length)===Boolean(events.length),'partial/ambiguous publisher monitoring');
  if(state.length)return;
  const ids=new Set(sheets.map(s=>s.sheetId));let a=190106001;while(ids.has(a))a++;let b=a+1;while(ids.has(b))b++;
  function headers(id,values){return {updateCells:{range:{sheetId:id,startRowIndex:0,endRowIndex:1,startColumnIndex:0,endColumnIndex:values.length},rows:[{values:values.map(v=>({userEnteredValue:{stringValue:v}}))}],fields:'userEnteredValue'}};}
  Sheets.Spreadsheets.batchUpdate({requests:[
    {addSheet:{properties:{sheetId:a,title:C.STATE,gridProperties:{rowCount:10,columnCount:1,frozenRowCount:1}}}},
    {addSheet:{properties:{sheetId:b,title:C.EVENTS,gridProperties:{rowCount:1000,columnCount:4,frozenRowCount:1}}}},
    headers(a,ADB_DEV_MONITOR.STATE_HEADERS),headers(b,ADB_DEV_MONITOR.EVENT_HEADERS)
  ]},policy.databaseId);
}

function adbDevSealedMonitorIo_(policy) {
  const R=adbDevHandoffRequire_,C=ADB_DEV_SEALED_PUBLICATION;let cached=null;
  function fresh() {
    const s=adbDevReviewTables_(policy.databaseId,['Environment',C.STATE,C.EVENTS],'DATABASE'),t=s.tables;
    R(adbPublisherCanonical_(t[C.STATE].headers)===adbPublisherCanonical_(ADB_DEV_MONITOR.STATE_HEADERS) &&
      adbPublisherCanonical_(t[C.EVENTS].headers)===adbPublisherCanonical_(ADB_DEV_MONITOR.EVENT_HEADERS),'publisher monitor schema drift');
    R(t[C.STATE].rows.length<=1,'duplicate publisher checkpoint');
    return {tables:t,snapshot:{stateJson:t[C.STATE].rows.length?t[C.STATE].rows[0]['State JSON']:'',
      events:t[C.EVENTS].rows.map(r=>ADB_DEV_MONITOR.EVENT_HEADERS.map(h=>r[h]))}};
  }
  return {
    refresh:function(){cached=null;},
    read:function(){if(!cached)cached=fresh();return cached.snapshot;},
    atomicWrite:function(json,row){
      const previous=cached||fresh(),current=fresh();
      R(adbPublisherCanonical_(current.snapshot)===adbPublisherCanonical_(previous.snapshot),'monitor changed during validation');
      const t=current.tables;
      R(t[C.EVENTS].rows.length+1<ADB_DEV_REVIEW_HOST.MAX_ROWS,'monitor journal row limit');
      const request={requests:[
        {updateCells:{range:{sheetId:t[C.STATE].sheetId,startRowIndex:1,endRowIndex:2,startColumnIndex:0,endColumnIndex:1},rows:[{values:[{userEnteredValue:{stringValue:json}}]}],fields:'userEnteredValue'}},
        {appendCells:{sheetId:t[C.EVENTS].sheetId,rows:[{values:row.map(v=>({userEnteredValue:{stringValue:v}}))}],fields:'userEnteredValue'}}
      ]};
      R(Utilities.newBlob(JSON.stringify(request)).getBytes().length<ADB_PUBLISHER.MAX_BYTES,'monitor request too large');
      cached=null;Sheets.Spreadsheets.batchUpdate(request,policy.databaseId);
    }
  };
}

/** Run from the Apps Script editor as a separate, explicit operator action.
 * The target tuple/date are fixed above; no caller can supply a destination.
 * A retry reconciles the same edition and monitor event IDs, without requeueing.
 */
function runDevReviewedPublicationV1() {
  const R=adbDevHandoffRequire_,C=ADB_DEV_SEALED_PUBLICATION;
  R(arguments.length===0,'publication takes no client arguments');
  const policy=adbDevReviewPolicy_();adbDevReviewIdentity_(policy);
  R(policy.databaseId===C.DATABASE && policy.draftId===C.DRAFT && policy.sealedId===C.SEALED,'fixed November 6 DEV targets required');
  R(Utilities.formatDate(new Date(),'America/Chicago','yyyy-MM-dd')===C.EDITION,'dated DEV publication expired; prepare a new reviewed fixture');
  const io=adbDevReviewIo_(policy);
  // Validate policy before any file access. All IO below joins one ScriptLock.
  adbCreateDevReviewedHandoffV1(policy,io,adbPublisherDigest_);
  return io.withLock(function(){
    adbDevReviewIdentity_(policy);
    const first=adbDevSealedPublicationPhase_(policy,io),context={packageId:C.PACKAGE,pkg:first.ready.package,
      editionDate:C.EDITION,runId:C.EDITION+'-publisher-v1',digest:first.ready.digest};
    adbDevSealedMonitorProvision_(policy);
    const monitorIo=adbDevSealedMonitorIo_(policy);
    function emit(c,id,type,stage,ledger) {
      monitorIo.refresh();const s=adbDevMonitorSnapshotV1(monitorIo.read(),adbPublisherDigest_);
      const event={id:id,type:type,at:new Date().toISOString(),editionDate:c.editionDate,runId:c.runId,digest:c.digest,stage:stage};
      if(ledger)event.ledger=ledger;
      if(Object.prototype.hasOwnProperty.call(s.events,id)) {
        event.at=JSON.parse(s.events[id]).at;
        R(adbPublisherCanonical_(event)===s.events[id],'attempt ID reused with changed outcome');
      }
      return adbDevPersistMonitorEventV1(monitorIo,event,adbPublisherDigest_);
    }
    function publish() {
      const fresh=adbDevSealedPublicationPhase_(policy,io);
      R(adbPublisherCanonical_(fresh.ready)===adbPublisherCanonical_(first.ready),'sealed review changed before commit');
      R(adbPublisherCanonical_({state:fresh.input.state,history:fresh.input.history,ids:fresh.input.tableIds})===
        adbPublisherCanonical_({state:first.input.state,history:first.input.history,ids:first.input.tableIds}),'database changed before commit');
      const plan=fresh.plan;
      if(plan.result==='ALREADY_COMMITTED')return {result:'ALREADY_COMMITTED',runId:context.runId};
      adbDevReviewIdentity_(policy);
      function append(name,headers,rows) {
        R(fresh.input.state[name==='Outbound Messages'?'queue':name==='Briefing History'?'history':'ledger'].length+rows.length<ADB_DEV_REVIEW_HOST.MAX_ROWS,'publication table row limit');
        return {appendCells:{sheetId:fresh.input.tableIds[name],rows:rows.map(row=>({values:headers.map(h=>{
          const value=row[h];R(typeof value==='number'||typeof value==='string','invalid publication cell');
          R(String(value).length<ADB_DEV_REVIEW_HOST.MAX_CELL,'publication cell too large');
          return {userEnteredValue:typeof value==='number'?{numberValue:value}:{stringValue:value}};
        })})),fields:'userEnteredValue'}};
      }
      const request={requests:[append('Outbound Messages',ADB_PUBLISHER.QUEUE,plan.queue),
        append('Briefing History',ADB_PUBLISHER.HISTORY,plan.history),append('Publisher Ledger',ADB_PUBLISHER.LEDGER,[plan.ledger])]};
      R(Utilities.newBlob(JSON.stringify(request)).getBytes().length<ADB_PUBLISHER.MAX_BYTES,'atomic publication request too large');
      Sheets.Spreadsheets.batchUpdate(request,policy.databaseId);
      return {result:'COMMITTED',runId:context.runId};
    }
    function verify() {
      const saved=adbDevSealedPublicationPhase_(policy,io);
      R(saved.plan.result==='ALREADY_COMMITTED' && saved.ready.digest===context.digest &&
        adbPublisherCanonical_(saved.ready.review)===adbPublisherCanonical_(first.ready.review),'independent publication readback failed');
      const rows=saved.input.state.ledger.filter(r=>r['Edition Key']==='daily:'+C.EDITION);R(rows.length===1,'ledger not unique');
      const ledger=Object.assign({},rows[0],{'Profile Count':Number(rows[0]['Profile Count']),'History Count':Number(rows[0]['History Count'])});
      R(ledger['Profile Count']===context.pkg.expected_profile_count && ledger['History Count']===saved.input.state.history.filter(r=>r['Run ID']===context.runId).length,'ledger count mismatch');
      return ledger;
    }
    const result=adbRunDevMonitoredPublicationV1({emit:emit,publish:publish,verify:verify},context,'reviewed-'+C.EDITION);
    const report=Object.assign({build:'ADB-DEV-SEALED-PUBLICATION-0.1',packageId:C.PACKAGE,digest:context.digest,
      productionWrites:false,alertsSent:0,realPermissionsVerified:false},result);
    Logger.log(JSON.stringify(report));return report;
  });
}
