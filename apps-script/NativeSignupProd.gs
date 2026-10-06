/**
 * Austin Daily Briefing — Native Signup PRODUCTION intake
 *
 * FORM-7 Gate D staging source.
 *
 * This endpoint stages native signup requests only. It never creates or
 * reactivates subscribers, mutates profiles/preferences, or sends Welcome mail.
 * Production Subscriber Operations remains the sole owner of those actions.
 *
 * Required Script Properties:
 * - ADB_NATIVE_SIGNUP_PROD_ENABLED=TRUE
 * - ADB_NATIVE_SIGNUP_PROD_MODE=CONTROLLED or LIVE
 * - ADB_NATIVE_SIGNUP_PROD_ALLOWLIST=<controlled addresses; required in CONTROLLED>
 * - ADB_NATIVE_SIGNUP_PROD_SITE_ORIGIN=https://austindailybriefing.com
 *
 * Required Integration Config:
 * - Native Signup Mode = DISABLED, CONTROLLED, or LIVE
 * - Native Signup Controlled Email = valid controlled address when CONTROLLED
 *
 * Shared Processor Mode remains GOOGLE + NATIVE (or GOOGLE + NATIVE CONTROLLED
 * during an explicit broader rollback/staging event). No new shared intake mode
 * is introduced by FORM-7.
 */

const ADB_NATIVE_SIGNUP_PROD = Object.freeze({
  BUILD: 'native-signup-prod-stage-v1',
  PROD_INTAKE_ID: '1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho',
  PROD_DATABASE_ID: '1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0',
  FORBIDDEN_DEV_INTAKE_ID: '1TiSgmFxij8p3wKnt_skTFXQvAOEuR2wI5c6V8Jq_Yyw',
  FORBIDDEN_DEV_DATABASE_ID: '1rl5GTOvuBSHyFK1r9CqI_6Z5gAwtgsTQnQQf9VCMeyM',
  REQUEST_SHEET: 'Native Signup Requests',
  DIAGNOSTIC_SHEET: 'Native Signup Diagnostics',
  CONFIG_SHEET: 'Integration Config',
  ENVIRONMENT_SHEET: 'Environment',
  ENABLED_PROPERTY: 'ADB_NATIVE_SIGNUP_PROD_ENABLED',
  MODE_PROPERTY: 'ADB_NATIVE_SIGNUP_PROD_MODE',
  ALLOWLIST_PROPERTY: 'ADB_NATIVE_SIGNUP_PROD_ALLOWLIST',
  SITE_ORIGIN_PROPERTY: 'ADB_NATIVE_SIGNUP_PROD_SITE_ORIGIN',
  DEFAULT_SITE_ORIGIN: 'https://austindailybriefing.com',
  MAX_POST_BYTES: 4096,
  ADDRESS_COOLDOWN_SECONDS: 60,
  ADDRESS_WINDOW_SECONDS: 6 * 60 * 60,
  ADDRESS_WINDOW_MAX: 5,
  GLOBAL_WINDOW_SECONDS: 60 * 60,
  GLOBAL_WINDOW_MAX: 60,
  DUPLICATE_WINDOW_MS: 10 * 60 * 1000
});

const ADB_NATIVE_SIGNUP_PROD_REQUEST_HEADERS = Object.freeze([
  'Request ID','Created At','Email','Consent','Source','Client Nonce',
  'Response Key','Status','Processed At','Result','Notes'
]);

const ADB_NATIVE_SIGNUP_PROD_DIAGNOSTIC_HEADERS = Object.freeze([
  'Event At','Event','Reason','Email Hash Prefix','Request ID','Client Nonce',
  'Source','Build','Notes'
]);

