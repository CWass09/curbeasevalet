// Netlify Function: get-checkout-session (SECRET KEY version)
// Reads STRIPE_SECRET_KEY from environment. Use sk_live_... for live sessions and sk_test_... for test sessions.
const Stripe = require('stripe');

exports.handler = async (event) => {
  try {
    const sessionId = event.queryStringParameters && event.queryStringParameters.session_id;
    if (!sessionId) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Missing session_id' }) };
    }
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Server misconfigured: STRIPE_SECRET_KEY not set' }) };
    }
    const stripe = new Stripe(secret, { apiVersion: '2023-10-16' });
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['customer_details','line_items'] });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(session) };
  } catch (err) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: err.message }) };
  }
};