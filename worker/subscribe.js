/**
 * Newsletter signup endpoint — Cloudflare Worker
 *
 * Route: https://healthinthespirit.com/api/subscribe
 *
 * Why this exists:
 *   The site is a static build. A form cannot call Brevo directly without
 *   shipping the API key to every visitor's browser, so this Worker sits in
 *   between: the browser posts here, and this posts to Brevo server-side.
 *
 *   It also means the site is not welded to Brevo. If we ever move providers,
 *   this one file changes and no page on the site is touched.
 *
 * Order of operations matters:
 *   1. Write the address to D1 FIRST. Once that row exists the signup is ours
 *      permanently, whatever happens next.
 *   2. Then try Brevo. If Brevo is down (their own status page reports ~97%
 *      uptime over 90 days) the row is simply left unsynced and can be
 *      replayed later. Nothing is lost.
 *
 * Bindings (set in the Cloudflare dashboard, never in this repo):
 *   BREVO_API_KEY   secret    REST API key, starts with `xkeysib-`
 *   BREVO_LIST_ID   variable  numeric id of the Brevo list
 *   TURNSTILE_SECRET secret   optional; bot protection, enforced only if set
 *   DB              D1 binding to the `subscribers` database
 *
 * The endpoint answers two ways on purpose:
 *   - fetch() with Accept: application/json  -> JSON, for the enhanced form
 *   - a plain browser form POST              -> 303 redirect back to the page
 *   so the form still works with JavaScript turned off.
 */

const ALLOWED_ORIGINS = [
  'https://healthinthespirit.com',
  'https://www.healthinthespirit.com',
];

/** Deliberately permissive. Real validation is the confirmation email, not a regex. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
});

const json = (body, status, origin) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });

/** Send a no-JS submitter back where they came from with a status in the query. */
const redirectBack = (referer, status, detail) => {
  let url;
  try {
    url = new URL(referer);
  } catch {
    url = new URL('https://healthinthespirit.com/listen/');
  }
  url.searchParams.set('subscribed', status);
  if (detail) url.searchParams.set('reason', detail);
  url.hash = 'signup';
  return Response.redirect(url.toString(), 303);
};

async function verifyTurnstile(token, secret, ip) {
  if (!secret) return true; // Not configured yet; do not block signups.
  if (!token) return false;
  try {
    const body = new FormData();
    body.append('secret', secret);
    body.append('response', token);
    if (ip) body.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const out = await res.json();
    return out.success === true;
  } catch {
    // If the check itself errors, do not punish a real person for it.
    return true;
  }
}

async function storeLocally(env, record) {
  if (!env.DB) return { stored: false, reason: 'no-d1-binding' };
  try {
    await env.DB.prepare(
      `INSERT INTO subscribers (email, source, page, ip_country, created_at, synced)
       VALUES (?, ?, ?, ?, ?, 0)
       ON CONFLICT(email) DO UPDATE SET
         source = COALESCE(excluded.source, subscribers.source),
         page   = COALESCE(excluded.page,   subscribers.page)`,
    )
      .bind(record.email, record.source, record.page, record.country, record.createdAt)
      .run();
    return { stored: true };
  } catch (err) {
    return { stored: false, reason: String(err) };
  }
}

async function markSynced(env, email) {
  if (!env.DB) return;
  try {
    await env.DB.prepare('UPDATE subscribers SET synced = 1, synced_at = ? WHERE email = ?')
      .bind(new Date().toISOString(), email)
      .run();
  } catch {
    // Non-fatal: the contact is in Brevo, the flag just lags.
  }
}

async function pushToBrevo(env, record) {
  if (!env.BREVO_API_KEY) return { ok: false, status: 0, reason: 'no-api-key' };

  const listId = Number(env.BREVO_LIST_ID);
  const payload = {
    email: record.email,
    // Existing contacts are updated rather than erroring, which makes a repeat
    // signup harmless instead of a 400.
    updateEnabled: true,
    attributes: {
      SIGNUP_SOURCE: record.source || 'site',
      SIGNUP_PAGE: record.page || '',
    },
  };
  if (Number.isFinite(listId) && listId > 0) payload.listIds = [listId];

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // 201 created, 204 updated. A duplicate with updateEnabled still succeeds.
    if (res.ok) return { ok: true, status: res.status };

    const text = await res.text();
    return { ok: false, status: res.status, reason: text.slice(0, 300) };
  } catch (err) {
    return { ok: false, status: 0, reason: String(err) };
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, origin);
    }

    // Distinguish a scripted submit from a plain browser form navigation.
    const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
    const referer = request.headers.get('Referer') || 'https://healthinthespirit.com/listen/';

    let form;
    try {
      const ct = request.headers.get('Content-Type') || '';
      if (ct.includes('application/json')) {
        const body = await request.json();
        form = new Map(Object.entries(body));
      } else {
        form = await request.formData();
      }
    } catch {
      return wantsJson
        ? json({ error: 'Could not read that submission.' }, 400, origin)
        : redirectBack(referer, 'error', 'malformed');
    }

    const get = (k) => {
      const v = form.get ? form.get(k) : undefined;
      return typeof v === 'string' ? v.trim() : '';
    };

    // Honeypot. Real people never see this field, bots fill it in. Answer 200
    // so the bot believes it succeeded and does not retry.
    if (get('website')) {
      return wantsJson ? json({ ok: true }, 200, origin) : redirectBack(referer, 'ok');
    }

    const email = get('email').toLowerCase();
    if (!email || !EMAIL_RE.test(email) || email.length > 254) {
      return wantsJson
        ? json({ error: 'That email address does not look right.' }, 422, origin)
        : redirectBack(referer, 'error', 'invalid-email');
    }

    const passed = await verifyTurnstile(
      get('cf-turnstile-response'),
      env.TURNSTILE_SECRET,
      request.headers.get('CF-Connecting-IP'),
    );
    if (!passed) {
      return wantsJson
        ? json({ error: 'Could not verify that submission. Please try again.' }, 403, origin)
        : redirectBack(referer, 'error', 'verification');
    }

    const record = {
      email,
      source: get('source') || 'site',
      page: get('page') || referer,
      country: request.cf?.country || '',
      createdAt: new Date().toISOString(),
    };

    // 1. Ours first.
    const local = await storeLocally(env, record);

    // 2. Then the provider.
    const brevo = await pushToBrevo(env, record);
    if (brevo.ok) await markSynced(env, email);

    // Captured locally is good enough to tell the person yes. A failed Brevo
    // call is our problem to replay, not theirs to retry.
    if (local.stored || brevo.ok) {
      return wantsJson ? json({ ok: true }, 200, origin) : redirectBack(referer, 'ok');
    }

    // Both failed. Say so honestly rather than pretending.
    console.error('subscribe: both sinks failed', { local, brevo: brevo.reason });
    return wantsJson
      ? json({ error: 'That did not go through. Please try again in a moment.' }, 502, origin)
      : redirectBack(referer, 'error', 'upstream');
  },
};
