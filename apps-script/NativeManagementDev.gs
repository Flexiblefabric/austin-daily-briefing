/**
 * Austin Daily Briefing — FORM-9 native management DEV intake + confirmation.
 *
 * DEV ONLY. Hard-wired to DEV workbooks and explicitly rejects production IDs.
 * This endpoint stages and confirms management requests only. It never mutates
 * subscriber/profile/preferences state; NativeManagementDevProcessor.gs owns
 * controlled DEV application.
 *
 * Required Script Properties for controlled live DEV testing:
 * - ADB_NATIVE_MANAGE_DEV_ENABLED=TRUE
 * - ADB_NATIVE_MANAGE_DEV_WEB_APP_URL=<current DEV /exec URL>
 * - ADB_NATIVE_MANAGE_DEV_SITE_ORIGIN=https://austindailybriefing.com
 * - ADB_NATIVE_MANAGE_DEV_SEND_EMAIL=TRUE
 * - ADB_NATIVE_MANAGE_DEV_ALLOWLIST=<controlled DEV recipient(s)>
 * - ADB_NATIVE_MANAGE_DEV_CONFIRM_PAGE_URL=https://austindailybriefing.com/manage-confirm.html
 * - RESEND_API_KEY=<secret>
 */

const ADB_NATIVE_MANAGE_DEV = Object.freeze({
  DEV_INTAKE_ID: '1TiSgmFxij8p3wKnt_skTFXQvAOEuR2wI5c6V8Jq_Yyw',
  DEV_DATABASE_ID: '1rl5GTOvuBSHyFK1r9CqI_6Z5gAwtgsTQnQQf9VCMeyM',
  PROD_INTAKE_ID: '1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho',
  PROD_DATABASE_ID: '1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0',

  REQUEST_SHEET: 'Native Manage Requests',
  VERIFICATION_SHEET: 'Native Manage Verification Queue',
  DIAGNOSTIC_SHEET: 'Native Manage Diagnostics',
  SUBSCRIBERS_SHEET: 'Subscribers',

  BUILD_ID: 'native-management-dev-v0.1',

  ENABLED_PROPERTY: 'ADB_NATIVE_MANAGE_DEV_ENABLED',
  WEB_APP_URL_PROPERTY: 'ADB_NATIVE_MANAGE_DEV_WEB_APP_URL',
  SITE_ORIGIN_PROPERTY: 'ADB_NATIVE_MANAGE_DEV_SITE_ORIGIN',
  SEND_EMAIL_PROPERTY: 'ADB_NATIVE_MANAGE_DEV_SEND_EMAIL',
  ALLOWLIST_PROPERTY: 'ADB_NATIVE_MANAGE_DEV_ALLOWLIST',
  CONFIRM_PAGE_URL_PROPERTY: 'ADB_NATIVE_MANAGE_DEV_CONFIRM_PAGE_URL',
  RESEND_KEY_PROPERTY: 'RESEND_API_KEY',

  DEFAULT_SITE_ORIGIN: 'https://austindailybriefing.com',
  RESEND_ENDPOINT: 'https://api.resend.com/emails',
  FROM: 'Austin Daily Briefing <briefing@austindailybriefing.com>',
  REPLY_TO: 'briefing@austindailybriefing.com',

  TOKEN_TTL_MS: 24 * 60 * 60 * 1000,
  MAX_POST_BYTES: 4096,
  ADDRESS_COOLDOWN_SECONDS: 60,
  ADDRESS_WINDOW_SECONDS: 6 * 60 * 60,
  ADDRESS_WINDOW_MAX: 5,
  GLOBAL_WINDOW_SECONDS: 60 * 60,
  GLOBAL_WINDOW_MAX: 50,
  DUPLICATE_WINDOW_MS: 10 * 60 * 1000
});

const ADB_NATIVE_MANAGE_REQUEST_HEADERS = Object.freeze([
  'Request ID','Created At','Email','Delivery Action','Reset Topics',
  'Payload SHA-256','Source','Client Nonce','Status','Verification ID',
  'Confirmed At','Applied At','Result','Notes'
]);

const ADB_NATIVE_MANAGE_VERIFICATION_HEADERS = Object.freeze([
  'Verification ID','Created At','Expires At','Email','Request ID',
  'Token Hash SHA-256','Status','Confirmed At','Applied At','Notes'
]);

const ADB_NATIVE_MANAGE_DIAGNOSTIC_HEADERS = Object.freeze([
  'Created At','Event','Reason','Email Hash Prefix','Client Nonce Present','Build ID'
]);

