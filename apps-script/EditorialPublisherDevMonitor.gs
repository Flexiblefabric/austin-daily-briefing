/** ADB-PUBLISHER-DEV-MONITOR-0.3. DEV monitoring persistence only.
 * Writes only a fixed pair of QA or publisher monitor tabs in the sandbox. No transport,
 * alert delivery, production entry point, trigger or property mutation.
 * Requires EditorialPublisher.gs and EditorialPublisherDevWorkflow.gs.
 */
const ADB_DEV_MONITOR = Object.freeze({
  DATABASE:'1I9UAR6kabPt0P_lvDiJX_oskPeCVcVI64_vTbwEOF2I',
  STATE:'DEV Monitor State',EVENTS:'DEV Monitor Events',
  STATE_HEADERS:['State JSON'],
  EVENT_HEADERS:['Event ID','Event JSON','State SHA-256','Alert Intent JSON'],
  MAX_CELL:40000
});

/** Fixed namespaces isolate synthetic QA from actual DEV publisher attempts. */
function adbDevMonitorConfig_(purpose) {
  adbDevWorkflowRequire_(purpose===undefined || purpose==='publisher','unknown monitor namespace');
  return purpose==='publisher'?Object.assign({},ADB_DEV_MONITOR,{
    STATE:'DEV Publisher State',EVENTS:'DEV Publisher Events'}):ADB_DEV_MONITOR;
}

/** Validate the persisted checkpoint against its atomic event journal. */
function adbDevMonitorSnapshotV1(snapshot,sha256) {
  const R=adbDevWorkflowRequire_,C=ADB_DEV_MONITOR;
  R(snapshot && typeof snapshot.stateJson==='string' && Array.isArray(snapshot.events),'invalid monitor snapshot');
  if(!snapshot.stateJson) {
    R(snapshot.events.length===0,'journal exists without checkpoint');
    return adbDevMonitorInitialV1();
  }
  R(snapshot.stateJson.length<C.MAX_CELL,'checkpoint size limit');
  const state=JSON.parse(snapshot.stateJson),seen=new Set();
  R(state && state.events && !Array.isArray(state.events),'invalid checkpoint');
  snapshot.events.forEach(row=>{
    R(Array.isArray(row) && row.length===4 && typeof row[0]==='string' &&
      !seen.has(row[0]) && Object.prototype.hasOwnProperty.call(state.events,row[0]) &&
      row[1]===state.events[row[0]],'journal/checkpoint mismatch');
    const e=JSON.parse(row[1]);R(e.id===row[0],'journal event ID mismatch');
    seen.add(row[0]);
  });
  R(seen.size===Object.keys(state.events).length && seen.size>0,'checkpoint event missing from journal');
  // Replay the complete small QA journal to verify every state hash and alert
  // intent, not just its last row. No production retention policy is implied.
  let replay=adbDevMonitorInitialV1();
  snapshot.events.forEach(row=>{
    const transition=adbDevReduceMonitorV1(replay,JSON.parse(row[1]));replay=transition.state;
    R(sha256(adbPublisherCanonical_(replay))===row[2] &&
      adbPublisherCanonical_(transition.alertIntent)===row[3],'journal state/intent changed');
  });
  R(adbPublisherCanonical_(replay)===adbPublisherCanonical_(state),'checkpoint/journal replay differs');
  return state;
}

/** IO boundary: read() and atomicWrite(stateJson,eventRow) are supplied by DEV.
 * A timeout may occur after atomicWrite committed. Retrying the identical event
 * reconciles the checkpoint/journal and never appends another event.
 */
function adbDevPersistMonitorEventV1(io,event,sha256) {
  const C=ADB_DEV_MONITOR,R=adbDevWorkflowRequire_;
  const state=adbDevMonitorSnapshotV1(io.read(),sha256);
  const transition=adbDevReduceMonitorV1(state,event);
  if(transition.result==='REPLAY') return {result:'REPLAY',state:state,alertIntent:null,wrote:false};
  const json=adbPublisherCanonical_(transition.state);
  const row=[event.id,adbPublisherCanonical_(event),sha256(json),adbPublisherCanonical_(transition.alertIntent)];
  R(json.length<C.MAX_CELL && row.every(v=>typeof v==='string' && v.length<C.MAX_CELL),'monitor cell size limit; no pruning or partial write');
  io.atomicWrite(json,row);
  const verified=adbDevMonitorSnapshotV1(io.read(),sha256);
  R(adbPublisherCanonical_(verified)===json,'monitor readback mismatch');
  return {result:transition.result,state:verified,alertIntent:transition.alertIntent,wrote:true};
}