function getNativeSignupProdRuntimeStatusV1() {
  adbSignupProdAssertTargets_();
  const props = PropertiesService.getScriptProperties();
  const config = adbSignupProdIntegrationConfig_();
  const enabledRaw = String(props.getProperty(ADB_NATIVE_SIGNUP_PROD.ENABLED_PROPERTY) || '').trim().toUpperCase();
  const modeRaw = String(props.getProperty(ADB_NATIVE_SIGNUP_PROD.MODE_PROPERTY) || '').trim().toUpperCase();
  const allowlist = String(props.getProperty(ADB_NATIVE_SIGNUP_PROD.ALLOWLIST_PROPERTY) || '')
    .split(',').map(function(value) { return value.trim().toLowerCase(); }).filter(Boolean);
  const siteOrigin = String(props.getProperty(ADB_NATIVE_SIGNUP_PROD.SITE_ORIGIN_PROPERTY) || '').trim();

  return {
    build: ADB_NATIVE_SIGNUP_PROD.BUILD,
    intakeTarget: ADB_NATIVE_SIGNUP_PROD.PROD_INTAKE_ID,
    databaseTarget: ADB_NATIVE_SIGNUP_PROD.PROD_DATABASE_ID,
    enabled: enabledRaw === 'TRUE',
    mode: modeRaw || 'UNSET',
    allowlistConfigured: allowlist.length > 0,
    siteOrigin: siteOrigin || 'UNSET',
    integrationNativeSignupMode: String(config['Native Signup Mode'] || '').trim() || 'DISABLED',
    integrationControlledEmailConfigured: !!String(config['Native Signup Controlled Email'] || '').trim(),
    sharedProcessorMode: String(config['Processor Mode'] || '').trim()
  };
}

function validateNativeSignupProdPreflightV1() {
  adbSignupProdAssertTargets_();

  const props = PropertiesService.getScriptProperties();
  const enabled = String(
    props.getProperty(ADB_NATIVE_SIGNUP_PROD.ENABLED_PROPERTY) || ''
  ).trim().toUpperCase();
  const runtimeMode = String(
    props.getProperty(ADB_NATIVE_SIGNUP_PROD.MODE_PROPERTY) || ''
  ).trim().toUpperCase();
  const allowlist = String(
    props.getProperty(ADB_NATIVE_SIGNUP_PROD.ALLOWLIST_PROPERTY) || ''
  ).trim();
  const origin = String(
    props.getProperty(ADB_NATIVE_SIGNUP_PROD.SITE_ORIGIN_PROPERTY) || ''
  ).trim();

  if (enabled !== 'FALSE') {
    throw new Error('Gate D preflight requires ADB_NATIVE_SIGNUP_PROD_ENABLED=FALSE.');
  }
  if (runtimeMode !== 'CONTROLLED') {
    throw new Error('Gate D preflight requires ADB_NATIVE_SIGNUP_PROD_MODE=CONTROLLED.');
  }
  if (allowlist) {
    throw new Error('Gate D preflight requires an empty native-signup allowlist.');
  }
  if (origin !== ADB_NATIVE_SIGNUP_PROD.DEFAULT_SITE_ORIGIN) {
    throw new Error('Gate D preflight site origin mismatch.');
  }

  const cfg = adbSignupProdIntegrationConfig_();
  if (String(cfg['Native Signup Mode'] || '').trim().toUpperCase() !== 'DISABLED') {
    throw new Error('Gate D preflight requires Native Signup Mode = DISABLED.');
  }
  if (String(cfg['Native Signup Controlled Email'] || '').trim()) {
    throw new Error('Gate D preflight requires blank Native Signup Controlled Email.');
  }

  const processorMode = String(cfg['Processor Mode'] || '').trim().toUpperCase();
  if (['GOOGLE + NATIVE CONTROLLED','GOOGLE + NATIVE'].indexOf(processorMode) < 0) {
    throw new Error('Gate D preflight requires a native-capable shared Processor Mode.');
  }

  const intake = SpreadsheetApp.openById(ADB_NATIVE_SIGNUP_PROD.PROD_INTAKE_ID);
  const requestSheet = adbSignupProdEnsureSheet_(
    intake,
    ADB_NATIVE_SIGNUP_PROD.REQUEST_SHEET,
    ADB_NATIVE_SIGNUP_PROD_REQUEST_HEADERS
  );
  const diagnosticSheet = adbSignupProdEnsureSheet_(
    intake,
    ADB_NATIVE_SIGNUP_PROD.DIAGNOSTIC_SHEET,
    ADB_NATIVE_SIGNUP_PROD_DIAGNOSTIC_HEADERS
  );

  if (adbSignupProdRows_(requestSheet).rows.length !== 0) {
    throw new Error('Gate D preflight requires an empty Native Signup Requests table.');
  }
  if (adbSignupProdRows_(diagnosticSheet).rows.length !== 0) {
    throw new Error('Gate D preflight requires an empty Native Signup Diagnostics table.');
  }

  const report = {
    build: ADB_NATIVE_SIGNUP_PROD.BUILD,
    endpointEnabled: false,
    endpointMode: 'CONTROLLED',
    allowlistConfigured: false,
    nativeSignupMode: 'DISABLED',
    processorMode: processorMode,
    requestRows: 0,
    diagnosticRows: 0,
    siteOrigin: ADB_NATIVE_SIGNUP_PROD.DEFAULT_SITE_ORIGIN,
    subscriberMutation: false
  };
  console.log(JSON.stringify(report));
  return report;
}

