const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('apps-script/NativeSignupProd.gs','utf8');
const PROD_DB = '1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0';
const PROD_INTAKE = '1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho';

class Sheet {
  constructor(name, rows){ this.name=name; this.rows=rows.map(r=>r.slice()); }
  getName(){ return this.name; }
  appendRow(row){ this.rows.push(row.slice()); }
  setFrozenRows(){}
  getDataRange(){ return {
    getValues:()=>this.rows.map(r=>r.slice()),
    getDisplayValues:()=>this.rows.map(r=>r.map(v=>v instanceof Date?v.toISOString():String(v??'')))
  }; }
  getRange(row,col,numRows=1,numCols=1){ return {
    getDisplayValues:()=>{
      const out=[];
      for(let r=0;r<numRows;r++){
        const src=this.rows[row-1+r]||[];
        out.push(Array.from({length:numCols},(_,i)=>String(src[col-1+i]??'')));
      }
      return out;
    }
  }; }
}
class Book {
  constructor(id,sheets){ this.id=id; this.sheets=new Map(Object.entries(sheets).map(([k,v])=>[k,new Sheet(k,v)])); }
  getId(){ return this.id; }
  getSheetByName(name){ return this.sheets.get(name)||null; }
  insertSheet(name){ const s=new Sheet(name,[]); this.sheets.set(name,s); return s; }
}
function signedDigest(buf){ return Array.from(buf,b=>b>127?b-256:b); }

function runtime(opts={}){
  const props=Object.assign({
    ADB_NATIVE_SIGNUP_PROD_ENABLED:'TRUE',
    ADB_NATIVE_SIGNUP_PROD_MODE:'CONTROLLED',
    ADB_NATIVE_SIGNUP_PROD_ALLOWLIST:'control@example.com',
    ADB_NATIVE_SIGNUP_PROD_SITE_ORIGIN:'https://austindailybriefing.com'
  },opts.props||{});

  const db=new Book(PROD_DB,{
    Environment:[
      ['Setting','Value','Notes'],
      ['Environment','PRODUCTION',''],
      ['Database ID',PROD_DB,''],
      ['Development Database ID','1rl5GTOvuBSHyFK1r9CqI_6Z5gAwtgsTQnQQf9VCMeyM',''],
      ['Production Writes','ENABLED',''],
      ['Schema Baseline','GOOGLE-23-1','']
    ]
  });
  const intake=new Book(PROD_INTAKE,{
    'Integration Config':[
      ['Setting','Value','Status','Notes'],
      ['Environment','PRODUCTION','',''],
      ['Operational Production Database ID',PROD_DB,'',''],
      ['Processor Mode',opts.processorMode||'GOOGLE + NATIVE','',''],
      ['Native Signup Mode',opts.signupMode||'CONTROLLED','',''],
      ['Native Signup Controlled Email',opts.controlledEmail !== undefined ? opts.controlledEmail : 'control@example.com','','']
    ],
    'Native Signup Requests':[
      ['Request ID','Created At','Email','Consent','Source','Client Nonce','Response Key','Status','Processed At','Result','Notes']
    ],
    'Native Signup Diagnostics':[
      ['Event At','Event','Reason','Email Hash Prefix','Request ID','Client Nonce','Source','Build','Notes']
    ]
  });
  const cache=new Map();
  let uuid=0;
  const context={
    console:{log(){},error(){}},
    Date,JSON,Math,Object,RegExp,String,Number,Array,Error,
    LockService:{getScriptLock(){return{waitLock(){},releaseLock(){}};}},
    SpreadsheetApp:{openById(id){
      if(id===PROD_DB)return db;
      if(id===PROD_INTAKE)return intake;
      throw new Error('unexpected id '+id);
    },flush(){}},
    CacheService:{getScriptCache(){return{
      get:k=>cache.has(k)?cache.get(k):null,
      put:(k,v)=>cache.set(k,String(v))
    };}},
    PropertiesService:{getScriptProperties(){return{getProperty:k=>props[k]||null};}},
    Utilities:{
      DigestAlgorithm:{SHA_256:'SHA_256'},
      Charset:{UTF_8:'UTF_8'},
      computeDigest(_a,text){return signedDigest(crypto.createHash('sha256').update(String(text),'utf8').digest());},
      base64EncodeWebSafe(bytes){return Buffer.from(bytes.map(b=>b<0?b+256:b)).toString('base64url');},
      getUuid(){uuid++;return '00000000-0000-4000-8000-'+String(uuid).padStart(12,'0');}
    },
    HtmlService:{XFrameOptionsMode:{ALLOWALL:'ALLOWALL'},createHtmlOutput(html){return{html,setXFrameOptionsMode(){return this;}};}}
  };
  vm.createContext(context);
  vm.runInContext(source,context,{filename:'apps-script/NativeSignupProd.gs'});
  return {context,db,intake};
}
function event(email,nonce='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',extra={}){
  return {parameter:Object.assign({
    action:'request',source:'website',email,consent:'yes',client_nonce:nonce,form_check:''
  },extra),postData:{length:200}};
}
function requestRows(intake){ return intake.getSheetByName('Native Signup Requests').rows; }
function diagRows(intake){ return intake.getSheetByName('Native Signup Diagnostics').rows; }

