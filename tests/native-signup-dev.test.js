const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const vm = require('vm');

const SOURCE_PATH = 'apps-script/NativeSignupDev.gs';
const source = fs.readFileSync(SOURCE_PATH, 'utf8');

const REQUEST_HEADERS = [
  'Request ID','Created At','Email','Consent','Source','Client Nonce',
  'Response Key','Status','Processed At','Result','Notes'
];
const DIAG_HEADERS = [
  'Event At','Event','Reason','Email Hash Prefix','Request ID','Client Nonce',
  'Source','Build','Notes'
];

class Sheet {
  constructor(name, headers) {
    this.name = name;
    this.rows = [headers.slice()];
  }
  appendRow(row) { this.rows.push(row.slice()); }
  setFrozenRows() {}
  getRange(row, col, numRows, numCols) {
    return {
      getDisplayValues: () => {
        const out = [];
        for (let r = 0; r < numRows; r++) {
          const src = this.rows[row - 1 + r] || [];
          out.push(Array.from({length:numCols}, (_, i) => {
            const v = src[col - 1 + i];
            return v instanceof Date ? v.toISOString() : String(v == null ? '' : v);
          }));
        }
        return out;
      }
    };
  }
  getDataRange() {
    return { getValues: () => this.rows.map(row => row.slice()) };
  }
}

class Workbook {
  constructor() {
    this.sheets = new Map([
      ['Native Signup Requests', new Sheet('Native Signup Requests', REQUEST_HEADERS)],
      ['Native Signup Diagnostics', new Sheet('Native Signup Diagnostics', DIAG_HEADERS)]
    ]);
  }
  getId() { return '1TiSgmFxij8p3wKnt_skTFXQvAOEuR2wI5c6V8Jq_Yyw'; }
  getSheetByName(name) { return this.sheets.get(name) || null; }
  insertSheet(name) {
    const sheet = new Sheet(name, []);
    this.sheets.set(name, sheet);
    return sheet;
  }
}

function signedDigest(buffer) {
  return Array.from(buffer, b => b > 127 ? b - 256 : b);
}

function makeRuntime(sourceText = source) {
  const workbook = new Workbook();
  const cache = new Map();
  let uuidCounter = 0;

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
        assert.strictEqual(id, '1TiSgmFxij8p3wKnt_skTFXQvAOEuR2wI5c6V8Jq_Yyw', 'runtime attempted non-DEV workbook');
        return workbook;
      },
      flush() {}
    },
    CacheService: {
      getScriptCache() {
        return {
          get(key) { return cache.has(key) ? cache.get(key) : null; },
          put(key, value) { cache.set(key, String(value)); }
        };
      }
    },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'SHA_256' },
      Charset: { UTF_8: 'UTF_8' },
      computeDigest(_alg, text) {
        return signedDigest(crypto.createHash('sha256').update(String(text), 'utf8').digest());
      },
      base64EncodeWebSafe(bytes) {
        const unsigned = Buffer.from(bytes.map(b => b < 0 ? b + 256 : b));
        return unsigned.toString('base64url');
      },
      getUuid() {
        uuidCounter += 1;
        return '00000000-0000-4000-8000-' + String(uuidCounter).padStart(12, '0');
      }
    },
    HtmlService: {
      XFrameOptionsMode: { ALLOWALL: 'ALLOWALL' },
      createHtmlOutput(html) {
        return {
          html,
          setXFrameOptionsMode() { return this; }
        };
      }
    }
  };

  vm.createContext(context);
  vm.runInContext(sourceText, context, {filename:SOURCE_PATH});
  return {context, workbook, cache};
}

function event(params, length = 200) {
  return { parameter: params, postData: { length } };
}

function payload(result) {
  const match = result.html.match(/postMessage\((\{.*?\}),"\*"\)/);
  assert(match, 'result payload missing');
  return JSON.parse(match[1]);
}

const VALID_NONCE_A = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const VALID_NONCE_B = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const VALID_NONCE_C = 'cccccccccccccccccccccccccccccccc';

(function validStagesExactlyOnce() {
  const {context, workbook} = makeRuntime();
  const result = payload(context.doPost(event({
    action:'request', source:'website', email:' Reader@Example.COM ',
    consent:'yes', client_nonce:VALID_NONCE_A, form_check:''
  })));
  assert.deepStrictEqual(result, {ok:true,status:'accepted',client_nonce:VALID_NONCE_A});

  const requests = workbook.getSheetByName('Native Signup Requests').rows;
  assert.strictEqual(requests.length, 2);
  assert.strictEqual(requests[1][2], 'reader@example.com');
  assert.strictEqual(requests[1][3], 'Yes');
  assert.strictEqual(requests[1][4], 'website');
  assert.strictEqual(requests[1][5], VALID_NONCE_A);
  assert.match(requests[1][6], /^[A-Za-z0-9_-]{43}$/);
  assert.strictEqual(requests[1][7], 'Staged');

  const diagnostics = workbook.getSheetByName('Native Signup Diagnostics').rows;
  assert(diagnostics.some(row => row[1] === 'received'));
  assert(diagnostics.some(row => row[1] === 'staged' && row[2] === 'accepted'));
})();