function setupNativeSignupProdV1() {
  adbSignupProdAssertTargets_();
  const intake = SpreadsheetApp.openById(ADB_NATIVE_SIGNUP_PROD.PROD_INTAKE_ID);
  const requestSheet = adbSignupProdEnsureSheet_(
    intake,
    ADB_NATIVE_SIGNUP_PROD.REQUEST_SHEET,
    ADB_NATIVE_SIGNUP_PROD_REQUEST_HEADERS
  );
  const diagnosticSheet = adbSignupProdEnsureSheet_(
    intake,
    ADB_NATIVE_SIGNUP_PROD.DIAGNOSTIC_SHEET,
    ADB_NATIVE_SIGNUP_PROD_DIAGNOSTIC_HEADERS
  );
  return {
    build: ADB_NATIVE_SIGNUP_PROD.BUILD,
    intakeId: intake.getId(),
    requestSheet: requestSheet.getName(),
    diagnosticSheet: diagnosticSheet.getName()
  };
}

function doPost(e) {
  adbSignupProdAssertEnabled_();

  if (e && e.postData && Number(e.postData.length || 0) > ADB_NATIVE_SIGNUP_PROD.MAX_POST_BYTES) {
    return adbSignupProdResult_({ok:false,status:'validation_error',code:'request_too_large',client_nonce:''});
  }

  const params = (e && e.parameter) || {};
  const nonce = String(params.client_nonce || '').trim();
  const browserSource = String(params.source || 'website').trim().toLowerCase();
  const email = adbSignupProdNormalizeEmail_(params.email);

  adbSignupProdAppendDiagnostic_('received','',email,'',nonce,browserSource,'');

  if (String(params.form_check || '').trim()) {
    adbSignupProdAppendDiagnostic_('noop','honeypot',email,'',nonce,browserSource,'');
    return adbSignupProdResult_({ok:true,status:'accepted',client_nonce:nonce});
  }

  if (String(params.action || '') !== 'request') {
    return adbSignupProdValidation_('invalid_action', nonce, email, browserSource);
  }
  if (!adbSignupProdValidEmail_(email)) {
    return adbSignupProdValidation_('invalid_email', nonce, email, browserSource);
  }
  if (String(params.consent || '').trim().toLowerCase() !== 'yes') {
    return adbSignupProdValidation_('consent_required', nonce, email, browserSource);
  }
  if (!/^[a-f0-9]{32}$/.test(nonce)) {
    return adbSignupProdValidation_('invalid_nonce', nonce, email, browserSource);
  }
  if (browserSource !== 'website') {
    return adbSignupProdValidation_('invalid_source', nonce, email, browserSource);
  }

  const mode = adbSignupProdMode_();
  if (mode === 'CONTROLLED' && !adbSignupProdControlledAuthorized_(email)) {
    adbSignupProdAppendDiagnostic_('noop','controlled_not_authorized',email,'',nonce,browserSource,'');
    return adbSignupProdResult_({ok:true,status:'accepted',client_nonce:nonce});
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const intake = SpreadsheetApp.openById(ADB_NATIVE_SIGNUP_PROD.PROD_INTAKE_ID);
    const requestSheet = adbSignupProdEnsureSheet_(
      intake,
      ADB_NATIVE_SIGNUP_PROD.REQUEST_SHEET,
      ADB_NATIVE_SIGNUP_PROD_REQUEST_HEADERS
    );

    const existing = adbSignupProdFindDuplicate_(requestSheet, email, nonce);
    if (existing) {
      adbSignupProdAppendDiagnostic_(
        'noop',
        existing.reason,
        email,
        existing.requestId,
        nonce,
        browserSource,
        'Existing production native-signup request reused.'
      );
      return adbSignupProdResult_({ok:true,status:'accepted',client_nonce:nonce});
    }

    const throttle = adbSignupProdCheckThrottle_(email);
    if (!throttle.ok) {
      adbSignupProdAppendDiagnostic_(
        'noop','rate_limited_' + throttle.reason,email,'',nonce,browserSource,''
      );
      return adbSignupProdResult_({
        ok:false,status:'rate_limited',code:throttle.reason,client_nonce:nonce
      });
    }

    const requestId = 'NSPROD-' + Utilities.getUuid();
    const responseKey = adbSignupProdResponseKey_(requestId, email, 'yes');
    requestSheet.appendRow([
      requestId,
      new Date(),
      email,
      'Yes',
      'NATIVE_SIGNUP_PROD',
      nonce,
      responseKey,
      'Staged',
      '',
      '',
      'Staged by FORM-7 production native signup endpoint; subscriber mutation remains processor-owned.'
    ]);
    SpreadsheetApp.flush();

    adbSignupProdAppendDiagnostic_(
      'staged','accepted',email,requestId,nonce,browserSource,''
    );

    console.log(JSON.stringify({
      event:'native_signup_prod_staged',
      build:ADB_NATIVE_SIGNUP_PROD.BUILD,
      mode:mode,
      requestId:requestId,
      subscriberMutation:false
    }));

    return adbSignupProdResult_({ok:true,status:'accepted',client_nonce:nonce});
  } finally {
    lock.releaseLock();
  }
}

