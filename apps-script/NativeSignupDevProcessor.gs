/**
 * Austin Daily Briefing — Native Signup DEV Processor
 *
 * FORM-7 Gate C only.
 *
 * Responsibilities:
 * - Read Staged rows from the DEV Native Signup Requests table.
 * - Apply new-signup or re-subscribe semantics to the DEV subscriber database.
 * - Preserve existing subscriber/profile/preferences for Active and Paused no-op cases.
 * - Queue exactly one WELCOME_V1 row for a successful new signup or re-subscribe.
 * - Never send email.
 * - Fail closed on ambiguous identity or partial-write evidence.
 * - Refuse all production workbook IDs.
 */

const ADB_NATIVE_SIGNUP_PROCESSOR_DEV = Object.freeze({
  BUILD: 'native-signup-processor-dev-v1',
  DEV_DATABASE_ID: '1rl5GTOvuBSHyFK1r9CqI_6Z5gAwtgsTQnQQf9VCMeyM',
  DEV_INTAKE_ID: '1TiSgmFxij8p3wKnt_skTFXQvAOEuR2wI5c6V8Jq_Yyw',
  PROD_DATABASE_ID: '1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0',
  PROD_INTAKE_ID: '1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho',
  REQUEST_SHEET: 'Native Signup Requests',
  SUBSCRIBERS_SHEET: 'Subscribers',
  PROFILES_SHEET: 'Profiles',
  PREFERENCES_SHEET: 'Preferences',
  INTERESTS_SHEET: 'Interest Catalog',
  SIGNUP_ACTIONS_SHEET: 'Signup Actions',
  OUTBOUND_SHEET: 'Outbound Messages',
  TEMPLATES_SHEET: 'Message Templates',
  ENVIRONMENT_SHEET: 'Environment',
  CONFIG_SHEET: 'Integration Config',
  TIMEZONE: 'America/Chicago'
});

function processNativeSignupDevV1() {
  adbNsProcAssertDevBoundary_();

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const db = SpreadsheetApp.openById(ADB_NATIVE_SIGNUP_PROCESSOR_DEV.DEV_DATABASE_ID);
    const intake = SpreadsheetApp.openById(ADB_NATIVE_SIGNUP_PROCESSOR_DEV.DEV_INTAKE_ID);

    adbNsProcAssertDevEnvironment_(db, intake);

    const requestSheet = adbNsProcRequireSheet_(intake, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.REQUEST_SHEET);
    adbNsProcRequireHeaders_(requestSheet, [
      'Request ID','Created At','Email','Consent','Source','Client Nonce',
      'Response Key','Status','Processed At','Result','Notes'
    ]);

    const table = adbNsProcRows_(requestSheet);
    const summary = {
      inspected: 0,
      processed: 0,
      skipped: 0,
      errors: 0,
      new_subscribers: 0,
      resubscribed: 0,
      active_noop: 0,
      paused_noop: 0
    };

    table.rows.forEach(function(request) {
      const status = String(request.Status || '').trim();
      if (!status) return;
      summary.inspected += 1;

      if (status === 'Processed' || status === 'Error' || status === 'Processing') {
        summary.skipped += 1;
        return;
      }

      if (status !== 'Staged') {
        adbNsProcFinishRequest_(requestSheet, request.__rowNumber, 'Error', 'unsupported_request_status', 'Unexpected request status: ' + status);
        summary.errors += 1;
        return;
      }

      try {
        const result = adbNsProcProcessRequest_(db, intake, requestSheet, request);
        summary.processed += 1;
        if (result === 'new_subscriber') summary.new_subscribers += 1;
        if (result === 'resubscribed') summary.resubscribed += 1;
        if (result === 'existing_active_noop') summary.active_noop += 1;
        if (result === 'paused_requires_manage') summary.paused_noop += 1;
      } catch (error) {
        adbNsProcFinishRequest_(requestSheet, request.__rowNumber, 'Error', 'processor_error', String(error && error.message ? error.message : error));
        summary.errors += 1;
      }
    });

    SpreadsheetApp.flush();
    console.log(JSON.stringify({
      event: 'native_signup_dev_processor_complete',
      build: ADB_NATIVE_SIGNUP_PROCESSOR_DEV.BUILD,
      summary: summary,
      productionTouched: false
    }));

    return summary;
  } finally {
    lock.releaseLock();
  }
}

