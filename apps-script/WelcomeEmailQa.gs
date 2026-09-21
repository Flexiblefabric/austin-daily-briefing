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