function setupNativeManagementDevV1() {
  adbManageAssertDevTargets_();
  const intake = SpreadsheetApp.openById(ADB_NATIVE_MANAGE_DEV.DEV_INTAKE_ID);
  const requestSheet = adbManageEnsureSheet_(intake,
    ADB_NATIVE_MANAGE_DEV.REQUEST_SHEET, ADB_NATIVE_MANAGE_REQUEST_HEADERS);
  const verificationSheet = adbManageEnsureSheet_(intake,
    ADB_NATIVE_MANAGE_DEV.VERIFICATION_SHEET, ADB_NATIVE_MANAGE_VERIFICATION_HEADERS);
  const diagnosticSheet = adbManageEnsureSheet_(intake,
    ADB_NATIVE_MANAGE_DEV.DIAGNOSTIC_SHEET, ADB_NATIVE_MANAGE_DIAGNOSTIC_HEADERS);

  const report = {
    build: ADB_NATIVE_MANAGE_DEV.BUILD_ID,
    intakeId: ADB_NATIVE_MANAGE_DEV.DEV_INTAKE_ID,
    databaseId: ADB_NATIVE_MANAGE_DEV.DEV_DATABASE_ID,
    requestSheet: requestSheet.getName(),
    verificationSheet: verificationSheet.getName(),
    diagnosticSheet: diagnosticSheet.getName(),
    productionTouched: false
  };
  console.log(JSON.stringify(report));
  return report;
}

function getNativeManagementDevRuntimeStatusV1() {
  adbManageAssertDevTargets_();
  const props = PropertiesService.getScriptProperties();
  const allowlist = adbManageAllowlist_();
  return {
    build: ADB_NATIVE_MANAGE_DEV.BUILD_ID,
    enabled: String(props.getProperty(ADB_NATIVE_MANAGE_DEV.ENABLED_PROPERTY) || '').trim().toUpperCase() === 'TRUE',
    sendEmail: String(props.getProperty(ADB_NATIVE_MANAGE_DEV.SEND_EMAIL_PROPERTY) || '').trim().toUpperCase() === 'TRUE',
    allowlistConfigured: allowlist.length > 0,
    webAppConfigured: /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(
      String(props.getProperty(ADB_NATIVE_MANAGE_DEV.WEB_APP_URL_PROPERTY) || '').trim()
    ),
    siteOrigin: String(props.getProperty(ADB_NATIVE_MANAGE_DEV.SITE_ORIGIN_PROPERTY) || '').trim() || 'UNSET',
    confirmPageConfigured: String(props.getProperty(ADB_NATIVE_MANAGE_DEV.CONFIRM_PAGE_URL_PROPERTY) || '').trim() ===
      'https://austindailybriefing.com/manage-confirm.html',
    productionTouched: false
  };
}

function logNativeManagementDevRuntimeStatusV1() {
  const status = getNativeManagementDevRuntimeStatusV1();
  console.log(JSON.stringify(status));
  return status;
}

function doPost(e) {
  try {
    adbManageAssertDevEnabled_();
    const params = adbManageEventParams_(e);
    const action = String(params.action || 'request').trim().toLowerCase();

    if (action === 'confirm') {
      const result = adbManageConfirmRequestDevV1_(params.token || '');
      return adbManageConfirmPostMessageHtml_(result, String(params.client_nonce || ''));
    }

    if (action !== 'request') {
      return adbManagePostMessageHtml_(
        adbManageValidationResult_('invalid_action'),
        String(params.client_nonce || '')
      );
    }

    const result = adbManageStageRequestDevV1_(e, params);
    return adbManagePostMessageHtml_(result, String(params.client_nonce || ''));
  } catch (error) {
    console.error('Native management DEV request failed: ' +
      String(error && error.message ? error.message : error).slice(0, 500));
    const params = adbManageEventParams_(e);
    const failure = {ok:false,status:'temporary_error'};
    if (String(params.action || '').trim().toLowerCase() === 'confirm') {
      return adbManageConfirmPostMessageHtml_(failure, String(params.client_nonce || ''));
    }
    failure.message = 'We could not process that request right now. Please try again later.';
    return adbManagePostMessageHtml_(failure, String(params.client_nonce || ''));
  }
}

function doGet() {
  return adbManageSimpleHtml_('Austin Daily Briefing',
    'Use the first-party ADB management confirmation page from the link in your email.');
}

