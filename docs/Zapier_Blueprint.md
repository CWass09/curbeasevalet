# Zapier Blueprint — CurbEase Referrals & Promos
**Date:** 2025-08-28

Zapier doesn't support importing full multi-app Zaps via CLI for general users, but this blueprint gives you **exact step configs** you can mirror in Zapier in minutes.

---

## Zap 1 — Netlify Form → Google Sheets
**Trigger:** Netlify · New Form Submission  
- Site: your Netlify site
- Form name: `referral-capture`

**Action:** Google Sheets · Create Spreadsheet Row  
- Spreadsheet: your Referrals sheet (use `templates/referrals_sheet.xlsx`)  
- Worksheet: Referrals  
- Field mapping:
  - Timestamp → (Zap Meta) Current time
  - Customer Email → `customer_email`
  - Plan → `plan_selected`
  - Referrer Name → `referrer_name`
  - Referrer Email → `referrer_email`
  - Referral Code → `referral_code`
  - Notes → "Captured pre-checkout"

---

## Zap 2 — Stripe Checkout Completed → Join Row
**Trigger:** Stripe · Checkout Session Completed  
- Mode: Live or Test (start with Test)
- Event: `checkout.session.completed`

**Find Row:** Google Sheets · Lookup Spreadsheet Row  
- Lookup column: Customer Email  
- Lookup value: **Data** → `Customer Details Email`

**Update Row:** Google Sheets · Update Spreadsheet Row  
- Stripe Session ID → **Data** → `ID`
- Stripe Customer ID → **Data** → `Customer`
- Notes → "Stripe checkout completed"

---

## Zap 3 — Apply Referrer Credit (1 Week Free)
**Trigger:** Google Sheets · New or Updated Spreadsheet Row  
- Trigger column: Stripe Customer ID (only continue if set)

**Filter:** Only continue if  
- (Referrer Email **exists**) OR (Referrer Name **exists**)

**Path A — Coupon (once):** Stripe · Update Subscription  
- Subscription: Find by Customer (Stripe → Find Subscription)  
- Coupon: one-time coupon equal to **One Week Value** (Column E).  
  - If your coupon needs a fixed amount, create three coupons (Basic/Standard/Premium) and use a conditional step based on **Plan**.

**Path B — Customer Balance Credit:** Stripe · Create Customer Balance Transaction  
- Customer: Find by Referrer Email (Stripe · Find Customer)  
- Amount: **negative** of One Week Value (in cents)  
- Currency: `usd`  
- Description: "Referral credit — 1 free week"

**Then:** Google Sheets · Update Spreadsheet Row  
- Credit Applied → Yes  
- Notes → "Credit applied via [Coupon|Customer Balance]"

---

## Zap 4 — Ensure Referred Friend Gets First Week
**Trigger:** Stripe · Checkout Session Completed

**Filter:** Only continue if  
- Promotion Code **not** equal to `CURB1WEEK` AND no trial on Subscription

**Action:** Stripe · Update Subscription  
- Add one-time coupon equal to approx **1 week** of their plan.

> Recommended alternative: set **trial days** (7 for `CURB1WEEK`, 14 for `CURB2WEEKS`) on your Stripe Price so this Zap isn't needed.

---

### Notes
- Use the **UTM campaign** we append for promo tracking as needed in your analytics.  
- If you want unique **referral codes per customer**, generate them in the Sheet and match on Zap 2.  
- For complex logic (multiple coupons, plan upgrades), add a **Code by Zapier** step to calculate amounts on the fly.


---

### Coupon IDs (Fixed Amount — 1 Week Free)
Create these in Stripe (see `docs/README_Stripe_Coupons.md`):
- **BASIC_WEEK** ($7.50 once)
- **STANDARD_WEEK** ($11.25 once)
- **PREMIUM_WEEK** ($15.00 once)

**Zap 3 Path A (Coupon):** Choose coupon based on **Plan**:
- Plan = `basic` → `BASIC_WEEK`
- Plan = `standard` → `STANDARD_WEEK`
- Plan = `premium` → `PREMIUM_WEEK`
