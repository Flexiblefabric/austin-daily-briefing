/**
 * Austin Daily Briefing — FORM-9 native management DEV processor.
 *
 * DEV ONLY. Applies Confirmed Native Manage Requests exactly once.
 * Production Subscriber Operations remains untouched during FORM-9 DEV.
 */

function processConfirmedNativeManagementDevV1() {
  adbManageAssertDevTargets_();
  setupNativeManagementDevV1();

  const intake = SpreadsheetApp.openById(ADB_NATIVE_MANAGE_DEV.DEV_INTAKE_ID);
  const requestSheet = intake.getSheetByName(ADB_NATIVE_MANAGE_DEV.REQUEST_SHEET);
  const requests = adbManageRowsByHeader_(requestSheet);
  const report = {
    build:ADB_NATIVE_MANAGE_DEV.BUILD_ID,
    inspected:0,
    applied:0,
    noChange:0,
    errors:0,
    productionTouched:false
  };

  requests.rows.forEach(function(row,index) {
    if (String(row.Status || '') !== 'Confirmed') return;
    report.inspected += 1;
    try {
      const result = adbManageApplyConfirmedRequestDev_(
        requestSheet, requests.headers, index + 2, row
      );
      if (result === 'applied') report.applied += 1;
      if (result === 'no_change') report.noChange += 1;
    } catch (error) {
      report.errors += 1;
      console.error('FORM-9 DEV processor request failed: ' +
        String(error && error.message ? error.message : error).slice(0,500));
    }
  });

  console.log(JSON.stringify(report));
  return report;
}

