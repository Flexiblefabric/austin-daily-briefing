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
  PRODUCTION_DATABASE_ID: '1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0',
  PRODUCTION_INTAKE_ID: '1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho',
  CUSTOMIZE_URL: 'https://docs.google.com/forms/d/e/1FAIpQLScwQiC37TuOgRqXpCsfcC9jTOL4Gg7d9KOUrYhRkwdfNGhhuQ/viewform',
  MANAGE_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSeR4whAT-kkkdx81VMGdHtVJMSVAe5CdZx-PvFhwhrwMSEFxg/viewform'
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

function adbValidateWelcomeDeliveryGates_(database, intake) {
  const env = adbKeyValueSheet_(database.getSheetByName('Environment'));
  const cfg = adbKeyValueSheet_(intake.getSheetByName('Integration Config'));
  if (env.Environment !== 'PRODUCTION') throw new Error('Production environment mismatch.');
  if (env['Database ID'] !== ADB_RESEND.PRODUCTION_DATABASE_ID) throw new Error('Production database identity mismatch.');
  if (env['Schema Baseline'] !== 'GOOGLE-23-1') throw new Error('Production schema mismatch.');
  if (env['Intake Mode'] !== 'GOOGLE ONLY') throw new Error('Production intake mode mismatch.');
  if (env['Allow External Delivery'] !== 'TRUE') throw new Error('Production external delivery is not enabled.');
  if (cfg.Environment !== 'PRODUCTION-STAGING') throw new Error('Production intake identity mismatch.');
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
