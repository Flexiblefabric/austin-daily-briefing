/**
 * Austin Daily Briefing — Native customization DEV QA
 *
 * Requires NativeCustomizationDev.gs in the same Apps Script project.
 * No production spreadsheet IDs are used by these functions.
 */

const ADB_NATIVE_CUSTOMIZE_DEV_QA = Object.freeze({
  TEST_EMAIL_PROPERTY: 'ADB_NATIVE_CUSTOMIZE_DEV_TEST_EMAIL'
});

/**
 * Read-only validation of configuration, DEV targets, and expected sheet schema.
 */
function validateNativeCustomizationDevV1() {
  adbNativeCustomizeDevAssertTargets_();
  const setup = setupNativeCustomizationDevV1();

  const intake = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_DEV.DEV_INTAKE_ID);
  const requestSheet = intake.getSheetByName(ADB_NATIVE_CUSTOMIZE_DEV.REQUEST_SHEET);
  const verificationSheet = intake.getSheetByName(ADB_NATIVE_CUSTOMIZE_DEV.VERIFICATION_SHEET);

  const requestHeaders = requestSheet
    .getRange(1,1,1,ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS.length)
    .getDisplayValues()[0];
  const verificationHeaders = verificationSheet
    .getRange(1,1,1,ADB_NATIVE_CUSTOMIZE_VERIFICATION_HEADERS.length)
    .getDisplayValues()[0];

  adbNativeQaAssert_(
    JSON.stringify(requestHeaders) === JSON.stringify(ADB_NATIVE_CUSTOMIZE_REQUEST_HEADERS),
    'Request sheet headers do not match.'
  );
  adbNativeQaAssert_(
    JSON.stringify(verificationHeaders) === JSON.stringify(ADB_NATIVE_CUSTOMIZE_VERIFICATION_HEADERS),
    'Verification sheet headers do not match.'
  );

  const props = PropertiesService.getScriptProperties();
  const report = {
    setup: setup,
    enabled: adbNativePropertyIsTrue_(ADB_NATIVE_CUSTOMIZE_DEV.ENABLED_PROPERTY),
    sendEmail: adbNativePropertyIsTrue_(ADB_NATIVE_CUSTOMIZE_DEV.SEND_EMAIL_PROPERTY),
    webAppUrlConfigured: !!String(props.getProperty(
      ADB_NATIVE_CUSTOMIZE_DEV.WEB_APP_URL_PROPERTY) || '').trim(),
    siteOrigin: String(props.getProperty(
      ADB_NATIVE_CUSTOMIZE_DEV.SITE_ORIGIN_PROPERTY) ||
      ADB_NATIVE_CUSTOMIZE_DEV.DEFAULT_SITE_ORIGIN),
    allowlistCount: String(props.getProperty(
      ADB_NATIVE_CUSTOMIZE_DEV.ALLOWLIST_PROPERTY) || '')
      .split(',').map(function(v){return v.trim();}).filter(Boolean).length,
    productionTouched: false
  };
  Logger.log(JSON.stringify(report));
  return report;
}

/**
 * Pure validation/unit vectors. Does not write Sheets or send email.
 */
function runNativeCustomizationDevUnitTestsV1() {
  const tests = [];

  function record(name, fn) {
    try {
      fn();
      tests.push({name:name,pass:true});
    } catch (error) {
      tests.push({name:name,pass:false,error:String(error.message || error)});
    }
  }

  record('valid email normalization', function() {
    adbNativeQaAssert_(
      adbNativeNormalizeEmail_('  Person@Example.COM ') === 'person@example.com',
      'Email normalization failed.'
    );
  });

  record('valid email accepted', function() {
    adbNativeQaAssert_(adbNativeValidEmail_('person@example.com'), 'Valid email rejected.');
  });

  record('malformed email rejected', function() {
    adbNativeQaAssert_(!adbNativeValidEmail_('not-an-email'), 'Malformed email accepted.');
  });

  record('single interest change builds payload', function() {
    const result = adbNativeBuildPayload_({CIV01:'high'});
    adbNativeQaAssert_(result.ok, 'Payload rejected.');
    adbNativeQaAssert_(result.payload.CIV01 === 'high', 'Interest value missing.');
    adbNativeQaAssert_(Object.keys(result.payload).length === 1, 'Unexpected payload fields.');
  });

  record('style-only change builds payload', function() {
    const result = adbNativeBuildPayload_({summary_style:'explanatory'});
    adbNativeQaAssert_(result.ok, 'Style payload rejected.');
    adbNativeQaAssert_(result.payload.summary_style === 'explanatory', 'Style value missing.');
  });

  record('all keep-current rejected', function() {
    const result = adbNativeBuildPayload_({});
    adbNativeQaAssert_(!result.ok && result.code === 'no_changes',
      'No-change request was not rejected.');
  });

  record('invalid interest option rejected', function() {
    const result = adbNativeBuildPayload_({CIV01:'maximum'});
    adbNativeQaAssert_(!result.ok && result.code === 'invalid_option',
      'Invalid interest option accepted.');
  });

  record('invalid style option rejected', function() {
    const result = adbNativeBuildPayload_({summary_style:'novel'});
    adbNativeQaAssert_(!result.ok && result.code === 'invalid_option',
      'Invalid style option accepted.');
  });

  record('stable payload hash independent of object order', function() {
    const left = adbNativeSha256Hex_(adbNativeStableStringify_({CIV01:'high',CUL02:'off'}));
    const right = adbNativeSha256Hex_(adbNativeStableStringify_({CUL02:'off',CIV01:'high'}));
    adbNativeQaAssert_(left === right, 'Stable payload hashing failed.');
  });

  record('token generator creates non-identical high-entropy strings', function() {
    const a = adbNativeGenerateToken_();
    const b = adbNativeGenerateToken_();
    adbNativeQaAssert_(a.length >= 40 && b.length >= 40, 'Token too short.');
    adbNativeQaAssert_(a !== b, 'Token collision in immediate test.');
  });

  record('token hash deterministic', function() {
    adbNativeQaAssert_(
      adbNativeSha256Hex_('abc') === adbNativeSha256Hex_('abc'),
      'Token hash not deterministic.'
    );
  });

  record('constant-time helper equal', function() {
    adbNativeQaAssert_(adbNativeConstantTimeEqual_('abc','abc'), 'Equal strings rejected.');
  });

  record('constant-time helper unequal', function() {
    adbNativeQaAssert_(!adbNativeConstantTimeEqual_('abc','abd'), 'Unequal strings accepted.');
  });

  const failed = tests.filter(function(test){ return !test.pass; });
  const report = {
    total: tests.length,
    passed: tests.length - failed.length,
    failed: failed.length,
    tests: tests,
    productionTouched: false
  };
  Logger.log(JSON.stringify(report));
  if (failed.length) throw new Error('Native customization DEV unit tests failed: ' + failed.length);
  return report;
}

