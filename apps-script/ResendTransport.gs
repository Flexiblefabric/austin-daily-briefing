/**
 * Austin Daily Briefing — Resend transport
 *
 * Store RESEND_API_KEY in Apps Script Settings > Script properties.
 * Never place the key in Sheets or source code.
 */
const ADB_RESEND = Object.freeze({
  ENDPOINT: 'https://api.resend.com/emails',
  FROM: 'Austin Daily Briefing <briefing@austindailybriefing.com>',
  REPLY_TO: 'briefing@austindailybriefing.com',
  API_KEY_PROPERTY: 'RESEND_API_KEY',
  TEST_RECIPIENT_PROPERTY: 'ADB_RESEND_TEST_RECIPIENT',
  WELCOME_MODE_PROPERTY: 'ADB_RESEND_WELCOME_MODE',
  WELCOME_ALLOWLIST_PROPERTY: 'ADB_RESEND_WELCOME_ALLOWLIST',
  DAILY_MODE_PROPERTY: 'ADB_RESEND_DAILY_MODE',
  DAILY_ALLOWLIST_PROPERTY: 'ADB_RESEND_DAILY_ALLOWLIST',
  DAILY_TEMPLATE_ID: 'DAILY_BRIEFING_V1',
  DAILY_MAX_BODY_CHARS: 45000,
  PRODUCTION_DATABASE_ID: '1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0',
  PRODUCTION_INTAKE_ID: '1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho',
  CUSTOMIZE_URL: 'https://docs.google.com/forms/d/e/1FAIpQLScwQiC37TuOgRqXpCsfcC9jTOL4Gg7d9KOUrYhRkwdfNGhhuQ/viewform',
  MANAGE_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSeR4whAT-kkkdx81VMGdHtVJMSVAe5CdZx-PvFhwhrwMSEFxg/viewform',
  SITE_URL: 'https://austindailybriefing.com/',
  SENDER_CHANGE_APPROVAL_PROPERTY: 'ADB_SENDER_CHANGE_APPROVAL'
});

/**
 * Sends one message through Resend and returns its provider message ID.
 *
 * @param {{to: string|string[], subject: string, text: string, html?: string,
 *   idempotencyKey?: string, tags?: Object<string,string>}} message
 * @return {{id: string, statusCode: number}}
 */
