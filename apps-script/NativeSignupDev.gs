/**
 * Austin Daily Briefing — Native Signup DEV intake
 *
 * Gate A/B only. This source is hard-wired to the DEV intake workbook and
 * refuses production workbook IDs. It stages signup requests only; it does
 * not create subscribers, mutate profiles/preferences, or send Welcome mail.
 */

const ADB_NATIVE_SIGNUP_DEV = Object.freeze({
  BUILD: 'native-signup-dev-v1',
  DEV_INTAKE_ID: '1TiSgmFxij8p3wKnt_skTFXQvAOEuR2wI5c6V8Jq_Yyw',
  FORBIDDEN_PROD_INTAKE_ID: '1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho',
  FORBIDDEN_PROD_DATABASE_ID: '1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0',
  REQUEST_SHEET: 'Native Signup Requests',
  DIAGNOSTIC_SHEET: 'Native Signup Diagnostics',
  MAX_POST_BYTES: 4096,
  ADDRESS_COOLDOWN_SECONDS: 60,
  ADDRESS_WINDOW_SECONDS: 6 * 60 * 60,
  ADDRESS_WINDOW_MAX: 5,
  GLOBAL_WINDOW_SECONDS: 60 * 60,
  GLOBAL_WINDOW_MAX: 60,
  DUPLICATE_WINDOW_MS: 10 * 60 * 1000
});

const ADB_NATIVE_SIGNUP_REQUEST_HEADERS = Object.freeze([
  'Request ID','Created At','Email','Consent','Source','Client Nonce',
  'Response Key','Status','Processed At','Result','Notes'
]);

const ADB_NATIVE_SIGNUP_DIAGNOSTIC_HEADERS = Object.freeze([
  'Event At','Event','Reason','Email Hash Prefix','Request ID','Client Nonce',
  'Source','Build','Notes'
]);

function doPost(e) {
  adbSignupAssertDevBoundary_();
  if (e && e.postData && Number(e.postData.length || 0) > ADB_NATIVE_SIGNUP_DEV.MAX_POST_BYTES) {
    return adbSignupResult_({ok:false,status:'validation_error',code:'request_too_large',client_nonce:''});
  }

  const params = (e && e.parameter) || {};
  const nonce = String(params.client_nonce || '').trim();
  const source = String(params.source || 'website').trim().toLowerCase();
  const email = adbSignupNormalizeEmail_(params.email);

  adbSignupAppendDiagnostic_('received','',email,'',nonce,source,'');

  if (String(params.form_check || '').trim()) {
    adbSignupAppendDiagnostic_('noop','honeypot',email,'',nonce,source,'');
    return adbSignupResult_({ok:true,status:'accepted',client_nonce:nonce});
  }

  if (String(params.action || '') !== 'request') {
    return adbSignupValidation_('invalid_action', nonce, email, source);
  }
  if (!adbSignupValidEmail_(email)) {
    return adbSignupValidation_('invalid_email', nonce, email, source);
  }
  if (String(params.consent || '').trim().toLowerCase() !== 'yes') {
    return adbSignupValidation_('consent_required', nonce, email, source);
  }
  if (!/^[a-f0-9]{32}$/.test(nonce)) {
    return adbSignupValidation_('invalid_nonce', nonce, email, source);
  }
  if (source !== 'website') {
    return adbSignupValidation_('invalid_source', nonce, email, source);
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const intake = SpreadsheetApp.openById(ADB_NATIVE_SIGNUP_DEV.DEV_INTAKE_ID);
    const requestSheet = adbSignupEnsureSheet_(intake, ADB_NATIVE_SIGNUP_DEV.REQUEST_SHEET, ADB_NATIVE_SIGNUP_REQUEST_HEADERS);

    const existing = adbSignupFindDuplicate_(requestSheet, email, nonce);
    if (existing) {
      adbSignupAppendDiagnostic_('noop', existing.reason, email, existing.requestId, nonce, source, 'Existing staged request reused.');
      return adbSignupResult_({ok:true,status:'accepted',client_nonce:nonce});
    }

    const throttle = adbSignupCheckThrottle_(email);
    if (!throttle.ok) {
      adbSignupAppendDiagnostic_('noop','rate_limited_' + throttle.reason,email,'',nonce,source,'');
      return adbSignupResult_({ok:false,status:'rate_limited',code:throttle.reason,client_nonce:nonce});
    }

    const requestId = 'NSDEV-' + Utilities.getUuid();
    const responseKey = adbSignupResponseKey_(requestId, email, 'yes');
    requestSheet.appendRow([
      requestId, new Date(), email, 'Yes', source, nonce, responseKey,
      'Staged', '', '', 'Gate A/B DEV intake only; no subscriber mutation.'
    ]);
    SpreadsheetApp.flush();
    adbSignupAppendDiagnostic_('staged','accepted',email,requestId,nonce,source,'');

    console.log(JSON.stringify({
      event:'native_signup_dev_staged',
      requestId:requestId,
      productionTouched:false
    }));

    return adbSignupResult_({ok:true,status:'accepted',client_nonce:nonce});
  } finally {
    lock.releaseLock();
  }
}

function adbSignupValidation_(code, nonce, email, source) {
  adbSignupAppendDiagnostic_('validation_error',code,email,'',nonce,source,'');
  return adbSignupResult_({ok:false,status:'validation_error',code:code,client_nonce:nonce});
}

