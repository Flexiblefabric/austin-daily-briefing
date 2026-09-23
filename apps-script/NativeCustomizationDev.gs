/**
 * Austin Daily Briefing — Native customization DEV endpoint
 *
 * DEV ONLY. This file is hard-wired to the existing DEV intake/database
 * spreadsheets and refuses to operate against the production IDs.
 *
 * Intended deployment:
 * - standalone Apps Script DEV web app
 * - Execute as: deploying operator
 * - Access: anyone (anonymous request intake is required)
 * - ADB_NATIVE_CUSTOMIZE_DEV_ENABLED must be TRUE
 *
 * Required Script properties for controlled email QA:
 * - ADB_NATIVE_CUSTOMIZE_DEV_ENABLED=TRUE
 * - ADB_NATIVE_CUSTOMIZE_DEV_WEB_APP_URL=<current DEV /exec URL>
 * - ADB_NATIVE_CUSTOMIZE_DEV_SITE_ORIGIN=https://austindailybriefing.com
 * - ADB_NATIVE_CUSTOMIZE_DEV_SEND_EMAIL=FALSE (default) or TRUE
 * - ADB_NATIVE_CUSTOMIZE_DEV_ALLOWLIST=email1@example.com,email2@example.com
 * - RESEND_API_KEY=<existing Resend API key> (only when SEND_EMAIL=TRUE)
 *
 * Security boundaries:
 * - endpoint never returns subscriber existence/current preferences
 * - endpoint never mutates preferences directly
 * - raw verification token is never stored or logged
 * - confirmation marks a request Confirmed; a separate DEV processor applies it
 */

const ADB_NATIVE_CUSTOMIZE_DEV = Object.freeze({
  DEV_INTAKE_ID: '1TiSgmFxij8p3wKnt_skTFXQvAOEuR2wI5c6V8Jq_Yyw',
  DEV_DATABASE_ID: '1rl5GTOvuBSHyFK1r9CqI_6Z5gAwtgsTQnQQf9VCMeyM',
  PROD_INTAKE_ID: '1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho',
  PROD_DATABASE_ID: '1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0',

  REQUEST_SHEET: 'Native Customize Requests',
  VERIFICATION_SHEET: 'Native Verification Queue',

  ENABLED_PROPERTY: 'ADB_NATIVE_CUSTOMIZE_DEV_ENABLED',
  WEB_APP_URL_PROPERTY: 'ADB_NATIVE_CUSTOMIZE_DEV_WEB_APP_URL',
  SITE_ORIGIN_PROPERTY: 'ADB_NATIVE_CUSTOMIZE_DEV_SITE_ORIGIN',
  SEND_EMAIL_PROPERTY: 'ADB_NATIVE_CUSTOMIZE_DEV_SEND_EMAIL',
  ALLOWLIST_PROPERTY: 'ADB_NATIVE_CUSTOMIZE_DEV_ALLOWLIST',
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
  ['action','email','company'].concat(
    ADB_NATIVE_CUSTOMIZE_INTERESTS,
    ADB_NATIVE_CUSTOMIZE_STYLE_FIELDS
  )
);

/**
 * Creates/validates the two DEV-only native customization sheets.
 * Safe to rerun.
 */
function setupNativeCustomizationDevV1() {
  adbNativeCustomizeDevAssertTargets_();
  const intake = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_DEV.DEV_INTAKE_ID);
  const requestSheet = adbNativeEnsureSheet_(intake,
    ADB_NATIVE_CUSTOMIZE_DEV.REQUEST_SHEET,
    ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS);
  const verificationSheet = adbNativeEnsureSheet_(intake,
    ADB_NATIVE_CUSTOMIZE_DEV.VERIFICATION_SHEET,
    ADB_NATIVE_CUSTOMIZE_VERIFICATION_HEADERS);

  const report = {
    intakeId: ADB_NATIVE_CUSTOMIZE_DEV.DEV_INTAKE_ID,
    requestSheet: requestSheet.getName(),
    verificationSheet: verificationSheet.getName(),
    productionTouched: false
  };
  Logger.log(JSON.stringify(report));
  return report;
}

