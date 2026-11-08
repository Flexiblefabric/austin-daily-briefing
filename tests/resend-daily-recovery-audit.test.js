const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../apps-script/ResendTransport.gs'), 'utf8');
const email = 'reader@example.invalid';
const profile = 'QA-ONLY';
const run = 'SYNTHETIC-RUN';
const messageId = 'DAILY-RESEND-QA:' + profile + ':' + run;

function fixture({failWrite, loseResponse, failReceipt, failFlush, rejectRequest} = {}) {
  let now = Date.parse("2026-11-08T20:00:00Z");
  class Clock extends Date {
    constructor() { super(now); }
    static now() { return now; }
  }
  const queue = {
    'Message ID': messageId, 'Profile ID': profile, Email: email,
    'Template ID': 'DAILY_BRIEFING_V1', Status: 'Queued', Subject: 'Synthetic',
    'Sent At / Gmail ID': '', Notes: '', 'Plain Text': 'Synthetic',
    HTML: '<p>Synthetic</p>', 'Run ID': run
  };
  const history = {
    'Run ID': run, 'Profile ID': profile, Notes: 'Synthetic',
    'Delivery Status': 'Pending', 'Provider Message ID': ''
  };
  const tables = {
    'Outbound Messages': queue,
    'Briefing History': history,
    Subscribers: {Email: email, 'Profile ID': profile, Status: 'Active', 'Admin Status': 'OK'},
    Profiles: {'Profile ID': profile, Status: 'Active', 'Primary Preference Email': email},
    'Message Templates': {'Template ID': 'DAILY_BRIEFING_V1', Active: 'TRUE', Environment: 'PRODUCTION'}
  };
  const keys = new Map();
  let requests = 0;
  let acceptances = 0;
  const properties = {
    ADB_RESEND_DAILY_MODE: 'CONTROLLED',
    ADB_RESEND_DAILY_ALLOWLIST: email,
    RESEND_API_KEY: 'mock-only'
  };
  const context = vm.createContext({
    Date: Clock,
    Utilities: {
      DigestAlgorithm: {SHA_256: 'sha256'},
      Charset: {UTF_8: 'utf8'},
      computeDigest: (algorithm, value) => crypto.createHash(algorithm).update(value).digest(),
      base64EncodeWebSafe: bytes => Buffer.from(bytes).toString('base64url')
    },
    PropertiesService: {getScriptProperties: () => ({
      getProperty: key => properties[key],
      getProperties: () => ({...properties}),
      setProperty(key, value) {
        if (failReceipt && JSON.parse(value).providerId) {
          failReceipt = false;
          throw new Error('Injected receipt write failure');
        }
        properties[key] = value;
      },
      deleteProperty: key => delete properties[key]
    })},
    LockService: {getScriptLock: () => ({waitLock() {}, releaseLock() {}})},
    Logger: {log() {}},
    SpreadsheetApp: {
      flush() {
        if (failFlush) {
          failFlush = false;
          throw new Error('Injected Sheets flush failure');
        }
      },
      openById: () => ({
      getSheetByName(name) {
        const data = tables[name];
        assert.ok(data, 'Unexpected mock sheet');
        const headers = Object.keys(data);
        return {
          getDataRange: () => ({getDisplayValues: () => [headers, Object.values(data)]}),
          getRange(row, column) {
            assert.equal(row, 2);
            const header = headers[column - 1];
            assert.ok(header);
            return {setValue(value) {
              if (failWrite === name + '/' + header) {
                failWrite = null;
                throw new Error('Injected Sheets write failure');
              }
              data[header] = value;
            }};
          }
        };
      }
    })},
    UrlFetchApp: {fetch(url, options) {
      assert.equal(url, 'https://api.resend.com/emails');
      assert.equal(JSON.parse(options.payload).to[0], email);
      const key = options.headers['Idempotency-Key'];
      assert.equal(key, messageId);
      assert.ok(Object.keys(properties).some(key => key.startsWith('ADB_RESEND_DAILY_ATTEMPT_V1_')));
      requests++;
      if (requests === rejectRequest) {
        return {getResponseCode: () => 422, getContentText: () => '{"message":"Synthetic rejection"}'};
      }
      const prior = keys.get(key);
      if (prior) {
        assert.equal(prior.payload, options.payload);
      } else {
        keys.set(key, {id: 'mock-id-' + ++acceptances, payload: options.payload});
      }
      if (loseResponse) {
        loseResponse = false;
        throw new Error('Injected lost provider response');
      }
      return {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({id: keys.get(key).id})
      };
    }}
  });
  vm.runInContext(source, context);
  // Keep unrelated production environment checks outside the transport experiment.
  context.adbValidateDailyDeliveryGates_ = () => {};
  return {
    dispatch: () => context.dispatchQueuedDailyBriefingsViaResendV1(),
    expireProviderKeys() { keys.clear(); now += 24 * 60 * 60 * 1000; },
    attempts: () => Object.keys(properties).filter(key => key.startsWith('ADB_RESEND_DAILY_ATTEMPT_V1_')).length,
    subscriber: tables.Subscribers,
    counts: () => ({requests, acceptances}),
    queue,
    history
  };
}

