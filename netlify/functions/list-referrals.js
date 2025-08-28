// /.netlify/functions/list-referrals
// Lists Netlify Forms submissions for the "referral-capture" form.
// Requires: NETLIFY_ACCESS_TOKEN (env), optionally REFERRAL_FORM_ID (env).
// Auth: Netlify Identity JWT required with role "admin".

export async function handler(event, context) {
  // AuthZ: require logged-in Identity user with admin role
  const user = context.clientContext && context.clientContext.user;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  const roles = (user.app_metadata && user.app_metadata.roles) || [];
  if (!roles.includes('admin')) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden - admin role required' }) };
  }

  const token = process.env.NETLIFY_ACCESS_TOKEN;
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing NETLIFY_ACCESS_TOKEN' }) };
  }

  const base = 'https://api.netlify.com/api/v1';
  let formId = process.env.REFERRAL_FORM_ID;

  try {
    // Find form ID if not provided
    if (!formId) {
      const formsRes = await fetch(`${base}/forms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!formsRes.ok) throw new Error('Failed to list forms');
      const forms = await formsRes.json();
      const target = forms.find(f => (f.name || '').toLowerCase() === 'referral-capture');
      if (!target) throw new Error('Form "referral-capture" not found');
      formId = target.id;
    }

    // List submissions
    const subsRes = await fetch(`${base}/forms/${formId}/submissions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!subsRes.ok) throw new Error('Failed to list submissions');
    const subs = await subsRes.json();

    // Shape rows
    const rows = subs.map(s => ({
      timestamp: s.created_at,
      customer_email: s.data && s.data.customer_email || '',
      plan: s.data && s.data.plan_selected || '',
      referrer_name: s.data && s.data.referrer_name || '',
      referrer_email: s.data && s.data.referrer_email || '',
      referral_code: s.data && s.data.referral_code || '',
      id: s.id
    }));

    return { statusCode: 200, body: JSON.stringify({ ok: true, rows }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
