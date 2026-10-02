/**
 * Austin Daily Briefing — Native customization PRODUCTION endpoint
 *
 * PRODUCTION STAGING CODE. This file is hard-wired to the production intake
 * and subscriber database IDs and refuses to operate against production IDs.
 *
 * This endpoint may stage/confirm requests only. It never mutates subscriber
 * preferences directly; the canonical Production Subscriber Operations process
 * remains the sole owner of applying confirmed native customization requests.
 *
 * Required Script properties:
 * - ADB_NATIVE_CUSTOMIZE_PROD_ENABLED=TRUE
 * - ADB_NATIVE_CUSTOMIZE_PROD_MODE=CONTROLLED or LIVE
 * - ADB_NATIVE_CUSTOMIZE_PROD_WEB_APP_URL=<current PROD /exec URL>
 * - ADB_NATIVE_CUSTOMIZE_PROD_SITE_ORIGIN=https://austindailybriefing.com
 * - ADB_NATIVE_CUSTOMIZE_PROD_SEND_EMAIL=TRUE
 * - ADB_NATIVE_CUSTOMIZE_PROD_ALLOWLIST=<controlled-test addresses; required in CONTROLLED>
 * - ADB_NATIVE_CUSTOMIZE_PROD_CONFIRM_PAGE_URL=https://austindailybriefing.com/confirm.html
 * - ADB_NATIVE_CUSTOMIZE_PROD_RELAY_SECRET=<production-only relay secret>
 * - RESEND_API_KEY=<existing Resend API key>
 *
 * Security boundaries:
 * - endpoint never returns subscriber existence/current preferences
 * - endpoint never mutates Profiles or Preferences
 * - raw verification token is never stored or logged
 * - CONTROLLED mode stages requests only for explicit allowlist addresses
 * - LIVE mode is refused unless production intake configuration authorizes native intake
 */

const ADB_NATIVE_CUSTOMIZE_PROD = Object.freeze({
  PROD_INTAKE_ID: '1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho',
  PROD_DATABASE_ID: '1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0',
  FORBIDDEN_DEV_INTAKE_ID: '1TiSgmFxij8p3wKnt_skTFXQvAOEuR2wI5c6V8Jq_Yyw',
  FORBIDDEN_DEV_DATABASE_ID: '1rl5GTOvuBSHyFK1r9CqI_6Z5gAwtgsTQnQQf9VCMeyM',

  REQUEST_SHEET: 'Native Customize Requests',
  VERIFICATION_SHEET: 'Native Verification Queue',
  DIAGNOSTIC_SHEET: 'Native Customize Diagnostics',
  BUILD_ID: 'native-customization-prod-stage-v1',

  ENABLED_PROPERTY: 'ADB_NATIVE_CUSTOMIZE_PROD_ENABLED',
  MODE_PROPERTY: 'ADB_NATIVE_CUSTOMIZE_PROD_MODE',
  WEB_APP_URL_PROPERTY: 'ADB_NATIVE_CUSTOMIZE_PROD_WEB_APP_URL',
  SITE_ORIGIN_PROPERTY: 'ADB_NATIVE_CUSTOMIZE_PROD_SITE_ORIGIN',
  SEND_EMAIL_PROPERTY: 'ADB_NATIVE_CUSTOMIZE_PROD_SEND_EMAIL',
  ALLOWLIST_PROPERTY: 'ADB_NATIVE_CUSTOMIZE_PROD_ALLOWLIST',
  CONFIRM_PAGE_URL_PROPERTY: 'ADB_NATIVE_CUSTOMIZE_PROD_CONFIRM_PAGE_URL',
  RELAY_SECRET_PROPERTY: 'ADB_NATIVE_CUSTOMIZE_PROD_RELAY_SECRET',
  RESEND_KEY_PROPERTY: 'RESEND_API_KEY',

  DEFAULT_SITE_ORIGIN: 'https://austindailybriefing.com',
  RESEND_ENDPOINT: 'https://api.resend.com/emails',
  FROM: 'Austin Daily Briefing <briefing@austindailybriefing.com>',
  REPLY_TO: 'briefing@austindailybriefing.com',

  TOKEN_TTL_MS: 24 * 60 * 60 * 1000,
  MAX_POST_BYTES: 12000,
  ADDRESS_COOLDOWN_SECONDS: 60,
  ADDRESS_WINDOW_SECONDS: 6 * 60 * 60,
  ADDRESS_WINDOW_MAX: 5,
  GLOBAL_WINDOW_SECONDS: 60 * 60,
  GLOBAL_WINDOW_MAX: 60,
  DUPLICATE_WINDOW_MS: 10 * 60 * 1000
});

const ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS = Object.freeze([
  'Request ID',
  'Created At',
  'Email',
  'Profile ID',
  'Payload JSON',
  'Payload SHA-256',
  'Source',
  'Status',
  'Verification ID',
  'Confirmed At',
  'Applied At',
  'Result',
  'Notes'
]);

const ADB_NATIVE_CUSTOMIZE_VERIFICATION_HEADERS = Object.freeze([
  'Verification ID',
  'Created At',
  'Expires At',
  'Email',
  'Request ID',
  'Token Hash SHA-256',
  'Status',
  'Confirmed At',
  'Applied At',
  'Notes'
]);

const ADB_NATIVE_CUSTOMIZE_DIAGNOSTIC_HEADERS = Object.freeze([
  'Created At',
  'Event',
  'Reason',
  'Email Hash Prefix',
  'Client Nonce Present',
  'Build ID'
]);

