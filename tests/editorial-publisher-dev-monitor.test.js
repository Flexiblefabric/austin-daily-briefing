'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const clone=x=>JSON.parse(JSON.stringify(x)),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function runtime(){const c=vm.createContext({});for(const p of ['apps-script/EditorialPublisher.gs','apps-script/EditorialPublisherDevWorkflow.gs','apps-script/EditorialPublisherDevMonitor.gs'])vm.runInContext(fs.readFileSync(p,'utf8'),c);return c;}
const ctx=runtime(),C=clone(vm.runInContext('ADB_DEV_MONITOR',ctx));
const event=(id,type,sec,extra={})=>({id,type,editionDate:'2026-10-28',runId:'2026-10-28-publisher-v1',digest:'a'.repeat(64),stage:'validation',at:`2026-10-28T20:00:${sec}.000Z`,...extra});
function store(){const snapshot={stateJson:'',events:[]};let writes=0;return {snapshot,get writes(){return writes;},io:{read:()=>clone(snapshot),atomicWrite:(stateJson,row)=>{snapshot.stateJson=stateJson;snapshot.events.push(clone(row));writes++;}}};}
function persist(io,e){return clone(ctx.adbDevPersistMonitorEventV1(io,e,sha));}
test('checkpoint and journal persist and restart replay performs zero writes',()=>{
 const s=store(),e=event('start','ATTEMPT','00');const r=persist(s.io,e);
 assert.equal(r.wrote,true);assert.equal(s.writes,1);assert.equal(s.snapshot.events.length,1);
 const restarted=runtime(),replay=clone(restarted.adbDevPersistMonitorEventV1(s.io,e,sha));
 assert.equal(replay.result,'REPLAY');assert.equal(replay.wrote,false);assert.equal(replay.alertIntent,null);assert.equal(s.writes,1);
});
test('failure before atomic write leaves no partial event or checkpoint',()=>{
 const s=store(),original=JSON.stringify(s.snapshot);
 assert.throws(()=>persist({read:s.io.read,atomicWrite:()=>{throw Error('before request');}},event('start','ATTEMPT','00')),/before request/);
 assert.equal(JSON.stringify(s.snapshot),original);assert.equal(s.writes,0);
 assert.equal(persist(s.io,event('start','ATTEMPT','00')).wrote,true);
});
test('lost response after atomic commit reconciles once without a second failure intent',()=>{
 const s=store();persist(s.io,event('start','ATTEMPT','00'));
 const failed=event('fail','FAILURE','01');
 assert.throws(()=>persist({read:s.io.read,atomicWrite:(json,row)=>{s.io.atomicWrite(json,row);throw Error('lost response');}},failed),/lost response/);
 const retry=persist(s.io,failed);assert.equal(retry.result,'REPLAY');assert.equal(retry.alertIntent,null);
 assert.equal(s.writes,2);assert.equal(s.snapshot.events.length,2);assert.equal(s.snapshot.events.filter(r=>r[3]!=='null').length,1);
});
for(const [name,corrupt] of [
 ['checkpoint missing',s=>s.stateJson=''],['journal missing',s=>s.events=[]],
 ['duplicate event',s=>s.events.push(clone(s.events[0]))],
 ['event payload changed',s=>s.events[0][1]=s.events[0][1].replace('validation','commit')],
 ['state hash changed',s=>s.events[0][2]='b'.repeat(64)],
 ['alert intent changed',s=>s.events[0][3]='{}'],
 ['checkpoint status changed',s=>s.stateJson=s.stateJson.replace('Running','Healthy')]
])test('blocks corrupted '+name+' before any additional write',()=>{
 const s=store();persist(s.io,event('start','ATTEMPT','00'));corrupt(s.snapshot);
 const before=JSON.stringify(s.snapshot),writes=s.writes;
 assert.throws(()=>persist(s.io,event('fail','FAILURE','01')));assert.equal(JSON.stringify(s.snapshot),before);assert.equal(s.writes,writes);
});
test('readback corruption throws without attempting a repair or repeat write',()=>{
 const s=store();assert.throws(()=>persist({read:s.io.read,atomicWrite:(json,row)=>{s.io.atomicWrite(json,row);s.snapshot.events[0][2]='bad';}},event('start','ATTEMPT','00')),/changed/);
 assert.equal(s.writes,1);
});
test('state cell growth blocks atomically; no pruning of replay history',()=>{
 const s=store();let rejected=false;
 for(let i=0;i<10;i++){
   const before=JSON.stringify(s.snapshot),writes=s.writes;
   try{persist(s.io,event('attempt-'+i,'ATTEMPT','00',{qaPadding:'x'.repeat(10000)}));}catch(e){assert.match(e.message,/size limit/);assert.equal(JSON.stringify(s.snapshot),before);assert.equal(s.writes,writes);rejected=true;break;}
 }
 assert.equal(rejected,true);
});

