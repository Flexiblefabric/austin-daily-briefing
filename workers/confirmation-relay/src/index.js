const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer'
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS
  });
}

function hex(buffer) {
  return Array.from(new Uint8Array(buffer), function (byte) {
    return byte.toString(16).padStart(2, '0');
  }).join('');
}

async function sign(secret, value) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return hex(signature);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== '/api/dev/customize/confirm') {
      return json({ok:false,status:'not_found'}, 404);
    }

    if (request.method !== 'POST') {
      return json({ok:false,status:'method_not_allowed'}, 405);
    }

    const origin = request.headers.get('Origin');
    if (origin && origin !== 'https://austindailybriefing.com') {
      return json({ok:false,status:'forbidden'}, 403);
    }

    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.toLowerCase().startsWith('application/json')) {
      return json({ok:false,status:'invalid_request'}, 400);
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return json({ok:false,status:'invalid_request'}, 400);
    }

    const token = String(body && body.token || '').trim();
    if (!/^[A-Za-z0-9_-]{32,256}$/.test(token)) {
      return json({ok:false,status:'invalid_or_expired'}, 400);
    }

    const upstreamUrl = String(env.ADB_APPS_SCRIPT_CONFIRM_URL || '').trim();
    const relaySecret = String(env.ADB_CONFIRM_RELAY_SECRET || '');

    if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(upstreamUrl) ||
        relaySecret.length < 32) {
      return json({ok:false,status:'temporary_error'}, 503);
    }

    const timestamp = String(Date.now());
    const signature = await sign(relaySecret, timestamp + ':' + token);
    const payload = new URLSearchParams({
      action: 'relay_confirm',
      token: token,
      relay_ts: timestamp,
      relay_sig: signature
    });

    let upstream;
    try {
      upstream = await fetch(upstreamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Accept': 'application/json'
        },
        body: payload.toString(),
        redirect: 'follow'
      });
    } catch (error) {
      return json({ok:false,status:'temporary_error'}, 502);
    }

    if (!upstream.ok) {
      return json({ok:false,status:'temporary_error'}, 502);
    }

    let result;
    try {
      result = await upstream.json();
    } catch (error) {
      return json({ok:false,status:'temporary_error'}, 502);
    }

    if (result && result.ok === true && result.status === 'confirmed') {
      return json({ok:true,status:'confirmed'});
    }

    if (result && result.status === 'invalid_or_expired') {
      return json({ok:false,status:'invalid_or_expired'}, 400);
    }

    if (result && result.status === 'forbidden') {
      return json({ok:false,status:'temporary_error'}, 502);
    }

    return json({ok:false,status:'temporary_error'}, 502);
  }
};