const ADB_NATIVE_CUSTOMIZE_INTERESTS = Object.freeze([
  'CIV01','CIV02','CIV03','CIV04','CIV05','CIV06',
  'CUL01','CUL02','CUL03','CUL04','CUL05','CUL06','CUL07',
  'TEC01','TEC02','TEC03','TEC04','TEC05',
  'LIF01','LIF02','LIF03','LIF04','LIF05'
]);

const ADB_NATIVE_CUSTOMIZE_STYLE_FIELDS = Object.freeze([
  'more_for_you_volume',
  'summary_style',
  'why_it_matters_length'
]);

const ADB_NATIVE_CUSTOMIZE_ALLOWED = Object.freeze({
  interest: Object.freeze(['keep_current','off','normal','high']),
  more_for_you_volume: Object.freeze(['keep_current','fewer','standard','more']),
  summary_style: Object.freeze(['keep_current','concise','standard','explanatory']),
  why_it_matters_length: Object.freeze(['keep_current','brief','standard','detailed'])
});

const ADB_NATIVE_CUSTOMIZE_INTEREST_LABELS = Object.freeze({
  CIV01:'Local Government & Policy',
  CIV02:'Housing, Homelessness & Urban Life',
  CIV03:'Transportation & Transit',
  CIV04:'Public Safety & Courts',
  CIV05:'LGBTQ+ Community',
  CIV06:'Development, Land Use & Zoning',
  CUL01:'Stand-up Comedy',
  CUL02:'Live Music',
  CUL03:'Arts, Museums & Visual Culture',
  CUL04:'Food & Restaurants',
  CUL05:'Outdoors, Parks & Nature',
  CUL06:'Nightlife & Bars',
  CUL07:'Theater & Performing Arts',
  TEC01:'Artificial Intelligence',
  TEC02:'Gaming',
  TEC03:'Science, Space & Astronomy',
  TEC04:'Philosophy & Big Ideas',
  TEC05:'Consumer Technology',
  LIF01:'Business & Economy',
  LIF02:'Books & Publishing',
  LIF03:'Health & Wellness',
  LIF04:'Sports',
  LIF05:'Film, TV & Streaming'
});

const ADB_NATIVE_CUSTOMIZE_REQUEST_ALLOWED_KEYS = Object.freeze(
  ['action','email','company','form_check','client_nonce'].concat(
    ADB_NATIVE_CUSTOMIZE_INTERESTS,
    ADB_NATIVE_CUSTOMIZE_STYLE_FIELDS
  )
);

/**
 * Creates/validates the production native customization sheets.
 * Safe to rerun.
 */
function setupNativeCustomizationProdV1() {
  adbNativeCustomizeProdAssertTargets_();
  const intake = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_PROD.PROD_INTAKE_ID);
  const requestSheet = adbNativeEnsureSheet_(intake,
    ADB_NATIVE_CUSTOMIZE_PROD.REQUEST_SHEET,
    ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS);
  const verificationSheet = adbNativeEnsureSheet_(intake,
    ADB_NATIVE_CUSTOMIZE_PROD.VERIFICATION_SHEET,
    ADB_NATIVE_CUSTOMIZE_VERIFICATION_HEADERS);
  const diagnosticSheet = adbNativeEnsureSheet_(intake,
    ADB_NATIVE_CUSTOMIZE_PROD.DIAGNOSTIC_SHEET,
    ADB_NATIVE_CUSTOMIZE_DIAGNOSTIC_HEADERS);

  const report = {
    intakeId: ADB_NATIVE_CUSTOMIZE_PROD.PROD_INTAKE_ID,
    requestSheet: requestSheet.getName(),
    verificationSheet: verificationSheet.getName(),
    diagnosticSheet: diagnosticSheet.getName(),
    buildId: ADB_NATIVE_CUSTOMIZE_PROD.BUILD_ID,
    productionTouched: true
  };
  Logger.log(JSON.stringify(report));
  return report;
}

/**
 * Web-app POST router.
 * action=request -> validate/stage a customization request.
 * action=relay_confirm -> authenticated Worker relay confirms a single-use token.
 * No route in this web app applies Profiles or Preferences.
 */
function doPost(e) {
  let action = 'request';
  let params = {};
  try {
    adbNativeCustomizeProdAssertEnabled_();
    params = adbNativeNormalizeEventParams_(e);
    action = String(params.action || 'request').toLowerCase();

    if (action === 'relay_confirm') {
      const token = String(params.token || '').trim();
      if (!adbNativeValidateRelaySignatureProd_(token, params.relay_ts, params.relay_sig)) {
        return adbNativeJsonOutput_({ok:false,status:'forbidden'});
      }
      const result = adbNativeConfirmRequestProdV1_(token);
      return adbNativeJsonOutput_(result);
    }

    if (action !== 'request') {
      return adbNativePostMessageHtml_(
        adbNativeValidationResult_('invalid_action'),
        params.client_nonce || ''
      );
    }

    const result = adbNativeStageCustomizeRequestProdV1_(e, params);
    return adbNativePostMessageHtml_(result, params.client_nonce || '');
  } catch (error) {
    console.error('Native customization production request failed: ' +
      String(error && error.message ? error.message : error).slice(0, 500));
    if (action === 'relay_confirm') {
      return adbNativeJsonOutput_({ok:false,status:'temporary_error'});
    }
    return adbNativePostMessageHtml_({
      ok: false,
      status: 'temporary_error',
      message: 'We could not process that request right now. Please try again later.'
    }, params.client_nonce || '');
  }
}

