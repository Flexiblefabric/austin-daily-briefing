/**
 * Austin Daily Briefing — welcome email controlled QA
 *
 * Manual-only. This file sends the CURRENT production welcome template for
 * visual/client review without touching Outbound Messages, Briefing History,
 * subscriber state, delivery mode, or triggers.
 *
 * Requires ResendTransport.gs in the same Apps Script project.
 *
 * Script property required before sending:
 *   ADB_WELCOME_QA_ALLOWLIST=email1@example.com,email2@example.com
 */
const ADB_WELCOME_QA = Object.freeze({
  ALLOWLIST_PROPERTY: 'ADB_WELCOME_QA_ALLOWLIST',
  SUBJECT: '[CONTROLLED TEST] Welcome to the Austin Daily Briefing',
  RUN_ID: 'welcome-email-v1-qa-r1'
});

/** Read-only check of the current production welcome template. */
function validateWelcomeEmailQaV1() {
  const textBody = adbWelcomePlainText_();
  const htmlBody = adbWelcomeHtml_();

  if (!String(textBody || '').trim()) throw new Error('Welcome plain-text body is empty.');
  if (!String(htmlBody || '').trim()) throw new Error('Welcome HTML body is empty.');

  const requiredText = [
    'Welcome to the Austin Daily Briefing',
    'Customize my briefing:',
    'Manage subscription:'
  ];
  requiredText.forEach(function(marker) {
    if (textBody.indexOf(marker) < 0) throw new Error('Missing welcome text marker: ' + marker);
  });

  const requiredHtml = [
    'Welcome to the Austin Daily Briefing',
    ADB_RESEND.CUSTOMIZE_URL,
    ADB_RESEND.MANAGE_URL
  ];
  requiredHtml.forEach(function(marker) {
    if (htmlBody.indexOf(marker) < 0) throw new Error('Missing welcome HTML marker: ' + marker);
  });

  const report = {
    htmlChars: htmlBody.length,
    textChars: textBody.length,
    customizeUrlPresent: htmlBody.indexOf(ADB_RESEND.CUSTOMIZE_URL) >= 0,
    manageUrlPresent: htmlBody.indexOf(ADB_RESEND.MANAGE_URL) >= 0,
    sendAttempted: false
  };
  Logger.log(JSON.stringify(report));
  return report;
}

/**
 * Sends the current production welcome template only to the explicit QA
 * allowlist. No queue/history/subscriber writes occur.
 */
function sendWelcomeEmailQaV1() {
  validateWelcomeEmailQaV1();

  const allowlist = String(PropertiesService.getScriptProperties()
    .getProperty(ADB_WELCOME_QA.ALLOWLIST_PROPERTY) || '')
    .split(',')
    .map(function(value) { return value.trim().toLowerCase(); })
    .filter(Boolean);

  if (!allowlist.length) {
    throw new Error('Set ' + ADB_WELCOME_QA.ALLOWLIST_PROPERTY + ' before sending.');
  }

  const textBody = adbWelcomePlainText_();
  const htmlBody = adbWelcomeHtml_();

  const results = allowlist.map(function(recipient) {
    const result = adbSendEmailViaResend_({
      to: recipient,
      subject: ADB_WELCOME_QA.SUBJECT,
      text: textBody,
      html: htmlBody,
      idempotencyKey: ADB_WELCOME_QA.RUN_ID + ':' + recipient,
      tags: {
        message_type: 'welcome_qa',
        environment: 'production',
        qa_run: 'welcome_v1_r1'
      }
    });
    return {recipient: recipient, providerId: result.id, statusCode: result.statusCode};
  });

  const report = {
    runId: ADB_WELCOME_QA.RUN_ID,
    sent: results.length,
    results: results
  };
  Logger.log(JSON.stringify(report));
  return report;
}


/**
 * Austin Daily Briefing — redesigned welcome email controlled QA
 *
 * Loads the staged welcome redesign from GitHub and sends only to the explicit
 * welcome QA allowlist. It does not modify the production welcome template.
 */