function adbNsProcProcessRequest_(db, intake, requestSheet, request) {
  const requestId = String(request['Request ID'] || '').trim();
  const responseKey = String(request['Response Key'] || '').trim();
  const email = adbNsProcNormalizeEmail_(request.Email);
  const consent = String(request.Consent || '').trim().toLowerCase();
  const source = String(request.Source || '').trim().toLowerCase();

  if (!/^NSDEV-[0-9a-f-]{36}$/i.test(requestId)) throw new Error('Invalid native signup Request ID.');
  if (!/^[A-Za-z0-9_-]{43}$/.test(responseKey)) throw new Error('Invalid native signup Response Key.');
  if (!adbNsProcValidEmail_(email)) throw new Error('Invalid native signup email.');
  if (consent !== 'yes') throw new Error('Affirmative consent is required.');
  if (source !== 'website') throw new Error('Unexpected native signup source.');

  const subscribers = adbNsProcRows_(adbNsProcRequireSheet_(db, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.SUBSCRIBERS_SHEET));
  const matches = subscribers.rows.filter(function(row) {
    return adbNsProcNormalizeEmail_(row.Email) === email;
  });

  if (matches.length > 1) throw new Error('Ambiguous subscriber identity for normalized email.');

  const actionId = 'NATIVE:SIGNUP:' + responseKey;
  const messageId = 'WELCOME-NATIVE:' + responseKey;

  const actions = adbNsProcRows_(adbNsProcRequireSheet_(db, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.SIGNUP_ACTIONS_SHEET));
  const outbound = adbNsProcRows_(adbNsProcRequireSheet_(db, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.OUTBOUND_SHEET));

  const actionMatches = actions.rows.filter(function(row) {
    return String(row['Submission ID'] || '').trim() === actionId;
  });
  const messageMatches = outbound.rows.filter(function(row) {
    return String(row['Message ID'] || '').trim() === messageId;
  });

  if (actionMatches.length > 1 || messageMatches.length > 1) {
    throw new Error('Duplicate native signup audit artifacts detected.');
  }
  if (actionMatches.length || messageMatches.length) {
    throw new Error('Partial native signup state detected; manual reconciliation required.');
  }

  if (matches.length === 0) {
    return adbNsProcCreateNewSubscriber_(db, intake, requestSheet, request, email, actionId, messageId);
  }

  const subscriber = matches[0];
  const subscriberStatus = String(subscriber.Status || '').trim();

  if (subscriberStatus === 'Active') {
    adbNsProcFinishRequest_(requestSheet, request.__rowNumber, 'Processed', 'existing_active_noop', 'Existing Active subscriber retained; no duplicate profile, preferences, or Welcome.');
    return 'existing_active_noop';
  }

  if (subscriberStatus === 'Paused') {
    adbNsProcFinishRequest_(requestSheet, request.__rowNumber, 'Processed', 'paused_requires_manage', 'Existing Paused subscriber retained; resume remains a Manage action.');
    return 'paused_requires_manage';
  }

  if (subscriberStatus === 'Unsubscribed') {
    return adbNsProcResubscribe_(db, intake, requestSheet, request, subscriber, email, actionId, messageId);
  }

  throw new Error('Unsupported existing subscriber status: ' + subscriberStatus);
}

