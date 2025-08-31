# CurbEase Deployment Notes (Redirects & Cleanup)

## Files to delete from GitHub repo
- `index(1).html`
- `fixes(1).css`

These were duplicates; the active files are `index.html` and `fixes.css`.

## Netlify `_redirects`
```
/admin      /admin.html      200
/mission    /mission.html    200
/thank-you  /thank-you.html  200
/*          /index.html      200
```
The `/thank-you` pretty URL resolves to `thank-you.html` (status 200), so you can point Stripe success URLs at `/thank-you`.

## Stripe Checkout URL templates
Use these in each Checkout Link (or in code) for **Success URL** / **Cancel URL**:

- **Success URL** (include session ID and plan):
```
https://curbeasevalet.com/thank-you?session_id={CHECKOUT_SESSION_ID}&plan=basic
https://curbeasevalet.com/thank-you?session_id={CHECKOUT_SESSION_ID}&plan=standard
https://curbeasevalet.com/thank-you?session_id={CHECKOUT_SESSION_ID}&plan=premium
```

- **Cancel URL** (send back to pricing section):
```
https://curbeasevalet.com/#pricing
```

> The `thank-you.html` page will read `session_id` (or `sessionId`) and optionally `plan`, then populate the receipt panel and fire GA4 `signup_complete` with the plan name.

## Post‑deploy checks
1. Open `https://curbeasevalet.com/mission` and ensure it renders `mission.html` directly.
2. Open `https://curbeasevalet.com/thank-you` (without params). Page should load with placeholders and no errors.
3. Click each **Subscribe** button from the live site and complete a $0 test if possible, or simulate by pasting a real `session_id` into the URL you get back from Stripe (e.g. `?session_id=cs_test_...&plan=standard`). Verify the thank-you page shows:
   - Name & Email
   - **Plan** (matches query or returns from function)
   - Address and Bin location (from Sheets / function when available)
4. Confirm the mobile menu shows **Mission** once, right after **Subscribe**, and that the **Manage subscription** pill is gone in both desktop and mobile headers.
5. Check the **Premium** card has the black **NEW** badge.

If anything fails, re‑upload this bundle and confirm `_redirects` is present at the project root.
