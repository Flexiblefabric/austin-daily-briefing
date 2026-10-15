'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const validator=read('apps-script/DailyNewsletterContract.gs');
const qa=read('apps-script/DailyNewsletterDeliveryQa.gs');
const html=read('tests/fixtures/daily-newsletter-controlled-send.html');
const plain=read('tests/fixtures/daily-newsletter-controlled-send.txt');
function harness({approved=false,mode='STAGED',recipient='qa@example.org',badFixture=false}={}){
  const values={
    ADB_DAILY_LAYOUT_GUARD_MODE:mode,
    ADB_RESEND_TEST_RECIPIENT:recipient
  };
  if(approved) values.ADB_DAILY_LAYOUT_QA_SEND_APPROVAL='SEND_ONCE';
  const sent=[],changes=[];
  const scripts={
    getProperty(name){return values[name]||null;},
    deleteProperty(name){changes.push({name,op:'delete'});delete values[name];}
  };
  const env=vm.createContext({
    ADB_RESEND:{TEST_RECIPIENT_PROPERTY:'ADB_RESEND_TEST_RECIPIENT'},
    PropertiesService:{getScriptProperties:()=>scripts},
    LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
    UrlFetchApp:{fetch:(url)=>({
      getResponseCode:()=>200,
      getContentText:()=>url.endsWith('.html')?(badFixture?html.replace('CONTROLLED QA ONLY',''):html):plain
    })},
    Logger:{log(){}},
    adbSendEmailViaResend_:(value)=>{
      sent.push(value);
      assert.equal(values.ADB_DAILY_LAYOUT_QA_SEND_APPROVAL,undefined);
      return {id:'provider-id',statusCode:200};
    },
    String,Object,Array,JSON
  });
  vm.runInContext(validator,env);
  vm.runInContext(qa,env);
  return {env,sent,changes,values};
}
test('the frozen synthetic fixture passes exact live Apps Script validator',()=>{
  const h=harness();const result=h.env.previewAdbDailyLayoutQaV1();
  assert.equal(result.validation,'PASS');
  assert.equal(result.contract,'ADB-DAILY-HTML-1.0');
  assert.equal(result.queueWrites,0);
  assert.equal(result.providerSends,0);
  assert.equal(h.sent.length,0);
  assert.equal(h.changes.length,0);
});
test('send refuses to operate without one-time approval',()=>{
  const h=harness();
  assert.throws(()=>h.env.sendAdbDailyLayoutQaV1(),/not approved/);
  assert.equal(h.sent.length,0);
});
test('one-time approval allows only exact configured QA mailbox',()=>{
  const h=harness({approved:true});
  const result=h.env.sendAdbDailyLayoutQaV1();
  assert.equal(result.accepted,200);
  assert.equal(result.recipientCount,1);
  assert.equal(h.sent.length,1);
  assert.equal(h.sent[0].to,'qa@example.org');
  assert(h.sent[0].subject.includes('QA'));
  assert(h.sent[0].html.includes('CONTROLLED QA ONLY'));
  assert.equal(h.sent[0].idempotencyKey.startsWith('adb-daily-layout-qa-'),true);
  assert.equal(h.changes.length,1);
  assert.throws(()=>h.env.sendAdbDailyLayoutQaV1(),/not approved/);
  assert.equal(h.sent.length,1);
});
test('guard must still be STAGED during controlled inbox QA',()=>{
  const h=harness({approved:true,mode:'ENFORCE'});
  assert.throws(()=>h.env.sendAdbDailyLayoutQaV1(),/requires.*STAGED/);
  assert.equal(h.sent.length,0);
});
test('a missing test-only recipient fails before external handoff',()=>{
  const h=harness({approved:true,recipient:''});
  assert.throws(()=>h.env.sendAdbDailyLayoutQaV1(),/Configure one email/);
  assert.equal(h.sent.length,0);
});
test('missing synthetic fixture banner blocks sending',()=>{
  const h=harness({approved:true,badFixture:true});
  assert.throws(()=>h.env.sendAdbDailyLayoutQaV1(),/mandatory synthetic/);
  assert.equal(h.sent.length,0);
});
test('fixture urls are immutable SHA pinned not mutable main',()=>{
  assert.match(qa,/FIXTURE_COMMIT:\s*'[0-9a-f]{40}'/);
  assert(qa.includes("raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/"));
  assert(!/\/main\/tests\/fixtures\//.test(qa));
});