function adbNativeStageCustomizeRequestProdV1_(e, params) {
  setupNativeCustomizationProdV1();

  const diagnosticEmail = adbNativeNormalizeEmail_(params.email);
  adbNativeAppendProdDiagnostic_('received', '', diagnosticEmail, params);

  if (e && e.postData && Number(e.postData.length || 0) > ADB_NATIVE_CUSTOMIZE_PROD.MAX_POST_BYTES) {
    return adbNativeValidationResult_('request_too_large');
  }
  adbNativeRejectDuplicateOrUnexpectedParams_(e, params);

  if (String(params.company || '').trim() || String(params.form_check || '').trim()) {
    adbNativeAppendProdDiagnostic_('noop', 'honeypot', diagnosticEmail, params);
    return adbNativeAcceptedResult_();
  }

  const email = diagnosticEmail;
  const mode = adbNativeProdMode_();
  const allowlisted = adbNativeEmailAllowlisted_(email);
  if (mode === 'CONTROLLED' && !allowlisted) {
    adbNativeAppendProdDiagnostic_('noop', 'controlled_not_allowlisted', email, params);
    return adbNativeAcceptedResult_();
  }
  if (!adbNativePropertyIsTrue_(ADB_NATIVE_CUSTOMIZE_PROD.SEND_EMAIL_PROPERTY)) {
    throw new Error('Production native confirmation email delivery is disabled.');
  }
  if (!adbNativeValidEmail_(email)) {
    adbNativeAppendProdDiagnostic_('validation_error', 'invalid_email', email, params);
    return adbNativeValidationResult_('invalid_email');
  }

  const payloadResult = adbNativeBuildPayload_(params);
  if (!payloadResult.ok) {
    adbNativeAppendProdDiagnostic_('validation_error', String(payloadResult.code || 'unknown'), email, params);
    return adbNativeValidationResult_(payloadResult.code);
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const throttle = adbNativeCheckThrottle_(email);
    if (!throttle.ok) {
      adbNativeAppendProdDiagnostic_('noop', 'rate_limited_' + String(throttle.reason || 'unknown'), email, params);
      return {
        ok: false,
        status: 'rate_limited',
        message: 'Please wait a little before trying again.'
      };
    }

    const subscriber = adbNativeLookupProdSubscriber_(email);
    if (!subscriber) {
      adbNativeAppendProdDiagnostic_('noop', 'unknown_or_inactive', email, params);
      return adbNativeAcceptedResult_();
    }

    const intake = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_PROD.PROD_INTAKE_ID);
    const requestSheet = intake.getSheetByName(ADB_NATIVE_CUSTOMIZE_PROD.REQUEST_SHEET);
    const requests = adbNativeRowsByHeader_(requestSheet);
    const payloadJson = adbNativeStableStringify_(payloadResult.payload);
    const payloadHash = adbNativeSha256Hex_(payloadJson);

    if (adbNativeHasRecentDuplicate_(requests, email, payloadHash)) {
      adbNativeAppendProdDiagnostic_('noop', 'recent_duplicate', email, params);
      return adbNativeAcceptedResult_();
    }

    const now = new Date();
    const requestId = 'NCPROD-' + Utilities.getUuid();
    const sendEnabled = true;
    const deliveryAllowed = mode === 'LIVE' || allowlisted;

    let status = 'Staged';
    let verificationId = '';
    let notes = 'Production confirmation delivery not authorized for this request.';

    if (!deliveryAllowed) {
      adbNativeAppendProdDiagnostic_('noop', 'delivery_not_authorized', email, params);
      return adbNativeAcceptedResult_();
    }

    const requestValues = adbNativeObjectToRow_(ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS, {
      'Request ID': requestId,
      'Created At': now.toISOString(),
      'Email': email,
      'Profile ID': subscriber.profileId,
      'Payload JSON': payloadJson,
      'Payload SHA-256': payloadHash,
      'Source': 'NATIVE_CUSTOMIZE_PROD',
      'Status': status,
      'Verification ID': '',
      'Confirmed At': '',
      'Applied At': '',
      'Result': '',
      'Notes': notes
    });
    requestSheet.appendRow(requestValues);
    const requestRow = requestSheet.getLastRow();

    if (sendEnabled && deliveryAllowed) {
      const webAppUrl = String(PropertiesService.getScriptProperties()
        .getProperty(ADB_NATIVE_CUSTOMIZE_PROD.WEB_APP_URL_PROPERTY) || '').trim();
      if (!/^https:\/\/script\.google\.com\/macros\/s\//.test(webAppUrl)) {
        adbNativeSetByHeader_(requestSheet, requestRow,
          ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS, 'Status', 'Deferred — Confirmation Blocked');
        adbNativeSetByHeader_(requestSheet, requestRow,
          ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS, 'Notes', 'Missing or invalid production web-app URL property.');
        return adbNativeAcceptedResult_();
      }

      const rawToken = adbNativeGenerateToken_();
      const tokenHash = adbNativeSha256Hex_(rawToken);
      verificationId = 'NCVPROD-' + Utilities.getUuid();
      const expiresAt = new Date(now.getTime() + ADB_NATIVE_CUSTOMIZE_PROD.TOKEN_TTL_MS);

      const verificationSheet = intake.getSheetByName(ADB_NATIVE_CUSTOMIZE_PROD.VERIFICATION_SHEET);
      verificationSheet.appendRow(adbNativeObjectToRow_(
        ADB_NATIVE_CUSTOMIZE_VERIFICATION_HEADERS,
        {
          'Verification ID': verificationId,
          'Created At': now.toISOString(),
          'Expires At': expiresAt.toISOString(),
          'Email': email,
          'Request ID': requestId,
          'Token Hash SHA-256': tokenHash,
          'Status': 'Pending',
          'Confirmed At': '',
          'Applied At': '',
          'Notes': 'Production native verification.'
        }
      ));
      const verificationRow = verificationSheet.getLastRow();

      adbNativeSetByHeader_(requestSheet, requestRow,
        ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS, 'Status', 'Pending Confirmation');
      adbNativeSetByHeader_(requestSheet, requestRow,
        ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS, 'Verification ID', verificationId);
      adbNativeSetByHeader_(requestSheet, requestRow,
        ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS, 'Notes', 'Production native confirmation queued.');

      try {
        const confirmationUrl = adbNativeBuildConfirmationUrlProd_(rawToken);
        const providerId = adbNativeSendProdVerificationEmail_(
          email, requestId, confirmationUrl, payloadResult.payload
        );
        adbNativeSetByHeader_(verificationSheet, verificationRow,
          ADB_NATIVE_CUSTOMIZE_VERIFICATION_HEADERS, 'Notes',
          'Production native confirmation sent. Provider ID: ' + providerId);
        adbNativeSetByHeader_(requestSheet, requestRow,
          ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS, 'Notes',
          'Production native confirmation sent.');
      } catch (error) {
        adbNativeSetByHeader_(verificationSheet, verificationRow,
          ADB_NATIVE_CUSTOMIZE_VERIFICATION_HEADERS, 'Status', 'Cancelled');
        adbNativeSetByHeader_(verificationSheet, verificationRow,
          ADB_NATIVE_CUSTOMIZE_VERIFICATION_HEADERS, 'Notes',
          'Confirmation send failed; raw token discarded.');
        adbNativeSetByHeader_(requestSheet, requestRow,
          ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS, 'Status', 'Deferred — Confirmation Blocked');
        adbNativeSetByHeader_(requestSheet, requestRow,
          ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS, 'Notes',
          'Confirmation send failed; request not authorized.');
      }
    }

    SpreadsheetApp.flush();
    console.log(JSON.stringify({
      event: 'native_customize_prod_staged',
      requestId: requestId,
      emailSent: sendEnabled && deliveryAllowed,
      productionTouched: true
    }));
    adbNativeAppendProdDiagnostic_(
      'staged',
      sendEnabled && deliveryAllowed ? 'confirmation_attempted' : 'email_suppressed',
      email,
      params
    );
    return adbNativeAcceptedResult_();
  } finally {
    lock.releaseLock();
  }
}