function adbSendEmailViaResend_(message) {
  const apiKey = PropertiesService.getScriptProperties()
    .getProperty(ADB_RESEND.API_KEY_PROPERTY);
  if (!apiKey) throw new Error('Missing Apps Script property RESEND_API_KEY.');

  const recipients = Array.isArray(message.to) ? message.to : [message.to];
  if (!recipients.length || recipients.some(function(value) { return !String(value).trim(); })) {
    throw new Error('At least one valid recipient is required.');
  }
  if (!String(message.subject || '').trim()) throw new Error('A subject is required.');
  if (!String(message.text || '').trim()) throw new Error('A plain-text body is required.');

  const payload = {
    from: ADB_RESEND.FROM,
    to: recipients.map(function(value) { return String(value).trim(); }),
    reply_to: ADB_RESEND.REPLY_TO,
    subject: String(message.subject),
    text: String(message.text)
  };
  if (message.html) payload.html = String(message.html);
  if (message.tags) {
    payload.tags = Object.keys(message.tags).map(function(name) {
      return {name: String(name), value: String(message.tags[name])};
    });
  }

  const headers = {
    Authorization: 'Bearer ' + apiKey,
    'Content-Type': 'application/json'
  };
  if (message.idempotencyKey) {
    headers['Idempotency-Key'] = String(message.idempotencyKey).slice(0, 256);
  }

  const response = UrlFetchApp.fetch(ADB_RESEND.ENDPOINT, {
    method: 'post',
    contentType: 'application/json',
    headers: headers,
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  const statusCode = response.getResponseCode();
  const body = response.getContentText();
  let parsed = {};
  try { parsed = JSON.parse(body); } catch (ignored) {}

  if (statusCode < 200 || statusCode >= 300 || !parsed.id) {
    const detail = parsed.message || parsed.name || body || 'Unknown Resend error';
    throw new Error('Resend rejected the message (' + statusCode + '): ' + detail);
  }
  return {id: String(parsed.id), statusCode: statusCode};
}

/**
 * Controlled manual test. Set ADB_RESEND_TEST_RECIPIENT in Script properties first.
 */
function testAdbResendTransportV1() {
  const recipient = PropertiesService.getScriptProperties()
    .getProperty(ADB_RESEND.TEST_RECIPIENT_PROPERTY);
  if (!recipient) {
    throw new Error('Missing Apps Script property ADB_RESEND_TEST_RECIPIENT.');
  }
  const testId = Utilities.getUuid();
  const result = adbSendEmailViaResend_({
    to: recipient,
    subject: 'Austin Daily Briefing — Apps Script delivery test',
    text: 'This controlled message confirms that the production Google Apps Script can deliver through Resend. Test ID: ' + testId,
    html: '<div style="font-family:Arial,sans-serif;max-width:600px;line-height:1.5"><h1 style="font-size:24px">Austin Daily Briefing</h1><p>This controlled message confirms that the production Google Apps Script can deliver through Resend.</p><p><strong>Test ID:</strong> ' + testId + '</p></div>',
    idempotencyKey: 'adb-apps-script-test-' + testId,
    tags: {message_type: 'transport_test', environment: 'production'}
  });
  Logger.log('Resend accepted Apps Script test. Provider ID: ' + result.id);
  return result;
}

/**
 * Dispatches eligible WELCOME_V1 queue rows through Resend.
 *
 * Staging defaults to CONTROLLED. LIVE must be deliberately set in Script
 * properties after controlled queue-path QA. No time trigger is created here.
 */
function dispatchQueuedWelcomeMessagesViaResendV1() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const props = PropertiesService.getScriptProperties();
    const mode = String(props.getProperty(ADB_RESEND.WELCOME_MODE_PROPERTY) || 'CONTROLLED').toUpperCase();
    if (['CONTROLLED', 'LIVE'].indexOf(mode) < 0) throw new Error('Unsupported ADB_RESEND_WELCOME_MODE: ' + mode);
    const allowlist = new Set(String(props.getProperty(ADB_RESEND.WELCOME_ALLOWLIST_PROPERTY) || '')
      .split(',').map(function(value) { return value.trim().toLowerCase(); }).filter(Boolean));
    if (mode === 'CONTROLLED' && !allowlist.size) {
      throw new Error('CONTROLLED mode requires ADB_RESEND_WELCOME_ALLOWLIST.');
    }

    const database = SpreadsheetApp.openById(ADB_RESEND.PRODUCTION_DATABASE_ID);
    const intake = SpreadsheetApp.openById(ADB_RESEND.PRODUCTION_INTAKE_ID);
    adbValidateWelcomeDeliveryGates_(database, intake);

    const subscribers = adbRowsByHeader_(database.getSheetByName('Subscribers'));
    const subscriberIndex = {};
    subscribers.rows.forEach(function(row) {
      const email = String(row.Email || '').trim().toLowerCase();
      if (!email) return;
      if (subscriberIndex[email]) subscriberIndex[email].ambiguous = true;
      else subscriberIndex[email] = {row: row, ambiguous: false};
    });

    const templates = adbRowsByHeader_(database.getSheetByName('Message Templates'));
    const welcomeTemplates = templates.rows.filter(function(row) {
      return row['Template ID'] === 'WELCOME_V1' && String(row.Active).toUpperCase() === 'TRUE' && row.Environment === 'PRODUCTION';
    });
    if (welcomeTemplates.length !== 1) throw new Error('Expected exactly one active production WELCOME_V1 template.');

    const queueSheet = database.getSheetByName('Outbound Messages');
    const queue = adbRowsByHeader_(queueSheet);
    const required = ['Message ID','Profile ID','Email','Template ID','Status','Subject','Customize URL','Sent At / Gmail ID','Notes'];
    required.forEach(function(header) {
      if (queue.headers.indexOf(header) < 0) throw new Error('Outbound Messages is missing header: ' + header);
    });
    const sentColumn = queue.headers.indexOf('Sent At / Gmail ID') + 1;
    const statusColumn = queue.headers.indexOf('Status') + 1;
    const notesColumn = queue.headers.indexOf('Notes') + 1;
    let sent = 0;
    let skipped = 0;

    queue.rows.forEach(function(row, index) {
      if (row.Status !== 'Queued' || row['Template ID'] !== 'WELCOME_V1') return;
      const sheetRow = index + 2;
      const messageId = String(row['Message ID'] || '').trim();
      const email = String(row.Email || '').trim().toLowerCase();
      if (!messageId || !email) throw new Error('Invalid queued welcome at row ' + sheetRow + '.');
      if (String(row['Sent At / Gmail ID'] || '').trim()) {
        throw new Error('Queued row already has a provider ID at row ' + sheetRow + '.');
      }
      if (mode === 'CONTROLLED' && !allowlist.has(email)) { skipped++; return; }
      const match = subscriberIndex[email];
      if (!match || match.ambiguous || match.row.Status !== 'Active' || match.row['Profile ID'] !== row['Profile ID']) {
        skipped++;
        return;
      }

      const subject = String(row.Subject || welcomeTemplates[0].Subject || 'Welcome to the Austin Daily Briefing');
      const text = adbWelcomePlainText_();
      const html = adbWelcomeHtml_();
      try {
        const result = adbSendEmailViaResend_({
          to: email,
          subject: subject,
          text: text,
          html: html,
          idempotencyKey: messageId,
          tags: {message_type: 'welcome', environment: 'production'}
        });
        const now = new Date();
        queueSheet.getRange(sheetRow, statusColumn).setValue('Sent');
        queueSheet.getRange(sheetRow, sentColumn).setValue(now.toISOString() + ' | Resend ID ' + result.id);
        queueSheet.getRange(sheetRow, notesColumn).setValue('Resend accepted; eligibility rechecked immediately before delivery.');
        sent++;
      } catch (error) {
        queueSheet.getRange(sheetRow, statusColumn).setValue('Failed');
        queueSheet.getRange(sheetRow, notesColumn).setValue('Resend failure: ' + String(error.message || error).slice(0, 500));
        throw error;
      }
    });
    const report = {mode: mode, sent: sent, skipped: skipped, transport: 'Resend'};
    Logger.log(JSON.stringify(report));
    return report;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Promotes only the welcome-message transport after controlled queue QA.
 * Creates one hourly Apps Script trigger; it does not alter subscriber intake.
 */
function promoteAdbResendWelcomeV1() {
  const props = PropertiesService.getScriptProperties();
  const currentMode = String(props.getProperty(ADB_RESEND.WELCOME_MODE_PROPERTY) || 'CONTROLLED').toUpperCase();
  if (currentMode !== 'CONTROLLED') throw new Error('Promotion requires CONTROLLED mode. Current mode: ' + currentMode);

  const database = SpreadsheetApp.openById(ADB_RESEND.PRODUCTION_DATABASE_ID);
  const queue = adbRowsByHeader_(database.getSheetByName('Outbound Messages'));
  const qa = queue.rows.filter(function(row) {
    return row['Message ID'] === 'WELCOME-RESEND-QA:P001:20260913T1001CT';
  });
  if (qa.length !== 1 || qa[0].Status !== 'Sent' || !/Resend ID [0-9a-f-]{36}/i.test(String(qa[0]['Sent At / Gmail ID'] || ''))) {
    throw new Error('Controlled Resend welcome QA evidence is missing or invalid.');
  }

  adbRemoveWelcomeTriggers_();
  props.setProperty(ADB_RESEND.WELCOME_MODE_PROPERTY, 'LIVE');
  ScriptApp.newTrigger('dispatchQueuedWelcomeMessagesViaResendV1')
    .timeBased()
    .everyHours(1)
    .create();

  const report = {mode: 'LIVE', trigger: 'HOURLY', transport: 'Resend', rollback: 'pauseAdbResendWelcomeV1'};
  Logger.log(JSON.stringify(report));
  return report;
}

/** Stops scheduled welcome delivery and returns the dispatcher to CONTROLLED. */
function pauseAdbResendWelcomeV1() {
  adbRemoveWelcomeTriggers_();
  PropertiesService.getScriptProperties().setProperty(ADB_RESEND.WELCOME_MODE_PROPERTY, 'CONTROLLED');
  const report = {mode: 'CONTROLLED', trigger: 'NONE', transport: 'Resend'};
  Logger.log(JSON.stringify(report));
  return report;
}

/**
 * Sends the one-time sender/domain announcement after the website cutover.
 *
 * Manual only: no trigger is created. Before running, activate the single
 * production SENDER_CHANGE_V1 template and set ADB_SENDER_CHANGE_APPROVAL to
 * APPROVED. The function resolves Active subscribers at run time, creates one
 * deterministic queue row per profile, and changes approval to COMPLETE only
 * when no announcement row remains Queued or Failed.
 */
function sendAdbSenderChangeAnnouncementV1() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const props = PropertiesService.getScriptProperties();
    const approval = props.getProperty(ADB_RESEND.SENDER_CHANGE_APPROVAL_PROPERTY);
    if (approval !== 'APPROVED' && approval !== 'COMPLETE') {
      throw new Error('Sender-change announcement requires ADB_SENDER_CHANGE_APPROVAL=APPROVED.');
    }

    const database = SpreadsheetApp.openById(ADB_RESEND.PRODUCTION_DATABASE_ID);
    const intake = SpreadsheetApp.openById(ADB_RESEND.PRODUCTION_INTAKE_ID);
    adbValidateWelcomeDeliveryGates_(database, intake);

    const siteResponse = UrlFetchApp.fetch(ADB_RESEND.SITE_URL, {
      followRedirects: true,
      muteHttpExceptions: true
    });
    if (siteResponse.getResponseCode() < 200 || siteResponse.getResponseCode() >= 300 ||
        siteResponse.getContentText().indexOf('briefing@austindailybriefing.com') < 0) {
      throw new Error('Custom-domain website is not ready for the announcement.');
    }

    const templates = adbRowsByHeader_(database.getSheetByName('Message Templates'));
    const matches = templates.rows.filter(function(row) {
      return row['Template ID'] === 'SENDER_CHANGE_V1' &&
        String(row.Active).toUpperCase() === 'TRUE' &&
        row.Environment === 'PRODUCTION';
    });
    if (matches.length !== 1) {
      throw new Error('Expected exactly one active production SENDER_CHANGE_V1 template.');
    }

    const subscribers = adbRowsByHeader_(database.getSheetByName('Subscribers'));
    const active = subscribers.rows.filter(function(row) { return row.Status === 'Active'; });
    if (!active.length) throw new Error('No Active subscribers found.');

    const seenEmails = {};
    active.forEach(function(row) {
      const email = String(row.Email || '').trim().toLowerCase();
      const profileId = String(row['Profile ID'] || '').trim();
      if (!email || !profileId) throw new Error('Active subscriber is missing email or Profile ID.');
      if (seenEmails[email]) throw new Error('Duplicate Active subscriber email: ' + email);
      seenEmails[email] = true;
    });

    const queueSheet = database.getSheetByName('Outbound Messages');
    let queue = adbRowsByHeader_(queueSheet);
    const required = ['Message ID','Created At','Profile ID','Email','Template ID','Status','Subject','Customize URL','Sent At / Gmail ID','Notes'];
    required.forEach(function(header) {
      if (queue.headers.indexOf(header) < 0) throw new Error('Outbound Messages is missing header: ' + header);
    });
    const existingIds = new Set(queue.rows.map(function(row) { return String(row['Message ID'] || ''); }));
    const queuedAt = Utilities.formatDate(new Date(), 'America/Chicago', 'yyyy-MM-dd HH:mm:ss z');
    let created = 0;

    if (approval === 'APPROVED') active.forEach(function(row) {
      const profileId = String(row['Profile ID']).trim();
      const messageId = 'SENDER-CHANGE-V1:' + profileId;
      if (existingIds.has(messageId)) return;
      const output = queue.headers.map(function() { return ''; });
      output[queue.headers.indexOf('Message ID')] = messageId;
      output[queue.headers.indexOf('Created At')] = queuedAt;
      output[queue.headers.indexOf('Profile ID')] = profileId;
      output[queue.headers.indexOf('Email')] = String(row.Email).trim();
      output[queue.headers.indexOf('Template ID')] = 'SENDER_CHANGE_V1';
      output[queue.headers.indexOf('Status')] = 'Queued';
      output[queue.headers.indexOf('Subject')] = String(matches[0].Subject);
      output[queue.headers.indexOf('Customize URL')] = ADB_RESEND.CUSTOMIZE_URL;
      output[queue.headers.indexOf('Notes')] = 'Approval-gated custom-domain launch announcement.';
      queueSheet.appendRow(output);
      existingIds.add(messageId);
      created++;
    });

    queue = adbRowsByHeader_(queueSheet);
    const sentColumn = queue.headers.indexOf('Sent At / Gmail ID') + 1;
    const statusColumn = queue.headers.indexOf('Status') + 1;
    const notesColumn = queue.headers.indexOf('Notes') + 1;
    const activeByEmail = {};
    active.forEach(function(row) { activeByEmail[String(row.Email).trim().toLowerCase()] = row; });
    let sent = 0;
    let skipped = 0;

    queue.rows.forEach(function(row, index) {
      if (row.Status !== 'Queued' || row['Template ID'] !== 'SENDER_CHANGE_V1') return;
      const sheetRow = index + 2;
      const email = String(row.Email || '').trim().toLowerCase();
      const match = activeByEmail[email];
      if (!match || String(match['Profile ID']) !== String(row['Profile ID'])) {
        skipped++;
        return;
      }
      const result = adbSendEmailViaResend_({
        to: email,
        subject: String(row.Subject || matches[0].Subject),
        text: adbSenderChangePlainText_(),
        html: adbSenderChangeHtml_(),
        idempotencyKey: String(row['Message ID']),
        tags: {message_type: 'sender_change', environment: 'production'}
      });
      queueSheet.getRange(sheetRow, statusColumn).setValue('Sent');
      queueSheet.getRange(sheetRow, sentColumn).setValue(new Date().toISOString() + ' | Resend ID ' + result.id);
      queueSheet.getRange(sheetRow, notesColumn).setValue('Resend accepted; Active eligibility rechecked immediately before delivery.');
      sent++;
    });

    const finalQueue = adbRowsByHeader_(queueSheet).rows.filter(function(row) {
      return row['Template ID'] === 'SENDER_CHANGE_V1' &&
        (row.Status === 'Queued' || row.Status === 'Failed');
    });
    if (!finalQueue.length) props.setProperty(ADB_RESEND.SENDER_CHANGE_APPROVAL_PROPERTY, 'COMPLETE');

    const report = {created: created, sent: sent, skipped: skipped, remaining: finalQueue.length, transport: 'Resend'};
    Logger.log(JSON.stringify(report));
    return report;
  } finally {
    lock.releaseLock();
  }
}

