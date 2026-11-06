'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),cp=require('node:child_process');
const clone=x=>JSON.parse(JSON.stringify(x));
const {harness,fixture}=require('./helpers/review-host-harness');

test('native host seals atomically and reads back without touching database/draft',()=>{
 const h=harness(),db=JSON.stringify([...h.db.tables]),draft=JSON.stringify([...h.draft.tables]),review=h.load();
 assert.equal(review.profiles,1);assert.equal(review.historyRows,6);assert(!JSON.stringify(review).includes('secret@example'));
 assert.equal(h.seal(review.ticket).result,'SEALED');assert.equal(h.seal(review.ticket).result,'ALREADY_SEALED');assert.equal(h.writes(),1);
 assert.equal(JSON.stringify([...h.db.tables]),db);assert.equal(JSON.stringify([...h.draft.tables]),draft);assert.equal(h.locked(),false);assert(h.reads()<60);
 assert.equal(h.sealed.tables.get('Packages').values.length,2);assert.equal(h.sealed.tables.get('DEV Package Reviews').values.length,2);assert.equal(h.c.adbDevReviewHost_().readReady('REVIEW').result,'READY');
});
for(const [a,e] of [['',''],['visitor@example.invalid','owner@example.invalid'],['owner@example.invalid','another@example.invalid']])test('identity stops before file access '+a+'/'+e,()=>{
 const h=harness();h.identity(a,e);assert.throws(()=>h.load(),/operator identity/);assert.throws(()=>h.seal({}));assert.throws(()=>h.c.doGet());assert.equal(h.reads(),0);assert.equal(h.writes(),0);
});
for(const options of [{bound:true},{triggers:[{}]},{policy:{databaseId:'1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0'}},{policy:{draftId:'1K5iBARfGpUGdM-fKWdZANXjpsyuPcAaa-oVPy8RDNd0'}}])test('wrong project/target blocks '+JSON.stringify(options),()=>{
 const h=harness(options);assert.throws(()=>h.load());assert.equal(h.reads(),0);
});
test('missing configuration and bad source pin cannot bootstrap by visiting app',()=>{
 const h=harness();delete h.props.ADB_DEV_REVIEW_POLICY_JSON;assert.throws(()=>h.c.doGet(),/not been configured/);
 const bad=harness();bad.props.ADB_PUBLISHER_SOURCE_REVISION='f'.repeat(40);assert.throws(()=>bad.load(),/revision pin/);assert.equal(bad.reads(),0);
});
for(const role of ['db','draft','sealed'])test('wrong '+role+' environment role blocks writes',()=>{
 const h=harness();h[role].tables.get('Environment').values.find(r=>r[0]==='Handoff Role')[1]='PRODUCTION';assert.throws(()=>{const review=h.load();h.seal(review.ticket);},/isolated DEV role/);assert.equal(h.writes(),0);
});
for(const [name,mutate] of [
 ['orphan chunk',h=>h.sealed.tables.get('Package Chunks').values.push(['ORPHAN',1,'{}'])],
 ['orphan review',h=>h.sealed.tables.get('DEV Package Reviews').values.push(['ORPHAN','{}'])],
 ['schema drift',h=>h.sealed.tables.get('Packages').values[0].push('Extra')],
 ['duplicate chunks',h=>h.draft.tables.get('Package Chunks').values.push(clone(h.draft.tables.get('Package Chunks').values[1]))]
])test(name+' cannot be silently repaired',()=>{
 const h=harness();mutate(h);assert.throws(()=>{const review=h.load();h.seal(review.ticket);});assert.equal(h.writes(),0);
});
for(const phase of ['before','after'])test('native write '+phase+' response failure reconciles on retry',()=>{
 const h=harness(),t=h.load().ticket;let thrown=false;h.hooks[phase]=()=>{if(!thrown){thrown=true;throw Error('simulated response failure');}};
 assert.throws(()=>h.seal(t),/response failure/);assert.equal(h.locked(),false);assert.equal(h.seal(t).result,phase==='after'?'ALREADY_SEALED':'SEALED');assert.equal(h.writes(),1);
});
test('bundle excludes publication entry point and is reproducible',()=>{
 const source=fs.readFileSync('apps-script/EditorialPublisherDevReviewBundle.gs','utf8');assert(!source.includes('function publishReadyEditorialPackageDevV1'));
 const h=harness();assert.equal(typeof h.c.publishReadyEditorialPackageDevV1,'undefined');assert.equal(h.c.doGet().name,'EditorialPublisherDevReview');
 cp.execFileSync('python',['scripts/build_publisher_dev_review.py']);assert.equal(fs.readFileSync('apps-script/EditorialPublisherDevReviewBundle.gs','utf8'),source);
});


