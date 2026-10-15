/**
 * ADB-DAILY-LAYOUT-QA-1.0 — optional, manually invoked, ONE-recipient inbox QA.
 *
 * This file is NOT part of the production dispatcher and never processes any
 * subscriber sheet, history, or outbound queue rows. Do not add a trigger.
 *
 * Install alongside DailyNewsletterContract.gs + ResendTransport.gs ONLY
 * during controlled review. Run previewAdbDailyLayoutQaV1 first.
 * Sending requires an explicit, manually armed Script Property
 * ADB_DAILY_LAYOUT_QA_SEND_APPROVAL=SEND_ONCE.
 */
const ADB_DAILY_LAYOUT_QA = Object.freeze({
  FIXTURE_COMMIT: '1c650e09fcfbc1148bdfa4d7fb4447f13e39718e',
  FIXTURE_DIR: 'https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/' +
    '1c650e09fcfbc1148bdfa4d7fb4447f13e39718e' + '/tests/fixtures/',
  APPROVAL_PROPERTY: 'ADB_DAILY_LAYOUT_QA_SEND_APPROVAL',
  CONTRACT: 'ADB-DAILY-HTML-1.0',
  SUBJECT: '[QA — SYNTHETIC] Austin Daily Briefing — newsletter layout'
});

function adbLoadDailyLayoutQaFixture_() {
  if (typeof adbValidateDailyNewsletterPayload_ !== 'function' ||
      typeof adbSendEmailViaResend_ !== 'function' ||
      typeof ADB_RESEND !== 'object') {
    throw new Error('Matching production validator and Resend transport are required.');
  }
  const props = PropertiesService.getScriptProperties();
  const layoutMode = String(props.getProperty('ADB_DAILY_LAYOUT_GUARD_MODE') || 'STAGED')
    .trim().toUpperCase();
  if (layoutMode !== 'STAGED') {
    throw new Error('Controlled QA requires ADB_DAILY_LAYOUT_GUARD_MODE=STAGED.');
  }
  const recipient = String(props.getProperty(ADB_RESEND.TEST_RECIPIENT_PROPERTY) || '')
    .trim().toLowerCase();
  if (!/^[^@\s,;]+@[^@\s,;]+\.[^@\s,;]+$/.test(recipient)) {
    throw new Error('Configure one email in ADB_RESEND_TEST_RECIPIENT before QA.');
  }
  function load(filename) {
    const response = UrlFetchApp.fetch(ADB_DAILY_LAYOUT_QA.FIXTURE_DIR + filename, {
      muteHttpExceptions: true, followRedirects: true
    });
    if (response.getResponseCode() !== 200) {
      throw new Error('Pinned QA fixture unavailable: ' + filename + ', HTTP ' +
        response.getResponseCode());
    }
    return response.getContentText('UTF-8');
  }
  const html = load('daily-newsletter-controlled-send.html');
  const text = load('daily-newsletter-controlled-send.txt');
  if (!html.includes('CONTROLLED QA ONLY') ||
      !text.includes('Sample city budget decision for controlled rendering')) {
    throw new Error('Fixture lacks the mandatory synthetic/nonpublication markers.');
  }
  const validation = adbValidateDailyNewsletterPayload_(html, text);
  if (validation.contract !== ADB_DAILY_LAYOUT_QA.CONTRACT) {
    throw new Error('Wrong rendering contract version.');
  }
  return {html:html, text:text, recipient:recipient, validation:validation};
}

/**
 * Non-sending preview. Does not modify script properties, Sheets, queue,
 * history, or Resend. Do not return test recipient/email address.
 */
function previewAdbDailyLayoutQaV1() {
  const payload = adbLoadDailyLayoutQaFixture_();
  const report = {
    qaFixture: 'SYNTHETIC',
    contract: payload.validation.contract,
    validation: 'PASS',
    htmlCharacters: payload.html.length,
    plainTextCharacters: payload.text.length,
    sourceLinks: payload.validation.sourceLinks,
    destinations: payload.validation.destinations,
    recipientConfigured: true,
    scriptPropertyChanges: 0,
    queueWrites: 0,
    providerSends: 0
  };
  Logger.log(JSON.stringify(report));
  return report;
}

/**
 * Explicit ONE-TIME transport QA. Never call automatically or from triggers.
 * Sends the validated synthetic fixture ONLY to ADB_RESEND_TEST_RECIPIENT.
 * Consumes the approval property BEFORE provider handoff.
 */
function sendAdbDailyLayoutQaV1() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties();
    if (String(props.getProperty(ADB_DAILY_LAYOUT_QA.APPROVAL_PROPERTY) || '').trim() !==
        'SEND_ONCE') {
      throw new Error('Controlled QA not approved: set ADB_DAILY_LAYOUT_QA_SEND_APPROVAL=SEND_ONCE manually.');
    }
    const payload = adbLoadDailyLayoutQaFixture_();
    props.deleteProperty(ADB_DAILY_LAYOUT_QA.APPROVAL_PROPERTY);
    const result = adbSendEmailViaResend_({
      to: payload.recipient,
      subject: ADB_DAILY_LAYOUT_QA.SUBJECT,
      text: payload.text,
      html: payload.html,
      idempotencyKey: 'adb-daily-layout-qa-20261014-'+ADB_DAILY_LAYOUT_QA.FIXTURE_COMMIT.slice(0,12),
      tags: {message_type:'layout_qa',environment:'production'}
    });
    Logger.log(JSON.stringify({
      qaFixture:'SYNTHETIC',
      contract:payload.validation.contract,
      accepted:result.statusCode,
      providerId:result.id,
      queueWrites:0,
      productionHistoryWrites:0,
      recipientCount:1
    }));
    return {accepted:result.statusCode,providerId:result.id,recipientCount:1};
  } finally {
    lock.releaseLock();
  }
}
