(function () {
  'use strict';

  const config = window.ADB_NATIVE_CUSTOMIZE_CONFIG || {};
  const form = document.getElementById('native-customize-form');
  const submitButton = document.getElementById('customize-submit');
  const statusBox = document.getElementById('customize-status');
  const resultFrame = document.getElementById('native-customize-result');
  const nonceInput = document.getElementById('customize-client-nonce');
  const emailInput = document.getElementById('subscriber-email');

  if (!form || !submitButton || !statusBox || !resultFrame || !nonceInput || !emailInput) return;

  const endpoint = String(config.endpoint || '').trim();
  const environment = String(config.environment || 'development').trim().toLowerCase();
  const expectedResultType = environment === 'production'
    ? 'adb-native-customize-prod'
    : 'adb-native-customize-dev';
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
  let fallbackTimer = null;
  let pendingNonce = '';
  let submissionPending = false;

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

  function hasValidEmailShape(value) {
    const email = String(value || '').trim();
    if (!email || email.length > 254 || /\s/.test(email)) return false;
    const at = email.lastIndexOf('@');
    if (at <= 0 || at === email.length - 1) return false;
    const domain = email.slice(at + 1);
    const labels = domain.split('.');
    if (labels.length < 2) return false;
    return labels.every(function (label) {
      return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label);
    });
  }

  function finishSubmission(kind, message) {
    if (responseTimer) {
      window.clearTimeout(responseTimer);
      responseTimer = null;
    }
    if (fallbackTimer) {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
    submissionPending = false;
    setSubmitting(false);
    pendingNonce = '';
    nonceInput.value = '';
    setStatus(kind, message);
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

    if (!hasValidEmailShape(emailInput.value)) {
      event.preventDefault();
      setStatus('error', 'Enter a valid email address.');
      emailInput.focus();
      return;
    }

    if (!hasRequestedChange()) {
      event.preventDefault();
      setStatus('error', 'Choose at least one setting to change.');
      return;
    }

    pendingNonce = createNonce();
    nonceInput.value = pendingNonce;
    submissionPending = true;
    setSubmitting(true);
    setStatus('notice', 'Submitting your request…');

    if (responseTimer) window.clearTimeout(responseTimer);
    responseTimer = window.setTimeout(function () {
      finishSubmission('error', 'We could not complete the submission. Please try again.');
    }, 20000);
  });

  resultFrame.addEventListener('load', function () {
    if (!submissionPending) return;
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(function () {
      if (!submissionPending) return;
      finishSubmission(
        'success',
        'Request submitted. If that address is connected to Austin Daily Briefing and the request can be processed, we’ll send a confirmation link shortly. Nothing changes until you confirm.'
      );
    }, 500);
  });

  form.addEventListener('change', function () {
    if (statusBox.classList.contains('form-status-error')) {
      setStatus('', '');
    }
  });

  window.addEventListener('message', function (event) {
    if (!isAllowedResultOrigin(event.origin)) return;

    const data = event.data;
    if (!data || data.type !== expectedResultType) return;
    if (!pendingNonce || data.client_nonce !== pendingNonce) return;

    if (data.ok && data.status === 'accepted') {
      finishSubmission(
        'success',
        'Check your inbox. If that address is connected to Austin Daily Briefing, we’ll send a confirmation link for the requested changes. Nothing changes until the request is confirmed.'
      );
      return;
    }

    if (data.status === 'validation_error') {
      finishSubmission('error', localValidationMessage(String(data.code || '')));
      return;
    }

    if (data.status === 'rate_limited') {
      finishSubmission('error', 'Please wait a little before trying again.');
      return;
    }

    finishSubmission('error', 'We could not process that request right now. Please try again later.');
  });
})();
