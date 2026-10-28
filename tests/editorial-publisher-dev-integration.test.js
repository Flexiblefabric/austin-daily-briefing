'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),cp=require('node:child_process');
const clone=x=>JSON.parse(JSON.stringify(x));
const fixture=JSON.parse(cp.execFileSync('python',['tests/publisher-fixture.py'],{encoding:'utf8'}));
function runtime(bundle){const c=vm.createContext({Intl});if(bundle){vm.runInContext(bundle,c);return c;}for(const p of ['scripts/daily_newsletter_renderer.js','apps-script/DailyNewsletterContract.gs','apps-script/SelectionEvidenceContract.gs','apps-script/EditorialPublisher.gs','apps-script/EditorialPublisherDevWorkflow.gs','apps-script/EditorialPublisherDevMonitor.gs','apps-script/EditorialPublisherDevIntegration.gs'])vm.runInContext(fs.readFileSync(p,'utf8'),c);return c;}
function harness(failure,options={}){
 const c=runtime(options.bundle),C=clone(vm.runInContext('ADB_PUBLISHER',c)),M=clone(vm.runInContext('ADB_DEV_MONITOR',c));
 const pkg=clone(options.pkg||fixture),sheets=new Map(),logs=[];let nextId=1,locked=false,ticks=0,targetWrites=0,monitorWrites=0,injected=false,dbId=options.blankProperties?null:M.DATABASE,sourcePin=options.blankProperties?null:pkg.source_revision,verificationCorrupt=false;
 const add=(name,values,id=nextId++)=>sheets.set(name,{id,title:name,values:clone(values)});
 add('Environment',[['Setting','Value'],['Environment','DEVELOPMENT'],['Allow External Delivery','FALSE'],['Manage URL','https://example.org/manage'],['Production Writes','FORBIDDEN'],['QA Purpose','ISOLATED_E2E']]);
 const email=options.email||'synthetic@example.invalid';
 add('Subscribers',[['Profile ID','Email','Status','Admin Status'],['SYNTHETIC',email,'Active','OK']]);
 const p=pkg.selection_bundle.profiles.SYNTHETIC;
 add('Profiles',[['Profile ID','Primary Preference Email','Status','More for You Volume','Summary Style','Why It Matters Length'],['SYNTHETIC',email,'Active',p.volume,p.summary_style,p.why_it_matters_length]]);
 add('Preferences',[['Profile ID','Interest ID','Preference'],...Object.entries(p.preferences).map(([id,pref])=>['SYNTHETIC',id,pref])]);
 add('Message Templates',[['Template ID','Status','Environment'],['DAILY_BRIEFING_V1','Active','DEVELOPMENT']]);
 add('Outbound Messages',[C.QUEUE]);add('Briefing History',[C.HISTORY]);add('Publisher Ledger',[C.LEDGER]);
 const raw=c.adbPublisherCanonical_(pkg),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
 add('Packages',[['Package ID','State','Chunk Count','Package SHA-256'],[options.packageId||'QA','READY','1',sha(raw)]]);
 add('Package Chunks',[['Package ID','Sequence','JSON'],[options.packageId||'QA','1',JSON.stringify(pkg)]]);
 // Existing QA namespace contains an unrelated marker; publisher must not touch it.
 add(M.STATE,[M.STATE_HEADERS,['unrelated QA checkpoint']]);add(M.EVENTS,[M.EVENT_HEADERS]);
 c.PropertiesService={getScriptProperties:()=>({getProperty:key=>key===C.DEV_ID_PROPERTY?dbId:key===C.REVISION_PROPERTY?sourcePin:null,setProperties:(values,remove)=>{assert.equal(remove,false);assert.equal(values.ADB_PUBLISHER_DEV_DATABASE_ID,M.DATABASE);dbId=values.ADB_PUBLISHER_DEV_DATABASE_ID;sourcePin=values.ADB_PUBLISHER_SOURCE_REVISION;}})};
 const book={getId:()=>options.activeId||M.DATABASE,getSheetByName:name=>{if(options.forbidSpreadsheetReads)throw Error('Cached SpreadsheetApp values forbidden');const s=sheets.get(name);return s?{getSheetId:()=>s.id,getDataRange:()=>({getDisplayValues:()=>clone(s.values)})}:null;}};
 c.SpreadsheetApp={getActiveSpreadsheet:()=>book,openById:id=>{assert.equal(id,M.DATABASE);return book;}};
 c.ScriptApp={getProjectTriggers:()=>[]};c.Logger={log:value=>logs.push(JSON.parse(value))};
 c.LockService={getScriptLock:()=>({waitLock:()=>{assert.equal(locked,false,'nested ScriptLock acquisition');locked=true;},releaseLock:()=>{assert(locked);locked=false;}})};
 c.Date=class extends Date{constructor(...args){super(...(args.length?args:[Date.parse(pkg.edition_date+'T13:01:00.000Z')+ticks++]));}};
 c.Utilities={DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(a,s)=>Array.from(crypto.createHash('sha256').update(s).digest()),formatDate:()=>pkg.edition_date,newBlob:s=>({getBytes:()=>Buffer.from(s)})};
 c.Sheets={Spreadsheets:{
 get:(id)=>{assert.equal(id,M.DATABASE);return {sheets:[...sheets.values()].map(s=>({properties:{sheetId:s.id,title:s.title}}))};},
 Values:{batchGet:(id,options)=>{assert.equal(id,M.DATABASE);return {valueRanges:options.ranges.map(range=>{
   const name=range.slice(1,range.indexOf("'!")),values=clone(sheets.get(name).values);
   if(verificationCorrupt && name==='Outbound Messages' && values.length>1)values[1][C.QUEUE.indexOf('HTML')]+='CORRUPTED READ';
   return {values};
 })};}},
 batchUpdate:(request,id)=>{
   assert(locked);assert.equal(id,M.DATABASE);
   const target=request.requests.length===3 && request.requests.every(r=>r.appendCells);
   const monitor=request.requests.length===2 && !!request.requests[0].updateCells;
   const failNow=!injected && ((target && failure==='target-after') || (monitor && monitorWrites===1 && ['monitor-before','monitor-after'].includes(failure)));
   if(failNow && failure==='monitor-before'){injected=true;throw Error('monitor before write');}
   for(const r of request.requests){
     if(r.addSheet){const s=r.addSheet.properties;add(s.title,[],s.sheetId);continue;}
     const op=r.appendCells||r.updateCells,id=op.sheetId??op.range.sheetId;
     const s=[...sheets.values()].find(s=>s.id===id);assert(s);
     const rows=op.rows.map(row=>row.values.map(cell=>String(cell.userEnteredValue.stringValue??cell.userEnteredValue.numberValue)));
     if(r.appendCells)s.values.push(...rows);else rows.forEach((row,i)=>{s.values[op.range.startRowIndex+i]=row;});
   }
   if(target)targetWrites++;if(monitor)monitorWrites++;
   if(failNow){injected=true;throw Error(failure==='target-after'?'target response lost':'monitor response lost');}
 }
 }};
 return {c,C,M,pkg,sheets,logs,run:()=>clone(c.publishReadyEditorialPackageDevMonitoredV1('QA','attempt-1')),
 counts:()=>({targetWrites,monitorWrites,locked}),setDb:id=>dbId=id,corruptVerification:()=>verificationCorrupt=true};
}
test('opt-in wrapper executes actual publisher and persistent monitor adapters; exact replay never appends target or monitor rows',()=>{
 const h=harness(),before=JSON.stringify(h.sheets.get(h.M.STATE).values),result=h.run();
 assert.equal(result.publication,'COMMITTED');assert.equal(result.monitoring,'SUCCESS');assert.equal(result.profiles,1);assert.equal(result.historyRows,6);
 const writes=h.counts();assert.deepEqual(writes,{targetWrites:1,monitorWrites:2,locked:false});
 assert.equal(h.sheets.get('DEV Publisher Events').values.length,3);
 const replay=h.run();assert.equal(replay.publication,'ALREADY_COMMITTED');assert.equal(replay.monitoring,'REPLAY');assert.deepEqual(h.counts(),writes);
 assert.equal(JSON.stringify(h.sheets.get(h.M.STATE).values),before);
});
for(const failure of ['target-after','monitor-before','monitor-after'])test('actual adapter recovers '+failure+' without another queue/history/ledger batch',()=>{
 const h=harness(failure);assert.throws(()=>h.run(),/lost|before write/);assert.equal(h.counts().targetWrites,1);assert.equal(h.counts().locked,false);
 const before=JSON.stringify(['Outbound Messages','Briefing History','Publisher Ledger'].map(n=>h.sheets.get(n).values));
 const retry=h.run();assert.equal(retry.publication,'ALREADY_COMMITTED');assert(['SUCCESS','REPLAY'].includes(retry.monitoring));
 assert.equal(h.counts().targetWrites,1);assert.equal(h.sheets.get('Outbound Messages').values.length,2);assert.equal(h.sheets.get('Briefing History').values.length,7);
 assert.equal(JSON.stringify(['Outbound Messages','Briefing History','Publisher Ledger'].map(n=>h.sheets.get(n).values)),before);
 const state=JSON.parse(h.sheets.get('DEV Publisher State').values[1][0]);assert.equal(state.status,'Healthy');assert.equal(state.incident,null);
 // A timeout after persisted SUCCESS must not generate a later FAILURE event.
 if(failure==='monitor-after')assert.equal(h.sheets.get('DEV Publisher Events').values.length,3);
});
test('independent target readback corruption blocks monitoring success without repeating target write',()=>{
 const h=harness();h.corruptVerification();assert.throws(()=>h.run(),/changed/);assert.equal(h.counts().targetWrites,1);
 const state=JSON.parse(h.sheets.get('DEV Publisher State').values[1][0]);assert.equal(state.status,'Failed');assert.equal(state.lastSuccess,'');assert.equal(state.stage,'readback');
});
test('wrong DEV target is rejected before opening a workbook or provisioning',()=>{
 const h=harness();h.setDb('production');assert.throws(()=>h.run(),/fixed publisher DEV/);assert.equal(h.counts().targetWrites,0);assert.equal(h.counts().monitorWrites,0);assert.equal(h.counts().locked,false);
});
test('unsealed, changed and zero-audience packages block before monitor provisioning or publication',()=>{
 for(const mutate of [h=>h.sheets.get('Packages').values[1][1]='DRAFT',h=>h.sheets.get('Package Chunks').values[1][2]=h.sheets.get('Package Chunks').values[1][2].replace('2026-10-07','2026-10-08'),h=>{
   const p=clone(h.pkg);p.expected_profile_count=0;const raw=h.c.adbPublisherCanonical_(p);h.sheets.get('Package Chunks').values[1][2]=raw;h.sheets.get('Packages').values[1][3]=h.c.adbPublisherDigest_(raw);
 }]){
   const h=harness();mutate(h);
   assert.throws(()=>h.run());assert.equal(h.counts().targetWrites,0);assert(!h.sheets.has('DEV Publisher State'));
 }
});
test('monitor namespaces are fixed and unsupported purpose cannot redirect writes',()=>{
 const c=runtime();assert.equal(c.adbDevMonitorConfig_('publisher').STATE,'DEV Publisher State');assert.equal(c.adbDevMonitorConfig_().STATE,'DEV Monitor State');
 assert.throws(()=>c.adbDevMonitorConfig_('production'),/namespace/);
});
function e2eOptions(extra={}){return {bundle:fs.readFileSync('apps-script/EditorialPublisherEndToEndQa.gs','utf8'),pkg:JSON.parse(fs.readFileSync('tests/fixtures/editorial-publisher-e2e.json','utf8')),packageId:'E2E-2026-10-28',email:'publisher-qa@example.invalid',blankProperties:true,forbidSpreadsheetReads:true,...extra};}
test('generated single-file E2E bundle boots a blank bound project, commits once and reconciles lost monitor response',()=>{
 const h=harness(undefined,e2eOptions());h.c.runPublisherDevEndToEndQaV1();
 assert.equal(h.logs[0].result,'PASS');assert.equal(h.logs[0].lostMonitorResponseInjected,true);
 assert.deepEqual(h.logs[0].publicationResults,['COMMITTED','ALREADY_COMMITTED']);assert.equal(h.logs[0].monitorEvents,2);
 assert.equal(h.counts().targetWrites,1);assert.equal(h.counts().monitorWrites,2);
 h.c.runPublisherDevEndToEndQaV1();assert.equal(h.logs[1].result,'PASS');assert.equal(h.logs[1].lostMonitorResponseInjected,false);
 assert.equal(h.counts().targetWrites,1);assert.equal(h.counts().monitorWrites,2);
});
test('generated E2E bundle rejects the original DEV or production project before setup',()=>{
 for(const activeId of ['1I9UAR6kabPt0P_lvDiJX_oskPeCVcVI64_vTbwEOF2I','1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0']){
   const h=harness(undefined,e2eOptions({activeId}));assert.throws(()=>h.c.runPublisherDevEndToEndQaV1(),/bound to the isolated/);
   assert.equal(h.counts().targetWrites,0);assert.equal(h.counts().monitorWrites,0);
 }
});
test('generated E2E bundle source manifest and core source pin match the reviewed sources',()=>{
 const manifest=JSON.parse(fs.readFileSync('docs/editorial-publisher-e2e-source-manifest.json','utf8'));
 for(const entry of manifest.sources)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(entry.path)).digest('hex'),entry.sha256);
 assert.equal(manifest.core_revision,e2eOptions().pkg.source_revision);
 assert.equal(manifest.database,'1XZCcNUCSkCU68HY9DMgjbyKgQRXDGkVjf0Q3uz1QXrY');
 const c=runtime(e2eOptions().bundle);
 assert.equal(crypto.createHash('sha256').update(c.adbPublisherCanonical_(e2eOptions().pkg)).digest('hex'),'8dc4fa15873a7c35b10fb6a6b86fadbfcb702961bca31748f668aa1e4ca8a1b8');
});
