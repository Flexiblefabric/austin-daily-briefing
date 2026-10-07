(function () {
  'use strict';

  const config = window.ADB_NATIVE_MANAGE_CONFIRM_CONFIG || {};
  const form = document.getElementById('native-manage-confirm-form');
  const button = document.getElementById('manage-confirm-button');
  const tokenInput = document.getElementById('manage-confirm-token');
  const nonceInput = document.getElementById('manage-confirm-client-nonce');
  const title = document.getElementById('manage-confirm-title');
  const copy = document.getElementById('manage-confirm-copy');
  const status = document.getElementById('manage-confirm-status');
  const help = document.getElementById('manage-confirm-help');
  const actions = document.getElementById('manage-confirm-actions');

  if (!form || !button || !tokenInput || !nonceInput || !title || !copy || !status || !help || !actions) return;

  const endpoints = config.endpoints || {};
  const defaultEnvironment = String(config.defaultEnvironment || 'development').trim().toLowerCase();
  const endpointPattern = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
  let token = '';
  let endpoint = '';
  let pending = false;

  function setStatus(kind, message) {
    status.className = 'form-status' + (kind ? ' form-status-' + kind : '');
    status.textContent = message || '';
  }

  function createNonce() {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (value) {
      return value.toString(16).padStart(2, '0');
    }).join('');
  }

  function unavailable(message) {
    token = '';
    pending = false;
    button.disabled = true;
    actions.hidden = false;
    title.textContent = 'This confirmation link is unavailable.';
    copy.textContent = message || 'The link may be invalid, expired, or already used.';
    help.textContent = 'Return to the management page if you need to submit a new request.';
    setStatus('error', '');
  }

  function confirmed() {
    token = '';
    pending = false;
    button.disabled = true;
    title.textContent = 'Request confirmed.';
    copy.textContent = 'Your request is confirmed. The management processor can now apply it exactly once.';
    help.textContent = 'You can close this page.';
    setStatus('success', 'Confirmation accepted.');
  }

  function temporaryError() {
    token = '';
    pending = false;
    button.disabled = true;
    title.textContent = 'We could not confirm this request.';
    copy.textContent = 'No management change was applied. Reopen the confirmation link from your email and try again.';
    help.textContent = 'If the problem continues, submit a new management request.';
    setStatus('error', 'Confirmation was not completed.');
  }

  const rawHash = window.location.hash ? window.location.hash.slice(1) : '';
  const params = new URLSearchParams(rawHash);
  const result = String(params.get('result') || '').trim().toLowerCase();

  if (result === 'confirmed') {
    confirmed();
    return;
  }
  if (result === 'invalid_or_expired') {
    unavailable('The link may be invalid, expired, or already used.');
    return;
  }
  if (result === 'temporary_error') {
    temporaryError();
    return;
  }

  token = String(params.get('token') || '').trim();
  let environment = String(params.get('env') || defaultEnvironment).trim().toLowerCase();
  if (environment === 'dev') environment = 'development';
  if (environment === 'prod') environment = 'production';
  endpoint = String(endpoints[environment] || '').trim();

  if (token.length < 32 || token.length > 256) {
    unavailable('The confirmation token is missing or malformed.');
    return;
  }
  if (!endpointPattern.test(endpoint)) {
    unavailable('Management confirmation is not configured right now.');
    return;
  }

  form.action = endpoint;

  button.addEventListener('click', function () {
    if (!token || pending) return;
    nonceInput.value = createNonce();
    tokenInput.value = token;
    pending = true;
    button.disabled = true;
    button.textContent = 'Confirming…';
    setStatus('notice', 'Confirming your request…');
    form.submit();
  });
})();