(function sameNonceReplayNoops() {
  const {context, workbook} = makeRuntime();
  const params = {
    action:'request', source:'website', email:'reader@example.com',
    consent:'yes', client_nonce:VALID_NONCE_A, form_check:''
  };
  context.doPost(event(params));
  const second = payload(context.doPost(event(params)));
  assert.strictEqual(second.status, 'accepted');
  assert.strictEqual(workbook.getSheetByName('Native Signup Requests').rows.length, 2);
  assert(workbook.getSheetByName('Native Signup Diagnostics').rows.some(
    row => row[1] === 'noop' && row[2] === 'same_nonce'
  ));
})();

(function recentEquivalentNoops() {
  const {context, workbook} = makeRuntime();
  context.doPost(event({
    action:'request', source:'website', email:'reader@example.com',
    consent:'yes', client_nonce:VALID_NONCE_A, form_check:''
  }));
  const second = payload(context.doPost(event({
    action:'request', source:'website', email:'reader@example.com',
    consent:'yes', client_nonce:VALID_NONCE_B, form_check:''
  })));
  assert.strictEqual(second.status, 'accepted');
  assert.strictEqual(workbook.getSheetByName('Native Signup Requests').rows.length, 2);
  assert(workbook.getSheetByName('Native Signup Diagnostics').rows.some(
    row => row[1] === 'noop' && row[2] === 'recent_equivalent'
  ));
})();

(function honeypotNoopsWithoutStaging() {
  const {context, workbook} = makeRuntime();
  const result = payload(context.doPost(event({
    action:'request', source:'website', email:'bot@example.com',
    consent:'yes', client_nonce:VALID_NONCE_A, form_check:'filled'
  })));
  assert.strictEqual(result.status, 'accepted');
  assert.strictEqual(workbook.getSheetByName('Native Signup Requests').rows.length, 1);
  assert(workbook.getSheetByName('Native Signup Diagnostics').rows.some(
    row => row[1] === 'noop' && row[2] === 'honeypot'
  ));
})();

(function validationStopsStaging() {
  const cases = [
    [{action:'request',source:'website',email:'bad',consent:'yes',client_nonce:VALID_NONCE_A}, 'invalid_email'],
    [{action:'request',source:'website',email:'reader@example.com',consent:'',client_nonce:VALID_NONCE_A}, 'consent_required'],
    [{action:'request',source:'website',email:'reader@example.com',consent:'yes',client_nonce:'short'}, 'invalid_nonce'],
    [{action:'request',source:'other',email:'reader@example.com',consent:'yes',client_nonce:VALID_NONCE_A}, 'invalid_source'],
    [{action:'wrong',source:'website',email:'reader@example.com',consent:'yes',client_nonce:VALID_NONCE_A}, 'invalid_action']
  ];
  for (const [params, code] of cases) {
    const {context, workbook} = makeRuntime();
    const result = payload(context.doPost(event({...params, form_check:''})));
    assert.strictEqual(result.status, 'validation_error');
    assert.strictEqual(result.code, code);
    assert.strictEqual(workbook.getSheetByName('Native Signup Requests').rows.length, 1);
  }
})();

(function oversizedRequestRejected() {
  const {context, workbook} = makeRuntime();
  const result = payload(context.doPost(event({
    action:'request',source:'website',email:'reader@example.com',
    consent:'yes',client_nonce:VALID_NONCE_A,form_check:''
  }, 5000)));
  assert.strictEqual(result.status, 'validation_error');
  assert.strictEqual(result.code, 'request_too_large');
  assert.strictEqual(workbook.getSheetByName('Native Signup Requests').rows.length, 1);
})();

(function cooldownRateLimitExecutes() {
  const {context, workbook} = makeRuntime();
  const requestSheet = workbook.getSheetByName('Native Signup Requests');
  requestSheet.appendRow([
    'NSDEV-old', new Date(Date.now() - 20 * 60 * 1000), 'reader@example.com', 'Yes',
    'website', VALID_NONCE_A, 'old-key', 'Staged', '', '', ''
  ]);
  const firstThrottle = context.adbSignupCheckThrottle_('reader@example.com');
  assert.strictEqual(firstThrottle.ok, true);

  const result = payload(context.doPost(event({
    action:'request',source:'website',email:'reader@example.com',
    consent:'yes',client_nonce:VALID_NONCE_C,form_check:''
  })));
  assert.strictEqual(result.status, 'rate_limited');
  assert.strictEqual(result.code, 'cooldown');
  assert.strictEqual(requestSheet.rows.length, 2);
})();

(function boundaryRejectsProductionIntake() {
  const prod = '1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho';
  const altered = source.replace(
    "DEV_INTAKE_ID: '1TiSgmFxij8p3wKnt_skTFXQvAOEuR2wI5c6V8Jq_Yyw'",
    "DEV_INTAKE_ID: '" + prod + "'"
  );
  const {context} = makeRuntime(altered);
  assert.throws(() => context.adbSignupAssertDevBoundary_(), /refuses production workbook IDs/);
})();

(function boundaryRejectsProductionDatabase() {
  const prod = '1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0';
  const altered = source.replace(
    "DEV_INTAKE_ID: '1TiSgmFxij8p3wKnt_skTFXQvAOEuR2wI5c6V8Jq_Yyw'",
    "DEV_INTAKE_ID: '" + prod + "'"
  );
  const {context} = makeRuntime(altered);
  assert.throws(() => context.adbSignupAssertDevBoundary_(), /refuses production workbook IDs/);
})();

console.log('Native signup Gate B runtime QA passed.');
