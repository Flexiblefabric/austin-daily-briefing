(function () {
  'use strict';

  const config = window.ADB_NATIVE_MANAGE_CONFIG || {};
  const form = document.getElementById('native-manage-form');
  const submitButton = document.getElementById('manage-submit');
  const statusBox = document.getElementById('manage-status');
  const resultFrame = document.getElementById('adb-native-manage-result');
  const nonceInput = document.getElementById('manage-client-nonce');
  const emailInput = document.getElementById('manage-email');
  const resetInput = document.getElementById('manage-reset-topics');

  if (!form || !submitButton || !statusBox || !resultFrame || !nonceInput || !emailInput || !resetInput) return;

  const endpoint = String(config.endpoint || '').trim();
  const environment = String(config.environment || 'development').trim().toLowerCase();
  const expectedResultType = environment === 'production'
    ? 'adb-native-manage-prod'
    : 'adb-native-manage-dev';
  const endpointPattern = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;

  let responseTimer = null;
  let pendingNonce = '';
  let submissionPending = false;

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

  function setStatus(kind, message) {
    statusBox.className = 'form-status' + (kind ? ' form-status-' + kind : '');
    statusBox.textContent = message || '';
  }

  function setSubmitting(isSubmitting) {
    submitButton.disabled = !!isSubmitting;
    submitButton.textContent = isSubmitting ? 'Submitting…' : 'Send confirmation';
  }

  function createNonce() {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (value) {
      return value.toString(16).padStart(2, '0');
    }).join('');
  }

  function validEmailShape(value) {
    const email = String(value || '').trim();
    if (!email || email.length > 254 || /\s/.test(email)) return false;
    const at = email.lastIndexOf('@');
    if (at <= 0 || at === email.length - 1) return false;
    const labels = email.slice(at + 1).split('.');
    if (labels.length < 2) return false;
    return labels.every(function (label) {
      return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label);
    });
  }

  function selectedDeliveryAction() {
    const checked = form.querySelector('input[name="delivery_action"]:checked');
    return checked ? String(checked.value || '') : '';
  }

  function hasRequestedChange() {
    return selectedDeliveryAction() !== 'keep_current' || resetInput.checked;
  }

  function successMessage() {
    return 'Check your inbox. If that address is connected to Austin Daily Briefing, we’ll send a confirmation link for the requested change. Nothing changes until the request is confirmed.';
  }

  function finish(kind, message) {
    if (responseTimer) window.clearTimeout(responseTimer);
    responseTimer = null;
    submissionPending = false;
    setSubmitting(false);
    pendingNonce = '';
    nonceInput.value = '';
    setStatus(kind, message);
  }

  if (!endpointPattern.test(endpoint)) {
    submitButton.disabled = true;
    setStatus('notice', 'This management preview is not connected yet. Use the current management form for now.');
    return;
  }

  form.action = endpoint;

  form.addEventListener('submit', function (event) {
    setStatus('', '');

    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      return;
    }

    if (!validEmailShape(emailInput.value)) {
      event.preventDefault();
      setStatus('error', 'Enter a valid email address.');
      emailInput.focus();
      return;
    }

    if (!hasRequestedChange()) {
      event.preventDefault();
      setStatus('error', 'Choose a delivery change, a topic reset, or both.');
      return;
    }

    pendingNonce = createNonce();
    nonceInput.value = pendingNonce;
    submissionPending = true;
    setSubmitting(true);
    setStatus('notice', 'Submitting…');

    if (responseTimer) window.clearTimeout(responseTimer);
    responseTimer = window.setTimeout(function () {
      finish('error', 'We could not verify that the request was received. Check your inbox before submitting again.');
    }, 20000);
  });

  // Loading the hidden iframe does not prove that Apps Script accepted the request.
  // Success requires a nonce-bound acknowledgement from the expected endpoint.
  // Cross-origin redirects, network errors and browser-blocked frames can all load.
  form.addEventListener('change', function () {
    if (statusBox.classList.contains('form-status-error')) setStatus('', '');
  });

  window.addEventListener('message', function (event) {
    if (!isAllowedResultOrigin(event.origin)) return;

    const data = event.data;
    if (!data || data.type !== expectedResultType) return;
    if (!pendingNonce || data.client_nonce !== pendingNonce) return;

    if (data.ok && data.status === 'accepted') {
      finish('success', successMessage());
      return;
    }

    if (data.status === 'validation_error') {
      const code = String(data.code || '');
      const message = code === 'invalid_email'
        ? 'Enter a valid email address.'
        : code === 'no_changes'
          ? 'Choose a delivery change, a topic reset, or both.'
          : 'Review the form and try again.';
      finish('error', message);
      return;
    }

    if (data.status === 'rate_limited') {
      finish('error', 'Please wait a little before trying again.');
      return;
    }

    finish('error', 'We could not process this request right now. Please try again later.');
  });
})();
