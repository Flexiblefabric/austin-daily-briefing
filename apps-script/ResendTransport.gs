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
  TEST_RECIPIENT_PROPERTY: 'ADB_RESEND_TEST_RECIPIENT'
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
