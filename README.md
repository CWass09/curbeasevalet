# CurbEase Valet — GitHub-Ready Build

**Everything discussed is included.** Deploy this repo to Netlify (or any static host).

## Features
- Embedded local images (hero & charity badges)
- Pricing + live Stripe links (Basic $30 / Standard $45 w/ 1 clean / Premium $60 w/ 2 cleans)
- Unlimited referrals (friend gets 1 week free) + hidden Netlify form capture
- Promo banner (“2 weeks free” copy is easy to edit)
- Service area & route windows
- Why Premium, How it Works, Testimonials
- Contact (Netlify form), B2B, Privacy, Terms, Thank-You (reads ?plan=...)
- Admin shell + Netlify Functions placeholders
- SEO: LocalBusiness + FAQ schema, sitemap, robots, manifest
- Clean routes via _redirects + netlify.toml

## Stripe
- Links wired in `assets/js/stripe-links.js`:
  - Basic: https://buy.stripe.com/3cIdR328c0KXbAobWJ9oc02
  - Standard: https://buy.stripe.com/14AdR3dQU51dfQEbWJ9oc03
  - Premium: https://buy.stripe.com/eVqfZbbIM79l6g4d0N9oc04
- Set success URLs in Stripe to: `/thank-you.html?plan=PLAN&session_id={CHECKOUT_SESSION_ID}`

## Netlify
- Enable Forms to collect leads/referrals.
- (Optional) Identity for `/admin` with role `admin`.
- Functions are placeholders; swap with your real integrations when ready.

— Built on 2025-08-29