/**
 * Web-app POST router.
 * action=request -> validate/stage a customization request.
 * action=confirm -> confirm a single-use token; does not apply preferences.
 */
function doPost(e) {
  try {
    adbNativeCustomizeDevAssertEnabled_();
    const params = adbNativeNormalizeEventParams_(e);
    const action = String(params.action || 'request').toLowerCase();

    if (action === 'confirm') {
      const result = adbNativeConfirmRequestDevV1_(params.token || '');
      return adbNativeConfirmationResultHtml_(result);
    }

    const result = adbNativeStageCustomizeRequestDevV1_(e, params);
    return adbNativePostMessageHtml_(result);
  } catch (error) {
    console.error('Native customization DEV request failed: ' +
      String(error && error.message ? error.message : error).slice(0, 500));
    return adbNativePostMessageHtml_({
      ok: false,
      status: 'temporary_error',
      message: 'We could not process that request right now. Please try again later.'
    });
  }
}

/**
 * Confirmation link landing page.
 * Opening the link does NOT consume the token.
 */
function doGet(e) {
  try {
    adbNativeCustomizeDevAssertEnabled_();
    const params = adbNativeNormalizeEventParams_(e);
    if (String(params.action || '').toLowerCase() !== 'confirm' || !params.token) {
      return adbNativeSimpleHtml_('Austin Daily Briefing',
        'This DEV endpoint accepts native customization confirmations only.');
    }
    return adbNativeConfirmPromptHtml_(String(params.token));
  } catch (error) {
    return adbNativeSimpleHtml_('Austin Daily Briefing',
      'This confirmation link is unavailable.');
  }
}

/**
 * Applies all Confirmed DEV customization requests exactly once.
 * Run manually during controlled QA.
 */
function processConfirmedNativeCustomizationDevV1() {
  adbNativeCustomizeDevAssertEnabled_();
  setupNativeCustomizationDevV1();

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const intake = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_DEV.DEV_INTAKE_ID);
    const requestSheet = intake.getSheetByName(ADB_NATIVE_CUSTOMIZE_DEV.REQUEST_SHEET);
    const verificationSheet = intake.getSheetByName(ADB_NATIVE_CUSTOMIZE_DEV.VERIFICATION_SHEET);

    const requests = adbNativeRowsByHeader_(requestSheet);
    const verifications = adbNativeRowsByHeader_(verificationSheet);
    let applied = 0;
    let skipped = 0;

    verifications.rows.forEach(function(verification, index) {
      if (String(verification.Status) !== 'Confirmed' ||
          String(verification['Applied At'] || '').trim()) {
        return;
      }

      const verificationRow = index + 2;
      const requestId = String(verification['Request ID'] || '');
      const requestMatch = adbNativeFindUniqueRow_(requests, 'Request ID', requestId);
      if (!requestMatch ||
          String(requestMatch.row.Status) !== 'Confirmed' ||
          String(requestMatch.row['Applied At'] || '').trim()) {
        skipped++;
        return;
      }

      if (String(requestMatch.row.Email || '').toLowerCase() !==
          String(verification.Email || '').toLowerCase()) {
        throw new Error('Verification/request email mismatch for ' + requestId + '.');
      }

      const payload = JSON.parse(String(requestMatch.row['Payload JSON'] || '{}'));
      adbNativeApplyPayloadToDevProfile_(
        String(requestMatch.row['Profile ID'] || ''),
        requestId,
        payload
      );

      const now = new Date().toISOString();
      adbNativeSetByHeader_(requestSheet, requestMatch.sheetRow, requests.headers, 'Status', 'Applied');
      adbNativeSetByHeader_(requestSheet, requestMatch.sheetRow, requests.headers, 'Applied At', now);
      adbNativeSetByHeader_(requestSheet, requestMatch.sheetRow, requests.headers, 'Result', 'Applied to DEV profile');
      adbNativeSetByHeader_(verificationSheet, verificationRow, verifications.headers, 'Status', 'Applied');
      adbNativeSetByHeader_(verificationSheet, verificationRow, verifications.headers, 'Applied At', now);
      applied++;
    });

    SpreadsheetApp.flush();
    const report = {applied: applied, skipped: skipped, productionTouched: false};
    Logger.log(JSON.stringify(report));
    return report;
  } finally {
    lock.releaseLock();
  }
}