function adbNsProcCreateNewSubscriber_(db, intake, requestSheet, request, email, actionId, messageId) {
  const subscribersSheet = adbNsProcRequireSheet_(db, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.SUBSCRIBERS_SHEET);
  const profilesSheet = adbNsProcRequireSheet_(db, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.PROFILES_SHEET);
  const preferencesSheet = adbNsProcRequireSheet_(db, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.PREFERENCES_SHEET);
  const interestsSheet = adbNsProcRequireSheet_(db, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.INTERESTS_SHEET);
  const actionsSheet = adbNsProcRequireSheet_(db, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.SIGNUP_ACTIONS_SHEET);
  const outboundSheet = adbNsProcRequireSheet_(db, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.OUTBOUND_SHEET);

  adbNsProcRequireHeaders_(subscribersSheet, ['Email','Status','Created','Updated','Notes','Profile ID','Preference Source Email','Admin Status']);
  adbNsProcRequireHeaders_(profilesSheet, ['Profile ID','Status','Primary Preference Email','Latest Submission ID','Customize URL','Last Preference Update','Notes','More for You Volume','Summary Style','Why It Matters Length']);
  adbNsProcRequireHeaders_(preferencesSheet, ['Profile ID','Interest ID','Preference','Score','Updated','Source Submission ID','Profile ID']);
  adbNsProcRequireHeaders_(interestsSheet, ['Interest ID','Group','Interest','Default Preference','Default Scope','Active']);
  adbNsProcRequireHeaders_(actionsSheet, ['Submission ID','Received At','Email','Profile ID','Subscriber Result','Profile Result','Preferences Result','Welcome Queue Result','Processed At','Notes']);
  adbNsProcRequireHeaders_(outboundSheet, ['Message ID','Created At','Profile ID','Email','Template ID','Status','Subject','Customize URL','Sent At / Gmail ID','Notes']);

  const profileId = adbNsProcNextProfileId_(profilesSheet);
  const now = adbNsProcNow_();
  const activeInterests = adbNsProcRows_(interestsSheet).rows.filter(function(row) {
    return String(row.Active || '').trim().toUpperCase() === 'TRUE';
  });

  if (activeInterests.length !== 23) throw new Error('Expected exactly 23 active DEV interests.');

  const welcome = adbNsProcWelcomeTemplate_(db);
  const customizeUrl = adbNsProcCustomizeUrl_(intake);

  adbNsProcMarkProcessing_(requestSheet, request.__rowNumber, 'new_subscriber');

  subscribersSheet.appendRow([
    email,
    'Active',
    now,
    now,
    'Created by FORM-7 native signup DEV processor.',
    profileId,
    email,
    'OK'
  ]);

  profilesSheet.appendRow([
    profileId,
    'Active',
    email,
    'NATIVE:SIGNUP:' + String(request['Response Key'] || '').trim(),
    customizeUrl,
    now,
    'Created by FORM-7 native signup DEV processor.',
    'Standard',
    'Standard',
    'Standard'
  ]);

  activeInterests.forEach(function(interest) {
    const pref = String(interest['Default Preference'] || 'Normal').trim() || 'Normal';
    preferencesSheet.appendRow([
      profileId,
      String(interest['Interest ID'] || '').trim(),
      pref,
      adbNsProcPreferenceScore_(pref),
      now,
      'NATIVE:SIGNUP:' + String(request['Response Key'] || '').trim(),
      profileId
    ]);
  });

  actionsSheet.appendRow([
    actionId,
    adbNsProcDisplayCreatedAt_(request['Created At']) + ' Native Signup',
    email,
    profileId,
    'Created',
    'Created',
    activeInterests.length + ' active interests initialized Normal',
    'WELCOME-NATIVE queued',
    now,
    'FORM-7 DEV native signup; no direct delivery.'
  ]);

  outboundSheet.appendRow([
    messageId,
    now,
    profileId,
    email,
    'WELCOME_V1',
    'Queued',
    welcome.subject,
    customizeUrl,
    '',
    'Queued by FORM-7 DEV native signup processor; dispatcher ownership preserved.'
  ]);

  SpreadsheetApp.flush();
  adbNsProcFinishRequest_(requestSheet, request.__rowNumber, 'Processed', 'new_subscriber', 'Created subscriber/profile, initialized 23 Normal preferences, and queued one WELCOME_V1.');
  return 'new_subscriber';
}