function adbSignupProdValidation_(code, nonce, email, source) {
  adbSignupProdAppendDiagnostic_('validation_error',code,email,'',nonce,source,'');
  return adbSignupProdResult_({
    ok:false,status:'validation_error',code:code,client_nonce:nonce
  });
}

function adbSignupProdFindDuplicate_(sheet, email, nonce) {
  const table = adbSignupProdRows_(sheet);
  const cutoff = Date.now() - ADB_NATIVE_SIGNUP_PROD.DUPLICATE_WINDOW_MS;
  for (let i = table.rows.length - 1; i >= 0; i--) {
    const row = table.rows[i];
    if (adbSignupProdNormalizeEmail_(row.Email) !== email) continue;
    if (String(row['Client Nonce'] || '') === nonce) {
      return {requestId:String(row['Request ID'] || ''),reason:'same_nonce'};
    }
    const created = row['Created At'] instanceof Date
      ? row['Created At'].getTime()
      : new Date(row['Created At']).getTime();
    if (created && created >= cutoff && String(row.Consent || '').toLowerCase() === 'yes') {
      return {requestId:String(row['Request ID'] || ''),reason:'recent_equivalent'};
    }
  }
  return null;
}

function adbSignupProdCheckThrottle_(email) {
  const cache = CacheService.getScriptCache();
  const emailHash = adbSignupProdSha256Hex_(email).slice(0, 32);
  const cooldownKey = 'nsprod:cool:' + emailHash;
  if (cache.get(cooldownKey)) return {ok:false,reason:'cooldown'};

  const addressKey = 'nsprod:addr:' + emailHash;
  const addressCount = Number(cache.get(addressKey) || '0');
  if (addressCount >= ADB_NATIVE_SIGNUP_PROD.ADDRESS_WINDOW_MAX) {
    return {ok:false,reason:'address_cap'};
  }

  const globalKey = 'nsprod:global';
  const globalCount = Number(cache.get(globalKey) || '0');
  if (globalCount >= ADB_NATIVE_SIGNUP_PROD.GLOBAL_WINDOW_MAX) {
    return {ok:false,reason:'global_cap'};
  }

  cache.put(cooldownKey,'1',ADB_NATIVE_SIGNUP_PROD.ADDRESS_COOLDOWN_SECONDS);
  cache.put(addressKey,String(addressCount + 1),ADB_NATIVE_SIGNUP_PROD.ADDRESS_WINDOW_SECONDS);
  cache.put(globalKey,String(globalCount + 1),ADB_NATIVE_SIGNUP_PROD.GLOBAL_WINDOW_SECONDS);
  return {ok:true};
}

function adbSignupProdResponseKey_(requestId, email, consent) {
  const text = ['NativeSignupProd',requestId,email,consent].join('');
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    text,
    Utilities.Charset.UTF_8
  );
  return Utilities.base64EncodeWebSafe(digest).replace(/=+$/,'');
}