function adbNativeStageCustomizeRequestDevV1_(e, params) {
  setupNativeCustomizationDevV1();

  if (e && e.postData && Number(e.postData.length || 0) > ADB_NATIVE_CUSTOMIZE_DEV.MAX_POST_BYTES) {
    return adbNativeValidationResult_('request_too_large');
  }
  adbNativeRejectDuplicateOrUnexpectedParams_(e, params);

  if (String(params.company || '').trim()) {
    return adbNativeAcceptedResult_();
  }

  const email = adbNativeNormalizeEmail_(params.email);
  if (!adbNativeValidEmail_(email)) {
    return adbNativeValidationResult_('invalid_email');
  }

  const payloadResult = adbNativeBuildPayload_(params);
  if (!payloadResult.ok) {
    return adbNativeValidationResult_(payloadResult.code);
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const throttle = adbNativeCheckThrottle_(email);
    if (!throttle.ok) {
      return {
        ok: false,
        status: 'rate_limited',
        message: 'Please wait a little before trying again.'
      };
    }

    const subscriber = adbNativeLookupDevSubscriber_(email);
    if (!subscriber) {
      return adbNativeAcceptedResult_();
    }

    const intake = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_DEV.DEV_INTAKE_ID);
    const requestSheet = intake.getSheetByName(ADB_NATIVE_CUSTOMIZE_DEV.REQUEST_SHEET);
    const requests = adbNativeRowsByHeader_(requestSheet);
    const payloadJson = adbNativeStableStringify_(payloadResult.payload);
    const payloadHash = adbNativeSha256Hex_(payloadJson);

    if (adbNativeHasRecentDuplicate_(requests, email, payloadHash)) {
      return adbNativeAcceptedResult_();
    }

    const now = new Date();
    const requestId = 'NCDEV-' + Utilities.getUuid();
    const allowlisted = adbNativeEmailAllowlisted_(email);
    const sendEnabled = adbNativePropertyIsTrue_(ADB_NATIVE_CUSTOMIZE_DEV.SEND_EMAIL_PROPERTY);

    let status = 'Staged — Email Suppressed';
    let verificationId = '';
    let notes = sendEnabled ?
      'Controlled email suppressed because address is not in DEV allowlist.' :
      'Controlled email disabled by Script property.';

    const requestValues = adbNativeObjectToRow_(ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS, {
      'Request ID': requestId,
      'Created At': now.toISOString(),
      'Email': email,
      'Profile ID': subscriber.profileId,
      'Payload JSON': payloadJson,
      'Payload SHA-256': payloadHash,
      'Source': 'NATIVE_CUSTOMIZE_DEV',
      'Status': status,
      'Verification ID': '',
      'Confirmed At': '',
      'Applied At': '',
      'Result': '',
      'Notes': notes
    });
    requestSheet.appendRow(requestValues);
    const requestRow = requestSheet.getLastRow();

    if (sendEnabled && allowlisted) {
      const webAppUrl = String(PropertiesService.getScriptProperties()
        .getProperty(ADB_NATIVE_CUSTOMIZE_DEV.WEB_APP_URL_PROPERTY) || '').trim();
      if (!/^https:\/\/script\.google\.com\/macros\/s\//.test(webAppUrl)) {
        adbNativeSetByHeader_(requestSheet, requestRow,
          ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS, 'Status', 'Deferred — Confirmation Blocked');
        adbNativeSetByHeader_(requestSheet, requestRow,
          ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS, 'Notes', 'Missing or invalid DEV web-app URL property.');
        return adbNativeAcceptedResult_();
      }

      const rawToken = adbNativeGenerateToken_();
      const tokenHash = adbNativeSha256Hex_(rawToken);
      verificationId = 'NCVDEV-' + Utilities.getUuid();
      const expiresAt = new Date(now.getTime() + ADB_NATIVE_CUSTOMIZE_DEV.TOKEN_TTL_MS);

      const verificationSheet = intake.getSheetByName(ADB_NATIVE_CUSTOMIZE_DEV.VERIFICATION_SHEET);
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
          'Notes': 'Controlled DEV verification.'
        }
      ));
      const verificationRow = verificationSheet.getLastRow();

      adbNativeSetByHeader_(requestSheet, requestRow,
        ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS, 'Status', 'Pending Confirmation');
      adbNativeSetByHeader_(requestSheet, requestRow,
        ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS, 'Verification ID', verificationId);
      adbNativeSetByHeader_(requestSheet, requestRow,
        ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS, 'Notes', 'Controlled DEV confirmation queued.');

      try {
        const confirmationUrl = webAppUrl + '?action=confirm&token=' + encodeURIComponent(rawToken);
        const providerId = adbNativeSendDevVerificationEmail_(
          email, requestId, confirmationUrl, payloadResult.payload
        );
        adbNativeSetByHeader_(verificationSheet, verificationRow,
          ADB_NATIVE_CUSTOMIZE_VERIFICATION_HEADERS, 'Notes',
          'Controlled DEV confirmation sent. Provider ID: ' + providerId);
        adbNativeSetByHeader_(requestSheet, requestRow,
          ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS, 'Notes',
          'Controlled DEV confirmation sent.');
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
      event: 'native_customize_dev_staged',
      requestId: requestId,
      emailSent: sendEnabled && allowlisted,
      productionTouched: false
    }));
    return adbNativeAcceptedResult_();
  } finally {
    lock.releaseLock();
  }
}

