/** Runner source for generated isolated E2E bundle, not a standalone install. */
let adbE2eSnapshot_=null,adbE2eMetadataCache_=null;
const ADB_E2E_TABLES=['Environment','Subscribers','Profiles','Preferences','Message Templates',
  'Outbound Messages','Briefing History','Publisher Ledger','Packages','Package Chunks'];

function adbE2eMetadata_(refresh) {
  if(refresh || !adbE2eMetadataCache_) adbE2eMetadataCache_=Sheets.Spreadsheets.get(
    '1XZCcNUCSkCU68HY9DMgjbyKgQRXDGkVjf0Q3uz1QXrY',{fields:'sheets(properties(sheetId,title))'});
  return adbE2eMetadataCache_;
}

/** One metadata read + one batched values read per validation phase. The core
 * state reader refreshes this before initial validation, pre-commit comparison
 * and post-commit readback. Manifest/chunks share that same phase snapshot.
 */
function adbE2eRefreshSnapshot_() {
  const metadata=adbE2eMetadata_(true),id='1XZCcNUCSkCU68HY9DMgjbyKgQRXDGkVjf0Q3uz1QXrY';
  const ranges=ADB_E2E_TABLES.map(name=>"'"+name+"'!A:Z");
  const result=Sheets.Spreadsheets.Values.batchGet(id,{ranges:ranges,valueRenderOption:'FORMATTED_VALUE'});
  adbDevWorkflowRequire_(result.valueRanges && result.valueRanges.length===ranges.length,'incomplete E2E snapshot');
  adbE2eSnapshot_={metadata:metadata,values:Object.fromEntries(ADB_E2E_TABLES.map((n,i)=>[n,result.valueRanges[i].values||[]]))};
}

function adbE2eReadTable_(book,name) {
  const id='1XZCcNUCSkCU68HY9DMgjbyKgQRXDGkVjf0Q3uz1QXrY';
  adbDevWorkflowRequire_(book && book.getId()===id,'isolated E2E table reader only');
  if(!adbE2eSnapshot_)adbE2eRefreshSnapshot_();
  const matches=adbE2eSnapshot_.metadata.sheets.filter(s=>s.properties.title===name);
  adbDevWorkflowRequire_(matches.length===1,'missing/ambiguous E2E sheet');
  const values=adbE2eSnapshot_.values[name],headers=values && values[0];
  adbDevWorkflowRequire_(Array.isArray(headers),'missing E2E header');
  return {sheetId:matches[0].properties.sheetId,headers:headers,
    rows:values.slice(1).filter(r=>r.some(v=>v!=='')).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]||''])))};
}

/** Reads are reused only within one locked event operation. Every new emit
 * explicitly refreshes; a successful write invalidates the readback cache.
 */
function adbE2eMonitorIo_() {
  const id='1XZCcNUCSkCU68HY9DMgjbyKgQRXDGkVjf0Q3uz1QXrY';
  let cached=null;
  const properties=adbE2eMetadata_(true).sheets.map(s=>s.properties);
  const state=properties.filter(s=>s.title==='DEV Publisher State'),events=properties.filter(s=>s.title==='DEV Publisher Events');
  adbDevWorkflowRequire_(state.length===1 && events.length===1,'unique E2E monitor tabs required');
  return {refresh:function(){cached=null;},read:function(){
    if(!cached){
      const ranges=Sheets.Spreadsheets.Values.batchGet(id,{ranges:["'DEV Publisher State'!A:A","'DEV Publisher Events'!A:D"],valueRenderOption:'FORMATTED_VALUE'}).valueRanges;
      adbDevWorkflowRequire_(ranges && ranges.length===2,'incomplete E2E monitor ranges');
      const a=ranges[0].values||[],b=ranges[1].values||[];
      adbDevWorkflowRequire_(adbPublisherCanonical_(a[0])===adbPublisherCanonical_(ADB_DEV_MONITOR.STATE_HEADERS) &&
        adbPublisherCanonical_(b[0])===adbPublisherCanonical_(ADB_DEV_MONITOR.EVENT_HEADERS) && a.length<=2,'E2E monitor schema/checkpoint drift');
      cached={stateJson:a.length===2?a[1][0]:'',events:b.slice(1)};
    }
    return JSON.parse(JSON.stringify(cached));
  },atomicWrite:function(json,row){
    // Invalidate before submission too: a lost write response must not retain
    // pre-write cached data when the caller retries the same operation.
    cached=null;
    Sheets.Spreadsheets.batchUpdate({requests:[
      {updateCells:{range:{sheetId:state[0].sheetId,startRowIndex:1,endRowIndex:2,startColumnIndex:0,endColumnIndex:1},rows:[{values:[{userEnteredValue:{stringValue:json}}]}],fields:'userEnteredValue'}},
      {appendCells:{sheetId:events[0].sheetId,rows:[{values:row.map(v=>({userEnteredValue:{stringValue:v}}))}],fields:'userEnteredValue'}}
    ]},id);
  }};
}

function adbE2eVerifyPublication_(context) {
  return adbDevIntegrationLock_(function(){
    const state=adbPublisherState_(adbDevMonitorOpen_());
    const result=adbPlanEditorialPublication(context.pkg,state,{iso:new Date().toISOString(),
      editionDate:Utilities.formatDate(new Date(),'America/Chicago','yyyy-MM-dd')},adbPublisherDigest_);
    adbDevWorkflowRequire_(result.result==='ALREADY_COMMITTED' && result.digest===context.digest,'E2E target readback not committed');
    const rows=state.ledger.filter(r=>r['Edition Key']==='daily:'+context.editionDate);
    adbDevWorkflowRequire_(rows.length===1,'E2E target ledger not unique');
    const ledger=Object.assign({},rows[0],{'Profile Count':Number(rows[0]['Profile Count']),'History Count':Number(rows[0]['History Count'])});
    adbDevWorkflowRequire_(ledger['Profile Count']===context.pkg.expected_profile_count &&
      ledger['History Count']===state.history.filter(r=>r['Run ID']===context.runId).length,'E2E ledger count mismatch');
    return ledger;
  });
}

