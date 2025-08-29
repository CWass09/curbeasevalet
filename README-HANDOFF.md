
# CurbEase Bin Valet — Production Hand‑off

**Goal:** polished, fast, trustworthy, “WordPress‑style” site with flag background, charity logos, colorful pricing, smooth scroll, and law‑enforcement‑owned trust messaging.

## What’s inside
- `index.html` — homepage (hero, badges, charity logos, pricing)
- `b2b.html` — Apartments/HOAs
- `mission.html` — mission + standards
- `contact.html`, `privacy.html`, `terms.html`, `thank-you.html`, `admin.html`
- `assets/css/app.v5.css` — modern design
- `assets/js/site.v2.js` — light animation + smooth reveal
- `assets/img/` — **placeholders** for:
  - `flag-texture.png` — subtle flag background
  - `charity-wwp.png`, `charity-t2t.png` — logos
  - `hero.jpg` — hero image
- `_redirects` — SPA‑style routing (fixes 404 on refresh)
- `_headers`, `netlify.toml` — security/hosting

## Where to drop your real files
Replace the placeholder images with production assets using the exact same filenames:
```
assets/img/flag-texture.png
assets/img/charity-wwp.png
assets/img/charity-t2t.png
assets/img/hero.jpg
```
(Overwrite the files in GitHub; Netlify will redeploy.)

## Stripe links
Update the three subscribe buttons in `index.html`:
- Basic: search for `buy.stripe.com/test_basic`
- Standard: `test_standard`
- Premium: `test_premium`

## Header links
Header mirrors pages that navigate away: Home, Services (#services), Pricing (#pricing), Mission, Contact.

## Animations & UX
- Pricing cards and service cards lift on hover.
- IntersectionObserver fades cards up as they enter the viewport.
- CSS `scroll-behavior: smooth` handles smooth internal scroll.

## Why the previous layout “broke”
Older deploys missed `_redirects` and referenced CSS/JS that weren’t uploaded after cache flush. This package fixes that by bundling everything local to `/assets/` and shipping a root `_redirects`.
