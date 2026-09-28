(function () {
  'use strict';

  const config = window.ADB_NATIVE_CUSTOMIZE_CONFIG || {};
  const form = document.getElementById('native-customize-form');
  const submitButton = document.getElementById('customize-submit');
  const statusBox = document.getElementById('customize-status');
  const resultFrame = document.getElementById('native-customize-result');
  const nonceInput = document.getElementById('customize-client-nonce');

  if (!form || !submitButton || !statusBox || !resultFrame || !nonceInput) return;

  const endpoint = String(config.endpoint || '').trim();
  const endpointPattern = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
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
  let responseTimer = null;
  let pendingNonce = '';

  function setStatus(kind, message) {
    statusBox.className = 'form-status' + (kind ? ' form-status-' + kind : '');
    statusBox.textContent = message || '';
  }

  function setSubmitting(isSubmitting) {
    submitButton.disabled = !!isSubmitting;
    submitButton.textContent = isSubmitting ? 'Submitting…' : 'Submit changes';
  }

  function createNonce() {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (value) {
      return value.toString(16).padStart(2, '0');
    }).join('');
  }

  function hasRequestedChange() {
    const checked = form.querySelectorAll('input[type="radio"]:checked');
    return Array.prototype.some.call(checked, function (input) {
      return input.value !== 'keep_current';
    });
  }

  function localValidationMessage(code) {
    const messages = {
      invalid_email: 'Enter a valid email address.',
      no_changes: 'Choose at least one setting to change.',
      invalid_option: 'One or more selected options are invalid.',
      request_too_large: 'The request is too large.'
    };
    return messages[code] || 'Review the form and try again.';
  }

  if (!endpointPattern.test(endpoint)) {
    submitButton.disabled = true;
    setStatus('notice', 'DEV browser submission is not configured yet.');
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

    if (!hasRequestedChange()) {
      event.preventDefault();
      setStatus('error', 'Choose at least one setting to change.');
      return;
    }

    pendingNonce = createNonce();
    nonceInput.value = pendingNonce;
    setSubmitting(true);
    setStatus('notice', 'Submitting your request…');

    if (responseTimer) window.clearTimeout(responseTimer);
    responseTimer = window.setTimeout(function () {
      setSubmitting(false);
      pendingNonce = '';
      nonceInput.value = '';
      setStatus('error', 'We could not confirm that the request was received. Please try again.');
    }, 15000);
  });

  form.addEventListener('change', function () {
    if (statusBox.classList.contains('form-status-error')) {
      setStatus('', '');
    }
  });

  window.addEventListener('message', function (event) {
    if (!isAllowedResultOrigin(event.origin)) return;

    const data = event.data;
    if (!data || data.type !== 'adb-native-customize-dev') return;
    if (!pendingNonce || data.client_nonce !== pendingNonce) return;

    if (responseTimer) {
      window.clearTimeout(responseTimer);
      responseTimer = null;
    }
    setSubmitting(false);
    pendingNonce = '';
    nonceInput.value = '';

    if (data.ok && data.status === 'accepted') {
      setStatus(
        'success',
        'Check your inbox. If that address is connected to Austin Daily Briefing, we’ll send a confirmation link for the requested changes. Nothing changes until the request is confirmed.'
      );
      return;
    }

    if (data.status === 'validation_error') {
      setStatus('error', localValidationMessage(String(data.code || '')));
      return;
    }

    if (data.status === 'rate_limited') {
      setStatus('error', 'Please wait a little before trying again.');
      return;
    }

    setStatus('error', 'We could not process that request right now. Please try again later.');
  });
})();
