# Netlify Functions — Admin API

Date: 2025-08-28

This site includes two serverless functions that require Netlify Identity with the **admin** role:

- `/.netlify/functions/list-referrals` — lists submissions for the Netlify form **referral-capture**.
  - Env: `NETLIFY_ACCESS_TOKEN` (Personal Access Token with read access)
  - Optional: `REFERRAL_FORM_ID` for direct lookup

- `/.netlify/functions/mark-credit` — marks a referral credit as applied by proxying to your Google Apps Script web app.
  - Env: `GS_UPDATE_ENDPOINT` — your deployed Apps Script URL (from `docs/sheets_update_endpoint.gs`)
  - Env: `GS_SECRET` — a shared secret; also set `const SECRET = '...'` inside the Apps Script

## Setup Steps

1. Netlify → **Site settings → Identity**: enable Identity, set registration to **Invite only**, invite your admin user, set role **admin**.
2. Netlify → **Site settings → Build & deploy → Environment**: add
   - `NETLIFY_ACCESS_TOKEN=...`
   - `GS_UPDATE_ENDPOINT=https://script.google.com/macros/s/DEPLOYMENT_ID/exec`
   - `GS_SECRET=YOUR_SHARED_SECRET`
3. Deploy site, then open **/admin**. Sign in and test:
   - Reload (fetches referrals via `list-referrals`)
   - Mark credit (calls `mark-credit` which updates your Google Sheet via Apps Script)

That's it. Your admin tools now live fully under your domain with a consistent auth model.
