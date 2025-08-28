// /.netlify/functions/mark-credit
// Server-side proxy that marks a referral credit as applied.
// Auth: Netlify Identity JWT required with role "admin".
// Env required: GS_UPDATE_ENDPOINT, GS_SECRET (for the Google Apps Script web app).

export async function handler(event, context) {
  // Require POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // AuthZ: require logged-in Identity user with admin role
  const user = context.clientContext && context.clientContext.user;
  if (!user) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  const roles = (user.app_metadata && user.app_metadata.roles) || [];
  if (!roles.includes('admin')) return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden - admin role required' }) };

  const endpoint = process.env.GS_UPDATE_ENDPOINT;
  const secret = process.env.GS_SECRET;
  if (!endpoint || !secret) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing GS_UPDATE_ENDPOINT or GS_SECRET env vars' }) };
  }

  let payload = {};
  try { payload = JSON.parse(event.body || '{}'); } catch(e) {}

  // forward to Apps Script
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Secret': secret },
      body: JSON.stringify({
        referrer_email: payload.referrer_email || '',
        plan: payload.plan || '',
        credit_applied: !!payload.credit_applied
      })
    });
    const data = await res.json();
    if (!res.ok || !data || data.ok === false) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Upstream error', details: data }) };
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true, upstream: data }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
