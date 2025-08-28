// Create fixed-amount "one week free" coupons in Stripe
// Usage: STRIPE_API_KEY=sk_live_xxx node scripts/create_coupons.js
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

(async () => {
  try {
    const coupons = [
      { id: 'BASIC_WEEK', name: 'Basic — 1 Week Free', amount_off: 750, currency: 'usd', duration: 'once' },
      { id: 'STANDARD_WEEK', name: 'Standard — 1 Week Free', amount_off: 1125, currency: 'usd', duration: 'once' },
      { id: 'PREMIUM_WEEK', name: 'Premium — 1 Week Free', amount_off: 1500, currency: 'usd', duration: 'once' },
    ];
    for (const c of coupons) {
      const existing = await stripe.coupons.list({ limit: 100 });
      if (existing.data.find(x => x.id === c.id)) {
        console.log(`Coupon ${c.id} already exists — skipping`);
        continue;
      }
      const res = await stripe.coupons.create(c);
      console.log('Created:', res.id, res.name, res.amount_off);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();