function adbNativeJsonOutput_(value) {
  return ContentService.createTextOutput(JSON.stringify(value || {}))
    .setMimeType(ContentService.MimeType.JSON);
}

function adbNativeHmacSha256Hex_(value, secret) {
  const bytes = Utilities.computeHmacSha256Signature(
    String(value || ''),
    String(secret || ''),
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(byte) {
    const normalized = byte < 0 ? byte + 256 : byte;
    return normalized.toString(16).padStart(2, '0');
  }).join('');
}

function adbNativeValidateRelaySignatureProd_(token, timestampRaw, signatureRaw) {
  const secret = String(PropertiesService.getScriptProperties()
    .getProperty(ADB_NATIVE_CUSTOMIZE_PROD.RELAY_SECRET_PROPERTY) || '');
  if (secret.length < 32) return false;

  const timestampText = String(timestampRaw || '').trim();
  const signature = String(signatureRaw || '').trim().toLowerCase();
  if (!/^\d{13}$/.test(timestampText) || !/^[a-f0-9]{64}$/.test(signature)) {
    return false;
  }

  const timestamp = Number(timestampText);
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp) > 5 * 60 * 1000) {
    return false;
  }

  const expected = adbNativeHmacSha256Hex_(timestampText + ':' + String(token || ''), secret);
  return adbNativeConstantTimeEqual_(expected, signature);
}

function adbNativeBuildConfirmationUrlProd_(rawToken) {
  const configured = String(PropertiesService.getScriptProperties()
    .getProperty(ADB_NATIVE_CUSTOMIZE_PROD.CONFIRM_PAGE_URL_PROPERTY) || '').trim();
  if (configured !== 'https://austindailybriefing.com/confirm.html') {
    throw new Error('Missing or invalid production confirmation page URL property.');
  }
  return configured + '#env=prod&token=' + encodeURIComponent(String(rawToken || ''));
}

