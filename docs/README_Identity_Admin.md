# Netlify Identity + Role-Gated Admin

Date: 2025-08-28

This guide locks **/admin** behind Netlify Identity and pulls referral data from the **Netlify Forms API** via a Netlify Function.

## Enable Identity
1. In Netlify Dashboard → your site → **Identity** → **Enable Identity**.
2. Under **Registration**, choose **Invite only** (recommended).
3. Invite your admin account email and assign role **admin**.

## Role-gated behavior
- The **/admin** page includes Netlify Identity widget and shows a login overlay until you sign in.
- Only users with the **admin** role can load data.

## Functions
- **`netlify/functions/list-referrals.js`** calls the Netlify API:
  - Env vars required:
    - `NETLIFY_ACCESS_TOKEN` (Personal Access Token with read access)
    - Optional: `REFERRAL_FORM_ID` (if omitted, function discovers form ID by name `referral-capture`)
- The function requires the Identity JWT in the `Authorization: Bearer ...` header and checks for the **admin** role.

## Deploying functions
No extra config needed — Netlify auto-detects `netlify/functions/*`.

## Optional: Role-based redirects
You can also add role conditions in `_redirects`, but client + function auth already protect the data:
```
# Example (optional; not strictly required)
/admin/*   /admin.html   200!   Role=admin
```