function adbManageApplyConfirmedRequestDev_(requestSheet, requestHeaders, requestRow, request) {
  const intake = SpreadsheetApp.openById(ADB_NATIVE_MANAGE_DEV.DEV_INTAKE_ID);
  const verificationSheet = intake.getSheetByName(ADB_NATIVE_MANAGE_DEV.VERIFICATION_SHEET);
  const verifications = adbManageRowsByHeader_(verificationSheet);
  const verification = adbManageFindUniqueRow_(
    verifications, 'Verification ID', String(request['Verification ID'] || '')
  );
  if (!verification) throw new Error('Linked management verification is missing.');
  if (String(verification.row.Status || '') !== 'Confirmed' ||
      String(verification.row['Applied At'] || '').trim()) {
    throw new Error('Linked management verification is not eligible.');
  }
  if (String(verification.row['Request ID'] || '') !== String(request['Request ID'] || '') ||
      adbManageNormalizeEmail_(verification.row.Email) !== adbManageNormalizeEmail_(request.Email)) {
    throw new Error('Management request/verification linkage mismatch.');
  }

  const payload = adbManagePayloadFromStoredRequest_(request);
  if (!payload.ok ||
      !adbManageConstantTimeEqual_(payload.hash, String(request['Payload SHA-256'] || ''))) {
    throw new Error('Management request payload hash mismatch.');
  }

  const database = SpreadsheetApp.openById(ADB_NATIVE_MANAGE_DEV.DEV_DATABASE_ID);
  const subscriberSheet = database.getSheetByName('Subscribers');
  const profileSheet = database.getSheetByName('Profiles');
  const preferenceSheet = database.getSheetByName('Preferences');
  const interestSheet = database.getSheetByName('Interest Catalog');
  const actionSheet = database.getSheetByName('Management Actions');
  if (!subscriberSheet || !profileSheet || !preferenceSheet || !interestSheet || !actionSheet) {
    throw new Error('Required DEV management database sheet is missing.');
  }

  const subscribers = adbManageRowsByHeader_(subscriberSheet);
  const subscriberMatches = [];
  subscribers.rows.forEach(function(row,index) {
    if (adbManageNormalizeEmail_(row.Email) === adbManageNormalizeEmail_(request.Email)) {
      subscriberMatches.push({row:row,sheetRow:index+2});
    }
  });
  if (subscriberMatches.length !== 1) throw new Error('DEV subscriber identity is not unique.');
  const subscriber = subscriberMatches[0];
  const profileId = String(subscriber.row['Profile ID'] || '').trim();
  if (!profileId) throw new Error('DEV subscriber Profile ID is missing.');

  const profiles = adbManageRowsByHeader_(profileSheet);
  const profile = adbManageFindUniqueRow_(profiles, 'Profile ID', profileId);
  if (!profile) throw new Error('DEV profile is missing or ambiguous.');

  const submissionId = 'NATIVE:MANAGE:' + String(request['Request ID'] || '');
  const actions = adbManageRowsByHeader_(actionSheet);
  const existingAction = adbManageFindUniqueRow_(actions, 'Submission ID', submissionId);
  if (existingAction) {
    if (String(request.Status || '') === 'Applied') return 'no_change';
    throw new Error('Deterministic Management Action already exists before request closeout.');
  }

  const priorStatus = String(subscriber.row.Status || '').trim();
  const profileStatus = String(profile.row.Status || '').trim();
  const adminStatus = String(subscriber.row['Admin Status'] || '').trim();
  if (subscribers.headers.indexOf('Admin Status') < 0 ||
      ['OK','Review','Hold'].indexOf(adminStatus) < 0) {
    throw new Error('DEV subscriber Admin Status is missing or invalid.');
  }
  if (['Active','Paused','Unsubscribed'].indexOf(priorStatus) < 0 ||
      profileStatus !== priorStatus) {
    throw new Error('DEV subscriber/profile delivery status mismatch.');
  }
  if (adbManageNormalizeEmail_(profile.row['Primary Preference Email']) !==
      adbManageNormalizeEmail_(request.Email)) {
    throw new Error('DEV profile email does not match subscriber.');
  }
  const nextStatus = adbManageResolveStatus_(priorStatus, payload.deliveryAction, adminStatus);
  const reset = payload.resetTopics;
  const actionLabel = adbManageActionLabel_(payload.deliveryAction, reset);
  const now = new Date().toISOString();

  // Fail closed on preference ambiguity before any mutation.
  let preferenceUpdates = [];
  if (reset) {
    const interests = adbManageRowsByHeader_(interestSheet);
    const activeIds = interests.rows.filter(function(row) {
      return String(row.Active || '').trim().toUpperCase() === 'TRUE';
    }).map(function(row) {
      return String(row['Interest ID'] || '').trim();
    }).filter(Boolean);
    if (!activeIds.length) throw new Error('No active DEV interests found.');

    const preferences = adbManageRowsByHeader_(preferenceSheet);
    activeIds.forEach(function(interestId) {
      const matches = [];
      preferences.rows.forEach(function(row,index) {
        if (String(row['Profile ID'] || '') === profileId &&
            String(row['Interest ID'] || '') === interestId) {
          matches.push({row:row,sheetRow:index+2});
        }
      });
      if (matches.length !== 1) {
        throw new Error('Preference row is missing or ambiguous for ' + interestId + '.');
      }
      preferenceUpdates.push(matches[0]);
    });
  }

  // Mark Processing before the first subscriber-database mutation.
  adbManageSetByHeader_(requestSheet, requestRow, requestHeaders, 'Status', 'Processing');
  SpreadsheetApp.flush();

  if (nextStatus !== priorStatus) {
    adbManageSetByHeader_(subscriberSheet, subscriber.sheetRow,
      subscribers.headers, 'Status', nextStatus);
    adbManageSetByHeader_(subscriberSheet, subscriber.sheetRow,
      subscribers.headers, 'Updated', now);
    adbManageSetByHeader_(profileSheet, profile.sheetRow,
      profiles.headers, 'Status', nextStatus);
  }

  if (reset) {
    const prefHeaders = adbManageRowsByHeader_(preferenceSheet).headers;
    preferenceUpdates.forEach(function(match) {
      adbManageSetByHeader_(preferenceSheet, match.sheetRow,
        prefHeaders, 'Preference', 'Normal');
      adbManageSetByHeader_(preferenceSheet, match.sheetRow,
        prefHeaders, 'Score', 1);
      if (prefHeaders.indexOf('Updated') >= 0) {
        adbManageSetByHeader_(preferenceSheet, match.sheetRow,
          prefHeaders, 'Updated', now);
      }
      if (prefHeaders.indexOf('Source Submission ID') >= 0) {
        adbManageSetByHeader_(preferenceSheet, match.sheetRow,
          prefHeaders, 'Source Submission ID', submissionId);
      }
    });
    if (profiles.headers.indexOf('Last Preference Update') >= 0) {
      adbManageSetByHeader_(profileSheet, profile.sheetRow,
        profiles.headers, 'Last Preference Update', now);
    }
  }

  if (profiles.headers.indexOf('Latest Submission ID') >= 0) {
    adbManageSetByHeader_(profileSheet, profile.sheetRow,
      profiles.headers, 'Latest Submission ID', submissionId);
  }

  const actionObject = {
    'Submission ID':submissionId,
    'Received At':String(request['Created At'] || ''),
    'Email':adbManageNormalizeEmail_(request.Email),
    'Action':actionLabel,
    'Previous Status':priorStatus,
    'New Status':nextStatus,
    'Result':(nextStatus === priorStatus && !reset) ? 'CONFIRMED — NO CHANGE' : 'CONFIRMED AND APPLIED',
    'Processed At':now,
    'Notes':'FORM-9 native management DEV exactly-once application. Admin Status: ' + adminStatus + ' (preserved).'
  };
  if (actions.headers.indexOf('Profile ID') >= 0) actionObject['Profile ID'] = profileId;
  if (actions.headers.indexOf('Resolved Profile ID') >= 0) actionObject['Resolved Profile ID'] = profileId;
  actionSheet.appendRow(adbManageObjectToRow_(actions.headers, actionObject));

  SpreadsheetApp.flush();

  const noChange = nextStatus === priorStatus && !reset;
  adbManageSetByHeader_(requestSheet, requestRow,
    requestHeaders, 'Status', 'Applied');
  adbManageSetByHeader_(requestSheet, requestRow,
    requestHeaders, 'Applied At', now);
  adbManageSetByHeader_(requestSheet, requestRow,
    requestHeaders, 'Result', noChange ? 'confirmed_no_change' : 'applied');
  adbManageSetByHeader_(verificationSheet, verification.sheetRow,
    verifications.headers, 'Status', 'Applied');
  adbManageSetByHeader_(verificationSheet, verification.sheetRow,
    verifications.headers, 'Applied At', now);
  SpreadsheetApp.flush();

  return noChange ? 'no_change' : 'applied';
}