function adbNativeConfirmRequestProdV1_(rawToken) {
  setupNativeCustomizationProdV1();
  const token = String(rawToken || '').trim();
  if (token.length < 32 || token.length > 256) {
    return {ok:false,status:'invalid_or_expired'};
  }
  const tokenHash = adbNativeSha256Hex_(token);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const intake = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_PROD.PROD_INTAKE_ID);
    const verificationSheet = intake.getSheetByName(ADB_NATIVE_CUSTOMIZE_PROD.VERIFICATION_SHEET);
    const requestSheet = intake.getSheetByName(ADB_NATIVE_CUSTOMIZE_PROD.REQUEST_SHEET);
    const verifications = adbNativeRowsByHeader_(verificationSheet);
    let match = null;

    verifications.rows.forEach(function(row, index) {
      if (match || String(row.Status) !== 'Pending') return;
      if (adbNativeConstantTimeEqual_(
        String(row['Token Hash SHA-256'] || ''), tokenHash)) {
        match = {row: row, sheetRow: index + 2};
      }
    });

    if (!match) return {ok:false,status:'invalid_or_expired'};

    const expires = new Date(String(match.row['Expires At'] || ''));
    if (!expires.getTime() || expires.getTime() <= Date.now()) {
      adbNativeSetByHeader_(verificationSheet, match.sheetRow,
        verifications.headers, 'Status', 'Expired');
      return {ok:false,status:'invalid_or_expired'};
    }

    const requests = adbNativeRowsByHeader_(requestSheet);
    const requestMatch = adbNativeFindUniqueRow_(
      requests, 'Request ID', String(match.row['Request ID'] || '')
    );
    if (!requestMatch ||
        String(requestMatch.row.Status) !== 'Pending Confirmation' ||
        String(requestMatch.row.Email || '').toLowerCase() !==
          String(match.row.Email || '').toLowerCase() ||
        String(requestMatch.row['Verification ID'] || '') !==
          String(match.row['Verification ID'] || '')) {
      return {ok:false,status:'invalid_or_expired'};
    }

    const now = new Date().toISOString();
    adbNativeSetByHeader_(verificationSheet, match.sheetRow,
      verifications.headers, 'Status', 'Confirmed');
    adbNativeSetByHeader_(verificationSheet, match.sheetRow,
      verifications.headers, 'Confirmed At', now);
    adbNativeSetByHeader_(requestSheet, requestMatch.sheetRow,
      requests.headers, 'Status', 'Confirmed');
    adbNativeSetByHeader_(requestSheet, requestMatch.sheetRow,
      requests.headers, 'Confirmed At', now);
    SpreadsheetApp.flush();

    console.log(JSON.stringify({
      event: 'native_customize_prod_confirmed',
      requestId: String(match.row['Request ID'] || ''),
      productionTouched: true
    }));
    return {ok:true,status:'confirmed'};
  } finally {
    lock.releaseLock();
  }
}



function adbNativeLookupProdSubscriber_(email) {
  const database = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_PROD.PROD_DATABASE_ID);
  const subscribers = adbNativeRowsByHeader_(database.getSheetByName('Subscribers'));
  const matches = subscribers.rows.filter(function(row) {
    return adbNativeNormalizeEmail_(row.Email) === email;
  });

  if (matches.length !== 1) return null;
  const status = String(matches[0].Status || '').toLowerCase();
  if (status !== 'active' && status !== 'paused') return null;
  const profileId = String(matches[0]['Profile ID'] || '').trim();
  if (!profileId) return null;
  return {profileId: profileId, status: status};
}

function adbNativeBuildPayload_(params) {
  const payload = {};
  for (let i = 0; i < ADB_NATIVE_CUSTOMIZE_INTERESTS.length; i++) {
    const key = ADB_NATIVE_CUSTOMIZE_INTERESTS[i];
    const value = String(params[key] || 'keep_current').toLowerCase();
    if (ADB_NATIVE_CUSTOMIZE_ALLOWED.interest.indexOf(value) < 0) {
      return {ok:false,code:'invalid_option'};
    }
    if (value !== 'keep_current') payload[key] = value;
  }

  for (let j = 0; j < ADB_NATIVE_CUSTOMIZE_STYLE_FIELDS.length; j++) {
    const key = ADB_NATIVE_CUSTOMIZE_STYLE_FIELDS[j];
    const value = String(params[key] || 'keep_current').toLowerCase();
    if (ADB_NATIVE_CUSTOMIZE_ALLOWED[key].indexOf(value) < 0) {
      return {ok:false,code:'invalid_option'};
    }
    if (value !== 'keep_current') payload[key] = value;
  }

  if (!Object.keys(payload).length) {
    return {ok:false,code:'no_changes'};
  }
  return {ok:true,payload:payload};
}

function adbNativeRejectDuplicateOrUnexpectedParams_(e, params) {
  Object.keys(params).forEach(function(key) {
    if (key === 'token' && String(params.action || '').toLowerCase() === 'confirm') return;
    if (ADB_NATIVE_CUSTOMIZE_REQUEST_ALLOWED_KEYS.indexOf(key) < 0) {
      throw new Error('Unexpected request field.');
    }
  });
  if (e && e.parameters) {
    Object.keys(e.parameters).forEach(function(key) {
      const values = e.parameters[key] || [];
      if (values.length > 1) throw new Error('Duplicate request field.');
    });
  }
}

function adbNativeHasRecentDuplicate_(requests, email, payloadHash) {
  const cutoff = Date.now() - ADB_NATIVE_CUSTOMIZE_PROD.DUPLICATE_WINDOW_MS;
  return requests.rows.some(function(row) {
    const created = new Date(String(row['Created At'] || '')).getTime();
    const status = String(row.Status || '');
    return adbNativeNormalizeEmail_(row.Email) === email &&
      String(row['Payload SHA-256'] || '') === payloadHash &&
      created >= cutoff &&
      ['Pending Confirmation','Confirmed','Staged — Email Suppressed'].indexOf(status) >= 0;
  });
}

function adbNativeAppendProdDiagnostic_(eventName, reason, email, params) {
  const safeEvent = String(eventName || 'unknown').slice(0, 80);
  const safeReason = String(reason || '').slice(0, 120);
  const normalizedEmail = adbNativeNormalizeEmail_(email);
  const emailHashPrefix = normalizedEmail
    ? adbNativeSha256Hex_(normalizedEmail).slice(0, 12)
    : '';
  const noncePresent = !!String((params && params.client_nonce) || '').trim();

  try {
    const intake = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_PROD.PROD_INTAKE_ID);
    const sheet = adbNativeEnsureSheet_(
      intake,
      ADB_NATIVE_CUSTOMIZE_PROD.DIAGNOSTIC_SHEET,
      ADB_NATIVE_CUSTOMIZE_DIAGNOSTIC_HEADERS
    );
    sheet.appendRow([
      new Date().toISOString(),
      safeEvent,
      safeReason,
      emailHashPrefix,
      noncePresent ? 'TRUE' : 'FALSE',
      ADB_NATIVE_CUSTOMIZE_PROD.BUILD_ID
    ]);
    SpreadsheetApp.flush();
  } catch (error) {
    console.error('Native customization production diagnostic write failed: ' +
      String(error && error.message ? error.message : error).slice(0, 300));
  }

  console.log(JSON.stringify({
    event: 'native_customize_prod_diagnostic',
    stage: safeEvent,
    reason: safeReason,
    emailHashPrefix: emailHashPrefix,
    clientNoncePresent: noncePresent,
    buildId: ADB_NATIVE_CUSTOMIZE_PROD.BUILD_ID,
    productionTouched: true
  }));
}

