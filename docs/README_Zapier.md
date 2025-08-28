# CurbEase — Referral & Promo Automation (Zapier)

Date: 2025-08-28

This README shows how to automate:
1) Capturing referral info before checkout (Netlify Forms)
2) Recording it in Google Sheets
3) Applying credits/discounts in Stripe when a referred customer pays their first invoice

---

## A. Prereqs

- Stripe Payment Links for **Basic / Standard / Premium** (already set)
- In each Payment Link, enable **Allow promotion codes**
- Create promo codes in Stripe:
  - `CURB2WEEKS` → Recommended: use a **14-day trial** on the price, or a first-month ~50% coupon
  - `CURB1WEEK` → For referred friends: **7-day trial** or equivalent coupon
- Netlify site deployed with this codebase (so the hidden Netlify form exists)
- A target Google Sheet (template provided in `templates/referrals_sheet.csv`)

**Sheet suggested columns:** Timestamp, Customer Email, Plan, Referrer Name, Referrer Email, Referral Code, Stripe Customer ID, Stripe Session ID, Credit Applied (Yes/No), Notes

---

## B. Zap 1 — Netlify Forms → Google Sheets

**Trigger:** Netlify → *New Form Submission*  
**Form name:** `referral-capture`

**Action:** Google Sheets → *Create Spreadsheet Row*  
- Map fields:
  - Timestamp → Use Zapier timestamp
  - Customer Email → `customer_email`
  - Plan → `plan_selected`
  - Referrer Name → `referrer_name`
  - Referrer Email → `referrer_email`
  - Referral Code → `referral_code`
  - Notes → "Captured pre-checkout"

This stores who referred whom, *before* checkout.

---

## C. Zap 2 — Stripe Checkout → Google Sheets (join)

**Trigger:** Stripe → *Checkout Session Completed* (or *Payment Succeeded*)

**Find/Create Row:** Google Sheets → *Lookup Spreadsheet Row*  
- Lookup column: **Customer Email**  
- Lookup value: Stripe `customer_details.email`

**Action:** Google Sheets → *Update Spreadsheet Row*  
- Set:
  - Stripe Session ID → `id`
  - Stripe Customer ID → `customer`
  - Notes → "Stripe checkout completed"

This joins Stripe data with the pre-checkout referral entry.

---

## D. Zap 3 — Apply Referrer Credit in Stripe

**Only continue if:** the joined row **has a Referrer Email or Name**.

**Find/Create Customer (referrer):** Stripe → *Find Customer*  
- Lookup by Referrer Email (preferred). If you only have a name, consider a manual step or maintain a customers sheet mapping.

**Apply credit for 1 free week:** Options (pick one)
1. **Coupon on Subscription (preferred)**  
   - Create a **coupon** in Stripe that approximates 1 week free (e.g., 25% off if you bill every 4 weeks) or a **fixed amount** equal to 1 week's value, set to **once**.  
   - Zapier Action: Stripe → *Update Subscription* with that coupon.
2. **Promotional Credit** (if available in your Stripe plan)  
   - Action: Stripe → *Create Customer Balance Transaction* (credit).  
   - This reduces the **next invoice** automatically.
3. **Invoice Item (negative)**  
   - Action: Stripe → *Create Invoice Item* with a **negative amount** for the customer’s next invoice.

**Update Sheet:** mark **Credit Applied = Yes** and note which method you used.

---

## E. (Optional) Zap 4 — Referred Customer First Week Free

If you prefer coupons over trials for the new customer:
- Trigger: Stripe → *Checkout Session Completed*
- Condition: Was a **promo code** used (e.g., `CURB1WEEK`)? If not, optionally **Update Subscription** to add a one-time **coupon** equal to ~1 week.

> Trials are cleaner: set your product price to include trial days (7 for `CURB1WEEK`, 14 for `CURB2WEEKS`).

---

## F. Notes & Tips

- **Unlimited referrals:** Your landing page text already states 1 week free **per referral** with **no limits**. Keep using Zap 3 each time a new referred friend completes first service.
- Use the **`referral_code`** field if you want to distribute unique codes (e.g., first.last@email), and match them in Zap 2.
- If a referred friend forgets to add the code, you can manually apply their free week by adding a trial or coupon to their subscription inside Stripe and updating the sheet.

---

## G. Safety Checklist

- Test each Zap with a real Stripe **test mode** checkout.  
- Confirm your Google Sheet updates link the correct customer email.  
- Ensure you always pick **the referrer’s customer** when applying the credit (not the new customer).

That’s it! Once configured, the freebies and credits flow automatically.