function adbManageStageRequestDevV1_(e, params) {
  setupNativeManagementDevV1();

  if (e && e.postData && Number(e.postData.length || 0) > ADB_NATIVE_MANAGE_DEV.MAX_POST_BYTES) {
    return adbManageValidationResult_('request_too_large');
  }

  const allowedFields = [
    'action','email','delivery_action','reset_topics',
    'client_nonce','form_check','source'
  ];
  const unexpected = Object.keys(params || {}).filter(function(key) {
    return allowedFields.indexOf(key) < 0;
  });
  if (unexpected.length) return adbManageValidationResult_('unexpected_field');

  const email = adbManageNormalizeEmail_(params.email);
  const nonce = String(params.client_nonce || '').trim();
  const source = String(params.source || 'website').trim().toLowerCase();
  const honeypot = String(params.form_check || '').trim();

  if (honeypot) {
    adbManageAppendDiagnostic_('noop','honeypot',email,nonce);
    return adbManageAcceptedResult_();
  }
  if (!adbManageValidEmail_(email)) return adbManageValidationResult_('invalid_email');
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(nonce)) return adbManageValidationResult_('invalid_nonce');
  if (source !== 'website') return adbManageValidationResult_('invalid_source');

  const payload = adbManagePayloadFromParams_(params);
  if (!payload.ok) return adbManageValidationResult_(payload.code);

  if (!adbManageRateLimitAllowed_(email)) {
    adbManageAppendDiagnostic_('blocked','rate_limited',email,nonce);
    return {ok:false,status:'rate_limited',message:'Please wait before trying again.'};
  }

  const subscriber = adbManageFindUniqueSubscriberDev_(email);
  if (!subscriber) {
    adbManageAppendDiagnostic_('noop','unknown_or_ambiguous_subscriber',email,nonce);
    return adbManageAcceptedResult_();
  }

  const allowlist = adbManageAllowlist_();
  if (allowlist.indexOf(email) < 0) {
    adbManageAppendDiagnostic_('noop','outside_dev_allowlist',email,nonce);
    return adbManageAcceptedResult_();
  }

  const props = PropertiesService.getScriptProperties();
  const webAppUrl = String(props.getProperty(ADB_NATIVE_MANAGE_DEV.WEB_APP_URL_PROPERTY) || '').trim();
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(webAppUrl)) {
    throw new Error('ADB_NATIVE_MANAGE_DEV_WEB_APP_URL is missing or invalid.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const intake = SpreadsheetApp.openById(ADB_NATIVE_MANAGE_DEV.DEV_INTAKE_ID);
    const requestSheet = intake.getSheetByName(ADB_NATIVE_MANAGE_DEV.REQUEST_SHEET);
    const verificationSheet = intake.getSheetByName(ADB_NATIVE_MANAGE_DEV.VERIFICATION_SHEET);
    const requests = adbManageRowsByHeader_(requestSheet);

    const duplicate = adbManageFindRecentEquivalentRequest_(requests, email, payload.hash);
    if (duplicate) {
      adbManageAppendDiagnostic_('noop','recent_equivalent_request',email,nonce);
      return adbManageAcceptedResult_();
    }

    const now = new Date();
    const requestId = 'NMDEV-' + Utilities.getUuid();
    const verificationId = 'NMVDEV-' + Utilities.getUuid();
    const rawToken = adbManageGenerateToken_();
    const tokenHash = adbManageSha256Hex_(rawToken);
    const expiresAt = new Date(now.getTime() + ADB_NATIVE_MANAGE_DEV.TOKEN_TTL_MS);

    requestSheet.appendRow(adbManageObjectToRow_(ADB_NATIVE_MANAGE_REQUEST_HEADERS, {
      'Request ID': requestId,
      'Created At': now.toISOString(),
      'Email': email,
      'Delivery Action': payload.deliveryAction,
      'Reset Topics': payload.resetTopics ? 'TRUE' : 'FALSE',
      'Payload SHA-256': payload.hash,
      'Source': 'NATIVE_MANAGE_DEV',
      'Client Nonce': nonce,
      'Status': 'Pending Confirmation',
      'Verification ID': verificationId,
      'Confirmed At': '',
      'Applied At': '',
      'Result': '',
      'Notes': 'Controlled DEV management request.'
    }));
    const requestRow = requestSheet.getLastRow();

    verificationSheet.appendRow(adbManageObjectToRow_(ADB_NATIVE_MANAGE_VERIFICATION_HEADERS, {
      'Verification ID': verificationId,
      'Created At': now.toISOString(),
      'Expires At': expiresAt.toISOString(),
      'Email': email,
      'Request ID': requestId,
      'Token Hash SHA-256': tokenHash,
      'Status': 'Pending',
      'Confirmed At': '',
      'Applied At': '',
      'Notes': 'Controlled DEV management verification.'
    }));
    const verificationRow = verificationSheet.getLastRow();

    const sendEmail = String(props.getProperty(ADB_NATIVE_MANAGE_DEV.SEND_EMAIL_PROPERTY) || '')
      .trim().toUpperCase() === 'TRUE';

    if (!sendEmail) {
      adbManageSetByHeader_(verificationSheet, verificationRow,
        ADB_NATIVE_MANAGE_VERIFICATION_HEADERS, 'Status', 'Cancelled');
      adbManageSetByHeader_(verificationSheet, verificationRow,
        ADB_NATIVE_MANAGE_VERIFICATION_HEADERS, 'Notes',
        'DEV confirmation delivery disabled; raw token discarded.');
      adbManageSetByHeader_(requestSheet, requestRow,
        ADB_NATIVE_MANAGE_REQUEST_HEADERS, 'Status', 'Deferred — Confirmation Disabled');
      adbManageSetByHeader_(requestSheet, requestRow,
        ADB_NATIVE_MANAGE_REQUEST_HEADERS, 'Notes',
        'DEV confirmation delivery disabled; request not eligible for application.');
      return adbManageAcceptedResult_();
    }

    try {
      const confirmationPage = String(props.getProperty(
        ADB_NATIVE_MANAGE_DEV.CONFIRM_PAGE_URL_PROPERTY
      ) || '').trim();
      if (confirmationPage !== 'https://austindailybriefing.com/manage-confirm.html') {
        throw new Error('ADB_NATIVE_MANAGE_DEV_CONFIRM_PAGE_URL is missing or invalid.');
      }
      const confirmationUrl = confirmationPage + '#env=development&token=' +
        encodeURIComponent(rawToken);
      const providerId = adbManageSendVerificationEmailDev_(
        email, confirmationUrl, payload.deliveryAction, payload.resetTopics
      );
      adbManageSetByHeader_(verificationSheet, verificationRow,
        ADB_NATIVE_MANAGE_VERIFICATION_HEADERS, 'Notes',
        'Controlled DEV management confirmation sent. Provider ID: ' + providerId);
      adbManageSetByHeader_(requestSheet, requestRow,
        ADB_NATIVE_MANAGE_REQUEST_HEADERS, 'Notes',
        'Controlled DEV management confirmation sent.');
    } catch (error) {
      adbManageSetByHeader_(verificationSheet, verificationRow,
        ADB_NATIVE_MANAGE_VERIFICATION_HEADERS, 'Status', 'Cancelled');
      adbManageSetByHeader_(verificationSheet, verificationRow,
        ADB_NATIVE_MANAGE_VERIFICATION_HEADERS, 'Notes',
        'Confirmation send failed; raw token discarded.');
      adbManageSetByHeader_(requestSheet, requestRow,
        ADB_NATIVE_MANAGE_REQUEST_HEADERS, 'Status', 'Deferred — Confirmation Blocked');
      adbManageSetByHeader_(requestSheet, requestRow,
        ADB_NATIVE_MANAGE_REQUEST_HEADERS, 'Notes',
        'Confirmation delivery failed; request not eligible for application.');
      throw error;
    }

    adbManageAppendDiagnostic_('staged','pending_confirmation',email,nonce);
    return adbManageAcceptedResult_();
  } finally {
    lock.releaseLock();
  }
}

