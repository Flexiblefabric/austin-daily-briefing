/** ADB-PUBLISHER-DEV-WORKFLOW-0.1. Pure DEV staging/monitoring prototype.
 * No workbook access, transport, property changes or trigger installation.
 * This models lifecycle rules; it does not enforce Google file permissions.
 * Requires EditorialPublisher.gs for canonical JSON and digest helpers.
 */
function adbDevWorkflowRequire_(ok,message) {
  if (!ok) throw new Error('DEV workflow: '+message);
}

/** Drafting produces an unsealed copy, never READY. */
function adbDevDraftPackageV1(packageId,pkg) {
  adbDevWorkflowRequire_(typeof packageId==='string' && /^[A-Za-z0-9_-]{1,100}$/.test(packageId),'invalid package ID');
  adbDevWorkflowRequire_(pkg && typeof pkg==='object' && !Array.isArray(pkg),'package object required');
  const raw=adbPublisherCanonical_(pkg),chunks=[];
  for(let offset=0;offset<raw.length;offset+=39000) {
    chunks.push({'Package ID':packageId,Sequence:chunks.length+1,JSON:raw.slice(offset,offset+39000)});
  }
  return {manifest:{'Package ID':packageId,State:'DRAFT','Chunk Count':chunks.length,'Package SHA-256':''},chunks:chunks};
}

function adbDevDecodeStage_(stage,expectedState) {
  const R=adbDevWorkflowRequire_,m=stage && stage.manifest;
  R(m && m.State===expectedState,'unexpected staging state');
  R(typeof m['Package ID']==='string' && /^[A-Za-z0-9_-]{1,100}$/.test(m['Package ID']),'invalid package ID');
  R(Array.isArray(stage.chunks) && Number.isInteger(m['Chunk Count']) && m['Chunk Count']>0 &&
    stage.chunks.length===m['Chunk Count'],'missing or duplicate chunks');
  const chunks=stage.chunks.slice().sort((a,b)=>a.Sequence-b.Sequence);
  R(chunks.every((c,i)=>c['Package ID']===m['Package ID'] && c.Sequence===i+1 &&
    typeof c.JSON==='string' && c.JSON.length>0 && c.JSON.length<40000),'invalid chunk identity/order/size');
  return JSON.parse(chunks.map(c=>c.JSON).join(''));
}

/** Operator step in the model. A distinct real access boundary is still required. */
function adbDevSealDraftV1(stage,sha256) {
  const pkg=adbDevDecodeStage_(stage,'DRAFT');
  adbDevWorkflowRequire_(stage.manifest['Package SHA-256']==='','draft digest must be empty');
  const sealed=JSON.parse(JSON.stringify(stage));
  const digest=sha256(adbPublisherCanonical_(pkg));
  adbDevWorkflowRequire_(/^[a-f0-9]{64}$/.test(digest),'invalid digest');
  sealed.manifest.State='READY';sealed.manifest['Package SHA-256']=digest;
  return sealed;
}

function adbDevReadReadyV1(stage,sha256) {
  const pkg=adbDevDecodeStage_(stage,'READY');
  const digest=sha256(adbPublisherCanonical_(pkg));
  adbDevWorkflowRequire_(/^[a-f0-9]{64}$/.test(stage.manifest['Package SHA-256']) &&
    digest===stage.manifest['Package SHA-256'],'sealed package changed');
  return pkg;
}

function adbDevMonitorInitialV1() {
  return {status:'Idle',lastAttempt:'',lastSuccess:'',lastEventAt:'',
    activeRun:'',activeDigest:'',stage:'',incident:null,alertKeys:[],events:{},committed:{}};
}

/** Pure proposed monitoring transition; never writes status or sends an alert.
 * COMMIT_VERIFIED must be supplied only after the real writer's ledger/payload
 * readback. A caller-supplied ledger object alone is not verification evidence.
 * The prototype retains replay keys in memory; durable retention is unresolved.
 */
