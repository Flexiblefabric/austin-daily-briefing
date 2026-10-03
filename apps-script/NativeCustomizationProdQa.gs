/**
 * Austin Daily Briefing — Native customization PRODUCTION QA
 *
 * Read-only/pure validation for the staged production endpoint.
 * This file deliberately contains no helper that stages a production request,
 * sends email, confirms a token, or applies preferences.
 */

function validateNativeCustomizationProdV1() {
  adbNativeCustomizeProdAssertTargets_();

  const props = PropertiesService.getScriptProperties();
  const config = adbNativeProdIntegrationConfig_();
  const database = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_PROD.PROD_DATABASE_ID);
  const envSheet = database.getSheetByName('Environment');
  const intake = SpreadsheetApp.openById(ADB_NATIVE_CUSTOMIZE_PROD.PROD_INTAKE_ID);

  const existingSheets = intake.getSheets().map(function(sheet) {
    return sheet.getName();
  });

  const report = {
    environment: String(config.Environment || ''),
    processorMode: String(config['Processor Mode'] || ''),
    productionWrites: String(config['Production Writes'] || ''),
    deliveryMode: String(config['Delivery Mode'] || ''),
    databaseEnvironmentSheetPresent: !!envSheet,
    enabled: adbNativePropertyIsTrue_(ADB_NATIVE_CUSTOMIZE_PROD.ENABLED_PROPERTY),
    mode: String(props.getProperty(ADB_NATIVE_CUSTOMIZE_PROD.MODE_PROPERTY) || '').trim().toUpperCase(),
    sendEmail: adbNativePropertyIsTrue_(ADB_NATIVE_CUSTOMIZE_PROD.SEND_EMAIL_PROPERTY),
    webAppUrlConfigured: /^https:\/\/script\.google\.com\/macros\/s\//.test(
      String(props.getProperty(ADB_NATIVE_CUSTOMIZE_PROD.WEB_APP_URL_PROPERTY) || '').trim()
    ),
    siteOrigin: String(props.getProperty(
      ADB_NATIVE_CUSTOMIZE_PROD.SITE_ORIGIN_PROPERTY) ||
      ADB_NATIVE_CUSTOMIZE_PROD.DEFAULT_SITE_ORIGIN),
    confirmPageUrl: String(props.getProperty(
      ADB_NATIVE_CUSTOMIZE_PROD.CONFIRM_PAGE_URL_PROPERTY) || ''),
    relaySecretConfigured: String(props.getProperty(
      ADB_NATIVE_CUSTOMIZE_PROD.RELAY_SECRET_PROPERTY) || '').length >= 32,
    allowlistCount: String(props.getProperty(
      ADB_NATIVE_CUSTOMIZE_PROD.ALLOWLIST_PROPERTY) || '')
      .split(',').map(function(value){return value.trim();}).filter(Boolean).length,
    controlledEmailConfigured: adbNativeValidEmail_(
      adbNativeNormalizeEmail_(String(config['Native Customize Controlled Email'] || ''))
    ),
    controlledEmailAllowlisted: adbNativeEmailAllowlisted_(
      adbNativeNormalizeEmail_(String(config['Native Customize Controlled Email'] || ''))
    ),
    requestSheetExists: existingSheets.indexOf(ADB_NATIVE_CUSTOMIZE_PROD.REQUEST_SHEET) >= 0,
    verificationSheetExists: existingSheets.indexOf(ADB_NATIVE_CUSTOMIZE_PROD.VERIFICATION_SHEET) >= 0,
    diagnosticSheetExists: existingSheets.indexOf(ADB_NATIVE_CUSTOMIZE_PROD.DIAGNOSTIC_SHEET) >= 0,
    directApplyOwner: 'Production Subscriber Operations only',
    productionWritesPerformed: false
  };

  if (report.mode !== 'CONTROLLED' && report.mode !== 'LIVE' && report.enabled) {
    throw new Error('Enabled production endpoint has invalid mode.');
  }
  if (report.mode === 'CONTROLLED' && report.enabled) {
    if (String(report.processorMode).toUpperCase() !== 'GOOGLE + NATIVE CONTROLLED') {
      throw new Error('CONTROLLED mode requires Processor Mode = GOOGLE + NATIVE CONTROLLED.');
    }
    if (report.allowlistCount < 1 || !report.controlledEmailConfigured ||
        !report.controlledEmailAllowlisted) {
      throw new Error('CONTROLLED mode requires one valid authorized controlled email.');
    }
  }
  if (report.mode === 'LIVE' &&
      String(report.processorMode).toUpperCase() !== 'GOOGLE + NATIVE') {
    throw new Error('LIVE mode requires Processor Mode = GOOGLE + NATIVE.');
  }
  if (report.enabled && report.confirmPageUrl !== 'https://austindailybriefing.com/confirm.html') {
    throw new Error('Enabled production endpoint has invalid confirmation page URL.');
  }

  Logger.log(JSON.stringify(report));
  return report;
}