function adbSignupProdMode_() {
  const props = PropertiesService.getScriptProperties();
  const runtimeMode = String(
    props.getProperty(ADB_NATIVE_SIGNUP_PROD.MODE_PROPERTY) || ''
  ).trim().toUpperCase();
  if (runtimeMode !== 'CONTROLLED' && runtimeMode !== 'LIVE') {
    throw new Error('ADB_NATIVE_SIGNUP_PROD_MODE must be CONTROLLED or LIVE.');
  }

  const cfg = adbSignupProdIntegrationConfig_();
  const signupMode = String(cfg['Native Signup Mode'] || 'DISABLED').trim().toUpperCase();
  const processorMode = String(cfg['Processor Mode'] || '').trim().toUpperCase();

  if (['GOOGLE + NATIVE CONTROLLED','GOOGLE + NATIVE'].indexOf(processorMode) < 0) {
    throw new Error('Native signup requires a native-capable shared Processor Mode.');
  }

  if (runtimeMode === 'CONTROLLED' && signupMode !== 'CONTROLLED') {
    throw new Error('CONTROLLED native signup requires Native Signup Mode = CONTROLLED.');
  }
  if (runtimeMode === 'LIVE' && signupMode !== 'LIVE') {
    throw new Error('LIVE native signup requires Native Signup Mode = LIVE.');
  }

  return runtimeMode;
}

function adbSignupProdControlledAuthorized_(email) {
  const cfg = adbSignupProdIntegrationConfig_();
  const controlledEmail = adbSignupProdNormalizeEmail_(
    cfg['Native Signup Controlled Email']
  );
  if (!adbSignupProdValidEmail_(controlledEmail)) {
    throw new Error('Native Signup Controlled Email is missing or invalid.');
  }

  const allowlist = String(
    PropertiesService.getScriptProperties()
      .getProperty(ADB_NATIVE_SIGNUP_PROD.ALLOWLIST_PROPERTY) || ''
  )
    .split(',')
    .map(adbSignupProdNormalizeEmail_)
    .filter(Boolean);

  return email === controlledEmail && allowlist.indexOf(email) >= 0;
}

function adbSignupProdIntegrationConfig_() {
  const intake = SpreadsheetApp.openById(ADB_NATIVE_SIGNUP_PROD.PROD_INTAKE_ID);
  const sheet = intake.getSheetByName(ADB_NATIVE_SIGNUP_PROD.CONFIG_SHEET);
  if (!sheet) throw new Error('Production Integration Config is missing.');

  const values = sheet.getDataRange().getDisplayValues();
  const out = {};
  values.slice(1).forEach(function(row) {
    const key = String(row[0] || '').trim();
    if (key) out[key] = String(row[1] || '').trim();
  });

  if (out.Environment !== 'PRODUCTION') {
    throw new Error('Production native signup intake identity mismatch.');
  }
  if (out['Operational Production Database ID'] !== ADB_NATIVE_SIGNUP_PROD.PROD_DATABASE_ID) {
    throw new Error('Production native signup database identity mismatch.');
  }
  return out;
}

function adbSignupProdAppendDiagnostic_(eventName, reason, email, requestId, nonce, source, notes) {
  try {
    const intake = SpreadsheetApp.openById(ADB_NATIVE_SIGNUP_PROD.PROD_INTAKE_ID);
    const sheet = adbSignupProdEnsureSheet_(
      intake,
      ADB_NATIVE_SIGNUP_PROD.DIAGNOSTIC_SHEET,
      ADB_NATIVE_SIGNUP_PROD_DIAGNOSTIC_HEADERS
    );
    const hashPrefix = email ? adbSignupProdSha256Hex_(email).slice(0,12) : '';
    sheet.appendRow([
      new Date(),eventName,reason,hashPrefix,requestId || '',nonce || '',
      source || '',ADB_NATIVE_SIGNUP_PROD.BUILD,notes || ''
    ]);
  } catch (error) {
    console.error(JSON.stringify({
      event:'native_signup_prod_diagnostic_error',
      message:String(error)
    }));
  }
}

function adbSignupProdEnsureSheet_(spreadsheet, title, headers) {
  let sheet = spreadsheet.getSheetByName(title);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(title);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  const current = sheet.getRange(1,1,1,headers.length).getDisplayValues()[0];
  for (let i = 0; i < headers.length; i++) {
    if (String(current[i] || '') !== headers[i]) {
      throw new Error('Unexpected ' + title + ' header at column ' + (i + 1));
    }
  }
  return sheet;
}