/**
 * Stages one controlled request using ADB_NATIVE_CUSTOMIZE_DEV_TEST_EMAIL.
 *
 * With ADB_NATIVE_CUSTOMIZE_DEV_SEND_EMAIL=FALSE this writes only to the DEV
 * request sheet. With SEND_EMAIL=TRUE, the test email must also be in the
 * explicit DEV allowlist and a current DEV web-app URL must be configured.
 */
function stageNativeCustomizationDevControlledTestV1() {
  adbNativeCustomizeDevAssertEnabled_();
  const email = adbNativeNormalizeEmail_(
    PropertiesService.getScriptProperties()
      .getProperty(ADB_NATIVE_CUSTOMIZE_DEV_QA.TEST_EMAIL_PROPERTY)
  );
  if (!adbNativeValidEmail_(email)) {
    throw new Error('Set ADB_NATIVE_CUSTOMIZE_DEV_TEST_EMAIL to a valid DEV subscriber address.');
  }

  const params = {
    action:'request',
    email:email,
    company:'',
    CIV01:'high',
    CUL04:'off',
    summary_style:'explanatory'
  };
  const event = {
    parameter:params,
    parameters:{
      action:['request'],
      email:[email],
      company:[''],
      CIV01:['high'],
      CUL04:['off'],
      summary_style:['explanatory']
    },
    postData:{length:240}
  };

  const result = adbNativeStageCustomizeRequestDevV1_(event, params);
  const report = {
    status:result.status,
    ok:result.ok,
    sendEmail:adbNativePropertyIsTrue_(ADB_NATIVE_CUSTOMIZE_DEV.SEND_EMAIL_PROPERTY),
    productionTouched:false
  };
  Logger.log(JSON.stringify(report));
  return report;
}

/**
 * Privacy-safe state summary. Does not return subscriber addresses or payloads.
 */
function inspectNativeCustomizationDevStateV1() {
  setupNativeCustomizationDevV1();
  const intake = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_DEV.DEV_INTAKE_ID);
  const requests = adbNativeRowsByHeader_(
    intake.getSheetByName(ADB_NATIVE_CUSTOMIZE_DEV.REQUEST_SHEET));
  const verifications = adbNativeRowsByHeader_(
    intake.getSheetByName(ADB_NATIVE_CUSTOMIZE_DEV.VERIFICATION_SHEET));

  const requestStatuses = {};
  requests.rows.forEach(function(row) {
    const status = String(row.Status || 'Blank');
    requestStatuses[status] = (requestStatuses[status] || 0) + 1;
  });

  const verificationStatuses = {};
  verifications.rows.forEach(function(row) {
    const status = String(row.Status || 'Blank');
    verificationStatuses[status] = (verificationStatuses[status] || 0) + 1;
  });

  const report = {
    requestCount: requests.rows.length,
    requestStatuses: requestStatuses,
    verificationCount: verifications.rows.length,
    verificationStatuses: verificationStatuses,
    productionTouched: false
  };
  Logger.log(JSON.stringify(report));
  return report;
}

/**
 * Removes the current test email's throttle keys to make repeated manual QA less
 * frustrating. Does not remove request/verification records.
 */
function clearNativeCustomizationDevTestThrottleV1() {
  const email = adbNativeNormalizeEmail_(
    PropertiesService.getScriptProperties()
      .getProperty(ADB_NATIVE_CUSTOMIZE_DEV_QA.TEST_EMAIL_PROPERTY)
  );
  if (!adbNativeValidEmail_(email)) {
    throw new Error('Set ADB_NATIVE_CUSTOMIZE_DEV_TEST_EMAIL first.');
  }
  const cache = CacheService.getScriptCache();
  const emailHash = adbNativeSha256Hex_(email).slice(0,32);
  cache.remove('ncdev:cool:' + emailHash);
  cache.remove('ncdev:addr:' + emailHash);
  const report = {cleared:true,productionTouched:false};
  Logger.log(JSON.stringify(report));
  return report;
}

function adbNativeQaAssert_(condition, message) {
  if (!condition) throw new Error(message || 'QA assertion failed.');
}
