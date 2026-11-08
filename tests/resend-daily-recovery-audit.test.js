const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../apps-script/ResendTransport.gs'), 'utf8');
const email = 'reader@example.invalid';
const profile = 'QA-ONLY';
const run = 'SYNTHETIC-RUN';
const messageId = 'DAILY-RESEND-QA:' + profile + ':' + run;

// These tests characterize gaps in the current dispatcher. Replace the
// expected failure outcomes with recovery assertions when the gaps are fixed.
function fixture({failWrite, loseResponse} = {}) {
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
    PropertiesService: {getScriptProperties: () => ({getProperty: key => properties[key]})},
    LockService: {getScriptLock: () => ({waitLock() {}, releaseLock() {}})},
    Logger: {log() {}},
    SpreadsheetApp: {openById: () => ({
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
      requests++;
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
    expireProviderKeys: () => keys.clear(),
    counts: () => ({requests, acceptances}),
    queue,
    history
  };
}

test('first Sheets write fails: identical replay reconciles while the provider key is retained', () => {
  const run = fixture({failWrite: 'Outbound Messages/Status'});
  assert.throws(run.dispatch, /Injected Sheets write failure/);
  assert.equal(run.queue.Status, 'Queued');
  assert.equal(run.dispatch().sent, 1);
  assert.deepEqual(run.counts(), {requests: 2, acceptances: 1});
  assert.equal(run.history['Provider Message ID'], 'mock-id-1');
});

test('first Sheets write fails: replay can send again after the provider key expires', () => {
  const run = fixture({failWrite: 'Outbound Messages/Status'});
  assert.throws(run.dispatch, /Injected Sheets write failure/);
  run.expireProviderKeys();
  assert.equal(run.dispatch().sent, 1);
  assert.deepEqual(run.counts(), {requests: 2, acceptances: 2});
  assert.equal(run.history['Provider Message ID'], 'mock-id-2');
});

test('write fails after queue status is Sent: dispatcher skips the incomplete record on replay', () => {
  for (const failWrite of ['Outbound Messages/Sent At / Gmail ID', 'Briefing History/Provider Message ID']) {
    const run = fixture({failWrite});
    assert.throws(run.dispatch, /Injected Sheets write failure/);
    assert.equal(run.queue.Status, 'Sent');
    assert.equal(run.dispatch().sent, 0);
    assert.deepEqual(run.counts(), {requests: 1, acceptances: 1});
    assert.equal(run.history['Provider Message ID'], '');
  }
});

test('accepted send with lost HTTP response: dispatcher records Failed and skips replay', () => {
  const run = fixture({loseResponse: true});
  assert.throws(run.dispatch, /Injected lost provider response/);
  assert.equal(run.queue.Status, 'Failed');
  assert.equal(run.history['Delivery Status'], 'Failed');
  assert.equal(run.dispatch().sent, 0);
  assert.deepEqual(run.counts(), {requests: 1, acceptances: 1});
});