function adbManageConfirmRequestDevV1_(rawToken) {
  setupNativeManagementDevV1();
  const token = String(rawToken || '').trim();
  if (token.length < 32 || token.length > 256) {
    return {ok:false,status:'invalid_or_expired'};
  }
  const tokenHash = adbManageSha256Hex_(token);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const intake = SpreadsheetApp.openById(ADB_NATIVE_MANAGE_DEV.DEV_INTAKE_ID);
    const verificationSheet = intake.getSheetByName(ADB_NATIVE_MANAGE_DEV.VERIFICATION_SHEET);
    const requestSheet = intake.getSheetByName(ADB_NATIVE_MANAGE_DEV.REQUEST_SHEET);
    const verifications = adbManageRowsByHeader_(verificationSheet);
    let match = null;

    verifications.rows.forEach(function(row, index) {
      if (String(row.Status || '') !== 'Pending') return;
      if (!adbManageConstantTimeEqual_(
          String(row['Token Hash SHA-256'] || ''), tokenHash)) return;
      if (match) throw new Error('Ambiguous management verification token hash.');
      match = {row:row,sheetRow:index+2};
    });

    if (!match) return {ok:false,status:'invalid_or_expired'};

    const expires = new Date(String(match.row['Expires At'] || ''));
    if (!expires.getTime() || expires.getTime() <= Date.now()) {
      adbManageSetByHeader_(verificationSheet, match.sheetRow,
        verifications.headers, 'Status', 'Expired');
      return {ok:false,status:'invalid_or_expired'};
    }

    const requests = adbManageRowsByHeader_(requestSheet);
    const requestMatch = adbManageFindUniqueRow_(
      requests, 'Request ID', String(match.row['Request ID'] || '')
    );
    if (!requestMatch) return {ok:false,status:'invalid_or_expired'};

    const request = requestMatch.row;
    if (String(request.Status || '') !== 'Pending Confirmation' ||
        String(request['Verification ID'] || '') !== String(match.row['Verification ID'] || '') ||
        adbManageNormalizeEmail_(request.Email) !== adbManageNormalizeEmail_(match.row.Email)) {
      return {ok:false,status:'invalid_or_expired'};
    }

    const recomputed = adbManagePayloadFromStoredRequest_(request);
    if (!recomputed.ok ||
        !adbManageConstantTimeEqual_(recomputed.hash, String(request['Payload SHA-256'] || ''))) {
      throw new Error('Management payload binding mismatch.');
    }

    const now = new Date().toISOString();
    adbManageSetByHeader_(verificationSheet, match.sheetRow,
      verifications.headers, 'Status', 'Confirmed');
    adbManageSetByHeader_(verificationSheet, match.sheetRow,
      verifications.headers, 'Confirmed At', now);
    adbManageSetByHeader_(requestSheet, requestMatch.sheetRow,
      requests.headers, 'Status', 'Confirmed');
    adbManageSetByHeader_(requestSheet, requestMatch.sheetRow,
      requests.headers, 'Confirmed At', now);
    SpreadsheetApp.flush();

    return {ok:true,status:'confirmed'};
  } finally {
    lock.releaseLock();
  }
}