function adbDevReduceMonitorV1(previous,event) {
  const R=adbDevWorkflowRequire_,s=JSON.parse(JSON.stringify(previous));
  R(event && typeof event.id==='string' && /^[A-Za-z0-9_-]{1,100}$/.test(event.id),'event ID required');
  const encoded=adbPublisherCanonical_(event);
  if(Object.prototype.hasOwnProperty.call(s.events,event.id)) {
    R(s.events[event.id]===encoded,'event ID reused with different payload');
    return {state:s,result:'REPLAY',alertIntent:null};
  }
  R(['ATTEMPT','FAILURE','COMMIT_VERIFIED'].includes(event.type),'unsupported event');
  R(typeof event.at==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(event.at) &&
    Number.isFinite(Date.parse(event.at)) && new Date(event.at).toISOString()===event.at,'invalid timestamp');
  R(!s.lastEventAt || event.at>=s.lastEventAt,'out-of-order event');
  R(/^\d{4}-\d\d-\d\d$/.test(event.editionDate) &&
    new Date(event.editionDate+'T00:00:00Z').toISOString().slice(0,10)===event.editionDate &&
    event.runId===event.editionDate+'-publisher-v1' && /^[a-f0-9]{64}$/.test(event.digest),'invalid run identity');
  R(typeof event.stage==='string' && ['validation','commit','readback','monitoring'].includes(event.stage),'invalid failure stage');
  const committed=s.committed[event.runId];
  R(!committed || committed.digest===event.digest,'committed run digest conflict');
  if(s.activeRun===event.runId) R(s.activeDigest===event.digest,'active run digest changed');
  if(event.type!=='ATTEMPT') R(s.activeRun===event.runId && s.activeDigest===event.digest,'run has no active attempt');
  let alertIntent=null,result=event.type;
  if(event.type==='ATTEMPT') {
    // A committed edition is reconciled by readback, never queued again here.
    s.lastAttempt=event.at;s.activeRun=event.runId;s.activeDigest=event.digest;
    s.status='Running';s.stage=committed?'readback':event.stage;
  } else if(event.type==='FAILURE') {
    s.status='Failed';s.stage=event.stage;
    if(!s.incident) s.incident={firstFailure:event.at,runId:event.runId};
    const key='Morning Briefing:'+event.editionDate;
    if(!s.alertKeys.includes(key)) {
      s.alertKeys.push(key);
      alertIntent={key:key,component:'Morning Briefing',stage:event.stage};
    }
  } else {
    const l=event.ledger;
    R(l && l['Edition Key']==='daily:'+event.editionDate && l['Run ID']===event.runId &&
      l['Package SHA-256']===event.digest && Number.isInteger(l['Profile Count']) && l['Profile Count']>0 &&
      Number.isInteger(l['History Count']) && l['History Count']>=l['Profile Count'] &&
      typeof l['Committed At']==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(l['Committed At']) &&
      Number.isFinite(Date.parse(l['Committed At'])) && new Date(l['Committed At']).toISOString()===l['Committed At'] &&
      l['Committed At']<=event.at,'verified ledger identity/count/time mismatch');
    const record={digest:event.digest,ledger:adbPublisherCanonical_(l)};
    R(!committed || adbPublisherCanonical_(committed)===adbPublisherCanonical_(record),'verified ledger changed');
    s.committed[event.runId]=record;
    s.lastSuccess=s.lastSuccess>l['Committed At']?s.lastSuccess:l['Committed At'];
    s.status='Healthy';s.stage='complete';s.incident=null;
    result=committed?'RECONCILED':'SUCCESS';
  }
  s.events[event.id]=encoded;s.lastEventAt=event.at;
  return {state:s,result:result,alertIntent:alertIntent};
}

/** Manual QA in the existing isolated DEV project. Synthetic, memory only. */
function runPublisherDevWorkflowQaV1() {
  const R=adbDevWorkflowRequire_,sha=adbPublisherDigest_;
  const draft=adbDevDraftPackageV1('DEV-WORKFLOW-QA',{schema:'SYNTHETIC-LIFECYCLE-ONLY',text:'QA'});
  const ready=adbDevSealDraftV1(draft,sha);
  R(draft.manifest.State==='DRAFT' && ready.manifest.State==='READY','sealing mutates draft');
  R(adbDevReadReadyV1(ready,sha).text==='QA','round trip');
  const changed=JSON.parse(JSON.stringify(ready));changed.chunks[0].JSON=changed.chunks[0].JSON.replace('QA','EDITED');
  let rejected=false;try {adbDevReadReadyV1(changed,sha);}catch(e){rejected=true;}R(rejected,'tamper accepted');
  const digest=ready.manifest['Package SHA-256'];
  const base={editionDate:'2026-10-28',runId:'2026-10-28-publisher-v1',digest:digest,stage:'validation'};
  const event=(id,type,seconds,extra)=>Object.assign({},base,{id:id,type:type,at:'2026-10-28T19:00:'+seconds+'.000Z'},extra||{});
  let s=adbDevReduceMonitorV1(adbDevMonitorInitialV1(),event('start','ATTEMPT','00')).state;
  const failed=adbDevReduceMonitorV1(s,event('fail','FAILURE','01'));s=failed.state;
  R(failed.alertIntent && !s.lastSuccess,'failure advances success');
  const repeat=adbDevReduceMonitorV1(s,event('fail-again','FAILURE','02'));s=repeat.state;
  R(!repeat.alertIntent && s.incident.firstFailure==='2026-10-28T19:00:01.000Z','failure suppression/incident');
  const ledger={'Edition Key':'daily:2026-10-28','Package SHA-256':digest,'Run ID':base.runId,
    'Profile Count':1,'History Count':6,'Committed At':'2026-10-28T19:00:03.000Z'};
  const done=event('done','COMMIT_VERIFIED','04',{stage:'readback',ledger:ledger});
  const success=adbDevReduceMonitorV1(s,done);s=success.state;
  R(s.status==='Healthy' && !s.incident && !success.alertIntent,'recovery not silent');
  R(adbDevReduceMonitorV1(s,done).result==='REPLAY','exact replay');
  const telemetryFailure=adbDevReduceMonitorV1(s,event('telemetry-fail','FAILURE','05',{stage:'monitoring'}));
  const recovered=adbDevReduceMonitorV1(telemetryFailure.state,event('retry','COMMIT_VERIFIED','06',{stage:'readback',ledger:ledger}));
  R(recovered.result==='RECONCILED' && recovered.state.lastSuccess===ledger['Committed At'] && !recovered.alertIntent,'reconciliation');
  Logger.log(JSON.stringify({result:'PASS',build:'ADB-PUBLISHER-DEV-WORKFLOW-0.1',
    scope:'synthetic in-memory lifecycle only',writes:false,emails:false,
    draftReadyRoundTrip:true,tamperRejected:true,failureSuppression:true,
    earliestIncidentPreserved:true,silentRecovery:true,exactReplay:true,telemetryReconciled:true,
    realPermissionsVerified:false}));
}
