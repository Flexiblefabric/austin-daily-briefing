'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),cp=require('node:child_process');
const ctx=vm.createContext({Intl});
for(const file of ['scripts/daily_newsletter_renderer.js','apps-script/DailyNewsletterContract.gs','apps-script/SelectionEvidenceContract.gs','apps-script/EditorialPublisher.gs','apps-script/EditorialPublisherDevWorkflow.gs'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const clone=x=>JSON.parse(JSON.stringify(x)),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const digest='a'.repeat(64);
function event(id,type,second,extra={}){return {id,type,at:`2026-10-28T19:00:${second}.000Z`,editionDate:'2026-10-28',runId:'2026-10-28-publisher-v1',digest,stage:'validation',...extra};}
function reduce(s,e){return clone(ctx.adbDevReduceMonitorV1(s,e));}
function initial(){return clone(ctx.adbDevMonitorInitialV1());}
function started(){return reduce(initial(),event('start','ATTEMPT','00')).state;}
function ledger(){return {'Edition Key':'daily:2026-10-28','Run ID':'2026-10-28-publisher-v1','Package SHA-256':digest,'Profile Count':1,'History Count':6,'Committed At':'2026-10-28T19:00:02.000Z'};}
function complete(s=started()){return reduce(s,event('done','COMMIT_VERIFIED','03',{ledger:ledger(),stage:'readback'}));}

test('staging splits, reorders and round-trips Unicode without mutating caller inputs',()=>{
 const pkg={schema:'SYNTHETIC',text:'🙂'.repeat(41000)},draft=clone(ctx.adbDevDraftPackageV1('DEV',pkg));
 assert(draft.chunks.length>1);assert(draft.chunks.every(c=>c.JSON.length<40000));
 draft.chunks.reverse();const original=JSON.stringify(draft),ready=clone(ctx.adbDevSealDraftV1(draft,sha));
 assert.equal(JSON.stringify(draft),original);assert.equal(draft.manifest.State,'DRAFT');
 assert.deepEqual(clone(ctx.adbDevReadReadyV1(ready,sha)),pkg);
 pkg.text='changed';assert.notEqual(ctx.adbDevReadReadyV1(ready,sha).text,pkg.text);
});
for(const [name,mutate] of [
 ['payload',s=>s.chunks[0].JSON=s.chunks[0].JSON.replace('QA','CHANGED')],
 ['digest',s=>s.manifest['Package SHA-256']='f'.repeat(64)],
 ['missing chunk',s=>s.chunks=[]],['duplicate sequence',s=>{s.chunks.push(clone(s.chunks[0]));s.manifest['Chunk Count']=2;}],
 ['foreign package',s=>s.chunks[0]['Package ID']='OTHER'],['nonintegral sequence',s=>s.chunks[0].Sequence='1'],
 ['DRAFT state',s=>s.manifest.State='DRAFT']
])test('sealed staging rejects '+name,()=>{
 const s=clone(ctx.adbDevSealDraftV1(ctx.adbDevDraftPackageV1('DEV',{text:'QA'}),sha));mutate(s);
 assert.throws(()=>ctx.adbDevReadReadyV1(s,sha));
});
test('failure preserves earliest incident, last success and one daily alert intent; recovery is silent',()=>{
 let s=started(),r=reduce(s,event('fail','FAILURE','01'));assert(r.alertIntent);s=r.state;
 const first=s.incident.firstFailure;r=reduce(s,event('fail2','FAILURE','02'));s=r.state;
 assert.equal(r.alertIntent,null);assert.equal(s.incident.firstFailure,first);assert.equal(s.lastSuccess,'');
 r=reduce(s,event('done','COMMIT_VERIFIED','03',{ledger:ledger(),stage:'readback'}));
 assert.equal(r.state.status,'Healthy');assert.equal(r.state.incident,null);assert.equal(r.alertIntent,null);
 assert.equal(r.state.lastSuccess,ledger()['Committed At']);assert.equal(s.status,'Failed');
 const after=reduce(r.state,event('later-fail','FAILURE','04'));assert.equal(after.alertIntent,null);
 assert.equal(after.state.lastSuccess,ledger()['Committed At']);
});
test('exact event replay has no alert intent and event-ID reuse with changed payload blocks',()=>{
 const e=event('fail','FAILURE','01'),r=reduce(started(),e),again=reduce(r.state,e);
 assert.equal(again.result,'REPLAY');assert.deepEqual(again.state,r.state);assert.equal(again.alertIntent,null);
 assert.throws(()=>reduce(r.state,{...e,stage:'monitoring'}),/reused/);
});
test('commit without attempt, conflicting digest, missing ledger and reordered event fail closed',()=>{
 assert.throws(()=>complete(initial()),/active attempt/);
 assert.throws(()=>reduce(started(),event('bad','FAILURE','01',{digest:'b'.repeat(64)})),/digest changed/);
 assert.throws(()=>reduce(started(),event('bad','COMMIT_VERIFIED','03')),/ledger/);
 assert.throws(()=>reduce(complete().state,event('old','FAILURE','01')),/out-of-order/);
 for(const change of [{'Run ID':'wrong'},{'Profile Count':0},{'Package SHA-256':'b'.repeat(64)},{'Committed At':'2026-10-28T20:00:00.000Z'}]){
  assert.throws(()=>reduce(started(),event('bad','COMMIT_VERIFIED','03',{ledger:{...ledger(),...change}})),/ledger/);
 }
});
test('telemetry failure after commit reconciles with unchanged ledger and success time',()=>{
 const done=complete(),failed=reduce(done.state,event('monitor-fail','FAILURE','04',{stage:'monitoring'}));
 const retry=reduce(failed.state,event('retry','COMMIT_VERIFIED','05',{ledger:ledger(),stage:'readback'}));
 assert.equal(retry.result,'RECONCILED');assert.equal(retry.state.status,'Healthy');assert.equal(retry.alertIntent,null);
 assert.equal(retry.state.lastSuccess,done.state.lastSuccess);assert.deepEqual(retry.state.committed,done.state.committed);
 assert.throws(()=>reduce(retry.state,event('changed-ledger','COMMIT_VERIFIED','06',{ledger:{...ledger(),'History Count':7}})),/ledger changed/);
});
test('a new day preserves unresolved incident and gets one new daily failure intent',()=>{
 let s=reduce(started(),event('fail','FAILURE','01')).state;const first=s.incident.firstFailure;
 const e={id:'next-start',type:'ATTEMPT',at:'2026-10-29T13:00:00.000Z',editionDate:'2026-10-29',runId:'2026-10-29-publisher-v1',digest:'b'.repeat(64),stage:'validation'};
 s=reduce(s,e).state;const r=reduce(s,{...e,id:'next-fail',type:'FAILURE',at:'2026-10-29T13:00:01.000Z'});
 assert.equal(r.state.incident.firstFailure,first);assert.equal(r.alertIntent.key,'Morning Briefing:2026-10-29');
});
test('real pure planner and stage codec recover a lost monitoring response without replaying target rows',()=>{
 const pkg=JSON.parse(cp.execFileSync('python',['tests/publisher-fixture.py'],{encoding:'utf8'}));
 const C=vm.runInContext('ADB_PUBLISHER',ctx),ready=ctx.adbDevSealDraftV1(ctx.adbDevDraftPackageV1('DEV-INTEGRATION',pkg),sha);
 const decoded=ctx.adbDevReadReadyV1(ready,sha);
 const state={environment:'DEVELOPMENT',externalDelivery:'FALSE',sourceRevision:pkg.source_revision,queueHeaders:clone(C.QUEUE),historyHeaders:clone(C.HISTORY),ledgerHeaders:clone(C.LEDGER),queue:[],history:[],ledger:[],subscribers:[{'Profile ID':'SYNTHETIC',Email:'synthetic@example.invalid',Status:'Active','Admin Status':'OK'}],profiles:[{'Profile ID':'SYNTHETIC',Status:'Active','Primary Preference Email':'synthetic@example.invalid'}],templates:[{'Template ID':'DAILY_BRIEFING_V1',Status:'Active',Environment:'DEVELOPMENT'}],personalization:pkg.selection_bundle.profiles,publishedHistory:[],manageUrl:'https://example.org/manage'};
 const clock={iso:'2026-10-07T13:00:00.000Z',editionDate:'2026-10-07'};
 const plan=clone(ctx.adbPlanEditorialPublication(decoded,state,clock,sha));
 Object.assign(state,{queue:plan.queue,history:plan.history,ledger:[plan.ledger]});
 const targetBefore=JSON.stringify(state);
 const base={editionDate:clock.editionDate,runId:plan.runId,digest:plan.digest,stage:'commit'};
 let s=reduce(initial(),{...base,id:'start',type:'ATTEMPT',at:clock.iso}).state;
 s=reduce(s,{...base,id:'telemetry-failed',type:'FAILURE',stage:'monitoring',at:'2026-10-07T13:00:01.000Z'}).state;
 const replay=ctx.adbPlanEditorialPublication(decoded,state,clock,sha);
 assert.equal(replay.result,'ALREADY_COMMITTED');assert.equal(replay.queue.length,0);assert.equal(replay.history.length,0);
 const success=reduce(s,{...base,id:'readback',type:'COMMIT_VERIFIED',stage:'readback',ledger:state.ledger[0],at:'2026-10-07T13:00:02.000Z'});
 assert.equal(success.state.status,'Healthy');assert.equal(success.alertIntent,null);
 assert.equal(JSON.stringify(state),targetBefore);
});
test('manual Apps Script QA runs without any storage, property, trigger or send API',()=>{
 const logs=[];ctx.adbPublisherDigest_=sha;ctx.Logger={log:v=>logs.push(JSON.parse(v))};
 ctx.runPublisherDevWorkflowQaV1();assert.equal(logs.length,1);assert.equal(logs[0].result,'PASS');
 assert.equal(logs[0].writes,false);assert.equal(logs[0].emails,false);assert.equal(logs[0].realPermissionsVerified,false);
});
