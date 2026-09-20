/**
 * Manual-only, one-run newsletter redesign test.
 *
 * This path is intentionally separate from the live daily dispatcher so the
 * Admin Hold test profile is never made production-eligible. Exact recipients,
 * branch payloads, and idempotency keys keep the send bounded and replay-safe.
 */
function sendNewsletterRedesignQaV2() {
  const recipients = [
    'Flexiblefoam@yahoo.com',
    'claro12407@gmail.com',
    'adbtester12@hotmail.com'
  ];
  const subject = '[CONTROLLED TEST] Austin Daily Briefing — Newsletter Redesign QA Revision 2';
  const runId = 'newsletter-redesign-qa-v2-20260920';
  const payload = adbLoadNewsletterRedesignQa_();

  const results = recipients.map(function(recipient) {
    const result = adbSendEmailViaResend_({
      to: recipient,
      subject: subject,
      text: payload.text,
      html: payload.html,
      idempotencyKey: runId + ':' + recipient.toLowerCase(),
      tags: {
        message_type: 'newsletter_redesign_qa',
        environment: 'production',
        qa_run: 'redesign_v2'
      }
    });
    return {recipient: recipient, providerId: result.id, statusCode: result.statusCode};
  });

  Logger.log(JSON.stringify({runId: runId, sent: results.length, results: results}));
  return {runId: runId, sent: results.length, results: results};
}

/** Read-only preflight: fetches and validates the exact payload without sending. */
function validateNewsletterRedesignQaV2() {
  const payload = adbLoadNewsletterRedesignQa_();
  const report = {
    htmlChars: payload.html.length,
    textChars: payload.text.length,
    htmlLinks: (payload.html.match(/<a\s+[^>]*href=/gi) || []).length,
    textUrls: (payload.text.match(/^https?:\/\//gm) || []).length,
    sendAttempted: false
  };
  if (report.htmlLinks !== report.textUrls || report.htmlLinks !== 15) {
    throw new Error('HTML/plain-text destination parity failed.');
  }
  if (payload.html.indexOf('adb-mark-reversed.png') < 0 || payload.html.indexOf('major-section') < 0) {
    throw new Error('Revision 2 layout markers are missing.');
  }
  Logger.log(JSON.stringify(report));
  return report;
}

function adbLoadNewsletterRedesignQa_() {
  const htmlUrl = 'https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/newsletter-identity-redesign/design/newsletter-layout-email-test.html';
  const textUrl = 'https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/newsletter-identity-redesign/design/newsletter-layout-email-test.txt';
  const html = adbFetchQaAsset_(htmlUrl);
  const text = adbFetchQaAsset_(textUrl);
  if (html.indexOf('CONTROLLED LAYOUT TEST') < 0 || text.indexOf('CONTROLLED LAYOUT TEST') < 0) {
    throw new Error('QA payload marker is missing.');
  }
  if (html.indexOf('Pause or unsubscribe') < 0 || html.indexOf('Featured Top Story') < 0) {
    throw new Error('QA payload is incomplete.');
  }
  return {html: html, text: text};
}

function adbFetchQaAsset_(url) {
  const response = UrlFetchApp.fetch(url, {followRedirects: true, muteHttpExceptions: true});
  const status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    throw new Error('Unable to load QA asset (' + status + '): ' + url);
  }
  return response.getContentText();
}