function adbDevMonitorOpen_() {
  const R=adbDevWorkflowRequire_,C=ADB_DEV_MONITOR;
  const id=PropertiesService.getScriptProperties().getProperty('ADB_PUBLISHER_DEV_DATABASE_ID');
  R(id===C.DATABASE,'fixed publisher DEV sandbox required');
  const book=SpreadsheetApp.openById(id);
  const environment=adbPublisherTable_(book,'Environment').rows;
  const readSetting=key=>{const found=environment.filter(r=>r.Setting===key);R(found.length===1,'ambiguous environment');return found[0].Value;};
  R(readSetting('Environment')==='DEVELOPMENT' && readSetting('Allow External Delivery')==='FALSE','DEV environment/delivery gate');
  return book;
}

/** Atomic provisioning of only the two QA tabs; existing tabs are never reset. */
function adbDevMonitorProvision_(book,purpose) {
  const R=adbDevWorkflowRequire_,C=adbDevMonitorConfig_(purpose);
  const metadata=Sheets.Spreadsheets.get(C.DATABASE,{fields:'sheets(properties(sheetId,title))'});
  const properties=metadata.sheets.map(s=>s.properties);
  const state=properties.find(s=>s.title===C.STATE),events=properties.find(s=>s.title===C.EVENTS);
  R(Boolean(state)===Boolean(events),'partial monitor provisioning requires inspection');
  if(state) return false;
  const ids=new Set(properties.map(s=>s.sheetId));
  let stateId=190028001;while(ids.has(stateId))stateId++;
  let eventId=stateId+1;while(ids.has(eventId))eventId++;
  const headers=(sheetId,values)=>({updateCells:{range:{sheetId:sheetId,startRowIndex:0,endRowIndex:1,startColumnIndex:0,endColumnIndex:values.length},rows:[{values:values.map(v=>({userEnteredValue:{stringValue:v}}))}],fields:'userEnteredValue'}});
  Sheets.Spreadsheets.batchUpdate({requests:[
    {addSheet:{properties:{sheetId:stateId,title:C.STATE,gridProperties:{rowCount:10,columnCount:1,frozenRowCount:1}}}},
    {addSheet:{properties:{sheetId:eventId,title:C.EVENTS,gridProperties:{rowCount:1000,columnCount:4,frozenRowCount:1}}}},
    headers(stateId,C.STATE_HEADERS),headers(eventId,C.EVENT_HEADERS)
  ]},C.DATABASE);
  return true;
}

function adbDevMonitorIo_(purpose) {
  const C=adbDevMonitorConfig_(purpose),R=adbDevWorkflowRequire_;
  function table(properties,name,headers,values) {
    const sheet=properties.find(s=>s.title===name);R(sheet,'missing monitor tab');
    R(adbPublisherCanonical_(values[0])===adbPublisherCanonical_(headers),'monitor schema drift');
    return {sheetId:sheet.sheetId,rows:values.slice(1).filter(r=>r.some(v=>v!==''))};
  }
  function readTables(){
    adbDevMonitorOpen_();
    // Use the same API for writes and subsequent metadata/value reads. The
    // SpreadsheetApp object can retain metadata from before addSheet completed.
    const properties=Sheets.Spreadsheets.get(C.DATABASE,{fields:'sheets(properties(sheetId,title))'}).sheets.map(s=>s.properties);
    const result=Sheets.Spreadsheets.Values.batchGet(C.DATABASE,{
      ranges:["'"+C.STATE+"'!A:A","'"+C.EVENTS+"'!A:D"],valueRenderOption:'FORMATTED_VALUE'});
    R(result.valueRanges && result.valueRanges.length===2,'missing monitor ranges');
    return {state:table(properties,C.STATE,C.STATE_HEADERS,result.valueRanges[0].values||[]),
      events:table(properties,C.EVENTS,C.EVENT_HEADERS,result.valueRanges[1].values||[])};
  }
  return {
    read:function(){const t=readTables();R(t.state.rows.length<=1,'duplicate monitor checkpoint');
      return {stateJson:t.state.rows.length?t.state.rows[0][0]:'',events:t.events.rows};},
    atomicWrite:function(json,row){
      const t=readTables();
      Sheets.Spreadsheets.batchUpdate({requests:[
        {updateCells:{range:{sheetId:t.state.sheetId,startRowIndex:1,endRowIndex:2,startColumnIndex:0,endColumnIndex:1},rows:[{values:[{userEnteredValue:{stringValue:json}}]}],fields:'userEnteredValue'}},
        {appendCells:{sheetId:t.events.sheetId,rows:[{values:row.map(v=>({userEnteredValue:{stringValue:v}}))}],fields:'userEnteredValue'}}
      ]},C.DATABASE);
    }
  };
}