function adbNativeConfirmRequestDevV1_(rawToken) {
  setupNativeCustomizationDevV1();
  const token = String(rawToken || '').trim();
  if (token.length < 32 || token.length > 256) {
    return {ok:false,status:'invalid_or_expired'};
  }
  const tokenHash = adbNativeSha256Hex_(token);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const intake = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_DEV.DEV_INTAKE_ID);
    const verificationSheet = intake.getSheetByName(ADB_NATIVE_CUSTOMIZE_DEV.VERIFICATION_SHEET);
    const requestSheet = intake.getSheetByName(ADB_NATIVE_CUSTOMIZE_DEV.REQUEST_SHEET);
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
      event: 'native_customize_dev_confirmed',
      requestId: String(match.row['Request ID'] || ''),
      productionTouched: false
    }));
    return {ok:true,status:'confirmed'};
  } finally {
    lock.releaseLock();
  }
}

function adbNativeApplyPayloadToDevProfile_(profileId, requestId, payload) {
  if (!profileId) throw new Error('Missing DEV profile ID.');
  adbNativeCustomizeDevAssertTargets_();

  const database = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_DEV.DEV_DATABASE_ID);
  const preferencesSheet = database.getSheetByName('Preferences');
  const profilesSheet = database.getSheetByName('Profiles');
  if (!preferencesSheet || !profilesSheet) {
    throw new Error('DEV database is missing Preferences or Profiles.');
  }

  const preferences = adbNativeRowsByHeader_(preferencesSheet);
  const now = new Date().toISOString();

  ADB_NATIVE_CUSTOMIZE_INTERESTS.forEach(function(interestId) {
    if (!Object.prototype.hasOwnProperty.call(payload, interestId)) return;
    const normalized = String(payload[interestId]).toLowerCase();
    const preference = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    const score = normalized === 'off' ? 0 : (normalized === 'high' ? 2 : 1);

    const matches = [];
    preferences.rows.forEach(function(row, index) {
      if (String(row['Profile ID'] || '') === profileId &&
          String(row['Interest ID'] || '') === interestId) {
        matches.push({row:row,sheetRow:index+2});
      }
    });
    if (matches.length > 1) throw new Error('Ambiguous DEV preference row for ' + profileId + ' / ' + interestId + '.');

    if (matches.length === 1) {
      adbNativeSetByHeader_(preferencesSheet, matches[0].sheetRow,
        preferences.headers, 'Preference', preference);
      adbNativeSetByHeader_(preferencesSheet, matches[0].sheetRow,
        preferences.headers, 'Score', score);
      if (preferences.headers.indexOf('Updated') >= 0) {
        adbNativeSetByHeader_(preferencesSheet, matches[0].sheetRow,
          preferences.headers, 'Updated', now);
      }
      if (preferences.headers.indexOf('Source Submission ID') >= 0) {
        adbNativeSetByHeader_(preferencesSheet, matches[0].sheetRow,
          preferences.headers, 'Source Submission ID', requestId);
      }
    } else {
      preferencesSheet.appendRow(adbNativeObjectToRow_(preferences.headers, {
        'Profile ID': profileId,
        'Interest ID': interestId,
        'Preference': preference,
        'Score': score,
        'Updated': now,
        'Source Submission ID': requestId
      }));
    }
  });

  const profiles = adbNativeRowsByHeader_(profilesSheet);
  const profileMatch = adbNativeFindUniqueRow_(profiles, 'Profile ID', profileId);
  if (!profileMatch) throw new Error('DEV profile not found: ' + profileId);

  const styleMap = {
    more_for_you_volume: 'More for You Volume',
    summary_style: 'Summary Style',
    why_it_matters_length: 'Why It Matters Length'
  };
  Object.keys(styleMap).forEach(function(key) {
    if (!Object.prototype.hasOwnProperty.call(payload, key)) return;
    const value = adbNativeTitleCaseValue_(String(payload[key]));
    adbNativeSetByHeader_(profilesSheet, profileMatch.sheetRow,
      profiles.headers, styleMap[key], value);
  });

  if (profiles.headers.indexOf('Latest Submission ID') >= 0) {
    adbNativeSetByHeader_(profilesSheet, profileMatch.sheetRow,
      profiles.headers, 'Latest Submission ID', requestId);
  }
  if (profiles.headers.indexOf('Last Preference Update') >= 0) {
    adbNativeSetByHeader_(profilesSheet, profileMatch.sheetRow,
      profiles.headers, 'Last Preference Update', now);
  }
}