const ADB_WELCOME_REDESIGN_QA = Object.freeze({
  HTML_URL: 'https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/main/design/welcome-email-qa.html',
  TEXT_URL: 'https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/main/design/welcome-email-qa.txt',
  SUBJECT: '[CONTROLLED TEST] Welcome to the Austin Daily Briefing · Redesign',
  RUN_ID: 'welcome-email-redesign-v0-1-qa-r1'
});

function validateWelcomeRedesignQaV1() {
  const htmlBody = adbFetchNewsletterRendererQaAsset_(ADB_WELCOME_REDESIGN_QA.HTML_URL);
  const textBody = adbFetchNewsletterRendererQaAsset_(ADB_WELCOME_REDESIGN_QA.TEXT_URL);

  if (htmlBody.indexOf('CONTROLLED WELCOME QA') < 0 ||
      textBody.indexOf('CONTROLLED WELCOME QA') < 0) {
    throw new Error('Controlled welcome redesign marker missing.');
  }

  const htmlUrls = adbExtractNewsletterQaHtmlUrls_(htmlBody);
  const textUrls = adbExtractNewsletterQaTextUrls_(textBody);
  if (htmlUrls.length !== textUrls.length) {
    throw new Error('Welcome redesign HTML/plain-text URL count mismatch: ' +
      htmlUrls.length + ' vs ' + textUrls.length + '.');
  }
  for (let i = 0; i < htmlUrls.length; i++) {
    if (htmlUrls[i] !== textUrls[i]) {
      throw new Error('Welcome redesign URL order mismatch at index ' + i + '.');
    }
  }

  const requiredMarkers = [
    'Welcome to the Austin Daily Briefing',
    'WHAT TO EXPECT',
    'YOUR STARTING SETTINGS',
    'CUSTOMIZE MY BRIEFING',
    'CORRECTIONS, TIPS, AND FEEDBACK',
    'adb-masthead@2x.png',
    'adb-mark-reversed@2x.png'
  ];
  requiredMarkers.forEach(function(marker) {
    if (htmlBody.indexOf(marker) < 0) throw new Error('Missing welcome redesign marker: ' + marker);
  });

  if (htmlBody.length > 45000 || textBody.length > 45000) {
    throw new Error('Welcome redesign QA payload exceeds safe Sheets cell limit.');
  }

  const report = {
    htmlChars: htmlBody.length,
    textChars: textBody.length,
    destinationCount: htmlUrls.length,
    requiredMarkers: requiredMarkers.length,
    sendAttempted: false
  };
  Logger.log(JSON.stringify(report));
  return report;
}

function sendWelcomeRedesignQaV1() {
  validateWelcomeRedesignQaV1();

  const allowlist = String(PropertiesService.getScriptProperties()
    .getProperty(ADB_WELCOME_QA.ALLOWLIST_PROPERTY) || '')
    .split(',')
    .map(function(value) { return value.trim().toLowerCase(); })
    .filter(Boolean);

  if (!allowlist.length) {
    throw new Error('Set ' + ADB_WELCOME_QA.ALLOWLIST_PROPERTY + ' before sending.');
  }

  const htmlBody = adbFetchNewsletterRendererQaAsset_(ADB_WELCOME_REDESIGN_QA.HTML_URL);
  const textBody = adbFetchNewsletterRendererQaAsset_(ADB_WELCOME_REDESIGN_QA.TEXT_URL);

  const results = allowlist.map(function(recipient) {
    const result = adbSendEmailViaResend_({
      to: recipient,
      subject: ADB_WELCOME_REDESIGN_QA.SUBJECT,
      text: textBody,
      html: htmlBody,
      idempotencyKey: ADB_WELCOME_REDESIGN_QA.RUN_ID + ':' + recipient,
      tags: {
        message_type: 'welcome_redesign_qa',
        environment: 'production',
        qa_run: 'welcome_redesign_v0_1'
      }
    });
    return {recipient: recipient, providerId: result.id, statusCode: result.statusCode};
  });

  const report = {
    runId: ADB_WELCOME_REDESIGN_QA.RUN_ID,
    sent: results.length,
    results: results
  };
  Logger.log(JSON.stringify(report));
  return report;
}