function adbSignupProdRows_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);
  return {
    headers:headers,
    rows:values.slice(1)
      .filter(function(row){
        return row.some(function(value){return value !== '';});
      })
      .map(function(row){
        return headers.reduce(function(out,header,index){
          if (!Object.prototype.hasOwnProperty.call(out, header)) out[header]=row[index];
          return out;
        },{});
      })
  };
}

function adbSignupProdNormalizeEmail_(value) {
  return String(value || '').trim().toLowerCase();
}

function adbSignupProdValidEmail_(email) {
  if (!email || email.length > 254 || /\s/.test(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function adbSignupProdSha256Hex_(text) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(text || ''),
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(value){
    const n = value < 0 ? value + 256 : value;
    return ('0' + n.toString(16)).slice(-2);
  }).join('');
}

function adbSignupProdResult_(payload) {
  const safe = JSON.stringify(payload).replace(/</g,'\u003c');
  const origin = String(
    PropertiesService.getScriptProperties()
      .getProperty(ADB_NATIVE_SIGNUP_PROD.SITE_ORIGIN_PROPERTY) ||
    ADB_NATIVE_SIGNUP_PROD.DEFAULT_SITE_ORIGIN
  ).trim();

  if (origin !== ADB_NATIVE_SIGNUP_PROD.DEFAULT_SITE_ORIGIN) {
    throw new Error('Native signup production site origin mismatch.');
  }

  const result = Object.assign({}, payload, {type:'adb-native-signup-prod'});
  const resultSafe = JSON.stringify(result).replace(/</g,'\u003c');
  return HtmlService.createHtmlOutput(
    '<!doctype html><meta charset="utf-8"><script>window.top.postMessage(' +
    resultSafe + ',' + JSON.stringify(origin) + ');<\/script>'
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function adbSignupProdAssertEnabled_() {
  adbSignupProdAssertTargets_();
  const enabled = String(
    PropertiesService.getScriptProperties()
      .getProperty(ADB_NATIVE_SIGNUP_PROD.ENABLED_PROPERTY) || ''
  ).trim().toUpperCase();
  if (enabled !== 'TRUE') {
    throw new Error('Production native signup endpoint is disabled.');
  }
}

function adbSignupProdAssertTargets_() {
  if (ADB_NATIVE_SIGNUP_PROD.PROD_INTAKE_ID === ADB_NATIVE_SIGNUP_PROD.FORBIDDEN_DEV_INTAKE_ID ||
      ADB_NATIVE_SIGNUP_PROD.PROD_DATABASE_ID === ADB_NATIVE_SIGNUP_PROD.FORBIDDEN_DEV_DATABASE_ID) {
    throw new Error('Production native signup target collided with DEV.');
  }

  const database = SpreadsheetApp.openById(ADB_NATIVE_SIGNUP_PROD.PROD_DATABASE_ID);
  const envSheet = database.getSheetByName(ADB_NATIVE_SIGNUP_PROD.ENVIRONMENT_SHEET);
  if (!envSheet) throw new Error('Production Environment sheet is missing.');

  const values = envSheet.getDataRange().getDisplayValues();
  const env = {};
  values.slice(1).forEach(function(row) {
    const key = String(row[0] || '').trim();
    if (key) env[key] = String(row[1] || '').trim();
  });

  if (env.Environment !== 'PRODUCTION') {
    throw new Error('Production native signup Environment mismatch.');
  }
  if (env['Database ID'] !== ADB_NATIVE_SIGNUP_PROD.PROD_DATABASE_ID) {
    throw new Error('Production native signup database identity mismatch.');
  }
  if (env['Development Database ID'] !== ADB_NATIVE_SIGNUP_PROD.FORBIDDEN_DEV_DATABASE_ID) {
    throw new Error('Production native signup DEV reference mismatch.');
  }
  if (env['Production Writes'] !== 'ENABLED') {
    throw new Error('Production native signup database write gate is not enabled.');
  }
  if (env['Schema Baseline'] !== 'GOOGLE-23-1') {
    throw new Error('Production native signup schema mismatch.');
  }

  adbSignupProdIntegrationConfig_();
}
