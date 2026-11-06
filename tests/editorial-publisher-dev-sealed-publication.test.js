'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process');
const {harness}=require('./helpers/review-host-harness'),clone=x=>JSON.parse(JSON.stringify(x));
function publication(options={}) {
 const seed=JSON.parse(JSON.parse(fs.readFileSync('apps-script/EditorialPublisherDevReviewBundle.gs','utf8').match(/const ADB_DEV_REVIEW_SEED_JSON = (.*);\n$/)[1]));
 const ids={databaseId:'1ognA5DqMxwYN9C11UDEHhPvb79OQ09FSjhdPde1fn7s',draftId:'1Fuf0vja1GVZYl7WavDyBay_sPmjOoGeXA286H9wfD4k',sealedId:'1QvW2aVF7BCdTr-mnlfHTG6Z_NpiSiCSPK7AcjFBvrYQ'};
 const h=harness({pkg:seed,packageId:'REVIEW-2026-11-06',policy:ids});
 const review=h.load();h.seal(review.ticket);
 vm.runInContext(fs.readFileSync('apps-script/EditorialPublisherDevPublicationBundle.gs','utf8'),h.c);
 const C=clone(vm.runInContext('ADB_DEV_SEALED_PUBLICATION',h.c)),P=clone(vm.runInContext('ADB_PUBLISHER',h.c));
 let targetWrites=0,monitorWrites=0,provisionWrites=0,dbPhases=0,sealedReads=0,injected=false;
 const getValues=h.c.Sheets.Spreadsheets.Values.batchGet;
 h.c.Sheets.Spreadsheets.Values.batchGet=(id,request)=>{
  if(id===C.DATABASE && request.ranges.length===8) {
   dbPhases++;
   if(options.changedPreferences && dbPhases===2)h.db.tables.get('Preferences').values[1][2]='Off';
  }
  if(id===C.SEALED) {
   sealedReads++;
   if(options.changedReview && sealedReads===3) {
    const t=h.sealed.tables.get('DEV Package Reviews'),receipt=JSON.parse(t.values[1][1]);receipt.at='2026-11-06T15:59:00.000Z';t.values[1][1]=JSON.stringify(receipt);
   }
  }
  return getValues(id,request);
 };
 const fail=stage=>{if(!injected && options.failure===stage){injected=true;throw Error('injected '+stage);}};
 h.c.Sheets.Spreadsheets.batchUpdate=(request,id)=>{
  assert(h.locked());assert.equal(id,C.DATABASE);const ops=request.requests;
  const kind=ops.some(r=>r.addSheet)?'provision':ops.length===3&&ops.every(r=>r.appendCells)?'target':'monitor';
  assert(['provision','target','monitor'].includes(kind));
  if(kind==='target')fail('target-before');
  if(kind==='monitor'&&monitorWrites===1)fail('success-before');
  // Every body is one atomic API transaction. Interpret all operations together.
  for(const r of ops) {
   if(r.addSheet){const p=r.addSheet.properties;assert(!h.db.tables.has(p.title));h.db.tables.set(p.title,{id:p.sheetId,values:[]});continue;}
   const op=r.appendCells||r.updateCells,sheetId=op.sheetId??op.range.sheetId;
   const t=[...h.db.tables.values()].find(t=>t.id===sheetId);assert(t);assert.equal(op.fields,'userEnteredValue');
   const rows=op.rows.map(row=>row.values.map(cell=>{const v=cell.userEnteredValue;assert(!v.formulaValue);return v.stringValue??v.numberValue;}));
   if(r.appendCells)t.values.push(...rows);else rows.forEach((row,i)=>{t.values[op.range.startRowIndex+i]=row;});
  }
  if(kind==='provision')provisionWrites++;
  if(kind==='target') {
   targetWrites++;fail('target-after');
   if(options.corruptReadback)h.db.tables.get('Outbound Messages').values[1][P.QUEUE.indexOf('HTML')]+='CORRUPTED';
  }
  if(kind==='monitor') {monitorWrites++;if(monitorWrites===2)fail('success-after');}
 };
 h.c.Logger={log:()=>{}};
 return {...h,C,P,run:()=>clone(h.c.runDevReviewedPublicationV1()),counts:()=>({targetWrites,monitorWrites,provisionWrites}),
  monitor:()=>JSON.parse(h.db.tables.get(C.STATE).values[1][0]),
  targetCounts:()=>['Outbound Messages','Briefing History','Publisher Ledger'].map(name=>h.db.tables.get(name).values.length-1)};
}

test('separate native publication commits the reviewed external sealed copy once; exact replay is read-only for target and monitoring',()=>{
 const h=publication(),sealed=JSON.stringify([...h.sealed.tables]),draft=JSON.stringify([...h.draft.tables]);
 const beforeReads=h.reads(),first=h.run(),firstReads=h.reads()-beforeReads;assert.equal(first.publication,'COMMITTED');assert.equal(first.monitoring,'SUCCESS');assert.equal(first.profiles,1);assert.equal(first.historyRows,6);assert.equal(first.emails,false);assert.equal(first.productionWrites,false);
 assert.deepEqual(h.targetCounts(),[1,6,1]);assert.equal(h.monitor().status,'Healthy');assert.equal(h.monitor().incident,null);
 const counts=h.counts(),replayBefore=h.reads(),again=h.run(),replayReads=h.reads()-replayBefore;assert.equal(again.publication,'ALREADY_COMMITTED');assert.equal(again.monitoring,'REPLAY');assert.deepEqual(h.counts(),counts);
 assert.equal(JSON.stringify([...h.sealed.tables]),sealed);assert.equal(JSON.stringify([...h.draft.tables]),draft);assert.equal(h.locked(),false);
 assert(firstReads+replayReads<60);console.log('Reviewed publication read requests: first='+firstReads+', replay='+replayReads);
});

