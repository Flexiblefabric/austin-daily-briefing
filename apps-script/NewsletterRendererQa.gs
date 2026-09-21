/**
 * Austin Daily Briefing — newsletter renderer controlled QA
 *
 * Manual-only. This file does not modify queue/history state and does not create
 * triggers. It reuses adbSendEmailViaResend_ from ResendTransport.gs.
 *
 * Script property required before sending:
 *   ADB_NEWSLETTER_RENDERER_QA_ALLOWLIST=email1@example.com,email2@example.com
 */
const ADB_NEWSLETTER_RENDERER_QA = Object.freeze({
  ALLOWLIST_PROPERTY: 'ADB_NEWSLETTER_RENDERER_QA_ALLOWLIST',
  BRANCH: 'newsletter-renderer-v0-1',
  HTML_URL: 'https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/newsletter-renderer-v0-1/design/newsletter-renderer-qa.html',
  TEXT_URL: 'https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/newsletter-renderer-v0-1/design/newsletter-renderer-qa.txt',
  SUBJECT: '[CONTROLLED TEST] Austin Daily Briefing — Newsletter Renderer v0.1 · Revision 2'
});

function validateNewsletterRendererV01() {
  const payload = adbLoadNewsletterRendererQaV01_();
  const htmlUrls = adbExtractNewsletterQaHtmlUrls_(payload.html);
  const textUrls = adbExtractNewsletterQaTextUrls_(payload.text);
  if (htmlUrls.length !== textUrls.length) {
    throw new Error('HTML/plain-text URL count mismatch: ' + htmlUrls.length + ' vs ' + textUrls.length + '.');
  }
  for (let i = 0; i < htmlUrls.length; i++) {
    if (htmlUrls[i] !== textUrls[i]) {
      throw new Error('HTML/plain-text URL order mismatch at index ' + i + '.');
    }
  }
  const requiredMarkers = [
    'AUSTIN PULSE',
    'FEATURED TOP STORY',
    'TOP STORIES',
    'UNDER THE RADAR',
    'MORE FOR YOU',
    'AUSTIN AHEAD',
    'WHY IT MATTERS',
    'CORRECTION',
    'Pause or unsubscribe',
    '#f2efe8',
    'border-top:5px solid #db2d2d',
    'background:#fffefa'
  ];
  requiredMarkers.forEach(function(marker) {
    if (payload.html.indexOf(marker) < 0) throw new Error('Missing renderer marker: ' + marker);
  });
  if (payload.html.length > 45000 || payload.text.length > 45000) {
    throw new Error('QA payload exceeds the production Sheets cell limit.');
  }
  const report = {
    htmlChars: payload.html.length,
    textChars: payload.text.length,
    destinationCount: htmlUrls.length,
    requiredMarkers: requiredMarkers.length,
    sendAttempted: false
  };
  Logger.log(JSON.stringify(report));
  return report;
}

function sendNewsletterRendererQaV01() {
  validateNewsletterRendererV01();
  const allowlist = String(PropertiesService.getScriptProperties()
    .getProperty(ADB_NEWSLETTER_RENDERER_QA.ALLOWLIST_PROPERTY) || '')
    .split(',')
    .map(function(value) { return value.trim().toLowerCase(); })
    .filter(Boolean);

  if (!allowlist.length) {
    throw new Error('Set ' + ADB_NEWSLETTER_RENDERER_QA.ALLOWLIST_PROPERTY + ' before sending.');
  }

  const payload = adbLoadNewsletterRendererQaV01_();
  const runId = 'newsletter-renderer-v0-1-qa-r2';
  const results = allowlist.map(function(recipient) {
    const result = adbSendEmailViaResend_({
      to: recipient,
      subject: ADB_NEWSLETTER_RENDERER_QA.SUBJECT,
      text: payload.text,
      html: payload.html,
      idempotencyKey: runId + ':' + recipient,
      tags: {
        message_type: 'newsletter_renderer_qa',
        environment: 'production',
        qa_run: 'renderer_v0_1'
      }
    });
    return {recipient: recipient, providerId: result.id, statusCode: result.statusCode};
  });

  const report = {runId: runId, sent: results.length, results: results};
  Logger.log(JSON.stringify(report));
  return report;
}

function adbLoadNewsletterRendererQaV01_() {
  const html = adbFetchNewsletterRendererQaAsset_(ADB_NEWSLETTER_RENDERER_QA.HTML_URL);
  const text = adbFetchNewsletterRendererQaAsset_(ADB_NEWSLETTER_RENDERER_QA.TEXT_URL);
  if (html.indexOf('CONTROLLED COMPONENT QA') < 0 || text.indexOf('CONTROLLED COMPONENT QA') < 0) {
    throw new Error('Controlled QA marker missing.');
  }
  return {html: html, text: text};
}

function adbFetchNewsletterRendererQaAsset_(url) {
  const response = UrlFetchApp.fetch(url, {followRedirects: true, muteHttpExceptions: true});
  const status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    throw new Error('Unable to load QA asset (' + status + '): ' + url);
  }
  return response.getContentText();
}

function adbExtractNewsletterQaHtmlUrls_(html) {
  const urls = [];
  const re = /<a\s+[^>]*href=["']([^"']+)["']/gi;
  let match;
  while ((match = re.exec(html)) !== null) urls.push(match[1]);
  return urls;
}

function adbExtractNewsletterQaTextUrls_(textBody) {
  return textBody.split(/\r?\n/).filter(function(line) {
    return /^https?:\/\//.test(line.trim());
  }).map(function(line) { return line.trim(); });
}
