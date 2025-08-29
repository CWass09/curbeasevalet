
# CurbEase Bin Valet – Master Handoff

This bundle is the authoritative, deploy-ready website with all design choices and settings discussed.
- Law-enforcement owned, locally owned, background-checked staff highlighted
- Charity support (Wounded Warrior Project & Tunnel to Towers) surfaced
- Residential + Apartments/HOAs pills in hero
- Limited-time promo block
- Pricing cards: tinted and lift-on-hover
- American flag background
- Smooth scrolling
- Netlify config fixed (`netlify.toml` + `_redirects`)

## Deploy
1. Replace the GitHub repo contents with this bundle.
2. Netlify auto-deploys. Verify routes: /privacy, /terms, /b2b, /mission, /contact, /thank-you, /admin.

## Stripe
Buttons are already wired via Stripe Payment Links in JS if included in prior builds. If missing, paste links in `assets/js/site.js` (keys: basic, standard, premium).

## Future Tweaks
- Swap `/assets/img/hero.jpg` or `/assets/img/flag-texture.png` for a different hero.
- Update copy in `index.html` -> hero badges & promo block.