for(const failure of ['target-before','target-after','success-before','success-after'])test('recovers '+failure+' without a duplicate queue/history/ledger',()=>{
 const h=publication({failure});assert.throws(()=>h.run(),/injected/);assert.equal(h.locked(),false);
 const recovered=h.run();assert(['COMMITTED','ALREADY_COMMITTED'].includes(recovered.publication));assert.equal(h.monitor().status,'Healthy');assert.equal(h.monitor().incident,null);
 assert.deepEqual(h.targetCounts(),[1,6,1]);assert.equal(h.counts().targetWrites,1);
 const before=h.counts();h.run();assert.deepEqual(h.counts(),before);
 if(failure==='success-after')assert.equal(h.db.tables.get(h.C.EVENTS).values.length,3,'lost success response must not add a false failure');
});

test('changed preferences before commit records failure without target writes',()=>{
 const h=publication({changedPreferences:true});assert.throws(()=>h.run(),/snapshot|personalization/);assert.deepEqual(h.targetCounts(),[0,0,0]);assert.equal(h.monitor().status,'Failed');assert.equal(h.monitor().lastSuccess,'');assert.equal(h.counts().targetWrites,0);
});

test('changed review receipt between validation phases blocks publication',()=>{
 const h=publication({changedReview:true});assert.throws(()=>h.run(),/sealed review changed/);assert.deepEqual(h.targetCounts(),[0,0,0]);assert.equal(h.counts().targetWrites,0);
});

test('post-commit corruption blocks Healthy, preserves the ledger and never repairs or requeues',()=>{
 const h=publication({corruptReadback:true});assert.throws(()=>h.run(),/payload changed/);assert.equal(h.monitor().status,'Failed');assert.equal(h.monitor().lastSuccess,'');assert.deepEqual(h.targetCounts(),[1,6,1]);assert.equal(h.counts().targetWrites,1);
 assert.throws(()=>h.run(),/payload changed/);assert.equal(h.counts().targetWrites,1);
});

test('unsealed/tampered input fails before creating monitoring or touching targets',()=>{
 for(const change of [h=>h.sealed.tables.get('Packages').values[1][1]='DRAFT',h=>h.sealed.tables.get('Package Chunks').values[1][2]+='CHANGED']) {
  const h=publication();change(h);assert.throws(()=>h.run());assert.deepEqual(h.counts(),{targetWrites:0,monitorWrites:0,provisionWrites:0});
 }
});

test('wrong operator, alternate target and expired date fail before publication writes',()=>{
 const h=publication();h.identity('');assert.throws(()=>h.run(),/operator/);assert.equal(h.counts().provisionWrites,0);
 const other=publication(),policy=JSON.parse(other.props.ADB_DEV_REVIEW_POLICY_JSON);policy.databaseId='other_dev_database';other.props.ADB_DEV_REVIEW_POLICY_JSON=JSON.stringify(policy);assert.throws(()=>other.run(),/fixed November/);assert.equal(other.counts().provisionWrites,0);
 const expired=publication();expired.c.Utilities.formatDate=()=> '2026-11-07';assert.throws(()=>expired.run(),/publication expired/);assert.equal(expired.counts().provisionWrites,0);
});

test('partial monitor provisioning and schema corruption fail without resetting journal',()=>{
 const h=publication();h.db.tables.set(h.C.STATE,{id:999,values:[['State JSON']]});assert.throws(()=>h.run(),/partial/);assert.equal(h.counts().targetWrites,0);
 const bad=publication();bad.run();bad.db.tables.get(bad.C.EVENTS).values[0][0]='Changed';const before=bad.counts();assert.throws(()=>bad.run(),/schema drift/);assert.deepEqual(bad.counts(),before);
});

test('publication add-on is reproducible, excludes old target adapters and does not add a UI publication control',()=>{
 const path='apps-script/EditorialPublisherDevPublicationBundle.gs',before=fs.readFileSync(path,'utf8');cp.execFileSync('python',['scripts/build_publisher_dev_publication.py']);assert.equal(fs.readFileSync(path,'utf8'),before);
 const combined=fs.readFileSync('apps-script/EditorialPublisherDevOperatorBundle.gs','utf8');
 assert(combined.endsWith(fs.readFileSync('apps-script/EditorialPublisherDevReviewBundle.gs','utf8')+'\n'+before));
 const c=vm.createContext({Intl});vm.runInContext(combined,c);assert.equal(typeof c.runDevReviewedPublicationV1,'function');assert.equal(typeof c.adbDevReviewSealV1,'function');
 assert(!before.includes('function adbDevMonitorOpen_'));assert(!before.includes('function publishReadyEditorialPackageDevV1'));
 assert(!fs.readFileSync('apps-script/EditorialPublisherDevReview.html','utf8').includes('runDevReviewedPublicationV1'));
});
