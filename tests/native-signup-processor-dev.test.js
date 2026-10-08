const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const SOURCE_PATH = 'apps-script/NativeSignupDevProcessor.gs';
const source = fs.readFileSync(SOURCE_PATH, 'utf8');

const DEV_DB = '1rl5GTOvuBSHyFK1r9CqI_6Z5gAwtgsTQnQQf9VCMeyM';
const DEV_INTAKE = '1TiSgmFxij8p3wKnt_skTFXQvAOEuR2wI5c6V8Jq_Yyw';

class Sheet {
  constructor(name, rows) {
    this.name = name;
    this.rows = rows.map(row => row.slice());
  }
  getName() { return this.name; }
  getDataRange() {
    return {
      getValues: () => this.rows.map(row => row.slice()),
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
  getId() { return this.id; }
  getSheetByName(name) { return this.sheets.get(name) || null; }
}

function display(v) {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

const interestIds = [
  'CIV01','CIV02','CIV03','CIV04','CIV05',
  'CUL01','CUL02','CUL03','CUL04','CUL05',
  'TEC01','TEC02','TEC03','TEC04',
  'LIF01','LIF02','LIF03','LIF04',
  'CIV06','CUL06','CUL07','TEC05','LIF05'
];

function interestRows() {
  return [
    ['Interest ID','Group','Interest','Default Preference','Default Scope','Active'],
    ...interestIds.map((id, i) => [id,'Group','Interest '+i,'Normal','Austin-first','TRUE'])
  ];
}

function requestRow(email, opts = {}) {
  return [
    opts.requestId || 'NSDEV-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    opts.createdAt || new Date('2026-10-04T17:50:00Z'),
    email,
    opts.consent === undefined ? 'Yes' : opts.consent,
    opts.source || 'website',
    opts.nonce || 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    opts.responseKey || 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    opts.status || 'Staged',
    '',
    '',
    ''
  ];
}

function baseSheets(options = {}) {
  const subscribers = [
    ['Email','Status','Created','Updated','Notes','Profile ID','Preference Source Email','Admin Status']
  ];
  const profiles = [
    ['Profile ID','Status','Primary Preference Email','Latest Submission ID','Customize URL','Last Preference Update','Notes','More for You Volume','Summary Style','Why It Matters Length'],
    ['PDEV005','Active','other@example.com','','https://docs.google.com/forms/d/e/DEV/viewform','','Fixture','Standard','Standard','Standard']
  ];
  const preferences = [
    ['Profile ID','Interest ID','Preference','Score','Updated','Source Submission ID','Profile ID']
  ];

  if (options.subscribers) options.subscribers.forEach(row => subscribers.push(row.slice()));
  if (options.profiles) options.profiles.forEach(row => profiles.push(row.slice()));
  if (options.preferences) options.preferences.forEach(row => preferences.push(row.slice()));

  const dbSheets = {
    'Subscribers': subscribers,
    'Profiles': profiles,
    'Preferences': preferences,
    'Interest Catalog': interestRows(),
    'Signup Actions': [
      ['Submission ID','Received At','Email','Profile ID','Subscriber Result','Profile Result','Preferences Result','Welcome Queue Result','Processed At','Notes'],
      ...(options.actions || []).map(row => row.slice())
    ],
    'Outbound Messages': [
      ['Message ID','Created At','Profile ID','Email','Template ID','Status','Subject','Customize URL','Sent At / Gmail ID','Notes'],
      ...(options.outbound || []).map(row => row.slice())
    ],
    'Message Templates': [
      ['Template ID','Trigger','Subject','Body / Purpose','Active','Notes'],
      ['WELCOME_V1','New subscriber activated','Welcome to the Austin Daily Briefing','Welcome','TRUE','Fixture']
    ],
    'Environment': [
      ['Setting','Value','Notes'],
      ['Environment','DEVELOPMENT',''],
      ['Database ID',DEV_DB,''],
      ['Production Writes','FORBIDDEN',''],
      ['Schema Baseline','GOOGLE-23-1','']
    ]
  };

  const intakeSheets = {
    'Native Signup Requests': [
      ['Request ID','Created At','Email','Consent','Source','Client Nonce','Response Key','Status','Processed At','Result','Notes'],
      requestRow(options.email || 'new@example.com', options.request || {})
    ],
    'Integration Config': [
      ['Setting','Value','Status','Notes'],
      ['Environment','DEVELOPMENT','',''],
      ['Operational DEV Database ID',DEV_DB,'',''],
      ['Production Database ID','1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0','',''],
      ['Production Writes','FORBIDDEN','',''],
      ['Google Customize Form ID / URL','dev-form-id | https://docs.google.com/forms/d/e/DEV/viewform','','']
    ]
  };

  return {dbSheets, intakeSheets};
}

function makeRuntime(options = {}, alteredSource = source) {
  const fixture = baseSheets(options);
  const db = new Book(DEV_DB, fixture.dbSheets);
  const intake = new Book(DEV_INTAKE, fixture.intakeSheets);

  const context = {
    console: { log() {} },
    Date,
    JSON,
    Math,
    Object,
    RegExp,
    String,
    Number,
    Array,
    Error,
    LockService: {
      getScriptLock() {
        return { waitLock() {}, releaseLock() {} };
      }
    },
    SpreadsheetApp: {
      openById(id) {
        if (id === DEV_DB) return db;
        if (id === DEV_INTAKE) return intake;
        throw new Error('Unexpected workbook ID: ' + id);
      },
      flush() {}
    },
    Utilities: {
      formatDate() { return '2026-10-04 12:50:00 CDT'; }
    }
  };

  vm.createContext(context);
  vm.runInContext(alteredSource, context, {filename: SOURCE_PATH});
  return {context, db, intake};
}

function rows(book, name) {
  return book.getSheetByName(name).rows;
}

function findRow(book, name, column, value) {
  const table = rows(book, name);
  const index = table[0].indexOf(column);
  return table.slice(1).find(row => String(row[index] || '') === value);
}

(function newSubscriberParity() {
  const {context, db, intake} = makeRuntime({email:'new@example.com'});
  const summary = context.processNativeSignupDevV1();

  assert.strictEqual(summary.new_subscribers, 1);
  const sub = findRow(db,'Subscribers','Email','new@example.com');
  assert(sub);
  assert.strictEqual(sub[1], 'Active');
  assert.strictEqual(sub[5], 'PDEV006');

  const profile = findRow(db,'Profiles','Profile ID','PDEV006');
  assert(profile);
  assert.strictEqual(profile[1], 'Active');
  assert.strictEqual(profile[7], 'Standard');
  assert.strictEqual(profile[8], 'Standard');
  assert.strictEqual(profile[9], 'Standard');

  const prefRows = rows(db,'Preferences').slice(1).filter(row => row[0] === 'PDEV006');
  assert.strictEqual(prefRows.length, 23);
  assert(prefRows.every(row => row[2] === 'Normal' && row[3] === 1));

  const action = findRow(db,'Signup Actions','Submission ID','NATIVE:SIGNUP:' + 'A'.repeat(43));
  assert(action);
  assert.strictEqual(action[4], 'Created');

  const msg = findRow(db,'Outbound Messages','Message ID','WELCOME-NATIVE:' + 'A'.repeat(43));
  assert(msg);
  assert.strictEqual(msg[4], 'WELCOME_V1');
  assert.strictEqual(msg[5], 'Queued');

  const req = rows(intake,'Native Signup Requests')[1];
  assert.strictEqual(req[7], 'Processed');
  assert.strictEqual(req[9], 'new_subscriber');

  context.processNativeSignupDevV1();
  assert.strictEqual(rows(db,'Subscribers').filter(row => row[0] === 'new@example.com').length, 1);
  assert.strictEqual(rows(db,'Outbound Messages').filter(row => row[0] === 'WELCOME-NATIVE:' + 'A'.repeat(43)).length, 1);
})();

(function activeNoop() {
  const {context, db, intake} = makeRuntime({
    email:'active@example.com',
    subscribers:[['active@example.com','Active','','','', 'PDEV004','active@example.com','OK']],
    profiles:[['PDEV004','Active','active@example.com','','https://docs.google.com/forms/d/e/DEV/viewform','','','Standard','Standard','Standard']]
  });
  const beforeActions = rows(db,'Signup Actions').length;
  const beforeOutbound = rows(db,'Outbound Messages').length;
  const summary = context.processNativeSignupDevV1();
  assert.strictEqual(summary.active_noop, 1);
  assert.strictEqual(rows(db,'Signup Actions').length, beforeActions);
  assert.strictEqual(rows(db,'Outbound Messages').length, beforeOutbound);
  assert.strictEqual(rows(intake,'Native Signup Requests')[1][9], 'existing_active_noop');
})();

(function pausedNoop() {
  const {context, db, intake} = makeRuntime({
    email:'paused@example.com',
    subscribers:[['paused@example.com','Paused','','','', 'PDEV004','paused@example.com','OK']],
    profiles:[['PDEV004','Active','paused@example.com','','https://docs.google.com/forms/d/e/DEV/viewform','','','Standard','Standard','Standard']]
  });
  const summary = context.processNativeSignupDevV1();
  assert.strictEqual(summary.paused_noop, 1);
  assert.strictEqual(findRow(db,'Subscribers','Email','paused@example.com')[1], 'Paused');
  assert.strictEqual(rows(intake,'Native Signup Requests')[1][9], 'paused_requires_manage');
})();

(function resubscribePreservesProfileAndPreferences() {
  const savedPrefs = interestIds.map((id, i) => [
    'PDEV004', id, i % 3 === 0 ? 'High' : (i % 3 === 1 ? 'Off' : 'Normal'),
    i % 3 === 0 ? 2 : (i % 3 === 1 ? 0 : 1),
    'before', 'old-source', 'PDEV004'
  ]);
  const snapshot = JSON.stringify(savedPrefs);

  const {context, db, intake} = makeRuntime({
    email:'returning@example.com',
    subscribers:[['returning@example.com','Unsubscribed','old','old','Existing subscriber','PDEV004','returning@example.com','OK']],
    profiles:[['PDEV004','Unsubscribed','returning@example.com','old-submission','https://docs.google.com/forms/d/e/DEV/viewform','old','Existing profile','More','Explanatory','Brief']],
    preferences:savedPrefs
  });

  const summary = context.processNativeSignupDevV1();
  assert.strictEqual(summary.resubscribed, 1);

  const sub = findRow(db,'Subscribers','Email','returning@example.com');
  assert.strictEqual(sub[1], 'Active');
  assert.strictEqual(sub[5], 'PDEV004');

  const profile = findRow(db,'Profiles','Profile ID','PDEV004');
  assert.strictEqual(profile[1], 'Active');
  assert.strictEqual(profile[3], 'NATIVE:SIGNUP:' + 'A'.repeat(43));
  assert.strictEqual(profile[5], 'old');
  assert.strictEqual(profile[7], 'More');
  assert.strictEqual(profile[8], 'Explanatory');
  assert.strictEqual(profile[9], 'Brief');

  const afterPrefs = rows(db,'Preferences').slice(1).filter(row => row[0] === 'PDEV004');
  assert.strictEqual(JSON.stringify(afterPrefs), snapshot);

  const action = findRow(db,'Signup Actions','Submission ID','NATIVE:SIGNUP:' + 'A'.repeat(43));
  assert.strictEqual(action[4], 'Reactivated');
  assert.strictEqual(action[5], 'Existing profile preserved');

  const msg = findRow(db,'Outbound Messages','Message ID','WELCOME-NATIVE:' + 'A'.repeat(43));
  assert(msg);
  assert.strictEqual(msg[5], 'Queued');
  assert.strictEqual(rows(intake,'Native Signup Requests')[1][9], 'resubscribed');
})();

(function adminHoldPreventsReactivation() {
  const {context,db,intake}=makeRuntime({
    email:'hold@example.com',
    subscribers:[['hold@example.com','Unsubscribed','old','old','Administrative hold','PDEV004','hold@example.com','Hold']],
    profiles:[['PDEV004','Unsubscribed','hold@example.com','old','https://example.test/customize','old','Hold fixture','More','Explanatory','Brief']],
    preferences:interestIds.map(id=>['PDEV004',id,'Normal',1,'before','old-source','PDEV004'])
  });
  const result=context.processNativeSignupDevV1();
  assert.strictEqual(result.admin_hold_noop,1);
  assert.strictEqual(result.resubscribed,0);
  assert.strictEqual(result.errors,0);
  assert.strictEqual(findRow(db,'Subscribers','Email','hold@example.com')[1],'Unsubscribed');
  assert.strictEqual(findRow(db,'Subscribers','Email','hold@example.com')[7],'Hold');
  assert.strictEqual(findRow(db,'Profiles','Profile ID','PDEV004')[1],'Unsubscribed');
  assert.strictEqual(rows(db,'Signup Actions').length,1);
  assert.strictEqual(rows(db,'Outbound Messages').length,1);
  assert.strictEqual(rows(intake,'Native Signup Requests')[1][9],'admin_hold_noop');
})();

(function adminReviewPreventsReactivation() {
  const {context,db,intake}=makeRuntime({
    email:'review@example.com',
    subscribers:[['review@example.com','Unsubscribed','old','old','Administrative review','PDEV004','review@example.com','Review']],
    profiles:[['PDEV004','Unsubscribed','review@example.com','old','https://example.test/customize','old','Review fixture','More','Explanatory','Brief']]
  });
  const result=context.processNativeSignupDevV1();
  assert.strictEqual(result.admin_review_noop,1);
  assert.strictEqual(findRow(db,'Subscribers','Email','review@example.com')[1],'Unsubscribed');
  assert.strictEqual(rows(db,'Outbound Messages').length,1);
  assert.strictEqual(rows(intake,'Native Signup Requests')[1][9],'admin_review_noop');
})();

(function mismatchedProfileStatusFailsClosed() {
  const {context, db, intake} = makeRuntime({
    email:'mismatch@example.com',
    subscribers:[['mismatch@example.com','Unsubscribed','old','old','Existing subscriber','PDEV004','mismatch@example.com','OK']],
    profiles:[['PDEV004','Active','mismatch@example.com','old-submission','https://docs.google.com/forms/d/e/DEV/viewform','old','Existing profile','More','Explanatory','Brief']],
    preferences:interestIds.map(id => ['PDEV004',id,'Normal',1,'before','old-source','PDEV004'])
  });
  const summary = context.processNativeSignupDevV1();
  assert.strictEqual(summary.errors, 1);
  assert.strictEqual(findRow(db,'Subscribers','Email','mismatch@example.com')[1], 'Unsubscribed');
  assert.strictEqual(findRow(db,'Profiles','Profile ID','PDEV004')[1], 'Active');
  assert.strictEqual(rows(db,'Signup Actions').length, 1);
  assert.strictEqual(rows(db,'Outbound Messages').length, 1);
  assert.strictEqual(rows(intake,'Native Signup Requests')[1][7], 'Error');
})();

(function ambiguousIdentityFailsClosed() {
  const {context, db, intake} = makeRuntime({
    email:'dupe@example.com',
    subscribers:[
      ['dupe@example.com','Active','','','','PDEV003','dupe@example.com','OK'],
      ['DUPE@example.com','Unsubscribed','','','','PDEV004','dupe@example.com','OK']
    ],
    profiles:[
      ['PDEV003','Active','dupe@example.com','','https://docs.google.com/forms/d/e/DEV/viewform','','','Standard','Standard','Standard'],
      ['PDEV004','Active','dupe@example.com','','https://docs.google.com/forms/d/e/DEV/viewform','','','Standard','Standard','Standard']
    ]
  });
  const summary = context.processNativeSignupDevV1();
  assert.strictEqual(summary.errors, 1);
  assert.strictEqual(rows(intake,'Native Signup Requests')[1][7], 'Error');
  assert.strictEqual(rows(db,'Outbound Messages').length, 1);
})();

(function partialArtifactFailsClosed() {
  const responseKey = 'A'.repeat(43);
  const {context, db, intake} = makeRuntime({
    email:'partial@example.com',
    actions:[[
      'NATIVE:SIGNUP:' + responseKey,'','partial@example.com','PDEV006','Created','Created','23 active interests initialized Normal','WELCOME-NATIVE queued','','partial fixture'
    ]]
  });
  const summary = context.processNativeSignupDevV1();
  assert.strictEqual(summary.errors, 1);
  assert.strictEqual(rows(intake,'Native Signup Requests')[1][7], 'Error');
  assert.strictEqual(rows(db,'Subscribers').filter(row => row[0] === 'partial@example.com').length, 0);
  assert.strictEqual(rows(db,'Outbound Messages').length, 1);
})();

(function invalidConsentFailsClosed() {
  const {context, db, intake} = makeRuntime({
    email:'consent@example.com',
    request:{consent:'No'}
  });
  const summary = context.processNativeSignupDevV1();
  assert.strictEqual(summary.errors, 1);
  assert.strictEqual(rows(intake,'Native Signup Requests')[1][7], 'Error');
  assert.strictEqual(rows(db,'Subscribers').filter(row => row[0] === 'consent@example.com').length, 0);
})();

(function productionBoundaryRejectsProdDb() {
  const altered = source.replace(
    "DEV_DATABASE_ID: '1rl5GTOvuBSHyFK1r9CqI_6Z5gAwtgsTQnQQf9VCMeyM'",
    "DEV_DATABASE_ID: '1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0'"
  );
  const {context} = makeRuntime({}, altered);
  assert.throws(() => context.adbNsProcAssertDevBoundary_(), /refuses production workbook IDs/);
})();

(function productionBoundaryRejectsProdIntake() {
  const altered = source.replace(
    "DEV_INTAKE_ID: '1TiSgmFxij8p3wKnt_skTFXQvAOEuR2wI5c6V8Jq_Yyw'",
    "DEV_INTAKE_ID: '1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho'"
  );
  const {context} = makeRuntime({}, altered);
  assert.throws(() => context.adbNsProcAssertDevBoundary_(), /refuses production workbook IDs/);
})();

(function legacyPreferenceDuplicateHeaderUsesCanonicalFirstColumn() {
  const savedPrefs = interestIds.map((id, i) => [
    'PDEV004', id, i % 2 === 0 ? 'High' : 'Normal',
    i % 2 === 0 ? 2 : 1,
    'legacy', 'legacy-source', ''
  ]);
  const {context, db, intake} = makeRuntime({
    email:'legacy-returning@example.com',
    subscribers:[['legacy-returning@example.com','Unsubscribed','old','old','Existing subscriber','PDEV004','legacy-returning@example.com','OK']],
    profiles:[['PDEV004','Unsubscribed','legacy-returning@example.com','old-submission','https://docs.google.com/forms/d/e/DEV/viewform','old','Existing profile','More','Explanatory','Brief']],
    preferences:savedPrefs
  });
  const before = JSON.stringify(rows(db,'Preferences').slice(1).filter(row => row[0] === 'PDEV004'));
  const summary = context.processNativeSignupDevV1();
  assert.strictEqual(summary.resubscribed, 1);
  assert.strictEqual(findRow(db,'Subscribers','Email','legacy-returning@example.com')[1], 'Active');
  const after = JSON.stringify(rows(db,'Preferences').slice(1).filter(row => row[0] === 'PDEV004'));
  assert.strictEqual(after, before);
  assert.strictEqual(rows(intake,'Native Signup Requests')[1][9], 'resubscribed');
})();

(function form9FreshConsentDevPageIsIsolated() {
  const html = fs.readFileSync('site/form9-consent-dev.html', 'utf8');
  const devConfig = fs.readFileSync('site/form9-consent-dev-config.js', 'utf8');
  const productionConfig = fs.readFileSync('site/signup-config.js', 'utf8');
  const homepage = fs.readFileSync('site/index.html', 'utf8');
  const sitemap = fs.readFileSync('site/sitemap.xml', 'utf8');

  assert(html.includes('<meta name="robots" content="noindex, nofollow">'));
  assert(html.includes('id="native-signup-form"'));
  assert(html.includes('id="signup-consent"'));
  assert(html.includes('name="consent" type="checkbox" value="yes" required'));
  assert(html.includes('form9-consent-dev-config.js'));
  assert(html.includes('signup.js'));
  assert(devConfig.includes("environment: 'development'"));
  assert(devConfig.includes('AKfycbzx2Ktealkm7PnFf1aXCcrZOzmffG7KBUE3NUsVA-pxsaq0lLkzn-O9F_Ajruov5v1l'));
  assert(productionConfig.includes("environment: 'production'"));
  assert(!productionConfig.includes('AKfycbzx2Ktealkm7PnFf1aXCcrZOzmffG7KBUE3NUsVA-pxsaq0lLkzn-O9F_Ajruov5v1l'));
  assert(!homepage.includes('form9-consent-dev.html'));
  assert(!sitemap.includes('form9-consent-dev.html'));
})();

console.log('Native signup Gate C DEV processor parity QA passed.');
