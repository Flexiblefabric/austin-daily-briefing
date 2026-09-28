(function () {
  'use strict';

  const config = window.ADB_CONFIRM_CONFIG || {};
  const button = document.getElementById('confirm-button');
  const title = document.getElementById('confirm-title');
  const copy = document.getElementById('confirm-copy');
  const status = document.getElementById('confirm-status');
  const help = document.getElementById('confirm-help');
  const actions = document.getElementById('confirm-actions');

  if (!button || !title || !copy || !status || !help || !actions) return;

  const endpoint = String(config.endpoint || '').trim();
  let token = '';

  function setStatus(kind, message) {
    status.className = 'confirm-status' + (kind ? ' confirm-status-' + kind : '');
    status.textContent = message || '';
  }

  function showUnavailable(message) {
    token = '';
    actions.hidden = true;
    title.textContent = 'This confirmation link is unavailable.';
    copy.textContent = message || 'The link may be invalid, expired, or already used.';
    help.textContent = 'Return to the customization page if you need to submit a new request.';
    setStatus('error', '');
  }

  function showConfirmed() {
    token = '';
    actions.hidden = true;
    title.textContent = 'Request confirmed.';
    copy.textContent = 'Your request is confirmed. The customization processor can now apply it exactly once.';
    help.textContent = 'You can close this page.';
    setStatus('success', 'Confirmation accepted.');
  }

  function extractToken() {
    const rawHash = window.location.hash ? window.location.hash.slice(1) : '';
    const params = new URLSearchParams(rawHash);
    const candidate = String(params.get('token') || '').trim();

    // Remove the bearer token from the visible address bar immediately.
    window.history.replaceState(null, document.title, window.location.pathname + window.location.search);

    if (!/^[A-Za-z0-9_-]{32,256}$/.test(candidate)) {
      return '';
    }
    return candidate;
  }

  token = extractToken();

  if (!token) {
    showUnavailable('The confirmation token is missing or malformed.');
    return;
  }

  const allowedEndpoints = new Set([
    'https://confirm-api.austindailybriefing.com/api/dev/customize/confirm',
    '/api/dev/customize/confirm',
    '/api/customize/confirm'
  ]);
  if (!allowedEndpoints.has(endpoint)) {
    showUnavailable('Confirmation is not configured right now.');
    return;
  }

  button.addEventListener('click', async function () {
    if (!token) return;

    button.disabled = true;
    button.textContent = 'Confirming…';
    setStatus('notice', 'Confirming your request…');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({token: token}),
        credentials: 'omit',
        cache: 'no-store',
        referrerPolicy: 'no-referrer'
      });

      let result = {};
      try {
        result = await response.json();
      } catch (ignored) {}

      if (response.ok && result.ok && result.status === 'confirmed') {
        showConfirmed();
        return;
      }

      if (result.status === 'invalid_or_expired' || result.status === 'already_used') {
        showUnavailable('The link may be invalid, expired, or already used.');
        return;
      }

      button.disabled = false;
      button.textContent = 'Confirm changes';
      setStatus('error', 'We could not confirm this request right now. Reopen the link from your email and try again.');
    } catch (error) {
      button.disabled = false;
      button.textContent = 'Confirm changes';
      setStatus('error', 'We could not reach the confirmation service. Reopen the link from your email and try again.');
    }
  });
})();