function adbNativeLookupDevSubscriber_(email) {
  const database = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_DEV.DEV_DATABASE_ID);
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
  const cutoff = Date.now() - ADB_NATIVE_CUSTOMIZE_DEV.DUPLICATE_WINDOW_MS;
  return requests.rows.some(function(row) {
    const created = new Date(String(row['Created At'] || '')).getTime();
    const status = String(row.Status || '');
    return adbNativeNormalizeEmail_(row.Email) === email &&
      String(row['Payload SHA-256'] || '') === payloadHash &&
      created >= cutoff &&
      ['Pending Confirmation','Confirmed','Staged — Email Suppressed'].indexOf(status) >= 0;
  });
}

function adbNativeCheckThrottle_(email) {
  const cache = CacheService.getScriptCache();
  const emailHash = adbNativeSha256Hex_(email).slice(0, 32);

  const cooldownKey = 'ncdev:cool:' + emailHash;
  if (cache.get(cooldownKey)) return {ok:false,reason:'cooldown'};

  const addressKey = 'ncdev:addr:' + emailHash;
  const addressCount = Number(cache.get(addressKey) || '0');
  if (addressCount >= ADB_NATIVE_CUSTOMIZE_DEV.ADDRESS_WINDOW_MAX) {
    return {ok:false,reason:'address_cap'};
  }

  const globalKey = 'ncdev:global';
  const globalCount = Number(cache.get(globalKey) || '0');
  if (globalCount >= ADB_NATIVE_CUSTOMIZE_DEV.GLOBAL_WINDOW_MAX) {
    return {ok:false,reason:'global_cap'};
  }

  cache.put(cooldownKey, '1', ADB_NATIVE_CUSTOMIZE_DEV.ADDRESS_COOLDOWN_SECONDS);
  cache.put(addressKey, String(addressCount + 1), ADB_NATIVE_CUSTOMIZE_DEV.ADDRESS_WINDOW_SECONDS);
  cache.put(globalKey, String(globalCount + 1), ADB_NATIVE_CUSTOMIZE_DEV.GLOBAL_WINDOW_SECONDS);
  return {ok:true};
}