function adbSenderChangePlainText_() {
  return 'Austin Daily Briefing has a new home.\n\n' +
    'Our official website is now ' + ADB_RESEND.SITE_URL + '\n\n' +
    'Future Austin Daily Briefing messages will come from briefing@austindailybriefing.com, and you can reply directly to that address. No action is required; your subscription and preferences are unchanged.\n\n' +
    'Customize my briefing: ' + ADB_RESEND.CUSTOMIZE_URL + '\n\n' +
    'Manage subscription: ' + ADB_RESEND.MANAGE_URL;
}

function adbSenderChangeHtml_() {
  return '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;line-height:1.55;color:#202124">' +
    '<p style="font-size:12px;font-weight:700;letter-spacing:.08em;color:#ce1829">AUSTIN DAILY BRIEFING</p>' +
    '<h1 style="font-size:28px;margin:0 0 16px">We have a new home.</h1>' +
    '<p>Our official website is now <a href="' + ADB_RESEND.SITE_URL + '">austindailybriefing.com</a>.</p>' +
    '<p>Future Austin Daily Briefing messages will come from <strong>briefing@austindailybriefing.com</strong>, and you can reply directly to that address.</p>' +
    '<p><strong>No action is required.</strong> Your subscription and preferences are unchanged.</p>' +
    '<p><a href="' + ADB_RESEND.SITE_URL + '" style="display:inline-block;padding:12px 16px;background:#ce1829;color:#fff;text-decoration:none">Visit Austin Daily Briefing</a></p>' +
    '<p style="font-size:14px"><a href="' + ADB_RESEND.CUSTOMIZE_URL + '">Customize my briefing</a> · <a href="' + ADB_RESEND.MANAGE_URL + '">Manage subscription</a></p>' +
    '<p style="font-size:13px;color:#5f6368">You can reply directly to this email.</p></div>';
}

function adbRemoveWelcomeTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'dispatchQueuedWelcomeMessagesViaResendV1') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

/**
 * Dispatches complete, validated DAILY_BRIEFING_V1 queue rows through Resend.
 *
 * The morning editorial automation owns content generation. This function owns
 * the final eligibility check, provider handoff, queue status, and matching
 * Briefing History delivery status. It defaults to CONTROLLED and creates no
 * trigger until promoteAdbResendDailyV1 is run after controlled QA.
 */
function dispatchQueuedDailyBriefingsViaResendV1() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const props = PropertiesService.getScriptProperties();
    const mode = String(props.getProperty(ADB_RESEND.DAILY_MODE_PROPERTY) || 'CONTROLLED').toUpperCase();
    if (['CONTROLLED', 'LIVE'].indexOf(mode) < 0) throw new Error('Unsupported ADB_RESEND_DAILY_MODE: ' + mode);
    const allowlist = new Set(String(props.getProperty(ADB_RESEND.DAILY_ALLOWLIST_PROPERTY) || '')
      .split(',').map(function(value) { return value.trim().toLowerCase(); }).filter(Boolean));
    if (mode === 'CONTROLLED' && !allowlist.size) {
      throw new Error('CONTROLLED mode requires ADB_RESEND_DAILY_ALLOWLIST.');
    }

    const database = SpreadsheetApp.openById(ADB_RESEND.PRODUCTION_DATABASE_ID);
    const intake = SpreadsheetApp.openById(ADB_RESEND.PRODUCTION_INTAKE_ID);
    adbValidateDailyDeliveryGates_(database, intake);

    const templates = adbRowsByHeader_(database.getSheetByName('Message Templates'));
    const dailyTemplates = templates.rows.filter(function(row) {
      return row['Template ID'] === ADB_RESEND.DAILY_TEMPLATE_ID &&
        String(row.Active).toUpperCase() === 'TRUE' && row.Environment === 'PRODUCTION';
    });
    if (dailyTemplates.length !== 1) {
      throw new Error('Expected exactly one active production ' + ADB_RESEND.DAILY_TEMPLATE_ID + ' template.');
    }

    const subscribers = adbRowsWithSheetRows_(database.getSheetByName('Subscribers'));
    const activeByEmail = {};
    const activeByProfile = {};
    subscribers.rows.forEach(function(entry) {
      const row = entry.values;
      if (String(row.Status || '').trim().toUpperCase() !== 'ACTIVE') return;
      const email = String(row.Email || '').trim().toLowerCase();
      const profileId = String(row['Profile ID'] || '').trim();
      if (!email || !profileId) return;
      (activeByEmail[email] = activeByEmail[email] || []).push(row);
      (activeByProfile[profileId] = activeByProfile[profileId] || []).push(row);
    });

    const queueSheet = database.getSheetByName('Outbound Messages');
    const queue = adbRowsWithSheetRows_(queueSheet);
    const requiredQueue = ['Message ID','Profile ID','Email','Template ID','Status','Subject',
      'Sent At / Gmail ID','Notes','Plain Text','HTML','Run ID'];
    requiredQueue.forEach(function(header) {
      if (queue.headers.indexOf(header) < 0) throw new Error('Outbound Messages is missing header: ' + header);
    });

    const historySheet = database.getSheetByName('Briefing History');
    const history = adbRowsWithSheetRows_(historySheet);
    const requiredHistory = ['Run ID','Profile ID','Notes','Delivery Status','Provider Message ID'];
    requiredHistory.forEach(function(header) {
      if (history.headers.indexOf(header) < 0) throw new Error('Briefing History is missing header: ' + header);
    });

    const queueColumns = adbHeaderColumns_(queue.headers);
    const historyColumns = adbHeaderColumns_(history.headers);
    let sent = 0;
    let skipped = 0;

    queue.rows.forEach(function(entry) {
      const row = entry.values;
      if (String(row.Status || '').trim() !== 'Queued' || row['Template ID'] !== ADB_RESEND.DAILY_TEMPLATE_ID) return;

      const messageId = String(row['Message ID'] || '').trim();
      const profileId = String(row['Profile ID'] || '').trim();
      const email = String(row.Email || '').trim().toLowerCase();
      const subject = String(row.Subject || '').trim();
      const textBody = String(row['Plain Text'] || '');
      const htmlBody = String(row.HTML || '');
      const runId = String(row['Run ID'] || '').trim();

      if (!messageId || !/^DAILY-(?:RESEND-QA|LIVE):/.test(messageId)) {
        throw new Error('Invalid daily Message ID at row ' + entry.sheetRow + '.');
      }
      if (!profileId || !email || !subject || !textBody.trim() || !htmlBody.trim() || !runId) {
        throw new Error('Incomplete daily payload at row ' + entry.sheetRow + '.');
      }
      if (textBody.length > ADB_RESEND.DAILY_MAX_BODY_CHARS || htmlBody.length > ADB_RESEND.DAILY_MAX_BODY_CHARS) {
        throw new Error('Daily payload exceeds the safe Sheets cell limit at row ' + entry.sheetRow + '.');
      }
      if (String(row['Sent At / Gmail ID'] || '').trim()) {
        throw new Error('Queued daily row already has a provider ID at row ' + entry.sheetRow + '.');
      }
      if (mode === 'CONTROLLED' && !allowlist.has(email)) { skipped++; return; }

      const emailMatches = activeByEmail[email] || [];
      const profileMatches = activeByProfile[profileId] || [];
      if (emailMatches.length !== 1 || profileMatches.length !== 1 ||
          String(emailMatches[0]['Profile ID'] || '').trim() !== profileId ||
          String(profileMatches[0].Email || '').trim().toLowerCase() !== email) {
        skipped++;
        return;
      }

      const historyMatches = history.rows.filter(function(historyEntry) {
        return String(historyEntry.values['Run ID'] || '').trim() === runId &&
          String(historyEntry.values['Profile ID'] || '').trim() === profileId;
      });
      if (!historyMatches.length) {
        throw new Error('No Briefing History rows match Run ID ' + runId + ' and Profile ID ' + profileId + '.');
      }
      if (historyMatches.some(function(historyEntry) {
        return String(historyEntry.values['Delivery Status'] || '').trim().toUpperCase() !== 'PENDING' ||
          String(historyEntry.values['Provider Message ID'] || '').trim();
      })) {
        throw new Error('Briefing History is not in a clean Pending state for Run ID ' + runId + '.');
      }

      let result;
      try {
        result = adbSendEmailViaResend_({
          to: email,
          subject: subject,
          text: textBody,
          html: htmlBody,
          idempotencyKey: messageId,
          tags: {message_type: 'daily_briefing', environment: 'production', profile_id: profileId}
        });
      } catch (error) {
        queueSheet.getRange(entry.sheetRow, queueColumns.Status).setValue('Failed');
        queueSheet.getRange(entry.sheetRow, queueColumns.Notes)
          .setValue('Resend failure: ' + String(error.message || error).slice(0, 500));
        historyMatches.forEach(function(historyEntry) {
          historySheet.getRange(historyEntry.sheetRow, historyColumns['Delivery Status']).setValue('Failed');
        });
        throw error;
      }

      // Record Sent before enriching history. If a later history write fails,
      // the queue remains Sent and the provider handoff cannot be retried.
      const acceptedAt = new Date().toISOString();
      queueSheet.getRange(entry.sheetRow, queueColumns.Status).setValue('Sent');
      queueSheet.getRange(entry.sheetRow, queueColumns['Sent At / Gmail ID'])
        .setValue(acceptedAt + ' | Resend ID ' + result.id);
      queueSheet.getRange(entry.sheetRow, queueColumns.Notes)
        .setValue('Resend accepted; subscriber eligibility rechecked immediately before delivery.');

      historyMatches.forEach(function(historyEntry) {
        historySheet.getRange(historyEntry.sheetRow, historyColumns['Delivery Status']).setValue('Sent');
        historySheet.getRange(historyEntry.sheetRow, historyColumns['Provider Message ID']).setValue(result.id);
        const priorNotes = String(historyEntry.values.Notes || '').trim();
        historySheet.getRange(historyEntry.sheetRow, historyColumns.Notes)
          .setValue((priorNotes ? priorNotes + ' | ' : '') + 'Resend accepted ' + acceptedAt + '.');
      });
      sent++;
    });

    const report = {mode: mode, sent: sent, skipped: skipped, transport: 'Resend'};
    Logger.log(JSON.stringify(report));
    return report;
  } finally {
    lock.releaseLock();
  }
}

