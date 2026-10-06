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
  let pendingNonce = '';
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

  function isAllowedResultOrigin(origin) {
    try {
      const url = new URL(origin);
      if (url.protocol !== 'https:') return false;
      return url.hostname === 'script.google.com' ||
        url.hostname === 'script.googleusercontent.com' ||
        url.hostname.endsWith('-script.googleusercontent.com');
    } catch (error) {
      return false;
    }
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

  const rawHash = window.location.hash ? window.location.hash.slice(1) : '';
  const params = new URLSearchParams(rawHash);
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
    pendingNonce = createNonce();
    nonceInput.value = pendingNonce;
    tokenInput.value = token;
    pending = true;
    button.disabled = true;
    button.textContent = 'Confirming…';
    setStatus('notice', 'Confirming your request…');
    form.submit();
  });

  window.addEventListener('message', function (event) {
    if (!isAllowedResultOrigin(event.origin)) return;
    const data = event.data;
    if (!data || data.type !== 'adb-native-manage-confirm-dev') return;
    if (!pendingNonce || data.client_nonce !== pendingNonce) return;

    if (data.ok && data.status === 'confirmed') {
      confirmed();
      return;
    }
    if (data.status === 'invalid_or_expired') {
      unavailable('The link may be invalid, expired, or already used.');
      return;
    }

    pending = false;
    button.disabled = false;
    button.textContent = 'Confirm request';
    setStatus('error', 'We could not confirm this request right now. Reopen the link from your email and try again.');
  });
})();