function adbNativeEmailAllowlisted_(email) {
  const value = String(PropertiesService.getScriptProperties()
    .getProperty(ADB_NATIVE_CUSTOMIZE_DEV.ALLOWLIST_PROPERTY) || '');
  const allowlist = value.split(',')
    .map(function(item) { return adbNativeNormalizeEmail_(item); })
    .filter(Boolean);
  return allowlist.indexOf(email) >= 0;
}

function adbNativeSendDevVerificationEmail_(email, requestId, confirmationUrl, payload) {
  if (!adbNativeEmailAllowlisted_(email)) {
    throw new Error('DEV confirmation recipient is not allowlisted.');
  }
  const apiKey = String(PropertiesService.getScriptProperties()
    .getProperty(ADB_NATIVE_CUSTOMIZE_DEV.RESEND_KEY_PROPERTY) || '').trim();
  if (!apiKey) throw new Error('Missing RESEND_API_KEY.');

  const changes = adbNativeHumanChangeList_(payload);
  const subject = '[CONTROLLED TEST] Confirm Austin Daily Briefing customization';
  const textBody =
    'Austin Daily Briefing — controlled DEV customization test\n\n' +
    'A customization request was received for this address. Nothing changes unless you confirm it.\n\n' +
    'Requested changes:\n' + changes.map(function(line) { return '- ' + line; }).join('\n') +
    '\n\nConfirm the request:\n' + confirmationUrl +
    '\n\nIf you did not request this, ignore this message.';

  const htmlBody =
    '<div style="font-family:Arial,sans-serif;max-width:620px;line-height:1.55;color:#181818">' +
    '<p style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#db2d2d">Controlled DEV test</p>' +
    '<h1 style="font-family:Georgia,serif;font-size:30px">Confirm your briefing changes</h1>' +
    '<p>A customization request was received for this address. Nothing changes unless you confirm it.</p>' +
    '<p><strong>Requested changes</strong></p><ul>' +
    changes.map(function(line) { return '<li>' + adbNativeEscapeHtml_(line) + '</li>'; }).join('') +
    '</ul><p><a href="' + adbNativeEscapeHtml_(confirmationUrl) + '" style="display:inline-block;background:#db2d2d;color:#fff;padding:12px 18px;text-decoration:none;font-weight:700">Review and confirm</a></p>' +
    '<p>If you did not request this, ignore this message.</p></div>';

  const response = UrlFetchApp.fetch(ADB_NATIVE_CUSTOMIZE_DEV.RESEND_ENDPOINT, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
      'Idempotency-Key': 'native-customize-dev:' + requestId
    },
    payload: JSON.stringify({
      from: ADB_NATIVE_CUSTOMIZE_DEV.FROM,
      to: [email],
      reply_to: ADB_NATIVE_CUSTOMIZE_DEV.REPLY_TO,
      subject: subject,
      text: textBody,
      html: htmlBody,
      tags: [
        {name:'message_type',value:'native_customize_dev_confirmation'},
        {name:'environment',value:'development'}
      ]
    }),
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  let body = {};
  try { body = JSON.parse(response.getContentText()); } catch (ignored) {}
  if (code < 200 || code >= 300 || !body.id) {
    throw new Error('Resend rejected controlled DEV confirmation (' + code + ').');
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

function adbNativeCustomizeDevAssertEnabled_() {
  adbNativeCustomizeDevAssertTargets_();
  if (!adbNativePropertyIsTrue_(ADB_NATIVE_CUSTOMIZE_DEV.ENABLED_PROPERTY)) {
    throw new Error('Native customization DEV endpoint is disabled.');
  }
}

function adbNativeCustomizeDevAssertTargets_() {
  if (ADB_NATIVE_CUSTOMIZE_DEV.DEV_INTAKE_ID === ADB_NATIVE_CUSTOMIZE_DEV.PROD_INTAKE_ID ||
      ADB_NATIVE_CUSTOMIZE_DEV.DEV_DATABASE_ID === ADB_NATIVE_CUSTOMIZE_DEV.PROD_DATABASE_ID) {
    throw new Error('DEV native customization target collides with production.');
  }
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

function adbNativePostMessageHtml_(result) {
  const origin = String(PropertiesService.getScriptProperties()
    .getProperty(ADB_NATIVE_CUSTOMIZE_DEV.SITE_ORIGIN_PROPERTY) ||
    ADB_NATIVE_CUSTOMIZE_DEV.DEFAULT_SITE_ORIGIN).trim();
  const payload = JSON.stringify({
    type: 'adb-native-customize-dev',
    ok: !!result.ok,
    status: String(result.status || 'temporary_error'),
    code: String(result.code || ''),
    message: String(result.message || '')
  }).replace(/</g, '\\u003c');

  const html = '<!doctype html><meta charset="utf-8"><title>ADB DEV result</title>' +
    '<script>window.parent.postMessage(' + payload + ',' +
    JSON.stringify(origin) + ');<\/script>' +
    '<p>Request processed. You may close this frame.</p>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function adbNativeConfirmPromptHtml_(rawToken) {
  const token = adbNativeEscapeHtml_(rawToken);
  const html = '<!doctype html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Confirm briefing changes</title></head>' +
    '<body style="font-family:Arial,sans-serif;background:#fffefa;color:#181818;margin:0;padding:40px">' +
    '<main style="max-width:620px;margin:0 auto">' +
    '<div style="border-top:5px solid #db2d2d;padding-top:24px">' +
    '<p style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#db2d2d">Austin Daily Briefing · DEV</p>' +
    '<h1 style="font-family:Georgia,serif;font-size:36px">Confirm your briefing changes.</h1>' +
    '<p>Nothing changes until you press the confirmation button below. This link can be used once and expires after 24 hours.</p>' +
    '<form method="post"><input type="hidden" name="action" value="confirm">' +
    '<input type="hidden" name="token" value="' + token + '">' +
    '<button type="submit" style="background:#db2d2d;color:white;border:0;padding:12px 18px;font-weight:700;cursor:pointer">Confirm changes</button>' +
    '</form><p style="margin-top:24px;color:#68635a;font-size:14px">If you did not request this, close this page and no changes will be applied.</p>' +
    '</div></main></body></html>';
  return HtmlService.createHtmlOutput(html);
}

function adbNativeConfirmationResultHtml_(result) {
  const confirmed = result && result.ok && result.status === 'confirmed';
  const title = confirmed ? 'Request confirmed.' : 'This link cannot be used.';
  const body = confirmed ?
    'Your request is confirmed. The DEV processor can now apply it exactly once.' :
    'This confirmation link is invalid, expired, or already used.';
  return adbNativeSimpleHtml_(title, body);
}

function adbNativeSimpleHtml_(title, body) {
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + adbNativeEscapeHtml_(title) + '</title></head>' +
    '<body style="font-family:Arial,sans-serif;background:#fffefa;color:#181818;margin:0;padding:40px">' +
    '<main style="max-width:620px;margin:0 auto;border-top:5px solid #db2d2d;padding-top:24px">' +
    '<h1 style="font-family:Georgia,serif;font-size:36px">' +
    adbNativeEscapeHtml_(title) + '</h1><p>' +
    adbNativeEscapeHtml_(body) + '</p></main></body></html>'
  );
}

function adbNativeEscapeHtml_(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