/** Promotes daily delivery only after an exact controlled P001 QA send. */
function promoteAdbResendDailyV1() {
  const props = PropertiesService.getScriptProperties();
  const currentMode = String(props.getProperty(ADB_RESEND.DAILY_MODE_PROPERTY) || 'CONTROLLED').toUpperCase();
  if (currentMode !== 'CONTROLLED') throw new Error('Promotion requires CONTROLLED mode. Current mode: ' + currentMode);

  const database = SpreadsheetApp.openById(ADB_RESEND.PRODUCTION_DATABASE_ID);
  const queue = adbRowsWithSheetRows_(database.getSheetByName('Outbound Messages'));
  const candidates = queue.rows.filter(function(entry) {
    const row = entry.values;
    return String(row['Message ID'] || '').indexOf('DAILY-RESEND-QA:P001:') === 0 && row.Status === 'Sent';
  });
  if (candidates.length !== 1) throw new Error('Expected exactly one Sent controlled P001 daily QA row.');
  const qa = candidates[0].values;
  const providerMatch = String(qa['Sent At / Gmail ID'] || '').match(/Resend ID ([0-9a-f-]{36})/i);
  if (!providerMatch) throw new Error('Controlled daily QA provider evidence is missing.');

  const history = adbRowsWithSheetRows_(database.getSheetByName('Briefing History'));
  const matchingHistory = history.rows.filter(function(entry) {
    return String(entry.values['Run ID'] || '').trim() === String(qa['Run ID'] || '').trim() &&
      String(entry.values['Profile ID'] || '').trim() === 'P001';
  });
  if (!matchingHistory.length || matchingHistory.some(function(entry) {
    return entry.values['Delivery Status'] !== 'Sent' || entry.values['Provider Message ID'] !== providerMatch[1];
  })) {
    throw new Error('Controlled daily QA history evidence is missing or inconsistent.');
  }

  adbRemoveDailyTriggers_();
  props.setProperty(ADB_RESEND.DAILY_MODE_PROPERTY, 'LIVE');
  ScriptApp.newTrigger('dispatchQueuedDailyBriefingsViaResendV1')
    .timeBased()
    .everyHours(1)
    .create();

  const report = {mode: 'LIVE', trigger: 'HOURLY', transport: 'Resend', rollback: 'pauseAdbResendDailyV1'};
  Logger.log(JSON.stringify(report));
  return report;
}