function bootstrapHarness() {
 const h=harness();for(const key of Object.keys(h.props))delete h.props[key];
 const seed=JSON.parse(vm.runInContext('ADB_DEV_REVIEW_SEED_JSON',h.c));let creates=0;const hooks={};
 h.c.Date=class extends Date{constructor(...args){super(...(args.length?args:[seed.edition_date+'T13:00:01.000Z']));}};
 h.c.Utilities.formatDate=()=>seed.edition_date;
 h.c.Sheets.Spreadsheets.create=(body,opts)=>{
  assert(h.locked());creates++;assert.equal(opts.fields,'spreadsheetId,spreadsheetUrl');
  const id='created_synthetic_file_'+creates,tables=new Map();
  for(const sheet of body.sheets){tables.set(sheet.properties.title,{id:sheet.properties.sheetId,values:sheet.data[0].rowData.map(row=>row.values.map(cell=>cell.userEnteredValue.stringValue??cell.userEnteredValue.numberValue))});}
  h.files.set(id,tables);if(hooks.afterCreate)hooks.afterCreate(creates);
  return {spreadsheetId:id,spreadsheetUrl:'https://docs.google.com/spreadsheets/d/'+id+'/edit'};
 };
 const logs=[];h.c.Logger={log:v=>logs.push(JSON.parse(v))};return {...h,seed,creates:()=>creates,bootstrapHooks:hooks,logs};
}

test('one-time setup creates only new files, pins configuration and passes independent native planner readback',()=>{
 const h=bootstrapHarness(),before=JSON.stringify([...h.files].map(([id,t])=>[id,[...t]]));
 const result=clone(h.c.setupDevEditorialReviewV1());assert.equal(result.result,'READY_FOR_REVIEW');assert.equal(result.createdFiles,3);assert.equal(result.sealed,false);assert.equal(result.published,false);assert.equal(result.realPermissionsVerified,false);
 assert.equal(h.creates(),3);assert.equal(h.writes(),0);assert.equal(h.locked(),false);
 const original=[...h.files].filter(([id])=>!id.startsWith('created_')).map(([id,t])=>[id,[...t]]);assert.equal(JSON.stringify(original),before);
 const policy=JSON.parse(h.props.ADB_DEV_REVIEW_POLICY_JSON);assert(policy.databaseId.startsWith('created_'));assert.equal(policy.sourceRevision,h.seed.source_revision);
 assert.equal(h.files.get(policy.sealedId).get('Packages').values.length,1);
 const review=h.c.adbDevReviewLoadV1(result.packageId);assert.equal(review.profiles,1);assert.equal(review.historyRows,6);
 assert.equal(h.c.adbDevReviewSealV1(review.ticket).result,'SEALED');assert.equal(h.writes(),1);
 assert.throws(()=>h.c.setupDevEditorialReviewV1(),/already started/);assert.equal(h.creates(),3);
});

test('expired setup seed fails before creating files or setting properties',()=>{
 const h=bootstrapHarness();h.c.Utilities.formatDate=()=> '2099-01-01';assert.throws(()=>h.c.setupDevEditorialReviewV1(),/seed expired/);assert.equal(h.creates(),0);assert.deepEqual(h.props,{});assert.equal(h.locked(),false);
});

test('ambiguous file creation leaves started marker and refuses duplicate provisioning',()=>{
 const h=bootstrapHarness();h.bootstrapHooks.afterCreate=()=>{throw Error('create response lost');};
 assert.throws(()=>h.c.setupDevEditorialReviewV1(),/response lost/);assert.equal(h.creates(),1);assert(h.props.ADB_DEV_REVIEW_BOOTSTRAP_STARTED);assert(!h.props.ADB_DEV_REVIEW_POLICY_JSON);
 assert.throws(()=>h.c.setupDevEditorialReviewV1(),/already started/);assert.equal(h.creates(),1);assert.equal(h.locked(),false);
});

test('review seed uses its independent edition and correct Chicago DST offset without rewriting historical fixture',()=>{
 const h=harness(),seed=JSON.parse(vm.runInContext('ADB_DEV_REVIEW_SEED_JSON',h.c));
 const config=JSON.parse(fs.readFileSync('docs/editorial-publisher-dev-review-config.json','utf8'));
 const historical=JSON.parse(fs.readFileSync('tests/fixtures/editorial-publisher-e2e.json','utf8'));
 assert.equal(seed.edition_date,config.edition);
 assert.equal(seed.selection_bundle.run_id,config.edition+'-publisher-v1');
 const clock=cp.execFileSync('python',['-c',"import datetime as d;from zoneinfo import ZoneInfo;print(d.datetime.fromisoformat('"+config.edition+"T08:00:00').replace(tzinfo=ZoneInfo('America/Chicago')).isoformat())"],{encoding:'utf8'}).trim();
 assert.equal(seed.selection_bundle.cutoff,clock);
 assert.equal(historical.edition_date,'2026-10-30');assert.equal(seed.source_revision,historical.source_revision);
});