function appsMock(){
 const c=runtime(),sheets=new Map(),logs=[],batches=[],opens=[];let prop=C.DATABASE,environment='DEVELOPMENT',external='FALSE',lostProvision=false;
 function sheet(id,title,values){const s={id,title,values:clone(values),getSheetId:()=>id,getDataRange:()=>({getDisplayValues:()=>clone(s.values)})};sheets.set(title,s);return s;}
 sheet(1,'Environment',[['Setting','Value'],['Environment','DEVELOPMENT'],['Allow External Delivery','FALSE']]);
 sheet(2,'Outbound Messages',[['Message ID','Status'],['existing-synthetic','Queued']]);
 sheet(3,'Briefing History',[['Run ID','Delivery Status'],['existing-synthetic','Pending']]);
 sheet(4,'Publisher Ledger',[['Edition Key'],['daily:synthetic']]);
 const book={getSheetByName:n=>sheets.get(n)||null,getSheets:()=>[...sheets.values()]};
 c.PropertiesService={getScriptProperties:()=>({getProperty:key=>{assert.equal(key,'ADB_PUBLISHER_DEV_DATABASE_ID');return prop;}})};
 c.SpreadsheetApp={openById:id=>{opens.push(id);assert.equal(id,C.DATABASE);sheets.get('Environment').values=[['Setting','Value'],['Environment',environment],['Allow External Delivery',external]];return book;}};
 let locked=false;
 c.LockService={getScriptLock:()=>({waitLock:()=>{assert.equal(locked,false);locked=true;},releaseLock:()=>{locked=false;}})};
 c.Sheets={Spreadsheets:{batchUpdate:(request,id)=>{
   assert.equal(locked,true);assert.equal(id,C.DATABASE);
   // Apply to a cloned working set, then swap, modelling Sheets batch atomicity.
   const next=new Map([...sheets].map(([n,s])=>[n,{id:s.id,title:s.title,values:clone(s.values)}]));
   for(const r of request.requests){
     if(r.addSheet){const p=r.addSheet.properties;assert(!next.has(p.title));next.set(p.title,{id:p.sheetId,title:p.title,values:[]});continue;}
     const op=r.updateCells||r.appendCells,s=[...next.values()].find(s=>s.id===(op.sheetId||op.range.sheetId));
     assert([C.STATE,C.EVENTS].includes(s.title));
     const rows=op.rows.map(row=>row.values.map(v=>{assert.deepEqual(Object.keys(v.userEnteredValue),['stringValue']);return v.userEnteredValue.stringValue;}));
     if(r.appendCells)s.values.push(...rows);else {const start=op.range.startRowIndex;for(let i=0;i<rows.length;i++)s.values[start+i]=rows[i];}
   }
   sheets.clear();for(const s of next.values())sheet(s.id,s.title,s.values);
   batches.push(clone(request));
   if(lostProvision && request.requests.some(r=>r.addSheet)){lostProvision=false;throw Error('provision response lost');}
 }}};
 c.adbPublisherDigest_=sha;c.Logger={log:s=>logs.push(JSON.parse(s))};
 return {c,sheets,logs,batches,opens,setProperty:v=>prop=v,setEnvironment:v=>environment=v,setExternal:v=>external=v,loseProvision:()=>lostProvision=true,isLocked:()=>locked};
}
test('actual DEV adapter provisions and atomically persists six events; rerun adds nothing and leaves target tables unchanged',()=>{
 const m=appsMock(),targets=['Outbound Messages','Briefing History','Publisher Ledger'];
 const before=JSON.stringify(targets.map(n=>m.sheets.get(n).values));
 m.c.runPublisherDevMonitorPersistenceQaV1();
 assert.equal(m.logs[0].result,'PASS');assert.equal(m.logs[0].lostResponseInjected,true);assert.equal(m.logs[0].writes,true);
 assert.equal(m.logs[0].productionWrites,false);assert.equal(m.logs[0].emails,false);assert.equal(m.logs[0].alertsSent,0);
 assert.equal(m.batches.length,7);assert.equal(m.sheets.get(C.EVENTS).values.length,7);
 assert(m.batches.slice(1).every(b=>b.requests.length===2 && b.requests[0].updateCells && b.requests[1].appendCells));
 m.c.runPublisherDevMonitorPersistenceQaV1();assert.equal(m.batches.length,7);assert.equal(m.logs[1].lostResponseInjected,false);
 assert.equal(m.logs[1].writes,false);assert.equal(m.logs[1].devBatches,0);
 assert.equal(JSON.stringify(targets.map(n=>m.sheets.get(n).values)),before);assert.equal(m.isLocked(),false);
});
test('wrong or production workbook ID is rejected before opening anything',()=>{
 for(const id of ['production-id','1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0','',null]){
   const m=appsMock();m.setProperty(id);assert.throws(()=>m.c.runPublisherDevMonitorPersistenceQaV1(),/fixed publisher DEV/);
   assert.equal(m.opens.length,0);assert.equal(m.batches.length,0);assert.equal(m.isLocked(),false);
 }
});
test('wrong environment or enabled delivery blocks before any write',()=>{
 for(const configure of [m=>m.setEnvironment('PRODUCTION'),m=>m.setExternal('TRUE')]){
  const m=appsMock();configure(m);assert.throws(()=>m.c.runPublisherDevMonitorPersistenceQaV1(),/environment\/delivery/);assert.equal(m.batches.length,0);
 }
});
test('partial provisioning and schema drift never reset existing monitor data',()=>{
 const partial=appsMock();partial.sheets.set(C.STATE,{getSheetId:()=>99});
 assert.throws(()=>partial.c.runPublisherDevMonitorPersistenceQaV1(),/partial monitor/);assert.equal(partial.batches.length,0);
 const m=appsMock();m.c.runPublisherDevMonitorPersistenceQaV1();m.sheets.get(C.EVENTS).values[0][0]='Changed';
 const before=JSON.stringify(m.sheets.get(C.EVENTS).values),writes=m.batches.length;
 assert.throws(()=>m.c.runPublisherDevMonitorPersistenceQaV1(),/schema drift/);assert.equal(m.batches.length,writes);assert.equal(JSON.stringify(m.sheets.get(C.EVENTS).values),before);
});
test('lost provisioning response resumes without duplicate sheets',()=>{
 const m=appsMock();m.loseProvision();assert.throws(()=>m.c.runPublisherDevMonitorPersistenceQaV1(),/provision response lost/);
 assert.equal(m.batches.length,1);assert.equal(m.isLocked(),false);
 m.c.runPublisherDevMonitorPersistenceQaV1();assert.equal(m.logs[0].result,'PASS');assert.equal(m.batches.length,7);
 assert.equal([...m.sheets.keys()].filter(n=>n.startsWith('DEV Monitor ')).length,2);
});