function adbNsProcResubscribe_(db, intake, requestSheet, request, subscriber, email, actionId, messageId) {
  const subscribersSheet = adbNsProcRequireSheet_(db, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.SUBSCRIBERS_SHEET);
  const profilesSheet = adbNsProcRequireSheet_(db, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.PROFILES_SHEET);
  const preferencesSheet = adbNsProcRequireSheet_(db, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.PREFERENCES_SHEET);
  const actionsSheet = adbNsProcRequireSheet_(db, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.SIGNUP_ACTIONS_SHEET);
  const outboundSheet = adbNsProcRequireSheet_(db, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.OUTBOUND_SHEET);

  const profileId = String(subscriber['Profile ID'] || '').trim();
  if (!profileId) throw new Error('Unsubscribed subscriber has no Profile ID.');

  const profiles = adbNsProcRows_(profilesSheet).rows.filter(function(row) {
    return String(row['Profile ID'] || '').trim() === profileId;
  });
  if (profiles.length !== 1) throw new Error('Re-subscribe requires exactly one existing profile.');

  const preferences = adbNsProcRows_(preferencesSheet).rows.filter(function(row) {
    return String(row['Profile ID'] || '').trim() === profileId;
  });
  if (!preferences.length) throw new Error('Re-subscribe requires existing preferences to preserve.');

  const welcome = adbNsProcWelcomeTemplate_(db);
  const customizeUrl = adbNsProcCustomizeUrl_(intake);
  const now = adbNsProcNow_();

  adbNsProcMarkProcessing_(requestSheet, request.__rowNumber, 'resubscribe');

  subscribersSheet.getRange(subscriber.__rowNumber, 2).setValue('Active');
  subscribersSheet.getRange(subscriber.__rowNumber, 4).setValue(now);

  actionsSheet.appendRow([
    actionId,
    adbNsProcDisplayCreatedAt_(request['Created At']) + ' Native Signup',
    email,
    profileId,
    'Reactivated',
    'Existing profile preserved',
    preferences.length + ' existing preference rows preserved',
    'WELCOME-NATIVE queued',
    now,
    'FORM-7 DEV re-subscribe; existing profile/preferences preserved.'
  ]);

  outboundSheet.appendRow([
    messageId,
    now,
    profileId,
    email,
    'WELCOME_V1',
    'Queued',
    welcome.subject,
    customizeUrl,
    '',
    'Queued after FORM-7 DEV re-subscribe; dispatcher ownership preserved.'
  ]);

  SpreadsheetApp.flush();
  adbNsProcFinishRequest_(requestSheet, request.__rowNumber, 'Processed', 'resubscribed', 'Reactivated existing subscriber, preserved profile/preferences, and queued one WELCOME_V1.');
  return 'resubscribed';
}

function adbNsProcMarkProcessing_(requestSheet, rowNumber, mode) {
  const now = adbNsProcNow_();
  requestSheet.getRange(rowNumber, 8, 1, 4).setValues([[
    'Processing',
    '',
    mode,
    'Mutation started ' + now + '; fail closed if this row remains Processing.'
  ]]);
  SpreadsheetApp.flush();
}

function adbNsProcFinishRequest_(requestSheet, rowNumber, status, result, notes) {
  requestSheet.getRange(rowNumber, 8, 1, 4).setValues([[
    status,
    adbNsProcNow_(),
    result,
    notes || ''
  ]]);
}

function adbNsProcNextProfileId_(profilesSheet) {
  const rows = adbNsProcRows_(profilesSheet).rows;
  let max = 0;
  rows.forEach(function(row) {
    const match = /^PDEV(\d+)$/.exec(String(row['Profile ID'] || '').trim());
    if (match) max = Math.max(max, Number(match[1]));
  });
  return 'PDEV' + String(max + 1).padStart(3, '0');
}

function adbNsProcWelcomeTemplate_(db) {
  const table = adbNsProcRows_(adbNsProcRequireSheet_(db, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.TEMPLATES_SHEET));
  const rows = table.rows.filter(function(row) {
    return String(row['Template ID'] || '').trim() === 'WELCOME_V1' &&
      String(row.Active || '').trim().toUpperCase() === 'TRUE';
  });
  if (rows.length !== 1) throw new Error('Expected exactly one active DEV WELCOME_V1 template.');
  return { subject: String(rows[0].Subject || 'Welcome to the Austin Daily Briefing').trim() };
}

function adbNsProcCustomizeUrl_(intake) {
  const config = adbNsProcSettings_(adbNsProcRequireSheet_(intake, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.CONFIG_SHEET));
  const value = String(config['Google Customize Form ID / URL'] || '').trim();
  const parts = value.split('|').map(function(part) { return String(part || '').trim(); }).filter(Boolean);
  const url = parts.length > 1 ? parts[parts.length - 1] : value;
  if (!/^https:\/\/docs\.google\.com\/forms\//.test(url)) throw new Error('DEV customize form URL is missing or invalid.');
  return url;
}

function adbNsProcPreferenceScore_(preference) {
  const value = String(preference || '').trim();
  if (value === 'Off') return 0;
  if (value === 'Normal') return 1;
  if (value === 'High') return 2;
  throw new Error('Unsupported preference value: ' + value);
}

function adbNsProcDisplayCreatedAt_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.TIMEZONE, 'yyyy-MM-dd HH:mm:ss z');
  return String(value || '').trim();
}