function adbManagePayloadFromParams_(params) {
  const delivery = String(params.delivery_action || 'keep_current').trim().toLowerCase();
  if (['keep_current','pause','resume','unsubscribe'].indexOf(delivery) < 0) {
    return {ok:false,code:'invalid_delivery_action'};
  }
  const resetRaw = String(params.reset_topics || '').trim().toLowerCase();
  const reset = ['yes','true','1','on'].indexOf(resetRaw) >= 0;
  if (resetRaw && !reset && ['no','false','0','off'].indexOf(resetRaw) < 0) {
    return {ok:false,code:'invalid_reset'};
  }
  if (delivery === 'keep_current' && !reset) return {ok:false,code:'no_changes'};
  const canonical = JSON.stringify({
    delivery_action: delivery,
    reset_topics: reset
  });
  return {
    ok:true,
    deliveryAction:delivery,
    resetTopics:reset,
    canonical:canonical,
    hash:adbManageSha256Hex_(canonical)
  };
}

function adbManagePayloadFromStoredRequest_(request) {
  return adbManagePayloadFromParams_({
    delivery_action:String(request['Delivery Action'] || ''),
    reset_topics:String(request['Reset Topics'] || '').trim().toUpperCase() === 'TRUE' ? 'yes' : 'no'
  });
}

function adbManageFindRecentEquivalentRequest_(table, email, payloadHash) {
  let found = null;
  const now = Date.now();
  table.rows.forEach(function(row, index) {
    if (found) return;
    if (adbManageNormalizeEmail_(row.Email) !== email) return;
    if (String(row['Payload SHA-256'] || '') !== payloadHash) return;
    if (['Pending Confirmation','Confirmed','Processing'].indexOf(String(row.Status || '')) < 0) return;
    const created = new Date(String(row['Created At'] || '')).getTime();
    if (!created || now - created > ADB_NATIVE_MANAGE_DEV.DUPLICATE_WINDOW_MS) return;
    found = {row:row,sheetRow:index+2};
  });
  return found;
}

function adbManageFindUniqueSubscriberDev_(email) {
  adbManageAssertDevTargets_();
  const database = SpreadsheetApp.openById(ADB_NATIVE_MANAGE_DEV.DEV_DATABASE_ID);
  const sheet = database.getSheetByName(ADB_NATIVE_MANAGE_DEV.SUBSCRIBERS_SHEET);
  if (!sheet) throw new Error('DEV Subscribers sheet is missing.');
  const table = adbManageRowsByHeader_(sheet);
  const matches = table.rows.filter(function(row) {
    return adbManageNormalizeEmail_(row.Email) === email;
  });
  if (matches.length !== 1) return null;
  const row = matches[0];
  if (!String(row['Profile ID'] || '').trim()) return null;
  return row;
}