function adbSignupFindDuplicate_(sheet, email, nonce) {
  const table = adbSignupRows_(sheet);
  const cutoff = Date.now() - ADB_NATIVE_SIGNUP_DEV.DUPLICATE_WINDOW_MS;
  for (let i = table.rows.length - 1; i >= 0; i--) {
    const row = table.rows[i];
    if (adbSignupNormalizeEmail_(row.Email) !== email) continue;
    if (String(row['Client Nonce'] || '') === nonce) {
      return {requestId:String(row['Request ID'] || ''),reason:'same_nonce'};
    }
    const created = row['Created At'] instanceof Date ? row['Created At'].getTime() : new Date(row['Created At']).getTime();
    if (created && created >= cutoff && String(row.Consent || '').toLowerCase() === 'yes') {
      return {requestId:String(row['Request ID'] || ''),reason:'recent_equivalent'};
    }
  }
  return null;
}

function adbSignupCheckThrottle_(email) {
  const cache = CacheService.getScriptCache();
  const emailHash = adbSignupSha256Hex_(email).slice(0, 32);
  const cooldownKey = 'nsdev:cool:' + emailHash;
  if (cache.get(cooldownKey)) return {ok:false,reason:'cooldown'};

  const addressKey = 'nsdev:addr:' + emailHash;
  const addressCount = Number(cache.get(addressKey) || '0');
  if (addressCount >= ADB_NATIVE_SIGNUP_DEV.ADDRESS_WINDOW_MAX) return {ok:false,reason:'address_cap'};

  const globalKey = 'nsdev:global';
  const globalCount = Number(cache.get(globalKey) || '0');
  if (globalCount >= ADB_NATIVE_SIGNUP_DEV.GLOBAL_WINDOW_MAX) return {ok:false,reason:'global_cap'};

  cache.put(cooldownKey,'1',ADB_NATIVE_SIGNUP_DEV.ADDRESS_COOLDOWN_SECONDS);
  cache.put(addressKey,String(addressCount + 1),ADB_NATIVE_SIGNUP_DEV.ADDRESS_WINDOW_SECONDS);
  cache.put(globalKey,String(globalCount + 1),ADB_NATIVE_SIGNUP_DEV.GLOBAL_WINDOW_SECONDS);
  return {ok:true};
}

function adbSignupResponseKey_(requestId, email, consent) {
  const text = ['NativeSignup',requestId,email,consent].join('\u001F');
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return Utilities.base64EncodeWebSafe(digest).replace(/=+$/,'');
}

function adbSignupAppendDiagnostic_(eventName, reason, email, requestId, nonce, source, notes) {
  try {
    const intake = SpreadsheetApp.openById(ADB_NATIVE_SIGNUP_DEV.DEV_INTAKE_ID);
    const sheet = adbSignupEnsureSheet_(intake, ADB_NATIVE_SIGNUP_DEV.DIAGNOSTIC_SHEET, ADB_NATIVE_SIGNUP_DIAGNOSTIC_HEADERS);
    const hashPrefix = email ? adbSignupSha256Hex_(email).slice(0,12) : '';
    sheet.appendRow([new Date(),eventName,reason,hashPrefix,requestId || '',nonce || '',source || '',ADB_NATIVE_SIGNUP_DEV.BUILD,notes || '']);
  } catch (error) {
    console.log(JSON.stringify({event:'native_signup_dev_diagnostic_error',message:String(error)}));
  }
}

function adbSignupEnsureSheet_(spreadsheet, title, headers) {
  let sheet = spreadsheet.getSheetByName(title);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(title);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  const current = sheet.getRange(1,1,1,headers.length).getDisplayValues()[0];
  for (let i = 0; i < headers.length; i++) {
    if (String(current[i] || '') !== headers[i]) throw new Error('Unexpected ' + title + ' header at column ' + (i + 1));
  }
  return sheet;
}

function adbSignupRows_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);
  return {
    headers:headers,
    rows:values.slice(1).filter(function(row){return row.some(function(value){return value !== '';});}).map(function(row){
      return headers.reduce(function(out,header,index){out[header]=row[index];return out;},{});
    })
  };
}

function adbSignupNormalizeEmail_(value) {
  return String(value || '').trim().toLowerCase();
}

function adbSignupValidEmail_(email) {
  if (!email || email.length > 254 || /\s/.test(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function adbSignupSha256Hex_(text) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text || ''), Utilities.Charset.UTF_8);
  return bytes.map(function(value){
    const n = value < 0 ? value + 256 : value;
    return ('0' + n.toString(16)).slice(-2);
  }).join('');
}

function adbSignupResult_(payload) {
  const safe = JSON.stringify(payload).replace(/</g,'\\u003c');
  return HtmlService.createHtmlOutput(
    '<!doctype html><meta charset="utf-8"><script>window.top.postMessage(' + safe + ',"*");<\/script>'
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function adbSignupAssertDevBoundary_() {
  const target = ADB_NATIVE_SIGNUP_DEV.DEV_INTAKE_ID;
  if (!target || target === ADB_NATIVE_SIGNUP_DEV.FORBIDDEN_PROD_INTAKE_ID || target === ADB_NATIVE_SIGNUP_DEV.FORBIDDEN_PROD_DATABASE_ID) {
    throw new Error('Native signup DEV refuses production workbook IDs.');
  }
}
