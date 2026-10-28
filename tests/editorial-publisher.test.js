'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),cp=require('node:child_process');
const ctx=vm.createContext({Intl});
for(const file of ['scripts/daily_newsletter_renderer.js','apps-script/DailyNewsletterContract.gs','apps-script/SelectionEvidenceContract.gs','apps-script/EditorialPublisher.gs'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const C=vm.runInContext('ADB_PUBLISHER',ctx),clone=v=>JSON.parse(JSON.stringify(v));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const fixture=JSON.parse(cp.execFileSync('python',['tests/publisher-fixture.py'],{encoding:'utf8'}));
function sample(){
 const pkg=clone(fixture),state={environment:'DEVELOPMENT',externalDelivery:'FALSE',sourceRevision:pkg.source_revision,queueHeaders:clone(C.QUEUE),historyHeaders:clone(C.HISTORY),ledgerHeaders:clone(C.LEDGER),queue:[],history:[],ledger:[],subscribers:[{'Profile ID':'SYNTHETIC',Email:'synthetic@example.org',Status:'Active','Admin Status':'OK'}],profiles:[{'Profile ID':'SYNTHETIC',Status:'Active','Primary Preference Email':'synthetic@example.org'}],templates:[{'Template ID':'DAILY_BRIEFING_V1',Status:'Active',Environment:'DEVELOPMENT'}],personalization:clone(pkg.selection_bundle.profiles),publishedHistory:[],manageUrl:'https://example.org/manage'};
 return {pkg,state,clock:{iso:'2026-10-07T13:01:00Z',editionDate:'2026-10-07'}};
}
function plan(x){return clone(ctx.adbPlanEditorialPublication(x.pkg,x.state,x.clock,sha));}
function mutateNote(x,fn){const r=x.pkg.selection_bundle.rows[0],n=JSON.parse(r.notes.slice('ADB-SELECTION-NOTE-1 '.length));fn(n);r.notes='ADB-SELECTION-NOTE-1 '+JSON.stringify(n);}
test('renders canonical payloads and constructs exact queue/history columns and suffix',()=>{
 const x=sample(),p=plan(x);assert.equal(p.result,'READY');assert.equal(p.queue.length,1);assert.equal(p.history.length,6);const q=p.queue[0];assert.equal(q.Status,'Queued');assert.equal(q['Template ID'],'DAILY_BRIEFING_V1');assert.equal(q['Message ID'],'DAILY-LIVE:SYNTHETIC:2026-10-07-publisher-v1');
 assert.equal(q.HTML,ctx.adbRenderDailyNewsletter(x.pkg.editions[0].editorial).html);assert.deepEqual(Object.keys(q).sort(),clone(C.QUEUE).sort());
 for(const h of p.history){assert.equal(h['Delivery Status'],'Pending');assert.equal(h['Provider Message ID'],'');assert(h.Notes.endsWith(C.SUFFIX));assert.deepEqual(Object.keys(h).sort(),clone(C.HISTORY).sort());JSON.parse(h.Notes.slice('ADB-SELECTION-NOTE-1 '.length,-C.SUFFIX.length));}
 assert.equal(plan(x).digest,p.digest);
});
test('committed exact replay reconciles without appending; modified package conflicts',()=>{
 const x=sample(),p=plan(x);x.state.queue=p.queue;x.state.history=p.history;x.state.ledger=[p.ledger];assert.equal(plan(x).result,'ALREADY_COMMITTED');x.pkg.editions[0].editorial.preheader+=' changed';assert.throws(()=>plan(x),/different package/);
});
test('readback detects changed persisted payload or stripped suffix',()=>{
 for(const mutate of [x=>x.state.queue[0].HTML+='x',x=>x.state.history[0].Notes=x.state.history[0].Notes.slice(0,-1)]){
 const x=sample(),p=plan(x);Object.assign(x.state,{queue:p.queue,history:p.history,ledger:[p.ledger]});mutate(x);assert.throws(()=>plan(x),/changed/);}
});
test('partial interrupted state is never repaired or duplicated',()=>{
 for(const table of ['queue','history']){const x=sample(),p=plan(x);x.state[table]=p[table];assert.throws(()=>plan(x),/partial prior/);}
});
test('zero eligible audience returns intentional no-op without queue/history carriers',()=>{
 const x=sample();x.state.subscribers=[];x.pkg.expected_profile_count=0;x.pkg.editions=[];x.pkg.selection_bundle.profiles={};x.pkg.selection_bundle.rows=[];assert.equal(plan(x).result,'NO_ELIGIBLE_PROFILES');
});
const failures={
 'queue schema drift':x=>x.state.queueHeaders[5]='Delivery Status',
 'history schema drift':x=>x.state.historyHeaders.reverse(),
 'production target':x=>x.state.environment='PRODUCTION',
 'external delivery enabled':x=>x.state.externalDelivery='TRUE',
 'stale source':x=>x.pkg.source_revision='a'.repeat(40),
 'stale day':x=>x.clock.editionDate='2026-10-08',
 'wrong expected count':x=>x.pkg.expected_profile_count=2,
 'unsubscribed recipient':x=>x.state.subscribers[0].Status='Unsubscribed',
 'admin hold':x=>x.state.subscribers[0]['Admin Status']='Hold',
 'ambiguous subscriber':x=>x.state.subscribers.push(clone(x.state.subscribers[0])),
 'ambiguous profile':x=>x.state.profiles.push(clone(x.state.profiles[0])),
 'changed preferences':x=>x.state.personalization.SYNTHETIC.preferences.TEST_INTEREST='Off',
 'template mismatch':x=>x.state.templates[0]['Template ID']='daily-briefing-v0.1',
 'operational field injection':x=>x.pkg.Status='Pending',
 'missing item binding':x=>x.pkg.editions[0].bindings.pop(),
 'wrong rendered source':x=>x.pkg.editions[0].editorial.featured.sources[0].url='https://example.org/unapproved',
 'missing context':x=>mutateNote(x,n=>delete n.context),
 'missing history proof':x=>x.pkg.selection_bundle.history_complete=false,
 'missing suffix input prohibited':x=>x.pkg.selection_bundle.rows[0].notes+=C.SUFFIX,
 'missing note evidence':x=>x.pkg.selection_bundle.rows[0].notes='ordinary prose',
 'source after cutoff':x=>mutateNote(x,n=>n.candidate.sources[0].accessed_at='2026-10-07T09:00:00-05:00'),
 'early recap':x=>x.pkg.editions[0].editorial.fridayRecap=[{text:'Unapproved recap',sources:[{publisher:'QA',url:'https://example.org/'}]}],
 'unapproved notice':x=>x.pkg.editions[0].editorial.whatsNew={headline:'QA',copy:'Unapproved'},
};
for(const [name,mutate] of Object.entries(failures))test('rejects '+name,()=>{const x=sample();mutate(x);assert.throws(()=>plan(x));});
test('atomic adapter appends queue, history and ledger in one Sheets request; no sends',()=>{
 const source=fs.readFileSync('apps-script/EditorialPublisher.gs','utf8');assert.equal((source.match(/Sheets\.Spreadsheets\.batchUpdate\(/g)||[]).length,1);assert(!/MailApp|GmailApp|api\.resend|adbSendEmailViaResend_|newTrigger/.test(source));assert(source.includes("append('Publisher Ledger'"));
});
test('Apps Script adapter commits atomically, reads back and safely reconciles a lost response',()=>{
 for(const lostResponse of [false,true]){
  const x=sample(),sandbox=vm.createContext({Intl});
  for(const file of ['scripts/daily_newsletter_renderer.js','apps-script/DailyNewsletterContract.gs','apps-script/SelectionEvidenceContract.gs','apps-script/EditorialPublisher.gs'])vm.runInContext(fs.readFileSync(file,'utf8'),sandbox);
  const canonical=sandbox.adbPublisherCanonical_(x.pkg),manifest={'Package ID':'QA','State':'READY','Chunk Count':'1','Package SHA-256':sha(canonical)},chunks=[{'Package ID':'QA',Sequence:'1',JSON:JSON.stringify(x.pkg)}];
  x.state.tables={'Outbound Messages':{sheetId:1},'Briefing History':{sheetId:2},'Publisher Ledger':{sheetId:3}};
  let calls=0,locks=0;
  sandbox.adbPublisherState_=()=>clone(x.state);
  sandbox.adbPublisherTable_=(book,name)=>({rows:clone(name==='Packages'?[manifest]:chunks)});
  sandbox.PropertiesService={getScriptProperties:()=>({getProperty:()=> 'QA-DEV-DB'})};
  sandbox.SpreadsheetApp={openById:id=>{assert.equal(id,'QA-DEV-DB');return {};}};
  sandbox.LockService={getScriptLock:()=>({waitLock:()=>locks++,releaseLock:()=>locks--})};
  sandbox.Date=class extends Date {constructor(...args){super(...(args.length?args:['2026-10-07T13:01:00Z']));}};
  sandbox.Utilities={DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(alg,s)=>Array.from(crypto.createHash('sha256').update(s).digest()),formatDate:()=>x.clock.editionDate,newBlob:s=>({getBytes:()=>Buffer.from(s)})};
  sandbox.Sheets={Spreadsheets:{batchUpdate:(request,id)=>{
   calls++;assert.equal(id,'QA-DEV-DB');assert.equal(request.requests.length,3);
   const targets=[['queue',C.QUEUE],['history',C.HISTORY],['ledger',C.LEDGER]];
   request.requests.forEach((req,i)=>{const [name,headers]=targets[i];assert.equal(req.appendCells.sheetId,i+1);x.state[name].push(...req.appendCells.rows.map(r=>Object.fromEntries(headers.map((h,j)=>[h,r.values[j].userEnteredValue.stringValue??r.values[j].userEnteredValue.numberValue]))));});
   if(lostResponse)throw Error('simulated response lost after atomic server commit');
  }}};
  if(lostResponse)assert.throws(()=>sandbox.publishReadyEditorialPackageDevV1('QA'),/response lost/);
  else assert.equal(sandbox.publishReadyEditorialPackageDevV1('QA').result,'COMMITTED');
  assert.equal(sandbox.publishReadyEditorialPackageDevV1('QA').result,'ALREADY_COMMITTED');assert.equal(calls,1);assert.equal(locks,0);assert.equal(x.state.queue.length,1);assert.equal(x.state.history.length,6);
 }
});
module.exports={sample,plan};