function adbManageRateLimitAllowed_(email) {
  const cache = CacheService.getScriptCache();
  const emailKey = adbManageSha256Hex_(email).slice(0, 24);
  const nowBucket = Math.floor(Date.now() / 1000);

  const cooldownKey = 'nm:cool:' + emailKey;
  if (cache.get(cooldownKey)) return false;
  cache.put(cooldownKey, '1', ADB_NATIVE_MANAGE_DEV.ADDRESS_COOLDOWN_SECONDS);

  const addressWindow = Math.floor(nowBucket / ADB_NATIVE_MANAGE_DEV.ADDRESS_WINDOW_SECONDS);
  const addressKey = 'nm:addr:' + emailKey + ':' + addressWindow;
  const addressCount = Number(cache.get(addressKey) || '0') + 1;
  if (addressCount > ADB_NATIVE_MANAGE_DEV.ADDRESS_WINDOW_MAX) return false;
  cache.put(addressKey, String(addressCount), ADB_NATIVE_MANAGE_DEV.ADDRESS_WINDOW_SECONDS);

  const globalWindow = Math.floor(nowBucket / ADB_NATIVE_MANAGE_DEV.GLOBAL_WINDOW_SECONDS);
  const globalKey = 'nm:global:' + globalWindow;
  const globalCount = Number(cache.get(globalKey) || '0') + 1;
  if (globalCount > ADB_NATIVE_MANAGE_DEV.GLOBAL_WINDOW_MAX) return false;
  cache.put(globalKey, String(globalCount), ADB_NATIVE_MANAGE_DEV.GLOBAL_WINDOW_SECONDS);

  return true;
}

function adbManageSendVerificationEmailDev_(email, confirmationUrl, deliveryAction, resetTopics) {
  const props = PropertiesService.getScriptProperties();
  const apiKey = String(props.getProperty(ADB_NATIVE_MANAGE_DEV.RESEND_KEY_PROPERTY) || '').trim();
  if (!apiKey) throw new Error('RESEND_API_KEY is missing.');

  const changes = [];
  if (deliveryAction === 'pause') changes.push('Pause briefing delivery');
  if (deliveryAction === 'resume') changes.push('Resume briefing delivery');
  if (deliveryAction === 'unsubscribe') changes.push('Unsubscribe from briefing delivery');
  if (resetTopics) changes.push('Reset every active topic preference to Normal');

  const html = [
    '<p>We received an Austin Daily Briefing management request.</p>',
    '<p><strong>Requested change:</strong> ' + adbManageEscapeHtml_(changes.join(' + ')) + '</p>',
    '<p>Nothing changes unless you confirm using the single-use link below.</p>',
    '<p><a href="' + adbManageEscapeHtml_(confirmationUrl) + '">Confirm this request</a></p>',
    '<p>If you did not request this, ignore this message.</p>'
  ].join('');

  const payload = {
    from: ADB_NATIVE_MANAGE_DEV.FROM,
    to: [email],
    reply_to: ADB_NATIVE_MANAGE_DEV.REPLY_TO,
    subject: 'Confirm your Austin Daily Briefing management request',
    html: html,
    text: 'We received an Austin Daily Briefing management request. Confirm it here: ' +
      confirmationUrl + '\n\nIf you did not request this, ignore this message.'
  };

  const response = UrlFetchApp.fetch(ADB_NATIVE_MANAGE_DEV.RESEND_ENDPOINT, {
    method:'post',
    muteHttpExceptions:true,
    contentType:'application/json',
    headers:{Authorization:'Bearer ' + apiKey},
    payload:JSON.stringify(payload)
  });
  const code = Number(response.getResponseCode());
  let result = {};
  try { result = JSON.parse(response.getContentText() || '{}'); } catch (ignored) {}
  if (code < 200 || code >= 300 || !result.id) {
    throw new Error('Resend management confirmation failed with HTTP ' + code + '.');
  }
  return String(result.id);
}