function adbManageResolveStatus_(currentStatus, deliveryAction, adminStatus) {
  const current = String(currentStatus || '').trim();
  const action = String(deliveryAction || '').trim().toLowerCase();
  const admin = String(adminStatus || '').trim();
  if (['Active','Paused','Unsubscribed'].indexOf(current) < 0) {
    throw new Error('Invalid subscriber delivery status.');
  }
  if (['OK','Review','Hold'].indexOf(admin) < 0) {
    throw new Error('Invalid DEV Admin Status.');
  }

  if (action === 'keep_current') return current;
  // Explicit withdrawal of delivery consent must work even during administrative review/hold.
  if (action === 'unsubscribe') return 'Unsubscribed';
  // Administrative controls are independent of delivery status.
  if (admin !== 'OK' && (action === 'pause' || action === 'resume')) return current;

  if (action === 'pause') {
    if (current === 'Active') return 'Paused';
    return current;
  }

  if (action === 'resume') {
    if (current === 'Paused') return 'Active';
    return current;
  }

  throw new Error('Unsupported native management delivery action.');
}

function adbManageActionLabel_(deliveryAction, resetTopics) {
  const action = String(deliveryAction || '').trim().toLowerCase();
  const parts = [];
  if (action === 'pause') parts.push('Pause subscription');
  if (action === 'resume') parts.push('Resume subscription');
  if (action === 'unsubscribe') parts.push('Unsubscribe');
  if (resetTopics) parts.push('Reset preferences to Normal');
  if (!parts.length) parts.push('Keep delivery status');
  return parts.join(' + ');
}
