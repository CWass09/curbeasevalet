# Google Apps Script for Referral Credits

Date: 2025-08-28

This Apps Script helps automatically calculate the **one-week value** of each plan inside Google Sheets.

---

## Script Provided
File: `scripts/OneWeekValue.gs`

Functions:
- `=ONEWEEKVALUE("basic")` → returns 7.50
- `=ONEWEEKVALUE("standard")` → returns 11.25
- `=ONEWEEKVALUE("premium")` → returns 15.00

---

## How to Use
1. In your referral tracking Google Sheet, go to **Extensions → Apps Script**.
2. Paste the contents of `OneWeekValue.gs` into the editor, save, and deploy.
3. Back in the sheet, you can use formulas such as:
   - `=ONEWEEKVALUE(C2)` where C2 contains "basic", "standard", or "premium".
   - Or create a new column **One Week Value** with formula: `=ARRAYFORMULA(ONEWEEKVALUE(C2:C))`

---

## Purpose
When applying credits in Stripe, you can see the weekly equivalent dollar value per plan quickly, ensuring you credit the correct amount for **1 free week**.

---
