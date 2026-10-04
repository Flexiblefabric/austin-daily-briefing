(function () {
  'use strict';

  const config = window.ADB_NATIVE_SIGNUP_CONFIG || {};
  const form = document.getElementById('native-signup-form');
  const submitButton = document.getElementById('signup-submit');
  const statusBox = document.getElementById('signup-status');
  const resultFrame = document.getElementById('adb-native-signup-result');
  const nonceInput = document.getElementById('signup-client-nonce');
  const emailInput = document.getElementById('signup-email');
  const consentInput = document.getElementById('signup-consent');

  if (!form || !submitButton || !statusBox || !resultFrame || !nonceInput || !emailInput || !consentInput) return;

  const endpoint = String(config.endpoint || '').trim();
  const environment = String(config.environment || 'development').trim().toLowerCase();
  const expectedResultType = environment === 'production'
    ? 'adb-native-signup-prod'
    : 'adb-native-signup-dev';
  const endpointPattern = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;

  let responseTimer = null;
  let fallbackTimer = null;
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
    submitButton.textContent = isSubmitting ? 'Joining…' : 'Get the briefing';
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

  function finish(kind, message) {
    if (responseTimer) window.clearTimeout(responseTimer);
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    responseTimer = null;
    fallbackTimer = null;
    submissionPending = false;
    setSubmitting(false);
    pendingNonce = '';
    nonceInput.value = '';
    setStatus(kind, message);
  }

  function successMessage() {
    return 'Thanks for joining us. If this address can receive Austin Daily Briefing, we’ll take it from here. You do not need to submit again.';
  }

  if (!endpointPattern.test(endpoint)) {
    submitButton.disabled = true;
    setStatus('notice', 'This signup preview is not connected yet. Use the current signup form for now.');
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

    if (!consentInput.checked) {
      event.preventDefault();
      setStatus('error', 'Confirm that you want to receive Austin Daily Briefing.');
      consentInput.focus();
      return;
    }

    pendingNonce = createNonce();
    nonceInput.value = pendingNonce;
    submissionPending = true;
    setSubmitting(true);
    setStatus('notice', 'Submitting…');

    if (responseTimer) window.clearTimeout(responseTimer);
    responseTimer = window.setTimeout(function () {
      finish('error', 'We could not complete the signup. Please try again.');
    }, 20000);
  });

  resultFrame.addEventListener('load', function () {
    if (!submissionPending) return;
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(function () {
      if (!submissionPending) return;
      finish('success', successMessage());
    }, 500);
  });

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
        : code === 'consent_required'
          ? 'Confirm that you want to receive Austin Daily Briefing.'
          : 'Review the form and try again.';
      finish('error', message);
      return;
    }

    if (data.status === 'rate_limited') {
      finish('error', 'Please wait a little before trying again.');
      return;
    }

    finish('error', 'We could not process the signup right now. Please try again later.');
  });
})();
