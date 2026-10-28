/** Runner source for generated isolated E2E bundle, not a standalone install. */
function adbE2eReadTable_(book,name) {
  const id='1XZCcNUCSkCU68HY9DMgjbyKgQRXDGkVjf0Q3uz1QXrY';
  adbDevWorkflowRequire_(book && book.getId()===id,'isolated E2E table reader only');
  const metadata=Sheets.Spreadsheets.get(id,{fields:'sheets(properties(sheetId,title))'});
  const matches=metadata.sheets.filter(s=>s.properties.title===name);
  adbDevWorkflowRequire_(matches.length===1,'missing/ambiguous E2E sheet');
  const result=Sheets.Spreadsheets.Values.batchGet(id,{
    ranges:["'"+name.replace(/'/g,"''")+"'!A:Z"],valueRenderOption:'FORMATTED_VALUE'});
  const values=result.valueRanges[0].values||[],headers=values[0];
  adbDevWorkflowRequire_(Array.isArray(headers),'missing E2E header');
  return {sheetId:matches[0].properties.sheetId,headers:headers,
    rows:values.slice(1).filter(r=>r.some(v=>v!=='')).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]||''])))};
}

function runPublisherDevEndToEndQaV1() {
  const R=adbDevWorkflowRequire_,id='1XZCcNUCSkCU68HY9DMgjbyKgQRXDGkVjf0Q3uz1QXrY';
  const revision='a1fe5514f362719c0e379ccb2276d7df3492737a';
  const active=SpreadsheetApp.getActiveSpreadsheet();
  R(active && active.getId()===id && ADB_DEV_MONITOR.DATABASE===id,'use only the project bound to the isolated E2E workbook');
  R(typeof dispatchQueuedDailyBriefingsViaResendV1==='undefined','dispatcher project forbidden');
  R(ScriptApp.getProjectTriggers().length===0,'E2E project must have no triggers');
  R(typeof Sheets!=='undefined' && Sheets.Spreadsheets,'Advanced Sheets service required');
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
  const io=adbDevMonitorIo_('publisher'),outcomes=[];let injected=false;
  const deps={publish:function(packageId){const result=publishReadyEditorialPackageDevV1(packageId);outcomes.push(result.result);return result;},
    verify:adbDevIntegrationVerify_,emit:function(c,eventId,type,stage,ledger){
      const result=adbDevIntegrationEmit_(io,c,eventId,type,stage,ledger);
      if(type==='COMMIT_VERIFIED' && result.wrote && !injected){injected=true;throw Error('DEV_E2E_MONITOR_RESPONSE_LOST');}
      return result;
    }};
  try {adbRunDevMonitoredPublicationV1(deps,context,'E2E-20261028');}
  catch(error){if(error.message!=='DEV_E2E_MONITOR_RESPONSE_LOST')throw error;}
  const before=adbDevIntegrationVerify_(context);
  const replay=adbRunDevMonitoredPublicationV1(deps,context,'E2E-20261028');
  const after=adbDevIntegrationVerify_(context),snapshot=io.read();
  const monitor=adbDevMonitorSnapshotV1(snapshot,adbPublisherDigest_);
  R(replay.publication==='ALREADY_COMMITTED' && replay.monitoring==='REPLAY','replay not reconciled');
  R(adbPublisherCanonical_(before)===adbPublisherCanonical_(after),'target ledger changed on replay');
  const b=adbDevMonitorOpen_();
  const counts=['Outbound Messages','Briefing History','Publisher Ledger'].map(n=>adbPublisherTable_(b,n).rows.length);
  R(adbPublisherCanonical_(counts)==='[1,6,1]' && snapshot.events.length===2 && monitor.status==='Healthy' &&
    !monitor.incident && snapshot.events.every(r=>r[3]==='null'),'unexpected E2E target/monitor results');
  if(initial===0)R(injected && outcomes[0]==='COMMITTED','fresh test did not commit');
  Logger.log(JSON.stringify({result:'PASS',build:'ADB-PUBLISHER-E2E-DEV-0.1',
    scope:'isolated synthetic E2E workbook only',publicationResults:outcomes,
    queueRows:1,historyRows:6,ledgerRows:1,monitorEvents:2,monitorStatus:monitor.status,
    lostMonitorResponseInjected:injected,exactReplay:true,productionWrites:false,emails:false,
    alertsSent:0,realPermissionsVerified:false}));
}