/** Stops scheduled daily delivery and returns the dispatcher to CONTROLLED. */
function pauseAdbResendDailyV1() {
  adbRemoveDailyTriggers_();
  PropertiesService.getScriptProperties().setProperty(ADB_RESEND.DAILY_MODE_PROPERTY, 'CONTROLLED');
  const report = {mode: 'CONTROLLED', trigger: 'NONE', transport: 'Resend'};
  Logger.log(JSON.stringify(report));
  return report;
}

function adbRemoveDailyTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'dispatchQueuedDailyBriefingsViaResendV1') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

function adbValidateDailyDeliveryGates_(database, intake) {
  const env = adbKeyValueSheet_(database.getSheetByName('Environment'));
  const cfg = adbKeyValueSheet_(intake.getSheetByName('Integration Config'));
  if (env.Environment !== 'PRODUCTION') throw new Error('Production environment mismatch.');
  if (env['Database ID'] !== ADB_RESEND.PRODUCTION_DATABASE_ID) throw new Error('Production database identity mismatch.');
  if (env['Schema Baseline'] !== 'GOOGLE-23-1') throw new Error('Production schema mismatch.');
  if (env['Intake Mode'] !== 'GOOGLE ONLY') throw new Error('Production intake mode mismatch.');
  if (env['Allow External Delivery'] !== 'TRUE') throw new Error('Production external delivery is not enabled.');
  if (cfg.Environment !== 'PRODUCTION') throw new Error('Production intake identity mismatch.');
  if (cfg['Operational Production Database ID'] !== ADB_RESEND.PRODUCTION_DATABASE_ID) throw new Error('Configured database identity mismatch.');
  if (cfg['Processor Mode'] !== 'GOOGLE ONLY') throw new Error('Processor mode mismatch.');
  if (cfg['Delivery Mode'] !== 'ENABLED') throw new Error('Production delivery gate is not enabled.');
}