function inspectNativeCustomizationProdDiagnosticsV1() {
  adbNativeCustomizeProdAssertEnabled_();
  setupNativeCustomizationProdV1();

  const intake = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_PROD.PROD_INTAKE_ID);
  const sheet = intake.getSheetByName(ADB_NATIVE_CUSTOMIZE_PROD.DIAGNOSTIC_SHEET);
  const lastRow = sheet.getLastRow();
  const firstDataRow = Math.max(2, lastRow - 19);
  const rowCount = lastRow >= 2 ? lastRow - firstDataRow + 1 : 0;
  const rows = rowCount
    ? sheet.getRange(firstDataRow, 1, rowCount, ADB_NATIVE_CUSTOMIZE_DIAGNOSTIC_HEADERS.length)
        .getDisplayValues()
    : [];
  const report = {
    buildId: ADB_NATIVE_CUSTOMIZE_PROD.BUILD_ID,
    rows: rows,
    productionTouched: true
  };
  Logger.log(JSON.stringify(report));
  return report;
}

function adbNativeProdMode_() {
  const mode = String(PropertiesService.getScriptProperties()
    .getProperty(ADB_NATIVE_CUSTOMIZE_PROD.MODE_PROPERTY) || '').trim().toUpperCase();
  if (mode !== 'CONTROLLED' && mode !== 'LIVE') {
    throw new Error('ADB_NATIVE_CUSTOMIZE_PROD_MODE must be CONTROLLED or LIVE.');
  }
  if (mode === 'LIVE') {
    const config = adbNativeProdIntegrationConfig_();
    if (String(config['Processor Mode'] || '').toUpperCase() !== 'GOOGLE + NATIVE') {
      throw new Error('LIVE native customization requires Processor Mode = GOOGLE + NATIVE.');
    }
    if (String(config['Production Writes'] || '').indexOf('ENABLED') !== 0) {
      throw new Error('Production Writes is not enabled.');
    }
    if (String(config['Delivery Mode'] || '').toUpperCase() !== 'ENABLED') {
      throw new Error('Delivery Mode is not enabled.');
    }
  }
  return mode;
}

function adbNativeProdIntegrationConfig_() {
  const intake = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_PROD.PROD_INTAKE_ID);
  const sheet = intake.getSheetByName('Integration Config');
  if (!sheet) throw new Error('Production intake is missing Integration Config.');
  const values = sheet.getDataRange().getDisplayValues();
  const out = {};
  values.slice(1).forEach(function(row) {
    const key = String(row[0] || '').trim();
    if (key) out[key] = String(row[1] || '').trim();
  });
  if (String(out.Environment || '').toUpperCase() !== 'PRODUCTION') {
    throw new Error('Integration Config Environment is not PRODUCTION.');
  }
  if (String(out['Operational Production Database ID'] || '') !==
      ADB_NATIVE_CUSTOMIZE_PROD.PROD_DATABASE_ID) {
    throw new Error('Integration Config production database ID mismatch.');
  }
  return out;
}

function adbNativeCheckThrottle_(email) {
  const cache = CacheService.getScriptCache();
  const emailHash = adbNativeSha256Hex_(email).slice(0, 32);

  const cooldownKey = 'ncprod:cool:' + emailHash;
  if (cache.get(cooldownKey)) return {ok:false,reason:'cooldown'};

  const addressKey = 'ncprod:addr:' + emailHash;
  const addressCount = Number(cache.get(addressKey) || '0');
  if (addressCount >= ADB_NATIVE_CUSTOMIZE_PROD.ADDRESS_WINDOW_MAX) {
    return {ok:false,reason:'address_cap'};
  }

  const globalKey = 'ncprod:global';
  const globalCount = Number(cache.get(globalKey) || '0');
  if (globalCount >= ADB_NATIVE_CUSTOMIZE_PROD.GLOBAL_WINDOW_MAX) {
    return {ok:false,reason:'global_cap'};
  }

  cache.put(cooldownKey, '1', ADB_NATIVE_CUSTOMIZE_PROD.ADDRESS_COOLDOWN_SECONDS);
  cache.put(addressKey, String(addressCount + 1), ADB_NATIVE_CUSTOMIZE_PROD.ADDRESS_WINDOW_SECONDS);
  cache.put(globalKey, String(globalCount + 1), ADB_NATIVE_CUSTOMIZE_PROD.GLOBAL_WINDOW_SECONDS);
  return {ok:true};
}

function adbNativeEmailAllowlisted_(email) {
  const value = String(PropertiesService.getScriptProperties()
    .getProperty(ADB_NATIVE_CUSTOMIZE_PROD.ALLOWLIST_PROPERTY) || '');
  const allowlist = value.split(',')
    .map(function(item) { return adbNativeNormalizeEmail_(item); })
    .filter(Boolean);
  return allowlist.indexOf(email) >= 0;
}