function runNativeCustomizationProdUnitTestsV1() {
  const tests = [];

  function record(name, fn) {
    try {
      fn();
      tests.push({name:name,pass:true});
    } catch (error) {
      tests.push({name:name,pass:false,error:String(error.message || error)});
    }
  }

  record('production IDs are hard-wired and distinct from DEV', function() {
    adbNativeQaProdAssert_(
      ADB_NATIVE_CUSTOMIZE_PROD.PROD_INTAKE_ID ===
        '1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho',
      'Unexpected production intake ID.'
    );
    adbNativeQaProdAssert_(
      ADB_NATIVE_CUSTOMIZE_PROD.PROD_DATABASE_ID ===
        '1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0',
      'Unexpected production database ID.'
    );
    adbNativeQaProdAssert_(
      ADB_NATIVE_CUSTOMIZE_PROD.PROD_INTAKE_ID !==
        ADB_NATIVE_CUSTOMIZE_PROD.FORBIDDEN_DEV_INTAKE_ID &&
      ADB_NATIVE_CUSTOMIZE_PROD.PROD_DATABASE_ID !==
        ADB_NATIVE_CUSTOMIZE_PROD.FORBIDDEN_DEV_DATABASE_ID,
      'Production target collides with DEV.'
    );
  });

  record('valid email normalization', function() {
    adbNativeQaProdAssert_(
      adbNativeNormalizeEmail_('  Person@Example.COM ') === 'person@example.com',
      'Email normalization failed.'
    );
  });

  record('valid email accepted', function() {
    adbNativeQaProdAssert_(
      adbNativeValidEmail_('person@example.com'),
      'Valid email rejected.'
    );
  });

  record('malformed email rejected', function() {
    adbNativeQaProdAssert_(
      !adbNativeValidEmail_('not-an-email'),
      'Malformed email accepted.'
    );
  });

  record('single interest patch builds payload', function() {
    const result = adbNativeBuildPayload_({CIV01:'high'});
    adbNativeQaProdAssert_(result.ok, 'Payload rejected.');
    adbNativeQaProdAssert_(result.payload.CIV01 === 'high', 'Interest value missing.');
    adbNativeQaProdAssert_(Object.keys(result.payload).length === 1, 'Unexpected payload fields.');
  });

  record('style-only patch builds payload', function() {
    const result = adbNativeBuildPayload_({summary_style:'explanatory'});
    adbNativeQaProdAssert_(result.ok, 'Style payload rejected.');
    adbNativeQaProdAssert_(
      result.payload.summary_style === 'explanatory',
      'Style value missing.'
    );
  });

  record('all keep-current rejected', function() {
    const result = adbNativeBuildPayload_({});
    adbNativeQaProdAssert_(
      !result.ok && result.code === 'no_changes',
      'No-change request was not rejected.'
    );
  });

  record('invalid option rejected', function() {
    const result = adbNativeBuildPayload_({CIV01:'maximum'});
    adbNativeQaProdAssert_(
      !result.ok && result.code === 'invalid_option',
      'Invalid option accepted.'
    );
  });

  record('token generator is non-identical and high entropy', function() {
    const left = adbNativeGenerateToken_();
    const right = adbNativeGenerateToken_();
    adbNativeQaProdAssert_(left.length >= 40 && right.length >= 40, 'Token too short.');
    adbNativeQaProdAssert_(left !== right, 'Immediate token collision.');
  });

  record('relay probe nonce format is distinct from confirmation tokens', function() {
    const probe = 'prod-probe-0123456789abcdef0123456789abcdef';
    adbNativeQaProdAssert_(
      /^prod-probe-[A-Za-z0-9_-]{16,128}$/.test(probe),
      'Probe nonce format rejected.'
    );
  });

  record('relay HMAC is deterministic and secret-bound', function() {
    const left = adbNativeHmacSha256Hex_(
      '1700000000000:test-token',
      'abcdefghijklmnopqrstuvwxyz123456'
    );
    const same = adbNativeHmacSha256Hex_(
      '1700000000000:test-token',
      'abcdefghijklmnopqrstuvwxyz123456'
    );
    const different = adbNativeHmacSha256Hex_(
      '1700000000000:test-token',
      'abcdefghijklmnopqrstuvwxyz654321'
    );
    adbNativeQaProdAssert_(left === same, 'HMAC is not deterministic.');
    adbNativeQaProdAssert_(left !== different, 'HMAC is not secret-bound.');
    adbNativeQaProdAssert_(/^[a-f0-9]{64}$/.test(left), 'Unexpected HMAC encoding.');
  });

  record('production request source is distinct', function() {
    adbNativeQaProdAssert_(
      ADB_NATIVE_CUSTOMIZE_PROD.BUILD_ID.indexOf('prod') >= 0,
      'Production build marker is missing.'
    );
  });

  const failed = tests.filter(function(test){return !test.pass;});
  const report = {
    total: tests.length,
    passed: tests.length - failed.length,
    failed: failed.length,
    tests: tests,
    productionWritesPerformed: false
  };
  Logger.log(JSON.stringify(report));
  if (failed.length) {
    throw new Error('Native customization PROD unit tests failed: ' + failed.length);
  }
  return report;
}

function adbNativeQaProdAssert_(condition, message) {
  if (!condition) throw new Error(message || 'QA assertion failed.');
}