function adbRowsWithSheetRows_(sheet) {
  if (!sheet) throw new Error('Required sheet is missing.');
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values[0].map(String);
  return {
    headers: headers,
    rows: values.slice(1).map(function(row, index) {
      return {
        sheetRow: index + 2,
        raw: row,
        values: headers.reduce(function(output, header, columnIndex) {
          output[header] = row[columnIndex];
          return output;
        }, {})
      };
    }).filter(function(entry) { return entry.raw.some(Boolean); })
  };
}

function adbHeaderColumns_(headers) {
  return headers.reduce(function(output, header, index) {
    output[header] = index + 1;
    return output;
  }, {});
}

function adbValidateWelcomeDeliveryGates_(database, intake) {
  const env = adbKeyValueSheet_(database.getSheetByName('Environment'));
  const cfg = adbKeyValueSheet_(intake.getSheetByName('Integration Config'));
  if (env.Environment !== 'PRODUCTION') throw new Error('Production environment mismatch.');
  if (env['Database ID'] !== ADB_RESEND.PRODUCTION_DATABASE_ID) throw new Error('Production database identity mismatch.');
  if (env['Schema Baseline'] !== 'GOOGLE-23-1') throw new Error('Production schema mismatch.');
  if (env['Intake Mode'] !== 'GOOGLE ONLY') throw new Error('Production intake mode mismatch.');
  if (env['Allow External Delivery'] !== 'TRUE') throw new Error('Production external delivery is not enabled.');
  if (cfg.Environment !== 'PRODUCTION') throw new Error('Production intake identity mismatch.');
  if (cfg['Operational Production Database ID'] !== ADB_RESEND.PRODUCTION_DATABASE_ID) throw new Error('Configured database identity mismatch.');
  if (cfg['Processor Mode'] !== 'GOOGLE ONLY') throw new Error('Processor mode mismatch.');
  if (cfg['Delivery Mode'] !== 'ENABLED' || cfg['Welcome Delivery Mode'] !== 'ENABLED') {
    throw new Error('Production welcome delivery gates are not enabled.');
  }
}