(function controlledAuthorizedStages(){
  const {context,intake}=runtime();
  context.doPost(event('control@example.com'));
  assert.strictEqual(requestRows(intake).length,2);
  const row=requestRows(intake)[1];
  assert.strictEqual(row[2],'control@example.com');
  assert.strictEqual(row[4],'NATIVE_SIGNUP_PROD');
  assert.strictEqual(row[7],'Staged');
  assert(/^NSPROD-/.test(row[0]));
  assert(/^[A-Za-z0-9_-]{43}$/.test(row[6]));
})();

(function emailValidationAllowsLetterS(){
  const {context,intake}=runtime({
    props:{ADB_NATIVE_SIGNUP_PROD_ALLOWLIST:'stress@example.com'},
    controlledEmail:'stress@example.com'
  });
  assert.strictEqual(context.adbSignupProdValidEmail_('stress@example.com'),true);
  assert.strictEqual(context.adbSignupProdValidEmail_('stress @example.com'),false);
  context.doPost(event('stress@example.com'));
  assert.strictEqual(requestRows(intake).length,2);
  assert.strictEqual(requestRows(intake)[1][2],'stress@example.com');
})();

(function controlledUnauthorizedGenericNoop(){
  const {context,intake}=runtime();
  context.doPost(event('other@example.com'));
  assert.strictEqual(requestRows(intake).length,1);
  assert(diagRows(intake).some(r=>r[1]==='noop'&&r[2]==='controlled_not_authorized'));
})();

(function sameNonceAndEquivalentSuppressDuplicates(){
  const {context,intake}=runtime();
  context.doPost(event('control@example.com'));
  context.doPost(event('control@example.com'));
  context.doPost(event('control@example.com','bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'));
  assert.strictEqual(requestRows(intake).length,2);
  assert(diagRows(intake).some(r=>r[2]==='same_nonce'));
  assert(diagRows(intake).some(r=>r[2]==='recent_equivalent'));
})();

(function liveRequiresLiveConfig(){
  const ok=runtime({props:{ADB_NATIVE_SIGNUP_PROD_MODE:'LIVE'},signupMode:'LIVE'});
  ok.context.doPost(event('anyone@example.com'));
  assert.strictEqual(requestRows(ok.intake).length,2);

  const bad=runtime({props:{ADB_NATIVE_SIGNUP_PROD_MODE:'LIVE'},signupMode:'CONTROLLED'});
  assert.throws(()=>bad.context.doPost(event('control@example.com')),/Native Signup Mode = LIVE/);
})();

(function disabledPropertyBlocks(){
  const {context}=runtime({props:{ADB_NATIVE_SIGNUP_PROD_ENABLED:'FALSE'}});
  assert.throws(()=>context.doPost(event('control@example.com')),/endpoint is disabled/);
})();

(function sharedModeMustStayNativeCapable(){
  const {context}=runtime({processorMode:'GOOGLE ONLY'});
  assert.throws(()=>context.doPost(event('control@example.com')),/native-capable shared Processor Mode/);
})();

(function honeypotNoops(){
  const {context,intake}=runtime();
  context.doPost(event('control@example.com','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',{form_check:'filled'}));
  assert.strictEqual(requestRows(intake).length,1);
  assert(diagRows(intake).some(r=>r[2]==='honeypot'));
})();

(function validationNoStaging(){
  const cases=[
    event('bad'),
    event('control@example.com','short'),
    event('control@example.com','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',{consent:''}),
    event('control@example.com','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',{source:'other'})
  ];
  for(const e of cases){
    const {context,intake}=runtime();
    context.doPost(e);
    assert.strictEqual(requestRows(intake).length,1);
  }
})();

(function sourceDoesNotMutateSubscriberDb(){
  const {context,db}=runtime();
  const before=JSON.stringify([...db.sheets.entries()].map(([k,s])=>[k,s.rows]));
  context.doPost(event('control@example.com'));
  const after=JSON.stringify([...db.sheets.entries()].map(([k,s])=>[k,s.rows]));
  assert.strictEqual(after,before);
})();

(function devCollisionGuardPresent(){
  assert(source.includes("FORBIDDEN_DEV_INTAKE_ID"));
  assert(source.includes("FORBIDDEN_DEV_DATABASE_ID"));
  assert(source.includes("Production native signup target collided with DEV."));
})();

(function disabledPreflightPasses(){
  const {context}=runtime({
    props:{
      ADB_NATIVE_SIGNUP_PROD_ENABLED:'FALSE',
      ADB_NATIVE_SIGNUP_PROD_MODE:'CONTROLLED',
      ADB_NATIVE_SIGNUP_PROD_ALLOWLIST:'',
      ADB_NATIVE_SIGNUP_PROD_SITE_ORIGIN:'https://austindailybriefing.com'
    },
    signupMode:'DISABLED',
    controlledEmail:''
  });
  const report=context.validateNativeSignupProdPreflightV1();
  assert.strictEqual(report.endpointEnabled,false);
  assert.strictEqual(report.endpointMode,'CONTROLLED');
  assert.strictEqual(report.nativeSignupMode,'DISABLED');
  assert.strictEqual(report.processorMode,'GOOGLE + NATIVE');
  assert.strictEqual(report.requestRows,0);
  assert.strictEqual(report.diagnosticRows,0);
  assert.strictEqual(report.subscriberMutation,false);
})();

console.log('Native signup Gate D production endpoint QA passed.');