function runPublisherDevEndToEndQaV1() {
  const R=adbDevWorkflowRequire_,id='1XZCcNUCSkCU68HY9DMgjbyKgQRXDGkVjf0Q3uz1QXrY';
  const revision='a1fe5514f362719c0e379ccb2276d7df3492737a';
  const active=SpreadsheetApp.getActiveSpreadsheet();
  R(active && active.getId()===id && ADB_DEV_MONITOR.DATABASE===id,'use only the project bound to the isolated E2E workbook');
  R(typeof dispatchQueuedDailyBriefingsViaResendV1==='undefined','dispatcher project forbidden');
  R(ScriptApp.getProjectTriggers().length===0,'E2E project must have no triggers');
  R(typeof Sheets!=='undefined' && Sheets.Spreadsheets,'Advanced Sheets service required');
  adbE2eSnapshot_=null;adbE2eMetadataCache_=null;
  const props=PropertiesService.getScriptProperties();
  const priorId=props.getProperty(ADB_PUBLISHER.DEV_ID_PROPERTY),priorRevision=props.getProperty(ADB_PUBLISHER.REVISION_PROPERTY);
  R((priorId===null || priorId===id) && (priorRevision===null || priorRevision===revision),'existing project configuration must not be overwritten');
  const book=SpreadsheetApp.openById(id),env=adbPublisherTable_(book,'Environment').rows;
  const setting=key=>{const rows=env.filter(r=>r.Setting===key);R(rows.length===1,'unique E2E environment required');return rows[0].Value;};
  R(setting('Environment')==='DEVELOPMENT' && setting('Allow External Delivery')==='FALSE' &&
    setting('Production Writes')==='FORBIDDEN' && setting('QA Purpose')==='ISOLATED_E2E','E2E environment gate');
  R(Utilities.formatDate(new Date(),'America/Chicago','yyyy-MM-dd')==='2026-10-28','dated fixture expired; prepare a new isolated fixture');
  const subscribers=adbPublisherTable_(book,'Subscribers').rows;
  R(subscribers.length===1 && subscribers[0]['Profile ID']==='SYNTHETIC' &&
    subscribers[0].Email==='publisher-qa@example.invalid','synthetic-only audience required');
  const initial=adbPublisherTable_(book,'Outbound Messages').rows.length;
  R(initial===0 || initial===1,'unexpected initial queue');
  if(priorId===null || priorRevision===null)props.setProperties({
    ADB_PUBLISHER_DEV_DATABASE_ID:id,ADB_PUBLISHER_SOURCE_REVISION:revision},false);
  const context=adbDevIntegrationLock_(function(){
    const c=adbDevIntegrationContext_('E2E-2026-10-28');
    adbDevMonitorProvision_(adbDevMonitorOpen_(),'publisher');return c;
  });
  const io=adbE2eMonitorIo_(),outcomes=[];let injected=false;
  const deps={publish:function(packageId){const result=publishReadyEditorialPackageDevV1(packageId);outcomes.push(result.result);return result;},
    verify:adbE2eVerifyPublication_,emit:function(c,eventId,type,stage,ledger){
      io.refresh();
      const result=adbDevIntegrationEmit_(io,c,eventId,type,stage,ledger);
      if(type==='COMMIT_VERIFIED' && result.wrote && !injected){injected=true;throw Error('DEV_E2E_MONITOR_RESPONSE_LOST');}
      return result;
    }};
  try {adbRunDevMonitoredPublicationV1(deps,context,'E2E-20261028');}
  catch(error){if(error.message!=='DEV_E2E_MONITOR_RESPONSE_LOST')throw error;}
  const before=adbE2eVerifyPublication_(context);
  const replay=adbRunDevMonitoredPublicationV1(deps,context,'E2E-20261028');
  const after=adbE2eVerifyPublication_(context);io.refresh();const snapshot=io.read();
  const monitor=adbDevMonitorSnapshotV1(snapshot,adbPublisherDigest_);
  R(replay.publication==='ALREADY_COMMITTED' && replay.monitoring==='REPLAY','replay not reconciled');
  R(adbPublisherCanonical_(before)===adbPublisherCanonical_(after),'target ledger changed on replay');
  const b=adbDevMonitorOpen_();
  const counts=['Outbound Messages','Briefing History','Publisher Ledger'].map(n=>adbPublisherTable_(b,n).rows.length);
  R(adbPublisherCanonical_(counts)==='[1,6,1]' && snapshot.events.length===2 && monitor.status==='Healthy' &&
    !monitor.incident && snapshot.events.every(r=>r[3]==='null'),'unexpected E2E target/monitor results');
  if(initial===0)R(injected && outcomes[0]==='COMMITTED','fresh test did not commit');
  Logger.log(JSON.stringify({result:'PASS',build:'ADB-PUBLISHER-E2E-DEV-0.2',
    scope:'isolated synthetic E2E workbook only',publicationResults:outcomes,
    queueRows:1,historyRows:6,ledgerRows:1,monitorEvents:2,monitorStatus:monitor.status,
    lostMonitorResponseInjected:injected,exactReplay:true,productionWrites:false,emails:false,
    alertsSent:0,realPermissionsVerified:false}));
}