function adbNativeSendProdVerificationEmail_(email, requestId, confirmationUrl, payload) {
  const mode = adbNativeProdMode_();
  if (mode === 'CONTROLLED' && !adbNativeEmailAllowlisted_(email)) {
    throw new Error('Production confirmation recipient is not allowlisted in CONTROLLED mode.');
  }
  const apiKey = String(PropertiesService.getScriptProperties()
    .getProperty(ADB_NATIVE_CUSTOMIZE_PROD.RESEND_KEY_PROPERTY) || '').trim();
  if (!apiKey) throw new Error('Missing RESEND_API_KEY.');

  const changes = adbNativeHumanChangeList_(payload);
  const subject = 'Confirm Austin Daily Briefing customization';
  const textBody =
    'Austin Daily Briefing customization\n\n' +
    'A customization request was received for this address. Nothing changes unless you confirm it.\n\n' +
    'Requested changes:\n' + changes.map(function(line) { return '- ' + line; }).join('\n') +
    '\n\nConfirm the request:\n' + confirmationUrl +
    '\n\nIf you did not request this, ignore this message.';

  const htmlBody =
    '<div style="font-family:Arial,sans-serif;max-width:620px;line-height:1.55;color:#181818">' +
    '<p style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#db2d2d">Austin Daily Briefing</p>' +
    '<h1 style="font-family:Georgia,serif;font-size:30px">Confirm your briefing changes</h1>' +
    '<p>A customization request was received for this address. Nothing changes unless you confirm it.</p>' +
    '<p><strong>Requested changes</strong></p><ul>' +
    changes.map(function(line) { return '<li>' + adbNativeEscapeHtml_(line) + '</li>'; }).join('') +
    '</ul><p><a href="' + adbNativeEscapeHtml_(confirmationUrl) + '" style="display:inline-block;background:#db2d2d;color:#fff;padding:12px 18px;text-decoration:none;font-weight:700">Review and confirm</a></p>' +
    '<p>If you did not request this, ignore this message.</p></div>';

  const response = UrlFetchApp.fetch(ADB_NATIVE_CUSTOMIZE_PROD.RESEND_ENDPOINT, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
      'Idempotency-Key': 'native-customize-prod:' + requestId
    },
    payload: JSON.stringify({
      from: ADB_NATIVE_CUSTOMIZE_PROD.FROM,
      to: [email],
      reply_to: ADB_NATIVE_CUSTOMIZE_PROD.REPLY_TO,
      subject: subject,
      text: textBody,
      html: htmlBody,
      tags: [
        {name:'message_type',value:'native_customize_prod_confirmation'},
        {name:'environment',value:'production'}
      ]
    }),
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  let body = {};
  try { body = JSON.parse(response.getContentText()); } catch (ignored) {}
  if (code < 200 || code >= 300 || !body.id) {
    throw new Error('Resend rejected controlled production confirmation (' + code + ').');
  }
  return String(body.id);
}

function adbNativeHumanChangeList_(payload) {
  const lines = [];
  ADB_NATIVE_CUSTOMIZE_INTERESTS.forEach(function(key) {
    if (!Object.prototype.hasOwnProperty.call(payload, key)) return;
    lines.push(ADB_NATIVE_CUSTOMIZE_INTEREST_LABELS[key] + ': ' +
      adbNativeTitleCaseValue_(String(payload[key])));
  });

  const styleLabels = {
    more_for_you_volume: 'More for You volume',
    summary_style: 'Story summary style',
    why_it_matters_length: 'Why It Matters length'
  };
  ADB_NATIVE_CUSTOMIZE_STYLE_FIELDS.forEach(function(key) {
    if (!Object.prototype.hasOwnProperty.call(payload, key)) return;
    lines.push(styleLabels[key] + ': ' + adbNativeTitleCaseValue_(String(payload[key])));
  });
  return lines;
}

function adbNativeGenerateToken_() {
  const seed = [
    Utilities.getUuid(),
    Utilities.getUuid(),
    Utilities.getUuid(),
    new Date().toISOString()
  ].join('|');
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    seed,
    Utilities.Charset.UTF_8
  );
  return Utilities.base64EncodeWebSafe(digest).replace(/=+$/g, '');
}

function adbNativeSha256Hex_(value) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value),
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(byte) {
    const n = (byte + 256) % 256;
    return ('0' + n.toString(16)).slice(-2);
  }).join('');
}

function adbNativeConstantTimeEqual_(left, right) {
  const a = String(left || '');
  const b = String(right || '');
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i % Math.max(a.length, 1)) || 0) ^
            (b.charCodeAt(i % Math.max(b.length, 1)) || 0);
  }
  return diff === 0;
}

function adbNativeStableStringify_(object) {
  const sorted = {};
  Object.keys(object).sort().forEach(function(key) {
    sorted[key] = object[key];
  });
  return JSON.stringify(sorted);
}

function adbNativeNormalizeEmail_(value) {
  return String(value || '').trim().toLowerCase();
}

