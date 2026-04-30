/**
 * Decap CMS GitHub OAuth proxy — Cloudflare Worker
 *
 * Lives at: https://decap-oauth-hits.ryan-b50.workers.dev
 *
 * Why this exists:
 *   Decap CMS runs in the user's browser at /admin. To save edits to the
 *   GitHub repo, it needs a GitHub access token. Acquiring that token
 *   requires a server-side OAuth handshake (because the client_secret must
 *   never live in the browser). This Worker is that server.
 *
 * Flow:
 *   1. User clicks "Login with GitHub" at /admin on the live site.
 *   2. Decap pops open a window pointing at this Worker's /auth path.
 *   3. /auth redirects to github.com/login/oauth/authorize.
 *   4. User clicks "Authorize" on GitHub.
 *   5. GitHub redirects back to this Worker's /callback path with a code.
 *   6. /callback exchanges the code (plus our secret) for an access token.
 *   7. We render an HTML page that postMessages the token to the opener
 *      window (Decap CMS), then closes itself.
 *   8. Decap stores the token in localStorage and is now logged in.
 *
 * Worker secrets (set in Cloudflare dashboard → Settings → Variables and Secrets):
 *   - GITHUB_CLIENT_ID
 *   - GITHUB_CLIENT_SECRET
 *
 * Updating the worker:
 *   - Edit this file → paste into the Cloudflare dashboard Worker editor → Deploy.
 *   - (If we ever wire up `wrangler` CLI, deploy with `npx wrangler deploy`.)
 */

const SCOPES = 'repo,user';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ----- /auth — start the OAuth flow -----
    if (url.pathname === '/auth' || url.pathname === '/auth/') {
      const state = crypto.randomUUID();
      const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
      githubAuthUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      githubAuthUrl.searchParams.set('redirect_uri', `${url.origin}/callback`);
      githubAuthUrl.searchParams.set('scope', SCOPES);
      githubAuthUrl.searchParams.set('state', state);
      return Response.redirect(githubAuthUrl.toString(), 302);
    }

    // ----- /callback — handle GitHub redirect -----
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) {
        return new Response('Missing OAuth code from GitHub', { status: 400 });
      }

      try {
        const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': 'Decap-OAuth-Proxy/1.0',
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
          }),
        });

        if (!tokenResp.ok) {
          return renderResult(
            'error',
            `GitHub token exchange returned HTTP ${tokenResp.status}`,
          );
        }

        const data = await tokenResp.json();

        if (data.error || !data.access_token) {
          return renderResult(
            'error',
            data.error_description || data.error || 'No access token received from GitHub',
          );
        }

        return renderResult('success', { token: data.access_token, provider: 'github' });
      } catch (err) {
        return renderResult('error', `Worker exception: ${err.message}`);
      }
    }

    // ----- Default — friendly hello when someone hits the bare URL -----
    return new Response(
      'Decap CMS OAuth proxy for Health in the Spirit. Hit /auth to start a login flow.',
      { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  },
};

/**
 * Render the HTML page that postMessages the auth result back to Decap CMS.
 * Decap expects exactly this string format:
 *   'authorization:github:success:<JSON of {token, provider}>'
 *   'authorization:github:error:<JSON of {message}>'
 */
function renderResult(status, payload) {
  const message =
    status === 'success'
      ? `authorization:github:success:${JSON.stringify(payload)}`
      : `authorization:github:error:${JSON.stringify({ message: String(payload) })}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Authorizing /admin — Health in the Spirit</title>
</head>
<body style="font-family: -apple-system, system-ui, sans-serif; padding: 2rem; color: #3D3228; background: #F5F0E8;">
  <p>Finishing GitHub authorization — this window should close automatically.</p>
  <p style="font-size: 0.85rem; color: #6B5D50; margin-top: 1rem;">If it does not close, you can close this tab manually and return to /admin.</p>
  <script>
    (function () {
      function receiveMessage(e) {
        // Decap sent 'authorizing:github' — reply with the result.
        if (window.opener) {
          window.opener.postMessage(${JSON.stringify(message)}, e.origin);
        }
        window.removeEventListener('message', receiveMessage);
      }
      window.addEventListener('message', receiveMessage, false);
      // Kick things off — tell the opener we're ready.
      if (window.opener) {
        window.opener.postMessage('authorizing:github', '*');
      }
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
