const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const vm = require('vm');

const endpoint = fs.readFileSync('apps-script/NativeManagementDev.gs','utf8');
const processor = fs.readFileSync('apps-script/NativeManagementDevProcessor.gs','utf8');
const source = endpoint + '\n' + processor;

const DEV_DB = '1rl5GTOvuBSHyFK1r9CqI_6Z5gAwtgsTQnQQf9VCMeyM';
const DEV_INTAKE = '1TiSgmFxij8p3wKnt_skTFXQvAOEuR2wI5c6V8Jq_Yyw';

const interestIds = [
  'CIV01','CIV02','CIV03','CIV04','CIV05','CIV06',
  'CUL01','CUL02','CUL03','CUL04','CUL05','CUL06','CUL07',
  'TEC01','TEC02','TEC03','TEC04','TEC05',
  'LIF01','LIF02','LIF03','LIF04','LIF05'
];

function display(v) {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

class Sheet {
  constructor(name, rows) {
    this.name = name;
    this.rows = rows.map(row => row.slice());
  }
  getName() { return this.name; }
  getLastRow() { return this.rows.length; }
  getDataRange() {
    return {
      getDisplayValues: () => this.rows.map(row => row.map(display))
    };
  }
  getRange(row, col, numRows = 1, numCols = 1) {
    return {
      getDisplayValues: () => {
        const out = [];
        for (let r = 0; r < numRows; r++) {
          const src = this.rows[row - 1 + r] || [];
          out.push(Array.from({length:numCols}, (_, i) => display(src[col - 1 + i])));
        }
        return out;
      },
      setValues: values => {
        for (let r = 0; r < values.length; r++) {
          while (this.rows.length < row + r) this.rows.push([]);
          for (let c = 0; c < values[r].length; c++) {
            this.rows[row - 1 + r][col - 1 + c] = values[r][c];
          }
        }
      },
      setValue: value => {
        while (this.rows.length < row) this.rows.push([]);
        this.rows[row - 1][col - 1] = value;
      }
    };
  }
  appendRow(row) { this.rows.push(row.slice()); }
}

class Book {
  constructor(id, sheets) {
    this.id = id;
    this.sheets = new Map(Object.entries(sheets).map(([name, rows]) => [name, new Sheet(name, rows)]));
  }
  getSheetByName(name) { return this.sheets.get(name) || null; }
  insertSheet(name) {
    const sheet = new Sheet(name, []);
    this.sheets.set(name, sheet);
    return sheet;
  }
}

function sha256hex(value) {
  return crypto.createHash('sha256').update(String(value),'utf8').digest('hex');
}

function payloadHash(deliveryAction, resetTopics) {
  return sha256hex(JSON.stringify({
    delivery_action: deliveryAction,
    reset_topics: !!resetTopics
  }));
}

function baseFixture(opts = {}) {
  const email = opts.email || 'manage@example.com';
  const status = opts.status || 'Active';
  const profileStatus = opts.profileStatus || status;
  const requestId = opts.requestId || 'NMDEV-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const verificationId = opts.verificationId || 'NMVDEV-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const delivery = opts.delivery || 'pause';
  const reset = !!opts.reset;
  const hash = payloadHash(delivery, reset);

  const preferences = [
    ['Profile ID','Interest ID','Preference','Score','Updated','Source Submission ID','Profile ID'],
    ...interestIds.map((id, i) => [
      'PDEV900', id,
      opts.preferenceValue || (i % 2 ? 'High' : 'Off'),
      opts.preferenceValue === 'Normal' ? 1 : (i % 2 ? 2 : 0),
      'before','old-source','PDEV900'
    ])
  ];
  if (opts.duplicatePreference) {
    preferences.push(['PDEV900',interestIds[0],'High',2,'before','duplicate','PDEV900']);
  }

  const dbSheets = {
    'Subscribers': [
      ['Email','Status','Created','Updated','Notes','Profile ID','Preference Source Email','Admin Status'],
      [email,status,'old','old','fixture','PDEV900',email,'OK']
    ],
    'Profiles': [
      ['Profile ID','Status','Primary Preference Email','Latest Submission ID','Customize URL','Last Preference Update','Notes','More for You Volume','Summary Style','Why It Matters Length'],
      ['PDEV900',profileStatus,email,'old','https://example.test/customize','before','fixture','More','Explanatory','Detailed']
    ],
    'Preferences': preferences,
    'Interest Catalog': [
      ['Interest ID','Group','Interest','Default Preference','Default Scope','Active'],
      ...interestIds.map(id => [id,'Group',id,'Normal','Austin-first','TRUE'])
    ],
    'Management Actions': [
      ['Submission ID','Received At','Email','Action','Resolved Profile ID','Previous Status','New Status','Result','Processed At','Notes'],
      ...(opts.existingAction ? [[
        'NATIVE:MANAGE:' + requestId,'','','','PDEV900','','','','','fixture'
      ]] : [])
    ],
    'Environment': [
      ['Setting','Value','Notes'],
      ['Environment','DEVELOPMENT',''],
      ['Database ID',DEV_DB,''],
      ['Production Writes','FORBIDDEN','']
    ]
  };

  const intakeSheets = {
    'Native Manage Requests': [
      ['Request ID','Created At','Email','Delivery Action','Reset Topics','Payload SHA-256','Source','Client Nonce','Status','Verification ID','Confirmed At','Applied At','Result','Notes'],
      [requestId,'2026-10-06T20:00:00.000Z',email,delivery,reset ? 'TRUE' : 'FALSE',hash,'NATIVE_MANAGE_DEV','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','Confirmed',verificationId,'2026-10-06T20:01:00.000Z','','','fixture']
    ],
    'Native Manage Verification Queue': [
      ['Verification ID','Created At','Expires At','Email','Request ID','Token Hash SHA-256','Status','Confirmed At','Applied At','Notes'],
      [verificationId,'2026-10-06T20:00:00.000Z','2026-10-07T20:00:00.000Z',email,requestId,'f'.repeat(64),'Confirmed','2026-10-06T20:01:00.000Z','','fixture']
    ],
    'Native Manage Diagnostics': [
      ['Created At','Event','Reason','Email Hash Prefix','Client Nonce Present','Build ID']
    ]
  };

  return {dbSheets,intakeSheets,email,requestId,verificationId};
}

function makeRuntime(opts = {}) {
  const fixture = baseFixture(opts);
  const db = new Book(DEV_DB, fixture.dbSheets);
  const intake = new Book(DEV_INTAKE, fixture.intakeSheets);

  const context = {
    console:{log(){},error(){}},
    Date,
    JSON,
    Math,
    Object,
    RegExp,
    String,
    Number,
    Array,
    Error,
    SpreadsheetApp:{
      openById(id) {
        if (id === DEV_DB) return db;
        if (id === DEV_INTAKE) return intake;
        throw new Error('Unexpected workbook ID: ' + id);
      },
      flush(){}
    },
    Utilities:{
      DigestAlgorithm:{SHA_256:'SHA_256'},
      Charset:{UTF_8:'UTF_8'},
      computeDigest(_alg,value) {
        return Array.from(crypto.createHash('sha256').update(String(value),'utf8').digest())
          .map(x => x > 127 ? x - 256 : x);
      },
      getUuid(){ return '00000000-0000-4000-8000-000000000000'; },
      base64EncodeWebSafe(bytes){ return Buffer.from(bytes.map(x=>x<0?x+256:x)).toString('base64url'); }
    }
  };
  vm.createContext(context);
  vm.runInContext(source,context);
  return {context,db,intake,fixture};
}

function table(book, sheetName) {
  return book.getSheetByName(sheetName).rows;
}

function rowBy(book, sheetName, header, value) {
  const rows = table(book,sheetName);
  const col = rows[0].indexOf(header);
  return rows.slice(1).find(row => String(row[col] || '') === String(value));
}

(function pauseExactlyOnce(){
  const {context,db,intake,fixture}=makeRuntime({status:'Active',delivery:'pause'});
  let result=context.processConfirmedNativeManagementDevV1();
  assert.strictEqual(result.applied,1);
  assert.strictEqual(rowBy(db,'Subscribers','Email',fixture.email)[1],'Paused');
  assert.strictEqual(rowBy(db,'Profiles','Profile ID','PDEV900')[1],'Paused');
  assert.strictEqual(table(db,'Management Actions').length,2);
  assert.strictEqual(table(intake,'Native Manage Requests')[1][8],'Applied');
  assert.strictEqual(table(intake,'Native Manage Verification Queue')[1][6],'Applied');

  result=context.processConfirmedNativeManagementDevV1();
  assert.strictEqual(result.inspected,0);
  assert.strictEqual(table(db,'Management Actions').length,2);
})();

(function resumePaused(){
  const {context,db}=makeRuntime({status:'Paused',profileStatus:'Paused',delivery:'resume'});
  const result=context.processConfirmedNativeManagementDevV1();
  assert.strictEqual(result.applied,1);
  assert.strictEqual(rowBy(db,'Subscribers','Email','manage@example.com')[1],'Active');
  assert.strictEqual(rowBy(db,'Profiles','Profile ID','PDEV900')[1],'Active');
})();

(function adminHoldResumePreservesHold(){
  const {context,db}=makeRuntime({status:'Admin Hold',profileStatus:'Admin Hold',delivery:'resume'});
  const result=context.processConfirmedNativeManagementDevV1();
  assert.strictEqual(result.noChange,1);
  assert.strictEqual(rowBy(db,'Subscribers','Email','manage@example.com')[1],'Admin Hold');
  assert.strictEqual(rowBy(db,'Profiles','Profile ID','PDEV900')[1],'Admin Hold');
})();

(function adminHoldUnsubscribeHonorsWithdrawal(){
  const {context,db}=makeRuntime({status:'Admin Hold',profileStatus:'Admin Hold',delivery:'unsubscribe'});
  const result=context.processConfirmedNativeManagementDevV1();
  assert.strictEqual(result.applied,1);
  assert.strictEqual(rowBy(db,'Subscribers','Email','manage@example.com')[1],'Unsubscribed');
  assert.strictEqual(rowBy(db,'Profiles','Profile ID','PDEV900')[1],'Unsubscribed');
})();

(function unsubscribedResumeDoesNotResubscribe(){
  const {context,db}=makeRuntime({status:'Unsubscribed',profileStatus:'Unsubscribed',delivery:'resume'});
  const result=context.processConfirmedNativeManagementDevV1();
  assert.strictEqual(result.noChange,1);
  assert.strictEqual(rowBy(db,'Subscribers','Email','manage@example.com')[1],'Unsubscribed');
  assert.strictEqual(table(db,'Management Actions').length,2);
})();

(function resetOnlyPreservesStyles(){
  const {context,db,fixture}=makeRuntime({status:'Paused',profileStatus:'Paused',delivery:'keep_current',reset:true});
  const result=context.processConfirmedNativeManagementDevV1();
  assert.strictEqual(result.applied,1);
  const prefs=table(db,'Preferences').slice(1).filter(row=>row[0]==='PDEV900');
  assert.strictEqual(prefs.length,23);
  assert(prefs.every(row=>row[2]==='Normal' && row[3]===1));
  assert(prefs.every(row=>row[5]==='NATIVE:MANAGE:' + fixture.requestId));
  const profile=rowBy(db,'Profiles','Profile ID','PDEV900');
  assert.strictEqual(profile[1],'Paused');
  assert.strictEqual(profile[7],'More');
  assert.strictEqual(profile[8],'Explanatory');
  assert.strictEqual(profile[9],'Detailed');
})();

(function combinedPauseReset(){
  const {context,db}=makeRuntime({status:'Active',delivery:'pause',reset:true});
  const result=context.processConfirmedNativeManagementDevV1();
  assert.strictEqual(result.applied,1);
  assert.strictEqual(rowBy(db,'Subscribers','Email','manage@example.com')[1],'Paused');
  assert(table(db,'Preferences').slice(1).every(row=>row[2]==='Normal' && row[3]===1));
})();

(function ambiguousPreferenceFailsClosed(){
  const {context,db,intake}=makeRuntime({delivery:'keep_current',reset:true,duplicatePreference:true});
  const before=JSON.stringify(table(db,'Subscribers'));
  const result=context.processConfirmedNativeManagementDevV1();
  assert.strictEqual(result.errors,1);
  assert.strictEqual(JSON.stringify(table(db,'Subscribers')),before);
  assert.strictEqual(table(db,'Management Actions').length,1);
  assert.strictEqual(table(intake,'Native Manage Requests')[1][8],'Confirmed');
})();

(function partialActionFailsClosed(){
  const {context,db,intake}=makeRuntime({delivery:'pause',existingAction:true});
  const result=context.processConfirmedNativeManagementDevV1();
  assert.strictEqual(result.errors,1);
  assert.strictEqual(rowBy(db,'Subscribers','Email','manage@example.com')[1],'Active');
  assert.strictEqual(table(intake,'Native Manage Requests')[1][8],'Confirmed');
})();

console.log('FORM-9 native management DEV processor parity QA passed.');