/** Manual synthetic QA: fixed events make repeat runs idempotent. This creates
 * and writes DEV Monitor State/Events only. Existing queue/history/ledger are
 * read for before/after comparison, never used as synthetic commit evidence.
 */
function runPublisherDevMonitorPersistenceQaV1() {
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try {
    const R=adbDevWorkflowRequire_,sha=adbPublisherDigest_,book=adbDevMonitorOpen_();
    const target=()=>{
      const b=adbDevMonitorOpen_();return adbPublisherCanonical_(['Outbound Messages','Briefing History','Publisher Ledger'].map(n=>adbPublisherTable_(b,n).rows));
    };
    const before=target();let persistedBatches=adbDevMonitorProvision_(book)?1:0;
    const baseIo=adbDevMonitorIo_();
    const io={read:baseIo.read,atomicWrite:function(json,row){baseIo.atomicWrite(json,row);persistedBatches++;}};
    const digest=sha('DEV-MONITOR-SYNTHETIC-NOT-A-PUBLICATION');
    const base={editionDate:'2026-10-28',runId:'2026-10-28-publisher-v1',digest:digest,stage:'validation'};
    const e=(id,type,sec,extra)=>Object.assign({},base,{id:id,type:type,at:'2026-10-28T20:00:'+sec+'.000Z'},extra||{});
    const events=[e('qa-start','ATTEMPT','00'),e('qa-failure','FAILURE','01'),e('qa-repeat-failure','FAILURE','02')];
    events.forEach(event=>adbDevPersistMonitorEventV1(io,event,sha));
    const ledger={'Edition Key':'daily:2026-10-28','Run ID':base.runId,'Package SHA-256':digest,
      'Profile Count':1,'History Count':6,'Committed At':'2026-10-28T20:00:03.000Z'};
    const done=e('qa-verified-synthetic','COMMIT_VERIFIED','04',{stage:'readback',ledger:ledger});
    let injected=false;
    try {
      adbDevPersistMonitorEventV1({read:io.read,atomicWrite:function(json,row){
        io.atomicWrite(json,row);injected=true;throw new Error('DEV_QA_LOST_RESPONSE');
      }},done,sha);
    } catch(error) {if(error.message!=='DEV_QA_LOST_RESPONSE')throw error;}
    const retry=adbDevPersistMonitorEventV1(io,done,sha);
    R(retry.result==='REPLAY' && !retry.wrote && !retry.alertIntent,'lost response replay');
    const failed=e('qa-monitoring-failure','FAILURE','05',{stage:'monitoring'});
    adbDevPersistMonitorEventV1(io,failed,sha);
    const recovered=e('qa-monitoring-recovery','COMMIT_VERIFIED','06',{stage:'readback',ledger:ledger});
    adbDevPersistMonitorEventV1(io,recovered,sha);
    const snapshot=io.read(),state=adbDevMonitorSnapshotV1(snapshot,sha);
    R(state.status==='Healthy' && state.lastSuccess===ledger['Committed At'] && !state.incident,'persisted recovery');
    R(snapshot.events.length===6 && snapshot.events.filter(r=>r[3]!=='null').length===1,'duplicate journal/intent');
    R(before===target(),'existing target changed during QA; inspect concurrent activity');
    Logger.log(JSON.stringify({result:'PASS',build:'ADB-PUBLISHER-DEV-MONITOR-0.3',
      scope:'synthetic DEV monitor tabs only',writes:persistedBatches>0,devBatches:persistedBatches,productionWrites:false,emails:false,
      persistedEvents:6,persistedFailureAlertIntents:1,alertsSent:0,
      lostResponseInjected:injected,exactReplay:true,silentRecovery:true,
      targetRowsUnchanged:true,realPermissionsVerified:false}));
  } finally {lock.releaseLock();}
}
