'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),cp=require('node:child_process');
const clone=x=>JSON.parse(JSON.stringify(x)),fixture=JSON.parse(cp.execFileSync('python',['tests/publisher-fixture.py'],{encoding:'utf8'}));
function harness(options={}) {
 const c=vm.createContext({Intl});vm.runInContext(fs.readFileSync('apps-script/EditorialPublisherDevReviewBundle.gs','utf8'),c);
 const C=clone(vm.runInContext('ADB_PUBLISHER',c));
 const policy={purpose:'ISOLATED_REVIEWED_HANDOFF_DEV',databaseId:'new_synthetic_database',draftId:'new_synthetic_draft',sealedId:'new_synthetic_sealed',sourceRevision:fixture.source_revision,operator:'owner@example.invalid',...options.policy};
 const props={ADB_DEV_REVIEW_POLICY_JSON:JSON.stringify(policy),ADB_PUBLISHER_SOURCE_REVISION:fixture.source_revision};
 const files=new Map();let seq=1,locked=false,writes=0,reads=0,active=policy.operator,effective=policy.operator;
 function file(id,role) {
  const tables=new Map();files.set(id,tables);
  function add(name,values){tables.set(name,{id:seq++,values:clone(values)});}
  add('Environment',[['Setting','Value'],['Environment','DEVELOPMENT'],['Allow External Delivery','FALSE'],['Production Writes','FORBIDDEN'],['QA Purpose','ISOLATED_REVIEWED_HANDOFF_DEV'],['Handoff Role',role],['Manage URL','https://example.org/manage'],['History Cutoff',fixture.selection_bundle.cutoff],['History Window Start',fixture.selection_bundle.history_window_start],['Recent History Complete','TRUE'],['Extended History Complete','TRUE']]);return {tables,add};
 }
 const db=file(policy.databaseId,'DATABASE'),p=fixture.selection_bundle.profiles.SYNTHETIC;
 db.add('Subscribers',[['Profile ID','Email','Status','Admin Status'],['SYNTHETIC','secret@example.invalid','Active','OK']]);
 db.add('Profiles',[['Profile ID','Primary Preference Email','Status','More for You Volume','Summary Style','Why It Matters Length'],['SYNTHETIC','secret@example.invalid','Active',p.volume,p.summary_style,p.why_it_matters_length]]);
 db.add('Preferences',[['Profile ID','Interest ID','Preference'],...Object.entries(p.preferences).map(([k,v])=>['SYNTHETIC',k,v])]);
 db.add('Message Templates',[['Template ID','Status','Environment'],['DAILY_BRIEFING_V1','Active','DEVELOPMENT']]);
 db.add('Outbound Messages',[C.QUEUE]);db.add('Briefing History',[C.HISTORY]);db.add('Publisher Ledger',[C.LEDGER]);
 const draft=file(policy.draftId,'DRAFT_INBOX'),stage=clone(c.adbDevDraftPackageV1('REVIEW',fixture));
 const ph=['Package ID','State','Chunk Count','Package SHA-256'],ch=['Package ID','Sequence','JSON'];
 draft.add('Packages',[ph,ph.map(k=>stage.manifest[k])]);draft.add('Package Chunks',[ch,...stage.chunks.map(r=>ch.map(k=>r[k]))]);
 const sealed=file(policy.sealedId,'SEALED_STAGING');sealed.add('Packages',[ph]);sealed.add('Package Chunks',[ch]);sealed.add('DEV Package Reviews',[['Package ID','Review JSON']]);
 c.PropertiesService={getScriptProperties:()=>({getProperty:k=>props[k]??null,getProperties:()=>clone(props),setProperty:(k,v)=>{props[k]=v;},setProperties:(values,remove)=>{assert.equal(remove,false);Object.assign(props,values);}})};c.SpreadsheetApp={getActiveSpreadsheet:()=>options.bound?{}:null};c.ScriptApp={getProjectTriggers:()=>options.triggers||[]};
 c.Session={getActiveUser:()=>({getEmail:()=>active}),getEffectiveUser:()=>({getEmail:()=>effective})};
 c.LockService={getScriptLock:()=>({waitLock:()=>{assert(!locked);locked=true;},releaseLock:()=>{assert(locked);locked=false;}})};
 c.Date=class extends Date{constructor(...args){super(...(args.length?args:['2026-10-07T13:00:01.000Z']));}};
 c.Utilities={DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(a,s)=>Array.from(crypto.createHash('sha256').update(s).digest()),formatDate:()=>fixture.edition_date,newBlob:s=>({getBytes:()=>Buffer.from(s)})};
 const hooks={};c.Sheets={Spreadsheets:{get:id=>{reads++;assert(files.has(id));return {sheets:[...files.get(id)].map(([title,s])=>({properties:{sheetId:s.id,title}}))};},
 Values:{batchGet:(id,{ranges,valueRenderOption})=>{reads++;assert.equal(valueRenderOption,'UNFORMATTED_VALUE');return {valueRanges:ranges.map(r=>({values:clone(files.get(id).get(r.slice(1,-1)).values)}))};}},
 batchUpdate:(request,id)=>{assert(locked);assert.equal(id,JSON.parse(props.ADB_DEV_REVIEW_POLICY_JSON).sealedId);assert.equal(request.requests.length,3);if(hooks.before)hooks.before();
 for(const r of request.requests){const op=r.appendCells;assert.equal(op.fields,'userEnteredValue');const s=[...files.get(id).values()].find(s=>s.id===op.sheetId);assert(s);s.values.push(...op.rows.map(row=>row.values.map(cell=>{const v=cell.userEnteredValue;assert(!v.formulaValue);return v.stringValue??v.numberValue;})));}writes++;if(hooks.after)hooks.after();}}};
 c.HtmlService={createHtmlOutputFromFile:name=>({setTitle:title=>({name,title})})};
 return {c,policy,props,files,db,draft,sealed,hooks,reads:()=>reads,writes:()=>writes,locked:()=>locked,identity:(a,e=a)=>{active=a;effective=e;},load:()=>clone(c.adbDevReviewLoadV1('REVIEW')),seal:t=>clone(c.adbDevReviewSealV1(t))};
}

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
module.exports={harness};


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