test('confirmed receipt repairs each partial Sheets write without another send', () => {
  for (const failure of [
    {failWrite: 'Briefing History/Provider Message ID'},
    {failWrite: 'Briefing History/Delivery Status'},
    {failWrite: 'Outbound Messages/Sent At / Gmail ID'},
    {failWrite: 'Outbound Messages/Status'},
    {failFlush: true}
  ]) {
    const run = fixture(failure);
    assert.throws(run.dispatch, /Injected Sheets/);
    assert.equal(run.attempts(), 1);
    run.expireProviderKeys();
    run.subscriber.Status = 'Paused';
    assert.equal(run.dispatch().reconciled, 1);
    assert.equal(run.queue.Status, 'Sent');
    assert.match(run.queue['Sent At / Gmail ID'], /mock-id-1$/);
    assert.equal(run.history['Provider Message ID'], 'mock-id-1');
    assert.equal(run.history['Delivery Status'], 'Sent');
    assert.equal(run.history.Notes.match(/Resend accepted/g).length, 1);
    assert.equal(run.attempts(), 0);
    assert.deepEqual(run.counts(), {requests: 1, acceptances: 1});
  }
});

test('lost provider response and failed receipt persistence allow identical bounded replay', () => {
  for (const failure of [{loseResponse: true}, {failReceipt: true}]) {
    const run = fixture(failure);
    assert.throws(run.dispatch, /Injected/);
    assert.equal(run.queue.Status, 'Queued');
    assert.equal(run.history['Delivery Status'], 'Pending');
    assert.equal(run.attempts(), 1);
    assert.equal(run.dispatch().sent, 1);
    assert.deepEqual(run.counts(), {requests: 2, acceptances: 1});
    assert.equal(run.attempts(), 0);
  }
});

test('expired or changed unresolved attempts are reported for review without sending', () => {
  for (const change of [run => run.expireProviderKeys(), run => { run.queue.Subject = 'Changed'; }]) {
    const run = fixture({loseResponse: true});
    assert.throws(run.dispatch, /Injected lost provider response/);
    change(run);
    assert.equal(JSON.stringify(run.dispatch().reviewRows), '[2]');
    assert.deepEqual(run.counts(), {requests: 1, acceptances: 1});
    assert.equal(run.attempts(), 1);
  }
});

test('a renamed queue identity cannot bypass an unresolved journal entry', () => {
  const run = fixture({loseResponse: true});
  assert.throws(run.dispatch, /Injected lost provider response/);
  run.queue['Message ID'] += ':changed';
  assert.throws(run.dispatch, /Unmatched daily delivery attempts/);
  assert.deepEqual(run.counts(), {requests: 1, acceptances: 1});
});

test('explicit rejection fails a new send but preserves an earlier uncertain attempt', () => {
  const fresh = fixture({rejectRequest: 1});
  assert.throws(fresh.dispatch, /422/);
  assert.equal(fresh.queue.Status, 'Failed');
  assert.equal(fresh.attempts(), 0);
  assert.deepEqual(fresh.counts(), {requests: 1, acceptances: 0});

  const replay = fixture({loseResponse: true, rejectRequest: 2});
  assert.throws(replay.dispatch, /Injected lost provider response/);
  assert.throws(replay.dispatch, /422/);
  assert.equal(replay.queue.Status, 'Queued');
  assert.equal(replay.attempts(), 1);
  assert.deepEqual(replay.counts(), {requests: 2, acceptances: 1});
});