function adbNativeValidEmail_(email) {
  return email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function adbNativeNormalizeEventParams_(e) {
  const result = {};
  if (!e || !e.parameter) return result;
  Object.keys(e.parameter).forEach(function(key) {
    result[String(key)] = String(e.parameter[key] == null ? '' : e.parameter[key]);
  });
  return result;
}

function adbNativePropertyIsTrue_(name) {
  return String(PropertiesService.getScriptProperties()
    .getProperty(name) || '').toUpperCase() === 'TRUE';
}

function adbNativeCustomizeProdAssertEnabled_() {
  adbNativeCustomizeProdAssertTargets_();
  if (!adbNativePropertyIsTrue_(ADB_NATIVE_CUSTOMIZE_PROD.ENABLED_PROPERTY)) {
    throw new Error('Native customization production endpoint is disabled.');
  }
}

function adbNativeCustomizeProdAssertTargets_() {
  if (ADB_NATIVE_CUSTOMIZE_PROD.PROD_INTAKE_ID ===
        ADB_NATIVE_CUSTOMIZE_PROD.FORBIDDEN_DEV_INTAKE_ID ||
      ADB_NATIVE_CUSTOMIZE_PROD.PROD_DATABASE_ID ===
        ADB_NATIVE_CUSTOMIZE_PROD.FORBIDDEN_DEV_DATABASE_ID) {
    throw new Error('Production native customization target collided with DEV.');
  }

  const database = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_PROD.PROD_DATABASE_ID);
  const environmentSheet = database.getSheetByName('Environment');
  if (!environmentSheet) throw new Error('Production database is missing Environment.');
  const values = environmentSheet.getDataRange().getDisplayValues();
  const env = {};
  values.slice(1).forEach(function(row) {
    const key = String(row[0] || '').trim();
    if (key) env[key] = String(row[1] || '').trim();
  });
  if (String(env.Environment || '').toUpperCase() !== 'PRODUCTION') {
    throw new Error('Production database Environment is not PRODUCTION.');
  }
  if (String(env['Database ID'] || '') !== ADB_NATIVE_CUSTOMIZE_PROD.PROD_DATABASE_ID) {
    throw new Error('Production database self-ID mismatch.');
  }
  if (String(env['Development Database ID'] || '') !==
      ADB_NATIVE_CUSTOMIZE_PROD.FORBIDDEN_DEV_DATABASE_ID) {
    throw new Error('Production database DEV boundary marker mismatch.');
  }
  adbNativeProdIntegrationConfig_();
}

function adbNativeEnsureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else {
    const actual = sheet.getRange(1, 1, 1, headers.length).getDisplayValues()[0];
    for (let i = 0; i < headers.length; i++) {
      if (String(actual[i] || '') !== headers[i]) {
        throw new Error('Unexpected header in ' + name + ' column ' + (i + 1) + '.');
      }
    }
  }
  return sheet;
}

function adbNativeRowsByHeader_(sheet) {
  if (!sheet) throw new Error('Required sheet not found.');
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values.length ? values[0] : [];
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const object = {};
    headers.forEach(function(header, column) {
      if (header && !Object.prototype.hasOwnProperty.call(object, header)) {
        object[header] = values[i][column];
      }
    });
    rows.push(object);
  }
  return {headers: headers, rows: rows};
}

function adbNativeFindUniqueRow_(table, header, value) {
  const matches = [];
  table.rows.forEach(function(row, index) {
    if (String(row[header] || '') === String(value || '')) {
      matches.push({row:row,sheetRow:index+2});
    }
  });
  if (matches.length > 1) throw new Error('Ambiguous row for ' + header + '.');
  return matches.length === 1 ? matches[0] : null;
}

function adbNativeSetByHeader_(sheet, sheetRow, headers, header, value) {
  const column = headers.indexOf(header) + 1;
  if (column < 1) throw new Error('Missing header: ' + header);
  sheet.getRange(sheetRow, column).setValue(value);
}

function adbNativeObjectToRow_(headers, object) {
  return headers.map(function(header) {
    return Object.prototype.hasOwnProperty.call(object, header) ? object[header] : '';
  });
}

function adbNativeTitleCaseValue_(value) {
  return String(value || '').split('_').map(function(part) {
    return part ? part.charAt(0).toUpperCase() + part.slice(1) : '';
  }).join(' ');
}

function adbNativeAcceptedResult_() {
  return {
    ok: true,
    status: 'accepted',
    message: 'If that address is connected to Austin Daily Briefing, we’ll send a confirmation link for the requested changes. Nothing changes until the request is confirmed.'
  };
}

function adbNativeValidationResult_(code) {
  const messages = {
    invalid_email: 'Enter a valid email address.',
    no_changes: 'Choose at least one setting to change.',
    invalid_option: 'One or more selected options are invalid.',
    request_too_large: 'The request is too large.'
  };
  return {
    ok: false,
    status: 'validation_error',
    code: code,
    message: messages[code] || 'Review the form and try again.'
  };
}

function adbNativePostMessageHtml_(result, clientNonce) {
  const origin = String(PropertiesService.getScriptProperties()
    .getProperty(ADB_NATIVE_CUSTOMIZE_PROD.SITE_ORIGIN_PROPERTY) ||
    ADB_NATIVE_CUSTOMIZE_PROD.DEFAULT_SITE_ORIGIN).trim();
  const nonce = /^[A-Za-z0-9_-]{16,128}$/.test(String(clientNonce || ''))
    ? String(clientNonce) : '';
  const payload = JSON.stringify({
    type: 'adb-native-customize-prod',
    ok: !!result.ok,
    status: String(result.status || 'temporary_error'),
    code: String(result.code || ''),
    message: String(result.message || ''),
    client_nonce: nonce
  }).replace(/</g, '\\u003c');

  const html = '<!doctype html><meta charset="utf-8"><title>ADB production result</title>' +
    '<script>window.top.postMessage(' + payload + ',' +
    JSON.stringify(origin) + ');</scr' + 'ipt>' +
    '<p>Request processed. You may close this frame.</p>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}









function adbNativeEscapeHtml_(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
