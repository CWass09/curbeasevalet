# Stripe Coupons — One Week Free (Fixed Amount)

These commands create three **once** coupons to approximate **1 week free** for each plan:

- Basic ($30/mo) → **$7.50** off → `BASIC_WEEK`
- Standard ($45/mo) → **$11.25** off → `STANDARD_WEEK`
- Premium ($60/mo) → **$15.00** off → `PREMIUM_WEEK`

## Option A — Node.js (recommended)
```bash
# In your project root:
npm i stripe
export STRIPE_API_KEY=sk_test_xxx   # or sk_live_xxx
node scripts/create_coupons.js
```

## Option B — cURL
```bash
export STRIPE_API_KEY=sk_test_xxx

# Basic
curl https://api.stripe.com/v1/coupons   -u $STRIPE_API_KEY:   -d id=BASIC_WEEK   -d name="Basic — 1 Week Free"   -d amount_off=750   -d currency=usd   -d duration=once

# Standard
curl https://api.stripe.com/v1/coupons   -u $STRIPE_API_KEY:   -d id=STANDARD_WEEK   -d name="Standard — 1 Week Free"   -d amount_off=1125   -d currency=usd   -d duration=once

# Premium
curl https://api.stripe.com/v1/coupons   -u $STRIPE_API_KEY:   -d id=PREMIUM_WEEK   -d name="Premium — 1 Week Free"   -d amount_off=1500   -d currency=usd   -d duration=once
```
After creating, you can **Update Subscription** in Zapier using one of these coupons based on the plan.
