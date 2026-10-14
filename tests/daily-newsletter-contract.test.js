/* Regression tests for ADB-DAILY-HTML-1.0; run with node --test. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const approved = read('design/newsletter-renderer-qa.html');
const approvedText = read('design/newsletter-renderer-qa.txt');
const contract = read('apps-script/DailyNewsletterContract.gs');
const transport = read('apps-script/ResendTransport.gs');
function validate(html) {
  const sandbox = vm.createContext({});
  vm.runInContext(contract,sandbox);
  return sandbox.adbValidateDailyNewsletterHtml_(html);
}
function rejected(html, pattern) {
  assert.throws(()=>validate(html),pattern);
}
function removeSection(source, label, next) {
  const a = source.lastIndexOf('<div class="major"', source.indexOf('>' + label + '<'));
  const b = source.lastIndexOf('<div class="major"', source.indexOf('>' + next + '<'));
  assert(a >= 0 && b > a, 'fixture must include both section boundaries');
  return source.slice(0,a)+source.slice(b);
}
test('approved component QA reference passes actual HTML contract', () => {
  const result=validate(approved);
  assert.equal(result.contract,'ADB-DAILY-HTML-1.0');
  assert(result.standardStories>0);
});
test('optional Under the Radar can be omitted without filler',()=>{
  validate(removeSection(approved,'UNDER THE RADAR','MORE FOR YOU'));
});
test('optional More for You can be omitted without filler',()=>{
  validate(removeSection(approved,'MORE FOR YOU','AUSTIN AHEAD'));
});
test('rejects an editorial section before masthead (Oct 14 failure mode)',()=>{
  rejected('<div>FEATURED TOP STORY</div>'+approved,/Wrong component order|outside reading frame/);
});
test('rejects missing reading frame / outer warm panel',()=>{
  rejected(approved.replace('max-width:620px;background:#fffefa','max-width:920px;background:#ece8df'),
    /reading frame/);
});
test('rejects centered story body (Oct 14 failure mode)',()=>{
  rejected(approved.replace('class="content-pad" style="padding:0 34px;',
    'class="content-pad" align="center" style="padding:0 34px;'),/Centered editorial/);
});
test('rejects generic sans-serif headline',()=>{
  rejected(approved.replace("font-family:Georgia,'Times New Roman',serif;font-size:31px",
    'font-family:Arial,sans-serif;font-size:31px'),/Georgia serif/);
});
test('rejects noncanonical publisher link styling',()=>{
  rejected(approved.replace(/color:#8f1717/g,'color:#1f2933'),/Source links/);
});
test('rejects dropped Why It Matters sections',()=>{
  rejected(approved.replace(/WHY IT MATTERS/g,'WHY NOT'),/Why It Matters/);
});
test('rejects a single unattributed Top Story even when other stories have enough links',()=>{
  const marker = '>TOP STORIES<';
  const cut = approved.indexOf(marker);
  const before = approved.slice(0,cut);
  const after = approved.slice(cut).replace(/Source:\s*KUT\s*90\.5\s*→/,'Unattributed publication');
  rejected(before + after,/Standard Top Story 1 must independently contain a named source/);
});
test('rejects missing Why It Matters on only one shared story',()=>{
  const cut = approved.indexOf('>TOP STORIES<');
  const prefix = approved.slice(0,cut);
  const suffix = approved.slice(cut).replace('>WHY IT MATTERS<','>EDITOR NOTE<');
  rejected(prefix + suffix,/Standard Top Story 1 must independently contain/);
});
test('rejects missing source links',()=>{
  rejected(approved.replace(/Source:/g,'Unattributed:'),/publisher source links/);
});
test('shared dispatcher contract rejects text/HTML URL mismatch',()=>{
  const sandbox=vm.createContext({});
  vm.runInContext(contract,sandbox);
  assert.throws(()=>sandbox.adbValidateDailyNewsletterPayload_(approved,
    approvedText.replace(/https:\/\/www\.kut\.org\//g,'https://example.invalid/')),/destination order mismatch/);
  assert.equal(sandbox.adbValidateDailyNewsletterPayload_(approved,approvedText).contract,
    'ADB-DAILY-HTML-1.0');
});
test('rejects stale/absent native Customize destination',()=>{
  rejected(approved.replace(/https:\/\/austindailybriefing\.com\/customize\.html/g,
    'https://old.example/customize'),/Native Customize/);
});
test('rejects missing edition date',()=>{
  rejected(approved.replace('SUNDAY · SEPTEMBER 20, 2026',''),/Edition date missing/);
});
test('rejects missing required Top Stories heading',()=>{
  rejected(approved.replace('>TOP STORIES<','>NEWS<'),/Required component missing/);
});
test('rejects missing footer mark',()=>{
  rejected(approved.replace('adb-mark-reversed@2x.png','not-the-footer.png'),/footer mark/);
});

function simulateDispatch(htmlBodies, withContract=true) {
  const sent=[], writes=[];
  const profiles=htmlBodies.map((h,i)=>({
    email:'test'+i+'@example.org',profile:'P'+(i+1),run:'RUN-'+(i+1),
    html:h
  }));
  const columns={
    queue:['Message ID','Profile ID','Email','Template ID','Status','Subject',
      'Sent At / Gmail ID','Notes','Plain Text','HTML','Run ID'],
    history:['Run ID','Profile ID','Notes','Delivery Status','Provider Message ID']
  };
  const queue=profiles.map((p,i)=>({sheetRow:i+2,values:{
    'Message ID':'DAILY-LIVE:'+p.profile+':'+p.run,
    'Profile ID':p.profile,Email:p.email,'Template ID':'DAILY_BRIEFING_V1',
    Status:'Queued',Subject:'Test', 'Sent At / Gmail ID':'',Notes:'',
    'Plain Text':approvedText,HTML:p.html,'Run ID':p.run
  }}));
  const history=profiles.map((p,i)=>({sheetRow:i+2,values:{
    'Run ID':p.run,'Profile ID':p.profile,Notes:'Original evidence',
    'Delivery Status':'Pending','Provider Message ID':''
  }}));
  const sheet=name=>({
    name,
    getRange(row,col) {
      return {setValue(value) {
        const collection=name==='Outbound Messages'?queue:history;
        const names=name==='Outbound Messages'?columns.queue:columns.history;
        const entry=collection.find(e=>e.sheetRow===row);
        assert(entry,'write target exists');
        entry.values[names[col-1]]=value;
        writes.push({name,row,key:names[col-1],value});
      }};
    }
  });
  const context=vm.createContext({
    LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
    PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'LIVE'})},
    SpreadsheetApp:{openById:()=>({getSheetByName:sheet})},
    Logger:{log(){}},Set,Date,JSON
  });
  vm.runInContext(transport,context);
  if(withContract) vm.runInContext(contract,context);
  context.adbValidateDailyDeliveryGates_=()=>true;
  context.adbRowsByHeader_=()=>({rows:[
    {'Template ID':'DAILY_BRIEFING_V1',Active:'TRUE',Environment:'PRODUCTION'}
  ]});
  context.adbRowsWithSheetRows_=s=>{
    if(s.name==='Subscribers') return {headers:['Admin Status'],
      rows:profiles.map((p,i)=>({sheetRow:i+2,values:{Email:p.email,'Profile ID':p.profile}}))};
    if(s.name==='Outbound Messages')return {headers:columns.queue,rows:queue};
    if(s.name==='Briefing History')return {headers:columns.history,rows:history};
    throw Error('unexpected sheet '+s.name);
  };
  context.adbResendRequireAdminStatusHeader_=()=>{};
  context.adbResendIndexProfiles_=()=>({});
  context.adbResendSubscriberEligible_=()=>true;
  context.adbHeaderColumns_=headers=>Object.fromEntries(headers.map((h,i)=>[h,i+1]));
  context.adbSendEmailViaResend_=payload=>{sent.push(payload);return {id:'test-id'};};
  let result,error;
  try { result=context.dispatchQueuedDailyBriefingsViaResendV1(); }
  catch(e){ error=e; }
  return {sent,writes,queue,history,result,error};
}
test('production dispatcher validates and sends an approved queued payload',()=>{
  const run=simulateDispatch([approved]);
  if(run.error) throw run.error;
  assert.equal(run.sent.length,1);
  assert.equal(run.queue[0].values.Status,'Sent');
  assert.equal(run.history[0].values['Delivery Status'],'Sent');
});
test('one invalid profile blocks entire batch before any provider call',()=>{
  const run=simulateDispatch([approved,approved.replace(/color:#8f1717/g,'color:#1f2933')]);
  assert(run.error);
  assert.match(String(run.error),/contract rejected/);
  assert.equal(run.sent.length,0);
  assert.equal(run.queue[0].values.Status,'Failed');
  assert.equal(run.history[0].values['Delivery Status'],'Failed');
  assert.equal(run.queue[1].values.Status,'Failed');
  assert.equal(run.history[1].values['Delivery Status'],'Failed');
  assert.equal(run.history[1].values['Provider Message ID'],'');
});
test('missing deployed contract aborts without mutating queue or sending',()=>{
  const run=simulateDispatch([approved],false);
  assert.match(String(run.error),/Missing DailyNewsletterContract/);
  assert.equal(run.sent.length,0);
  assert.equal(run.writes.length,0);
});

test('one invalid text payload also blocks every queued recipient',()=>{
  const malformed = approved.replace('https://www.kut.org/', 'https://another.example.org/');
  const run=simulateDispatch([approved,malformed]);
  assert(run.error);
  assert.equal(run.sent.length,0);
  assert.equal(run.queue[0].values.Status,'Failed');
  assert.equal(run.queue[1].values.Status,'Failed');
});