function adbManageConfirmPostMessageHtml_(result, clientNonce) {
  const origin = String(PropertiesService.getScriptProperties()
    .getProperty(ADB_NATIVE_MANAGE_DEV.SITE_ORIGIN_PROPERTY) ||
    ADB_NATIVE_MANAGE_DEV.DEFAULT_SITE_ORIGIN).trim();
  const nonce = /^[A-Za-z0-9_-]{16,128}$/.test(String(clientNonce || ''))
    ? String(clientNonce) : '';
  const payload = JSON.stringify({
    type:'adb-native-manage-confirm-dev',
    ok:!!result.ok,
    status:String(result.status || 'temporary_error'),
    client_nonce:nonce
  }).replace(/</g, '\\u003c');

  return HtmlService.createHtmlOutput(
    '<!doctype html><meta charset="utf-8"><script>window.top.postMessage(' +
    payload + ',' + JSON.stringify(origin) + ');<\\/script>'
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function adbManagePostMessageHtml_(result, clientNonce) {
  const origin = String(PropertiesService.getScriptProperties()
    .getProperty(ADB_NATIVE_MANAGE_DEV.SITE_ORIGIN_PROPERTY) ||
    ADB_NATIVE_MANAGE_DEV.DEFAULT_SITE_ORIGIN).trim();
  const nonce = /^[A-Za-z0-9_-]{16,128}$/.test(String(clientNonce || ''))
    ? String(clientNonce) : '';
  const payload = JSON.stringify({
    type:'adb-native-manage-dev',
    ok:!!result.ok,
    status:String(result.status || 'temporary_error'),
    code:String(result.code || ''),
    message:String(result.message || ''),
    client_nonce:nonce
  }).replace(/</g, '\\u003c');

  return HtmlService.createHtmlOutput(
    '<!doctype html><meta charset="utf-8"><script>window.top.postMessage(' +
    payload + ',' + JSON.stringify(origin) + ');<\/script>'
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function adbManageAcceptedResult_() {
  return {
    ok:true,
    status:'accepted',
    message:'If that address is connected to Austin Daily Briefing, we’ll send a confirmation link for the requested change. Nothing changes until the request is confirmed.'
  };
}

function adbManageValidationResult_(code) {
  const messages = {
    invalid_email:'Enter a valid email address.',
    no_changes:'Choose a delivery change, a topic reset, or both.',
    invalid_delivery_action:'Choose a valid delivery action.',
    invalid_reset:'Choose a valid reset option.',
    invalid_nonce:'Refresh the page and try again.',
    invalid_source:'Refresh the page and try again.',
    invalid_action:'Refresh the page and try again.',
    unexpected_field:'The request contains unsupported fields.',
    request_too_large:'The request is too large.'
  };
  return {
    ok:false,
    status:'validation_error',
    code:String(code || 'invalid_request'),
    message:messages[code] || 'Review the form and try again.'
  };
}

function adbManageAppendDiagnostic_(eventName, reason, email, nonce) {
  const intake = SpreadsheetApp.openById(ADB_NATIVE_MANAGE_DEV.DEV_INTAKE_ID);
  const sheet = adbManageEnsureSheet_(intake,
    ADB_NATIVE_MANAGE_DEV.DIAGNOSTIC_SHEET, ADB_NATIVE_MANAGE_DIAGNOSTIC_HEADERS);
  sheet.appendRow(adbManageObjectToRow_(ADB_NATIVE_MANAGE_DIAGNOSTIC_HEADERS, {
    'Created At':new Date().toISOString(),
    'Event':String(eventName || ''),
    'Reason':String(reason || ''),
    'Email Hash Prefix':email ? adbManageSha256Hex_(email).slice(0, 12) : '',
    'Client Nonce Present':nonce ? 'TRUE' : 'FALSE',
    'Build ID':ADB_NATIVE_MANAGE_DEV.BUILD_ID
  }));
}

function adbManageAllowlist_() {
  return String(PropertiesService.getScriptProperties()
    .getProperty(ADB_NATIVE_MANAGE_DEV.ALLOWLIST_PROPERTY) || '')
    .split(',')
    .map(adbManageNormalizeEmail_)
    .filter(Boolean);
}

function adbManageAssertDevEnabled_() {
  adbManageAssertDevTargets_();
  const enabled = String(PropertiesService.getScriptProperties()
    .getProperty(ADB_NATIVE_MANAGE_DEV.ENABLED_PROPERTY) || '').trim().toUpperCase();
  if (enabled !== 'TRUE') throw new Error('Native management DEV endpoint is disabled.');
}

function adbManageAssertDevTargets_() {
  if (ADB_NATIVE_MANAGE_DEV.DEV_INTAKE_ID === ADB_NATIVE_MANAGE_DEV.PROD_INTAKE_ID ||
      ADB_NATIVE_MANAGE_DEV.DEV_DATABASE_ID === ADB_NATIVE_MANAGE_DEV.PROD_DATABASE_ID) {
    throw new Error('FORM-9 DEV boundary collided with production.');
  }

  const database = SpreadsheetApp.openById(ADB_NATIVE_MANAGE_DEV.DEV_DATABASE_ID);
  const env = database.getSheetByName('Environment');
  if (!env) throw new Error('DEV Environment sheet is missing.');
  const values = env.getDataRange().getDisplayValues();
  const flat = values.reduce(function(all,row){ return all.concat(row); }, [])
    .map(function(v){ return String(v || '').trim().toUpperCase(); });
  if (flat.indexOf('DEVELOPMENT') < 0 && flat.indexOf('DEV') < 0) {
    throw new Error('FORM-9 DEV database environment marker is missing.');
  }
}

function adbManageEnsureSheet_(book, name, headers) {
  let sheet = book.getSheetByName(name);
  if (!sheet) {
    sheet = book.insertSheet(name);
    sheet.getRange(1,1,1,headers.length).setValues([headers.slice()]);
  } else if (sheet.getLastRow() === 0) {
    sheet.getRange(1,1,1,headers.length).setValues([headers.slice()]);
  } else {
    const actual = sheet.getRange(1,1,1,headers.length).getDisplayValues()[0];
    for (let i=0;i<headers.length;i++) {
      if (String(actual[i] || '') !== headers[i]) {
        throw new Error('Unexpected header in ' + name + ' column ' + (i+1) + '.');
      }
    }
  }
  return sheet;
}

function adbManageRowsByHeader_(sheet) {
  if (!sheet) throw new Error('Required sheet not found.');
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values.length ? values[0] : [];
  const rows = [];
  for (let i=1;i<values.length;i++) {
    const object = {};
    headers.forEach(function(header,column) {
      if (header && !Object.prototype.hasOwnProperty.call(object, header)) {
        object[header] = values[i][column];
      }
    });
    rows.push(object);
  }
  return {headers:headers,rows:rows};
}

function adbManageFindUniqueRow_(table, header, value) {
  const matches = [];
  table.rows.forEach(function(row,index) {
    if (String(row[header] || '') === String(value || '')) {
      matches.push({row:row,sheetRow:index+2});
    }
  });
  if (matches.length > 1) throw new Error('Ambiguous row for ' + header + '.');
  return matches.length === 1 ? matches[0] : null;
}

function adbManageSetByHeader_(sheet, sheetRow, headers, header, value) {
  const column = headers.indexOf(header) + 1;
  if (column < 1) throw new Error('Missing header: ' + header);
  sheet.getRange(sheetRow,column).setValue(value);
}

function adbManageObjectToRow_(headers, object) {
  return headers.map(function(header) {
    return Object.prototype.hasOwnProperty.call(object, header) ? object[header] : '';
  });
}

function adbManageEventParams_(e) {
  const params = {};
  const source = (e && e.parameter) || {};
  Object.keys(source).forEach(function(key) { params[key] = source[key]; });
  return params;
}

function adbManageNormalizeEmail_(value) {
  return String(value || '').trim().toLowerCase();
}

function adbManageValidEmail_(value) {
  const email = adbManageNormalizeEmail_(value);
  if (!email || email.length > 254 || /\s/.test(email)) return false;
  const at = email.lastIndexOf('@');
  if (at <= 0 || at === email.length - 1) return false;
  const labels = email.slice(at + 1).split('.');
  if (labels.length < 2) return false;
  return labels.every(function(label) {
    return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label);
  });
}

function adbManageGenerateToken_() {
  const seed = [
    Utilities.getUuid(),Utilities.getUuid(),Utilities.getUuid(),new Date().toISOString()
  ].join('|');
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, seed, Utilities.Charset.UTF_8
  );
  return Utilities.base64EncodeWebSafe(digest).replace(/=+$/g,'');
}

function adbManageSha256Hex_(value) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value || ''),
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(byte) {
    const normalized = byte < 0 ? byte + 256 : byte;
    return normalized.toString(16).padStart(2,'0');
  }).join('');
}

function adbManageConstantTimeEqual_(left, right) {
  const a = String(left || '');
  const b = String(right || '');
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i=0;i<a.length;i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function adbManageEscapeHtml_(value) {
  return String(value == null ? '' : value)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function adbManageSimpleHtml_(title, message) {
  return HtmlService.createHtmlOutput(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + adbManageEscapeHtml_(title) + '</title>' +
    '<body style="font-family:Arial,sans-serif;background:#fffefa;color:#181818;padding:40px">' +
    '<main style="max-width:620px;margin:0 auto"><h1>' + adbManageEscapeHtml_(title) + '</h1>' +
    '<p>' + adbManageEscapeHtml_(message) + '</p></main></body>'
  );
}