function adbNsProcNow_() {
  return Utilities.formatDate(new Date(), ADB_NATIVE_SIGNUP_PROCESSOR_DEV.TIMEZONE, 'yyyy-MM-dd HH:mm:ss z');
}

function adbNsProcNormalizeEmail_(value) {
  return String(value || '').trim().toLowerCase();
}

function adbNsProcValidEmail_(email) {
  if (!email || email.length > 254 || /\s/.test(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function adbNsProcRows_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (!values.length) return {headers: [], rows: []};
  const headers = values[0].map(String);
  return {
    headers: headers,
    rows: values.slice(1).map(function(row, index) {
      const out = headers.reduce(function(obj, header, col) {
        obj[header] = row[col];
        return obj;
      }, {});
      out.__rowNumber = index + 2;
      return out;
    }).filter(function(row) {
      return headers.some(function(header) { return row[header] !== '' && row[header] != null; });
    })
  };
}

function adbNsProcRequireSheet_(spreadsheet, name) {
  const sheet = spreadsheet.getSheetByName(name);
  if (!sheet) throw new Error('Required sheet missing: ' + name);
  return sheet;
}

function adbNsProcRequireHeaders_(sheet, expected) {
  const actual = sheet.getRange(1, 1, 1, expected.length).getDisplayValues()[0];
  expected.forEach(function(header, index) {
    if (String(actual[index] || '') !== header) {
      throw new Error('Unexpected header in ' + sheet.getName() + ' column ' + (index + 1) + ': expected ' + header + ', found ' + String(actual[index] || ''));
    }
  });
}

function adbNsProcSettings_(sheet) {
  const values = sheet.getDataRange().getDisplayValues();
  return values.slice(1).reduce(function(out, row) {
    const key = String(row[0] || '').trim();
    if (key) out[key] = String(row[1] || '').trim();
    return out;
  }, {});
}

function adbNsProcAssertDevEnvironment_(db, intake) {
  const env = adbNsProcSettings_(adbNsProcRequireSheet_(db, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.ENVIRONMENT_SHEET));
  const cfg = adbNsProcSettings_(adbNsProcRequireSheet_(intake, ADB_NATIVE_SIGNUP_PROCESSOR_DEV.CONFIG_SHEET));

  if (env.Environment !== 'DEVELOPMENT') throw new Error('DEV database Environment mismatch.');
  if (env['Database ID'] !== ADB_NATIVE_SIGNUP_PROCESSOR_DEV.DEV_DATABASE_ID) throw new Error('DEV database identity mismatch.');
  if (env['Production Writes'] !== 'FORBIDDEN') throw new Error('DEV database Production Writes must be FORBIDDEN.');
  if (env['Schema Baseline'] !== 'GOOGLE-23-1') throw new Error('DEV schema baseline mismatch.');

  if (cfg.Environment !== 'DEVELOPMENT') throw new Error('DEV intake Environment mismatch.');
  if (cfg['Operational DEV Database ID'] !== ADB_NATIVE_SIGNUP_PROCESSOR_DEV.DEV_DATABASE_ID) throw new Error('DEV intake database mapping mismatch.');
  if (cfg['Production Database ID'] !== ADB_NATIVE_SIGNUP_PROCESSOR_DEV.PROD_DATABASE_ID) throw new Error('DEV intake production reference mismatch.');
  if (cfg['Production Writes'] !== 'FORBIDDEN') throw new Error('DEV intake Production Writes must be FORBIDDEN.');
}

function adbNsProcAssertDevBoundary_() {
  const ids = [
    ADB_NATIVE_SIGNUP_PROCESSOR_DEV.DEV_DATABASE_ID,
    ADB_NATIVE_SIGNUP_PROCESSOR_DEV.DEV_INTAKE_ID
  ];
  if (ids.indexOf(ADB_NATIVE_SIGNUP_PROCESSOR_DEV.PROD_DATABASE_ID) >= 0 ||
      ids.indexOf(ADB_NATIVE_SIGNUP_PROCESSOR_DEV.PROD_INTAKE_ID) >= 0) {
    throw new Error('Native signup DEV processor refuses production workbook IDs.');
  }
}
