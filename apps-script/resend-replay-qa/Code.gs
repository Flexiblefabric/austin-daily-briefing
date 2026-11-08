// Install in a fresh standalone Apps Script project. This test sends a
// synthetic message to the fixed QA inbox using a separate sending key.
const ADB_RESEND = Object.freeze({
  API_KEY_PROPERTY: 'ADB_QA_RESEND_API_KEY',
  ENDPOINT: 'https://api.resend.com/emails',
  FROM: 'Austin Daily Briefing <briefing@austindailybriefing.com>',
  REPLY_TO: 'briefing@austindailybriefing.com'
});
const ADB_REPLAY_QA_STATE = 'ADB_REPLAY_QA_STATE_V1';

function startAdbLiveReplayQa() {
  adbRunLiveReplayQa_(false);
}

function replayAdbLiveReplayQa() {
  adbRunLiveReplayQa_(true);
}

function adbRunLiveReplayQa_(replay) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties();
    if (!props.getProperty(ADB_RESEND.API_KEY_PROPERTY)) {
      throw new Error('Set ADB_QA_RESEND_API_KEY in this standalone project.');
    }
    const saved = JSON.parse(props.getProperty(ADB_REPLAY_QA_STATE) || 'null');
    if (replay) {
      if (!saved || saved.phase !== 'FIRST_ACCEPTED' || !saved.firstId ||
          Date.now() < saved.startedAt || Date.now() - saved.startedAt >= 60 * 60 * 1000) {
        throw new Error('Replay requires a successful first request within the last hour.');
      }
    } else if (saved) {
      throw new Error('This project already attempted the test. Inspect its existing execution logs.');
    }
    const state = saved || {key: 'adb-live-replay-qa-' + Utilities.getUuid(), startedAt: Date.now()};
    state.phase = replay ? 'REPLAY_ATTEMPTED' : 'FIRST_ATTEMPTED';
    props.setProperty(ADB_REPLAY_QA_STATE, JSON.stringify(state));

    let result;
    try {
      result = adbSendEmailViaResend_({
        to: 'ADBTester15@tutamail.com',
        subject: '[ADB QA] Resend replay check ' + state.key,
        text: 'Synthetic Austin Daily Briefing replay check. One delivery is expected.',
        idempotencyKey: state.key
      });
    } catch (error) {
      throw new Error('Resend request did not produce a usable receipt. Inspect the provider log before starting another test.' +
        (Number.isInteger(error.resendStatus) ? ' HTTP ' + error.resendStatus + '.' : ''));
    }
    if (!replay) {
      state.firstId = result.id;
      state.phase = 'FIRST_ACCEPTED';
      props.setProperty(ADB_REPLAY_QA_STATE, JSON.stringify(state));
      console.log(JSON.stringify({result: 'PASS', phase: state.phase, providerId: result.id}));
      return;
    }
    state.replayId = result.id;
    state.phase = 'REPLAY_COMPLETE';
    props.setProperty(ADB_REPLAY_QA_STATE, JSON.stringify(state));
    const matched = state.firstId === result.id;
    console.log(JSON.stringify({result: matched ? 'PASS' : 'FAIL', phase: state.phase,
      firstId: state.firstId, replayId: result.id, sameProviderId: matched}));
  } finally {
    lock.releaseLock();
  }
}

// Exact Resend request and response functions from PR #122 commit c77559d.
function adbResendPayload_(message) {
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
  return payload;
}

function adbSendEmailViaResend_(message) {
  const apiKey = PropertiesService.getScriptProperties()
    .getProperty(ADB_RESEND.API_KEY_PROPERTY);
  if (!apiKey) throw new Error('Missing Apps Script property RESEND_API_KEY.');

  const payload = adbResendPayload_(message);

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
    const error = new Error('Resend rejected the message (' + statusCode + '): ' + detail);
    error.resendStatus = statusCode;
    throw error;
  }
  return {id: String(parsed.id), statusCode: statusCode};
}