function adbRowsByHeader_(sheet) {
  if (!sheet) throw new Error('Required sheet is missing.');
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values[0].map(String);
  return {
    headers: headers,
    rows: values.slice(1).filter(function(row) { return row.some(Boolean); }).map(function(row) {
      return headers.reduce(function(output, header, index) { output[header] = row[index]; return output; }, {});
    })
  };
}

function adbKeyValueSheet_(sheet) {
  const table = adbRowsByHeader_(sheet);
  return table.rows.reduce(function(output, row) {
    const key = String(row[table.headers[0]] || '').trim();
    if (key) output[key] = String(row[table.headers[1]] || '').trim();
    return output;
  }, {});
}

function adbWelcomePlainText_() {
  return 'Welcome to the Austin Daily Briefing.\n\nYour concise, personalized Austin news briefing is built around the topics and reading style you choose. New subscriptions begin with balanced default preferences.\n\nCustomize my briefing: ' + ADB_RESEND.CUSTOMIZE_URL + '\n\nManage subscription: ' + ADB_RESEND.MANAGE_URL + '\n\nYou can reply directly to this email.';
}

function adbWelcomeHtml_() {
  return '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;line-height:1.55;color:#202124">' +
    '<h1 style="font-size:26px;margin:0 0 16px">Welcome to the Austin Daily Briefing</h1>' +
    '<p>Your concise, personalized Austin news briefing is built around the topics and reading style you choose. New subscriptions begin with balanced default preferences.</p>' +
    '<p><a href="' + ADB_RESEND.CUSTOMIZE_URL + '" style="display:inline-block;padding:12px 16px;background:#171717;color:#fff;text-decoration:none">Customize my briefing</a></p>' +
    '<p><a href="' + ADB_RESEND.MANAGE_URL + '">Manage subscription</a></p>' +
    '<p style="font-size:13px;color:#5f6368">You can reply directly to this email.</p></div>';
}
